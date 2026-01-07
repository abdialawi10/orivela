'use client'

import { useState, useEffect, useCallback } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import Link from 'next/link'
import { Phone, MessageSquare, Mail, ArrowRight } from 'lucide-react'

interface Conversation {
  id: string
  channel: 'VOICE' | 'SMS' | 'EMAIL'
  status: 'OPEN' | 'RESOLVED' | 'ESCALATED'
  summary: string | null
  createdAt: string
  contact: {
    phone: string | null
    email: string | null
    name: string | null
  }
}

export default function ConversationsPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'ALL' | 'VOICE' | 'SMS' | 'EMAIL'>('ALL')

  const fetchConversations = useCallback(async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== 'ALL') {
        params.append('channel', filter)
      }
      const res = await fetch(`/api/conversations?${params.toString()}`)
      if (res.ok) {
        const data = await res.json()
        setConversations(data)
      }
    } catch (error) {
      console.error('Failed to fetch conversations:', error)
    } finally {
      setLoading(false)
    }
  }, [filter])

  useEffect(() => {
    fetchConversations()
  }, [fetchConversations])

  const getChannelIcon = (channel: string) => {
    switch (channel) {
      case 'VOICE':
        return <Phone className="h-4 w-4" />
      case 'SMS':
        return <MessageSquare className="h-4 w-4" />
      case 'EMAIL':
        return <Mail className="h-4 w-4" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-blue-100 text-blue-800'
      case 'RESOLVED':
        return 'bg-green-100 text-green-800'
      case 'ESCALATED':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div>Loading...</div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Conversations</h1>
          <p className="text-muted-foreground">View and manage all conversations</p>
        </div>

        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)}>
          <TabsList>
            <TabsTrigger value="ALL">All</TabsTrigger>
            <TabsTrigger value="VOICE">Voice</TabsTrigger>
            <TabsTrigger value="SMS">SMS</TabsTrigger>
            <TabsTrigger value="EMAIL">Email</TabsTrigger>
          </TabsList>
        </Tabs>

        <div className="space-y-4">
          {conversations.map((conv) => (
            <Link key={conv.id} href={`/conversations/${conv.id}`}>
              <Card className="hover:bg-accent transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {getChannelIcon(conv.channel)}
                        <span className="font-medium">{conv.channel}</span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                            conv.status
                          )}`}
                        >
                          {conv.status}
                        </span>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {conv.contact.name && <span>{conv.contact.name} • </span>}
                        {conv.contact.phone && <span>{conv.contact.phone}</span>}
                        {conv.contact.email && <span>{conv.contact.email}</span>}
                      </div>
                      {conv.summary && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {conv.summary}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(conv.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
          {conversations.length === 0 && (
            <Card>
              <CardContent className="py-8 text-center text-muted-foreground">
                No conversations found.
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}








