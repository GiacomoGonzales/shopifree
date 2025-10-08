"use client";

import { useEffect, useState, Suspense } from "react";
import { getStoreIdBySubdomain, getStoreTheme, getStorePrimaryLocale } from "../lib/store";
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

type Props = {
    storeSubdomain: string;
    categorySlug?: string;
    collectionSlug?: string;
    brandSlug?: string;
};

export default function ThemeRenderer({ storeSubdomain, categorySlug, collectionSlug, brandSlug }: Props) {
    const [theme, setTheme] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [effectiveLocale, setEffectiveLocale] = useState<string>('es');
    const [storeId, setStoreId] = useState<string | null>(null);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const storeIdResult = await getStoreIdBySubdomain(storeSubdomain);
                if (!alive) return;
                
                if (storeIdResult) {
                    const [storeTheme, primaryLocale] = await Promise.all([
                        getStoreTheme(storeIdResult),
                        getStorePrimaryLocale(storeIdResult)
                    ]);
                    if (!alive) return;
                    setStoreId(storeIdResult);
                    setTheme(storeTheme);
                    setEffectiveLocale(primaryLocale || 'es');
                } else {
                    // Si no encuentra la tienda, usar tema por defecto
                    setTheme('new-base-default');
                    setEffectiveLocale('es');
                }
            } catch (error) {
                // Error loading theme, using default
                if (alive) {
                    setTheme('new-base-default');
                    setEffectiveLocale('es');
                }
            } finally {
                if (alive) setLoading(false);
            }
        })();
        
        return () => {
            alive = false;
        };
    }, [storeSubdomain]);

    // No mostrar loading aquí, dejar que el tema maneje toda la carga

    // Renderizar el tema correspondiente - usar new-base-default como default
    // mientras se carga el tema real si es diferente
    const themeToRender = theme || 'new-base-default';
    
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
                        effectiveLocale={effectiveLocale}
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
                        effectiveLocale={effectiveLocale}
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
                        effectiveLocale={effectiveLocale}
                        storeId={storeId}
                    />
                </>
            );
    }
}