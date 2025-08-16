import { Suspense } from "react";
import { Metadata } from "next";
import ThemeRenderer from "../../../../../components/ThemeRenderer";
import { getStoreIdBySubdomain, getStoreBasicInfo } from "../../../../../lib/store";
import { getStoreCategories } from "../../../../../lib/categories";

// Generar metadata para SEO
export async function generateMetadata({ params }: { params: { categorySlug: string; locale: string; storeSubdomain: string } }): Promise<Metadata> {
    try {
        const storeId = await getStoreIdBySubdomain(params.storeSubdomain);
        if (!storeId) {
            return {
                title: `Categoría ${params.categorySlug}`,
                description: `Productos de la categoría ${params.categorySlug}`
            };
        }

        const [storeInfo, categories] = await Promise.all([
            getStoreBasicInfo(storeId),
            getStoreCategories(storeId)
        ]);

        const category = categories.find(c => c.slug === params.categorySlug);
        const storeName = storeInfo?.storeName || params.storeSubdomain;

        return {
            title: category ? `${category.name} - ${storeName}` : `${params.categorySlug} - ${storeName}`,
            description: category?.description || `Descubre todos los productos de ${category?.name || params.categorySlug} en ${storeName}`,
            keywords: category ? [category.name, storeName, 'tienda online', 'productos'].filter(Boolean).join(', ') : undefined
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: `Categoría ${params.categorySlug}`,
            description: `Productos de la categoría ${params.categorySlug}`
        };
    }
}

export default function CategoriaPage({ params }: { params: { categorySlug: string; locale: string; storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? 'store';
    const categorySlug = params?.categorySlug;
    const locale = params?.locale || 'es';
    
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


