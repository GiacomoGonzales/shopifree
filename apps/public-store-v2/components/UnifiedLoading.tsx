"use client";

import { useStoreLanguage } from "../lib/store-language-context";
import { toCloudinarySquare } from "../lib/images";

type UnifiedLoadingProps = {
    storeInfo?: { logoUrl?: string; storeName?: string } | null;
    className?: string;
};

export default function UnifiedLoading({ 
    storeInfo = null,
    className = ""
}: UnifiedLoadingProps) {
    const { t } = useStoreLanguage();
    
    return (
        <div className={`min-h-screen bg-white flex flex-col items-center justify-center p-8 ${className}`}>
            {/* Spinner principal con logo */}
            <div className="relative mb-6">
                <div className="w-16 h-16 border-4 border-gray-200 border-t-gray-600 rounded-full animate-spin"></div>
                
                {/* Logo en el centro */}
                {storeInfo?.logoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                        <img
                            src={toCloudinarySquare(storeInfo.logoUrl, 80)}
                            alt={storeInfo.storeName || 'Logo'}
                            className="w-8 h-8 object-contain"
                            style={{ imageRendering: 'crisp-edges' }}
                        />
                    </div>
                )}
            </div>
            
            {/* Texto de carga */}
            <p className="text-gray-600 text-sm font-medium">{t('loading')}</p>
        </div>
    );
}
