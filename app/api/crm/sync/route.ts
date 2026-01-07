import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper } from '@/lib/auth-helper'
import { syncContactToCrm, syncConversationToCrm } from '@/lib/crm-integration'
import { prisma } from '@/lib/prisma'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSessionHelper()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { type, contactId, conversationId, businessId } = await req.json()

    if (!type || !businessId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    let crmRecordId: string | null = null

    if (type === 'contact' && contactId) {
      const contact = await prisma.contact.findUnique({
        where: { id: contactId },
      })

      if (!contact) {
        return NextResponse.json({ error: 'Contact not found' }, { status: 404 })
      }

      crmRecordId = await syncContactToCrm(businessId, {
        email: contact.email || undefined,
        phone: contact.phone || undefined,
        name: contact.name || undefined,
      })
    } else if (type === 'conversation' && conversationId) {
      crmRecordId = await syncConversationToCrm(businessId, conversationId)
    } else {
      return NextResponse.json({ error: 'Invalid type or missing IDs' }, { status: 400 })
    }

    return NextResponse.json({ crmRecordId, synced: !!crmRecordId })
  } catch (error: any) {
    console.error('CRM sync error:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to sync to CRM' },
      { status: 500 }
    )
  }
}




