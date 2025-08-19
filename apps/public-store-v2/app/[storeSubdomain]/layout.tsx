import type { Metadata } from "next";
import { headers } from 'next/headers';
import { getStoreMetadata } from "../../server-only/store-metadata";
import SEOScripts from "../../components/SEOScripts";
import { generateAllImageVariants } from "../../lib/image-optimization";
import { resolveStoreFromRequest } from "../../lib/resolve-store";
import { SUPPORTED_LOCALES, type SupportedLocale } from "../../i18n";
import { extractGoogleVerificationToken, isValidGoogleToken } from "../../lib/google-verification";
import { getCanonicalHost } from "../../lib/canonical-resolver";
import { getStoreLocaleConfig, type ValidLocale } from "../../lib/store";
import { StoreLanguageRoot } from "../../lib/store-language-root";

export async function generateMetadata({ params }: { params: { storeSubdomain: string } }): Promise<Metadata> {
    const subdomain = params?.storeSubdomain ?? "store";
    
    const data = await getStoreMetadata(subdomain);
    
    // Obtener host canónico oficial usando nueva función
    const canonical = await getCanonicalHost(subdomain);
    
    // 🚀 NUEVA LÓGICA: Obtener configuración de single locale para esta tienda
    const storeConfig = canonical.storeId ? await getStoreLocaleConfig(canonical.storeId) : null;
    const effectiveLocale = storeConfig?.primaryLocale || 'es';
    const singleLocaleUrls = storeConfig?.singleLocaleUrls || false;
    
    // Construir canonical URL según la configuración
    const canonicalUrl = singleLocaleUrls 
        ? canonical.canonicalHost  // Sin prefijo de idioma
        : `${canonical.canonicalHost}/${effectiveLocale}`;  // Con prefijo
    
    // Detectar si current host es el canónico
    const headersList = headers();
    const currentHost = headersList.get('host') || 'localhost:3004';
    const currentUrl = `https://${currentHost}`;
    
    // 🔥 CORRECCIÓN CRÍTICA: Mejorar detección de versión canónica
    // Considerar canónica si:
    // 1. Es exactamente el host canónico
    // 2. Es desarrollo local
    // 3. Es el mismo dominio sin protocolo (para single locale URLs)
    const canonicalHostWithoutProtocol = canonical.canonicalHost.replace('https://', '').replace('http://', '');
    const isCanonicalVersion = 
        currentUrl === canonical.canonicalHost || 
        currentHost === canonicalHostWithoutProtocol ||
        (process.env.NODE_ENV === 'development' && currentHost.includes('localhost')) ||
        (process.env.NODE_ENV === 'development' && currentHost.includes('127.0.0.1'));
    
    // Usar datos SEO personalizados o fallbacks
    const title = data?.title ?? `${subdomain} | Shopifree`;
    const description = data?.description ?? "Tienda en Shopifree.";
    const ogTitle = data?.ogTitle || title;
    const ogDescription = data?.ogDescription || description;
    const ogImage = data?.ogImage || data?.image || "/default-og.png";
    const keywords = data?.keywords;
    const robots = data?.robots || "index,follow";
    
    console.log('🔍 [Layout] Store resuelto:', { 
        subdomain,
        canonicalHost: canonical.canonicalHost, 
        isCustomDomain: canonical.isCustomDomain,
        currentHost,
        currentUrl,
        canonicalHostWithoutProtocol,
        isCanonicalVersion,
        canonicalUrl,
        singleLocaleUrls,
        effectiveLocale,
        robotsConfig: robots,
        finalRobots: isCanonicalVersion ? robots : (robots === 'noindex, nofollow' ? robots : 'index, follow')
    });
    
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
        // 🚀 CORRECCIÓN SEO: Permitir indexación en la mayoría de casos
        // Solo aplicar noindex si específicamente está configurado o en casos muy específicos
        robots: isCanonicalVersion ? robots : (robots === 'noindex, nofollow' ? robots : 'index, follow'),
        
        // Open Graph para redes sociales - Múltiples imágenes para diferentes plataformas
        openGraph: {
            title: ogTitle,
            description: ogDescription,
            url: storeUrl,
            locale: effectiveLocale === 'es' ? 'es_ES' : effectiveLocale === 'pt' ? 'pt_BR' : 'en_US',
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
    
    // Agregar Google Search Console verification
    const googleToken = extractGoogleVerificationToken(data?.googleSearchConsole);
    console.log('🔍 [GSC Debug]:', {
        isCanonicalVersion,
        currentUrl,
        canonicalHost: canonical.canonicalHost,
        hasToken: !!googleToken,
        rawGoogleSearchConsole: data?.googleSearchConsole,
        extractedToken: googleToken
    });
    
    // ✅ MEJORADO: Agregar Google Search Console verification siempre que sea válido
    if (isValidGoogleToken(googleToken)) {
        metadata.verification = {
            google: googleToken
        };
        console.log('✅ [GSC] Token añadido al metadata:', googleToken);
    } else if (googleToken) {
        console.warn('⚠️ [GSC] Token presente pero inválido:', googleToken);
    }
    
    // 🚀 NUEVA LÓGICA: Configurar canonical URL y hreflang según singleLocaleUrls
    metadata.alternates = {
        canonical: canonicalUrl
    };
    
    // Solo agregar hreflang si NO es single locale mode
    if (!singleLocaleUrls) {
        const hreflangLanguages: Record<string, string> = {};
        
        // Generar hreflang solo para locales válidos - siempre usar canonical host
        SUPPORTED_LOCALES.forEach(supportedLocale => {
            hreflangLanguages[supportedLocale] = `${canonical.canonicalHost}/${supportedLocale}`;
        });
        hreflangLanguages['x-default'] = `${canonical.canonicalHost}/${effectiveLocale}`;
        
        metadata.alternates.languages = hreflangLanguages;
        
        console.log('🌐 [Hreflang] Multi-locale URLs habilitadas para', subdomain);
    } else {
        console.log('🎯 [Single Locale] Sin hreflang para', subdomain, '- primaryLocale:', effectiveLocale);
    }

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
    
    // 🚀 NUEVA LÓGICA: Obtener configuración de idioma para HTML lang
    const canonical = await getCanonicalHost(subdomain);
    const storeConfig = canonical.storeId ? await getStoreLocaleConfig(canonical.storeId) : null;
    const effectiveLocale = storeConfig?.primaryLocale || 'es';
    
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
        <html lang={effectiveLocale}>
            <head>
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
            </head>
            <body>
                <StoreLanguageRoot language={effectiveLocale as any}>
                    {children}
                </StoreLanguageRoot>
            </body>
        </html>
    );
}


