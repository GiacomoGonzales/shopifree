'use client'

import type { Metadata } from 'next'
import './globals.css'
import { AuthProvider } from '../lib/simple-auth-context'

// Note: Metadata is only available in server components
// Since we need 'use client' for AuthProvider, we'll define metadata differently
// export const metadata: Metadata = {
//   title: 'Dashboard - Shopifree',
//   description: 'Manage your online store',
// }

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <title>Dashboard - Shopifree</title>
        <meta name="description" content="Manage your online store" />
      </head>
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
