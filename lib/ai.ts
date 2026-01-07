import OpenAI from 'openai'
import { prisma } from './prisma'
import { searchKnowledgeBase } from './kb-utils'
import { isBusinessOpen } from './business-hours'
import { detectLanguageWithFallback, translateText, getLanguageName, LanguageCode } from './translation'
import { detectSchedulingIntent, generateSchedulingResponse, detectTimezone } from './calendly'
import { performWebSearch, shouldUseWebSearch, formatWebSearchResults } from './web-search'
import { analyzeSentiment } from './sentiment'
import { generatePredictiveSuggestions } from './predictive-suggestions'
import { getAIPersona } from './persona'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

const ESCALATION_KEYWORDS = [
  'representative',
  'human',
  'manager',
  'supervisor',
  'angry',
  'refund',
  'lawsuit',
  'cancel',
  'urgent',
  'complaint',
  'frustrated',
  'disappointed',
  'terrible',
  'awful',
  'horrible',
]

export function shouldEscalate(userMessage: string): boolean {
  const lowerMessage = userMessage.toLowerCase()
  return ESCALATION_KEYWORDS.some((keyword) => lowerMessage.includes(keyword))
}

export async function generateAIResponse(
  userMessage: string,
  conversationId: string,
  businessId?: string,
  detectedLanguage?: LanguageCode
): Promise<{ 
  response: string
  shouldEscalate: boolean
  language?: LanguageCode
  schedulingInfo?: {
    calendlyLink?: string
    suggestedTimes?: string[]
    actionRequired: boolean
  }
  sentiment?: {
    sentiment: string
    sentimentScore: number
    emotion: string
  }
  predictiveSuggestion?: {
    type: string
    content: string
    confidence: number
  }
  webSearchUsed?: boolean
}> {
  // Get business settings
  const business = businessId
    ? await prisma.business.findUnique({ where: { id: businessId } })
    : await prisma.business.findFirst({ orderBy: { createdAt: 'asc' } })

  if (!business) {
    throw new Error('Business not found')
  }

  // Get conversation to check existing language
  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
  })

  const conversationLanguage = (conversation?.language || 'en') as LanguageCode

  // Detect language if not provided
  let userLanguage: LanguageCode = detectedLanguage || conversationLanguage
  if (!detectedLanguage) {
    userLanguage = await detectLanguageWithFallback(userMessage, conversationLanguage)
  }

  // Update conversation language if it changed
  if (userLanguage !== conversationLanguage) {
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { language: userLanguage },
    })
  }

  // Get conversation history
  const messages = await prisma.message.findMany({
    where: { conversationId },
    orderBy: { createdAt: 'asc' },
    take: 20,
  })

  // Check business hours
  const hoursStatus = isBusinessOpen(business.businessHours)

  // Search knowledge base
  const kbItems = await searchKnowledgeBase(userMessage, 3)
  const hasKbResults = kbItems.length > 0

  // Web search if enabled and needed
  let webSearchResults = ''
  let webSearchUsed = false
  if (business.enableWebSearch && shouldUseWebSearch(userMessage, hasKbResults)) {
    try {
      const searchResults = await performWebSearch(userMessage, 5)
      if (searchResults.length > 0) {
        webSearchResults = formatWebSearchResults(searchResults)
        webSearchUsed = true
      }
    } catch (error) {
      console.error('Web search error:', error)
    }
  }

  // Analyze sentiment
  const sentimentAnalysis = await analyzeSentiment(userMessage)

  // Get AI persona
  const persona = await getAIPersona(business.id)

  // Build context
  const kbContext = kbItems
    .map((item) => {
      if (item.type === 'FAQ') {
        return `Q: ${item.question}\nA: ${item.answer}`
      } else {
        return `Document: ${item.title}\n${item.content}`
      }
    })
    .join('\n\n')

  const services = business.services ? JSON.parse(business.services).join(', ') : 'Various services'
  const languageName = getLanguageName(userLanguage)

  // Translate business hours message if needed
  let hoursMessage = hoursStatus.message
  if (userLanguage !== 'en' && hoursStatus.message) {
    hoursMessage = await translateText(hoursStatus.message, userLanguage)
  }

  // Check for scheduling intent (before building system prompt)
  const wantsToSchedule = detectSchedulingIntent(userMessage)
  let schedulingInfo: any = null

  if (wantsToSchedule) {
    const userTimezone = detectTimezone(userMessage)
    schedulingInfo = await generateSchedulingResponse(business, userMessage, userTimezone)
  }

  // Build system prompt
  const systemPrompt = `You are ${persona.name}, an AI assistant for ${business.name}. Your voice is ${persona.voice} and your tone is ${persona.tone}.

IMPORTANT: The user is speaking in ${languageName}. You MUST respond in ${languageName}. Do not translate your response back to English. Communicate naturally in ${languageName}.

Business Information:
- Business Hours Status: ${hoursMessage}
- Services Offered: ${services}
${business.pricingNotes ? `- Pricing Notes: ${business.pricingNotes}` : ''}

${kbContext ? `\nKnowledge Base:\n${kbContext}\n` : ''}
${webSearchResults ? `\n${webSearchResults}\n` : ''}

User Sentiment: ${sentimentAnalysis.emotion} (${sentimentAnalysis.sentiment})

Instructions:
1. Always respond in ${languageName}. This is critical.
2. Always be helpful, ${business.tone}
3. If the user asks about something in the knowledge base, use that information
4. If outside business hours and the user needs immediate help, offer to take a message and promise follow-up during business hours
5. If you don't know something, ask clarifying questions or suggest they speak with a human representative
6. Keep responses concise and conversational
7. If the user wants to schedule an appointment or get pricing, ask qualifying questions to collect relevant details
${schedulingInfo ? `8. IMPORTANT: The user wants to schedule. Include this information naturally: ${schedulingInfo.message}${schedulingInfo.calendlyLink ? ' Include the Calendly link: ' + schedulingInfo.calendlyLink : ''}` : ''}

Important: If the user seems frustrated, angry, wants a refund, cancellation, mentions legal issues, or explicitly asks for a human representative, you should escalate this conversation.\``

  // Build messages for OpenAI
  const chatMessages: OpenAI.Chat.ChatCompletionMessageParam[] = [
    { role: 'system', content: systemPrompt },
    ...messages
      .filter((m) => m.role !== 'SYSTEM')
      .map((m) => ({
        role: m.role === 'USER' ? 'user' : 'assistant',
        content: m.content,
      }) as OpenAI.Chat.ChatCompletionMessageParam),
    { role: 'user', content: userMessage },
  ]

  // Check for escalation
  const shouldEscalateFlag = shouldEscalate(userMessage)

  // Generate predictive suggestions
  const predictiveSuggestion = await generatePredictiveSuggestions(
    conversationId,
    messages.map((m) => ({ content: m.content, role: m.role }))
  )

  // Update message with sentiment and web search info
  const lastMessage = messages[messages.length - 1]
  if (lastMessage) {
    await prisma.message.updateMany({
      where: { id: lastMessage.id },
      data: {
        sentiment: sentimentAnalysis.sentimentScore,
        emotion: sentimentAnalysis.emotion,
        webSearchUsed,
        webSearchResults: webSearchUsed ? webSearchResults : null,
        suggestionType: predictiveSuggestion?.type || null,
      },
    })
  }

  // Update conversation sentiment
  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      sentiment: sentimentAnalysis.sentiment as any,
      sentimentScore: sentimentAnalysis.sentimentScore,
      emotion: sentimentAnalysis.emotion,
    },
  })

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: chatMessages,
      temperature: 0.7,
      max_tokens: 500,
    })

    let response = completion.choices[0]?.message?.content || "I'm sorry, I didn't understand that. Could you please rephrase?"

    // Fallback translation if response is in wrong language
    // (OpenAI usually follows instructions, but this is a safety net)
    if (userLanguage !== 'en') {
      // Quick check: if response looks English, translate it
      const firstWords = response.substring(0, 50).toLowerCase()
      if (firstWords.includes(' i ') || firstWords.includes(' the ') || firstWords.includes(' you ')) {
        // Might be English, translate it
        response = await translateText(response, userLanguage)
      }
    }

    return {
      response,
      shouldEscalate: shouldEscalateFlag,
      language: userLanguage,
      schedulingInfo: schedulingInfo || undefined,
      sentiment: {
        sentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.sentimentScore,
        emotion: sentimentAnalysis.emotion,
      },
      predictiveSuggestion: predictiveSuggestion ? {
        type: predictiveSuggestion.type || '',
        content: predictiveSuggestion.content || '',
        confidence: predictiveSuggestion.confidence || 0
      } : undefined,
      webSearchUsed,
    }
  } catch (error) {
    console.error('OpenAI API error:', error)
    const errorMessage = userLanguage !== 'en' 
      ? await translateText("I'm experiencing technical difficulties. Please try again or contact us directly.", userLanguage)
      : "I'm experiencing technical difficulties. Please try again or contact us directly."
    
    return {
      response: errorMessage,
      shouldEscalate: shouldEscalateFlag,
      language: userLanguage,
      schedulingInfo: schedulingInfo || undefined,
      sentiment: {
        sentiment: sentimentAnalysis.sentiment,
        sentimentScore: sentimentAnalysis.sentimentScore,
        emotion: sentimentAnalysis.emotion,
      },
      webSearchUsed: false,
    }
  }
}

