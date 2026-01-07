import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { generateMeetingNotes } from '@/lib/meeting-notes'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const notes = await generateMeetingNotes(params.id)

    return NextResponse.json(notes)
  } catch (error: any) {
    console.error('Meeting notes error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate meeting notes' },
      { status: 500 }
    )
  }
}



