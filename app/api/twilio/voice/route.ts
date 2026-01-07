import { NextRequest, NextResponse } from 'next/server'
import { Twilio } from 'twilio'
import twilio from 'twilio'

const VoiceResponse = twilio.twiml.VoiceResponse

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const from = formData.get('From') as string
    const callSid = formData.get('CallSid') as string

    const response = new VoiceResponse()

    // Initial greeting
    response.say(
      {
        voice: 'alice',
        language: 'en-US',
      },
      'Hello! Thank you for calling. I am an AI assistant. How can I help you today?'
    )

    // Gather speech input
    const gather = response.gather({
      input: ['speech'],
      action: '/api/twilio/voice/gather',
      method: 'POST',
      speechTimeout: 'auto',
      language: 'en-US',
    })

    gather.say('Please tell me what you need.')

    // If no input, say goodbye
    response.say('I did not receive any input. Goodbye!')
    response.hangup()

    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('Twilio voice error:', error)
    const response = new VoiceResponse()
    response.say('Sorry, I encountered an error. Please try again later.')
    response.hangup()
    return new NextResponse(response.toString(), {
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}








