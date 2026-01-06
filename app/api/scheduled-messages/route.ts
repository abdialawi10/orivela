import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { scheduleMessage, getScheduledMessages } from '@/lib/scheduled-messages'
import { ConversationChannel } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { contactId, channel, content, scheduledFor } = await req.json()

    if (!contactId || !channel || !content || !scheduledFor) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const messageId = await scheduleMessage(
      contactId,
      channel as ConversationChannel,
      content,
      new Date(scheduledFor)
    )

    return NextResponse.json({ messageId })
  } catch (error: any) {
    console.error('Scheduled message error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to schedule message' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const contactId = searchParams.get('contactId')

    if (!contactId) {
      return NextResponse.json({ error: 'contactId required' }, { status: 400 })
    }

    const messages = await getScheduledMessages(contactId)

    return NextResponse.json(messages)
  } catch (error: any) {
    console.error('Scheduled messages fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch scheduled messages' },
      { status: 500 }
    )
  }
}

