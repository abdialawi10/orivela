import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { brandName, brandFullName } from '@/lib/brand'
import { Target, Users, Zap, Heart } from 'lucide-react'

export default function AboutPage() {
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
          <h1 className="text-4xl md:text-5xl font-bold mb-6">
            About {brandFullName}
          </h1>
          <p className="text-xl text-gray-600">
            We're building the future of customer communication
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <h2 className="text-3xl font-bold mb-6">Our Mission</h2>
            <p className="text-gray-600 mb-6">
              {brandFullName} was founded with a simple mission: make exceptional customer service accessible to every business, regardless of size. We believe that every customer interaction matters, and AI can help businesses provide consistent, high-quality service 24/7.
            </p>

            <h2 className="text-3xl font-bold mb-6 mt-12">What We Do</h2>
            <p className="text-gray-600 mb-6">
              We provide an AI-powered communication platform that handles phone calls, SMS, and emails automatically. Our intelligent assistant understands context, speaks multiple languages, and knows when to escalate to human agents. With {brandFullName}, businesses can focus on growth while their AI assistant handles customer inquiries.
            </p>

            <h2 className="text-3xl font-bold mb-6 mt-12">Our Values</h2>
            <div className="grid md:grid-cols-2 gap-8 mt-8">
              <div className="flex gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Target className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Customer-First</h3>
                  <p className="text-gray-600">
                    Every feature we build is designed with your customers in mind. We prioritize what matters most to them.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Zap className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Innovation</h3>
                  <p className="text-gray-600">
                    We stay at the forefront of AI technology to deliver cutting-edge solutions that actually work.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Accessibility</h3>
                  <p className="text-gray-600">
                    Great customer service shouldn't be expensive or complicated. We make it accessible to everyone.
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Heart className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Integrity</h3>
                  <p className="text-gray-600">
                    We build trust through transparency, reliability, and honest communication with our customers.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">Join Our Journey</h2>
          <p className="text-gray-600 mb-8">
            We're always looking for talented people who share our vision. Check out our careers page or reach out to learn more.
          </p>
          <div className="flex gap-4 justify-center">
            <Link href="/contact">
              <Button className="bg-blue-600 hover:bg-blue-700">
                Contact Us
              </Button>
            </Link>
            <Link href="/pricing">
              <Button variant="outline">
                Get Started
              </Button>
            </Link>
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


