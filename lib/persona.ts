import { prisma } from './prisma'

export interface AIPersona {
  name: string
  voice: 'professional' | 'friendly' | 'casual' | 'formal'
  tone: string
}

/**
 * Get AI persona for business
 */
export async function getAIPersona(businessId: string): Promise<AIPersona> {
  const business = await prisma.business.findUnique({
    where: { id: businessId },
  })

  if (!business) {
    return {
      name: 'Assistant',
      voice: 'professional',
      tone: 'friendly, professional, concise',
    }
  }

  return {
    name: business.aiPersonaName || 'Assistant',
    voice: (business.aiPersonaVoice as any) || 'professional',
    tone: business.aiPersonaTone || business.tone || 'friendly, professional, concise',
  }
}

/**
 * Generate personalized greeting based on contact history
 */
export async function generateSmartGreeting(
  contactId: string,
  businessId: string,
  channel: 'VOICE' | 'SMS' | 'EMAIL'
): Promise<string> {
  try {
    const contact = await prisma.contact.findUnique({
      where: { id: contactId },
      include: {
        conversations: {
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
      },
    })

    const persona = await getAIPersona(businessId)

    if (!contact) {
      return `Hello! This is ${persona.name}. How can I help you today?`
    }

    // Check if returning customer
    const isReturning = contact.totalInteractions > 1
    const lastInteraction = contact.lastInteraction
    const daysSinceLastContact = lastInteraction
      ? Math.floor((Date.now() - lastInteraction.getTime()) / (1000 * 60 * 60 * 24))
      : null

    // Get preferences
    const preferences = contact.preferences ? JSON.parse(contact.preferences) : {}
    const preferredLanguage = preferences.language || 'en'
    const preferredChannel = preferences.preferredChannel

    // Build personalized greeting
    let greeting = ''

    if (isReturning) {
      if (daysSinceLastContact && daysSinceLastContact < 7) {
        greeting = `Hi ${contact.name || 'there'}! Welcome back. `
      } else if (daysSinceLastContact && daysSinceLastContact < 30) {
        greeting = `Hello ${contact.name || 'there'}! Good to hear from you again. `
      } else {
        greeting = `Hello ${contact.name || 'there'}! It's been a while. `
      }
    } else {
      greeting = `Hello${contact.name ? ` ${contact.name}` : ''}! `
    }

    greeting += `This is ${persona.name}. How can I help you today?`

    // Channel-specific adjustments
    if (channel === 'SMS') {
      greeting = greeting.replace(/This is/g, "It's")
    }

    return greeting
  } catch (error) {
    console.error('Smart greeting generation error:', error)
    return 'Hello! How can I help you today?'
  }
}

/**
 * Update contact preferences based on interaction
 */
export async function updateContactPreferences(
  contactId: string,
  preferences: Record<string, any>
): Promise<void> {
  const contact = await prisma.contact.findUnique({
    where: { id: contactId },
  })

  if (!contact) {
    return
  }

  const existing = contact.preferences ? JSON.parse(contact.preferences) : {}
  const updated = { ...existing, ...preferences }

  await prisma.contact.update({
    where: { id: contactId },
    data: {
      preferences: JSON.stringify(updated),
      lastInteraction: new Date(),
      totalInteractions: {
        increment: 1,
      },
    },
  })
}




