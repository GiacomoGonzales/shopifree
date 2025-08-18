export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  
  // Detectar si es dominio personalizado
  const isCustomDomain = !requestUrl.hostname.endsWith('shopifree.app') && 
                         !requestUrl.hostname.endsWith('localhost') && 
                         requestUrl.hostname !== 'localhost';
  
  let baseUrl: string;
  
  if (isCustomDomain) {
    // Para dominios personalizados: https://lunara-store.xyz
    baseUrl = `${requestUrl.protocol}//${requestUrl.hostname}`;
  } else {
    // Para subdominios de shopifree: https://shopifree.app
    baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopifree.app';
  }
  
  // Para dominios personalizados, apuntar al sitemap que SÍ funciona  
  let sitemapIndex: string;
  
  if (isCustomDomain) {
    // Para dominios personalizados: usar el formato que funciona
    sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/es/lunara/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
</sitemapindex>`;
  } else {
    // Para subdominios de plataforma: formato normal
    sitemapIndex = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <sitemap>
    <loc>${baseUrl}/es/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
  </sitemap>
  <sitemap>
    <loc>${baseUrl}/en/sitemap.xml</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
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