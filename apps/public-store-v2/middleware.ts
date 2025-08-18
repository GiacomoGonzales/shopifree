import { NextRequest, NextResponse } from "next/server";

interface CustomDomainCache {
  [subdomain: string]: { domain: string | null; expires: number };
}

const customDomainCache: CustomDomainCache = {};

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

export async function middleware(req: NextRequest) {
  const { nextUrl } = req;
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || nextUrl.protocol.slice(0, -1);
  
  // Skip middleware para archivos estáticos y API routes
  if (nextUrl.pathname.startsWith('/_next') || 
      nextUrl.pathname.startsWith('/api') ||
      nextUrl.pathname.includes('.')) {
    return NextResponse.next();
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
  
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Excluir solo archivos estáticos y API
    "/((?!_next|api|.*\\..*).*)"
  ]
};