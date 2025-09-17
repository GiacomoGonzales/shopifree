import { NextRequest, NextResponse } from "next/server";
import { middlewareLogger } from "./lib/logger";

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
    middlewareLogger.error('Error getting custom domain:', error);
    // Cache negative result on error
    customDomainCache[subdomain] = { domain: null, expires: now + 60000 }; // 1 min on error
    return null;
  }
}

async function findSubdomainByCustomDomain(hostname: string): Promise<string | null> {
  try {
    middlewareLogger.debug(`Searching for hostname: ${hostname}`);
    
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      middlewareLogger.warn(`Missing env vars: projectId=${!!projectId}, apiKey=${!!apiKey}`);
      return null;
    }
    
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
    
    if (!storeQuery.ok) {
      middlewareLogger.warn(`Store query failed: ${storeQuery.status}`);
      return null;
    }
    
    const storeData = await storeQuery.json();
    if (!Array.isArray(storeData)) {
      middlewareLogger.warn(`Invalid store data format`);
      return null;
    }
    
    middlewareLogger.debug(`Found ${storeData.length} stores to check`);
    
    // Para cada tienda, verificar su dominio personalizado
    for (const row of storeData) {
      const storeDoc = row?.document;
      if (!storeDoc) continue;
      
      const storeId = storeDoc.name.split('/').pop();
      const subdomain = storeDoc.fields?.subdomain?.stringValue;
      
      if (!subdomain) continue;
      
      middlewareLogger.debug(`Checking store ${subdomain} (${storeId})`);
      
      // Verificar dominio personalizado
      const domainQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`);
      
      middlewareLogger.debug(`Domain query status for ${subdomain}: ${domainQuery.status}`);
      
      if (domainQuery.ok) {
        const domainDoc = await domainQuery.json();
        middlewareLogger.debug(`Domain doc for ${subdomain}:`, JSON.stringify(domainDoc, null, 2));
        
        const customDomain = domainDoc?.fields?.customDomain?.stringValue;
        const status = domainDoc?.fields?.status?.stringValue;
        
        if (customDomain) {
          middlewareLogger.debug(`Found domain ${customDomain} (status: ${status}) for ${subdomain}`);
          
          if (status === 'connected' && customDomain.toLowerCase() === hostname.toLowerCase()) {
            middlewareLogger.info(`Match found! ${hostname} → ${subdomain}`);
            return subdomain;
          }
        } else {
          middlewareLogger.debug(`No customDomain field found for store ${subdomain}`);
        }
      } else {
        middlewareLogger.warn(`Domain query failed for store ${subdomain}: ${domainQuery.status} ${domainQuery.statusText}`);
      }
    }
    
    middlewareLogger.debug(`No match found for ${hostname}`);
    return null;
  } catch (error) {
    middlewareLogger.error('findSubdomainByCustomDomain error:', error);
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
    
    middlewareLogger.info(`Store config ${storeSubdomain}: primaryLocale=${primaryLocale}`);
    
    return {
      primaryLocale,
      storeId
    };
    
  } catch (error) {
    middlewareLogger.error('Error getting store config:', error);
    return null;
  }
}

// 🚀 Función helper para manejar single locale mode
async function handleSimpleMode(req: NextRequest, storeSubdomain: string, isLocalDev: boolean = false): Promise<NextResponse> {
  const { nextUrl } = req;
  const currentPath = nextUrl.pathname;
  const search = nextUrl.search;
  
  const pathSegments = currentPath.split('/').filter(Boolean);
  
  middlewareLogger.debug(`Simple mode processing store ${storeSubdomain}, isLocalDev: ${isLocalDev}`);

  // Detectar si la URL tiene prefijo de idioma
  const firstSegment = pathSegments[0];
  const hasLocalePrefix = ['es', 'en', 'pt'].includes(firstSegment);

  if (hasLocalePrefix) {
    // REDIRECT 301: /{locale}/(.*) → /(.*)
    const pathWithoutLocale = pathSegments.slice(1).join('/');
    const newPath = pathWithoutLocale ? `/${pathWithoutLocale}` : '/';
    const redirectUrl = new URL(newPath + search, req.url);

    middlewareLogger.info(`301 Redirect ${currentPath} → ${newPath} (simple mode)`);
    return NextResponse.redirect(redirectUrl, 301);
  }

  // 🚀 REWRITE INTERNO: Solo para desarrollo local
  if (isLocalDev) {
    if (currentPath === '/') {
      // Root path
      const rewritePath = `/${storeSubdomain}`;
      const rewriteUrl = new URL(rewritePath + search, req.url);
      middlewareLogger.debug(`Local rewrite ${currentPath} → ${rewritePath}`);
      return NextResponse.rewrite(rewriteUrl);
    } else {
      // Other paths
      const rewritePath = `/${storeSubdomain}${currentPath}`;
      const rewriteUrl = new URL(rewritePath + search, req.url);
      middlewareLogger.debug(`Local rewrite ${currentPath} → ${rewritePath}`);
      return NextResponse.rewrite(rewriteUrl);
    }
  }
  
  // 🚀 PRODUCCIÓN: Para subdominios y dominios personalizados, hacer rewrite automático
  if (currentPath === '/') {
    // Root path - rewrite a la página principal de la tienda
    const rewritePath = `/${storeSubdomain}`;
    const rewriteUrl = new URL(rewritePath + search, req.url);
    middlewareLogger.debug(`Production rewrite ${currentPath} → ${rewritePath} (store: ${storeSubdomain})`);
    return NextResponse.rewrite(rewriteUrl);
  } else {
    // Other paths - rewrite agregando el subdomain
    const rewritePath = `/${storeSubdomain}${currentPath}`;
    const rewriteUrl = new URL(rewritePath + search, req.url);
    middlewareLogger.debug(`Production rewrite ${currentPath} → ${rewritePath} (store: ${storeSubdomain})`);
    return NextResponse.rewrite(rewriteUrl);
  }
}

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || nextUrl.protocol.slice(0, -1);
  
  // DEBUG: Log every request to understand what's happening
  middlewareLogger.debug(`${protocol}://${host}${nextUrl.pathname} - UA: ${req.headers.get('user-agent')?.slice(0, 50)}`);
  
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
    middlewareLogger.debug(`Local dev - Host: ${host}, Path: ${nextUrl.pathname}`);
    
    const pathSegments = nextUrl.pathname.split('/').filter(Boolean);
    
    // Si la URL incluye el subdomain (ej: /tiendaverde/producto/algo)
    if (pathSegments.length > 0 && !['producto', 'categoria', 'api', '_next'].includes(pathSegments[0])) {
      const storeSubdomain = pathSegments[0];
      
      // Remover el subdomain del path y crear nueva URL
      const pathWithoutSubdomain = pathSegments.slice(1).join('/');
      const newPath = pathWithoutSubdomain ? `/${pathWithoutSubdomain}` : '/';
      
      middlewareLogger.debug(`Local dev detected subdomain: ${storeSubdomain}, rewriting ${nextUrl.pathname} → ${newPath}`);
      
      // Crear nueva request con el path limpio
      const newUrl = new URL(newPath + nextUrl.search, req.url);
      const newReq = new NextRequest(newUrl, {
        headers: req.headers,
        method: req.method,
      });
      
      return await handleSimpleMode(newReq, storeSubdomain, true);
    }
    
    // Si es una URL directa sin subdomain (ej: /producto/algo)
    middlewareLogger.debug(`Local dev direct URL, using default store: tiendaverde`);
    return await handleSimpleMode(req, 'tiendaverde', true);
  }
  
  middlewareLogger.debug(`Processing: ${protocol}://${host}${nextUrl.pathname}`);
  
  // 🔥 REGLA 1: FORZAR HTTPS (SIEMPRE)
  if (protocol === 'http' && process.env.NODE_ENV === 'production') {
    const httpsUrl = new URL(req.url);
    httpsUrl.protocol = 'https:';
    middlewareLogger.info(`Redirect HTTP→HTTPS: ${req.url} → ${httpsUrl.href}`);
    return NextResponse.redirect(httpsUrl, 301);
  }
  
  // 🔥 REGLA 2: ELIMINAR WWW (SIEMPRE)
  if (host.startsWith('www.')) {
    const cleanHost = host.slice(4);
    const cleanUrl = new URL(req.url);
    cleanUrl.hostname = cleanHost;
    middlewareLogger.info(`Redirect WWW→CLEAN: ${host} → ${cleanHost}`);
    return NextResponse.redirect(cleanUrl, 301);
  }
  
  // 🔥 REGLA 3: SUBDOMINIO → DOMINIO PERSONALIZADO (SI EXISTE)
  if (host.endsWith('.shopifree.app') && host !== 'shopifree.app') {
    const subdomain = host.split('.')[0];
    const customDomain = await getCustomDomainCached(subdomain);
    
    if (customDomain) {
      const customUrl = new URL(req.url);
      customUrl.hostname = customDomain;
      middlewareLogger.info(`Redirect SUBDOMAIN→CUSTOM: ${host} → ${customDomain}`);
      return NextResponse.redirect(customUrl, 301);
    }
  }
  
  // Determinar si es una tienda pública (subdomain o custom domain)
  let storeSubdomain: string | null = null;
  
  if (host.endsWith('.shopifree.app') && host !== 'shopifree.app') {
    // Es un subdominio de Shopifree
    storeSubdomain = host.split('.')[0];
    middlewareLogger.debug(`Shopifree subdomain detected: ${storeSubdomain}`);
  } else if (!host.endsWith('.localhost') && host !== 'localhost') {
    // Podría ser un dominio personalizado
    middlewareLogger.debug(`Checking for custom domain: ${host}`);
    storeSubdomain = await findSubdomainByCustomDomain(host);
    middlewareLogger.debug(`Custom domain lookup result: ${storeSubdomain || 'not found'}`);
  } else {
    middlewareLogger.debug(`Localhost or ignored domain: ${host}`);
  }
  
  // Si no es una tienda, continuar sin procesar
  if (!storeSubdomain) {
    middlewareLogger.debug(`No store found for host: ${host}, continuing without processing`);
    return NextResponse.next();
  }
  
  // Obtener configuración de la tienda
  const storeConfig = await getStoreConfigCached(storeSubdomain);
  if (!storeConfig) {
    middlewareLogger.warn(`No store configuration found for: ${storeSubdomain}`);
    return NextResponse.next();
  }
  
  // MODO SIMPLE: Todas las tiendas usan URLs sin prefijos
  middlewareLogger.debug(`Simple mode processing store: ${storeSubdomain}`);
    return await handleSimpleMode(req, storeSubdomain, false);
}

export const config = {
  matcher: [
    // Excluir archivos estáticos, API, sitemap y robots
    "/((?!_next|api|sitemap\\.xml|robots\\.txt|.*\\..*).*)"
  ]
};