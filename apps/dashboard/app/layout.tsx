import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'ShopiFree - Dashboard',
  description: 'Administra tu tienda online',
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
    other: [
      {
        rel: 'icon',
        type: 'image/svg+xml',
        url: '/favicon.svg',
      }
    ]
  },
}

// Componente del cliente separado
import ClientLayout from './client-layout'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
