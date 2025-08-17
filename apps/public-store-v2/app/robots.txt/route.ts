export const runtime = 'nodejs';
export const dynamic = 'force-dynamic'; // Forzar dinámico para evitar build errors

export async function GET() {
  // Robots.txt básico para la plataforma - los dominios personalizados usan su propio robots
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopifree.app';
  
  const robotsContent = `User-agent: *
Allow: /

Sitemap: ${baseUrl}/sitemap.xml

Disallow: /api/
Disallow: /_next/
Disallow: /admin/
Disallow: /dashboard/
`;
  
  return new Response(robotsContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
    },
  });
}