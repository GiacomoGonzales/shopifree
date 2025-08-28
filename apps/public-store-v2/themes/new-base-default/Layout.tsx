"use client";

import { ReactNode, useEffect } from "react";
import "./new-base-default.css";
import { StoreBasicInfo, applyStoreColors } from "../../lib/store";
import { Category } from "../../lib/categories";
import { PublicProduct } from "../../lib/products";
import Header from "./Header";
import Footer from "./Footer";
import CartModal from "./CartModal";

type Props = {
    children: ReactNode;
    storeInfo?: StoreBasicInfo | null;
    categories?: Category[] | null;
    storeSubdomain?: string;
    products?: PublicProduct[];
    storeId?: string | null;
};

export default function Layout({ children, storeInfo, categories, storeSubdomain, products, storeId }: Props) {
    // Aplicar colores dinámicos de la tienda cuando se carga el Layout
    useEffect(() => {
        if (storeInfo?.primaryColor) {
            console.log('✅ Layout: Applying store colors...');
            
            // Aplicar inmediatamente
            applyStoreColors(storeInfo.primaryColor, storeInfo.secondaryColor);
            
            // También aplicar después de un pequeño delay para asegurar que el DOM esté listo
            setTimeout(() => {
                console.log('🔄 Layout: Re-applying colors after delay...');
                applyStoreColors(storeInfo.primaryColor!, storeInfo.secondaryColor);
            }, 100);
        } else {
            console.log('⚠️ Layout: No primary color found in store info');
        }
    }, [storeInfo?.primaryColor, storeInfo?.secondaryColor]);

    return (
        <div data-theme="new-base-default" className="nbd-theme">
            {(storeInfo || categories || storeSubdomain) && (
                <Header 
                    storeInfo={storeInfo || null} 
                    categories={categories || null} 
                    storeSubdomain={storeSubdomain || ''} 
                    products={products || []}
                />
            )}
            <main>{children}</main>
            {(storeInfo || categories || storeSubdomain) && (
                <Footer 
                    storeInfo={storeInfo || null} 
                    categories={categories || null} 
                    storeSubdomain={storeSubdomain || ''} 
                />
            )}
            
            {/* Modal del carrito */}
            <CartModal storeInfo={storeInfo} storeId={storeId || undefined} />
        </div>
    );
}
