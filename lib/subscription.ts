import { prisma } from './prisma'

export type PlanName = 'STARTER' | 'PROFESSIONAL' | 'BUSINESS' | 'ENTERPRISE'

export interface PlanFeatures {
  smsEmail: boolean
  voice: boolean
  knowledgeBase: boolean
  calendly: boolean
  copilot: boolean
  crmIntegration: boolean
  taskManagement: boolean
  meetingNotes: boolean
  summarization: boolean
  personaCustomization: boolean
  trendAnalysis: boolean
  sentimentDetection: boolean
  webSearch: boolean
  predictiveSuggestions: boolean
  multiLanguageVoice: boolean
  apiAccess: boolean
  maxUsers: number | null // null = unlimited
  maxConversations?: number | null
}

/**
 * Get plan features based on plan name
 */
export function getPlanFeatures(planName: PlanName): PlanFeatures {
  const features: Record<PlanName, PlanFeatures> = {
    STARTER: {
      smsEmail: true,
      voice: false,
      knowledgeBase: true,
      calendly: false,
      copilot: false,
      crmIntegration: false,
      taskManagement: false,
      meetingNotes: false,
      summarization: false,
      personaCustomization: false,
      trendAnalysis: false,
      sentimentDetection: false,
      webSearch: false,
      predictiveSuggestions: false,
      multiLanguageVoice: false,
      apiAccess: false,
      maxUsers: 2,
    },
    PROFESSIONAL: {
      smsEmail: true,
      voice: true,
      knowledgeBase: true,
      calendly: true,
      copilot: true,
      crmIntegration: false,
      taskManagement: false,
      meetingNotes: false,
      summarization: false,
      personaCustomization: false,
      trendAnalysis: false,
      sentimentDetection: false,
      webSearch: false,
      predictiveSuggestions: false,
      multiLanguageVoice: false,
      apiAccess: false,
      maxUsers: 5,
    },
    BUSINESS: {
      smsEmail: true,
      voice: true,
      knowledgeBase: true,
      calendly: true,
      copilot: true,
      crmIntegration: true,
      taskManagement: true,
      meetingNotes: true,
      summarization: true,
      personaCustomization: true,
      trendAnalysis: true,
      sentimentDetection: true,
      webSearch: false,
      predictiveSuggestions: false,
      multiLanguageVoice: false,
      apiAccess: false,
      maxUsers: null, // unlimited
    },
    ENTERPRISE: {
      smsEmail: true,
      voice: true,
      knowledgeBase: true,
      calendly: true,
      copilot: true,
      crmIntegration: true,
      taskManagement: true,
      meetingNotes: true,
      summarization: true,
      personaCustomization: true,
      trendAnalysis: true,
      sentimentDetection: true,
      webSearch: true,
      predictiveSuggestions: true,
      multiLanguageVoice: true,
      apiAccess: true,
      maxUsers: null, // unlimited
    },
  }

  return features[planName]
}

/**
 * Check if a business has access to a feature
 */
export async function hasFeatureAccess(
  businessId: string,
  feature: keyof PlanFeatures
): Promise<boolean> {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
      include: {
        subscription: {
          include: {
            plan: true,
          },
        },
      },
    })

    if (!business?.subscription) {
      // Default to starter features for businesses without subscription
      const starterFeatures = getPlanFeatures('STARTER')
      return starterFeatures[feature] === true
    }

    const planName = business.subscription.plan.name as PlanName
    const features = getPlanFeatures(planName)
    return features[feature] === true
  } catch (error) {
    console.error('Feature access check error:', error)
    return false
  }
}

/**
 * Get subscription status for a business
 */
export async function getSubscriptionStatus(businessId: string) {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
    include: {
      subscription: {
        include: {
          plan: true,
          addOns: {
            include: {
              addOn: true,
            },
          },
        },
      },
    },
  })

  if (!business?.subscription) {
    return {
      hasSubscription: false,
      plan: null,
      status: null,
      features: getPlanFeatures('STARTER'),
      isTrial: false,
      trialEndsAt: null,
    }
  }

  const subscription = business.subscription
  const planName = subscription.plan.name as PlanName
  const isTrial = subscription.status === 'TRIAL'
  const trialEndsAt = subscription.trialEndsAt

  return {
    hasSubscription: true,
    plan: subscription.plan,
    status: subscription.status,
    features: getPlanFeatures(planName),
    isTrial,
    trialEndsAt,
    currentPeriodEnd: subscription.currentPeriodEnd,
    billingCycle: subscription.billingCycle,
    addOns: subscription.addOns.map((ao) => ({
      name: ao.addOn.name,
      displayName: ao.addOn.displayName,
      quantity: ao.quantity,
    })),
  }
}

/**
 * Initialize default plans in database
 */
export async function initializeDefaultPlans() {
  const plans = [
    {
      name: 'STARTER',
      displayName: 'Starter Plan',
      description: 'Perfect for small businesses getting started',
      price: 79,
      annualPrice: 759, // 20% discount
      features: JSON.stringify([
        'SMS & Email AI conversations',
        'Basic knowledge base integration',
        '2 users included',
        'Multi-turn AI dialogue & context retention',
        'Email draft generation & reply automation',
        'Basic reporting & conversation history',
        'Automatic language detection & translation',
      ]),
      limits: JSON.stringify({ maxUsers: 2 }),
    },
    {
      name: 'PROFESSIONAL',
      displayName: 'Professional Plan',
      description: 'Most popular for growing businesses',
      price: 199,
      annualPrice: 1910, // 20% discount
      features: JSON.stringify([
        'Everything in Starter',
        'Voice call AI agent',
        'Calendly integration & appointment scheduling',
        'AI Copilot with real-time suggestions & post-call summaries',
        'Unlimited SMS & Email users up to 5',
        'Multi-channel conversation history',
        'Enhanced analytics dashboard',
        'Smart escalation & contextual knowledge base',
      ]),
      limits: JSON.stringify({ maxUsers: 5 }),
    },
    {
      name: 'BUSINESS',
      displayName: 'Business Plan',
      description: 'Advanced features for scaling teams',
      price: 399,
      annualPrice: 3830, // 20% discount
      features: JSON.stringify([
        'Everything in Professional',
        'Multi-channel automation (SMS, Email, Voice)',
        'CRM integrations (HubSpot, Salesforce, Pipedrive)',
        'Auto-meeting notes & task conversion to Notion/Asana/Trello',
        'AI conversation summarization across all channels',
        'Personalized AI persona & tone customization',
        'Trend analysis & sentiment detection',
        'Unlimited users',
      ]),
      limits: JSON.stringify({ maxUsers: null }),
    },
    {
      name: 'ENTERPRISE',
      displayName: 'Enterprise Plan',
      description: 'Custom solutions for large organizations',
      price: 0, // Custom pricing
      annualPrice: 0,
      features: JSON.stringify([
        'Everything in Business',
        'Advanced AI intelligence & predictive suggestions',
        'Real-time web access for AI responses',
        'Multi-language voice replies in live calls',
        'Dedicated support & onboarding',
        'API access & custom integrations',
        'Full analytics & revenue tracking',
        'Custom AI personas & branding',
      ]),
      limits: JSON.stringify({ maxUsers: null }),
    },
  ]

  for (const plan of plans) {
    await prisma.plan.upsert({
      where: { name: plan.name },
      update: plan,
      create: plan,
    })
  }

  // Initialize add-ons
  const addOns = [
    {
      name: 'COPILOT_SEAT',
      displayName: 'Extra AI Copilot Seat',
      description: 'Additional AI Copilot seat for your team',
      price: 50,
      annualPrice: 500, // 17% discount
    },
    {
      name: 'ADDITIONAL_INTEGRATION',
      displayName: 'Additional Integration',
      description: 'Extra CRM or task management integration',
      price: 75,
      annualPrice: 750, // 17% discount
    },
    {
      name: 'PREMIUM_ANALYTICS',
      displayName: 'Premium Analytics',
      description: 'Advanced analytics and reporting features',
      price: 100,
      annualPrice: 1000, // 17% discount
    },
  ]

  for (const addOn of addOns) {
    await prisma.addOn.upsert({
      where: { name: addOn.name },
      update: addOn,
      create: addOn,
    })
  }
}




