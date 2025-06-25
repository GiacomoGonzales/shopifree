import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { StoreProvider } from '../lib/store-context'
import { getStoreBySubdomain, extractSubdomain } from '../lib/store'
import './globals.css'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Shopifree Store',
  description: 'Your online store powered by Shopifree',
}

async function getStoreData(): Promise<{ store: any; hasSubdomain: boolean; subdomain?: string }> {
  try {
    const headersList = headers()
    const host = headersList.get('host') || headersList.get('x-forwarded-host')
    const subdomain = extractSubdomain(host)
    
    // No subdomain = main domain, show landing
    if (!subdomain) {
      return { store: null, hasSubdomain: false }
    }
    
    // Has subdomain, try to find store
    const store = await getStoreBySubdomain(subdomain)
    return { store, hasSubdomain: true, subdomain }
    
  } catch (error) {
    console.error('Error getting store data in layout:', error)
    return { store: null, hasSubdomain: false }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { store, hasSubdomain, subdomain } = await getStoreData()

  // If has subdomain but no store found, redirect to not-found
  if (hasSubdomain && !store) {
    return (
      <html lang="es">
        <head>
          <title>Tienda no encontrada - Shopifree</title>
          <meta name="description" content="La tienda que buscas no existe" />
        </head>
        <body>
          <main className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Tienda no encontrada
              </h1>
              <p className="text-gray-600 mb-2">
                La tienda "{subdomain}" no existe o no está disponible.
              </p>
              <p className="text-sm text-gray-500">
                Verifica que la URL sea correcta.
              </p>
            </div>
          </main>
        </body>
      </html>
    )
  }

  // Dynamic metadata based on store
  const title = store 
    ? `${store.storeName} - Powered by Shopifree`
    : 'Shopifree - Crea tu tienda online gratis'
  
  const description = store?.description || 'Crea tu tienda online completamente gratis con Shopifree'

  return (
    <html lang="es">
      <head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </head>
      <body>
        <StoreProvider initialStore={store}>
          {children}
        </StoreProvider>
      </body>
    </html>
  )
} 