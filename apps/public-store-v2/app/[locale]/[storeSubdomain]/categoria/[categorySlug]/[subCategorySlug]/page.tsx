import { Suspense } from "react";
import { Metadata } from "next";
import ThemeRenderer from "../../../../../../components/ThemeRenderer";
import { getStoreIdBySubdomain, getStoreBasicInfo } from "../../../../../../lib/store";
import { getStoreCategories } from "../../../../../../lib/categories";

// Generar metadata para SEO
export async function generateMetadata({ params }: { params: { categorySlug: string; subCategorySlug: string; locale: string; storeSubdomain: string } }): Promise<Metadata> {
    try {
        const storeId = await getStoreIdBySubdomain(params.storeSubdomain);
        if (!storeId) {
            return {
                title: `${params.subCategorySlug} - ${params.categorySlug}`,
                description: `Productos de ${params.subCategorySlug} en la categoría ${params.categorySlug}`
            };
        }

        const [storeInfo, categories] = await Promise.all([
            getStoreBasicInfo(storeId),
            getStoreCategories(storeId)
        ]);

        const parentCategory = categories.find(c => c.slug === params.categorySlug);
        const subCategory = categories.find(c => c.slug === params.subCategorySlug && c.parentCategoryId === parentCategory?.id);
        const storeName = storeInfo?.storeName || params.storeSubdomain;

        return {
            title: subCategory ? `${subCategory.name} - ${parentCategory?.name} - ${storeName}` : `${params.subCategorySlug} - ${storeName}`,
            description: subCategory?.description || `Descubre todos los productos de ${subCategory?.name || params.subCategorySlug} en ${storeName}`,
            keywords: subCategory ? [subCategory.name, parentCategory?.name, storeName, 'tienda online', 'productos'].filter(Boolean).join(', ') : undefined
        };
    } catch (error) {
        console.error('Error generating metadata:', error);
        return {
            title: `${params.subCategorySlug} - ${params.categorySlug}`,
            description: `Productos de ${params.subCategorySlug} en la categoría ${params.categorySlug}`
        };
    }
}

export default function SubCategoriaPage({ params }: { params: { categorySlug: string; subCategorySlug: string; locale: string; storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? 'store';
    const categorySlug = params?.subCategorySlug; // Use subcategory slug as the main category
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


