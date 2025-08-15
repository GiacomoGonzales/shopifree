import { Suspense } from "react";
import ThemeRenderer from "../../../components/ThemeRenderer";

export default function StorePage({ params }: { params: { storeSubdomain: string; locale: string } }) {
    const subdomain = params?.storeSubdomain ?? (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'store');
    const locale = (params as any)?.locale || 'es';
    
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando tienda...</p>
                </div>
            </div>
        }>
            <ThemeRenderer storeSubdomain={subdomain} />
        </Suspense>
    );
}


