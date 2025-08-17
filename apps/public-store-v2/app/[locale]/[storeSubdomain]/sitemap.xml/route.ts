import { getStoreIdBySubdomain, getStoreBasicInfo } from '../../../../lib/store';
import { getStoreCategories } from '../../../../lib/categories';
import { getStoreProducts } from '../../../../lib/products';

export async function GET(
  request: Request,
  { params }: { params: { storeSubdomain: string; locale: string } }
) {
  try {
    const { storeSubdomain, locale } = params;
    
    // Obtener datos de la tienda
    const storeId = await getStoreIdBySubdomain(storeSubdomain);
    if (!storeId) {
      return new Response('Store not found', { status: 404 });
    }

    const [storeInfo, categories, products] = await Promise.all([
      getStoreBasicInfo(storeId),
      getStoreCategories(storeId),
      getStoreProducts(storeId)
    ]);

    // Construir URL base
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopifree.app';
    const storeBaseUrl = `${baseUrl}/${locale}/${storeSubdomain}`;

    // Función para generar entradas de sitemap
    const generateSitemapEntry = (url: string, lastmod?: string, changefreq: string = 'weekly', priority: string = '0.8') => {
      return `
  <url>
    <loc>${url}</loc>
    ${lastmod ? `<lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
    };

    let urls = '';

    // 1. Página principal de la tienda
    urls += generateSitemapEntry(storeBaseUrl, new Date().toISOString().split('T')[0], 'daily', '1.0');

    // 2. Páginas de categorías
    if (categories && categories.length > 0) {
      categories.forEach(category => {
        const categoryUrl = `${storeBaseUrl}/categoria/${category.slug}`;
        urls += generateSitemapEntry(categoryUrl, undefined, 'weekly', '0.9');
      });
    }

    // 3. Páginas de productos
    if (products && products.length > 0) {
      products.forEach(product => {
        const productUrl = `${storeBaseUrl}/producto/${product.slug}`;
        // Usar fecha de actualización del producto si existe
        const lastmod = product.updatedAt ? new Date(product.updatedAt).toISOString().split('T')[0] : undefined;
        urls += generateSitemapEntry(productUrl, lastmod, 'monthly', '0.8');
      });
    }

    // 4. Páginas adicionales comunes
    const additionalPages = [
      { url: `${storeBaseUrl}/catalogo`, priority: '0.7' },
      // Agregar más páginas según sea necesario
    ];

    additionalPages.forEach(page => {
      urls += generateSitemapEntry(page.url, undefined, 'monthly', page.priority);
    });

    // Generar XML completo
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600, s-maxage=86400' // Cache 1h en navegador, 24h en CDN
      }
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
    
    // Sitemap de fallback en caso de error
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${process.env.NEXT_PUBLIC_APP_URL || 'https://shopifree.app'}/${params.locale}/${params.storeSubdomain}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>`;

    return new Response(fallbackXml, {
      headers: { 'Content-Type': 'application/xml' }
    });
  }
}
