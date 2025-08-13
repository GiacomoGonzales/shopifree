import type { Metadata } from "next";
import { getStoreMetadata } from "../../../server-only/store-metadata";

export async function generateMetadata({ params }: { params: { storeSubdomain: string } }): Promise<Metadata> {
    const subdomain = params?.storeSubdomain ?? "store";
    const data = await getStoreMetadata(subdomain);
    const title = data?.title ?? `${subdomain} | Shopifree`;
    const description = data?.description ?? "Tienda en Shopifree.";
    const image = data?.image ?? "/default-og.png";
    return {
        title,
        description,
        openGraph: {
            title,
            description,
            images: [image]
        },
        twitter: {
            card: "summary_large_image",
            title,
            description,
            images: [image]
        }
    };
}

export default function StoreLocaleLayout({ children }: { children: React.ReactNode }) {
    return children;
}


