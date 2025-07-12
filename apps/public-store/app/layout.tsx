import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { StoreProvider } from '../lib/store-context'
import { AuthFavoritesWrapper } from '../lib/auth-favorites-wrapper'
import { getStoreBySubdomain, extractSubdomain, transformStoreForClient, StoreDataClient } from '../lib/store'
import './globals.css'

// Force dynamic rendering with Node.js runtime (required for Firebase)
export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export const metadata: Metadata = {
  title: 'Shopifree Store',
  description: 'Your online store powered by Shopifree',
}

/**
 * Obtiene datos de la tienda en el servidor y los transforma para el cliente
 * Maneja toda la cadena: headers → subdomain → Firebase → transformación
 */
async function getStoreData(): Promise<{ 
  store: StoreDataClient | null; 
  hasSubdomain: boolean; 
  subdomain?: string;
  error?: string;
}> {
  try {
    console.log('🚀 [SERVER] Getting store data...')
    
    const headersList = headers()
    const host = headersList.get('host') || headersList.get('x-forwarded-host')
    
    console.log('🌐 [SERVER] Host detected:', host)
    
    const subdomain = extractSubdomain(host)
    
    // No subdomain = main domain, show landing
    if (!subdomain) {
      console.log('🏠 [SERVER] No subdomain detected, showing landing')
      return { store: null, hasSubdomain: false }
    }
    
    console.log('🎯 [SERVER] Subdomain extracted:', subdomain)
    
    // Has subdomain, try to find store
    const serverStore = await getStoreBySubdomain(subdomain)
    
    if (!serverStore) {
      console.log('❌ [SERVER] Store not found for subdomain:', subdomain)
      return { store: null, hasSubdomain: true, subdomain, error: 'Store not found' }
    }
    
    // Transform server data to client-safe format
    const clientStore = transformStoreForClient(serverStore)
    
    if (!clientStore) {
      console.error('❌ [SERVER] Failed to transform store data for client')
      return { store: null, hasSubdomain: true, subdomain, error: 'Data transformation failed' }
    }
    
    console.log('✅ [SERVER] Store data prepared for client:', clientStore.storeName)
    return { store: clientStore, hasSubdomain: true, subdomain }
    
  } catch (error) {
    console.error('❌ [SERVER] Critical error in getStoreData:', error)
    
    // Log detalles adicionales para debugging
    if (error instanceof Error) {
      console.error('❌ [SERVER] Error details:', {
        message: error.message,
        stack: error.stack,
        name: error.name
      })
    }
    
    return { 
      store: null, 
      hasSubdomain: false,
      error: error instanceof Error ? error.message : 'Unknown server error'
    }
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { store, hasSubdomain, subdomain, error } = await getStoreData()

  // If has subdomain but no store found, show error page
  if (hasSubdomain && !store) {
    const errorMessage = error || 'La tienda no está disponible'
    
    return (
      <html lang="es">
        <head>
          <title>Tienda no encontrada - Shopifree</title>
          <meta name="description" content="La tienda que buscas no existe o no está disponible" />
          <link rel="icon" href="/brand/icons/favicon.png" type="image/png" />
          <link rel="shortcut icon" href="/brand/icons/favicon.png" type="image/png" />
          <link rel="apple-touch-icon" href="/brand/icons/favicon.png" />
        </head>
        <body>
          <main className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center max-w-md mx-auto p-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Tienda no encontrada
              </h1>
              
              <p className="text-gray-600 mb-2">
                {subdomain ? (
                  <>La tienda <span className="font-semibold">"{subdomain}"</span> no existe o no está disponible.</>
                ) : (
                  'La tienda solicitada no está disponible.'
                )}
              </p>
              
              <p className="text-sm text-gray-500 mb-6">
                {errorMessage}
              </p>
              
              <a
                href="https://shopifree.app"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Volver a Shopifree
              </a>
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
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/brand/icons/favicon.png" type="image/png" />
        <link rel="shortcut icon" href="/brand/icons/favicon.png" type="image/png" />
        <link rel="apple-touch-icon" href="/brand/icons/favicon.png" />
      </head>
      <body>
        <StoreProvider initialStore={store}>
          <AuthFavoritesWrapper storeId={store?.id || ''}>
            {children}
          </AuthFavoritesWrapper>
        </StoreProvider>
      </body>
    </html>
  )
} 