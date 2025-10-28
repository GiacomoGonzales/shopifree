'use client';

import { useQueryClient } from '@tanstack/react-query';
import { getStoreProducts } from '../lib/products';
import { getStoreCategories } from '../lib/categories';
import { getStoreBrands } from '../lib/brands';
import { getStoreCollections } from '../lib/collections';

/**
 * Hook para prefetch inteligente de datos
 *
 * Cuando el usuario pasa el mouse sobre un enlace, pre-cargamos los datos
 * para que cuando haga click, la página se abra instantáneamente
 */
export function usePrefetch(storeId: string | null | undefined) {
    const queryClient = useQueryClient();

    /**
     * Prefetch de productos de una categoría
     * Se ejecuta onMouseEnter en links de categorías
     */
    const prefetchCategoryProducts = async (categorySlug: string) => {
        if (!storeId) return;

        // Prefetch productos - React Query cachea automáticamente
        await queryClient.prefetchQuery({
            queryKey: ['storeProducts', storeId, 16],
            queryFn: () => getStoreProducts(storeId, 16),
            staleTime: 3 * 60 * 1000, // 3 minutos
        });

        // También prefetch las categorías si no están en cache
        await queryClient.prefetchQuery({
            queryKey: ['storeCategories', storeId],
            queryFn: () => getStoreCategories(storeId),
            staleTime: 5 * 60 * 1000, // 5 minutos
        });
    };

    /**
     * Prefetch de productos de una marca
     * Se ejecuta onMouseEnter en links de marcas
     */
    const prefetchBrandProducts = async (brandSlug: string) => {
        if (!storeId) return;

        // Prefetch productos
        await queryClient.prefetchQuery({
            queryKey: ['storeProducts', storeId, 16],
            queryFn: () => getStoreProducts(storeId, 16),
            staleTime: 3 * 60 * 1000,
        });

        // Prefetch marcas
        await queryClient.prefetchQuery({
            queryKey: ['storeBrands', storeId],
            queryFn: () => getStoreBrands(storeId),
            staleTime: 5 * 60 * 1000,
        });
    };

    /**
     * Prefetch de productos de una colección
     * Se ejecuta onMouseEnter en links de colecciones
     */
    const prefetchCollectionProducts = async (collectionSlug: string) => {
        if (!storeId) return;

        // Prefetch productos
        await queryClient.prefetchQuery({
            queryKey: ['storeProducts', storeId, 16],
            queryFn: () => getStoreProducts(storeId, 16),
            staleTime: 3 * 60 * 1000,
        });

        // Prefetch colecciones
        await queryClient.prefetchQuery({
            queryKey: ['storeCollections', storeId],
            queryFn: () => getStoreCollections(storeId),
            staleTime: 5 * 60 * 1000,
        });
    };

    /**
     * Prefetch de la página principal
     * Se ejecuta onMouseEnter en el logo o link de home
     */
    const prefetchHomePage = async () => {
        if (!storeId) return;

        // Prefetch todos los datos del home en paralelo
        await Promise.all([
            queryClient.prefetchQuery({
                queryKey: ['storeProducts', storeId, 16],
                queryFn: () => getStoreProducts(storeId, 16),
                staleTime: 3 * 60 * 1000,
            }),
            queryClient.prefetchQuery({
                queryKey: ['storeCategories', storeId],
                queryFn: () => getStoreCategories(storeId),
                staleTime: 5 * 60 * 1000,
            }),
            queryClient.prefetchQuery({
                queryKey: ['storeBrands', storeId],
                queryFn: () => getStoreBrands(storeId),
                staleTime: 5 * 60 * 1000,
            }),
            queryClient.prefetchQuery({
                queryKey: ['storeCollections', storeId],
                queryFn: () => getStoreCollections(storeId),
                staleTime: 5 * 60 * 1000,
            }),
        ]);
    };

    return {
        prefetchCategoryProducts,
        prefetchBrandProducts,
        prefetchCollectionProducts,
        prefetchHomePage,
    };
}
