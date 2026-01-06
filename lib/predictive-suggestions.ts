import OpenAI from 'openai'
import { prisma } from './prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export type SuggestionType = 'upsell' | 'follow-up' | 'support' | 'scheduling' | null

export interface PredictiveSuggestion {
  type: SuggestionType
  content: string
  confidence: number
  reasoning: string
}

/**
 * Generate predictive suggestions based on conversation patterns
 */
export async function generatePredictiveSuggestions(
  conversationId: string,
  recentMessages: Array<{ content: string; role: string }>
): Promise<PredictiveSuggestion | null> {
  try {
    // Get conversation context
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        contact: true,
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
      },
    })

    if (!conversation) {
      return null
    }

    // Get contact's conversation history
    const allConversations = await prisma.conversation.findMany({
      where: { contactId: conversation.contactId },
      include: {
        messages: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
      take: 5,
    })

    const conversationHistory = allConversations
      .flatMap((c) => c.messages)
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')

    const recentContext = recentMessages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a predictive analytics assistant. Analyze conversation patterns and suggest next actions.
          
          Based on the conversation history and current context, suggest ONE of the following:
          - "upsell": If there's an opportunity to suggest additional services/products
          - "follow-up": If a follow-up message would be valuable
          - "support": If proactive support would help
          - "scheduling": If scheduling a call/meeting would be beneficial
          - null: If no suggestion is appropriate
          
          Return JSON with: type, content (suggestion text), confidence (0-1), reasoning`,
        },
        {
          role: 'user',
          content: `Conversation History:\n${conversationHistory}\n\nRecent Context:\n${recentContext}\n\nWhat should we suggest next?`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(response)

    if (!parsed.type || parsed.type === 'null') {
      return null
    }

    return {
      type: parsed.type as SuggestionType,
      content: parsed.content || '',
      confidence: parseFloat(parsed.confidence) || 0.5,
      reasoning: parsed.reasoning || '',
    }
  } catch (error) {
    console.error('Predictive suggestions error:', error)
    return null
  }
}

/**
 * Check if conversation pattern suggests upsell opportunity
 */
export function detectUpsellOpportunity(
  messages: Array<{ content: string }>,
  services: string[]
): boolean {
  const content = messages.map((m) => m.content.toLowerCase()).join(' ')
  
  const upsellKeywords = [
    'interested in',
    'looking for',
    'need more',
    'additional',
    'upgrade',
    'premium',
    'better',
    'more features',
  ]

  const hasUpsellKeywords = upsellKeywords.some((keyword) => content.includes(keyword))
  const mentionsService = services.some((service) => content.includes(service.toLowerCase()))

  return hasUpsellKeywords && mentionsService
}

