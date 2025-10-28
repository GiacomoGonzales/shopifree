'use client';

import { useQuery } from '@tanstack/react-query';
import { getStoreIdBySubdomain, getStoreBasicInfo } from '../lib/store';
import { getStoreProducts } from '../lib/products';
import { getStoreCategories } from '../lib/categories';
import { getStoreBrands } from '../lib/brands';
import { getStoreFilters } from '../lib/filters';
import { getStoreCollections } from '../lib/collections';

/**
 * Hook para obtener el storeId desde el subdomain
 */
export function useStoreId(subdomain: string) {
    return useQuery({
        queryKey: ['storeId', subdomain],
        queryFn: () => getStoreIdBySubdomain(subdomain),
        staleTime: 10 * 60 * 1000, // 10 minutos - rara vez cambia
    });
}

/**
 * Hook para obtener información básica de la tienda
 */
export function useStoreInfo(storeId: string | null | undefined) {
    return useQuery({
        queryKey: ['storeInfo', storeId],
        queryFn: () => {
            if (!storeId) throw new Error('StoreId not available');
            return getStoreBasicInfo(storeId);
        },
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Hook para obtener productos de la tienda
 */
export function useStoreProducts(storeId: string | null | undefined, limitCount?: number) {
    return useQuery({
        queryKey: ['storeProducts', storeId, limitCount],
        queryFn: () => {
            if (!storeId) throw new Error('StoreId not available');
            return getStoreProducts(storeId, limitCount);
        },
        enabled: !!storeId,
        staleTime: 3 * 60 * 1000, // 3 minutos - productos cambian más frecuentemente
    });
}

/**
 * Hook para obtener categorías de la tienda
 */
export function useStoreCategories(storeId: string | null | undefined) {
    return useQuery({
        queryKey: ['storeCategories', storeId],
        queryFn: () => {
            if (!storeId) throw new Error('StoreId not available');
            return getStoreCategories(storeId);
        },
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Hook para obtener marcas de la tienda
 */
export function useStoreBrands(storeId: string | null | undefined) {
    return useQuery({
        queryKey: ['storeBrands', storeId],
        queryFn: () => {
            if (!storeId) throw new Error('StoreId not available');
            return getStoreBrands(storeId);
        },
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Hook para obtener filtros de la tienda
 */
export function useStoreFilters(storeId: string | null | undefined) {
    return useQuery({
        queryKey: ['storeFilters', storeId],
        queryFn: () => {
            if (!storeId) throw new Error('StoreId not available');
            return getStoreFilters(storeId);
        },
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Hook para obtener colecciones de la tienda
 */
export function useStoreCollections(storeId: string | null | undefined) {
    return useQuery({
        queryKey: ['storeCollections', storeId],
        queryFn: () => {
            if (!storeId) throw new Error('StoreId not available');
            return getStoreCollections(storeId);
        },
        enabled: !!storeId,
        staleTime: 5 * 60 * 1000, // 5 minutos
    });
}

/**
 * Hook compuesto que obtiene todos los datos de la tienda en paralelo
 * Útil para la página principal
 */
export function useAllStoreData(subdomain: string) {
    const { data: storeId, isLoading: isLoadingStoreId } = useStoreId(subdomain);

    const storeInfo = useStoreInfo(storeId);
    const products = useStoreProducts(storeId, 16); // Primeros 16 productos
    const categories = useStoreCategories(storeId);
    const brands = useStoreBrands(storeId);
    const filters = useStoreFilters(storeId);
    const collections = useStoreCollections(storeId);

    const isLoading = isLoadingStoreId ||
                      storeInfo.isLoading ||
                      products.isLoading ||
                      categories.isLoading ||
                      brands.isLoading ||
                      filters.isLoading ||
                      collections.isLoading;

    const error = storeInfo.error ||
                  products.error ||
                  categories.error ||
                  brands.error ||
                  filters.error ||
                  collections.error;

    return {
        storeId,
        storeInfo: storeInfo.data,
        products: products.data || [],
        categories: categories.data || [],
        brands: brands.data || [],
        filters: filters.data || [],
        collections: collections.data || [],
        isLoading,
        error,
    };
}
