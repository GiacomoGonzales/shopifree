import { getCanonicalHost, type CanonicalResult } from '../../lib/canonical-resolver';
import { getStoreCategories } from '../../lib/categories';
import { getStoreProducts } from '../../lib/products';

export async function GET(request: Request) {
  try {
    const requestUrl = new URL(request.url);
    let storeSubdomain: string | null = null;
    
    console.log('🗺️ [Sitemap] Request para:', requestUrl.hostname);
    
    // Detectar subdomain del hostname
    if (requestUrl.hostname.endsWith('.shopifree.app')) {
      storeSubdomain = requestUrl.hostname.split('.')[0];
    } else if (requestUrl.hostname !== 'localhost' && !requestUrl.hostname.endsWith('.vercel.app')) {
      // Dominio personalizado - buscar subdomain correspondiente
      storeSubdomain = await findSubdomainByCustomDomain(requestUrl.hostname);
    }
    
    if (!storeSubdomain) {
      console.log('❌ [Sitemap] Tienda no encontrada para:', requestUrl.hostname);
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap vacío: dominio no configurado -->
</urlset>`, {
        status: 200,
        headers: { 
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }
    
    // Obtener canonical host oficial
    const canonical = await getCanonicalHost(storeSubdomain);
    
    if (!canonical.storeId) {
      console.log('❌ [Sitemap] StoreId no encontrado para:', storeSubdomain);
      return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap vacío: tienda no configurada -->
</urlset>`, {
        status: 200,
        headers: { 
          'Content-Type': 'application/xml; charset=utf-8',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }
    
    console.log('✅ [Sitemap] Generando para:', {
      storeSubdomain,
      storeId: canonical.storeId,
      canonicalHost: canonical.canonicalHost
    });
    
    // Generar sitemap simplificado
    const sitemap = await generateSimpleSitemap(canonical);
    
    return new Response(sitemap, {
      status: 200,
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
        'X-Robots-Tag': 'index'
      }
    });
  } catch (error) {
    console.error('❌ [Sitemap] Error crítico:', error);
    
    // Retornar sitemap mínimo válido en caso de error
    return new Response(`<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Sitemap de error temporal -->
</urlset>`, {
      status: 200,
      headers: { 
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }
}

// Sitemap simplificado: URLs básicas sin complejidad
async function generateSimpleSitemap(canonical: CanonicalResult): Promise<string> {
  const { canonicalHost, storeId } = canonical;
  const currentDate = new Date().toISOString().split('T')[0];
  
  let urls = `
  <url>
    <loc>${canonicalHost}/</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>`;
  
  // Agregar páginas estáticas principales
  const staticPages = ['catalogo', 'ofertas', 'favoritos'];
  for (const page of staticPages) {
    urls += `
  <url>
    <loc>${canonicalHost}/${page}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>`;
  }
  
  // Agregar categorías (con manejo de errores mejorado)
  if (storeId) {
    try {
      const categories = await Promise.race([
        getStoreCategories(storeId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      if (categories && Array.isArray(categories)) {
        console.log('📂 [Sitemap] Categorías encontradas:', categories.length);
        
        for (const category of categories.slice(0, 50)) { // Limitar a 50 categorías
          if (category.slug && typeof category.slug === 'string') {
            urls += `
  <url>
    <loc>${canonicalHost}/categoria/${encodeURIComponent(category.slug)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>`;
          }
        }
      }
    } catch (error) {
      console.warn('⚠️ [Sitemap] No se pudieron cargar categorías:', error.message);
    }
    
    // Agregar productos (con manejo de errores mejorado)
    try {
      const products = await Promise.race([
        getStoreProducts(storeId),
        new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
      ]);
      
      if (products && Array.isArray(products)) {
        console.log('🛍️ [Sitemap] Productos encontrados:', products.length);
        
        const activeProducts = products
          .filter(p => p.slug && typeof p.slug === 'string' && p.status === 'active')
          .slice(0, 100); // Limitar a 100 productos para evitar sitemaps muy largos
        
        for (const product of activeProducts) {
          urls += `
  <url>
    <loc>${canonicalHost}/producto/${encodeURIComponent(product.slug)}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>`;
        }
        
        console.log('✅ [Sitemap] Productos añadidos:', activeProducts.length);
      }
    } catch (error) {
      console.warn('⚠️ [Sitemap] No se pudieron cargar productos:', error.message);
    }
  }
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}
</urlset>`;
}



// Función helper simplificada para buscar subdomain por dominio personalizado
async function findSubdomainByCustomDomain(hostname: string): Promise<string | null> {
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    
    if (!projectId || !apiKey) {
      console.warn('⚠️ [Sitemap] Variables de entorno Firebase no configuradas');
      return null;
    }
    
    // Timeout de 3 segundos para evitar sitemaps lentos
    const timeoutPromise = new Promise<never>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 3000)
    );
    
    const searchPromise = async (): Promise<string | null> => {
      // Buscar en todas las tiendas con límite
      const storeQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents:runQuery?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          structuredQuery: {
            from: [{ collectionId: "stores" }],
            limit: 50 // Limitar búsqueda para mejorar performance
          }
        })
      });
      
      if (!storeQuery.ok) return null;
      
      const storeData = await storeQuery.json();
      if (!Array.isArray(storeData)) return null;
      
      // Verificar dominios personalizados en paralelo (máximo 10 simultáneas)
      const checks = storeData.slice(0, 10).map(async (row) => {
        const storeDoc = row?.document;
        if (!storeDoc) return null;
        
        const storeId = storeDoc.name.split('/').pop();
        const subdomain = storeDoc.fields?.subdomain?.stringValue;
        
        if (!subdomain) return null;
        
        try {
          const domainQuery = await fetch(`https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/settings/domain?key=${apiKey}`);
          
          if (domainQuery.ok) {
            const domainDoc = await domainQuery.json();
            const customDomain = domainDoc?.fields?.customDomain?.stringValue;
            
            if (customDomain && customDomain.toLowerCase() === hostname.toLowerCase()) {
              return subdomain;
            }
          }
        } catch (error) {
          console.warn(`⚠️ [Sitemap] Error verificando dominio para ${subdomain}:`, error.message);
        }
        
        return null;
      });
      
      const results = await Promise.allSettled(checks);
      const found = results.find(result => result.status === 'fulfilled' && result.value);
      
      return found && found.status === 'fulfilled' ? found.value : null;
    };
    
    return await Promise.race([searchPromise(), timeoutPromise]);
    
  } catch (error) {
    console.warn('⚠️ [Sitemap] Error buscando dominio personalizado:', error.message);
    return null;
  }
}