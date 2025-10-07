import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap'
})

export const metadata: Metadata = {
  metadataBase: new URL('https://shopifree.app'),
  title: 'Shopifree - Create Your Online Store',
  description: 'Build your online store with Shopifree',
  applicationName: 'Shopifree',

  // PWA Configuration
  manifest: '/manifest.json',
  themeColor: '#059669',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Shopifree',
  },

  // Icons
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.svg',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: '/favicon.svg',
      }
    ]
  },

  // Format detection
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        {/* Theme color for browsers and mobile devices */}
        <meta name="theme-color" content="#059669" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />

        {/* Preconnect to external domains for faster loading */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://dashboard.shopifree.app" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />

        {/* Performance hints */}
        <link rel="preload" href="/logo-primary.png" as="image" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
} 