import { NextRequest, NextResponse } from "next/server";

interface CustomDomainCache {
  [subdomain: string]: { domain: string | null; expires: number };
}

interface StoreConfigCache {
  [storeId: string]: { 
    primaryLocale: string; 
    singleLocaleUrls: boolean; 
    expires: number;
  };
}

const customDomainCache: CustomDomainCache = {};
const storeConfigCache: StoreConfigCache = {};

async function getCustomDomainCached(subdomain: string): Promise<string | null> {
  const now = Date.now();
  const cached = customDomainCache[subdomain];
  
  // Cache válido por 5 minutos
  if (cached && cached.expires > now) {
    return cached.domain;
  }
  
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) return null;
    
    // Buscar storeId por subdomain
    const storeQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "stores" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "subdomain" },
              op: "EQUAL",
              value: { stringValue: subdomain }
            }
          }
        }
      })
    });
    
    if (!storeQuery.ok) throw new Error('Store query failed');
    
    const storeData = await storeQuery.json();
    if (!Array.isArray(storeData) || storeData.length === 0) {
      // Cache negative result
      customDomainCache[subdomain] = { domain: null, expires: now + 300000 };
      return null;
    }
    
    const storeDoc = storeData[0]?.document;
    if (!storeDoc) return null;
    
    const storeId = storeDoc.name.split('/').pop();
    
    // Buscar dominio personalizado
    const domainQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`);
    
    let customDomain = null;
    if (domainQuery.ok) {
      const domainDoc = await domainQuery.json();
      const domain = domainDoc?.fields?.customDomain?.stringValue;
      const status = domainDoc?.fields?.status?.stringValue;
      
      if (domain && status === 'connected') {
        customDomain = domain;
      }
    }
    
    // Cache result
    customDomainCache[subdomain] = { domain: customDomain, expires: now + 300000 };
    return customDomain;
    
  } catch (error) {
    console.error('Error getting custom domain:', error);
    // Cache negative result on error
    customDomainCache[subdomain] = { domain: null, expires: now + 60000 }; // 1 min on error
    return null;
  }
}

async function findSubdomainByCustomDomain(hostname: string): Promise<string | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) return null;
    
    // Buscar en todas las tiendas
    const storeQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "stores" }]
        }
      })
    });
    
    if (!storeQuery.ok) return null;
    
    const storeData = await storeQuery.json();
    if (!Array.isArray(storeData)) return null;
    
    // Para cada tienda, verificar su dominio personalizado
    for (const row of storeData) {
      const storeDoc = row?.document;
      if (!storeDoc) continue;
      
      const storeId = storeDoc.name.split('/').pop();
      const subdomain = storeDoc.fields?.subdomain?.stringValue;
      
      if (!subdomain) continue;
      
      // Verificar dominio personalizado
      const domainQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`);
      
      if (domainQuery.ok) {
        const domainDoc = await domainQuery.json();
        const customDomain = domainDoc?.fields?.customDomain?.stringValue;
        
        if (customDomain && customDomain.toLowerCase() === hostname.toLowerCase()) {
          return subdomain;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error finding subdomain by custom domain:', error);
    return null;
  }
}

async function getStoreConfigCached(storeSubdomain: string): Promise<{
  primaryLocale: string;
  singleLocaleUrls: boolean;
  storeId: string | null;
} | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) return null;
    
    // Buscar store por subdomain para obtener storeId
    const storeQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "stores" }],
          where: {
            fieldFilter: {
              field: { fieldPath: "subdomain" },
              op: "EQUAL",
              value: { stringValue: storeSubdomain }
            }
          }
        }
      })
    });
    
    if (!storeQuery.ok) return null;
    
    const storeData = await storeQuery.json();
    if (!Array.isArray(storeData) || storeData.length === 0) return null;
    
    const storeDoc = storeData[0]?.document;
    if (!storeDoc) return null;
    
    const storeId = storeDoc.name.split('/').pop();
    const now = Date.now();
    
    // Check cache first
    const cached = storeConfigCache[storeId];
    if (cached && cached.expires > now) {
      return {
        primaryLocale: cached.primaryLocale,
        singleLocaleUrls: cached.singleLocaleUrls,
        storeId
      };
    }
    
    // Extract store configuration
    const fields = storeDoc.fields || {};
    const advanced = fields.advanced?.mapValue?.fields || {};
    const seo = fields.seo?.mapValue?.fields || {};
    
    // Get primary locale (advanced.language or seo.language, fallback to 'es')
    const advancedLanguage = advanced.language?.stringValue;
    const seoLanguage = seo.language?.stringValue;
    const language = advancedLanguage || seoLanguage || 'es';
    
    // Ensure we validate the language correctly
    const primaryLocale = ['es', 'en', 'pt'].includes(language) ? language : 'es';
    
    // Get single locale URLs flag (advanced.singleLocaleUrls, default false)
    const singleLocaleUrls = Boolean(advanced.singleLocaleUrls?.booleanValue);
    
    // Cache result for 5 minutes
    storeConfigCache[storeId] = {
      primaryLocale,
      singleLocaleUrls,
      expires: now + 300000
    };
    
    console.log(`🏪 [Store Config] ${storeSubdomain}: primaryLocale=${primaryLocale}, singleLocaleUrls=${singleLocaleUrls}, advancedLanguage=${advancedLanguage}, seoLanguage=${seoLanguage}`);
    
    return {
      primaryLocale,
      singleLocaleUrls,
      storeId
    };
    
  } catch (error) {
    console.error('Error getting store config:', error);
    return null;
  }
}

// 🚀 Función helper para manejar single locale mode
async function handleSingleLocaleMode(req: NextRequest, storeSubdomain: string, primaryLocale: string): Promise<NextResponse> {
  const { nextUrl } = req;
  const currentPath = nextUrl.pathname;
  const search = nextUrl.search;
  
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  console.log(`🎯 [Single Locale] Procesando tienda ${storeSubdomain} con primaryLocale=${primaryLocale}`);

  // Detectar si la URL tiene prefijo de idioma
  const firstSegment = pathSegments[0];
  const hasLocalePrefix = ['es', 'en', 'pt'].includes(firstSegment);

  if (hasLocalePrefix) {
    // REDIRECT 301: /{locale}/(.*) → /(.*)
    const pathWithoutLocale = pathSegments.slice(1).join('/');
    const newPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/';
    const redirectUrl = new URL(newPath + search, req.url);

    console.log(`🔄 [301 Redirect] ${currentPath} → ${newPath} (single locale mode)`);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 🚀 REWRITE INTERNO: /(.*) → /{storeSubdomain}/(.*)
  if (currentPath === '/') {
    // Root path
    const rewritePath = `/${storeSubdomain}`;
    const rewriteUrl = new URL(rewritePath + search, req.url);
    console.log(`🔄 [Rewrite] ${currentPath} → ${rewritePath}`);
    return NextResponse.rewrite(rewriteUrl);
  } else {
    // Other paths
    const rewritePath = `/${storeSubdomain}${currentPath}`;
    const rewriteUrl = new URL(rewritePath + search, req.url);
    console.log(`🔄 [Rewrite] ${currentPath} → ${rewritePath}`);
    return NextResponse.rewrite(rewriteUrl);
  }
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || nextUrl.protocol.slice(0, -1);
  
  // Skip middleware para archivos estáticos, API routes y dashboard
  if (nextUrl.pathname.startsWith('/_next') || 
      nextUrl.pathname.startsWith('/api') ||
      nextUrl.pathname.startsWith('/dashboard') ||
      nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // 🧪 MODO DESARROLLO LOCAL: Configuración especial para testing
  const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1');
  if (isLocalDev) {
    console.log(`🧪 [Local Dev] Host: ${host}, Path: ${nextUrl.pathname}`);
    
    // Determinar subdomain para localhost
    let storeSubdomain = nextUrl.pathname.split('/')[1] || 'tiendaverde';
    if (storeSubdomain === 'es' || storeSubdomain === 'en' || storeSubdomain === 'pt') {
      storeSubdomain = nextUrl.pathname.split('/')[2] || 'tiendaverde';
    }
    
    // Obtener configuración real de Firestore incluso en desarrollo
    const storeConfig = await getStoreConfigCached(storeSubdomain);
    if (storeConfig) {
      const { primaryLocale, singleLocaleUrls } = storeConfig;
      if (singleLocaleUrls) {
        return await handleSingleLocaleMode(req, storeSubdomain, primaryLocale);
      }
    }
  }
  
  console.log(`🔍 [Middleware] Processing: ${protocol}://${host}${nextUrl.pathname}`);
  
  // 🔥 REGLA 1: FORZAR HTTPS (SIEMPRE)
  if (protocol === 'http' && process.env.NODE_ENV === 'production') {
    const httpsUrl = new URL(req.url);
    httpsUrl.protocol = 'https:';
    console.log(`🔒 [Redirect] HTTP→HTTPS: ${req.url} → ${httpsUrl.href}`);
    return NextResponse.redirect(httpsUrl, 301);
  }
  
  // 🔥 REGLA 2: ELIMINAR WWW (SIEMPRE)
  if (host.startsWith('www.')) {
    const cleanHost = host.slice(4);
    const cleanUrl = new URL(req.url);
    cleanUrl.hostname = cleanHost;
    console.log(`🔒 [Redirect] WWW→CLEAN: ${host} → ${cleanHost}`);
    return NextResponse.redirect(cleanUrl, 301);
  }
  
  // 🔥 REGLA 3: SUBDOMINIO → DOMINIO PERSONALIZADO (SI EXISTE)
  if (host.endsWith('.shopifree.app') && host !== 'shopifree.app') {
    const subdomain = host.split('.')[0];
    const customDomain = await getCustomDomainCached(subdomain);
    
    if (customDomain) {
      const customUrl = new URL(req.url);
      customUrl.hostname = customDomain;
      console.log(`🔒 [Redirect] SUBDOMAIN→CUSTOM: ${host} → ${customDomain}`);
      return NextResponse.redirect(customUrl, 301);
    }
  }
  
  // Determinar si es una tienda pública (subdomain o custom domain)
  let storeSubdomain: string | null = null;
  
  if (host.endsWith('.shopifree.app') && host !== 'shopifree.app') {
    // Es un subdominio de Shopifree
    storeSubdomain = host.split('.')[0];
  } else if (!host.endsWith('.localhost') && host !== 'localhost') {
    // Podría ser un dominio personalizado
    storeSubdomain = await findSubdomainByCustomDomain(host);
  }
  
  // Si no es una tienda, continuar sin procesar
  if (!storeSubdomain) {
    return NextResponse.next();
  }
  
  // Obtener configuración de la tienda
  const storeConfig = await getStoreConfigCached(storeSubdomain);
  if (!storeConfig) {
    console.log(`❌ [Middleware] No se encontró configuración para tienda: ${storeSubdomain}`);
    return NextResponse.next();
  }
  
  const { primaryLocale, singleLocaleUrls } = storeConfig;
  const currentPath = nextUrl.pathname;
  const search = nextUrl.search;
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  // 🚀 NUEVA LÓGICA: Single Locale URLs
  if (singleLocaleUrls) {
    console.log(`🎯 [Single Locale] Procesando tienda ${storeSubdomain} con primaryLocale=${primaryLocale}`);
    
    // Detectar si la URL tiene prefijo de idioma
    const firstSegment = pathSegments[0];
    const hasLocalePrefix = ['es', 'en', 'pt'].includes(firstSegment);
    
    if (hasLocalePrefix) {
      // REDIRECT 301: /{locale}/(.*) → /(.*)
      const pathWithoutLocale = pathSegments.slice(1).join('/');
      const newPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/';
      const redirectUrl = new URL(newPath + search, req.url);
      
      console.log(`🔄 [301 Redirect] ${currentPath} → ${newPath} (single locale mode)`);
      return NextResponse.redirect(redirectUrl, 301);
    }
    
    // 🚀 REWRITE INTERNO: /(.*) → /{storeSubdomain}/(.*)
    if (currentPath === '/') {
      // Root path
      const rewritePath = `/${storeSubdomain}`;
      const rewriteUrl = new URL(rewritePath + search, req.url);
      console.log(`🔄 [Rewrite] ${currentPath} → ${rewritePath}`);
      return NextResponse.rewrite(rewriteUrl);
    } else {
      // Other paths
      const rewritePath = `/${storeSubdomain}${currentPath}`;
      const rewriteUrl = new URL(rewritePath + search, req.url);
      console.log(`🔄 [Rewrite] ${currentPath} → ${rewritePath}`);
      return NextResponse.rewrite(rewriteUrl);
    }
  }
  
  // 🔄 LÓGICA MEJORADA: Modo adaptativo basado en configuración
  console.log(`📚 [Adaptive Mode] Procesando tienda ${storeSubdomain} con URLs multi-idioma, primaryLocale=${primaryLocale}`);
  
  // NUEVO: Si está en root (/), verificar si deberíamos usar single locale mode automáticamente
  if (currentPath === '/') {
    // Para tiendas con dominio personalizado y configuradas en inglés o portugués,
    // probablemente quieren URLs sin prefijo de idioma
    const isCustomDomain = !host.endsWith('.shopifree.app');
    const isNonSpanish = primaryLocale !== 'es';
    
    if (isCustomDomain && isNonSpanish) {
      // Usar single locale mode automáticamente
      console.log(`🎯 [Auto Single Locale] Tienda con dominio personalizado y idioma ${primaryLocale}, usando modo sin prefijo`);
      const rewritePath = `/${storeSubdomain}`;
      const rewriteUrl = new URL(rewritePath + search, req.url);
      console.log(`🔄 [Rewrite] ${currentPath} → ${rewritePath}`);
      return NextResponse.rewrite(rewriteUrl);
    } else {
      // Usar legacy mode con prefijo de idioma
      const redirectUrl = new URL(`/${primaryLocale}`, req.url);
      console.log(`🔄 [Redirect] Root → primary locale: ${currentPath} → /${primaryLocale}`);
      return NextResponse.redirect(redirectUrl, 302);
    }
  }
  
  // Verificar si debemos usar modo adaptativo para esta tienda
  const isCustomDomain = !host.endsWith('.shopifree.app');
  const isNonSpanish = primaryLocale !== 'es';
  const shouldUseAdaptiveMode = isCustomDomain && isNonSpanish;
  
  if (shouldUseAdaptiveMode) {
    // MODO ADAPTATIVO: Redirigir URLs con prefijo de idioma a URLs sin prefijo
    const firstSegment = pathSegments[0];
    const hasLocalePrefix = ['es', 'en', 'pt'].includes(firstSegment);
    
    if (hasLocalePrefix) {
      // REDIRECT 301: /{locale}/(.*) → /(.*)
      const pathWithoutLocale = pathSegments.slice(1).join('/');
      const newPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/';
      const redirectUrl = new URL(newPath + search, req.url);
      console.log(`🔄 [301 Redirect Adaptive] ${currentPath} → ${newPath} (removing locale prefix)`);
      return NextResponse.redirect(redirectUrl, 301);
    }
    
    // REWRITE INTERNO: /(.*) → /{storeSubdomain}/(.*)
    const rewritePath = currentPath === '/' ? `/${storeSubdomain}` : `/${storeSubdomain}${currentPath}`;
    const rewriteUrl = new URL(rewritePath + search, req.url);
    console.log(`🔄 [Rewrite Adaptive] ${currentPath} → ${rewritePath}`);
    return NextResponse.rewrite(rewriteUrl);
  } else {
    // MODO LEGACY: URLs con prefijo de idioma
    // Si está en /locale sin tienda, rewrite a /locale/tienda
    if (pathSegments.length === 1 && ['es', 'en', 'pt'].includes(pathSegments[0])) {
      const rewritePath = `/${pathSegments[0]}/${storeSubdomain}`;
      const rewriteUrl = new URL(rewritePath + search, req.url);
      console.log(`🔄 [Rewrite] Locale only → store: ${currentPath} → ${rewritePath}`);
      return NextResponse.rewrite(rewriteUrl);
    }
    
    // Si la ruta no incluye el subdomain, agregarlo
    if (pathSegments.length >= 1 && !pathSegments.includes(storeSubdomain)) {
      const locale = pathSegments[0];
      if (['es', 'en', 'pt'].includes(locale)) {
        // Rewrite /es/categoria/algo → /es/tienda/categoria/algo
        const newPath = `/${locale}/${storeSubdomain}/${pathSegments.slice(1).join('/')}`;
        const rewriteUrl = new URL(newPath + search, req.url);
        console.log(`🔄 [Rewrite] Add subdomain: ${currentPath} → ${newPath}`);
        return NextResponse.rewrite(rewriteUrl);
      }
    }
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excluir solo archivos estáticos y API
    "/((?!_next|api|.*\\..*).*)"
  ]
};