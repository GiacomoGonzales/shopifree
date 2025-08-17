import { getStoreIdBySubdomain } from '../../../../lib/store';
import { getStoreCategories } from '../../../../lib/categories';
import { getStoreProducts } from '../../../../lib/products';

export async function GET(
  request: Request,
  { params }: { params: { storeSubdomain: string; locale: string } }
) {
  const { storeSubdomain, locale } = params;
  const baseUrl = `http://localhost:3004/${locale}/${storeSubdomain}`;
  
  // Página principal (siempre presente)
  let urls = `
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  try {
    // Intentar obtener categorías reales
    console.log('🔍 [SITEMAP] Obteniendo storeId para:', storeSubdomain);
    const storeId = await getStoreIdBySubdomain(storeSubdomain);
    console.log('🔍 [SITEMAP] StoreId obtenido:', storeId);
    
    if (storeId) {
      console.log('🔍 [SITEMAP] Obteniendo categorías para storeId:', storeId);
      const categories = await getStoreCategories(storeId);
      console.log('🔍 [SITEMAP] Categorías obtenidas:', categories?.length || 0, categories);
      
      if (categories && categories.length > 0) {
        // Agregar categorías reales
        console.log('✅ [SITEMAP] Usando categorías reales');
        categories.forEach(category => {
          console.log('🔍 [SITEMAP] Procesando categoría:', category.slug, category.name);
          if (category.slug) {
            urls += `
  <url>
    <loc>${baseUrl}/categoria/${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
          }
        });
      } else {
        // Fallback: categorías de ejemplo si no hay reales
        console.log('⚠️ [SITEMAP] No hay categorías, usando fallback');
        urls += `
  <url>
    <loc>${baseUrl}/categoria/vestidos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/categoria/blusas</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
      }

      // Obtener productos reales
      console.log('🔍 [SITEMAP] Obteniendo productos para storeId:', storeId);
      const products = await getStoreProducts(storeId);
      console.log('🔍 [SITEMAP] Productos obtenidos:', products?.length || 0);
      
      if (products && products.length > 0) {
        console.log('✅ [SITEMAP] Usando productos reales');
        products.forEach(product => {
          // Usar ID del producto (que es lo que funciona actualmente)
          const productUrl = product.id;
          
          console.log('🔍 [SITEMAP] Procesando producto:', productUrl, product.name);
          if (productUrl) {
            // Manejar fecha de creación de forma segura
            let lastmod;
            try {
              if (product.createdAt) {
                const date = typeof product.createdAt === 'string' ? new Date(product.createdAt) : product.createdAt.toDate();
                lastmod = date.toISOString().split('T')[0];
              }
            } catch (e) {
              console.warn('Error procesando fecha para producto', product.id, e);
              lastmod = undefined;
            }
            
            urls += `
  <url>
    <loc>${baseUrl}/producto/${productUrl}</loc>${lastmod ? `
    <lastmod>${lastmod}</lastmod>` : ''}
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
          }
        });
      } else {
        console.log('⚠️ [SITEMAP] No hay productos, usando fallback');
        // Productos de ejemplo como fallback
        urls += `
  <url>
    <loc>${baseUrl}/producto/vestido-1</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/producto/blusa-1</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
      }
    } else {
      console.log('❌ [SITEMAP] No se pudo obtener storeId');
    }
    
  } catch (error) {
    console.error('Error obteniendo datos del sitemap:', error);
    // En caso de error, usar fallback estático
    urls += `
  <url>
    <loc>${baseUrl}/categoria/vestidos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/categoria/blusas</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/producto/vestido-1</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>${baseUrl}/producto/blusa-1</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml',
    }
  });
}
