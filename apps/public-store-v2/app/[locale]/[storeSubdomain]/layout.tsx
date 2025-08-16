import type { Metadata } from "next";
import { getStoreMetadata } from "../../../server-only/store-metadata";
import SEOScripts from "../../../components/SEOScripts";
import { generateAllImageVariants } from "../../../lib/image-optimization";

export async function generateMetadata({ params }: { params: { storeSubdomain: string } }): Promise<Metadata> {
    const subdomain = params?.storeSubdomain ?? "store";
    const data = await getStoreMetadata(subdomain);
    
    // Usar datos SEO personalizados o fallbacks
    const title = data?.title ?? `${subdomain} | Shopifree`;
    const description = data?.description ?? "Tienda en Shopifree.";
    const ogTitle = data?.ogTitle || title;
    const ogDescription = data?.ogDescription || description;
    const ogImage = data?.ogImage || data?.image || "/default-og.png";
    const keywords = data?.keywords;
    const robots = data?.robots || "index,follow";
    
    // Generar imágenes optimizadas para diferentes plataformas
    const imageVariants = generateAllImageVariants(ogImage, data?.whatsappImage);
    
    // Construir objeto de metadata completo
    const metadata: Metadata = {
        title,
        description,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        robots,
        
        // Open Graph para redes sociales - Múltiples imágenes para diferentes plataformas
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            images: [
                {
                    url: imageVariants.social,
                    width: 1200,
                    height: 630,
                    alt: ogTitle
                },
                {
                    url: imageVariants.whatsapp,
                    width: 400,
                    height: 400,
                    alt: ogTitle
                }
            ],
            type: 'website',
            siteName: title
        },
        
        // Twitter/X optimizado - usar imagen social estándar
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description: ogDescription,
            images: [{
                url: imageVariants.social,
                width: 1200,
                height: 630,
                alt: ogTitle
            }]
        }
    };
    
    // Agregar Google Search Console verification
    if (data?.googleSearchConsole) {
        metadata.verification = {
            google: data.googleSearchConsole.replace('google-site-verification=', '')
        };
    }
    
    // Agregar canonical URL si está configurada
    if (data?.canonicalUrl) {
        metadata.alternates = {
            canonical: data.canonicalUrl
        };
    }
    
    // Agregar favicon personalizado si está configurado
    if (data?.favicon) {
        metadata.icons = {
            icon: data.favicon,
            shortcut: data.favicon,
            apple: data.favicon
        };
    }
    
    // Debug logging
    console.log(`🔍 [SEO] Metadata generada para ${subdomain}:`, {
        title,
        hasCustomOG: !!data?.ogImage,
        hasWhatsAppImage: !!data?.whatsappImage,
        hasKeywords: !!keywords,
        hasCanonical: !!data?.canonicalUrl,
        hasFavicon: !!data?.favicon,
        ...imageVariants.info
    });
    
    return metadata;
}

export default async function StoreLocaleLayout({ 
    children, 
    params 
}: { 
    children: React.ReactNode;
    params: { storeSubdomain: string };
}) {
    const subdomain = params?.storeSubdomain ?? "store";
    
    // Obtener datos para SEO scripts - la función getStoreMetadata ya tiene toda la info
    const seoData = await getStoreMetadata(subdomain);
    
    // Construir storeInfo desde los datos completos de seoData
    const storeInfo = seoData ? {
        name: seoData.storeName || seoData.title?.replace(' | Shopifree', '') || subdomain,
        description: seoData.description || `Tienda online ${subdomain}`,
        url: seoData.canonicalUrl || `https://${subdomain}.shopifree.app`,
        logoUrl: seoData.logoUrl || seoData.ogImage,
        address: seoData.address,
        phone: seoData.phone,
        email: seoData.emailStore
    } : undefined;
    
    return (
        <>
            {/* Scripts de SEO y Analytics */}
            <SEOScripts
                storeSubdomain={subdomain}
                googleAnalytics={seoData?.googleAnalytics}
                googleSearchConsole={seoData?.googleSearchConsole}
                metaPixel={seoData?.metaPixel}
                tiktokPixel={seoData?.tiktokPixel}
                structuredDataEnabled={seoData?.structuredDataEnabled}
                storeInfo={storeInfo}
            />
            {children}
        </>
    );
}


