import { NextRequest, NextResponse } from 'next/server'
import { extractSubdomain } from './lib/store'

// Expresión regular para verificar si una ruta es para un archivo estático
// Ignora rutas como /_next, /api, /favicon.ico, y cualquier ruta que contenga un punto (e.g., /images/banner.webp)
const PUBLIC_FILE = /\\.(.*)$/

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const host = request.headers.get('host')

  // Prevenir que el middleware se ejecute en rutas de archivos estáticos
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    PUBLIC_FILE.test(pathname)
  ) {
    return NextResponse.next()
  }

  const subdomain = extractSubdomain(host)
  
  // Si no hay subdominio válido, mostrar la landing page
  if (!subdomain) {
    return NextResponse.rewrite(new URL('/', request.url))
  }

  // Reescribir la URL para incluir el subdominio como parámetro
  const url = new URL(request.url)
  const path = url.pathname === '/' ? '' : url.pathname
  const newUrl = new URL(`/${subdomain}${path}`, request.url)
  
  // Mantener los query params
  newUrl.search = url.search
  
  // Reescribir la request con el nuevo path que incluye el subdominio
  const response = NextResponse.rewrite(newUrl)
  
  // Agregar headers customizados para acceder al subdominio en las páginas
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