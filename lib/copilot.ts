import OpenAI from 'openai'
import { CopilotMode, SuggestionType } from '@prisma/client'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface ScreenContext {
  appName?: string
  tabTitle?: string
  pageText?: string
  url?: string
  timestamp: Date
}

export interface TranscriptChunk {
  text: string
  speaker?: 'user' | 'other'
  timestamp: Date
}

export interface CopilotContext {
  mode: CopilotMode
  screenContext?: ScreenContext
  recentTranscripts: TranscriptChunk[]
  conversationHistory: string[]
}

/**
 * Generate real-time suggestions based on context
 */
export async function generateCopilotSuggestions(
  context: CopilotContext
): Promise<Array<{ type: SuggestionType; content: string; confidence?: number }>> {
  const modeInstructions = getModeInstructions(context.mode)
  
  // Build context string
  const screenInfo = context.screenContext
    ? `Screen Context:
- App: ${context.screenContext.appName || 'Unknown'}
- Page: ${context.screenContext.tabTitle || 'Unknown'}
- URL: ${context.screenContext.url || 'N/A'}
- Content: ${context.screenContext.pageText?.substring(0, 500) || 'No content'}
`
    : ''

  const transcriptText = context.recentTranscripts
    .map((t) => `${t.speaker || 'Unknown'}: ${t.text}`)
    .join('\n')

  const conversationHistory = context.conversationHistory.slice(-10).join('\n')

  const systemPrompt = `You are Kotae Copilot, a real-time AI assistant helping during live calls and meetings.

${modeInstructions}

Current Context:
${screenInfo}

Recent Conversation:
${transcriptText}

${conversationHistory ? `Previous Context:\n${conversationHistory}` : ''}

Your role:
- Provide helpful, concise suggestions
- Detect objections or concerns
- Suggest talking points
- Recommend next steps
- Ask clarifying questions when needed

IMPORTANT:
- Be brief and actionable
- Don't be pushy or salesy
- Focus on being helpful
- Provide 1-3 suggestions maximum
- Format as JSON array with type and content

Response format:
[
  {"type": "SUGGESTED_RESPONSE", "content": "brief suggestion"},
  {"type": "TALKING_POINT", "content": "key point to mention"}
]`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: 'Based on the current conversation context, provide real-time suggestions.',
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
      response_format: { type: 'json_object' },
    })

    const response = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(response)
    
    // Handle both array and object formats
    const suggestions = Array.isArray(parsed) 
      ? parsed 
      : parsed.suggestions || parsed.items || []

    return suggestions
      .slice(0, 3) // Max 3 suggestions
      .map((s: any) => ({
        type: (s.type || 'TALKING_POINT') as SuggestionType,
        content: s.content || s.text || '',
        confidence: s.confidence || 0.8,
      }))
  } catch (error) {
    console.error('Copilot suggestion error:', error)
    return []
  }
}

function getModeInstructions(mode: CopilotMode): string {
  switch (mode) {
    case 'SALES':
      return `Mode: SALES
- Help close deals
- Handle objections professionally
- Suggest value propositions
- Identify buying signals
- Recommend next steps in sales process`

    case 'SUPPORT':
      return `Mode: SUPPORT
- Help solve customer problems
- Suggest troubleshooting steps
- Identify escalation needs
- Provide empathetic responses
- Document issues clearly`

    case 'MEETING':
      return `Mode: MEETING
- Help facilitate discussion
- Suggest action items
- Identify decisions needed
- Recommend follow-ups
- Keep meeting on track`

    case 'AUTO':
    default:
      return `Mode: AUTO
- Adapt to conversation context
- Detect if it's sales, support, or general meeting
- Provide contextually appropriate suggestions`
  }
}

/**
 * Detect objection in transcript
 */
export function detectObjection(text: string): boolean {
  const objectionKeywords = [
    'too expensive',
    'cost',
    'price',
    "can't afford",
    'budget',
    'cheaper',
    'not interested',
    "don't need",
    'maybe later',
    'think about it',
    'not sure',
    'concerned',
    'worried',
    'problem',
    'issue',
  ]

  const lowerText = text.toLowerCase()
  return objectionKeywords.some((keyword) => lowerText.includes(keyword))
}

/**
 * Generate post-call summary
 */
export async function generatePostCallSummary(
  transcripts: TranscriptChunk[],
  mode: CopilotMode
): Promise<{
  summary: string
  actionItems: string[]
  followUpEmail?: string
}> {
  const fullTranscript = transcripts
    .map((t) => `${t.speaker || 'Unknown'}: ${t.text}`)
    .join('\n')

  const modeContext = getModeInstructions(mode)

  const systemPrompt = `You are generating a post-call summary. 

${modeContext}

Transcript:
${fullTranscript}

Generate:
1. A concise summary (2-3 paragraphs)
2. Action items (bullet points)
3. A follow-up email draft (if applicable)

Format as JSON:
{
  "summary": "brief summary",
  "actionItems": ["item1", "item2"],
  "followUpEmail": "email draft or null"
}`

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: 'Generate the post-call summary.' },
      ],
      temperature: 0.7,
      max_tokens: 1000,
    })

    const response = JSON.parse(completion.choices[0]?.message?.content || '{}')

    return {
      summary: response.summary || 'No summary available.',
      actionItems: response.actionItems || [],
      followUpEmail: response.followUpEmail || undefined,
    }
  } catch (error) {
    console.error('Post-call summary error:', error)
    return {
      summary: 'Unable to generate summary.',
      actionItems: [],
    }
  }
}

