import OpenAI from 'openai'
import { prisma } from './prisma'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ConversationSummary {
  summary: string
  keyPoints: string[]
  actionItems: string[]
  sentiment: string
  nextSteps: string[]
}

/**
 * Generate AI-powered conversation summary
 */
export async function generateConversationSummary(
  conversationId: string
): Promise<ConversationSummary> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
        contact: true,
      },
    })

    if (!conversation || conversation.messages.length === 0) {
      throw new Error('Conversation not found or has no messages')
    }

    const messages = conversation.messages
      .map((m) => `${m.role}: ${m.content}`)
      .join('\n')

    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a conversation summarization expert. Analyze the conversation and provide:
          1. A concise summary (2-3 sentences)
          2. Key points discussed (bullet list)
          3. Action items (if any)
          4. Overall sentiment
          5. Recommended next steps
          
          Return as JSON with: summary, keyPoints (array), actionItems (array), sentiment (string), nextSteps (array)`,
        },
        {
          role: 'user',
          content: `Summarize this conversation:\n\n${messages}`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(response)

    const summary: ConversationSummary = {
      summary: parsed.summary || 'No summary available',
      keyPoints: parsed.keyPoints || [],
      actionItems: parsed.actionItems || [],
      sentiment: parsed.sentiment || 'neutral',
      nextSteps: parsed.nextSteps || [],
    }

    // Update conversation with summary
    await prisma.conversation.update({
      where: { id: conversationId },
      data: {
        aiSummary: summary.summary,
        summaryGeneratedAt: new Date(),
      },
    })

    return summary
  } catch (error) {
    console.error('Conversation summarization error:', error)
    throw error
  }
}

/**
 * Generate summary for multiple conversations (batch)
 */
export async function generateBatchSummaries(
  conversationIds: string[]
): Promise<Record<string, ConversationSummary>> {
  const summaries: Record<string, ConversationSummary> = {}

  // Process in parallel (with rate limiting consideration)
  const promises = conversationIds.map(async (id) => {
    try {
      const summary = await generateConversationSummary(id)
      summaries[id] = summary
    } catch (error) {
      console.error(`Failed to summarize conversation ${id}:`, error)
    }
  })

  await Promise.all(promises)
  return summaries
}




