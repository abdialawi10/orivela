import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    const viewed = searchParams.get('viewed')

    if (!sessionId) {
      return NextResponse.json(
        { error: 'sessionId is required' },
        { status: 400 }
      )
    }

    // Verify session belongs to user
    const copilotSession = await prisma.copilotSession.findUnique({
      where: { id: sessionId },
    })

    if (!copilotSession || copilotSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    const where: any = { sessionId }
    if (viewed !== null) {
      where.viewed = viewed === 'true'
    }

    const suggestions = await prisma.copilotSuggestion.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: 20,
    })

    return NextResponse.json(suggestions)
  } catch (error) {
    console.error('Get suggestions error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch suggestions' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { suggestionId, viewed } = await req.json()

    if (!suggestionId) {
      return NextResponse.json(
        { error: 'suggestionId is required' },
        { status: 400 }
      )
    }

    // Verify suggestion belongs to user's session
    const suggestion = await prisma.copilotSuggestion.findUnique({
      where: { id: suggestionId },
      include: {
        session: true,
      },
    })

    if (!suggestion || suggestion.session.userId !== session.user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    const updated = await prisma.copilotSuggestion.update({
      where: { id: suggestionId },
      data: { viewed: viewed !== undefined ? viewed : true },
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update suggestion error:', error)
    return NextResponse.json(
      { error: 'Failed to update suggestion' },
      { status: 500 }
    )
  }
}


