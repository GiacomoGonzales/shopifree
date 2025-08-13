import dynamic from "next/dynamic";
import { Suspense } from "react";

const MinimalClean = dynamic(() => import("../../../themes/minimal-clean/MinimalClean"), { ssr: false });

export default function StorePage({ params }: { params: { storeSubdomain: string; locale: string } }) {
    const subdomain = params?.storeSubdomain ?? (typeof window !== 'undefined' ? window.location.hostname.split('.')[0] : 'store');
    const locale = (params as any)?.locale || 'es';
    return (
        <Suspense fallback={<div className="container">Cargando…</div>}>
            <MinimalClean storeSubdomain={subdomain} /* localeActual */ />
        </Suspense>
    );
}


