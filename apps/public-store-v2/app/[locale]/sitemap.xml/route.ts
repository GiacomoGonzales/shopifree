import { getStoreIdBySubdomain } from '../../../lib/store';
import { getStoreCategories } from '../../../lib/categories';
import { getStoreProducts } from '../../../lib/products';

export async function GET(
  request: Request,
  { params }: { params: { locale: string } }
) {
  const { locale } = params;
  
  // Para dominios personalizados, obtenemos el storeSubdomain del hostname
  const requestUrl = new URL(request.url);
  const hostname = requestUrl.hostname;
  
  // Detectar si es dominio personalizado
  const isCustomDomain = !hostname.endsWith('shopifree.app') && 
                        !hostname.endsWith('localhost') && 
                        hostname !== 'localhost';
  
  if (!isCustomDomain) {
    // Si no es dominio personalizado, redirigir al sitemap normal
    return new Response('Not found', { status: 404 });
  }
  
  // Para dominios personalizados, necesitamos encontrar el storeSubdomain
  // basado en el dominio personalizado
  console.log('🔍 [SITEMAP CUSTOM] Hostname:', hostname);
  
  // Aquí necesitaríamos una función para obtener el storeSubdomain desde el dominio personalizado
  // Por ahora, usar "lunara" como fallback para debugging
  const storeSubdomain = 'lunara'; // TODO: Obtener esto dinámicamente
  
  const baseUrl = `${requestUrl.protocol}//${hostname}/${locale}`;
  
  console.log('🔍 [SITEMAP CUSTOM] Base URL:', baseUrl);
  console.log('🔍 [SITEMAP CUSTOM] Store subdomain:', storeSubdomain);
  
  const headers = {
    'Content-Type': 'application/xml',
    'Cache-Control': 'public, max-age=3600',
  };
  
  // Página principal (siempre presente)
  let urls = `
  <url>
    <loc>${baseUrl}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;

  try {
    // Intentar obtener datos de la tienda
    const storeId = await getStoreIdBySubdomain(storeSubdomain);
    console.log('🔍 [SITEMAP CUSTOM] StoreId obtenido:', storeId);
    
    if (storeId) {
      // Obtener categorías
      const categories = await getStoreCategories(storeId);
      console.log('🔍 [SITEMAP CUSTOM] Categorías obtenidas:', categories?.length || 0);
      
      if (categories && categories.length > 0) {
        categories.forEach(category => {
          if (category.slug) {
            urls += `
  <url>
    <loc>${baseUrl}/categoria/${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
          }
        });
      }

      // Obtener productos
      const products = await getStoreProducts(storeId);
      console.log('🔍 [SITEMAP CUSTOM] Productos obtenidos:', products?.length || 0);
      
      if (products && products.length > 0) {
        products.forEach(product => {
          if (product.id) {
            urls += `
  <url>
    <loc>${baseUrl}/producto/${product.id}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ [SITEMAP CUSTOM] Error:', error);
  }

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;

  console.log('🔍 [SITEMAP CUSTOM] XML generado, longitud:', xml.length);
  
  return new Response(xml, { headers });
}
