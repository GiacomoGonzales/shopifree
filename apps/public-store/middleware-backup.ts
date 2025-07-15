import { NextRequest, NextResponse } from 'next/server'

// Versión más simple del middleware que evita problemas en edge runtime
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Solo aplicar a rutas específicas para evitar problemas
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/test-subdomain') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Obtener host de manera segura
  const host = request.headers.get('host')
  if (!host) {
    return NextResponse.next()
  }

  // Extraer subdomain de manera simple
  let subdomain: string | null = null
  
  try {
    const cleanHost = host.split(':')[0].toLowerCase()
    
    if (cleanHost.endsWith('.shopifree.app')) {
      const extracted = cleanHost.replace('.shopifree.app', '')
      if (!['www', 'app', 'api', 'admin', 'dashboard'].includes(extracted)) {
        subdomain = extracted
      }
    } else if (cleanHost.endsWith('.vercel.app')) {
      subdomain = 'lunara'
    } else if (cleanHost === 'localhost' || cleanHost.includes('127.0.0.1')) {
      subdomain = 'lunara'
    }
  } catch (error) {
    console.error('Error extracting subdomain:', error)
    return NextResponse.next()
  }

  // Si no hay subdomain válido, continuar sin reescribir
  if (!subdomain) {
    return NextResponse.next()
  }

  // Reescribir URL
  try {
    const url = new URL(request.url)
    const newUrl = new URL(`/${subdomain}${pathname}`, url.origin)
    newUrl.search = url.search
    
    const response = NextResponse.rewrite(newUrl)
    response.headers.set('x-subdomain', subdomain)
    response.headers.set('x-host', host)
    
    return response
  } catch (error) {
    console.error('Error rewriting URL:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|test-subdomain).*)',
  ],
} 