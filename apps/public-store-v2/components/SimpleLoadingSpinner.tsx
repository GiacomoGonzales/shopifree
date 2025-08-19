"use client";

type SimpleLoadingSpinnerProps = {
    className?: string;
    inline?: boolean; // Nueva prop para controlar si es inline o full-screen
};

import { useStoreLanguage } from "../lib/store-language-context";

export default function SimpleLoadingSpinner({ 
    className = "",
    inline = true // Por defecto, usar loading inline (no bloqueante)
}: SimpleLoadingSpinnerProps) {
    const { t } = useStoreLanguage();
    
    // Loading inline (recomendado para SEO)
    if (inline) {
        return (
            <div className={`min-h-[60vh] flex flex-col items-center justify-center p-8 ${className}`}>
                {/* Header skeleton */}
                <div className="w-full max-w-6xl mb-8">
                    <div className="h-16 bg-gray-100 rounded-lg animate-pulse mb-4"></div>
                    <div className="h-8 bg-gray-100 rounded w-1/3 animate-pulse"></div>
                </div>
                
                {/* Content skeleton */}
                <div className="w-full max-w-6xl grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="bg-gray-100 rounded-lg p-4 animate-pulse">
                            <div className="h-48 bg-gray-200 rounded mb-4"></div>
                            <div className="h-4 bg-gray-200 rounded mb-2"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                        </div>
                    ))}
                </div>
                
                {/* Spinner pequeño al final */}
                <div className="mt-8 flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin"></div>
                    <p className="text-gray-500 text-sm">{t('loading')}</p>
                </div>
            </div>
        );
    }
    
    // Loading full-screen (solo para casos específicos)
    return (
        <div className={`fixed inset-0 bg-white flex flex-col items-center justify-center z-50 ${className}`}>
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
            <p className="text-gray-600 text-sm">{t('loading')}</p>
        </div>
    );
}
