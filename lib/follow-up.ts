import OpenAI from 'openai'
import { prisma } from './prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

/**
 * Generate follow-up reminder message for scheduled appointments
 */
export async function generateFollowUpReminder(
  conversationId: string,
  appointmentDate?: Date
): Promise<string> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      contact: true,
      messages: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      },
    },
  })

  if (!conversation) {
    return 'Thank you for scheduling with us!'
  }

  const business = await prisma.business.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  const businessName = business?.name || 'us'
  const tone = business?.tone || 'friendly, professional'

  const dateText = appointmentDate
    ? appointmentDate.toLocaleString('en-US', {
        weekday: 'long',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
      })
    : 'your scheduled time'

  const prompt = `Generate a friendly reminder message for a scheduled appointment.

Business: ${businessName}
Appointment Date: ${dateText}
Tone: ${tone}

Create a brief, friendly reminder message that:
- Confirms the appointment
- Includes the date/time
- Offers rescheduling if needed
- Is ${tone}

Keep it under 100 words.`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant generating reminder messages.',
        },
        { role: 'user', content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    })

    return completion.choices[0]?.message?.content || 'Thank you for scheduling with us!'
  } catch (error) {
    console.error('Follow-up generation error:', error)
    return `Hi! This is a reminder about your appointment with ${businessName} on ${dateText}. If you need to reschedule, please let us know!`
  }
}

/**
 * Generate rescheduling message
 */
export async function generateReschedulingMessage(
  conversationId: string
): Promise<string> {
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: {
      contact: true,
    },
  })

  if (!conversation) {
    return 'I can help you reschedule. When would work better for you?'
  }

  const business = await prisma.business.findFirst({
    orderBy: { createdAt: 'asc' },
  })

  const businessName = business?.name || 'us'
  const calendlyLink = business?.calendlyLink

  let message = `No problem at all! I'd be happy to help you reschedule your appointment with ${businessName}.`

  if (calendlyLink) {
    message += ` You can pick a new time here: ${calendlyLink}`
  } else {
    message += ' When would work better for you?'
  }

  return message
}





