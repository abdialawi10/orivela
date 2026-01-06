import { redirect } from 'next/navigation'
import { getServerSessionHelper as getServerSession } from '@/lib/auth-helper'
import { DashboardNav } from './nav'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession()

  if (!session) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardNav />
      <main className="container mx-auto py-8">{children}</main>
    </div>
  )
}

