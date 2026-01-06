'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'

export default function SettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState({
    name: '',
    businessHours: '',
    services: '',
    pricingNotes: '',
    escalationPhone: '',
    escalationEmail: '',
    tone: 'friendly, professional, concise',
    calendlyApiKey: '',
    calendlyUserUri: '',
    calendlyEventType: '',
    calendlyLink: '',
    timezone: 'America/New_York',
    // AI Persona
    aiPersonaName: 'Assistant',
    aiPersonaVoice: 'professional',
    aiPersonaTone: '',
    // Web Search
    enableWebSearch: false,
    webSearchProvider: 'openai',
    // CRM
    crmProvider: '',
    crmApiKey: '',
    crmApiUrl: '',
    crmAccountId: '',
    autoSyncToCrm: false,
    // Task Management
    taskProvider: '',
    taskApiKey: '',
    taskWorkspaceId: '',
    autoCreateTasks: false,
  })

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/settings')
      if (res.ok) {
        const data = await res.json()
        setSettings({
          name: data.name || '',
          businessHours: data.businessHours || '',
          services: Array.isArray(data.services) ? data.services.join(', ') : data.services || '',
          pricingNotes: data.pricingNotes || '',
          escalationPhone: data.escalationPhone || '',
          escalationEmail: data.escalationEmail || '',
          tone: data.tone || 'friendly, professional, concise',
          calendlyApiKey: data.calendlyApiKey || '',
          calendlyUserUri: data.calendlyUserUri || '',
          calendlyEventType: data.calendlyEventType || '',
          calendlyLink: data.calendlyLink || '',
          timezone: data.timezone || 'America/New_York',
          aiPersonaName: data.aiPersonaName || 'Assistant',
          aiPersonaVoice: data.aiPersonaVoice || 'professional',
          aiPersonaTone: data.aiPersonaTone || '',
          enableWebSearch: data.enableWebSearch ?? false,
          webSearchProvider: data.webSearchProvider || 'openai',
          crmProvider: data.crmProvider || '',
          crmApiKey: data.crmApiKey || '',
          crmApiUrl: data.crmApiUrl || '',
          crmAccountId: data.crmAccountId || '',
          autoSyncToCrm: data.autoSyncToCrm ?? false,
          taskProvider: data.taskProvider || '',
          taskApiKey: data.taskApiKey || '',
          taskWorkspaceId: data.taskWorkspaceId || '',
          autoCreateTasks: data.autoCreateTasks ?? false,
        })
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      })

      if (res.ok) {
        alert('Settings saved successfully!')
      } else {
        alert('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
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
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your business settings</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Business Information</CardTitle>
            <CardDescription>Configure how your AI assistant behaves</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">Business Name</Label>
                <Input
                  id="name"
                  value={settings.name}
                  onChange={(e) => setSettings({ ...settings, name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="businessHours">Business Hours (JSON format)</Label>
                <Textarea
                  id="businessHours"
                  value={settings.businessHours}
                  onChange={(e) => setSettings({ ...settings, businessHours: e.target.value })}
                  placeholder='{"monday": {"open": "09:00", "close": "17:00"}, ...}'
                  rows={6}
                />
                <p className="text-sm text-muted-foreground">
                  Enter business hours in JSON format. Example: {"{ \"monday\": { \"open\": \"09:00\", \"close\": \"17:00\" } }"}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="services">Services (comma-separated)</Label>
                <Input
                  id="services"
                  value={settings.services}
                  onChange={(e) => setSettings({ ...settings, services: e.target.value })}
                  placeholder="Consultation, Support, Sales"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pricingNotes">Pricing Notes</Label>
                <Textarea
                  id="pricingNotes"
                  value={settings.pricingNotes}
                  onChange={(e) => setSettings({ ...settings, pricingNotes: e.target.value })}
                  placeholder="General pricing information or notes"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">AI Tone</Label>
                <Input
                  id="tone"
                  value={settings.tone}
                  onChange={(e) => setSettings({ ...settings, tone: e.target.value })}
                  placeholder="friendly, professional, concise"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalationPhone">Escalation Phone</Label>
                <Input
                  id="escalationPhone"
                  type="tel"
                  value={settings.escalationPhone}
                  onChange={(e) => setSettings({ ...settings, escalationPhone: e.target.value })}
                  placeholder="+1234567890"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="escalationEmail">Escalation Email</Label>
                <Input
                  id="escalationEmail"
                  type="email"
                  value={settings.escalationEmail}
                  onChange={(e) => setSettings({ ...settings, escalationEmail: e.target.value })}
                  placeholder="admin@example.com"
                />
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Calendly Integration</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="calendlyLink">Public Calendly Link (Recommended)</Label>
                    <Input
                      id="calendlyLink"
                      type="url"
                      value={settings.calendlyLink}
                      onChange={(e) => setSettings({ ...settings, calendlyLink: e.target.value })}
                      placeholder="https://calendly.com/yourusername/event"
                    />
                    <p className="text-sm text-muted-foreground">
                      Your public Calendly scheduling page. This is the easiest option.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calendlyApiKey">Calendly API Key (Optional)</Label>
                    <Input
                      id="calendlyApiKey"
                      type="password"
                      value={settings.calendlyApiKey}
                      onChange={(e) => setSettings({ ...settings, calendlyApiKey: e.target.value })}
                      placeholder="Your Calendly API key"
                    />
                    <p className="text-sm text-muted-foreground">
                      Optional: For advanced features like fetching available slots.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="calendlyUserUri">Calendly User URI (Optional)</Label>
                    <Input
                      id="calendlyUserUri"
                      type="url"
                      value={settings.calendlyUserUri}
                      onChange={(e) => setSettings({ ...settings, calendlyUserUri: e.target.value })}
                      placeholder="https://api.calendly.com/users/..."
                    />
                    <p className="text-sm text-muted-foreground">
                      Get this from your Calendly API settings.
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timezone">Business Timezone</Label>
                    <select
                      id="timezone"
                      value={settings.timezone}
                      onChange={(e) => setSettings({ ...settings, timezone: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="America/New_York">Eastern Time (ET)</option>
                      <option value="America/Chicago">Central Time (CT)</option>
                      <option value="America/Denver">Mountain Time (MT)</option>
                      <option value="America/Los_Angeles">Pacific Time (PT)</option>
                      <option value="Europe/London">London (GMT)</option>
                      <option value="Europe/Paris">Paris (CET)</option>
                      <option value="Asia/Tokyo">Tokyo (JST)</option>
                      <option value="Australia/Sydney">Sydney (AEST)</option>
                      <option value="UTC">UTC</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">AI Persona</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="aiPersonaName">AI Assistant Name</Label>
                    <Input
                      id="aiPersonaName"
                      value={settings.aiPersonaName}
                      onChange={(e) => setSettings({ ...settings, aiPersonaName: e.target.value })}
                      placeholder="Assistant"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aiPersonaVoice">Voice Style</Label>
                    <select
                      id="aiPersonaVoice"
                      value={settings.aiPersonaVoice}
                      onChange={(e) => setSettings({ ...settings, aiPersonaVoice: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="professional">Professional</option>
                      <option value="friendly">Friendly</option>
                      <option value="casual">Casual</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="aiPersonaTone">Custom Tone (Optional)</Label>
                    <Input
                      id="aiPersonaTone"
                      value={settings.aiPersonaTone}
                      onChange={(e) => setSettings({ ...settings, aiPersonaTone: e.target.value })}
                      placeholder="Overrides default tone if set"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Web Search</h3>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enableWebSearch"
                      checked={settings.enableWebSearch}
                      onChange={(e) => setSettings({ ...settings, enableWebSearch: e.target.checked })}
                      className="rounded"
                    />
                    <Label htmlFor="enableWebSearch">Enable Real-Time Web Search</Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Allow AI to search the web for current information beyond your knowledge base.
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">CRM Integration</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="crmProvider">CRM Provider</Label>
                    <select
                      id="crmProvider"
                      value={settings.crmProvider}
                      onChange={(e) => setSettings({ ...settings, crmProvider: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">None</option>
                      <option value="hubspot">HubSpot</option>
                      <option value="salesforce">Salesforce</option>
                      <option value="pipedrive">Pipedrive</option>
                    </select>
                  </div>

                  {settings.crmProvider && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="crmApiKey">CRM API Key</Label>
                        <Input
                          id="crmApiKey"
                          type="password"
                          value={settings.crmApiKey}
                          onChange={(e) => setSettings({ ...settings, crmApiKey: e.target.value })}
                          placeholder="Your CRM API key"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="crmApiUrl">CRM API URL (Optional)</Label>
                        <Input
                          id="crmApiUrl"
                          type="url"
                          value={settings.crmApiUrl}
                          onChange={(e) => setSettings({ ...settings, crmApiUrl: e.target.value })}
                          placeholder="https://api.example.com"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoSyncToCrm"
                          checked={settings.autoSyncToCrm}
                          onChange={(e) => setSettings({ ...settings, autoSyncToCrm: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="autoSyncToCrm">Automatically sync conversations to CRM</Label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <div className="pt-6 border-t">
                <h3 className="text-lg font-semibold mb-4">Task Management</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="taskProvider">Task Provider</Label>
                    <select
                      id="taskProvider"
                      value={settings.taskProvider}
                      onChange={(e) => setSettings({ ...settings, taskProvider: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">None</option>
                      <option value="notion">Notion</option>
                      <option value="asana">Asana</option>
                      <option value="trello">Trello</option>
                    </select>
                  </div>

                  {settings.taskProvider && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="taskApiKey">Task API Key</Label>
                        <Input
                          id="taskApiKey"
                          type="password"
                          value={settings.taskApiKey}
                          onChange={(e) => setSettings({ ...settings, taskApiKey: e.target.value })}
                          placeholder="Your task management API key"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="taskWorkspaceId">Workspace/List ID (Optional)</Label>
                        <Input
                          id="taskWorkspaceId"
                          value={settings.taskWorkspaceId}
                          onChange={(e) => setSettings({ ...settings, taskWorkspaceId: e.target.value })}
                          placeholder="Workspace or list identifier"
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id="autoCreateTasks"
                          checked={settings.autoCreateTasks}
                          onChange={(e) => setSettings({ ...settings, autoCreateTasks: e.target.checked })}
                          className="rounded"
                        />
                        <Label htmlFor="autoCreateTasks">Automatically create tasks from conversations</Label>
                      </div>
                    </>
                  )}
                </div>
              </div>

              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}





