'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Check } from 'lucide-react'

interface Plan {
  id: string
  name: string
  displayName: string
  description: string
  price: number
  annualPrice: number | null
  features: string[]
  limits: {
    maxUsers: number | null
  }
}

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly')
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPlans()
  }, [])

  const fetchPlans = async () => {
    try {
      const res = await fetch('/api/pricing/plans')
      if (res.ok) {
        const data = await res.json()
        if (data.plans && data.plans.length > 0) {
          setPlans(data.plans)
        } else {
          setError('No plans available. Please contact support.')
        }
      } else {
        setError('Failed to load plans. Please refresh the page.')
      }
    } catch (error) {
      console.error('Failed to fetch plans:', error)
      setError('Failed to load plans. Please check your connection.')
    } finally {
      setLoading(false)
    }
  }

  const handleStartTrial = async (planName: string) => {
    try {
      const res = await fetch('/api/subscriptions/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planName,
          billingCycle: billingCycle.toUpperCase(),
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.checkoutUrl) {
          window.location.href = data.checkoutUrl
        } else {
          // Trial started successfully
          window.location.href = '/dashboard'
        }
      } else {
        alert('Failed to start trial. Please try again.')
      }
    } catch (error) {
      console.error('Trial start error:', error)
      alert('Failed to start trial. Please try again.')
    }
  }

  const formatPrice = (price: number) => {
    if (price === 0) return 'Custom'
    return `$${price.toLocaleString()}`
  }

  const getAnnualDiscount = (monthly: number, annual: number | null) => {
    if (!annual || monthly === 0) return null
    const savings = monthly * 12 - annual
    const percent = Math.round((savings / (monthly * 12)) * 100)
    return percent
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <div>Loading pricing plans...</div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <div className="text-red-600 mb-4">{error}</div>
          <Button onClick={fetchPlans} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  // Fallback plans if API fails (hardcoded for reliability)
  const defaultPlans: Plan[] = plans.length === 0 ? [
    {
      id: '1',
      name: 'STARTER',
      displayName: 'Starter Plan',
      description: 'Perfect for small businesses getting started',
      price: 79,
      annualPrice: 759,
      features: [
        'SMS & Email AI conversations',
        'Basic knowledge base integration',
        '2 users included',
        'Multi-turn AI dialogue & context retention',
        'Email draft generation & reply automation',
        'Basic reporting & conversation history',
        'Automatic language detection & translation',
      ],
      limits: { maxUsers: 2 },
    },
    {
      id: '2',
      name: 'PROFESSIONAL',
      displayName: 'Professional Plan',
      description: 'Most popular for growing businesses',
      price: 199,
      annualPrice: 1910,
      features: [
        'Everything in Starter',
        'Voice call AI agent',
        'Calendly integration & appointment scheduling',
        'AI Copilot with real-time suggestions & post-call summaries',
        'Unlimited SMS & Email users up to 5',
        'Multi-channel conversation history',
        'Enhanced analytics dashboard',
        'Smart escalation & contextual knowledge base',
      ],
      limits: { maxUsers: 5 },
    },
    {
      id: '3',
      name: 'BUSINESS',
      displayName: 'Business Plan',
      description: 'Advanced features for scaling teams',
      price: 399,
      annualPrice: 3830,
      features: [
        'Everything in Professional',
        'Multi-channel automation (SMS, Email, Voice)',
        'CRM integrations (HubSpot, Salesforce, Pipedrive)',
        'Auto-meeting notes & task conversion to Notion/Asana/Trello',
        'AI conversation summarization across all channels',
        'Personalized AI persona & tone customization',
        'Trend analysis & sentiment detection',
        'Unlimited users',
      ],
      limits: { maxUsers: null },
    },
    {
      id: '4',
      name: 'ENTERPRISE',
      displayName: 'Enterprise Plan',
      description: 'Custom solutions for large organizations',
      price: 0,
      annualPrice: 0,
      features: [
        'Everything in Business',
        'Advanced AI intelligence & predictive suggestions',
        'Real-time web access for AI responses',
        'Multi-language voice replies in live calls',
        'Dedicated support & onboarding',
        'API access & custom integrations',
        'Full analytics & revenue tracking',
        'Custom AI personas & branding',
      ],
      limits: { maxUsers: null },
    },
  ] : plans

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white py-20 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Simple, transparent pricing
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Choose the perfect plan for your business. All plans include a 14-day free trial.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4">
            <span className={`text-sm ${billingCycle === 'monthly' ? 'font-semibold' : 'text-gray-500'}`}>
              Monthly
            </span>
            <button
              onClick={() => setBillingCycle(billingCycle === 'monthly' ? 'annual' : 'monthly')}
              className={`relative w-14 h-8 rounded-full transition-colors ${
                billingCycle === 'annual' ? 'bg-blue-600' : 'bg-gray-300'
              }`}
            >
              <span
                className={`absolute top-1 left-1 w-6 h-6 bg-white rounded-full transition-transform ${
                  billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-sm ${billingCycle === 'annual' ? 'font-semibold' : 'text-gray-500'}`}>
              Annual
            </span>
            {billingCycle === 'annual' && (
              <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded">
                Save up to 20%
              </span>
            )}
          </div>
        </div>

        {/* Plans Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {defaultPlans.map((plan, index) => {
            const isPopular = plan.name === 'PROFESSIONAL'
            const price = billingCycle === 'annual' && plan.annualPrice ? plan.annualPrice : plan.price
            const monthlyEquivalent = billingCycle === 'annual' && plan.annualPrice 
              ? Math.round(plan.annualPrice / 12) 
              : plan.price
            const discount = getAnnualDiscount(plan.price, plan.annualPrice)

            return (
              <Card
                key={plan.id}
                className={`relative ${
                  isPopular
                    ? 'border-blue-600 shadow-lg scale-105'
                    : 'border-gray-200'
                }`}
              >
                {isPopular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                      Most Popular
                    </span>
                  </div>
                )}

                <CardHeader>
                  <CardTitle className="text-2xl">{plan.displayName}</CardTitle>
                  <CardDescription>{plan.description}</CardDescription>
                  <div className="mt-4">
                    <div className="flex items-baseline">
                      <span className="text-4xl font-bold">
                        {formatPrice(monthlyEquivalent)}
                      </span>
                      {plan.price > 0 && (
                        <span className="text-gray-500 ml-2">/month</span>
                      )}
                    </div>
                    {billingCycle === 'annual' && discount && (
                      <p className="text-sm text-gray-500 mt-1">
                        ${plan.price}/mo billed annually
                        <span className="text-green-600 ml-1">
                          (Save {discount}%)
                        </span>
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start">
                        <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    onClick={() => handleStartTrial(plan.name)}
                    className={`w-full ${
                      isPopular
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-900 hover:bg-gray-800'
                    }`}
                  >
                    {plan.name === 'ENTERPRISE' ? 'Contact Sales' : 'Start Free Trial'}
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Add-ons Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h2 className="text-2xl font-bold mb-6 text-center">Optional Add-ons</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Extra AI Copilot Seat</h3>
              <p className="text-gray-600 text-sm mb-4">
                Additional AI Copilot seat for your team
              </p>
              <p className="text-2xl font-bold">$50<span className="text-sm font-normal text-gray-500">/mo</span></p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Additional Integration</h3>
              <p className="text-gray-600 text-sm mb-4">
                Extra CRM or task management integration
              </p>
              <p className="text-2xl font-bold">$75<span className="text-sm font-normal text-gray-500">/mo</span></p>
            </div>
            <div className="bg-white p-6 rounded-lg">
              <h3 className="font-semibold mb-2">Premium Analytics</h3>
              <p className="text-gray-600 text-sm mb-4">
                Advanced analytics and reporting features
              </p>
              <p className="text-2xl font-bold">$100<span className="text-sm font-normal text-gray-500">/mo</span></p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold mb-6 text-center">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold mb-2">Can I change plans later?</h3>
              <p className="text-gray-600 text-sm">
                Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What happens after my free trial?</h3>
              <p className="text-gray-600 text-sm">
                After your 14-day free trial, you'll be automatically charged based on your selected plan. You can cancel anytime before the trial ends.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">Do you offer refunds?</h3>
              <p className="text-gray-600 text-sm">
                We offer a 30-day money-back guarantee for all paid plans.
              </p>
            </div>
            <div>
              <h3 className="font-semibold mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600 text-sm">
                We accept all major credit cards, ACH transfers, and wire transfers for Enterprise plans.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

