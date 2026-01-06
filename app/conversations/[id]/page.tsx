import { redirect } from 'next/navigation'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { MessageSquare, User, Bot } from 'lucide-react'

export default async function ConversationDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  const conversation = await prisma.conversation.findUnique({
    where: { id: params.id },
    include: {
      contact: true,
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  })

  if (!conversation) {
    return (
      <DashboardLayout>
        <div>Conversation not found</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Conversation Details</h1>
          <p className="text-muted-foreground">
            {conversation.channel} • {conversation.status}
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {conversation.contact.name && (
                <p>
                  <span className="font-medium">Name:</span> {conversation.contact.name}
                </p>
              )}
              {conversation.contact.phone && (
                <p>
                  <span className="font-medium">Phone:</span> {conversation.contact.phone}
                </p>
              )}
              {conversation.contact.email && (
                <p>
                  <span className="font-medium">Email:</span> {conversation.contact.email}
                </p>
              )}
              <p>
                <span className="font-medium">Started:</span>{' '}
                {new Date(conversation.createdAt).toLocaleString()}
              </p>
            </div>
          </CardContent>
        </Card>

        {conversation.summary && (
          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{conversation.summary}</p>
            </CardContent>
          </Card>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Messages</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {conversation.messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'USER' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <div
                  className={`flex h-8 w-8 items-center justify-center rounded-full ${
                    message.role === 'USER'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary text-secondary-foreground'
                  }`}
                >
                  {message.role === 'USER' ? (
                    <User className="h-4 w-4" />
                  ) : (
                    <Bot className="h-4 w-4" />
                  )}
                </div>
                <div
                  className={`flex-1 rounded-lg p-4 ${
                    message.role === 'USER'
                      ? 'bg-muted'
                      : 'bg-primary text-primary-foreground'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.content}</p>
                  <p className="mt-2 text-xs opacity-70">
                    {new Date(message.createdAt).toLocaleString()}
                  </p>
                </div>
              </div>
            ))}
            {conversation.messages.length === 0 && (
              <p className="text-center text-muted-foreground">No messages yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

