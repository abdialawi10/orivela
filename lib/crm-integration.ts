import { prisma } from './prisma'

export type CrmProvider = 'hubspot' | 'salesforce' | 'pipedrive'

export interface CrmContact {
  email?: string
  phone?: string
  name?: string
  company?: string
  notes?: string
}

export interface CrmDeal {
  name: string
  amount?: number
  stage?: string
  contactId?: string
}

export interface CrmTask {
  title: string
  description?: string
  dueDate?: Date
  contactId?: string
}

/**
 * Sync contact to CRM
 */
export async function syncContactToCrm(
  businessId: string,
  contact: CrmContact
): Promise<string | null> {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business || !business.crmProvider || !business.crmApiKey) {
      return null
    }

    let crmRecordId: string | null = null

    switch (business.crmProvider) {
      case 'hubspot':
        crmRecordId = await syncToHubSpot(contact, business.crmApiKey)
        break
      case 'salesforce':
        crmRecordId = await syncToSalesforce(contact, business.crmApiKey, business.crmApiUrl)
        break
      case 'pipedrive':
        crmRecordId = await syncToPipedrive(contact, business.crmApiKey)
        break
    }

    if (crmRecordId) {
      // Log sync
      await prisma.crmSync.create({
        data: {
          contactId: contact.email || contact.phone || undefined,
          crmProvider: business.crmProvider,
          crmRecordId,
          recordType: 'contact',
        },
      })
    }

    return crmRecordId
  } catch (error) {
    console.error('CRM sync error:', error)
    return null
  }
}

/**
 * Sync conversation as deal/opportunity
 */
export async function syncConversationToCrm(
  businessId: string,
  conversationId: string,
  deal?: CrmDeal
): Promise<string | null> {
  try {
    const business = await prisma.business.findUnique({
      where: { id: businessId },
    })

    if (!business || !business.crmProvider || !business.crmApiKey) {
      return null
    }

    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: { contact: true },
    })

    if (!conversation) {
      return null
    }

    let crmRecordId: string | null = null

    switch (business.crmProvider) {
      case 'hubspot':
        crmRecordId = await createHubSpotDeal(
          {
            name: deal?.name || `Conversation ${conversationId}`,
            amount: deal?.amount,
            contactId: conversation.contact.email || conversation.contact.phone,
          },
          business.crmApiKey
        )
        break
      case 'salesforce':
        crmRecordId = await createSalesforceOpportunity(
          {
            name: deal?.name || `Conversation ${conversationId}`,
            amount: deal?.amount,
            contactId: conversation.contact.email || conversation.contact.phone,
          },
          business.crmApiKey,
          business.crmApiUrl
        )
        break
      case 'pipedrive':
        crmRecordId = await createPipedriveDeal(
          {
            name: deal?.name || `Conversation ${conversationId}`,
            amount: deal?.amount,
            contactId: conversation.contact.email || conversation.contact.phone,
          },
          business.crmApiKey
        )
        break
    }

    if (crmRecordId) {
      await prisma.crmSync.create({
        data: {
          conversationId,
          crmProvider: business.crmProvider,
          crmRecordId,
          recordType: 'deal',
        },
      })
    }

    return crmRecordId
  } catch (error) {
    console.error('CRM conversation sync error:', error)
    return null
  }
}

// HubSpot integration
async function syncToHubSpot(contact: CrmContact, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          email: contact.email,
          phone: contact.phone,
          firstname: contact.name?.split(' ')[0],
          lastname: contact.name?.split(' ').slice(1).join(' ') || '',
          company: contact.company,
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.id || null
  } catch (error) {
    console.error('HubSpot sync error:', error)
    return null
  }
}

async function createHubSpotDeal(deal: CrmDeal, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.hubapi.com/crm/v3/objects/deals', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        properties: {
          dealname: deal.name,
          amount: deal.amount?.toString(),
          dealstage: deal.stage || 'appointmentscheduled',
        },
      }),
    })

    if (!response.ok) {
      throw new Error(`HubSpot API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.id || null
  } catch (error) {
    console.error('HubSpot deal creation error:', error)
    return null
  }
}

// Salesforce integration
async function syncToSalesforce(
  contact: CrmContact,
  apiKey: string,
  apiUrl?: string
): Promise<string | null> {
  // Salesforce requires OAuth flow, simplified here
  // In production, implement proper OAuth2 flow
  console.log('Salesforce sync requires OAuth implementation')
  return null
}

async function createSalesforceOpportunity(
  deal: CrmDeal,
  apiKey: string,
  apiUrl?: string
): Promise<string | null> {
  // Salesforce requires OAuth flow
  console.log('Salesforce opportunity creation requires OAuth implementation')
  return null
}

// Pipedrive integration
async function syncToPipedrive(contact: CrmContact, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.pipedrive.com/v1/persons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_token: apiKey,
        name: contact.name,
        email: contact.email ? [{ value: contact.email, primary: true }] : undefined,
        phone: contact.phone ? [{ value: contact.phone, primary: true }] : undefined,
      }),
    })

    if (!response.ok) {
      throw new Error(`Pipedrive API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data?.id?.toString() || null
  } catch (error) {
    console.error('Pipedrive sync error:', error)
    return null
  }
}

async function createPipedriveDeal(deal: CrmDeal, apiKey: string): Promise<string | null> {
  try {
    const response = await fetch('https://api.pipedrive.com/v1/deals', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        api_token: apiKey,
        title: deal.name,
        value: deal.amount,
        currency: 'USD',
      }),
    })

    if (!response.ok) {
      throw new Error(`Pipedrive API error: ${response.statusText}`)
    }

    const data = await response.json()
    return data.data?.id?.toString() || null
  } catch (error) {
    console.error('Pipedrive deal creation error:', error)
    return null
  }
}



