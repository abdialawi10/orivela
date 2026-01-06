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
    const channel = searchParams.get('channel')

    const where: any = {}
    if (channel && channel !== 'ALL') {
      where.channel = channel
    }

    const conversations = await prisma.conversation.findMany({
      where,
      include: {
        contact: true,
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(conversations)
  } catch (error) {
    console.error('Conversations GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

