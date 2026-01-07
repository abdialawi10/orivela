import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { initializeDefaultPlans } from '@/lib/subscription'

export async function GET() {
  try {
    // Ensure plans are initialized
    await initializeDefaultPlans()

    let plans = await prisma.plan.findMany({
      where: { isActive: true },
      orderBy: { price: 'asc' },
    })

    // If no plans found, try initializing again
    if (plans.length === 0) {
      console.log('No plans found, initializing...')
      await initializeDefaultPlans()
      plans = await prisma.plan.findMany({
        where: { isActive: true },
        orderBy: { price: 'asc' },
      })
    }

    const formattedPlans = plans.map((plan) => ({
      id: plan.id,
      name: plan.name,
      displayName: plan.displayName,
      description: plan.description || '',
      price: plan.price,
      annualPrice: plan.annualPrice,
      features: typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features,
      limits: plan.limits ? (typeof plan.limits === 'string' ? JSON.parse(plan.limits) : plan.limits) : { maxUsers: null },
    }))

    return NextResponse.json({ plans: formattedPlans })
  } catch (error: any) {
    console.error('Plans fetch error:', error)
    // Return default plans as fallback
    const defaultPlans = [
      {
        id: '1',
        name: 'STARTER',
        displayName: 'Starter Plan',
        description: 'Perfect for small businesses getting started',
        price: 79,
        annualPrice: 759,
        features: [
          'SMS & Email AI conversations',
          'Basic knowledge base integration',
          '2 users included',
          'Multi-turn AI dialogue & context retention',
          'Email draft generation & reply automation',
          'Basic reporting & conversation history',
          'Automatic language detection & translation',
        ],
        limits: { maxUsers: 2 },
      },
      {
        id: '2',
        name: 'PROFESSIONAL',
        displayName: 'Professional Plan',
        description: 'Most popular for growing businesses',
        price: 199,
        annualPrice: 1910,
        features: [
          'Everything in Starter',
          'Voice call AI agent',
          'Calendly integration & appointment scheduling',
          'AI Copilot with real-time suggestions & post-call summaries',
          'Unlimited SMS & Email users up to 5',
          'Multi-channel conversation history',
          'Enhanced analytics dashboard',
          'Smart escalation & contextual knowledge base',
        ],
        limits: { maxUsers: 5 },
      },
      {
        id: '3',
        name: 'BUSINESS',
        displayName: 'Business Plan',
        description: 'Advanced features for scaling teams',
        price: 399,
        annualPrice: 3830,
        features: [
          'Everything in Professional',
          'Multi-channel automation (SMS, Email, Voice)',
          'CRM integrations (HubSpot, Salesforce, Pipedrive)',
          'Auto-meeting notes & task conversion to Notion/Asana/Trello',
          'AI conversation summarization across all channels',
          'Personalized AI persona & tone customization',
          'Trend analysis & sentiment detection',
          'Unlimited users',
        ],
        limits: { maxUsers: null },
      },
      {
        id: '4',
        name: 'ENTERPRISE',
        displayName: 'Enterprise Plan',
        description: 'Custom solutions for large organizations',
        price: 0,
        annualPrice: 0,
        features: [
          'Everything in Business',
          'Advanced AI intelligence & predictive suggestions',
          'Real-time web access for AI responses',
          'Multi-language voice replies in live calls',
          'Dedicated support & onboarding',
          'API access & custom integrations',
          'Full analytics & revenue tracking',
          'Custom AI personas & branding',
        ],
        limits: { maxUsers: null },
      },
    ]
    return NextResponse.json({ plans: defaultPlans })
  }
}

