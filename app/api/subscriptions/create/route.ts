import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { planName, billingCycle } = await req.json()

    if (!planName) {
      return NextResponse.json({ error: 'Plan name required' }, { status: 400 })
    }

    // Get plan
    const plan = await prisma.plan.findUnique({
      where: { name: planName },
    })

    if (!plan) {
      return NextResponse.json({ error: 'Plan not found' }, { status: 404 })
    }

    // Get or create business
    const business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    // Check if subscription exists
    const existingSubscription = await prisma.subscription.findUnique({
      where: { businessId: business.id },
    })

    const now = new Date()
    const trialEndsAt = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000) // 14 days
    const periodEnd = billingCycle === 'ANNUAL'
      ? new Date(now.getTime() + 365 * 24 * 60 * 60 * 1000)
      : new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    if (existingSubscription) {
      // Update existing subscription
      const subscription = await prisma.subscription.update({
        where: { id: existingSubscription.id },
        data: {
          planId: plan.id,
          status: 'TRIAL',
          billingCycle: billingCycle || 'MONTHLY',
          trialEndsAt,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
          canceledAt: null,
        },
        include: {
          plan: true,
        },
      })

      return NextResponse.json({
        subscription,
        message: 'Trial started successfully',
      })
    } else {
      // Create new subscription
      const subscription = await prisma.subscription.create({
        data: {
          businessId: business.id,
          planId: plan.id,
          status: 'TRIAL',
          billingCycle: billingCycle || 'MONTHLY',
          trialEndsAt,
          currentPeriodStart: now,
          currentPeriodEnd: periodEnd,
        },
        include: {
          plan: true,
        },
      })

      return NextResponse.json({
        subscription,
        message: 'Trial started successfully',
      })
    }
  } catch (error: any) {
    console.error('Subscription creation error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription' },
      { status: 500 }
    )
  }
}



