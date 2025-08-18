import { resolveStoreFromRequest } from '../../lib/resolve-store';

export async function GET(request: Request) {
  const resolved = await resolveStoreFromRequest(request, {});
  console.log('🗂️ [Sitemap Index] Store resuelto:', resolved);
  
  const { canonicalHost, storeSubdomain } = resolved;
  const isCustomDomain = !request.url.includes('shopifree.app') && !request.url.includes('localhost');
  
  // Armar el índice según el tipo de dominio
  let sitemapIndex: string;
  const lastmod = new Date().toISOString().split('T')[0];
  
  if (isCustomDomain && storeSubdomain) {
    // En dominio personalizado: listar sólo hijos reales
    sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${canonicalHost}/es/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
  } else if (storeSubdomain) {
    // Para subdominios de plataforma: formato con múltiples idiomas
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopifree.app';
    sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/es/${storeSubdomain}/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/en/${storeSubdomain}/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
  } else {
    // Fallback básico
    sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${canonicalHost}/es/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>
</sitemapindex>`;
  }

  return new Response(sitemapIndex, {
    headers: { 
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}