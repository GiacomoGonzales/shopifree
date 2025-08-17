export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const { locale } = params;
  const requestUrl = new URL(request.url);
  
  // Detectar si es dominio personalizado
  const isCustomDomain = !requestUrl.hostname.endsWith('shopifree.app') && 
                         !requestUrl.hostname.endsWith('localhost') && 
                         requestUrl.hostname !== 'localhost';
  
  let sitemapUrl: string;
  
  if (isCustomDomain) {
    // Para dominios personalizados: https://lunara-store.xyz/es/sitemap.xml
    sitemapUrl = `${requestUrl.protocol}//${requestUrl.hostname}/${locale}/sitemap.xml`;
  } else {
    // Para subdominios de shopifree: https://shopifree.app/es/storeSubdomain/sitemap.xml
    // Extraer storeSubdomain del hostname
    const subdomain = requestUrl.hostname.split('.')[0];
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopifree.app';
    sitemapUrl = `${baseUrl}/${locale}/${subdomain}/sitemap.xml`;
  }
  
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${sitemapUrl}

Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /dashboard/
`;

  return new Response(robotsTxt, {
    headers: { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600' // Cache 1h para actualizaciones más rápidas
    }
  });
}
