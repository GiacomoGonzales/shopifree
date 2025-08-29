"use client";

type LoadingSpinnerProps = {
    className?: string;
    inline?: boolean; // Nueva prop para controlar si es inline o full-screen
    storeInfo?: { logoUrl?: string; storeName?: string } | null; // Agregar info de la tienda
};

import { useStoreLanguage } from "../../lib/store-language-context";
import { toCloudinarySquare } from "../../lib/images";

export default function LoadingSpinner({ 
    className = '',
    inline = true, // Por defecto, usar loading inline (no bloqueante)
    storeInfo = null
}: LoadingSpinnerProps) {
    const { t } = useStoreLanguage();
    
    // Loading inline (skeleton para SEO)
    if (inline) {
        return (
            <div className={`min-h-[60vh] flex flex-col items-center justify-center p-8 ${className}`}>
                {/* Spinner centrado simple para inline */}
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                    {storeInfo?.logoUrl && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <img
                                src={toCloudinarySquare(storeInfo.logoUrl, 80)}
                                alt={storeInfo.storeName || 'Logo'}
                                className="w-8 h-8 object-contain"
                            />
                        </div>
                    )}
                </div>
                <p className="text-gray-600 text-sm mt-4">{t('loading')}</p>
            </div>
        );
    }
    
    // Loading full-screen con logo de la tienda
    return (
        <div className={`fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999] ${className}`} style={{ 
            transition: 'opacity 0.3s ease-in-out',
            opacity: 1
        }}>
            <div className="relative">
                {/* Spinner giratorio */}
                <div className="w-20 h-20 border-4 border-gray-200 border-t-gray-800 rounded-full animate-spin"></div>
                
                {/* Logo en el centro */}
                <div className="absolute inset-0 flex items-center justify-center">
                    {storeInfo?.logoUrl ? (
                        <img
                            src={toCloudinarySquare(storeInfo.logoUrl, 120)}
                            alt={storeInfo.storeName || 'Logo'}
                            className="w-10 h-10 object-contain"
                            onLoad={() => {}}
                            style={{ imageRendering: 'crisp-edges' }}
                        />
                    ) : (
                        <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                    )}
                </div>
            </div>
            
            {/* Texto opcional */}
            <p className="text-gray-600 text-sm mt-4 font-medium">{t('loading')}</p>
        </div>
    );
}
