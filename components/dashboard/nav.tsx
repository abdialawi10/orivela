'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import {
  LayoutDashboard,
  Settings,
  BookOpen,
  MessageSquare,
  Play,
  LogOut,
  DollarSign,
} from 'lucide-react'
import { brandName } from '@/lib/brand'

const navItems = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/conversations', label: 'Conversations', icon: MessageSquare },
  { href: '/copilot', label: 'Copilot', icon: Play },
  { href: '/knowledge-base', label: 'Knowledge Base', icon: BookOpen },
  { href: '/settings', label: 'Settings', icon: Settings },
  { href: '/playground', label: 'Playground', icon: Play },
  { href: '/pricing', label: 'Pricing', icon: DollarSign },
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <nav className="flex h-16 items-center border-b bg-white px-6">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-xl font-bold">
          {brandName}
        </Link>
        <div className="flex gap-1">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'secondary' : 'ghost'}
                  className="gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </div>
      </div>
      <div className="ml-auto">
        <Button variant="ghost" onClick={() => signOut()}>
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </nav>
  )
}





