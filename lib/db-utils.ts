import { prisma } from './prisma'
import { ConversationChannel, ConversationStatus } from '@prisma/client'

export async function findOrCreateContact(phone?: string, email?: string, name?: string) {
  if (!phone && !email) {
    throw new Error('Either phone or email must be provided')
  }

  let contact = null

  if (phone) {
    contact = await prisma.contact.findFirst({
      where: { phone },
    })
  }

  if (!contact && email) {
    contact = await prisma.contact.findFirst({
      where: { email },
    })
  }

  if (contact) {
    // Update name if provided
    if (name && !contact.name) {
      contact = await prisma.contact.update({
        where: { id: contact.id },
        data: { name },
      })
    }
    return contact
  }

  return await prisma.contact.create({
    data: {
      phone: phone || null,
      email: email || null,
      name: name || null,
    },
  })
}

export async function getDefaultBusinessId(): Promise<string> {
  const business = await prisma.business.findFirst({
    orderBy: { createdAt: 'asc' },
  })
  if (!business) {
    throw new Error('No business configured')
  }
  return business.id
}

export async function getOrCreateConversation(
  contactId: string,
  channel: ConversationChannel,
  businessId?: string
) {
  const bid = businessId || await getDefaultBusinessId()
  
  // Find open conversation for this contact and channel
  let conversation = await prisma.conversation.findFirst({
    where: {
      contactId,
      channel,
      status: 'OPEN',
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  if (conversation) {
    return conversation
  }

  // Create new conversation
  return await prisma.conversation.create({
    data: {
      contactId,
      channel,
      businessId: bid,
      status: 'OPEN',
    },
  })
}

export async function appendMessage(
  conversationId: string,
  role: 'USER' | 'ASSISTANT' | 'SYSTEM',
  content: string,
  metadata?: any
) {
  return await prisma.message.create({
    data: {
      conversationId,
      role,
      content,
      metadata: metadata ? JSON.stringify(metadata) : null,
    },
  })
}

export async function getConversationMessages(conversationId: string, limit: number = 20) {
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: limit,
  })

  return messages.map((msg) => ({
    ...msg,
    metadata: msg.metadata ? JSON.parse(msg.metadata) : null,
  }))
}

export async function updateConversationStatus(
  conversationId: string,
  status: ConversationStatus,
  summary?: string
) {
  return await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      status,
      summary,
      updatedAt: new Date(),
    },
  })
}

