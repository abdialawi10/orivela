import { prisma } from './prisma'

export async function searchKnowledgeBase(query: string, limit: number = 3) {
  const searchTerm = query.toLowerCase()

  const items = await prisma.knowledgeBaseItem.findMany({
    take: limit * 2, // Get more to filter
  })

  // Simple keyword matching (can be improved with full-text search)
  const scored = items.map((item) => {
    let score = 0
    const title = (item.title || '').toLowerCase()
    const question = (item.question || '').toLowerCase()
    const answer = (item.answer || '').toLowerCase()
    const content = (item.content || '').toLowerCase()

    if (title.includes(searchTerm)) score += 3
    if (question?.includes(searchTerm)) score += 2
    if (answer?.includes(searchTerm)) score += 1
    if (content?.includes(searchTerm)) score += 1

    return { item, score }
  })

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.item)
}






