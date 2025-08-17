import { getStoreIdBySubdomain } from '../../../../lib/store';
import { getStoreCategories } from '../../../../lib/categories';
import { getStoreProducts } from '../../../../lib/products';

export async function GET(
  request: Request,
  { params }: { params: { storeSubdomain: string; locale: string } }
) {
  const { storeSubdomain, locale } = params;
  
  // Detectar la URL base correcta
  const requestUrl = new URL(request.url);
  const isCustomDomain = !requestUrl.hostname.endsWith('shopifree.app') && 
                        !requestUrl.hostname.endsWith('localhost') && 
                        requestUrl.hostname !== 'localhost';
  
  let baseUrl: string;
  if (isCustomDomain) {
    // Dominio personalizado: usar solo el protocolo y hostname
    baseUrl = `${requestUrl.protocol}//${requestUrl.hostname}/${locale}`;
  } else {
    // Dominio de Shopifree o localhost: incluir el subdominio en la ruta
    const protocol = requestUrl.hostname === 'localhost' ? 'http' : 'https';
    const port = requestUrl.hostname === 'localhost' ? ':3004' : '';
    baseUrl = `${protocol}://${requestUrl.hostname}${port}/${locale}/${storeSubdomain}`;
  }
  
  // IMPORTANTE: Forzar Content-Type correcto
  const headers = {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=3600', // Cache por 1 hora
  };
  
  console.log('🔍 [SITEMAP] Request URL:', requestUrl.href);
  console.log('🔍 [SITEMAP] Is custom domain:', isCustomDomain);
  console.log('🔍 [SITEMAP] Base URL:', baseUrl);
  
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
                let date: Date;
                if (typeof product.createdAt === 'string') {
                  date = new Date(product.createdAt);
                } else if (product.createdAt && typeof product.createdAt === 'object' && 'toDate' in product.createdAt) {
                  date = (product.createdAt as any).toDate();
                } else {
                  date = new Date(product.createdAt as any);
                }
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

  return new Response(xml, { headers });
}
