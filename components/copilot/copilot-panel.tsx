'use client'

import { useEffect, useState } from 'react'
import { X, Lightbulb, MessageSquare, AlertTriangle, HelpCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { copilotName } from '@/lib/brand'

interface Suggestion {
  id: string
  type: string
  content: string
  confidence?: number
  timestamp: string
}

interface CopilotPanelProps {
  sessionId: string | null
  isVisible: boolean
  onClose: () => void
}

export function CopilotPanel({ sessionId, isVisible, onClose }: CopilotPanelProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([])

  useEffect(() => {
    if (!sessionId || !isVisible) return

    const fetchSuggestions = async () => {
      try {
        const res = await fetch(`/api/copilot/suggestions?sessionId=${sessionId}&viewed=false`)
        if (res.ok) {
          const data = await res.json()
          setSuggestions(data)
        }
      } catch (error) {
        console.error('Failed to fetch suggestions:', error)
      }
    }

    fetchSuggestions()
    const interval = setInterval(fetchSuggestions, 3000) // Poll every 3 seconds

    return () => clearInterval(interval)
  }, [sessionId, isVisible])

  if (!isVisible) return null

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'SUGGESTED_RESPONSE':
        return <MessageSquare className="h-4 w-4" />
      case 'TALKING_POINT':
        return <Lightbulb className="h-4 w-4" />
      case 'OBJECTION_DETECTED':
        return <AlertTriangle className="h-4 w-4" />
      case 'CLARIFYING_QUESTION':
        return <HelpCircle className="h-4 w-4" />
      case 'NEXT_STEP':
        return <ArrowRight className="h-4 w-4" />
      default:
        return <Lightbulb className="h-4 w-4" />
    }
  }

  const getSuggestionLabel = (type: string) => {
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

  return (
    <div className="fixed right-0 top-0 h-full w-96 bg-white border-l shadow-lg z-50 flex flex-col">
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <h3 className="font-semibold">{copilotName}</h3>
          <p className="text-xs text-muted-foreground">Live AI assistance</p>
        </div>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {suggestions.length === 0 ? (
          <div className="text-center py-8 text-sm text-muted-foreground">
            Waiting for suggestions...
          </div>
        ) : (
          suggestions.map((suggestion) => (
            <Card key={suggestion.id} className="border-gray-200">
              <CardContent className="p-3">
                <div className="flex items-start gap-2 mb-2">
                  {getSuggestionIcon(suggestion.type)}
                  <span className="text-xs font-medium text-gray-600 flex-1">
                    {getSuggestionLabel(suggestion.type)}
                  </span>
                </div>
                <p className="text-sm text-gray-900 leading-relaxed">
                  {suggestion.content}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      <div className="p-4 border-t bg-gray-50">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          <span>Copilot Active</span>
        </div>
      </div>
    </div>
  )
}



