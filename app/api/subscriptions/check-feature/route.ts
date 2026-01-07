import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { hasFeatureAccess } from '@/lib/subscription'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { feature } = await req.json()

    if (!feature) {
      return NextResponse.json({ error: 'Feature name required' }, { status: 400 })
    }

    const business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const hasAccess = await hasFeatureAccess(business.id, feature as any)

    return NextResponse.json({ hasAccess, feature })
  } catch (error: any) {
    console.error('Feature check error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to check feature access' },
      { status: 500 }
    )
  }
}



