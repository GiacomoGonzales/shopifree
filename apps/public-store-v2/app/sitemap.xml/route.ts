import { getCanonicalHost, type CanonicalResult } from '../../lib/canonical-resolver';
import { SUPPORTED_LOCALES } from '../../i18n';
import { getStoreCategories } from '../../lib/categories';
import { getStoreProducts } from '../../lib/products';
import { getStorePrimaryLocale, type ValidLocale } from '../../lib/store';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  let storeSubdomain: string | null = null;
  
  console.log('🗺️ [Sitemap] Procesando request para:', requestUrl.hostname);
  
  // Detectar subdomain del hostname
  if (requestUrl.hostname.endsWith('.shopifree.app')) {
    storeSubdomain = requestUrl.hostname.split('.')[0];
    console.log('🏪 [Sitemap] Subdominio detectado:', storeSubdomain);
  } else if (requestUrl.hostname !== 'localhost' && !requestUrl.hostname.endsWith('.vercel.app')) {
    // Dominio personalizado - buscar subdomain correspondiente
    storeSubdomain = await findSubdomainByCustomDomain(requestUrl.hostname);
    console.log('🌐 [Sitemap] Subdominio por dominio personalizado:', storeSubdomain);
  }
  
  if (!storeSubdomain) {
    console.log('❌ [Sitemap] No se encontró tienda para:', requestUrl.hostname);
    return new Response('Store not found', { status: 404 });
  }
  
  // Obtener canonical host oficial
  const canonical = await getCanonicalHost(storeSubdomain);
  
  if (!canonical.storeId) {
    console.log('❌ [Sitemap] No se encontró storeId para:', storeSubdomain);
    return new Response('Store not found', { status: 404 });
  }
  
  // Obtener idioma principal de la tienda
  const primaryLocale = canonical.storeId ? await getStorePrimaryLocale(canonical.storeId) || 'es' : 'es';
  
  console.log('✅ [Sitemap] Generando sitemap simple para:', {
    storeSubdomain,
    storeId: canonical.storeId,
    canonicalHost: canonical.canonicalHost,
    isCustomDomain: canonical.isCustomDomain,
    primaryLocale
  });
  
  // SIEMPRE usar modo simple (sin prefijos de idioma)
  const sitemap = await generateSimpleSitemap(canonical, primaryLocale);
  
  return new Response(sitemap, {
    status: 200,
    headers: { 
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600'
    }
  });
}

// Sitemap simple: URLs sin prefijos de idioma
async function generateSimpleSitemap(canonical: CanonicalResult, primaryLocale: ValidLocale): Promise<string> {
  const { canonicalHost, storeId } = canonical;
  
  let urls = '';
  
  // 🏠 HOME sin prefijo de idioma
  urls += `
  <url>
    <loc>${canonicalHost}/</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  
  // 📂 CATEGORÍAS sin prefijo de idioma
  try {
    if (storeId) {
      const categories = await getStoreCategories(storeId);
      console.log('📂 [Sitemap Simple] Categorías obtenidas:', categories?.length || 0);
      
      if (categories && categories.length > 0) {
        for (const category of categories) {
          if (category.slug) {
            urls += `
  <url>
    <loc>${canonicalHost}/categoria/${category.slug}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>`;
          }
        }
      }
    }
  } catch (error) {
    console.error('❌ [Sitemap Simple] Error fetching categories:', error);
  }
  
  // 🛍️ PRODUCTOS sin prefijo de idioma
  try {
    if (storeId) {
      const products = await getStoreProducts(storeId);
      console.log('🛍️ [Sitemap Simple] Productos obtenidos:', products?.length || 0);
      
      if (products && products.length > 0) {
        let productsAdded = 0;
        for (const product of products) {
          console.log(`🔍 [Sitemap] Producto: ${product.name} - Status: ${product.status} - Slug: ${product.slug || 'NO_SLUG'}`);
          if (product.slug) {
            urls += `
  <url>
    <loc>${canonicalHost}/producto/${product.slug}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
            productsAdded++;
          }
        }
        console.log(`✅ [Sitemap Simple] Productos añadidos al sitemap: ${productsAdded}`);
      } else {
        console.log('⚠️ [Sitemap Simple] No hay productos para mostrar');
      }
    }
  } catch (error) {
    console.error('❌ [Sitemap Simple] Error fetching products:', error);
  }
  
  console.log('✅ [Sitemap Simple] URLs sin prefijo generadas para locale:', primaryLocale);
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`;
}



// Función helper para buscar subdomain por dominio personalizado
async function findSubdomainByCustomDomain(hostname: string): Promise<string | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) return null;
    
    // Buscar en todas las tiendas
    const storeQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        structuredQuery: {
          from: [{ collectionId: "stores" }]
        }
      })
    });
    
    if (!storeQuery.ok) return null;
    
    const storeData = await storeQuery.json();
    if (!Array.isArray(storeData)) return null;
    
    // Para cada tienda, verificar su dominio personalizado
    for (const row of storeData) {
      const storeDoc = row?.document;
      if (!storeDoc) continue;
      
      const storeId = storeDoc.name.split('/').pop();
      const subdomain = storeDoc.fields?.subdomain?.stringValue;
      
      if (!subdomain) continue;
      
      // Verificar dominio personalizado
      const domainQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`);
      
      if (domainQuery.ok) {
        const domainDoc = await domainQuery.json();
        const customDomain = domainDoc?.fields?.customDomain?.stringValue;
        
        if (customDomain && customDomain.toLowerCase() === hostname.toLowerCase()) {
          return subdomain;
        }
      }
    }
    
    return null;
  } catch (error) {
    console.error('❌ [Sitemap] Error finding subdomain by custom domain:', error);
    return null;
  }
}