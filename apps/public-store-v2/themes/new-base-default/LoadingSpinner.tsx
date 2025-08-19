"use client";

type LoadingSpinnerProps = {
    className?: string;
};

import { useStoreLanguage } from "../../lib/store-language-context";

export default function LoadingSpinner({ 
    className = '' 
}: LoadingSpinnerProps) {
    const { t } = useStoreLanguage();
    return (
        <div className={`fixed inset-0 bg-white flex flex-col items-center justify-center z-50 ${className}`}>
            {/* Círculo negro giratorio */}
            <div className="w-8 h-8 border-2 border-gray-200 border-t-black rounded-full animate-spin mb-3"></div>
            {/* Texto simple */}
            <p className="text-gray-600 text-sm">{t('loading')}</p>
        </div>
    );
}
