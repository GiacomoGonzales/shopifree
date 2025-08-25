// Forzar renderización dinámica - el sitemap debe ser dinámico por naturaleza
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Usar headers para obtener el hostname
    const hostname = request.headers.get('host') || '';
    
    // Detectar el protocolo (http o https)
    const protocol = request.headers.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${hostname}`;
    
    console.log('🗺️ [Sitemap] Generando sitemap básico para:', baseUrl);
    
    // Generar sitemap ultra simplificado - solo URLs estáticas básicas
    const sitemap = generateBasicSitemap(baseUrl);
    
    return new Response(sitemap, {
      status: 200,
      headers: { 
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'index'
      }
    });
  } catch (error) {
    console.error('❌ [Sitemap] Error:', error);
    
    // Retornar sitemap mínimo válido en caso de error
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://example.com</loc>
    <lastmod>2024-01-01</lastmod>
  </url>
</urlset>`, {
      status: 200,
      headers: { 
        'Content-Type': 'application/xml; charset=UTF-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }
}

// Función ultra básica para generar sitemap
function generateBasicSitemap(baseUrl: string): string {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/catalogo</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/ofertas</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/favoritos</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>`;
}