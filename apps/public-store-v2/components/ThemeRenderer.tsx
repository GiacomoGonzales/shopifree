"use client";

import { useEffect, useState } from "react";
import { getStoreIdBySubdomain, getStoreTheme, getStorePrimaryLocale } from "../lib/store";
import dynamic from "next/dynamic";
import SimpleLoadingSpinner from "./SimpleLoadingSpinner";

// Importación dinámica de temas disponibles
const NewBaseDefault = dynamic(() => import("../themes/new-base-default/NewBaseDefault"), { 
    loading: () => <SimpleLoadingSpinner />
});

type Props = {
    storeSubdomain: string;
    categorySlug?: string;
};

export default function ThemeRenderer({ storeSubdomain, categorySlug }: Props) {
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
                console.error('Error loading theme:', error);
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
                <NewBaseDefault 
                    storeSubdomain={storeSubdomain} 
                    categorySlug={categorySlug}
                    effectiveLocale={effectiveLocale}
                    storeId={storeId}
                />
            );
        // TODO: Agregar más casos aquí conforme se creen nuevos temas
        // case 'otro-tema':
        //     return <OtroTema storeSubdomain={storeSubdomain} categorySlug={categorySlug} />;
        default:
            // Por ahora, solo tenemos new-base-default disponible
            console.log(`Using new-base-default theme (requested: "${themeToRender}")`);
            return (
                <NewBaseDefault 
                    storeSubdomain={storeSubdomain} 
                    categorySlug={categorySlug}
                    effectiveLocale={effectiveLocale}
                    storeId={storeId}
                />
            );
    }
}