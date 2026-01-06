import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const items = await prisma.knowledgeBaseItem.findMany({
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(items)
  } catch (error) {
    console.error('Knowledge base GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const item = await prisma.knowledgeBaseItem.create({
      data: {
        type: body.type,
        title: body.title,
        question: body.type === 'FAQ' ? body.question : null,
        answer: body.type === 'FAQ' ? body.answer : null,
        content: body.type === 'DOC' ? body.content : null,
      },
    })

    return NextResponse.json(item)
  } catch (error) {
    console.error('Knowledge base POST error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

