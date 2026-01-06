import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateContact, getOrCreateConversation, appendMessage, updateConversationStatus } from '@/lib/db-utils'
import { generateAIResponse } from '@/lib/ai'
import { detectLanguage } from '@/lib/translation'
import { ConversationChannel } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { channel, conversationId, userText, phone, email, name } = await req.json()

    if (!userText) {
      return NextResponse.json({ error: 'userText is required' }, { status: 400 })
    }

    // Find or create contact
    const contact = await findOrCreateContact(phone, email, name)

    // Get or create conversation
    const conversation = await getOrCreateConversation(
      contact.id,
      channel as ConversationChannel
    )

    // Detect language
    const detectedLanguage = await detectLanguage(userText)

    // Append user message
    await appendMessage(conversation.id, 'USER', userText)

    // Generate AI response
    const { response, shouldEscalate, language, schedulingInfo } = await generateAIResponse(userText, conversation.id, undefined, detectedLanguage)

    // Append assistant message
    await appendMessage(conversation.id, 'ASSISTANT', response)

    // Handle escalation
    if (shouldEscalate) {
      await updateConversationStatus(conversation.id, 'ESCALATED')
      
      await prisma.escalation.create({
        data: {
          conversationId: conversation.id,
          reason: 'User requested escalation or triggered escalation keywords',
        },
      })

      // Notify admin (in production, send email here)
      const business = await prisma.business.findFirst({
        orderBy: { createdAt: 'asc' },
      })

      // TODO: Send email notification to business?.escalationEmail
    }

    return NextResponse.json({
      response,
      conversationId: conversation.id,
      shouldEscalate,
      language: language || detectedLanguage,
      schedulingInfo: schedulingInfo || undefined,
    })
  } catch (error) {
    console.error('AI respond error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

