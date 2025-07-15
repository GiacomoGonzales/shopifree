import { NextRequest, NextResponse } from 'next/server'

// Expresión regular para verificar si una ruta es para un archivo estático
// Ignora rutas como /_next, /api, /favicon.ico, y cualquier ruta que contenga un punto (e.g., /images/banner.webp)
const PUBLIC_FILE = /\\.(.*)$/

// Función simplificada para extraer subdomain (sin dependencias externas)
const extractSubdomain = (host: string | null): string | null => {
  if (!host) return null
  
  try {
    // Remove port if present (for local development)
    const cleanHost = host.split(':')[0].toLowerCase()
    
    // For local development, handle localhost
    if (cleanHost === 'localhost' || cleanHost.includes('127.0.0.1')) {
      return 'lunara' // Para desarrollo local
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
  } catch (error) {
    console.error('Middleware error:', error)
    // En caso de error, permitir que la request continue
    return NextResponse.next()
  }
}

export const config = {
  // Temporalmente deshabilitado para debugging
  matcher: [],
  
  // Configuración original comentada:
  // matcher: [
  //   '/((?!api|_next/static|_next/image|favicon.ico).*)',
  // ],
} 