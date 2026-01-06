import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { calculateRevenueImpact } from '@/lib/analytics'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { period, startDate, endDate } = await req.json()

    if (!period || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const impact = await calculateRevenueImpact(
      period,
      new Date(startDate),
      new Date(endDate)
    )

    return NextResponse.json(impact)
  } catch (error: any) {
    console.error('Revenue impact error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate revenue impact' },
      { status: 500 }
    )
  }
}

