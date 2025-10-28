import { Suspense } from "react";
import { Metadata } from "next";
import ThemeRenderer from "../../../../components/ThemeRenderer";
import { getStoreIdBySubdomain, getStoreBasicInfo, getStorePrimaryLocale } from "../../../../lib/store";
import { getStoreBrands, getBrandBySlug } from "../../../../lib/brands";
import { generateAllImageVariants } from "../../../../lib/image-optimization";
import { getCanonicalHost } from "../../../../lib/canonical-resolver";
import UnifiedLoading from "../../../../components/UnifiedLoading";

// 🚀 OPTIMIZACIÓN FASE 1: Cache ISR - Revalidar cada 1 hora
export const revalidate = 3600;
export const fetchCache = 'force-cache';

// Generar metadata para SEO
export async function generateMetadata({ params }: { params: { brandSlug: string; storeSubdomain: string } }): Promise<Metadata> {
    try {
        const storeId = await getStoreIdBySubdomain(params.storeSubdomain);
        if (!storeId) {
            return {
                title: `Marca ${params.brandSlug}`,
                description: `Productos de la marca ${params.brandSlug}`
            };
        }
        
        // Obtener idioma principal de la tienda
        const effectiveLocale = await getStorePrimaryLocale(storeId) || 'es';

        const [storeInfo, brand] = await Promise.all([
            getStoreBasicInfo(storeId),
            getBrandBySlug(storeId, params.brandSlug)
        ]);

        const storeName = storeInfo?.storeName || params.storeSubdomain;
        
        // Preparar datos para metadatos
        const title = brand ? `${brand.name} - ${storeName}` : `${params.brandSlug} - ${storeName}`;
        const description = brand?.description || `Descubre todos los productos de ${brand?.name || params.brandSlug} en ${storeName}`;
        const ogTitle = brand ? `${brand.name} | ${storeName}` : title;
        const ogDescription = brand?.description || `Explora todos los productos de la marca ${brand?.name || params.brandSlug} en ${storeName}. Encuentra productos únicos y de calidad.`;
        
        // Imagen de la marca o fallback a imagen de la tienda
        const brandImage = brand?.image || storeInfo?.logoUrl || "/default-og.png";
        const imageVariants = generateAllImageVariants(brandImage);
        
        // Construir URL absoluta (siempre sin prefijo)
        const canonical = await getCanonicalHost(params.storeSubdomain);
        const brandUrl = `${canonical.canonicalHost}/marca/${params.brandSlug}`;
        
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
                        alt: `${brand?.name || params.brandSlug} - ${storeName}`
                    },
                    {
                        url: imageVariants.whatsapp,
                        width: 400,
                        height: 400,
                        alt: `${brand?.name || params.brandSlug} - ${storeName}`
                    }
                ],
                type: 'website',
                siteName: storeName,
                url: brandUrl
            },
            
            // Canonical URL
            alternates: {
                canonical: brandUrl
            },
            
            // Twitter/X optimizado
            twitter: {
                card: "summary_large_image",
                title: ogTitle,
                description: ogDescription,
                images: [{
                    url: imageVariants.social,
                    alt: `${brand?.name || params.brandSlug} - ${storeName}`
                }]
            }
        };
    } catch (error) {
        console.error('Error generating brand metadata:', error);
        return {
            title: `Marca ${params.brandSlug}`,
            description: `Productos de la marca ${params.brandSlug}`
        };
    }
}

export default function MarcaPage({ params }: { params: { brandSlug: string; storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? 'store';
    const brandSlug = params?.brandSlug;
    
    return (
        <Suspense fallback={<UnifiedLoading />}>
            <ThemeRenderer storeSubdomain={subdomain} brandSlug={brandSlug} />
        </Suspense>
    );
}
