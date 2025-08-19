import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductDetail from './product-detail';
import { getStoreIdBySubdomain, getStoreBasicInfo, getStorePrimaryLocale } from '../../../../lib/store';
import { getProduct } from '../../../../lib/products';
import { generateAllImageVariants } from '../../../../lib/image-optimization';
import { getCanonicalHost } from '../../../../lib/canonical-resolver';

export default function ProductoPage({ params }: { params: { productSlug: string; storeSubdomain: string } }) {
    const { productSlug, storeSubdomain } = params as any;
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
                <p className="text-gray-600 text-sm">Cargando...</p>
            </div>
        }>
            <ProductDetail productSlug={productSlug} storeSubdomain={storeSubdomain} />
        </Suspense>
    );
}

export async function generateMetadata({ params }: { params: { productSlug: string; storeSubdomain: string } }): Promise<Metadata> {
  try {
    const storeId = await getStoreIdBySubdomain(params.storeSubdomain);
    if (!storeId) return { title: 'Producto' };
    
    // 🚀 Obtener configuración de locale de la tienda
    // Obtener idioma principal de la tienda
    const effectiveLocale = await getStorePrimaryLocale(storeId) || 'es';
    
    const [product, storeInfo] = await Promise.all([
      getProduct(storeId, params.productSlug),
      getStoreBasicInfo(storeId)
    ]);
    
    if (!product) return { title: 'Producto' };
    
    const storeName = storeInfo?.storeName || params.storeSubdomain;
    const title = `${product.name} - ${storeName}`;
    const ogTitle = `${product.name} | ${storeName}`;
    const description = product.description || `Descubre ${product.name} en ${storeName}. Calidad garantizada y entrega rápida.`;
    const image = product.image || storeInfo?.logoUrl || "/default-og.png";
    
    // Generar imágenes optimizadas para diferentes plataformas
    const imageVariants = generateAllImageVariants(image);
    
    // Construir URL absoluta (siempre sin prefijo)
    const canonical = await getCanonicalHost(params.storeSubdomain);
    const productUrl = `${canonical.canonicalHost}/producto/${params.productSlug}`;
    
    return {
      title,
      description,
      keywords: [product.name, storeName, 'producto', 'comprar online', 'tienda'].filter(Boolean).join(', '),
      
      // Open Graph para WhatsApp, Facebook, Instagram
      openGraph: {
        title: ogTitle,
        description,
        locale: effectiveLocale === 'es' ? 'es_ES' : effectiveLocale === 'pt' ? 'pt_BR' : 'en_US',
        images: [
          {
            url: imageVariants.social,
            width: 1200,
            height: 630,
            alt: `${product.name} - ${storeName}`
          },
          {
            url: imageVariants.whatsapp,
            width: 400,
            height: 400,
            alt: `${product.name} - ${storeName}`
          }
        ],
        type: 'website',
        siteName: storeName,
        url: productUrl
      },
      
      // Canonical URL
      alternates: {
        canonical: productUrl
      },
      
      // Twitter/X optimizado
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description,
        images: [{
          url: imageVariants.social,
          width: 1200,
          height: 630,
          alt: `${product.name} - ${storeName}`
        }]
      }
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return { title: 'Producto' };
  }
}


