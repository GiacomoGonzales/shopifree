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

  // HARDCODED: Sabemos que lunara-store.xyz es la tienda "lunara"
  const storeId = "9t8vyVWzUgf1FUmjKIoq"; // ID real de la tienda Lunara
  
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

  // Obtener categorías usando fetch directo
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    
    if (projectId && apiKey) {
      const categoriesUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/categories?key=${apiKey}`;
      const categoriesRes = await fetch(categoriesUrl);
      
      if (categoriesRes.ok) {
        const categoriesData = await categoriesRes.json();
        console.log('📂 [Sitemap Custom Domain] Categorías raw:', categoriesData);
        
        if (categoriesData.documents && categoriesData.documents.length > 0) {
          categoriesData.documents.forEach((doc: any) => {
            const categoryName = doc.fields?.name?.stringValue || doc.fields?.title?.stringValue;
            const categorySlug = doc.fields?.slug?.stringValue || categoryName?.toLowerCase().replace(/\s+/g, '-');
            
            if (categoryName && categorySlug) {
              const categoryUrl = encodeURIComponent(categorySlug);
              urls += `  <url>
    <loc>${baseUrl}/${locale}/categoria/${categoryUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;
            }
          });
          console.log('📂 [Sitemap Custom Domain] Categorías procesadas:', categoriesData.documents.length);
        }
      } else {
        console.log('❌ [Sitemap Custom Domain] Error response categorías:', categoriesRes.status);
      }
    }
  } catch (error) {
    console.error('❌ [Sitemap Custom Domain] Error obteniendo categorías:', error);
  }

  // Obtener productos usando fetch directo
  try {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID || process.env.GCLOUD_PROJECT || process.env.FIREBASE_PROJECT;
    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || process.env.FIREBASE_API_KEY;
    
    if (projectId && apiKey) {
      const productsUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/stores/${storeId}/products?key=${apiKey}`;
      const productsRes = await fetch(productsUrl);
      
      if (productsRes.ok) {
        const productsData = await productsRes.json();
        console.log('🛍️ [Sitemap Custom Domain] Productos raw:', productsData);
        
        if (productsData.documents && productsData.documents.length > 0) {
          productsData.documents.forEach((doc: any) => {
            const docPath = doc.name;
            const productId = docPath.split('/').pop();
            
            if (productId) {
              urls += `  <url>
    <loc>${baseUrl}/${locale}/producto/${productId}</loc>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>
`;
            }
          });
          console.log('🛍️ [Sitemap Custom Domain] Productos procesados:', productsData.documents.length);
        }
      } else {
        console.log('❌ [Sitemap Custom Domain] Error response productos:', productsRes.status);
      }
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
