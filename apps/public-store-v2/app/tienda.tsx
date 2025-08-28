import { Suspense } from "react";
import ThemeRenderer from "../../components/ThemeRenderer";
import SimpleLoadingSpinner from "../../components/SimpleLoadingSpinner";
import { getStoreMetadata } from "../../server-only/store-metadata";

export default async function StorePage({ params }: { params: { storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? 'store';
    
    // 🚀 MEJORADO: Pre-cargar metadatos de la tienda en SSR para mejor SEO/LCP
    const storeData = await getStoreMetadata(subdomain);
    
    // 🚀 SSR Content: Mostrar información básica de la tienda inmediatamente
    const StaticStoreContent = () => (
        <div className="min-h-screen bg-transparent">
            {/* Header estático con datos SSR */}
            <header className="bg-white/95 backdrop-blur-sm shadow-sm border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            {storeData?.logoUrl && (
                                <img 
                                    src={storeData.logoUrl} 
                                    alt={storeData.storeName || subdomain}
                                    className="w-10 h-10 rounded-lg object-contain"
                                    width="40"
                                    height="40"
                                />
                            )}
                            <h1 className="text-xl font-semibold text-gray-900">
                                {storeData?.storeName || subdomain}
                            </h1>
                        </div>
                    </div>
                </div>
            </header>
            
            {/* Hero section con contenido real SSR */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="text-center py-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        {storeData?.title || `Bienvenido a ${storeData?.storeName || subdomain}`}
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-8">
                        {storeData?.description || 'Descubre nuestros productos exclusivos con la mejor calidad y atención personalizada.'}
                    </p>
                    <div className="inline-flex items-center gap-2 text-sm text-gray-500">
                        <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                        Cargando productos...
                    </div>
                </div>
            </main>
        </div>
    );
    
    return (
        <Suspense fallback={<StaticStoreContent />}>
            <ThemeRenderer storeSubdomain={subdomain} />
        </Suspense>
    );
}