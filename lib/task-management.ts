import { prisma } from './prisma'

export type TaskProvider = 'notion' | 'asana' | 'trello'

export interface Task {
  title: string
  description?: string
  dueDate?: Date
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
}

/**
 * Create task in external task management system
 */
export async function createExternalTask(
  businessId: string,
  task: Task,
  conversationId?: string
): Promise<string | null> {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business || !business.taskProvider || !business.taskApiKey) {
      // Create task in database only
      const dbTask = await prisma.task.create({
        data: {
          conversationId,
          title: task.title,
          description: task.description,
          dueDate: task.dueDate,
          priority: task.priority || 'MEDIUM',
        },
      })
      return dbTask.id
    }

    let externalTaskId: string | null = null

    switch (business.taskProvider) {
      case 'notion':
        externalTaskId = await createNotionTask(task, business.taskApiKey, business.taskWorkspaceId)
        break
      case 'asana':
        externalTaskId = await createAsanaTask(task, business.taskApiKey, business.taskWorkspaceId)
        break
      case 'trello':
        externalTaskId = await createTrelloTask(task, business.taskApiKey, business.taskWorkspaceId)
        break
    }

    // Create task in database with external reference
    const dbTask = await prisma.task.create({
      data: {
        conversationId,
        title: task.title,
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority || 'MEDIUM',
        externalTaskId,
        externalProvider: business.taskProvider,
      },
    })

    return dbTask.id
  } catch (error) {
    console.error('Task creation error:', error)
    return null
  }
}

/**
 * Extract tasks from conversation and create them
 */
export async function extractAndCreateTasks(
  conversationId: string,
  businessId: string
): Promise<string[]> {
  try {
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    })

    if (!conversation) {
      return []
    }

    // Extract action items from summary or messages
    const summary = conversation.aiSummary || conversation.summary || ''
    const messages = conversation.messages.map((m) => m.content).join('\n')

    // Simple extraction: look for task-like phrases
    const taskPatterns = [
      /(?:need to|must|should|will|going to)\s+([^.!?]+)/gi,
      /(?:action item|todo|task):\s*([^.!?]+)/gi,
      /(?:follow up|follow-up):\s*([^.!?]+)/gi,
    ]

    const extractedTasks: string[] = []
    taskPatterns.forEach((pattern) => {
      const matches = messages.matchAll(pattern)
      for (const match of matches) {
        if (match[1]) {
          extractedTasks.push(match[1].trim())
        }
      }
    })

    // Also check summary for action items
    if (summary) {
      const summaryTasks = summary.match(/(?:action item|todo|task):\s*([^.!?]+)/gi)
      if (summaryTasks) {
        summaryTasks.forEach((task) => {
          const match = task.match(/:\s*(.+)/i)
          if (match?.[1]) {
            extractedTasks.push(match[1].trim())
          }
        })
      }
    }

    // Create tasks
    const taskIds: string[] = []
    for (const taskTitle of extractedTasks) {
      if (taskTitle.length > 5) {
        // Only create meaningful tasks
        const taskId = await createExternalTask(
          businessId,
          {
            title: taskTitle,
            priority: 'MEDIUM',
          },
          conversationId
        )
        if (taskId) {
          taskIds.push(taskId)
        }
      }
    }

    return taskIds
  } catch (error) {
    console.error('Task extraction error:', error)
    return []
  }
}

// Notion integration
async function createNotionTask(
  task: Task,
  apiKey: string,
  databaseId?: string
): Promise<string | null> {
  try {
    const response = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: {
          database_id: databaseId || process.env.NOTION_DATABASE_ID,
        },
        properties: {
          Name: {
            title: [
              {
                text: {
                  content: task.title,
                },
              },
            ],
          },
          Description: task.description
            ? {
                rich_text: [
                  {
                    text: {
                      content: task.description,
                    },
                  },
                ],
              }
            : undefined,
          Due: task.dueDate
            ? {
                date: {
                  start: task.dueDate.toISOString(),
                },
              }
            : undefined,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Notion API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.id || null
  } catch (error) {
    console.error('Notion task creation error:', error)
    return null
  }
}

// Asana integration
async function createAsanaTask(
  task: Task,
  apiKey: string,
  workspaceId?: string
): Promise<string | null> {
  try {
    const response = await fetch('https://app.asana.com/api/1.0/tasks', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        data: {
          name: task.title,
          notes: task.description,
          due_on: task.dueDate?.toISOString().split('T')[0],
          workspace: workspaceId,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`Asana API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data?.gid || null
  } catch (error) {
    console.error('Asana task creation error:', error)
    return null
  }
}

// Trello integration
async function createTrelloTask(
  task: Task,
  apiKey: string,
  listId?: string
): Promise<string | null> {
  try {
    const response = await fetch('https://api.trello.com/1/cards', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        key: apiKey.split(':')[0], // Trello uses key:token format
        token: apiKey.split(':')[1] || apiKey,
        idList: listId || process.env.TRELLO_LIST_ID,
        name: task.title,
        desc: task.description,
        due: task.dueDate?.toISOString(),
      }),
    })

    if (!response.ok) {
      throw new Error(`Trello API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.id || null
  } catch (error) {
    console.error('Trello task creation error:', error)
    return null
  }
}

