import { NextRequest, NextResponse } from 'next/server'
import { extractSubdomain } from './lib/store'

export function middleware(request: NextRequest) {
  const host = request.headers.get('host')
  const subdomain = extractSubdomain(host)
  
  // Si no hay subdominio válido, continuar normalmente (landing page)
  if (!subdomain) {
    return NextResponse.next()
  }
  
  // Si hay subdominio, establecer headers para que las páginas puedan acceder a esta información
  const response = NextResponse.next()
  
  // Agregar headers customizados para pasar el subdominio a las páginas
  response.headers.set('x-subdomain', subdomain)
  response.headers.set('x-host', host || '')
  
  return response
}

export const config = {
  // Aplicar el middleware a todas las rutas excepto archivos estáticos y API
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 