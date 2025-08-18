import { resolveStoreFromRequest } from '../../lib/resolve-store';

export async function GET(request: Request) {
  console.log('🤖 [Robots Global] Generando robots.txt para request:', request.url);
  
  const resolved = await resolveStoreFromRequest(request, {});
  console.log('🤖 [Robots Global] Store resuelto:', resolved);
  
  const { canonicalHost, storeSubdomain } = resolved;
  
  let robotsTxt: string;
  
  if (storeSubdomain) {
    // Para tiendas válidas: incluir sitemaps del host canónico
    robotsTxt = `User-agent: *
Allow: /

# Sitemaps para ${storeSubdomain}
Sitemap: ${canonicalHost}/sitemap.xml
Sitemap: ${canonicalHost}/es/sitemap.xml

# Disallow paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /dashboard/
`;
  } else {
    // Para requests sin tienda válida: robots básico
    robotsTxt = `User-agent: *
Allow: /

# Sitemap básico
Sitemap: ${canonicalHost}/sitemap.xml

# Disallow paths
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /dashboard/
`;
  }

  return new Response(robotsTxt, {
    headers: { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}