import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const { conversationId, messageId, rating, comment, helpful } = await req.json()

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    const feedback = await prisma.feedback.create({
      data: {
        conversationId,
        messageId,
        rating,
        comment,
        helpful,
      },
    })

    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error('Feedback error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to submit feedback' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const conversationId = searchParams.get('conversationId')

    const feedback = await prisma.feedback.findMany({
      where: conversationId ? { conversationId } : undefined,
      orderBy: { createdAt: 'desc' },
      take: 100,
    })

    return NextResponse.json(feedback)
  } catch (error: any) {
    console.error('Feedback fetch error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch feedback' },
      { status: 500 }
    )
  }
}




