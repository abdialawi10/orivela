import { redirect } from 'next/navigation'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { MessageSquare, Phone, Mail, Zap, Globe, TrendingUp, Shield, Users } from 'lucide-react'
import { brandName, brandFullName } from '@/lib/brand'

export default async function Home() {
  const session = await getServerSession()
  
  if (session) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <span className="text-2xl font-bold">{brandName}</span>
            </div>
            <div className="flex items-center gap-4">
              <Link href="/pricing">
                <Button variant="ghost">Pricing</Button>
              </Link>
              <Link href="/login">
                <Button>Sign In</Button>
              </Link>
              <Link href="/pricing">
                <Button className="bg-blue-600 hover:bg-blue-700">Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 lg:py-32">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            AI Assistant for Your
            <span className="text-blue-600"> Business</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Handle phone calls, SMS, and emails automatically. Never miss a customer interaction with our intelligent AI assistant that works 24/7.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/pricing">
              <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-lg px-8">
                Start Free Trial
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline" className="text-lg px-8">
                Sign In
              </Button>
            </Link>
          </div>
          <p className="text-sm text-gray-500 mt-4">14-day free trial • No credit card required</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Everything you need to automate customer communications
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Powerful AI features that work across all your communication channels
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Phone className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Voice Calls</h3>
              <p className="text-gray-600">
                AI-powered voice agent handles incoming calls, answers questions, and schedules appointments naturally.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <MessageSquare className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">SMS & Text</h3>
              <p className="text-gray-600">
                Instant SMS responses with full context awareness. Never leave a customer waiting.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <Mail className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Email Automation</h3>
              <p className="text-gray-600">
                AI-generated email drafts and automated replies that sound professional and human.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI Copilot</h3>
              <p className="text-gray-600">
                Real-time AI assistance during live calls with suggestions and post-call summaries.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mb-4">
                <Globe className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">20 Languages</h3>
              <p className="text-gray-600">
                Automatic language detection and translation. Serve customers in their preferred language.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Analytics</h3>
              <p className="text-gray-600">
                Track conversations, sentiment, trends, and revenue impact. Make data-driven decisions.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-teal-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-teal-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Smart Escalation</h3>
              <p className="text-gray-600">
                Automatically detect when customers need human help and escalate appropriately.
              </p>
            </div>

            <div className="bg-white p-6 rounded-lg shadow-sm">
              <div className="w-12 h-12 bg-pink-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Knowledge Base</h3>
              <p className="text-gray-600">
                Centralized knowledge base that AI uses to answer customer questions accurately.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Get started in minutes. No technical knowledge required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                1
              </div>
              <h3 className="text-xl font-semibold mb-2">Sign Up & Configure</h3>
              <p className="text-gray-600">
                Create your account, add your business information, and configure your AI assistant&apos;s tone and knowledge base.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                2
              </div>
              <h3 className="text-xl font-semibold mb-2">Connect Channels</h3>
              <p className="text-gray-600">
                Connect your phone number, SMS, and email. Our AI assistant is ready to handle customer interactions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                3
              </div>
              <h3 className="text-xl font-semibold mb-2">Automate Everything</h3>
              <p className="text-gray-600">
                Sit back and watch as your AI assistant handles customer inquiries, schedules appointments, and escalates when needed.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-blue-600 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to automate your customer communications?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of businesses using {brandFullName} to provide better customer service.
          </p>
          <Link href="/pricing">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100 text-lg px-8">
              Start Free Trial
            </Button>
          </Link>
          <p className="text-blue-100 text-sm mt-4">14-day free trial • No credit card required</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">{brandName}</h3>
              <p className="text-gray-600 text-sm">
                AI-powered customer communication platform for modern businesses.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/pricing" className="hover:text-blue-600">Pricing</Link></li>
                <li><Link href="/features" className="hover:text-blue-600">Features</Link></li>
                <li><Link href="/integrations" className="hover:text-blue-600">Integrations</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/about" className="hover:text-blue-600">About</Link></li>
                <li><Link href="/blog" className="hover:text-blue-600">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li><Link href="/docs" className="hover:text-blue-600">Documentation</Link></li>
                <li><Link href="/help" className="hover:text-blue-600">Help Center</Link></li>
                <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-gray-600">
            <p>&copy; {new Date().getFullYear()} {brandName}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
