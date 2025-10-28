import { Suspense } from "react";
import { Metadata } from "next";
import ThemeRenderer from "../../../../../components/ThemeRenderer";
import { getStoreIdBySubdomain, getStoreBasicInfo, getStorePrimaryLocale } from "../../../../../lib/store";
import { getStoreCategories } from "../../../../../lib/categories";
import { generateAllImageVariants } from "../../../../../lib/image-optimization";
import { getCanonicalHost } from "../../../../../lib/canonical-resolver";
import UnifiedLoading from "../../../../../components/UnifiedLoading";

// 🚀 OPTIMIZACIÓN FASE 1: Cache ISR - Revalidar cada 1 hora
export const revalidate = 3600;

// Generar metadata para SEO
export async function generateMetadata({ params }: { params: { categorySlug: string; subCategorySlug: string; storeSubdomain: string } }): Promise<Metadata> {
    try {
        const storeId = await getStoreIdBySubdomain(params.storeSubdomain);
        if (!storeId) {
            return {
                title: `${params.subCategorySlug} - ${params.categorySlug}`,
                description: `Productos de ${params.subCategorySlug} en la categoría ${params.categorySlug}`
            };
        }
        
        // 🚀 Obtener configuración de locale de la tienda
        // Obtener idioma principal de la tienda
        const effectiveLocale = await getStorePrimaryLocale(storeId) || 'es';

        const [storeInfo, categories] = await Promise.all([
            getStoreBasicInfo(storeId),
            getStoreCategories(storeId)
        ]);

        const parentCategory = categories.find(c => c.slug === params.categorySlug);
        const subCategory = categories.find(c => c.slug === params.subCategorySlug && c.parentCategoryId === parentCategory?.id);
        const storeName = storeInfo?.storeName || params.storeSubdomain;
        
        // Preparar datos para metadatos
        const title = subCategory ? `${subCategory.name} - ${parentCategory?.name} - ${storeName}` : `${params.subCategorySlug} - ${storeName}`;
        const description = subCategory?.description || `Descubre todos los productos de ${subCategory?.name || params.subCategorySlug} en ${storeName}`;
        const ogTitle = subCategory ? `${subCategory.name} | ${parentCategory?.name} | ${storeName}` : title;
        const ogDescription = subCategory?.description || `Explora la colección completa de ${subCategory?.name || params.subCategorySlug} en ${parentCategory?.name || 'nuestra tienda'}. Encuentra productos únicos y de calidad en ${storeName}.`;
        
        // Imagen de la subcategoría, categoría padre o fallback a imagen de la tienda
        const categoryImage = subCategory?.imageUrl || parentCategory?.imageUrl || storeInfo?.logoUrl || "/default-og.png";
        const imageVariants = generateAllImageVariants(categoryImage);
        
        // Construir URL absoluta correcta
        // Construir URL absoluta (siempre sin prefijo)
        const canonical = await getCanonicalHost(params.storeSubdomain);
        const subCategoryUrl = `${canonical.canonicalHost}/categoria/${params.categorySlug}/${params.subCategorySlug}`;

        return {
            title,
            description,
            // ❌ REMOVIDO: keywords - meta keywords es obsoleta desde 2009
            // keywords: subCategory ? [subCategory.name, parentCategory?.name, storeName, 'tienda online', 'productos', 'categoría'].filter(Boolean).join(', ') : undefined,
            
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
                        alt: `${subCategory?.name || params.subCategorySlug} - ${storeName}`
                    },
                    {
                        url: imageVariants.whatsapp,
                        width: 400,
                        height: 400,
                        alt: `${subCategory?.name || params.subCategorySlug} - ${storeName}`
                    }
                ],
                type: 'website',
                siteName: storeName,
                                url: subCategoryUrl
            },
            
            // Canonical URL
            alternates: {
                canonical: subCategoryUrl
            },

            // Twitter/X optimizado
            twitter: {
                card: "summary_large_image",
                title: ogTitle,
                description: ogDescription,
                images: [{
                    url: imageVariants.social,
                    // ❌ REMOVIDO: width y height - Twitter no las usa
                    alt: `${subCategory?.name || params.subCategorySlug} - ${storeName}`
                }]
            }
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: `${params.subCategorySlug} - ${params.categorySlug}`,
            description: `Productos de ${params.subCategorySlug} en la categoría ${params.categorySlug}`
        };
    }
}

export default function SubCategoriaPage({ params }: { params: { categorySlug: string; subCategorySlug: string; storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? 'store';
    const categorySlug = params?.subCategorySlug; // Use subcategory slug as the main category
    
    return (
        <Suspense fallback={<UnifiedLoading />}>
            <ThemeRenderer storeSubdomain={subdomain} categorySlug={categorySlug} />
        </Suspense>
    );
}


