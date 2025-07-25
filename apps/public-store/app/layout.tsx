import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { StoreProvider } from '../lib/store-context'
import { AuthFavoritesWrapper } from '../lib/auth-favorites-wrapper'
import { getStoreBySubdomain, extractSubdomain, transformStoreForClient, StoreDataClient } from '../lib/store'
import { generateStoreMetadata, generateAnalyticsScripts, generateStoreStructuredData } from '../lib/seo-utils'
import './globals.css'

// Force dynamic rendering with Node.js runtime (required for Firebase)
export const dynamic = 'force-dynamic'

// Function to check if request is from a social media crawler
function isSocialMediaCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false
  const crawlers = [
    'facebookexternalhit', 'Facebot', 'Twitterbot', 'WhatsApp', 'WhatsApp/2',
    'LinkedInBot', 'InstagramBot', 'SnapchatBot', 'TelegramBot',
    'GoogleBot', 'bingbot', 'SlackBot', 'DiscordBot'
  ]
  return crawlers.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  )
}

// Generate dynamic metadata based on store
export async function generateMetadata(): Promise<Metadata> {
  try {
    const headersList = headers()
    const host = headersList.get('host') || headersList.get('x-forwarded-host')
    const userAgent = headersList.get('user-agent')
    const isCrawler = isSocialMediaCrawler(userAgent)
    const subdomain = extractSubdomain(host)
    
    if (isCrawler) {
      console.log('🤖 Generating metadata for crawler:', { userAgent, subdomain })
    }
    
    if (!subdomain) {
      return {
        title: 'Shopifree - Crea tu tienda online gratis',
        description: 'Crea tu tienda online completamente gratis con Shopifree. Sin comisiones, sin límites.',
      }
    }

    const serverStore = await getStoreBySubdomain(subdomain)
    
    if (!serverStore) {
      return {
        title: 'Tienda no encontrada - Shopifree',
        description: 'La tienda que buscas no existe o no está disponible',
      }
    }

    return generateStoreMetadata(serverStore)
  } catch (error) {
    console.error('Error generating metadata:', error)
    return {
      title: 'Shopifree Store',
      description: 'Your online store powered by Shopifree',
    }
  }
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
  isCrawler?: boolean;
}> {
  try {
    console.log('🚀 [SERVER] Getting store data...')
    
    const headersList = headers()
    const host = headersList.get('host') || headersList.get('x-forwarded-host')
    const userAgent = headersList.get('user-agent')
    const isCrawler = isSocialMediaCrawler(userAgent)
    
    console.log('🌐 [SERVER] Host detected:', host)
    
    if (isCrawler) {
      console.log('🤖 [SERVER] Social media crawler detected:', userAgent)
    }
    
    const subdomain = extractSubdomain(host)
    
    // No subdomain = main domain, show landing
    if (!subdomain) {
      console.log('🏠 [SERVER] No subdomain detected, showing landing')
      return { store: null, hasSubdomain: false, isCrawler }
    }
    
    console.log('🎯 [SERVER] Subdomain extracted:', subdomain)
    
    // Has subdomain, try to find store
    const serverStore = await getStoreBySubdomain(subdomain)
    
    if (!serverStore) {
      console.log('❌ [SERVER] Store not found for subdomain:', subdomain)
      return { store: null, hasSubdomain: true, subdomain, error: 'Store not found', isCrawler }
    }
    
    // Transform server data to client-safe format
    const clientStore = transformStoreForClient(serverStore)
    
    if (!clientStore) {
      console.error('❌ [SERVER] Failed to transform store data for client')
      return { store: null, hasSubdomain: true, subdomain, error: 'Data transformation failed', isCrawler }
    }
    
    console.log('✅ [SERVER] Store data prepared for client:', clientStore.storeName)
    return { store: clientStore, hasSubdomain: true, subdomain, isCrawler }
    
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
  const { store, hasSubdomain, subdomain, error, isCrawler } = await getStoreData()

  // If has subdomain but no store found, show error page
  if (hasSubdomain && !store) {
    const errorMessage = error || 'La tienda no está disponible'
    
    // For crawlers, return minimal HTML with meta tags
    if (isCrawler) {
      return (
        <html lang="es">
          <head>
            <title>Tienda no encontrada - Shopifree</title>
            <meta name="description" content="La tienda que buscas no existe o no está disponible" />
            <meta property="og:title" content="Tienda no encontrada" />
            <meta property="og:description" content="La tienda que buscas no existe o no está disponible" />
            <meta property="og:type" content="website" />
            <link rel="icon" href="/brand/icons/favicon.png" type="image/png" />
          </head>
          <body>
            <div>Tienda no encontrada</div>
          </body>
        </html>
      )
    }
    
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
                  <>La tienda <span className="font-semibold">&ldquo;{subdomain}&rdquo;</span> no existe o no está disponible.</>
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

  // Get analytics scripts and structured data for the store
  const analyticsScripts = store ? generateAnalyticsScripts(store) : []
  const structuredData = store ? generateStoreStructuredData(store) : null
  const faviconUrl = store?.advanced?.seo?.favicon || '/brand/icons/favicon.png'

  // Generate SEO meta tags directly for social media
  const seo = store?.advanced?.seo
  const ogTitle = seo?.ogTitle || seo?.title || `${store.storeName} - ${store.slogan || 'Tienda Online'}`
  const ogDescription = seo?.ogDescription || seo?.metaDescription || store.description || `Descubre los mejores productos en ${store.storeName}`
  const ogImage = seo?.ogImage || store.logoUrl
  const baseUrl = `https://${store.subdomain}.shopifree.app`

  // For social media crawlers, return simplified HTML with complete meta tags
  // ONLY for home page - specific pages (products, categories) handle their own crawlers
  const pathname = headersList.get('x-pathname') || '/'
  const isHomePage = pathname === '/' || pathname === ''
  
  console.log('🤖 [LAYOUT] Crawler detected, pathname:', pathname, 'isHomePage:', isHomePage)
  
  if (isCrawler && store && isHomePage) {
    return (
      <html lang={store?.advanced?.language || 'es'}>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
          {/* Basic SEO Meta Tags */}
          <title>{seo?.title || `${store.storeName} - ${store.slogan || 'Tienda Online'}`}</title>
          <meta name="description" content={seo?.metaDescription || store.description || `Descubre los mejores productos en ${store.storeName}`} />
          {seo?.keywords && seo.keywords.length > 0 && (
            <meta name="keywords" content={seo.keywords.join(', ')} />
          )}
          <meta name="robots" content={seo?.robots || 'index,follow'} />
          
          {/* Open Graph Meta Tags for WhatsApp, Facebook, etc. */}
          <meta property="og:type" content="website" />
          <meta property="og:title" content={ogTitle} />
          <meta property="og:description" content={ogDescription} />
          <meta property="og:url" content={baseUrl} />
          <meta property="og:site_name" content={store.storeName} />
          <meta property="og:locale" content={store.advanced?.language === 'en' ? 'en_US' : 'es_ES'} />
          
          {/* Multiple images for different platforms - WhatsApp specific image first */}
          {seo?.whatsappImage && (
            <>
              <meta property="og:image" content={seo.whatsappImage} />
              <meta property="og:image:width" content="400" />
              <meta property="og:image:height" content="400" />
              <meta property="og:image:alt" content={ogTitle} />
              <meta property="og:image:type" content="image/jpeg" />
              <meta property="og:image:secure_url" content={seo.whatsappImage} />
            </>
          )}
          {ogImage && (
            <>
              <meta property="og:image" content={ogImage} />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:image:alt" content={ogTitle} />
              <meta property="og:image:type" content="image/jpeg" />
              <meta property="og:image:secure_url" content={ogImage} />
            </>
          )}
          
          {/* Twitter Card Meta Tags */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={ogTitle} />
          <meta name="twitter:description" content={ogDescription} />
          {ogImage && <meta name="twitter:image" content={ogImage} />}
          
          {/* Canonical URL */}
          <link rel="canonical" href={seo?.canonicalUrl || baseUrl} />
          
          {/* Dynamic favicon */}
          <link rel="icon" href={faviconUrl} type="image/png" />
          <link rel="shortcut icon" href={faviconUrl} type="image/png" />
          <link rel="apple-touch-icon" href={faviconUrl} />
          
          {/* Theme color */}
          <meta name="theme-color" content={store.primaryColor || '#000000'} />
        </head>
        <body>
          <div>
            <h1>{store.storeName}</h1>
            <p>{store.description}</p>
          </div>
        </body>
      </html>
    )
  }

  return (
    <html lang={store?.advanced?.language || 'es'}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        
        {/* Basic SEO Meta Tags */}
        <title>{seo?.title || `${store.storeName} - ${store.slogan || 'Tienda Online'}`}</title>
        <meta name="description" content={seo?.metaDescription || store.description || `Descubre los mejores productos en ${store.storeName}`} />
        {seo?.keywords && seo.keywords.length > 0 && (
          <meta name="keywords" content={seo.keywords.join(', ')} />
        )}
        <meta name="robots" content={seo?.robots || 'index,follow'} />
        
        {/* Open Graph Meta Tags for WhatsApp, Facebook, etc. */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={baseUrl} />
        <meta property="og:site_name" content={store.storeName} />
        <meta property="og:locale" content={store.advanced?.language === 'en' ? 'en_US' : 'es_ES'} />
        {ogImage && (
          <>
            <meta property="og:image" content={ogImage} />
            <meta property="og:image:width" content="1200" />
            <meta property="og:image:height" content="630" />
            <meta property="og:image:alt" content={ogTitle} />
          </>
        )}
        
        {/* Twitter Card Meta Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        {ogImage && <meta name="twitter:image" content={ogImage} />}
        
        {/* WhatsApp specific meta tags */}
        <meta property="og:image:type" content="image/jpeg" />
        
        {/* Canonical URL */}
        <link rel="canonical" href={seo?.canonicalUrl || baseUrl} />
        
        {/* Dynamic favicon */}
        <link rel="icon" href={faviconUrl} type="image/png" />
        <link rel="shortcut icon" href={faviconUrl} type="image/png" />
        <link rel="apple-touch-icon" href={faviconUrl} />
        
        {/* Theme color */}
        <meta name="theme-color" content={store.primaryColor || '#000000'} />
        
        {/* Google Search Console verification */}
        {seo?.googleSearchConsole && (
          <meta name="google-site-verification" content={seo.googleSearchConsole} />
        )}
        
        {/* Structured Data */}
        {structuredData && (
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: structuredData }}
          />
        )}
        
        {/* Analytics Scripts */}
        {analyticsScripts.map((script, index) => (
          <div
            key={index}
            dangerouslySetInnerHTML={{ __html: script }}
          />
        ))}
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