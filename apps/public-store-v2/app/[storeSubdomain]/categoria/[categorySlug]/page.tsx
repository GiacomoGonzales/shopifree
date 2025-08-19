import { Suspense } from "react";
import { Metadata } from "next";
import ThemeRenderer from "../../../../components/ThemeRenderer";
import { getStoreIdBySubdomain, getStoreBasicInfo, getStoreLocaleConfig } from "../../../../lib/store";
import { getStoreCategories } from "../../../../lib/categories";
import { generateAllImageVariants } from "../../../../lib/image-optimization";
import { getCanonicalHost } from "../../../../lib/canonical-resolver";

// Generar metadata para SEO
export async function generateMetadata({ params }: { params: { categorySlug: string; storeSubdomain: string } }): Promise<Metadata> {
    try {
        const storeId = await getStoreIdBySubdomain(params.storeSubdomain);
        if (!storeId) {
            return {
                title: `Categoría ${params.categorySlug}`,
                description: `Productos de la categoría ${params.categorySlug}`
            };
        }
        
        // 🚀 Obtener configuración de locale de la tienda
        const storeConfig = await getStoreLocaleConfig(storeId);
        const effectiveLocale = storeConfig?.primaryLocale || 'es';
        const singleLocaleUrls = storeConfig?.singleLocaleUrls || false;

        const [storeInfo, categories] = await Promise.all([
            getStoreBasicInfo(storeId),
            getStoreCategories(storeId)
        ]);

        const category = categories.find(c => c.slug === params.categorySlug);
        const storeName = storeInfo?.storeName || params.storeSubdomain;
        
        // Preparar datos para metadatos
        const title = category ? `${category.name} - ${storeName}` : `${params.categorySlug} - ${storeName}`;
        const description = category?.description || `Descubre todos los productos de ${category?.name || params.categorySlug} en ${storeName}`;
        const ogTitle = category ? `${category.name} | ${storeName}` : title;
        const ogDescription = category?.description || `Explora la colección completa de ${category?.name || params.categorySlug} en ${storeName}. Encuentra productos únicos y de calidad.`;
        
        // Imagen de la categoría o fallback a imagen de la tienda
        const categoryImage = category?.imageUrl || storeInfo?.logoUrl || "/default-og.png";
        const imageVariants = generateAllImageVariants(categoryImage);
        
        // 🚀 Construir URL absoluta correcta según configuración
        const canonical = await getCanonicalHost(params.storeSubdomain);
        const categoryUrl = singleLocaleUrls 
          ? `${canonical.canonicalHost}/categoria/${params.categorySlug}`  // Sin prefijo
          : `${canonical.canonicalHost}/${effectiveLocale}/categoria/${params.categorySlug}`;  // Con prefijo
        
        return {
            title,
            description,
            keywords: category ? [category.name, storeName, 'tienda online', 'productos', 'categoría'].filter(Boolean).join(', ') : undefined,
            
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
                        alt: `${category?.name || params.categorySlug} - ${storeName}`
                    },
                    {
                        url: imageVariants.whatsapp,
                        width: 400,
                        height: 400,
                        alt: `${category?.name || params.categorySlug} - ${storeName}`
                    }
                ],
                type: 'website',
                siteName: storeName,
                url: categoryUrl
            },
            
            // Canonical URL
            alternates: {
                canonical: categoryUrl
            },
            
            // Twitter/X optimizado
            twitter: {
                card: "summary_large_image",
                title: ogTitle,
                description: ogDescription,
                images: [{
                    url: imageVariants.social,
                    width: 1200,
                    height: 630,
                    alt: `${category?.name || params.categorySlug} - ${storeName}`
                }]
            }
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: `Categoría ${params.categorySlug}`,
            description: `Productos de la categoría ${params.categorySlug}`
        };
    }
}

export default function CategoriaPage({ params }: { params: { categorySlug: string; storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? 'store';
    const categorySlug = params?.categorySlug;
    
    return (
        <Suspense fallback={
            <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-50">
                <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
                <p className="text-gray-600 text-sm">Cargando...</p>
            </div>
        }>
            <ThemeRenderer storeSubdomain={subdomain} categorySlug={categorySlug} />
        </Suspense>
    );
}


