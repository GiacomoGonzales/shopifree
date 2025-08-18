import type { Metadata } from "next";
import { headers } from 'next/headers';
import { getStoreMetadata } from "../../../server-only/store-metadata";
import SEOScripts from "../../../components/SEOScripts";
import { generateAllImageVariants } from "../../../lib/image-optimization";
import { resolveStoreFromRequest } from "../../../lib/resolve-store";
import { isValidLocale, normalizeLocale, VALID_LOCALES } from "../../../lib/locale-validation";
import { extractGoogleVerificationToken, isValidGoogleToken } from "../../../lib/google-verification";
import { getCanonicalHost } from "../../../lib/canonical-resolver";

export async function generateMetadata({ params }: { params: { storeSubdomain: string; locale: string } }): Promise<Metadata> {
    const subdomain = params?.storeSubdomain ?? "store";
    const rawLocale = params?.locale ?? "es";
    
    // Normalizar locale a uno válido
    const locale = normalizeLocale(rawLocale);
    
    const data = await getStoreMetadata(subdomain);
    
    // Obtener host canónico oficial usando nueva función
    const canonical = await getCanonicalHost(subdomain);
    const canonicalUrl = `${canonical.canonicalHost}/${locale}`;
    
    // Detectar si current host es el canónico
    const headersList = headers();
    const currentHost = headersList.get('host') || 'localhost:3004';
    const currentUrl = `https://${currentHost}`;
    const isCanonicalVersion = currentUrl === canonical.canonicalHost;
    
    console.log('🔍 [Layout] Store resuelto:', { 
        subdomain,
        canonicalHost: canonical.canonicalHost, 
        isCustomDomain: canonical.isCustomDomain,
        isCanonicalVersion,
        canonicalUrl
    });
    
    // Usar datos SEO personalizados o fallbacks
    const title = data?.title ?? `${subdomain} | Shopifree`;
    const description = data?.description ?? "Tienda en Shopifree.";
    const ogTitle = data?.ogTitle || title;
    const ogDescription = data?.ogDescription || description;
    const ogImage = data?.ogImage || data?.image || "/default-og.png";
    const keywords = data?.keywords;
    const robots = data?.robots || "index,follow";
    
    // Usar el host canónico resuelto
    const storeUrl = canonicalUrl;
    
    // Site name mejorado (solo nombre de tienda, sin eslogan)
    const siteName = data?.storeName || subdomain;
    
    // Generar imágenes optimizadas para diferentes plataformas
    const imageVariants = generateAllImageVariants(ogImage, data?.whatsappImage);
    
    // Construir objeto de metadata completo
    const metadata: Metadata = {
        title,
        description,
        keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        // 🔥 NOINDEX SI NO ES VERSION CANÓNICA
        robots: isCanonicalVersion ? robots : 'noindex, nofollow',
        
        // Open Graph para redes sociales - Múltiples imágenes para diferentes plataformas
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: storeUrl,
            locale: locale === 'es' ? 'es_ES' : 'en_US',
            images: [
                {
                    url: imageVariants.social,
                    width: 1200,
                    height: 630,
                    alt: ogTitle,
                    type: 'image/jpeg',
                    secureUrl: imageVariants.social
                },
                {
                    url: imageVariants.whatsapp,
                    width: 400,
                    height: 400,
                    alt: ogTitle,
                    type: 'image/jpeg',
                    secureUrl: imageVariants.whatsapp
                }
            ],
            type: 'website',
            siteName: siteName
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
    
    // Agregar Google Search Console verification - solo si token válido Y es versión canónica
    if (isCanonicalVersion) {
        const googleToken = extractGoogleVerificationToken(data?.googleSearchConsole);
        if (isValidGoogleToken(googleToken)) {
            metadata.verification = {
                google: googleToken
            };
        }
    }
    
    // Configurar canonical URL y hreflang con host canónico - solo locales válidos
    const hreflangLanguages: Record<string, string> = {};
    
    // Generar hreflang solo para locales válidos - siempre usar canonical host
    VALID_LOCALES.forEach(validLocale => {
        hreflangLanguages[validLocale] = `${canonical.canonicalHost}/${validLocale}`;
    });
    hreflangLanguages['x-default'] = `${canonical.canonicalHost}/es`;
    
    metadata.alternates = {
        canonical: storeUrl,
        languages: hreflangLanguages
    };

    // NOTA: Removemos meta name="sitemap" y meta robots con URLs
    // Los sitemaps se declaran en robots.txt, no en meta tags
    // Los robots se declaran en meta robots sin URLs
    
    // Agregar favicon personalizado si está configurado
    if (data?.favicon) {
        metadata.icons = {
            icon: [
                { url: data.favicon, sizes: '32x32', type: 'image/png' },
                { url: data.favicon, sizes: '16x16', type: 'image/png' }
            ],
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
            {/* Preconnect para recursos externos críticos */}
            <link rel="preconnect" href="https://res.cloudinary.com" />
            <link rel="dns-prefetch" href="https://res.cloudinary.com" />
            
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


