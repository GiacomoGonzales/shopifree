import { Suspense } from "react";
import ThemeRenderer from "../../components/ThemeRenderer";
import SimpleLoadingSpinner from "../../components/SimpleLoadingSpinner";

export default function StorePage({ params }: { params: { storeSubdomain: string } }) {
    const subdomain = params?.storeSubdomain ?? 'store';
    
    return (
        <Suspense fallback={<SimpleLoadingSpinner inline={true} />}>
            <ThemeRenderer storeSubdomain={subdomain} />
        </Suspense>
    );
}