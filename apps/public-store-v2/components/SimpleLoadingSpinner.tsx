"use client";

import { useStoreLanguage } from "../lib/store-language-context";
import ProductsGridSkeleton from "./ProductsGridSkeleton";

type SimpleLoadingSpinnerProps = {
    className?: string;
    variant?: 'products' | 'simple';
};

export default function SimpleLoadingSpinner({
    className = "",
    variant = 'simple'
}: SimpleLoadingSpinnerProps) {
    const { t } = useStoreLanguage();

    if (variant === 'products') {
        return <ProductsGridSkeleton itemCount={8} className={className} />;
    }

    // Default: simple spinner
    return (
        <div className={`flex flex-col items-center justify-center min-h-[200px] ${className}`}>
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm">{t('loading')}</p>
        </div>
    );
}