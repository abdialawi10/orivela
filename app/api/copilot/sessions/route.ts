import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'
import { CopilotMode } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { mode, title, screenContext } = await req.json()

    const copilotSession = await prisma.copilotSession.create({
      data: {
        userId: session.user.id,
        mode: (mode || 'AUTO') as CopilotMode,
        title: title || null,
        screenContext: screenContext ? JSON.stringify(screenContext) : null,
        status: 'ACTIVE',
      },
    })

    return NextResponse.json({
      sessionId: copilotSession.id,
      status: copilotSession.status,
    })
  } catch (error) {
    console.error('Create copilot session error:', error)
    return NextResponse.json(
      { error: 'Failed to create session' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const status = searchParams.get('status')

    const where: any = { userId: session.user.id }
    if (status) {
      where.status = status
    }

    const sessions = await prisma.copilotSession.findMany({
      where,
      orderBy: { startedAt: 'desc' },
      take: 50,
      include: {
        _count: {
          select: {
            transcripts: true,
            suggestions: true,
          },
        },
      },
    })

    return NextResponse.json(sessions)
  } catch (error) {
    console.error('Get copilot sessions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sessions' },
      { status: 500 }
    )
  }
}





