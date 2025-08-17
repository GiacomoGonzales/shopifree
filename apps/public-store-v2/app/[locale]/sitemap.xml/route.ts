import { getStoreIdBySubdomain } from '../../../lib/store';
import { getStoreCategories } from '../../../lib/categories';
import { getStoreProducts } from '../../../lib/products';

export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const { locale } = params;
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname;

  console.log('🗺️ [Sitemap Custom Domain] Generando sitemap para:', { locale, hostname });

  // Para dominios personalizados, usar el hostname completo como subdomain para búsqueda
  const storeSubdomain = hostname;
  const baseUrl = `${requestUrl.protocol}//${hostname}`;

  console.log('🌐 [Sitemap Custom Domain] Configuración:', { baseUrl, storeSubdomain });

  // Obtener storeId
  const storeId = await getStoreIdBySubdomain(storeSubdomain);
  console.log('🔍 [Sitemap Custom Domain] Store ID encontrado:', storeId);

  if (!storeId) {
    console.log('❌ [Sitemap Custom Domain] No se encontró store para hostname:', storeSubdomain);
    // Devolver sitemap básico si no se encuentra la tienda
    const fallbackSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/${locale}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;
    
    return new Response(fallbackSitemap, {
      headers: { 
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  }

  let urls = '';

  // URL de home
  urls += `  <url>
    <loc>${baseUrl}/${locale}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
`;

  // Obtener categorías
  try {
    const categories = await getStoreCategories(storeId);
    console.log('📂 [Sitemap Custom Domain] Categorías encontradas:', categories?.length || 0);

    if (categories && categories.length > 0) {
      categories.forEach((category) => {
        const categoryUrl = encodeURIComponent(category.slug || category.name.toLowerCase().replace(/\s+/g, '-'));
        urls += `  <url>
    <loc>${baseUrl}/${locale}/categoria/${categoryUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
      });
    }
  } catch (error) {
    console.error('❌ [Sitemap Custom Domain] Error obteniendo categorías:', error);
  }

  // Obtener productos
  try {
    const products = await getStoreProducts(storeId);
    console.log('🛍️ [Sitemap Custom Domain] Productos encontrados:', products?.length || 0);

    if (products && products.length > 0) {
      products.forEach((product) => {
        // Usar product.id para la URL (como en el routing real)
        const productUrl = product.id;
        
        // Generar lastmod desde createdAt si existe
        let lastmod = '';
        if (product.createdAt) {
          try {
            let date: Date;
            if (typeof product.createdAt === 'string') {
              date = new Date(product.createdAt);
            } else if (product.createdAt && typeof product.createdAt === 'object' && 'toDate' in product.createdAt) {
              date = (product.createdAt as any).toDate();
            } else {
              date = new Date();
            }
            lastmod = `
    <lastmod>${date.toISOString().split('T')[0]}</lastmod>`;
          } catch (e) {
            console.log('⚠️ [Sitemap Custom Domain] Error parseando fecha del producto:', product.id, e);
          }
        }

        urls += `  <url>
    <loc>${baseUrl}/${locale}/producto/${productUrl}</loc>${lastmod}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
      });
    }
  } catch (error) {
    console.error('❌ [Sitemap Custom Domain] Error obteniendo productos:', error);
  }

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}</urlset>`;

  console.log('✅ [Sitemap Custom Domain] Sitemap generado exitosamente:', { locale, storeSubdomain, urls: urls.split('<url>').length - 1 });

  return new Response(sitemap, {
    headers: { 
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}
