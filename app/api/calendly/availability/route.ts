import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'
import { getCalendlyAvailability, formatTimeSlots } from '@/lib/calendly'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(req.url)
    const daysAhead = parseInt(searchParams.get('daysAhead') || '14')
    const timezone = searchParams.get('timezone') || undefined

    const business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    if (!business.calendlyApiKey) {
      return NextResponse.json(
        { error: 'Calendly not configured' },
        { status: 400 }
      )
    }

    const slots = await getCalendlyAvailability(business, daysAhead)
    const formattedTimes = formatTimeSlots(
      slots,
      timezone || business.timezone || 'America/New_York',
      10
    )

    return NextResponse.json({
      slots: formattedTimes,
      rawSlots: slots,
      calendlyLink: business.calendlyLink,
    })
  } catch (error) {
    console.error('Calendly availability error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}


