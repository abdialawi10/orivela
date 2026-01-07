import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { calculatePerformanceBenchmark } from '@/lib/analytics'

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

    const benchmark = await calculatePerformanceBenchmark(
      period,
      new Date(startDate),
      new Date(endDate)
    )

    return NextResponse.json(benchmark)
  } catch (error: any) {
    console.error('Performance benchmark error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to calculate performance benchmark' },
      { status: 500 }
    )
  }
}




