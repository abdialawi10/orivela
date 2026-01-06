import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { Calendar, Clock, User, Bot } from 'lucide-react'

export default async function CopilotSessionDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  const copilotSession = await prisma.copilotSession.findUnique({
    where: { id: params.id },
    include: {
      transcripts: {
        orderBy: { timestamp: 'asc' },
      },
      suggestions: {
        orderBy: { timestamp: 'desc' },
      },
    },
  })

  if (!copilotSession || copilotSession.userId !== session.user.id) {
    return (
      <DashboardLayout>
        <div>Session not found</div>
      </DashboardLayout>
    )
  }

  const actionItems = copilotSession.actionItems
    ? JSON.parse(copilotSession.actionItems)
    : []

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Session Details</h1>
          <p className="text-muted-foreground">
            {copilotSession.title || `${copilotSession.mode} Session`}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Mode</div>
              <div className="text-lg font-semibold">{copilotSession.mode}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Duration</div>
              <div className="text-lg font-semibold">
                {copilotSession.endedAt
                  ? `${Math.round(
                      (copilotSession.endedAt.getTime() -
                        copilotSession.startedAt.getTime()) /
                        60000
                    )} minutes`
                  : 'Active'}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-sm text-muted-foreground mb-1">Messages</div>
              <div className="text-lg font-semibold">
                {copilotSession.transcripts.length}
              </div>
            </CardContent>
          </Card>
        </div>

        {copilotSession.summary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap">{copilotSession.summary}</p>
            </CardContent>
          </Card>
        )}

        {actionItems.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Action Items</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1">
                {actionItems.map((item: string, idx: number) => (
                  <li key={idx} className="text-sm">
                    {item}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {copilotSession.followUpEmail && (
          <Card>
            <CardHeader>
              <CardTitle>Follow-Up Email Draft</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-gray-50 rounded-lg p-4">
                <pre className="text-sm whitespace-pre-wrap font-sans">
                  {copilotSession.followUpEmail}
                </pre>
              </div>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Transcript</CardTitle>
            <CardDescription>
              Full conversation transcript
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {copilotSession.transcripts.map((transcript) => (
                <div
                  key={transcript.id}
                  className={`flex gap-3 ${
                    transcript.speaker === 'user' ? 'flex-row' : 'flex-row-reverse'
                  }`}
                >
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      transcript.speaker === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-secondary text-secondary-foreground'
                    }`}
                  >
                    {transcript.speaker === 'user' ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={`flex-1 rounded-lg p-3 ${
                      transcript.speaker === 'user'
                        ? 'bg-muted'
                        : 'bg-primary text-primary-foreground'
                    }`}
                  >
                    <p className="text-sm">{transcript.text}</p>
                    <p className="text-xs opacity-70 mt-1">
                      {new Date(transcript.timestamp).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {copilotSession.transcripts.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No transcript available
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Suggestions Generated</CardTitle>
            <CardDescription>
              AI suggestions provided during the session
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {copilotSession.suggestions.map((suggestion) => (
                <div
                  key={suggestion.id}
                  className="border rounded-lg p-3 text-sm"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-gray-600">
                      {suggestion.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(suggestion.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                  <p>{suggestion.content}</p>
                </div>
              ))}
              {copilotSession.suggestions.length === 0 && (
                <p className="text-center text-muted-foreground">
                  No suggestions generated
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}


