import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface SentimentAnalysis {
  sentiment: 'VERY_NEGATIVE' | 'NEGATIVE' | 'NEUTRAL' | 'POSITIVE' | 'VERY_POSITIVE'
  sentimentScore: number // -1 to 1
  emotion: string // "happy", "frustrated", "angry", "satisfied", "neutral", etc.
  confidence: number // 0 to 1
}

/**
 * Analyze sentiment and emotion of text
 */
export async function analyzeSentiment(text: string): Promise<SentimentAnalysis> {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a sentiment analysis expert. Analyze the sentiment and emotion of the given text.
          Return a JSON object with:
          - sentiment: "VERY_NEGATIVE", "NEGATIVE", "NEUTRAL", "POSITIVE", or "VERY_POSITIVE"
          - sentimentScore: a number between -1 (very negative) and 1 (very positive)
          - emotion: a single word describing the primary emotion (e.g., "happy", "frustrated", "angry", "satisfied", "neutral", "excited", "disappointed")
          - confidence: a number between 0 and 1 indicating confidence in the analysis`,
        },
        {
          role: 'user',
          content: text,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(response)

    return {
      sentiment: parsed.sentiment || 'NEUTRAL',
      sentimentScore: parseFloat(parsed.sentimentScore) || 0,
      emotion: parsed.emotion || 'neutral',
      confidence: parseFloat(parsed.confidence) || 0.5,
    }
  } catch (error) {
    console.error('Sentiment analysis error:', error)
    // Return neutral as fallback
    return {
      sentiment: 'NEUTRAL',
      sentimentScore: 0,
      emotion: 'neutral',
      confidence: 0,
    }
  }
}

/**
 * Analyze sentiment for a conversation (aggregate)
 */
export async function analyzeConversationSentiment(
  messages: Array<{ content: string; role: string }>
): Promise<SentimentAnalysis> {
  // Analyze last 10 messages
  const recentMessages = messages.slice(-10)
  const userMessages = recentMessages
    .filter((m) => m.role === 'USER' || m.role === 'user')
    .map((m) => m.content)
    .join('\n')

  if (userMessages.length === 0) {
    return {
      sentiment: 'NEUTRAL',
      sentimentScore: 0,
      emotion: 'neutral',
      confidence: 0,
    }
  }

  return await analyzeSentiment(userMessages)
}

/**
 * Get sentiment priority for escalation
 */
export function getSentimentPriority(sentiment: SentimentAnalysis): number {
  // Higher priority for negative sentiments
  const priorityMap: Record<string, number> = {
    VERY_NEGATIVE: 5,
    NEGATIVE: 4,
    NEUTRAL: 2,
    POSITIVE: 1,
    VERY_POSITIVE: 1,
  }

  return priorityMap[sentiment.sentiment] || 2
}



