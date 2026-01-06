import { prisma } from './prisma'
import { ConversationChannel } from '@prisma/client'
import { sendEmail } from './email' // Assuming email utility exists
import twilio from 'twilio'

const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
)

/**
 * Schedule a message to be sent later
 */
export async function scheduleMessage(
  contactId: string,
  channel: ConversationChannel,
  content: string,
  scheduledFor: Date
): Promise<string> {
  const scheduled = await prisma.scheduledMessage.create({
    data: {
      contactId,
      channel,
      content,
      scheduledFor,
    },
  })

  return scheduled.id
}

/**
 * Send scheduled messages that are due
 */
export async function sendScheduledMessages(): Promise<number> {
  const now = new Date()
  const dueMessages = await prisma.scheduledMessage.findMany({
    where: {
      sent: false,
      scheduledFor: {
        lte: now,
      },
    },
    include: {
      contact: true,
    },
    take: 100, // Process in batches
  })

  let sentCount = 0

  for (const message of dueMessages) {
    try {
      switch (message.channel) {
        case 'SMS':
          if (message.contact.phone) {
            await twilioClient.messages.create({
              body: message.content,
              from: process.env.TWILIO_PHONE_NUMBER,
              to: message.contact.phone,
            })
          }
          break

        case 'EMAIL':
          if (message.contact.email) {
            // Use your email sending utility
            await sendEmail({
              to: message.contact.email,
              subject: 'Follow-up',
              text: message.content,
            })
          }
          break

        case 'VOICE':
          // For voice, we'd need to initiate a call
          // This is more complex and might require Twilio call initiation
          console.log('Voice scheduled messages not yet implemented')
          break
      }

      // Mark as sent
      await prisma.scheduledMessage.update({
        where: { id: message.id },
        data: {
          sent: true,
          sentAt: new Date(),
        },
      })

      sentCount++
    } catch (error) {
      console.error(`Failed to send scheduled message ${message.id}:`, error)
      // Optionally mark as failed or retry
    }
  }

  return sentCount
}

/**
 * Cancel a scheduled message
 */
export async function cancelScheduledMessage(messageId: string): Promise<boolean> {
  try {
    await prisma.scheduledMessage.delete({
      where: { id: messageId },
    })
    return true
  } catch (error) {
    console.error('Failed to cancel scheduled message:', error)
    return false
  }
}

/**
 * Get scheduled messages for a contact
 */
export async function getScheduledMessages(contactId: string) {
  return await prisma.scheduledMessage.findMany({
    where: { contactId },
    orderBy: { scheduledFor: 'asc' },
  })
}

