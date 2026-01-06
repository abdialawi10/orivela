import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { findOrCreateContact, getOrCreateConversation, appendMessage, updateConversationStatus } from '@/lib/db-utils'
import { generateAIResponse } from '@/lib/ai'
import { detectLanguage } from '@/lib/translation'
import { ConversationChannel } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const MessagingResponse = twilio.twiml.MessagingResponse

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const body = formData.get('Body') as string
    const from = formData.get('From') as string

    if (!body || !from) {
      return new NextResponse('Missing required fields', { status: 400 })
    }

    // Extract phone number (remove + prefix if present)
    const phone = from.replace('+', '')

    // Find or create contact
    const contact = await findOrCreateContact(phone, undefined, undefined)

    // Get or create conversation (SMS keeps context per phone number)
    const conversation = await getOrCreateConversation(
      contact.id,
      'SMS'
    )

    // Detect language
    const detectedLanguage = await detectLanguage(body)

    // Append user message
    await appendMessage(conversation.id, 'USER', body, { from })

    // Generate AI response
    const { response, shouldEscalate, schedulingInfo } = await generateAIResponse(body, conversation.id, undefined, detectedLanguage)

    // Append assistant message
    let assistantMessage = response
    
    // Add Calendly link if scheduling is requested
    if (schedulingInfo?.calendlyLink) {
      assistantMessage += `\n\nBook your appointment here: ${schedulingInfo.calendlyLink}`
    }
    
    await appendMessage(conversation.id, 'ASSISTANT', assistantMessage, {
      schedulingInfo: schedulingInfo || null,
    })

    const twiml = new MessagingResponse()

    // Handle escalation
    if (shouldEscalate) {
      await updateConversationStatus(conversation.id, 'ESCALATED')
      
      await prisma.escalation.create({
        data: {
          conversationId: conversation.id,
          reason: 'User requested escalation or triggered escalation keywords',
        },
      })

      twiml.message(
        'I understand you would like to speak with a human representative. Our team has been notified and will contact you shortly. Thank you!'
      )

      return new NextResponse(twiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Send AI response
    twiml.message(response)

    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Twilio SMS error:', error)
    const twiml = new MessagingResponse()
    twiml.message('Sorry, I encountered an error. Please try again later.')
    return new NextResponse(twiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}

