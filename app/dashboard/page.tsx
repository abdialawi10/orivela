import { redirect } from 'next/navigation'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma'
import { MessageSquare, Phone, Mail, AlertTriangle } from 'lucide-react'

export default async function DashboardPage() {
  const session = await getServerSession()
  if (!session) {
    redirect('/login')
  }

  // Get analytics
  const totalConversations = await prisma.conversation.count()
  const escalatedConversations = await prisma.conversation.count({
    where: { status: 'ESCALATED' },
  })
  const voiceConversations = await prisma.conversation.count({
    where: { channel: 'VOICE' },
  })
  const smsConversations = await prisma.conversation.count({
    where: { channel: 'SMS' },
  })
  const emailConversations = await prisma.conversation.count({
    where: { channel: 'EMAIL' },
  })
  const openConversations = await prisma.conversation.count({
    where: { status: 'OPEN' },
  })

  const stats = [
    {
      title: 'Total Conversations',
      value: totalConversations,
      description: 'All time',
      icon: MessageSquare,
    },
    {
      title: 'Open Conversations',
      value: openConversations,
      description: 'Currently active',
      icon: MessageSquare,
    },
    {
      title: 'Escalations',
      value: escalatedConversations,
      description: 'Requiring attention',
      icon: AlertTriangle,
      variant: 'destructive' as const,
    },
    {
      title: 'Voice Calls',
      value: voiceConversations,
      description: 'Phone conversations',
      icon: Phone,
    },
    {
      title: 'SMS Messages',
      value: smsConversations,
      description: 'Text conversations',
      icon: MessageSquare,
    },
    {
      title: 'Email Threads',
      value: emailConversations,
      description: 'Email conversations',
      icon: Mail,
    },
  ]

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Overview of your AI assistant activity</p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <Card key={stat.title}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    {stat.title}
                  </CardTitle>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                  <p className="text-xs text-muted-foreground">
                    {stat.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </DashboardLayout>
  )
}

