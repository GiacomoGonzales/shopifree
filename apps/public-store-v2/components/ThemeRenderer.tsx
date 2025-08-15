"use client";

import { useEffect, useState } from "react";
import { getStoreIdBySubdomain, getStoreTheme } from "../lib/store";
import dynamic from "next/dynamic";

// Importación dinámica de temas disponibles
// TODO: Agregar más temas aquí conforme se vayan creando
const NewBaseDefault = dynamic(() => import("../themes/new-base-default/NewBaseDefault"), { ssr: false });

type Props = {
    storeSubdomain: string;
};

export default function ThemeRenderer({ storeSubdomain }: Props) {
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

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-neutral-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
                    <p className="text-neutral-600">Cargando tienda...</p>
                </div>
            </div>
        );
    }

    // Renderizar el tema correspondiente
    switch (theme) {
        case 'new-base-default':
            return <NewBaseDefault storeSubdomain={storeSubdomain} />;
        // TODO: Agregar más casos aquí conforme se creen nuevos temas
        // case 'otro-tema':
        //     return <OtroTema storeSubdomain={storeSubdomain} />;
        default:
            // Por ahora, solo tenemos new-base-default disponible
            console.log(`Using new-base-default theme (requested: "${theme}")`);
            return <NewBaseDefault storeSubdomain={storeSubdomain} />;
    }
}
