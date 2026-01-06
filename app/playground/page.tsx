'use client'

import { useState } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Send, Mail } from 'lucide-react'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export default function PlaygroundPage() {
  const [smsMessages, setSmsMessages] = useState<Message[]>([])
  const [emailData, setEmailData] = useState({
    from: '',
    subject: '',
    body: '',
  })
  const [smsInput, setSmsInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [phone, setPhone] = useState('+1234567890')

  const handleSmsSend = async () => {
    if (!smsInput.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: smsInput,
      timestamp: new Date(),
    }

    setSmsMessages((prev) => [...prev, userMessage])
    setSmsInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'SMS',
          userText: userMessage.content,
          phone,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.response,
          timestamp: new Date(),
        }
        setSmsMessages((prev) => [...prev, assistantMessage])
      } else {
        alert('Failed to get response')
      }
    } catch (error) {
      console.error('Failed to send SMS:', error)
      alert('Failed to send SMS')
    } finally {
      setLoading(false)
    }
  }

  const handleEmailGenerate = async () => {
    if (!emailData.from || !emailData.subject || !emailData.body) {
      alert('Please fill in all email fields')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/ai/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channel: 'EMAIL',
          userText: `Subject: ${emailData.subject}\n\n${emailData.body}`,
          email: emailData.from,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        // In a real implementation, you'd show the generated reply
        alert(`Generated reply:\n\n${data.response}`)
      } else {
        alert('Failed to generate reply')
      }
    } catch (error) {
      console.error('Failed to generate email reply:', error)
      alert('Failed to generate email reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div>
          <h1 className="text-3xl font-bold">Playground</h1>
          <p className="text-muted-foreground">
            Test SMS and email conversations without Twilio
          </p>
        </div>

        <Tabs defaultValue="sms" className="w-full">
          <TabsList>
            <TabsTrigger value="sms">SMS Simulation</TabsTrigger>
            <TabsTrigger value="email">Email Draft</TabsTrigger>
          </TabsList>

          <TabsContent value="sms">
            <Card>
              <CardHeader>
                <CardTitle>SMS Conversation</CardTitle>
                <CardDescription>Simulate an SMS conversation</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+1234567890"
                  />
                </div>

                <div className="border rounded-lg p-4 h-96 overflow-y-auto bg-muted/50 space-y-4">
                  {smsMessages.length === 0 ? (
                    <p className="text-center text-muted-foreground">
                      Start a conversation by sending a message below
                    </p>
                  ) : (
                    smsMessages.map((msg, idx) => (
                      <div
                        key={idx}
                        className={`flex ${
                          msg.role === 'user' ? 'justify-end' : 'justify-start'
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === 'user'
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{msg.content}</p>
                          <p className="text-xs opacity-70 mt-1">
                            {msg.timestamp.toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                <div className="flex gap-2">
                  <Input
                    value={smsInput}
                    onChange={(e) => setSmsInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault()
                        handleSmsSend()
                      }
                    }}
                    placeholder="Type your message..."
                    disabled={loading}
                  />
                  <Button onClick={handleSmsSend} disabled={loading}>
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="email">
            <Card>
              <CardHeader>
                <CardTitle>Email Draft Generator</CardTitle>
                <CardDescription>
                  Paste an inbound email and generate a reply
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email-from">From (Email Address)</Label>
                  <Input
                    id="email-from"
                    type="email"
                    value={emailData.from}
                    onChange={(e) =>
                      setEmailData({ ...emailData, from: e.target.value })
                    }
                    placeholder="customer@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input
                    id="email-subject"
                    value={emailData.subject}
                    onChange={(e) =>
                      setEmailData({ ...emailData, subject: e.target.value })
                    }
                    placeholder="Email subject"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email-body">Email Body</Label>
                  <Textarea
                    id="email-body"
                    value={emailData.body}
                    onChange={(e) =>
                      setEmailData({ ...emailData, body: e.target.value })
                    }
                    placeholder="Paste the email content here..."
                    rows={8}
                  />
                </div>

                <Button
                  onClick={handleEmailGenerate}
                  disabled={loading}
                  className="w-full"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  {loading ? 'Generating...' : 'Generate Reply'}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}






