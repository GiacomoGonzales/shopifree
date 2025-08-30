import { getCanonicalHost } from '../../lib/canonical-resolver';
import { getStoreCategories } from '../../lib/categories';
import { getStoreProducts } from '../../lib/products';
import { getStoreCollections } from '../../lib/collections';
import { getStoreBrands } from '../../lib/brands';

// Forzar renderización dinámica - el sitemap debe ser dinámico por naturaleza
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    // Usar headers para obtener el hostname
    const hostname = request.headers.get('host') || '';
    
    // Detectar el protocolo (http o https)
    const protocol = request.headers.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const baseUrl = `${protocol}://${hostname}`;
    
    console.log('🗺️ [Sitemap] Generando sitemap para:', baseUrl);
    
    // Detectar subdomain del hostname
    let storeSubdomain: string | null = null;
    if (hostname.endsWith('.shopifree.app')) {
      storeSubdomain = hostname.split('.')[0];
    } else if (hostname !== 'localhost' && !hostname.endsWith('.vercel.app') && hostname) {
      // Dominio personalizado - buscar subdomain correspondiente
      storeSubdomain = await findSubdomainByCustomDomain(hostname);
    }
    
    if (!storeSubdomain) {
      console.log('❌ [Sitemap] Tienda no encontrada para:', hostname);
      return new Response(`${baseUrl}/`, {
        status: 200,
        headers: { 
          'Content-Type': 'text/plain; charset=UTF-8',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }
    
    // Obtener canonical host oficial
    const canonical = await getCanonicalHost(storeSubdomain);
    
    if (!canonical.storeId) {
      console.log('❌ [Sitemap] StoreId no encontrado para:', storeSubdomain);
      return new Response(`${baseUrl}/`, {
        status: 200,
        headers: { 
          'Content-Type': 'text/plain; charset=UTF-8',
          'Cache-Control': 'public, max-age=300'
        }
      });
    }
    
    console.log('✅ [Sitemap] Generando para:', {
      storeSubdomain,
      storeId: canonical.storeId,
      canonicalHost: canonical.canonicalHost
    });
    
    // Generar sitemap con productos y categorías reales
    const sitemap = await generateRealSitemap(canonical.canonicalHost, canonical.storeId);
    
    return new Response(sitemap, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=UTF-8',
        'Cache-Control': 'public, max-age=3600'
      }
    });
  } catch (error) {
    console.error('❌ [Sitemap] Error:', error);
    
    // Retornar sitemap mínimo válido en caso de error
    const protocol = request.headers.get('x-forwarded-proto') === 'https' ? 'https' : 'http';
    const hostname = request.headers.get('host') || 'example.com';
    const fallbackUrls = `${protocol}://${hostname}/`;
    
    return new Response(fallbackUrls, {
      status: 200,
      headers: { 
        'Content-Type': 'text/plain; charset=UTF-8',
        'Cache-Control': 'public, max-age=60'
      }
    });
  }
}

// Generar sitemap con productos y categorías reales
async function generateRealSitemap(canonicalHost: string, storeId: string): Promise<string> {
  let urls: string[] = [];
  
  // Agregar página principal
  urls.push(`${canonicalHost}/`);
  
  // Agregar páginas estáticas principales
  urls.push(`${canonicalHost}/catalogo`);
  urls.push(`${canonicalHost}/ofertas`);
  urls.push(`${canonicalHost}/favoritos`);
  
  // Agregar categorías reales
  try {
    const categories = await Promise.race([
      getStoreCategories(storeId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    if (categories && Array.isArray(categories)) {
      console.log('📂 [Sitemap] Categorías encontradas:', categories.length);
      
      for (const category of categories.slice(0, 50)) { // Limitar a 50 categorías
        if (category.slug && typeof category.slug === 'string') {
          urls.push(`${canonicalHost}/categoria/${encodeURIComponent(category.slug)}`);
        }
      }
    }
  } catch (error) {
    console.warn('⚠️ [Sitemap] No se pudieron cargar categorías:', error instanceof Error ? error.message : String(error));
  }
  
  // Agregar colecciones reales
  try {
    const collections = await Promise.race([
      getStoreCollections(storeId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    if (collections && Array.isArray(collections)) {
      console.log('📂 [Sitemap] Colecciones encontradas:', collections.length);
      
      const visibleCollections = collections
        .filter(c => c.slug && typeof c.slug === 'string' && c.visible)
        .slice(0, 30); // Limitar a 30 colecciones para evitar sitemaps muy largos
      
      for (const collection of visibleCollections) {
        urls.push(`${canonicalHost}/coleccion/${encodeURIComponent(collection.slug)}`);
      }
      
      console.log('✅ [Sitemap] Colecciones añadidas:', visibleCollections.length);
    }
  } catch (error) {
    console.warn('⚠️ [Sitemap] No se pudieron cargar colecciones:', error instanceof Error ? error.message : String(error));
  }
  
  // Agregar marcas reales
  try {
    const brands = await Promise.race([
      getStoreBrands(storeId),
      new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 5000))
    ]);
    
    if (brands && Array.isArray(brands)) {
      console.log('🏷️ [Sitemap] Marcas encontradas:', brands.length);
      
      const validBrands = brands
        .filter(b => b.slug && typeof b.slug === 'string' && b.slug.trim() !== '')
        .slice(0, 50); // Limitar a 50 marcas para evitar sitemaps muy largos
      
      for (const brand of validBrands) {
        urls.push(`${canonicalHost}/marca/${encodeURIComponent(brand.slug)}`);
      }
      
      console.log('✅ [Sitemap] Marcas añadidas:', validBrands.length);
    }
  } catch (error) {
    console.warn('⚠️ [Sitemap] No se pudieron cargar marcas:', error instanceof Error ? error.message : String(error));
  }

  // Agregar productos reales
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
        urls.push(`${canonicalHost}/producto/${encodeURIComponent(product.slug)}`);
      }
      
      console.log('✅ [Sitemap] Productos añadidos:', activeProducts.length);
    }
  } catch (error) {
    console.warn('⚠️ [Sitemap] No se pudieron cargar productos:', error instanceof Error ? error.message : String(error));
  }
  
  return urls.join('\n');
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
          console.warn(`⚠️ [Sitemap] Error verificando dominio para ${subdomain}:`, error instanceof Error ? error.message : String(error));
        }
        
        return null;
      });
      
      const results = await Promise.allSettled(checks);
      const found = results.find(result => result.status === 'fulfilled' && result.value);
      
      return found && found.status === 'fulfilled' ? found.value : null;
    };
    
    return await Promise.race([searchPromise(), timeoutPromise]);
    
  } catch (error) {
    console.warn('⚠️ [Sitemap] Error buscando dominio personalizado:', error instanceof Error ? error.message : String(error));
    return null;
  }
}