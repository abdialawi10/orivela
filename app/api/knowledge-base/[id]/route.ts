import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'

export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    const item = await prisma.knowledgeBaseItem.update({
      where: { id: params.id },
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
    console.error('Knowledge base PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await prisma.knowledgeBaseItem.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Knowledge base DELETE error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

