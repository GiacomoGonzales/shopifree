import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Dashboard - Shopifree',
  description: 'Manage your online store',
  icons: {
    icon: '/brand/icons/favicon.png',
    shortcut: '/brand/icons/favicon.png',
    apple: '/brand/icons/favicon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/brand/icons/favicon.png',
      }
    ]
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html>
      <body>
        {children}
      </body>
    </html>
  )
}
