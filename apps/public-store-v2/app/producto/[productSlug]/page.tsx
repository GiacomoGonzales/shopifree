import { Suspense } from 'react';
import type { Metadata } from 'next';
import ProductDetail from './product-detail';
import { getStoreIdBySubdomain, getStoreBasicInfo, getStorePrimaryLocale } from '../../../lib/store';
import { getProduct } from '../../../lib/products';
import { generateAllImageVariants } from '../../../lib/image-optimization';
import { getCanonicalHost } from '../../../lib/canonical-resolver';
import { formatPrice } from '../../../lib/currency';
import { getStoreMetadata } from '../../../server-only/store-metadata';
import UnifiedLoading from '../../../components/UnifiedLoading';

// 🚀 OPTIMIZACIÓN FASE 1: Cache ISR - Revalidar cada 30 minutos (productos cambian más frecuente)
export const revalidate = 1800;

export default function ProductoPage({ params }: { params: { productSlug: string; storeSubdomain: string } }) {
    const { productSlug, storeSubdomain } = params as any;
    return (
        <Suspense fallback={<UnifiedLoading />}>
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
    
    const [product, storeInfo, seoData] = await Promise.all([
      getProduct(storeId, params.productSlug),
      getStoreBasicInfo(storeId),
      getStoreMetadata(params.storeSubdomain)
    ]);
    
    if (!product) return { title: 'Producto' };
    
    const storeName = storeInfo?.storeName || params.storeSubdomain;
    const title = `${product.name} - ${storeName}`;
    const ogTitle = `${product.name} | ${storeName}`;
    
    // Limpiar descripción HTML y crear descripción optimizada para redes sociales
    const cleanDescription = product.description 
      ? product.description.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
      : `Descubre ${product.name} en ${storeName}`;
    
    // Crear descripción con precio para redes sociales
    const currency = storeInfo?.currency || 'COP';
    const priceText = product.price ? ` - ${formatPrice(product.price, currency)}` : '';
    const description = cleanDescription.length > 120 
      ? `${cleanDescription.substring(0, 120)}...${priceText}` 
      : `${cleanDescription}${priceText}`;
    
    const image = product.image || storeInfo?.logoUrl || "/default-og.png";
    
    // Generar imágenes optimizadas para diferentes plataformas
    const imageVariants = generateAllImageVariants(image);
    
    // Construir URL absoluta (siempre sin prefijo)
    const canonical = await getCanonicalHost(params.storeSubdomain);
    const productUrl = `${canonical.canonicalHost}/producto/${params.productSlug}`;
    
    return {
      title,
      description,
      // ❌ REMOVIDO: keywords - meta keywords es obsoleta desde 2009
      // keywords: [product.name, storeName, 'producto', 'comprar online', 'tienda'].filter(Boolean).join(', '),
      
      // Open Graph para WhatsApp, Facebook, Instagram
      openGraph: {
        title: ogTitle,
        description,
        locale: effectiveLocale === 'es' ? 'es_ES' : effectiveLocale === 'pt' ? 'pt_BR' : 'en_US',
        images: [
          // Imagen cuadrada primero para WhatsApp
          {
            url: imageVariants.whatsapp,
            width: 400,
            height: 400,
            alt: `${product.name} - ${storeName}`,
            type: 'image/jpeg'
          },
          // Imagen rectangular para otras redes sociales
          {
            url: imageVariants.social,
            width: 1200,
            height: 630,
            alt: `${product.name} - ${storeName}`,
            type: 'image/jpeg'
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

      // Iconos de la tienda para mejor branding - usar favicon de SEO, no logo de header
      icons: seoData?.favicon ? {
        icon: [
          { url: seoData.favicon, sizes: '32x32', type: 'image/png' },
          { url: seoData.favicon, sizes: '16x16', type: 'image/png' }
        ],
        shortcut: seoData.favicon,
        apple: imageVariants.appleTouchIcon
      } : {
        icon: storeInfo?.logoUrl || '/favicon.ico',
        apple: imageVariants.appleTouchIcon,
        other: [
          {
            rel: 'icon',
            type: 'image/png',
            sizes: '32x32',
            url: storeInfo?.logoUrl || '/favicon-32x32.png',
          },
          {
            rel: 'icon',
            type: 'image/png', 
            sizes: '16x16',
            url: storeInfo?.logoUrl || '/favicon-16x16.png',
          }
        ]
      },
      
      // Twitter/X optimizado
      twitter: {
        card: 'summary_large_image',
        title: ogTitle,
        description,
        images: [{
          url: imageVariants.social,
          // ❌ REMOVIDO: width y height - Twitter no las usa
          alt: `${product.name} - ${storeName}`
        }]
      },

      // Meta tags adicionales para mejor compatibilidad con WhatsApp
      other: {
        'og:image:width': '400',
        'og:image:height': '400',
        'og:price:amount': product.price?.toString() || '0',
        'og:price:currency': currency,
        'product:price:amount': product.price?.toString() || '0',
        'product:price:currency': currency,
        'whatsapp:image': imageVariants.whatsapp,
        'telegram:image': imageVariants.whatsapp
      }
    };
  } catch (error) {
    console.error('Error generating product metadata:', error);
    return { title: 'Producto' };
  }
}


