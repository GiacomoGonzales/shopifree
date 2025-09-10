import { NextRequest, NextResponse } from "next/server";

interface CustomDomainCache {
  [subdomain: string]: { domain: string | null; expires: number };
}

interface StoreConfigCache {
  [storeId: string]: { 
    primaryLocale: string; 
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
        storeId
      };
    }
    
    // Extract store configuration
    const fields = storeDoc.fields || {};
    
    // Get primary locale from advanced.language field, fallback to 'es'
    const language = fields.advanced?.mapValue?.fields?.language?.stringValue || 'es';
    
    // Ensure we validate the language correctly
    const primaryLocale = ['es', 'en', 'pt'].includes(language) ? language : 'es';
    
    // Cache result for 5 minutes
    storeConfigCache[storeId] = {
      primaryLocale,
      expires: now + 300000
    };
    
    console.log(`🏪 [Store Config] ${storeSubdomain}: primaryLocale=${primaryLocale}`);
    
    return {
      primaryLocale,
      storeId
    };
    
  } catch (error) {
    console.error('Error getting store config:', error);
    return null;
  }
}

// 🚀 Función helper para manejar single locale mode
async function handleSimpleMode(req: NextRequest, storeSubdomain: string, isLocalDev: boolean = false): Promise<NextResponse> {
  const { nextUrl } = req;
  const currentPath = nextUrl.pathname;
  const search = nextUrl.search;
  
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  console.log(`🎯 [Simple Mode] Procesando tienda ${storeSubdomain}, isLocalDev: ${isLocalDev}`);

  // Detectar si la URL tiene prefijo de idioma
  const firstSegment = pathSegments[0];
  const hasLocalePrefix = ['es', 'en', 'pt'].includes(firstSegment);

  if (hasLocalePrefix) {
    // REDIRECT 301: /{locale}/(.*) → /(.*)
    const pathWithoutLocale = pathSegments.slice(1).join('/');
    const newPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/';
    const redirectUrl = new URL(newPath + search, req.url);

    console.log(`🔄 [301 Redirect] ${currentPath} → ${newPath} (simple mode)`);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 🚀 REWRITE INTERNO: Solo para desarrollo local
  if (isLocalDev) {
    if (currentPath === '/') {
      // Root path
      const rewritePath = `/${storeSubdomain}`;
      const rewriteUrl = new URL(rewritePath + search, req.url);
      console.log(`🔄 [Local Rewrite] ${currentPath} → ${rewritePath}`);
      return NextResponse.rewrite(rewriteUrl);
    } else {
      // Other paths
      const rewritePath = `/${storeSubdomain}${currentPath}`;
      const rewriteUrl = new URL(rewritePath + search, req.url);
      console.log(`🔄 [Local Rewrite] ${currentPath} → ${rewritePath}`);
      return NextResponse.rewrite(rewriteUrl);
    }
  }
  
  // 🚀 PRODUCCIÓN: Para subdominios y dominios personalizados, hacer rewrite automático
  if (currentPath === '/') {
    // Root path - rewrite a la página principal de la tienda
    const rewritePath = `/${storeSubdomain}`;
    const rewriteUrl = new URL(rewritePath + search, req.url);
    console.log(`🔄 [Production Rewrite] ${currentPath} → ${rewritePath} (tienda: ${storeSubdomain})`);
    return NextResponse.rewrite(rewriteUrl);
  } else {
    // Other paths - rewrite agregando el subdomain
    const rewritePath = `/${storeSubdomain}${currentPath}`;
    const rewriteUrl = new URL(rewritePath + search, req.url);
    console.log(`🔄 [Production Rewrite] ${currentPath} → ${rewritePath} (tienda: ${storeSubdomain})`);
    return NextResponse.rewrite(rewriteUrl);
  }
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || nextUrl.protocol.slice(0, -1);
  
  // DEBUG: Log every request to understand what's happening
  console.log(`🚀 [MIDDLEWARE] ${protocol}://${host}${nextUrl.pathname} - UA: ${req.headers.get('user-agent')?.slice(0, 50)}`);
  
  // Skip middleware para archivos estáticos, API routes, dashboard, sitemap y robots
  if (nextUrl.pathname.startsWith('/_next') || 
      nextUrl.pathname.startsWith('/api') ||
      nextUrl.pathname.startsWith('/dashboard') ||
      nextUrl.pathname === '/sitemap.xml' ||
      nextUrl.pathname === '/robots.txt' ||
      nextUrl.pathname.includes('.')) {
    return NextResponse.next();
  }

  // 🧪 MODO DESARROLLO LOCAL: Configuración especial para testing
  const isLocalDev = host.includes('localhost') || host.includes('127.0.0.1');
  if (isLocalDev) {
    console.log(`🧪 [Local Dev] Host: ${host}, Path: ${nextUrl.pathname}`);
    
    const pathSegments = nextUrl.pathname.split('/').filter(Boolean);
    
    // Si la URL incluye el subdomain (ej: /tiendaverde/producto/algo)
    if (pathSegments.length > 0 && !['producto', 'categoria', 'api', '_next'].includes(pathSegments[0])) {
      const storeSubdomain = pathSegments[0];
      
      // Remover el subdomain del path y crear nueva URL
      const pathWithoutSubdomain = pathSegments.slice(1).join('/');
      const newPath = pathWithoutSubdomain ? `/${pathWithoutSubdomain}` : '/';
      
      console.log(`🔧 [Local Dev] Detected subdomain: ${storeSubdomain}, rewriting ${nextUrl.pathname} → ${newPath}`);
      
      // Crear nueva request con el path limpio
      const newUrl = new URL(newPath + nextUrl.search, req.url);
      const newReq = new NextRequest(newUrl, {
        headers: req.headers,
        method: req.method,
      });
      
      return await handleSimpleMode(newReq, storeSubdomain, true);
    }
    
    // Si es una URL directa sin subdomain (ej: /producto/algo)
    console.log(`📋 [Local Dev] Direct URL, using default store: tiendaverde`);
    return await handleSimpleMode(req, 'tiendaverde', true);
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
  
  // MODO SIMPLE: Todas las tiendas usan URLs sin prefijos
  console.log(`🎯 [Simple Mode] Procesando tienda: ${storeSubdomain}`);
    return await handleSimpleMode(req, storeSubdomain, false);
}

export const config = {
  matcher: [
    // Excluir archivos estáticos, API, sitemap y robots
    "/((?!_next|api|sitemap\\.xml|robots\\.txt|.*\\..*).*)"
  ]
};