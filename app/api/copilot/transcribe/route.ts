import { NextRequest, NextResponse } from 'next/server'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { prisma } from '@/lib/prisma'
import { generateCopilotSuggestions, detectObjection } from '@/lib/copilot'
import { SuggestionType } from '@prisma/client'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession()
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { sessionId, text, speaker, screenContext } = await req.json()

    if (!sessionId || !text) {
      return NextResponse.json(
        { error: 'sessionId and text are required' },
        { status: 400 }
      )
    }

    // Verify session belongs to user
    const copilotSession = await prisma.copilotSession.findUnique({
      where: { id: sessionId },
      include: {
        transcripts: {
          orderBy: { timestamp: 'desc' },
          take: 10,
        },
      },
    })

    if (!copilotSession || copilotSession.userId !== session.user.id) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 })
    }

    // Save transcript
    const transcript = await prisma.copilotTranscript.create({
      data: {
        sessionId,
        text,
        speaker: speaker || null,
        confidence: 0.95, // Can be improved with actual transcription confidence
      },
    })

    // Update screen context if provided
    if (screenContext) {
      await prisma.copilotSession.update({
        where: { id: sessionId },
        data: {
          screenContext: JSON.stringify(screenContext),
        },
      })
    }

    // Generate suggestions
    const recentTranscripts = [
      ...copilotSession.transcripts.slice(0, 9).reverse(),
      { text, speaker: speaker || null, timestamp: new Date() },
    ]

    const suggestions = await generateCopilotSuggestions({
      mode: copilotSession.mode,
      screenContext: screenContext
        ? {
            appName: screenContext.appName,
            tabTitle: screenContext.tabTitle,
            pageText: screenContext.pageText,
            url: screenContext.url,
            timestamp: new Date(),
          }
        : undefined,
      recentTranscripts: recentTranscripts.map((t) => ({
        text: t.text,
        speaker: (t.speaker as 'user' | 'other') || undefined,
        timestamp: t.timestamp,
      })),
      conversationHistory: [],
    })

    // Save suggestions
    const savedSuggestions = await Promise.all(
      suggestions.map((s) =>
        prisma.copilotSuggestion.create({
          data: {
            sessionId,
            type: s.type,
            content: s.content,
            confidence: s.confidence,
          },
        })
      )
    )

    // Check for objections
    const hasObjection = detectObjection(text)
    if (hasObjection) {
      await prisma.copilotSuggestion.create({
        data: {
          sessionId,
          type: 'OBJECTION_DETECTED',
          content: 'Potential objection detected. Consider addressing concerns directly.',
          confidence: 0.7,
        },
      })
    }

    return NextResponse.json({
      transcriptId: transcript.id,
      suggestions: savedSuggestions.map((s) => ({
        id: s.id,
        type: s.type,
        content: s.content,
        confidence: s.confidence,
        timestamp: s.timestamp,
      })),
      hasObjection,
    })
  } catch (error) {
    console.error('Transcribe error:', error)
    return NextResponse.json(
      { error: 'Failed to process transcription' },
      { status: 500 }
    )
  }
}




