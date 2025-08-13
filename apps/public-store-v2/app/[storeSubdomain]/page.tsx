import dynamic from "next/dynamic";
import { Suspense } from "react";

const MinimalClean = dynamic(() => import("../../themes/minimal-clean/MinimalClean"), { ssr: false });

export default function StorePage({ params }: { params: { storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? "store";
    return (
        <Suspense fallback={<div className="container">Cargando…</div>}>
            <MinimalClean storeSubdomain={subdomain} />
        </Suspense>
    );
}


