import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { brandFullName, defaultMetaDescription } from '@/lib/brand'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: `${brandFullName} - AI Assistant Dashboard`,
  description: defaultMetaDescription,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  )
}







