import { NextRequest, NextResponse } from 'next/server';

export function middleware(request: NextRequest) {
  // Dashboard está completamente en CSR, solo manejamos redirecciones básicas
  const pathname = request.nextUrl.pathname;
  
  // Si está en la raíz, redirigir a /es
  if (pathname === '/') {
    return NextResponse.redirect(new URL('/es', request.url));
  }
  
  // Si no tiene locale, agregar el locale por defecto
  const pathnameHasLocale = /^\/(?:es|en)(?:\/|$)/.test(pathname);
  if (!pathnameHasLocale) {
    return NextResponse.redirect(new URL(`/es${pathname}`, request.url));
  }
  
  // Continuar normalmente
  return NextResponse.next();
}

export const config = {
  // Match all pathnames except for API routes, static files, and Next.js internals
  matcher: ['/((?!api|_next|_vercel|favicon|.*\\..*).*)']
}; 