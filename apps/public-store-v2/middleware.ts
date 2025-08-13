import createMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";

const supportedLocales = ["es", "en"] as const;

const intl = createMiddleware({
	locales: Array.from(supportedLocales),
	defaultLocale: "es"
});

function getCookie(req: NextRequest, name: string): string | null {
  try {
    const cookie = req.headers.get('cookie') || '';
    const match = cookie.match(new RegExp('(?:^|; )' + name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '=([^;]*)'));
    return match ? decodeURIComponent(match[1]) : null;
  } catch {
    return null;
  }
}

function getPreferredLocale(req: NextRequest, subdomain: string): (typeof supportedLocales)[number] {
  const cookieName = `sf:locale:${subdomain}`;
  const fromCookie = getCookie(req, cookieName);
  if (fromCookie === 'en' || fromCookie === 'es') return fromCookie as any;
  return 'es';
}

export function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const originalPathname = nextUrl.pathname;
  const search = nextUrl.search;

  // Detectar subdominio sólo para dominios de la plataforma (*.shopifree.app, localhost)
  let host = nextUrl.hostname.toLowerCase();
  if (host.startsWith('www.')) host = host.slice(4);
  const isPlatformDomain = host.endsWith('shopifree.app') || host.endsWith('localhost');
  const subdomain = isPlatformDomain && host.includes('.') ? host.split('.')[0] : '';

  // Partes de la ruta
  const segments = originalPathname.split('/').filter(Boolean);
  const first = segments[0] || '';
  const hasLocale = supportedLocales.includes(first as any);
  const currentLocale = hasLocale ? (first as typeof supportedLocales[number]) : null;
  const hasSubdomainInPath = subdomain && segments[hasLocale ? 1 : 0] === subdomain;

  // Construir ruta canónica deseada
  let targetSegments = [...segments];

  // Insertar subdominio si existe en host y no está en la ruta
  if (subdomain && subdomain !== 'localhost' && !hasSubdomainInPath) {
    const rest = hasLocale ? segments.slice(1) : segments;
    // Si la ruta ya contiene el subdominio en otra posición (duplicado), elimínalo
    const restSansDup = rest.filter((seg) => seg !== subdomain);
    targetSegments = [currentLocale || '', subdomain, ...restSansDup].filter(Boolean) as string[];
  }

  // Si NO hay subdominio (dominio personalizado), no insertamos subdominio en la ruta.

  // Asegurar locale
  const ensureHasLocale = hasLocale || !subdomain ? hasLocale : false;
  if (!ensureHasLocale) {
    const preferred = getPreferredLocale(req, subdomain || '');
    if (targetSegments.length === 0) {
      targetSegments = [preferred];
    } else if (supportedLocales.includes(targetSegments[0] as any)) {
      // ya tiene locale
    } else {
      targetSegments = [preferred, ...targetSegments];
    }
  }

  const targetPathname = '/' + targetSegments.join('/');

  if (targetPathname !== originalPathname) {
    const to = new URL(targetPathname + search, req.url);
    return NextResponse.redirect(to);
  }

  // Si no hubo cambios, delegar a next-intl
  return intl(req);
}

export const config = {
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"]
};


