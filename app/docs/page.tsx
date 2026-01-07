import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandName, brandFullName } from '@/lib/brand'
import { Book, Code, Settings, MessageSquare, Phone, Mail, Search } from 'lucide-react'

export default function DocumentationPage() {
  const sections = [
    {
      title: 'Getting Started',
      icon: Book,
      items: [
        { title: 'Introduction', href: '/docs/introduction' },
        { title: 'Quick Start Guide', href: '/docs/quick-start' },
        { title: 'Installation', href: '/docs/installation' },
        { title: 'Configuration', href: '/docs/configuration' },
      ],
    },
    {
      title: 'API Reference',
      icon: Code,
      items: [
        { title: 'Authentication', href: '/docs/api/authentication' },
        { title: 'Conversations API', href: '/docs/api/conversations' },
        { title: 'Webhooks', href: '/docs/api/webhooks' },
        { title: 'Rate Limits', href: '/docs/api/rate-limits' },
      ],
    },
    {
      title: 'Integrations',
      icon: Settings,
      items: [
        { title: 'Twilio Setup', href: '/docs/integrations/twilio' },
        { title: 'SendGrid Setup', href: '/docs/integrations/sendgrid' },
        { title: 'CRM Integration', href: '/docs/integrations/crm' },
        { title: 'Calendly Integration', href: '/docs/integrations/calendly' },
      ],
    },
    {
      title: 'Guides',
      icon: MessageSquare,
      items: [
        { title: 'Voice Call Setup', href: '/docs/guides/voice-calls' },
        { title: 'SMS Configuration', href: '/docs/guides/sms' },
        { title: 'Email Automation', href: '/docs/guides/email' },
        { title: 'Knowledge Base', href: '/docs/guides/knowledge-base' },
      ],
    },
  ]

  const quickLinks = [
    { title: 'API Keys Guide', icon: Settings, href: '/docs/api-keys' },
    { title: 'Troubleshooting', icon: Search, href: '/docs/troubleshooting' },
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
            Documentation
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to get started with {brandFullName}
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            {sections.map((section, idx) => {
              const Icon = section.icon
              return (
                <div key={idx} className="border rounded-lg p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-blue-600" />
                    </div>
                    <h2 className="text-xl font-bold">{section.title}</h2>
                  </div>
                  <ul className="space-y-2">
                    {section.items.map((item, iIdx) => (
                      <li key={iIdx}>
                        <Link 
                          href={item.href} 
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )
            })}
          </div>

          <div className="border-t pt-8">
            <h2 className="text-2xl font-bold mb-6">Quick Links</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {quickLinks.map((link, idx) => {
                const Icon = link.icon
                return (
                  <Link
                    key={idx}
                    href={link.href}
                    className="border rounded-lg p-4 hover:shadow-lg transition-shadow flex items-center gap-4"
                  >
                    <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                      <Icon className="w-5 h-5 text-gray-600" />
                    </div>
                    <span className="font-medium">{link.title}</span>
                  </Link>
                )
              })}
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


