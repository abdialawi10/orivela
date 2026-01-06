import { NextRequest, NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { findOrCreateContact, getOrCreateConversation, appendMessage } from '@/lib/db-utils'
import { ConversationChannel } from '@prisma/client'

if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not set')
}

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { to, subject, body, replyToConversationId } = await req.json()

    if (!to || !subject || !body) {
      return NextResponse.json(
        { error: 'to, subject, and body are required' },
        { status: 400 }
      )
    }

    // Send email via SendGrid
    const msg = {
      to,
      from: process.env.SENDGRID_FROM_EMAIL!,
      subject,
      text: body,
      html: body.replace(/\n/g, '<br>'),
    }

    await sgMail.send(msg)

    // Store in conversation if replyToConversationId provided
    if (replyToConversationId) {
      const conversation = await getOrCreateConversation(
        (await findOrCreateContact(undefined, to)).id,
        'EMAIL'
      )

      await appendMessage(conversation.id, 'ASSISTANT', body, {
        subject,
        to,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('SendGrid error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to send email' },
      { status: 500 }
    )
  }
}

