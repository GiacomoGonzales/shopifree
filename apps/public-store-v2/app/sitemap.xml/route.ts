import { resolveStoreFromRequest } from '../../lib/resolve-store';
import { VALID_LOCALES } from '../../lib/locale-validation';

export async function GET(request: Request) {
  const resolved = await resolveStoreFromRequest(request, {});
  console.log('🗂️ [Sitemap Index] Store resuelto:', resolved);
  
  const { canonicalHost, storeSubdomain, isCustomDomain } = resolved;
  
  // Armar el índice según el tipo de dominio
  let sitemapIndex: string;
  const lastmod = new Date().toISOString().split('T')[0];
  
  if (storeSubdomain) {
    // Para tiendas válidas: generar índice con solo locales válidos
    const sitemaps = VALID_LOCALES.map(locale => `  <sitemap>
    <loc>${canonicalHost}/${locale}/sitemap.xml</loc>
    <lastmod>${lastmod}</lastmod>
  </sitemap>`).join('\n');
    
    sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${sitemaps}
</sitemapindex>`;
  } else {
    // Fallback básico: solo español
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
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}