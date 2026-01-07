'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard/layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Plus, Trash2, Edit2 } from 'lucide-react'

interface KnowledgeBaseItem {
  id: string
  type: 'FAQ' | 'DOC'
  title: string
  question?: string | null
  answer?: string | null
  content?: string | null
}

export default function KnowledgeBasePage() {
  const [items, setItems] = useState<KnowledgeBaseItem[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    type: 'FAQ' as 'FAQ' | 'DOC',
    title: '',
    question: '',
    answer: '',
    content: '',
  })

  useEffect(() => {
    fetchItems()
  }, [])

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/knowledge-base')
      if (res.ok) {
        const data = await res.json()
        setItems(data)
      }
    } catch (error) {
      console.error('Failed to fetch items:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const res = await fetch('/api/knowledge-base', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchItems()
        resetForm()
      } else {
        alert('Failed to create item')
      }
    } catch (error) {
      console.error('Failed to create item:', error)
      alert('Failed to create item')
    }
  }

  const handleUpdate = async (id: string) => {
    try {
      const res = await fetch(`/api/knowledge-base/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        fetchItems()
        setEditingId(null)
        resetForm()
      } else {
        alert('Failed to update item')
      }
    } catch (error) {
      console.error('Failed to update item:', error)
      alert('Failed to update item')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this item?')) return

    try {
      const res = await fetch(`/api/knowledge-base/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        fetchItems()
      } else {
        alert('Failed to delete item')
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
      alert('Failed to delete item')
    }
  }

  const startEdit = (item: KnowledgeBaseItem) => {
    setEditingId(item.id)
    setFormData({
      type: item.type,
      title: item.title,
      question: item.question || '',
      answer: item.answer || '',
      content: item.content || '',
    })
  }

  const resetForm = () => {
    setFormData({
      type: 'FAQ',
      title: '',
      question: '',
      answer: '',
      content: '',
    })
    setEditingId(null)
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
          <h1 className="text-3xl font-bold">Knowledge Base</h1>
          <p className="text-muted-foreground">Manage FAQs and documentation</p>
        </div>

        <Tabs defaultValue="list" className="w-full">
          <TabsList>
            <TabsTrigger value="list">View All</TabsTrigger>
            <TabsTrigger value="create">
              {editingId ? 'Edit Item' : 'Create New'}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="list" className="space-y-4">
            {items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {item.type === 'FAQ' ? '❓' : '📄'} {item.title}
                        <span className="text-sm font-normal text-muted-foreground">
                          ({item.type})
                        </span>
                      </CardTitle>
                      {item.type === 'FAQ' && item.question && (
                        <CardDescription>Q: {item.question}</CardDescription>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(item)}
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {item.type === 'FAQ' ? (
                    <div>
                      <p className="font-medium">Answer:</p>
                      <p className="text-muted-foreground">{item.answer}</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">{item.content}</p>
                  )}
                </CardContent>
              </Card>
            ))}
            {items.length === 0 && (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No knowledge base items yet. Create one to get started.
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="create">
            <Card>
              <CardHeader>
                <CardTitle>{editingId ? 'Edit Item' : 'Create New Item'}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="type">Type</Label>
                  <select
                    id="type"
                    value={formData.type}
                    onChange={(e) =>
                      setFormData({ ...formData, type: e.target.value as 'FAQ' | 'DOC' })
                    }
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="FAQ">FAQ</option>
                    <option value="DOC">Document</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>

                {formData.type === 'FAQ' ? (
                  <>
                    <div className="space-y-2">
                      <Label htmlFor="question">Question</Label>
                      <Input
                        id="question"
                        value={formData.question}
                        onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="answer">Answer</Label>
                      <Textarea
                        id="answer"
                        value={formData.answer}
                        onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
                        rows={4}
                        required
                      />
                    </div>
                  </>
                ) : (
                  <div className="space-y-2">
                    <Label htmlFor="content">Content</Label>
                    <Textarea
                      id="content"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={8}
                      required
                    />
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      if (editingId) {
                        handleUpdate(editingId)
                      } else {
                        handleCreate()
                      }
                    }}
                  >
                    {editingId ? 'Update' : 'Create'}
                  </Button>
                  {editingId && (
                    <Button variant="outline" onClick={resetForm}>
                      Cancel
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  )
}








