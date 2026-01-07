import { prisma } from './prisma'
import { analyzeSentiment } from './sentiment'

/**
 * Generate trend analysis
 */
export async function generateTrendAnalysis(
  type: 'COMMON_QUESTIONS' | 'PAIN_POINTS' | 'POPULAR_SERVICES' | 'ESCALATION_REASONS' | 'SENTIMENT_TRENDS',
  period: 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
) {
  const conversations = await prisma.conversation.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      messages: true,
      escalations: true,
    },
  })

  let data: Record<string, number> = {}

  switch (type) {
    case 'COMMON_QUESTIONS':
      // Extract questions from messages
      conversations.forEach((conv) => {
        conv.messages
          .filter((m) => m.role === 'USER')
          .forEach((m) => {
            const question = m.content.toLowerCase()
            // Simple keyword extraction
            const keywords = question.match(/\b(what|how|when|where|why|can|do|is|are)\b[\w\s]+/gi)
            keywords?.forEach((kw) => {
              data[kw] = (data[kw] || 0) + 1
            })
          })
      })
      break

    case 'PAIN_POINTS':
      // Look for negative sentiment or complaint keywords
      const painKeywords = ['problem', 'issue', 'broken', 'not working', 'error', 'bug', 'complaint']
      conversations.forEach((conv) => {
        conv.messages.forEach((m) => {
          const text = m.content.toLowerCase()
          painKeywords.forEach((keyword) => {
            if (text.includes(keyword)) {
              data[keyword] = (data[keyword] || 0) + 1
            }
          })
        })
      })
      break

    case 'POPULAR_SERVICES':
      // Extract service mentions
      conversations.forEach((conv) => {
        conv.messages.forEach((m) => {
          // This would need business services list
          // Simplified for now
        })
      })
      break

    case 'ESCALATION_REASONS':
      conversations.forEach((conv) => {
        conv.escalations.forEach((esc) => {
          data[esc.reason] = (data[esc.reason] || 0) + 1
        })
      })
      break

    case 'SENTIMENT_TRENDS':
      // Analyze sentiment over time
      for (const conv of conversations) {
        if (conv.sentimentScore !== null) {
          const sentiment = conv.sentiment || 'NEUTRAL'
          data[sentiment] = (data[sentiment] || 0) + 1
        }
      }
      break
  }

  // Generate AI insights
  const insights = await generateTrendInsights(type, data)

  // Save to database
  await prisma.trendAnalysis.create({
    data: {
      type,
      period,
      periodStart: startDate,
      periodEnd: endDate,
      data: JSON.stringify(data),
      insights,
    },
  })

  return { data, insights }
}

async function generateTrendInsights(
  type: string,
  data: Record<string, number>
): Promise<string> {
  // Use AI to generate insights from trend data
  // Simplified for now
  const topItems = Object.entries(data)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([key, value]) => `${key}: ${value}`)
    .join(', ')

  return `Top trends: ${topItems}`
}

/**
 * Calculate performance benchmarks
 */
export async function calculatePerformanceBenchmark(
  period: 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
) {
  const conversations = await prisma.conversation.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      messages: true,
    },
  })

  // AI metrics
  const aiConversations = conversations.filter((c) => c.status !== 'ESCALATED')
  const aiResponseCount = aiConversations.reduce((sum, c) => sum + c.messageCount, 0)
  const aiResolved = conversations.filter((c) => c.status === 'RESOLVED').length
  const aiEscalated = conversations.filter((c) => c.status === 'ESCALATED').length

  // Calculate average response time (simplified - would need message timestamps)
  const aiAvgResponseTime = 30 // seconds (placeholder)

  const aiResolutionRate = conversations.length > 0 ? (aiResolved / conversations.length) * 100 : 0
  const aiEscalationRate = conversations.length > 0 ? (aiEscalated / conversations.length) * 100 : 0

  // Human metrics (placeholder - would need actual human interaction data)
  const humanResponseCount = 0
  const humanAvgResponseTime = 0
  const humanResolutionRate = 0
  const humanEscalationRate = 0

  const benchmark = await prisma.performanceBenchmark.create({
    data: {
      period,
      periodStart: startDate,
      periodEnd: endDate,
      aiResponseCount,
      aiAvgResponseTime,
      aiResolutionRate,
      aiEscalationRate,
      humanResponseCount,
      humanAvgResponseTime,
      humanResolutionRate,
      humanEscalationRate,
      aiVsHumanResolution: humanResolutionRate > 0 ? aiResolutionRate - humanResolutionRate : null,
      aiVsHumanSpeed: humanAvgResponseTime > 0 ? humanAvgResponseTime - aiAvgResponseTime : null,
    },
  })

  return benchmark
}

/**
 * Calculate revenue impact
 */
export async function calculateRevenueImpact(
  period: 'daily' | 'weekly' | 'monthly',
  startDate: Date,
  endDate: Date
) {
  const conversations = await prisma.conversation.findMany({
    where: {
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    },
  })

  const leadsGenerated = conversations.filter((c) => c.leadGenerated).length
  const salesGenerated = conversations.filter((c) => c.saleGenerated).length
  const revenueAmount = conversations.reduce((sum, c) => sum + (c.revenueAmount || 0), 0)

  const leadsFromVoice = conversations.filter((c) => c.channel === 'VOICE' && c.leadGenerated).length
  const leadsFromSMS = conversations.filter((c) => c.channel === 'SMS' && c.leadGenerated).length
  const leadsFromEmail = conversations.filter((c) => c.channel === 'EMAIL' && c.leadGenerated).length

  const avgDealSize = salesGenerated > 0 ? revenueAmount / salesGenerated : 0
  const conversationToLeadRate = conversations.length > 0 ? (leadsGenerated / conversations.length) * 100 : 0
  const leadToSaleRate = leadsGenerated > 0 ? (salesGenerated / leadsGenerated) * 100 : 0

  const impact = await prisma.revenueImpact.create({
    data: {
      period,
      periodStart: startDate,
      periodEnd: endDate,
      leadsGenerated,
      leadsFromVoice,
      leadsFromSMS,
      leadsFromEmail,
      salesGenerated,
      revenueAmount,
      avgDealSize,
      conversationToLeadRate,
      leadToSaleRate,
    },
  })

  return impact
}



