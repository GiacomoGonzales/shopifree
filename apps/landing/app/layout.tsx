import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Shopifree - Create Your Online Store',
  description: 'Build your online store with Shopifree',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  )
} 