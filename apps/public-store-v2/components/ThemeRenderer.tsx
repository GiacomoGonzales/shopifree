"use client";

import { useEffect, useState } from "react";
import { getStoreIdBySubdomain, getStoreTheme } from "../lib/store";
import dynamic from "next/dynamic";

// Importación dinámica de temas disponibles
// TODO: Agregar más temas aquí conforme se vayan creando
const NewBaseDefault = dynamic(() => import("../themes/new-base-default/NewBaseDefault"), { ssr: false });

type Props = {
    storeSubdomain: string;
    categorySlug?: string;
};

export default function ThemeRenderer({ storeSubdomain, categorySlug }: Props) {
    const [theme, setTheme] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const storeId = await getStoreIdBySubdomain(storeSubdomain);
                if (!alive) return;
                
                if (storeId) {
                    const storeTheme = await getStoreTheme(storeId);
                    if (!alive) return;
                    setTheme(storeTheme);
                } else {
                    // Si no encuentra la tienda, usar tema por defecto
                    setTheme('new-base-default');
                }
            } catch (error) {
                console.error('Error loading theme:', error);
                if (alive) setTheme('new-base-default');
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
            return <NewBaseDefault storeSubdomain={storeSubdomain} categorySlug={categorySlug} />;
        // TODO: Agregar más casos aquí conforme se creen nuevos temas
        // case 'otro-tema':
        //     return <OtroTema storeSubdomain={storeSubdomain} categorySlug={categorySlug} />;
        default:
            // Por ahora, solo tenemos new-base-default disponible
            console.log(`Using new-base-default theme (requested: "${themeToRender}")`);
            return <NewBaseDefault storeSubdomain={storeSubdomain} categorySlug={categorySlug} />;
    }
}
