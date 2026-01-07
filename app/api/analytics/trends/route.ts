import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { generateTrendAnalysis } from '@/lib/analytics'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, period, startDate, endDate } = await req.json()

    if (!type || !period || !startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const result = await generateTrendAnalysis(
      type,
      period,
      new Date(startDate),
      new Date(endDate)
    )

    return NextResponse.json(result)
  } catch (error: any) {
    console.error('Trend analysis error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate trend analysis' },
      { status: 500 }
    )
  }
}



