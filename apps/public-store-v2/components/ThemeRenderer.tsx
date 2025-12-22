"use client";

import { Suspense } from "react";
import { getStoreTheme, getStorePrimaryLocale } from "../lib/store";
import { useStoreId } from "../hooks/useStoreData";
import { useQuery } from "@tanstack/react-query";
import dynamic from "next/dynamic";
import UnifiedLoading from "./UnifiedLoading";
import CartRecovery from "./CartRecovery";

// Importación dinámica de temas disponibles
const NewBaseDefault = dynamic(() => import("../themes/new-base-default/NewBaseDefault"), {
    loading: () => (
        <div className="min-h-screen bg-white">
            {/* Header skeleton */}
            <div className="border-b border-gray-100 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="flex gap-4">
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Hero skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse mb-8"></div>

                {/* Categories skeleton */}
                <div className="mb-8">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="bg-gray-200 rounded-lg h-20 animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Products skeleton */}
                <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                            <div className="bg-gray-200 rounded aspect-square mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
});

const Restaurant = dynamic(() => import("../themes/restaurant/Restaurant"), {
    loading: () => (
        <div className="min-h-screen bg-white">
            {/* Header skeleton */}
            <div className="border-b border-gray-100 p-4">
                <div className="flex items-center justify-between max-w-7xl mx-auto">
                    <div className="h-8 bg-gray-200 rounded w-32 animate-pulse"></div>
                    <div className="flex gap-4">
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                </div>
            </div>

            {/* Hero skeleton */}
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="h-48 bg-gray-200 rounded-lg animate-pulse mb-8"></div>

                {/* Categories skeleton */}
                <div className="mb-8">
                    <div className="h-6 bg-gray-200 rounded w-32 mb-4 animate-pulse"></div>
                    <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
                        {[1,2,3,4,5,6].map(i => (
                            <div key={i} className="bg-gray-200 rounded-lg h-20 animate-pulse"></div>
                        ))}
                    </div>
                </div>

                {/* Products skeleton */}
                <div className="h-6 bg-gray-200 rounded w-40 mb-4 animate-pulse"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1,2,3,4,5,6,7,8].map(i => (
                        <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
                            <div className="bg-gray-200 rounded aspect-square mb-3"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-16"></div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
});

const Minimal = dynamic(() => import("../themes/minimal/Minimal"), {
    loading: () => (
        <div className="min-h-screen bg-white">
            {/* Minimal header skeleton */}
            <div className="border-b border-gray-100 p-4">
                <div className="flex items-center justify-between max-w-5xl mx-auto">
                    <div className="h-6 bg-gray-200 rounded w-24 animate-pulse"></div>
                    <div className="h-6 w-6 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </div>
            {/* Hero skeleton */}
            <div className="max-w-5xl mx-auto px-4 py-16 text-center">
                <div className="h-10 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mx-auto animate-pulse"></div>
            </div>
            {/* Products grid skeleton */}
            <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8">
                {[1,2,3,4,5,6,7,8].map(i => (
                    <div key={i} className="animate-pulse">
                        <div className="bg-gray-100 aspect-square mb-3"></div>
                        <div className="h-3 bg-gray-200 rounded mb-2"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                    </div>
                ))}
            </div>
        </div>
    )
});

type Props = {
    storeSubdomain: string;
    categorySlug?: string;
    collectionSlug?: string;
    brandSlug?: string;
};

export default function ThemeRenderer({ storeSubdomain, categorySlug, collectionSlug, brandSlug }: Props) {
    // 🚀 OPTIMIZACIÓN: Usar React Query para cache automático
    const { data: storeId, isLoading: isLoadingStoreId } = useStoreId(storeSubdomain);

    // Obtener tema y locale con React Query
    const { data: theme } = useQuery({
        queryKey: ['storeTheme', storeId],
        queryFn: () => {
            if (!storeId) return 'new-base-default';
            return getStoreTheme(storeId);
        },
        enabled: !!storeId,
        staleTime: 30 * 1000, // 30 segundos - para ver cambios de tema rápidamente
        placeholderData: 'new-base-default', // Mostrar tema default mientras carga
    });

    const { data: effectiveLocale } = useQuery({
        queryKey: ['storePrimaryLocale', storeId],
        queryFn: () => {
            if (!storeId) return 'es';
            return getStorePrimaryLocale(storeId);
        },
        enabled: !!storeId,
        staleTime: 10 * 60 * 1000, // 10 minutos
        placeholderData: 'es', // Mostrar 'es' mientras carga
    });

    // No mostrar loading aquí, dejar que el tema maneje toda la carga

    // Renderizar el tema correspondiente - usar new-base-default como default
    // mientras se carga el tema real si es diferente
    const themeToRender = theme || 'new-base-default';
    const locale = effectiveLocale || 'es'; // Asegurar que siempre haya un string

    // DEBUG: Ver qué tema se está usando
    console.log('[ThemeRenderer] storeId:', storeId, '| theme from DB:', theme, '| rendering:', themeToRender);

    switch (themeToRender) {
        case 'new-base-default':
            return (
                <>
                    <Suspense fallback={null}>
                        {storeId && <CartRecovery storeId={storeId} />}
                    </Suspense>
                    <NewBaseDefault
                        storeSubdomain={storeSubdomain}
                        categorySlug={categorySlug}
                        collectionSlug={collectionSlug}
                        brandSlug={brandSlug}
                        effectiveLocale={locale}
                        storeId={storeId}
                    />
                </>
            );
        case 'restaurant':
            return (
                <>
                    <Suspense fallback={null}>
                        {storeId && <CartRecovery storeId={storeId} />}
                    </Suspense>
                    <Restaurant
                        storeSubdomain={storeSubdomain}
                        effectiveLocale={locale}
                        storeId={storeId}
                    />
                </>
            );
        case 'minimal':
            return (
                <>
                    <Suspense fallback={null}>
                        {storeId && <CartRecovery storeId={storeId} />}
                    </Suspense>
                    <Minimal
                        storeSubdomain={storeSubdomain}
                        effectiveLocale={locale}
                        storeId={storeId}
                    />
                </>
            );
        default:
            // Por ahora, solo tenemos new-base-default disponible
            // Using new-base-default theme as fallback
            return (
                <>
                    <Suspense fallback={null}>
                        {storeId && <CartRecovery storeId={storeId} />}
                    </Suspense>
                    <NewBaseDefault
                        storeSubdomain={storeSubdomain}
                        categorySlug={categorySlug}
                        collectionSlug={collectionSlug}
                        brandSlug={brandSlug}
                        effectiveLocale={locale}
                        storeId={storeId}
                    />
                </>
            );
    }
}