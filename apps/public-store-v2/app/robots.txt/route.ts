// No necesitamos importar store para este caso global

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
  
  const robotsTxt = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml
Sitemap: ${baseUrl}/es/sitemap.xml

Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /dashboard/
`;

  return new Response(robotsTxt, {
    headers: { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}