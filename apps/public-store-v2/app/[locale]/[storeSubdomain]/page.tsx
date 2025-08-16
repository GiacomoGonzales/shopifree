import { Suspense } from "react";
import ThemeRenderer from "../../../components/ThemeRenderer";
import SimpleLoadingSpinner from "../../../components/SimpleLoadingSpinner";

export default function StorePage({ params }: { params: { storeSubdomain: string; locale: string } }) {
    const subdomain = params?.storeSubdomain ?? (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'store');
    const locale = (params as any)?.locale || 'es';
    
    return (
        <Suspense fallback={
            <SimpleLoadingSpinner />
        }>
            <ThemeRenderer storeSubdomain={subdomain} />
        </Suspense>
    );
}


