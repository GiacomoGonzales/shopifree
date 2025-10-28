import { Suspense } from "react";
import { Metadata } from "next";
import ThemeRenderer from "../../../../components/ThemeRenderer";
import { getStoreIdBySubdomain, getStoreBasicInfo, getStorePrimaryLocale } from "../../../../lib/store";
import { getStoreCollections } from "../../../../lib/collections";
import { generateAllImageVariants } from "../../../../lib/image-optimization";
import { getCanonicalHost } from "../../../../lib/canonical-resolver";
import UnifiedLoading from "../../../../components/UnifiedLoading";

// 🚀 OPTIMIZACIÓN FASE 1: Cache ISR - Revalidar cada 1 hora
export const revalidate = 3600;

// Generar metadata para SEO
export async function generateMetadata({ params }: { params: { collectionSlug: string; storeSubdomain: string } }): Promise<Metadata> {
    try {
        const storeId = await getStoreIdBySubdomain(params.storeSubdomain);
        if (!storeId) {
            return {
                title: `Colección ${params.collectionSlug}`,
                description: `Productos de la colección ${params.collectionSlug}`
            };
        }
        
        // Obtener idioma principal de la tienda
        const effectiveLocale = await getStorePrimaryLocale(storeId) || 'es';

        const [storeInfo, collections] = await Promise.all([
            getStoreBasicInfo(storeId),
            getStoreCollections(storeId)
        ]);

        const collection = collections.find(c => c.slug === params.collectionSlug);
        const storeName = storeInfo?.storeName || params.storeSubdomain;
        
        // Preparar datos para metadatos
        const title = collection ? `${collection.title} - ${storeName}` : `${params.collectionSlug} - ${storeName}`;
        const description = collection?.description || `Descubre todos los productos de ${collection?.title || params.collectionSlug} en ${storeName}`;
        const ogTitle = collection ? `${collection.title} | ${storeName}` : title;
        const ogDescription = collection?.description || `Explora la colección completa de ${collection?.title || params.collectionSlug} en ${storeName}. Encuentra productos únicos y de calidad.`;
        
        // Imagen de la colección o fallback a imagen de la tienda
        const collectionImage = collection?.image || storeInfo?.logoUrl || "/default-og.png";
        const imageVariants = generateAllImageVariants(collectionImage);
        
        // Construir URL absoluta (siempre sin prefijo)
        const canonical = await getCanonicalHost(params.storeSubdomain);
        const collectionUrl = `${canonical.canonicalHost}/coleccion/${params.collectionSlug}`;
        
        return {
            title,
            description,
            
            // Open Graph para WhatsApp, Facebook, Instagram
            openGraph: {
                title: ogTitle,
                description: ogDescription,
                locale: effectiveLocale === 'es' ? 'es_ES' : effectiveLocale === 'pt' ? 'pt_BR' : 'en_US',
                images: [
                    {
                        url: imageVariants.social,
                        width: 1200,
                        height: 630,
                        alt: `${collection?.title || params.collectionSlug} - ${storeName}`
                    },
                    {
                        url: imageVariants.whatsapp,
                        width: 400,
                        height: 400,
                        alt: `${collection?.title || params.collectionSlug} - ${storeName}`
                    }
                ],
                type: 'website',
                siteName: storeName,
                url: collectionUrl
            },
            
            // Canonical URL
            alternates: {
                canonical: collectionUrl
            },
            
            // Twitter/X optimizado
            twitter: {
                card: "summary_large_image",
                title: ogTitle,
                description: ogDescription,
                images: [{
                    url: imageVariants.social,
                    alt: `${collection?.title || params.collectionSlug} - ${storeName}`
                }]
            }
        };
    } catch (error) {
        console.error('Error generating collection metadata:', error);
        return {
            title: `Colección ${params.collectionSlug}`,
            description: `Productos de la colección ${params.collectionSlug}`
        };
    }
}

export default function ColeccionPage({ params }: { params: { collectionSlug: string; storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? 'store';
    const collectionSlug = params?.collectionSlug;
    
    return (
        <Suspense fallback={<UnifiedLoading />}>
            <ThemeRenderer storeSubdomain={subdomain} collectionSlug={collectionSlug} />
        </Suspense>
    );
}
