import type { Metadata } from 'next'
import './globals.css'
import { AdminAuthProvider } from '../lib/admin-auth-context'

export const metadata: Metadata = {
  title: 'Admin Panel - Shopifree',
  description: 'Admin panel for Shopifree platform',
  icons: {
    icon: '/favicon.ico',
    shortcut: '/favicon.ico',
    apple: '/favicon.ico',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className="antialiased">
        <AdminAuthProvider>
          {children}
        </AdminAuthProvider>
      </body>
    </html>
  )
} 