export async function GET(
  request: Request,
  { params }: { params: { storeSubdomain: string; locale: string } }
) {
  const { storeSubdomain, locale } = params;
  
  // Construir URL base
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopifree.app';
  const sitemapUrl = `${baseUrl}/${locale}/${storeSubdomain}/sitemap.xml`;
  
  const robotsTxt = `User-agent: *
Allow: /

# Sitemap específico de esta tienda
Sitemap: ${sitemapUrl}

# Bloquear archivos y directorios no relevantes para SEO
Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /dashboard/
`;

  return new Response(robotsTxt, {
    headers: { 
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400' // Cache 24h
    }
  });
}
