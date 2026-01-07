'use client'

import { useState, useEffect, useRef } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Play, Square, Pause, Settings, Mic, MicOff } from 'lucide-react'
import { copilotName } from '@/lib/brand'

type CopilotMode = 'SALES' | 'SUPPORT' | 'MEETING' | 'AUTO'
type SuggestionType = 'SUGGESTED_RESPONSE' | 'TALKING_POINT' | 'OBJECTION_DETECTED' | 'CLARIFYING_QUESTION' | 'NEXT_STEP'

interface Suggestion {
  id: string
  type: SuggestionType
  content: string
  confidence?: number
  timestamp: string
  viewed: boolean
}

export default function CopilotPage() {
  const [isActive, setIsActive] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [mode, setMode] = useState<CopilotMode>('AUTO')
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])
  const [transcripts, setTranscripts] = useState<Array<{ text: string; speaker?: string; timestamp: string }>>([])
  const [micEnabled, setMicEnabled] = useState(false)
  const [screenContext, setScreenContext] = useState<any>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const recognitionRef = useRef<any>(null)

  useEffect(() => {
    // Request screen context from extension (if available)
    if (typeof window !== 'undefined' && (window as any).orivelaCopilot) {
      const updateScreenContext = () => {
        const context = (window as any).orivelaCopilot.getScreenContext()
        if (context) {
          setScreenContext(context)
        }
      }
      
      updateScreenContext()
      const interval = setInterval(updateScreenContext, 5000) // Update every 5 seconds
      return () => clearInterval(interval)
    }
  }, [])

  const startSession = async () => {
    try {
      const res = await fetch('/api/copilot/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mode, title: `${mode} Session` }),
      })

      if (res.ok) {
        const data = await res.json()
        setSessionId(data.sessionId)
        setIsActive(true)
        startAudioCapture()
      }
    } catch (error) {
      console.error('Failed to start session:', error)
    }
  }

  const stopSession = async () => {
    if (sessionId) {
      try {
        await fetch(`/api/copilot/sessions/${sessionId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'ENDED' }),
        })
      } catch (error) {
        console.error('Failed to end session:', error)
      }
    }

    stopAudioCapture()
    setIsActive(false)
    setSessionId(null)
    setSuggestions([])
    setTranscripts([])
  }

  const startAudioCapture = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser')
      return
    }

    const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
    const recognition = new SpeechRecognition()
    
    recognition.continuous = true
    recognition.interimResults = true
    recognition.lang = 'en-US'

    recognition.onresult = async (event: any) => {
      const lastResult = event.results[event.results.length - 1]
      if (lastResult.isFinal) {
        const text = lastResult[0].transcript
        await sendTranscript(text, 'user')
      }
    }

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error)
    }

    recognition.start()
    recognitionRef.current = recognition
    setMicEnabled(true)
  }

  const stopAudioCapture = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      recognitionRef.current = null
    }
    setMicEnabled(false)
  }

  const sendTranscript = async (text: string, speaker?: string) => {
    if (!sessionId) return

    const newTranscript = {
      text,
      speaker,
      timestamp: new Date().toISOString(),
    }

    setTranscripts((prev) => [...prev, newTranscript])

    try {
      const res = await fetch('/api/copilot/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          text,
          speaker,
          screenContext,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.suggestions && data.suggestions.length > 0) {
          setSuggestions((prev) => [...data.suggestions, ...prev])
        }
      }
    } catch (error) {
      console.error('Failed to send transcript:', error)
    }
  }

  const getSuggestionLabel = (type: SuggestionType) => {
    switch (type) {
      case 'SUGGESTED_RESPONSE':
        return 'Suggested Response'
      case 'TALKING_POINT':
        return 'Talking Point'
      case 'OBJECTION_DETECTED':
        return 'Objection Detected'
      case 'CLARIFYING_QUESTION':
        return 'Clarifying Question'
      case 'NEXT_STEP':
        return 'Next Step'
      default:
        return 'Suggestion'
    }
  }

  const getSuggestionColor = (type: SuggestionType) => {
    switch (type) {
      case 'OBJECTION_DETECTED':
        return 'border-orange-200 bg-orange-50'
      case 'NEXT_STEP':
        return 'border-blue-200 bg-blue-50'
      default:
        return 'border-gray-200 bg-white'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{copilotName}</h1>
            <p className="text-muted-foreground">
              Live AI assistance for calls & meetings
            </p>
          </div>
          <div className="flex items-center gap-4">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value as CopilotMode)}
              disabled={isActive}
              className="px-3 py-2 border rounded-md"
            >
              <option value="AUTO">Auto</option>
              <option value="SALES">Sales</option>
              <option value="SUPPORT">Support</option>
              <option value="MEETING">Meeting</option>
            </select>
            {!isActive ? (
              <Button onClick={startSession} className="gap-2">
                <Play className="h-4 w-4" />
                Start Copilot
              </Button>
            ) : (
              <Button onClick={stopSession} variant="destructive" className="gap-2">
                <Square className="h-4 w-4" />
                End Session
              </Button>
            )}
          </div>
        </div>

        {isActive && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-green-800">
              Copilot Active
            </span>
            {micEnabled && (
              <div className="ml-auto flex items-center gap-2 text-sm text-green-700">
                <Mic className="h-4 w-4" />
                Listening...
              </div>
            )}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Live Suggestions Panel */}
          <div className="lg:col-span-2 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Live Suggestions</CardTitle>
                <CardDescription>
                  Real-time AI assistance during your call
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {suggestions.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {isActive
                      ? 'Waiting for conversation...'
                      : 'Start a session to see suggestions'}
                  </div>
                ) : (
                  suggestions.map((suggestion) => (
                    <div
                      key={suggestion.id}
                      className={`border rounded-lg p-4 ${getSuggestionColor(
                        suggestion.type
                      )}`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <span className="text-xs font-medium text-gray-600 uppercase">
                          {getSuggestionLabel(suggestion.type)}
                        </span>
                        {suggestion.confidence && (
                          <span className="text-xs text-gray-500">
                            {Math.round(suggestion.confidence * 100)}%
                          </span>
                        )}
                      </div>
                      <p className="text-sm">{suggestion.content}</p>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>

            {/* Transcript */}
            <Card>
              <CardHeader>
                <CardTitle>Live Transcript</CardTitle>
                <CardDescription>Real-time conversation transcript</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {transcripts.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No transcript yet
                    </p>
                  ) : (
                    transcripts.map((t, idx) => (
                      <div key={idx} className="text-sm">
                        <span className="font-medium text-gray-600">
                          {t.speaker || 'Unknown'}:
                        </span>{' '}
                        <span>{t.text}</span>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Session Info</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground">Mode:</span>{' '}
                  <span className="font-medium">{mode}</span>
                </div>
                {screenContext && (
                  <div>
                    <span className="text-muted-foreground">App:</span>{' '}
                    <span className="font-medium">
                      {screenContext.appName || 'Unknown'}
                    </span>
                  </div>
                )}
                {sessionId && (
                  <div>
                    <span className="text-muted-foreground">Session ID:</span>{' '}
                    <span className="font-mono text-xs">{sessionId.slice(0, 8)}...</span>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                  onClick={() => {
                    if (micEnabled) {
                      stopAudioCapture()
                    } else {
                      startAudioCapture()
                    }
                  }}
                >
                  {micEnabled ? (
                    <>
                      <MicOff className="h-4 w-4 mr-2" />
                      Mute Mic
                    </>
                  ) : (
                    <>
                      <Mic className="h-4 w-4 mr-2" />
                      Enable Mic
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}



