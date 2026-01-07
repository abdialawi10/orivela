import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandName } from '@/lib/brand'
import { 
  Phone, MessageSquare, Mail, Zap, Globe, TrendingUp, 
  Shield, Users, Calendar, Brain, Search, BarChart3,
  Sparkles, HeadphonesIcon
} from 'lucide-react'

export default function FeaturesPage() {
  const features = [
    {
      category: 'Communication Channels',
      items: [
        {
          icon: Phone,
          title: 'Voice Call AI Agent',
          description: 'Handle incoming calls with AI-powered voice agent that understands natural language and responds intelligently.',
          plan: 'Professional+',
        },
        {
          icon: MessageSquare,
          title: 'SMS & Text Messaging',
          description: 'Automated SMS responses with full context awareness. Never leave a customer waiting for a reply.',
          plan: 'Starter+',
        },
        {
          icon: Mail,
          title: 'Email Automation',
          description: 'AI-generated email drafts and automated replies that sound professional and human-like.',
          plan: 'Starter+',
        },
      ],
    },
    {
      category: 'AI Intelligence',
      items: [
        {
          icon: Brain,
          title: 'AI Copilot',
          description: 'Real-time AI assistance during live calls with suggestions, talking points, and post-call summaries.',
          plan: 'Professional+',
        },
        {
          icon: Search,
          title: 'Real-Time Web Search',
          description: 'AI can search the web for current information beyond your knowledge base to answer customer questions.',
          plan: 'Enterprise',
        },
        {
          icon: Sparkles,
          title: 'Predictive Suggestions',
          description: 'AI analyzes conversation patterns to suggest upsells, follow-ups, and proactive support actions.',
          plan: 'Enterprise',
        },
      ],
    },
    {
      category: 'Integration & Automation',
      items: [
        {
          icon: Calendar,
          title: 'Calendly Integration',
          description: 'Automatically schedule appointments and share available time slots with customers.',
          plan: 'Professional+',
        },
        {
          icon: Users,
          title: 'CRM Integrations',
          description: 'Sync contacts, deals, and conversations with HubSpot, Salesforce, or Pipedrive.',
          plan: 'Business+',
        },
        {
          icon: BarChart3,
          title: 'Task Management',
          description: 'Automatically convert conversation points into tasks in Notion, Asana, or Trello.',
          plan: 'Business+',
        },
      ],
    },
    {
      category: 'Analytics & Insights',
      items: [
        {
          icon: TrendingUp,
          title: 'Advanced Analytics',
          description: 'Track conversations, sentiment, trends, and revenue impact. Make data-driven decisions.',
          plan: 'All Plans',
        },
        {
          icon: HeadphonesIcon,
          title: 'Sentiment Detection',
          description: 'Real-time sentiment and emotion detection for prioritization and escalation.',
          plan: 'Business+',
        },
        {
          icon: BarChart3,
          title: 'Performance Benchmarks',
          description: 'Compare AI vs human response times, resolution rates, and escalation patterns.',
          plan: 'Business+',
        },
      ],
    },
    {
      category: 'Personalization',
      items: [
        {
          icon: Globe,
          title: '20 Languages Supported',
          description: 'Automatic language detection and translation. Serve customers in their preferred language.',
          plan: 'All Plans',
        },
        {
          icon: Zap,
          title: 'Custom AI Persona',
          description: 'Customize AI name, voice style, and tone to match your brand personality.',
          plan: 'Business+',
        },
        {
          icon: Shield,
          title: 'Smart Escalation',
          description: 'Automatically detect when customers need human help and escalate appropriately.',
          plan: 'All Plans',
        },
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
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

      {/* Hero */}
      <section className="bg-gradient-to-b from-blue-50 to-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Powerful Features for Modern Businesses
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Everything you need to automate customer communications and provide exceptional service 24/7.
          </p>
        </div>
      </section>

      {/* Features */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {features.map((category, idx) => (
            <div key={idx} className="mb-16">
              <h2 className="text-3xl font-bold mb-8">{category.category}</h2>
              <div className="grid md:grid-cols-3 gap-8">
                {category.items.map((feature, fIdx) => {
                  const Icon = feature.icon
                  return (
                    <div key={fIdx} className="bg-white border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                        <Icon className="w-6 h-6 text-blue-600" />
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                      <p className="text-gray-600 mb-4">{feature.description}</p>
                      <span className="text-sm text-gray-500">{feature.plan}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to get started?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Start your free trial today. No credit card required.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}


