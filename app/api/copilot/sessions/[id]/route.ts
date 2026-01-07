import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'
import { generatePostCallSummary } from '@/lib/copilot'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const copilotSession = await prisma.copilotSession.findUnique({
      where: { id: params.id },
      include: {
        transcripts: {
          orderBy: { timestamp: 'asc' },
        },
        suggestions: {
          orderBy: { timestamp: 'desc' },
          take: 20,
        },
      },
    })

    if (!copilotSession || copilotSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    return NextResponse.json(copilotSession)
  } catch (error) {
    console.error('Get copilot session error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch session' },
      { status: 500 }
    )
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { status, screenContext } = body

    const updateData: any = {}
    if (status) updateData.status = status
    if (screenContext) updateData.screenContext = JSON.stringify(screenContext)
    if (status === 'ENDED') updateData.endedAt = new Date()

    const sessionData = await prisma.copilotSession.findUnique({
      where: { id: params.id },
      include: {
        transcripts: {
          orderBy: { timestamp: 'asc' },
        },
      },
    })

    if (!sessionData || sessionData.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Generate summary if ending session
    if (status === 'ENDED' && sessionData.transcripts.length > 0) {
      const summary = await generatePostCallSummary(
        sessionData.transcripts.map((t) => ({
          text: t.text,
          speaker: t.speaker as 'user' | 'other' | undefined,
          timestamp: t.timestamp,
        })),
        sessionData.mode
      )

      updateData.summary = summary.summary
      updateData.actionItems = JSON.stringify(summary.actionItems)
      updateData.followUpEmail = summary.followUpEmail || null
    }

    const updated = await prisma.copilotSession.update({
      where: { id: params.id },
      data: updateData,
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update copilot session error:', error)
    return NextResponse.json(
      { error: 'Failed to update session' },
      { status: 500 }
    )
  }
}





