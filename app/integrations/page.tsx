import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandName, brandFullName } from '@/lib/brand'
import { 
  Calendar, Users, BarChart3, MessageSquare, 
  Database, Phone, Mail, CheckCircle2
} from 'lucide-react'

export default function IntegrationsPage() {
  const integrations = [
    {
      category: 'Scheduling',
      items: [
        {
          name: 'Calendly',
          description: 'Automatically schedule appointments and share available time slots.',
          icon: Calendar,
          status: 'Available',
        },
      ],
    },
    {
      category: 'CRM',
      items: [
        {
          name: 'HubSpot',
          description: 'Sync contacts, deals, and conversations with HubSpot CRM.',
          icon: Users,
          status: 'Available',
        },
        {
          name: 'Salesforce',
          description: 'Integrate with Salesforce to manage customer relationships.',
          icon: Users,
          status: 'Available',
        },
        {
          name: 'Pipedrive',
          description: 'Connect with Pipedrive for sales pipeline management.',
          icon: Users,
          status: 'Available',
        },
      ],
    },
    {
      category: 'Task Management',
      items: [
        {
          name: 'Notion',
          description: 'Automatically create tasks and notes from conversations.',
          icon: BarChart3,
          status: 'Available',
        },
        {
          name: 'Asana',
          description: 'Convert conversation points into Asana tasks.',
          icon: BarChart3,
          status: 'Available',
        },
        {
          name: 'Trello',
          description: 'Create Trello cards from customer interactions.',
          icon: BarChart3,
          status: 'Available',
        },
      ],
    },
    {
      category: 'Communication',
      items: [
        {
          name: 'Twilio',
          description: 'Voice and SMS communication via Twilio.',
          icon: Phone,
          status: 'Built-in',
        },
        {
          name: 'SendGrid',
          description: 'Email delivery and automation via SendGrid.',
          icon: Mail,
          status: 'Built-in',
        },
      ],
    },
    {
      category: 'AI & Analytics',
      items: [
        {
          name: 'OpenAI',
          description: 'Powered by GPT-4 for intelligent conversations.',
          icon: Database,
          status: 'Built-in',
        },
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Integrations
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Connect {brandFullName} with your favorite tools and workflows.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {integrations.map((category, idx) => (
            <div key={idx} className="mb-16">
              <h2 className="text-3xl font-bold mb-8">{category.category}</h2>
              <div className="grid md:grid-cols-3 gap-6">
                {category.items.map((integration, iIdx) => {
                  const Icon = integration.icon
                  return (
                    <div key={iIdx} className="border rounded-lg p-6 hover:shadow-lg transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                          <Icon className="w-6 h-6 text-gray-600" />
                        </div>
                        <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {integration.status}
                        </span>
                      </div>
                      <h3 className="text-xl font-semibold mb-2">{integration.name}</h3>
                      <p className="text-gray-600">{integration.description}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold mb-4">Need a custom integration?</h2>
          <p className="text-gray-600 mb-6">
            Enterprise customers can request custom integrations. Contact us to discuss your needs.
          </p>
          <Link href="/contact">
            <Button className="bg-blue-600 hover:bg-blue-700">
              Contact Sales
            </Button>
          </Link>
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


