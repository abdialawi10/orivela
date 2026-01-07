import { NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { getSubscriptionStatus } from '@/lib/subscription'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const status = await getSubscriptionStatus(business.id)

    return NextResponse.json(status)
  } catch (error: any) {
    console.error('Subscription status error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch subscription status' },
      { status: 500 }
    )
  }
}




