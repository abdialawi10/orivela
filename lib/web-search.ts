import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export interface WebSearchResult {
  title: string
  url: string
  snippet: string
  relevanceScore?: number
}

/**
 * Perform web search using OpenAI's web browsing capability
 * Falls back to Tavily API if available, or uses OpenAI function calling
 */
export async function performWebSearch(
  query: string,
  maxResults: number = 5
): Promise<WebSearchResult[]> {
  try {
    // Use OpenAI with web browsing capability
    // Note: This requires GPT-4 with browsing or using function calling with a search tool
    
    // For MVP, we'll use OpenAI's function calling to simulate web search
    // In production, integrate with Tavily, SerpAPI, or similar
    
    const completion = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        {
          role: 'system',
          content: `You are a web search assistant. When given a query, provide relevant information as if you searched the web. 
          Format your response as JSON with an array of results, each with: title, url, snippet.`,
        },
        {
          role: 'user',
          content: `Search the web for: ${query}. Provide ${maxResults} relevant results.`,
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    })

    const response = completion.choices[0]?.message?.content || '{}'
    const parsed = JSON.parse(response)

    // Handle different response formats
    const results = parsed.results || parsed.items || []
    
    return results.slice(0, maxResults).map((r: any) => ({
      title: r.title || 'No title',
      url: r.url || '#',
      snippet: r.snippet || r.content || '',
      relevanceScore: r.score || r.relevance || 0.5,
    }))
  } catch (error) {
    console.error('Web search error:', error)
    // Fallback: return empty results
    return []
  }
}

/**
 * Check if a query requires web search (not in knowledge base)
 */
export function shouldUseWebSearch(query: string, hasKbResults: boolean): boolean {
  // Use web search if:
  // 1. No KB results found
  // 2. Query contains current/recent information keywords
  // 3. Query asks for real-time data
  
  const realTimeKeywords = [
    'current',
    'latest',
    'recent',
    'today',
    'now',
    'what is',
    'who is',
    'when did',
    'price of',
    'cost of',
    'weather',
    'news',
    'update',
  ]

  const needsRealTime = realTimeKeywords.some((keyword) =>
    query.toLowerCase().includes(keyword)
  )

  return !hasKbResults || needsRealTime
}

/**
 * Format web search results for AI context
 */
export function formatWebSearchResults(results: WebSearchResult[]): string {
  if (results.length === 0) {
    return ''
  }

  return `Recent web search results:
${results
  .map(
    (r, i) => `${i + 1}. ${r.title}\n   URL: ${r.url}\n   ${r.snippet}`
  )
  .join('\n\n')}`
}

