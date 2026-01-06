import OpenAI from 'openai'
import { prisma } from './prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface MeetingNote {
  title: string
  content: string
  actionItems: string[]
  attendees: string[]
  duration?: number
}

/**
 * Generate structured meeting notes from conversation
 */
export async function generateMeetingNotes(
  conversationId: string
): Promise<MeetingNote> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        contact: true,
      },
    })

    if (!conversation) {
      throw new Error('Conversation not found')
    }

    const messages = conversation.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')

    // Calculate duration
    const firstMessage = conversation.messages[0]
    const lastMessage = conversation.messages[conversation.messages.length - 1]
    const duration = firstMessage && lastMessage
      ? Math.round((lastMessage.createdAt.getTime() - firstMessage.createdAt.getTime()) / 60000)
      : undefined

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a meeting notes expert. Generate structured meeting notes from the conversation.
          
          Extract:
          1. Title: Brief meeting title
          2. Content: Structured notes with sections (agenda, discussion, decisions)
          3. Action Items: List of tasks with owners if mentioned
          4. Attendees: List of participants mentioned
          
          Return as JSON with: title, content, actionItems (array), attendees (array)`,
        },
        {
          role: 'user',
          content: `Generate meeting notes from:\n\n${messages}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(response)

    const meetingNote: MeetingNote = {
      title: parsed.title || `Meeting - ${conversation.contact.name || 'Unknown'}`,
      content: parsed.content || '',
      actionItems: parsed.actionItems || [],
      attendees: parsed.attendees || [conversation.contact.name || 'Unknown'],
      duration,
    }

    // Save to database
    await prisma.meetingNote.create({
      data: {
        conversationId,
        title: meetingNote.title,
        content: meetingNote.content,
        actionItems: JSON.stringify(meetingNote.actionItems),
        attendees: JSON.stringify(meetingNote.attendees),
        duration: meetingNote.duration,
      },
    })

    return meetingNote
  } catch (error) {
    console.error('Meeting notes generation error:', error)
    throw error
  }
}

