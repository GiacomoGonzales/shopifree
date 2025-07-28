import { NextRequest, NextResponse } from 'next/server'

// Expresión regular para verificar si una ruta es para un archivo estático
// Ignora rutas como /_next, /api, /favicon.ico, y cualquier ruta que contenga un punto (e.g., /images/banner.webp)
const PUBLIC_FILE = /\\.(.*)$/

// Social media crawlers that need special handling
const SOCIAL_MEDIA_CRAWLERS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'WhatsApp/2', // WhatsApp crawler specific user agent pattern
  'LinkedInBot',
  'TelegramBot',
  'InstagramBot',
  'SnapchatBot',
  'PinterestBot',
  'TikTokBot',
  'GoogleBot',
  'SlackBot',
  'DiscordBot'
]

// Function to check if the request is from a social media crawler
export function isSocialMediaCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false
  return SOCIAL_MEDIA_CRAWLERS.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  )
}

// Función simplificada para extraer subdomain (sin dependencias externas)
const extractSubdomain = (host: string | null): string | null => {
  if (!host) return null
  
  try {
    // Remove port if present (for local development)
    const cleanHost = host.split(':')[0].toLowerCase()
    
    // For local development, handle localhost
    if (cleanHost === 'localhost' || cleanHost.includes('127.0.0.1')) {
      return 'lunara' // Para desarrollo local usar tienda lunara
    }
    
    // Handle production domains
    if (cleanHost.endsWith('.shopifree.app')) {
      const subdomain = cleanHost.replace('.shopifree.app', '')
      // Ignore reserved subdomains
      if (['www', 'app', 'api', 'admin', 'dashboard'].includes(subdomain)) {
        return null
      }
      return subdomain
    }
    
    // Handle preview domains (Vercel)
    if (cleanHost.endsWith('.vercel.app')) {
      return 'lunara' // Para previews de Vercel
    }
    
    return null
  } catch (error) {
    console.error('Error in extractSubdomain:', error)
    return null
  }
}

export function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl
    const host = request.headers.get('host')
    const userAgent = request.headers.get('user-agent')

    // Log crawler requests for debugging
    if (isSocialMediaCrawler(userAgent)) {
      console.log('🔍 Social media crawler detected:', {
        userAgent,
        host,
        pathname,
        timestamp: new Date().toISOString()
      })
    }

    // Prevenir que el middleware se ejecute en rutas de archivos estáticos, API y archivos especiales
    if (
      pathname.startsWith('/_next') ||
      pathname.startsWith('/api') ||
      pathname.startsWith('/static') ||
      pathname.startsWith('/favicon') ||
      pathname === '/robots.txt' ||
      pathname === '/sitemap.xml' ||
      PUBLIC_FILE.test(pathname)
    ) {
      return NextResponse.next()
    }

    const subdomain = extractSubdomain(host)
    
    // Si no hay subdominio válido, mostrar la landing page
    if (!subdomain) {
      return NextResponse.rewrite(new URL('/', request.url))
    }

    // NUEVO: Manejo especial para bots de redes sociales en productos
    if (isSocialMediaCrawler(userAgent)) {
      // Para página principal - usar endpoint existente
      if (pathname === '/' || pathname === '') {
        try {
          const ogMetaUrl = new URL('/api/og-meta', request.url)
          ogMetaUrl.searchParams.set('subdomain', subdomain)
          
          console.log('🤖 Redirecting crawler to og-meta endpoint for home page:', ogMetaUrl.toString())
          
          return NextResponse.rewrite(ogMetaUrl)
        } catch (error) {
          console.error('Error redirecting to og-meta, continuing with normal flow:', error)
        }
      }
      
      // Para productos - usar endpoint específico de productos
      const productMatch = pathname.match(/^\/([^\/]+)$/) // Coincide con /producto-slug
      if (productMatch && productMatch[1]) {
        const productSlug = productMatch[1]
        
        // Verificar que no sea una ruta reservada
        const reservedRoutes = ['categoria', 'colecciones', 'mi-cuenta', 'favoritos', 'checkout', 'debug']
        if (!reservedRoutes.includes(productSlug)) {
          try {
            const ogProductUrl = new URL('/api/og-meta', request.url)
            ogProductUrl.searchParams.set('subdomain', subdomain)
            ogProductUrl.searchParams.set('productSlug', productSlug)
            
            console.log('🤖 Redirecting crawler to product OG endpoint:', ogProductUrl.toString())
            
            return NextResponse.rewrite(ogProductUrl)
          } catch (error) {
            console.error('Error redirecting product to og-meta, continuing with normal flow:', error)
          }
        }
      }
    }

    // Para todas las demás rutas (incluyendo usuarios normales), usar el flujo normal
    const url = new URL(request.url)
    const path = url.pathname === '/' ? '' : url.pathname
    const newUrl = new URL(`/${subdomain}${path}`, request.url)
    
    // Log de la transformación de URL para debug
    console.log('🔄 URL transform:', {
      original: url.pathname,
      subdomain,
      newPath: `/${subdomain}${path}`,
      isCrawler: isSocialMediaCrawler(userAgent)
    })

    return NextResponse.rewrite(newUrl)

  } catch (error) {
    console.error('❌ Error in middleware:', error)
    
    // En caso de error, continuar con el flujo normal
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - robots.txt (robots file)
     * - sitemap.xml (sitemap file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
} 