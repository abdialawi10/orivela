import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandName, brandFullName } from '@/lib/brand'
import { Search, HelpCircle, Book, MessageSquare, ChevronRight } from 'lucide-react'

export default function HelpCenterPage() {
  const categories = [
    {
      title: 'Getting Started',
      articles: [
        'How do I set up my first AI assistant?',
        'What information do I need to get started?',
        'How long does setup take?',
      ],
    },
    {
      title: 'Voice Calls',
      articles: [
        'How do I connect my phone number?',
        'Can the AI handle multiple calls at once?',
        'How do I test voice calls?',
      ],
    },
    {
      title: 'SMS & Email',
      articles: [
        'How do I configure SMS notifications?',
        'Setting up email automation',
        'Can I customize email templates?',
      ],
    },
    {
      title: 'Billing & Plans',
      articles: [
        'How does the free trial work?',
        'Can I change plans anytime?',
        'What payment methods do you accept?',
      ],
    },
    {
      title: 'Troubleshooting',
      articles: [
        'AI not responding correctly',
        'Integration connection issues',
        'Performance optimization tips',
      ],
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
              <Link href="/help"><Button variant="ghost">Help Center</Button></Link>
              <Link href="/docs"><Button variant="ghost">Documentation</Button></Link>
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
            Help Center
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Find answers to common questions and learn how to get the most out of {brandFullName}
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search for help articles..."
                className="w-full pl-12 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {categories.map((category, idx) => (
              <div key={idx} className="border rounded-lg p-6">
                <div className="flex items-center gap-3 mb-4">
                  <HelpCircle className="w-6 h-6 text-blue-600" />
                  <h2 className="text-xl font-bold">{category.title}</h2>
                </div>
                <ul className="space-y-3">
                  {category.articles.map((article, aIdx) => (
                    <li key={aIdx}>
                      <Link 
                        href={`/help/article/${article.toLowerCase().replace(/\s+/g, '-')}`}
                        className="flex items-center justify-between text-gray-700 hover:text-blue-600 group"
                      >
                        <span>{article}</span>
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-8">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-6 h-6 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">Still need help?</h2>
                <p className="text-gray-600 mb-4">
                  Can&apos;t find what you&apos;re looking for? Our support team is here to help you 24/7.
                </p>
                <div className="flex gap-4">
                  <Link href="/contact">
                    <Button className="bg-blue-600 hover:bg-blue-700">
                      Contact Support
                    </Button>
                  </Link>
                  <Link href="/docs">
                    <Button variant="outline">
                      View Documentation
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
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


