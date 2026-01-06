import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const business = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!business) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    return NextResponse.json({
      name: business.name,
      businessHours: business.businessHours,
      services: business.services ? JSON.parse(business.services) : [],
      pricingNotes: business.pricingNotes,
      escalationPhone: business.escalationPhone,
      escalationEmail: business.escalationEmail,
      tone: business.tone,
      calendlyApiKey: business.calendlyApiKey,
      calendlyUserUri: business.calendlyUserUri,
      calendlyEventType: business.calendlyEventType,
      calendlyLink: business.calendlyLink,
      timezone: business.timezone,
      // AI Persona
      aiPersonaName: business.aiPersonaName,
      aiPersonaVoice: business.aiPersonaVoice,
      aiPersonaTone: business.aiPersonaTone,
      // Web Search
      enableWebSearch: business.enableWebSearch,
      webSearchProvider: business.webSearchProvider,
      // CRM
      crmProvider: business.crmProvider,
      crmApiKey: business.crmApiKey,
      crmApiUrl: business.crmApiUrl,
      crmAccountId: business.crmAccountId,
      autoSyncToCrm: business.autoSyncToCrm,
      // Task Management
      taskProvider: business.taskProvider,
      taskApiKey: business.taskApiKey,
      taskWorkspaceId: business.taskWorkspaceId,
      autoCreateTasks: business.autoCreateTasks,
    })
  } catch (error) {
    console.error('Settings GET error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()

    // Validate and parse services
    let services = null
    if (body.services) {
      if (typeof body.services === 'string') {
        services = JSON.stringify(body.services.split(',').map((s: string) => s.trim()))
      } else {
        services = JSON.stringify(body.services)
      }
    }

    const existingBusiness = await prisma.business.findFirst({
      orderBy: { createdAt: 'asc' },
    })

    if (!existingBusiness) {
      return NextResponse.json({ error: 'Business not found' }, { status: 404 })
    }

    const business = await prisma.business.update({
      where: { id: existingBusiness.id },
      data: {
        name: body.name,
        businessHours: body.businessHours || null,
        services,
        pricingNotes: body.pricingNotes || null,
        escalationPhone: body.escalationPhone || null,
        escalationEmail: body.escalationEmail || null,
        tone: body.tone || 'friendly, professional, concise',
        calendlyApiKey: body.calendlyApiKey || null,
        calendlyUserUri: body.calendlyUserUri || null,
        calendlyEventType: body.calendlyEventType || null,
        calendlyLink: body.calendlyLink || null,
        timezone: body.timezone || 'America/New_York',
        // AI Persona
        aiPersonaName: body.aiPersonaName || null,
        aiPersonaVoice: body.aiPersonaVoice || null,
        aiPersonaTone: body.aiPersonaTone || null,
        // Web Search
        enableWebSearch: body.enableWebSearch ?? false,
        webSearchProvider: body.webSearchProvider || null,
        // CRM
        crmProvider: body.crmProvider || null,
        crmApiKey: body.crmApiKey || null,
        crmApiUrl: body.crmApiUrl || null,
        crmAccountId: body.crmAccountId || null,
        autoSyncToCrm: body.autoSyncToCrm ?? false,
        // Task Management
        taskProvider: body.taskProvider || null,
        taskApiKey: body.taskApiKey || null,
        taskWorkspaceId: body.taskWorkspaceId || null,
        autoCreateTasks: body.autoCreateTasks ?? false,
      },
    })

    return NextResponse.json({
      name: business.name,
      businessHours: business.businessHours,
      services: business.services ? JSON.parse(business.services) : [],
      pricingNotes: business.pricingNotes,
      escalationPhone: business.escalationPhone,
      escalationEmail: business.escalationEmail,
      tone: business.tone,
    })
  } catch (error) {
    console.error('Settings PUT error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

