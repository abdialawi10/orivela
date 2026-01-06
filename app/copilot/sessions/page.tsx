import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { redirect } from 'next/navigation'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { Calendar, Clock, MessageSquare } from 'lucide-react'

export default async function CopilotSessionsPage() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  const copilotSessions = await prisma.copilotSession.findMany({
    where: { userId: session.user.id },
    orderBy: { startedAt: 'desc' },
    take: 50,
    include: {
      _count: {
        select: {
          transcripts: true,
          suggestions: true,
        },
      },
    },
  })

  const getModeColor = (mode: string) => {
    switch (mode) {
      case 'SALES':
        return 'bg-blue-100 text-blue-800'
      case 'SUPPORT':
        return 'bg-green-100 text-green-800'
      case 'MEETING':
        return 'bg-purple-100 text-purple-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800'
      case 'ENDED':
        return 'bg-gray-100 text-gray-800'
      case 'PAUSED':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Copilot Sessions</h1>
          <p className="text-muted-foreground">
            View and manage your Kotae Copilot sessions
          </p>
        </div>

        <div className="grid gap-4">
          {copilotSessions.map((session) => (
            <Link key={session.id} href={`/copilot/sessions/${session.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold">
                          {session.title || `${session.mode} Session`}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getModeColor(
                            session.mode
                          )}`}
                        >
                          {session.mode}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            session.status
                          )}`}
                        >
                          {session.status}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(session.startedAt).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          {session.endedAt
                            ? `${Math.round(
                                (session.endedAt.getTime() -
                                  session.startedAt.getTime()) /
                                  60000
                              )} min`
                            : 'Active'}
                        </div>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          {session._count.transcripts} messages
                        </div>
                      </div>
                      {session.summary && (
                        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
                          {session.summary}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {copilotSessions.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No copilot sessions yet. Start a session to begin.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}


