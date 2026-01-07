import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { findOrCreateContact, getOrCreateConversation, appendMessage, updateConversationStatus } from '@/lib/db-utils'
import { generateAIResponse } from '@/lib/ai'
import { detectLanguage, LanguageCode } from '@/lib/translation'
import { getTwiMLSayWithLanguage } from '@/lib/text-to-speech'
import { ConversationChannel } from '@prisma/client'
import { prisma } from '@/lib/prisma'

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const speechResult = formData.get('SpeechResult') as string
    const from = formData.get('From') as string
    const callSid = formData.get('CallSid') as string

    if (!speechResult) {
      const response = new VoiceResponse()
      response.say('I did not hear anything. Please try again.')
      const gather = response.gather({
        input: ['speech'],
        action: '/api/twilio/voice/gather',
        method: 'POST',
        speechTimeout: 'auto',
      })
      gather.say('What can I help you with?')
      response.say('Goodbye!')
      response.hangup()
      return new NextResponse(response.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Extract phone number (remove + prefix if present)
    const phone = from.replace('+', '')

    // Find or create contact
    const contact = await findOrCreateContact(phone, undefined, undefined)

    // Get or create conversation
    const conversation = await getOrCreateConversation(
      contact.id,
      'VOICE'
    )

    // Detect language
    const detectedLanguage = await detectLanguage(speechResult)

    // Append user message
    await appendMessage(conversation.id, 'USER', speechResult, { callSid, from })

    // Generate AI response
    const { response, shouldEscalate, schedulingInfo, language } = await generateAIResponse(speechResult, conversation.id, undefined, detectedLanguage)
    
    const responseLanguage = (language || detectedLanguage || 'en') as LanguageCode

    // Append assistant message
    await appendMessage(conversation.id, 'ASSISTANT', response, {
      schedulingInfo: schedulingInfo || null,
    })

    const responseTwiml = new VoiceResponse()

    // Handle scheduling
    if (schedulingInfo?.calendlyLink) {
      // Use language-specific TTS
      const sayResponse = getTwiMLSayWithLanguage(response, responseLanguage)
      responseTwiml.say({ voice: 'alice' }, response)
      
      const followUpMessage = responseLanguage !== 'en' 
        ? 'I will send you a link to book your appointment via text message. Please check your phone for the scheduling link.'
        : await import('@/lib/translation').then(m => m.translateText('I will send you a link to book your appointment via text message. Please check your phone for the scheduling link.', responseLanguage))
      
      responseTwiml.say({ voice: 'alice' }, followUpMessage)
      
      // Send SMS with Calendly link
      // Note: In production, use Twilio to send SMS here
      // For now, the link is mentioned in the voice response
      
      responseTwiml.say('Is there anything else I can help you with?')
      responseTwiml.hangup()
      
      return new NextResponse(responseTwiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Handle escalation
    if (shouldEscalate) {
      await updateConversationStatus(conversation.id, 'ESCALATED')
      
      await prisma.escalation.create({
        data: {
          conversationId: conversation.id,
          reason: 'User requested escalation or triggered escalation keywords',
        },
      })

      responseTwiml.say(
        'I understand you would like to speak with a human representative. Let me transfer you. Please hold.'
      )
      // TODO: Add actual transfer logic here
      responseTwiml.say('Our team has been notified and will contact you shortly. Thank you for calling.')
      responseTwiml.hangup()
      
      return new NextResponse(responseTwiml.toString(), {
        headers: { 'Content-Type': 'text/xml' },
      })
    }

    // Say the AI response with language support
    // Twilio will use the language attribute for proper pronunciation
    // Map language codes to Twilio-supported formats
    const twilioLanguage = responseLanguage === 'en' ? 'en-US' : (responseLanguage as any)
    responseTwiml.say({ voice: 'alice', language: twilioLanguage }, response)

    // Continue conversation with another gather
    const gather = responseTwiml.gather({
      input: ['speech'],
      action: '/api/twilio/voice/gather',
      method: 'POST',
      speechTimeout: 'auto',
    })

    gather.say('Is there anything else I can help you with?')

    // If no more input, end call
    responseTwiml.say('Thank you for calling. Have a great day!')
    responseTwiml.hangup()

    return new NextResponse(responseTwiml.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Twilio voice gather error:', error)
    const response = new VoiceResponse()
    response.say('Sorry, I encountered an error. Please try again later.')
    response.hangup()
    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}

