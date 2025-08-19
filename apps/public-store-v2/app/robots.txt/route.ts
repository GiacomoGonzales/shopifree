import { getCanonicalHost } from '../../lib/canonical-resolver';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  let storeSubdomain: string | null = null;
  
  console.log('🤖 [Robots] Procesando request para:', requestUrl.hostname);
  
  // Detectar subdomain
  if (requestUrl.hostname.endsWith('.shopifree.app')) {
    storeSubdomain = requestUrl.hostname.split('.')[0];
  } else if (requestUrl.hostname !== 'localhost' && !requestUrl.hostname.endsWith('.vercel.app')) {
    // Buscar subdomain por dominio personalizado
    storeSubdomain = await findSubdomainByCustomDomain(requestUrl.hostname);
  }
  
  if (!storeSubdomain) {
    console.log('❌ [Robots] No se encontró tienda para:', requestUrl.hostname);
    // Robots básico para dominios sin tienda
    const robotsTxt = `User-agent: *
Disallow: /

# No sitemap - domain not configured
`;
    return new Response(robotsTxt, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }
  
  // Obtener canonical host
  const canonical = await getCanonicalHost(storeSubdomain);
  
  console.log('✅ [Robots] Canonical host para', storeSubdomain, ':', canonical.canonicalHost);
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap oficial único
Sitemap: ${canonical.canonicalHost}/sitemap.xml

# Disallow paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /dashboard/
`;

  return new Response(robotsTxt, {
    status: 200,
    headers: { 
      'Content-Type': 'text/plain; charset=UTF-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// Reutilizar función del sitemap
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
    console.error('❌ [Robots] Error finding subdomain by custom domain:', error);
    return null;
  }
}