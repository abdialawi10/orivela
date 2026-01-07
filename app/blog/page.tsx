import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandName, brandFullName } from '@/lib/brand'
import { Calendar, ArrowRight } from 'lucide-react'

export default function BlogPage() {
  const posts = [
    {
      title: '5 Ways AI Can Improve Your Customer Service',
      excerpt: 'Learn how AI assistants can transform your customer service operations and increase satisfaction.',
      date: '2024-01-15',
      category: 'Customer Service',
    },
    {
      title: 'The Future of Business Communication',
      excerpt: 'Exploring how AI is reshaping how businesses communicate with customers in 2024 and beyond.',
      date: '2024-01-10',
      category: 'Technology',
    },
    {
      title: 'Getting Started with AI Voice Assistants',
      excerpt: 'A comprehensive guide to implementing AI voice assistants for your business.',
      date: '2024-01-05',
      category: 'Guides',
    },
    {
      title: 'Multilingual Support: Why It Matters',
      excerpt: 'Discover why offering support in multiple languages is crucial for global businesses.',
      date: '2023-12-28',
      category: 'Business',
    },
    {
      title: 'ROI of AI Customer Service Tools',
      excerpt: 'Calculate the return on investment for AI-powered customer service solutions.',
      date: '2023-12-20',
      category: 'Business',
    },
    {
      title: 'Integrating AI with Your Existing CRM',
      excerpt: 'Step-by-step guide to connecting AI assistants with popular CRM platforms.',
      date: '2023-12-15',
      category: 'Guides',
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="text-2xl font-bold">
              {brandName}
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/features"><Button variant="ghost">Features</Button></Link>
              <Link href="/integrations"><Button variant="ghost">Integrations</Button></Link>
              <Link href="/pricing"><Button variant="ghost">Pricing</Button></Link>
              <Link href="/login"><Button>Sign In</Button></Link>
              <Link href="/pricing"><Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button></Link>
            </div>
          </div>
        </div>
      </nav>

      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Blog
          </h1>
          <p className="text-xl text-gray-600">
            Insights, guides, and updates from the {brandFullName} team
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {posts.map((post, idx) => (
              <article key={idx} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <span className="text-sm text-blue-600 font-medium">{post.category}</span>
                  <h2 className="text-xl font-bold mt-2 mb-3">{post.title}</h2>
                  <p className="text-gray-600 mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(post.date).toLocaleDateString('en-US', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })}
                    </div>
                    <Link href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`} className="text-blue-600 hover:text-blue-700 flex items-center gap-1">
                      Read more <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-600">
          <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}


