import type { Metadata } from "next";
import { headers } from 'next/headers';
import { getStoreMetadata } from "../../server-only/store-metadata";
import SEOScripts from "../../components/SEOScripts";
import { generateAllImageVariants } from "../../lib/image-optimization";
import { resolveStoreFromRequest } from "../../lib/resolve-store";
import { SUPPORTED_LOCALES, type SupportedLocale } from "../../i18n";
import { extractGoogleVerificationToken, isValidGoogleToken } from "../../lib/google-verification";
import { getCanonicalHost } from "../../lib/canonical-resolver";
import { getStorePrimaryLocale, type ValidLocale } from "../../lib/store";
import { StoreLanguageRoot } from "../../lib/store-language-root";

export async function generateMetadata({ params }: { params: { storeSubdomain: string } }): Promise<Metadata> {
    const subdomain = params?.storeSubdomain ?? "store";
    
    const data = await getStoreMetadata(subdomain);
    
    // Obtener host canónico oficial usando nueva función
    const canonical = await getCanonicalHost(subdomain);
    
    // Obtener idioma principal de la tienda
    const effectiveLocale = canonical.storeId ? await getStorePrimaryLocale(canonical.storeId) || 'es' : 'es';
    
    // SIEMPRE usar URLs sin prefijo de idioma
    const canonicalUrl = canonical.canonicalHost;
    
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
    // ❌ REMOVIDO: keywords - meta keywords es obsoleta desde 2009
    // const keywords = data?.keywords;
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
        effectiveLocale,
        robotsConfig: robots,
        finalRobots: isCanonicalVersion ? robots : (robots === 'noindex, nofollow' ? robots : 'index, follow')
    });
    
    // Usar el host canónico resuelto
    const storeUrl = canonicalUrl;
    
    // Site name mejorado (solo nombre de tienda, sin eslogan)
    const siteName = data?.storeName || subdomain;
    
    // Generar imágenes optimizadas para diferentes plataformas
    // Usar el logo de la tienda para Apple Touch Icon si está disponible
    const iconSource = data?.logoUrl || ogImage;
    const imageVariants = generateAllImageVariants(ogImage);
    const appleIconVariant = iconSource !== ogImage ? generateAllImageVariants(iconSource).appleTouchIcon : imageVariants.appleTouchIcon;
    
    // Construir objeto de metadata completo
    const metadata: Metadata = {
        title,
        description,
        // ❌ REMOVIDO: keywords - meta keywords es obsoleta desde 2009 y Google la ignora
        // keywords: keywords ? keywords.split(',').map(k => k.trim()) : undefined,
        
        // 🍎 iOS Safari viewport para efecto inmersivo (fundir header con status bar)
        viewport: {
            width: 'device-width',
            initialScale: 1,
            viewportFit: 'cover'
        },
        
        // 🚀 MEJORADO: Robots con directivas adicionales para mejor SEO
        robots: {
            index: isCanonicalVersion ? (robots?.includes('noindex') ? false : true) : (robots === 'noindex, nofollow' ? false : true),
            follow: isCanonicalVersion ? (robots?.includes('nofollow') ? false : true) : (robots === 'noindex, nofollow' ? false : true),
            // 🎯 Directivas adicionales recomendadas
            'max-image-preview': 'large',
            'max-snippet': -1,
            'max-video-preview': -1
        },
        
        // Open Graph para redes sociales - Múltiples imágenes para diferentes plataformas
        // NOTA: No especificamos og:image:type para permitir que Cloudinary f_auto 
        // seleccione el mejor formato (WebP, AVIF, etc.) según el navegador
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
                    // ❌ REMOVIDO: type - inconsistente con f_auto de Cloudinary
                    // type: 'image/jpeg',
                    secureUrl: imageVariants.social
                },
                {
                    url: imageVariants.whatsapp,
                    width: 400,
                    height: 400,
                    alt: ogTitle,
                    // ❌ REMOVIDO: type - inconsistente con f_auto de Cloudinary  
                    // type: 'image/jpeg',
                    secureUrl: imageVariants.whatsapp
                }
            ],
            type: 'website',
            siteName: siteName
        },
        
        // Twitter/X optimizado - solo datos necesarios
        twitter: {
            card: "summary_large_image",
            title: ogTitle,
            description: ogDescription,
            images: [{
                url: imageVariants.social,
                // ❌ REMOVIDO: width y height - Twitter no las usa, solo añaden ruido
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
    
    // Configurar canonical URL (sin hreflang porque todas las tiendas usan URLs simples)
    metadata.alternates = {
        canonical: canonicalUrl
    };
    
    // 🚀 NOTA: Preconnects se añaden directamente en el JSX del layout
    
    console.log('🎯 [Simple Mode] URLs sin prefijo para', subdomain, '- primaryLocale:', effectiveLocale);

    // NOTA: Removemos meta name="sitemap" y meta robots con URLs
    // Los sitemaps se declaran en robots.txt, no en meta tags
    // Los robots se declaran en meta robots sin URLs
    
    // Agregar íconos personalizados si están configurados
    if (data?.favicon) {
        metadata.icons = {
            icon: [
                { url: data.favicon, sizes: '32x32', type: 'image/png' },
                { url: data.favicon, sizes: '16x16', type: 'image/png' }
            ],
            shortcut: data.favicon,
            // 🍎 MEJORADO: Apple Touch Icon optimizado a 180x180px usando el logo de la tienda
            apple: appleIconVariant || data.favicon
        };
    }
    
    // Debug logging
    console.log(`🔍 [SEO] Metadata generada para ${subdomain}:`, {
        title,
        hasCustomOG: !!data?.ogImage,
        // ❌ REMOVIDO: keywords debug - ya no usamos keywords
        // hasKeywords: !!keywords,
        hasCanonical: !!data?.canonicalUrl,
        hasFavicon: !!data?.favicon,
        hasAppleTouchIcon: !!appleIconVariant,
        appleTouchIconUrl: appleIconVariant,
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
    const primaryLocale = canonical.storeId ? await getStorePrimaryLocale(canonical.storeId) : null;
    const effectiveLocale = primaryLocale || 'es';
    
    // 🍎 Obtener el color primario de la tienda para theme-color dinámico
    let primaryColor = '#ffffff'; // fallback por defecto
    if (canonical.storeId) {
        try {
            const { getStoreBasicInfo } = await import('../../lib/store');
            const storeInfo = await getStoreBasicInfo(canonical.storeId);
            primaryColor = storeInfo?.primaryColor || '#ffffff';
        } catch (error) {
            console.log('Using default primary color for theme-color');
        }
    }
    
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
            {/* 🍎 iOS Safari theme-color dinámico basado en color primario de la tienda */}
            <meta name="theme-color" content={primaryColor} />
            <meta name="mobile-web-app-capable" content="yes" />
            <meta name="apple-mobile-web-app-status-bar-style" content="default" />
            
            {/* 🚀 Preconnects críticos para Cloudinary - una sola vez */}
            <link rel="preconnect" href="https://res.cloudinary.com" />
            <link rel="dns-prefetch" href="https://res.cloudinary.com" />
            
            {/* 🚀 OPTIMIZACIÓN: Preload de fuentes críticas - solo estas funcionan siempre */}
            <link rel="preconnect" href="https://fonts.googleapis.com" />
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            
            {/* Scripts de SEO y Analytics - estos no van en metadata */}
            <SEOScripts
                storeSubdomain={subdomain}
                googleAnalytics={seoData?.googleAnalytics}
                googleSearchConsole={seoData?.googleSearchConsole}
                metaPixel={seoData?.metaPixel}
                tiktokPixel={seoData?.tiktokPixel}
                structuredDataEnabled={seoData?.structuredDataEnabled}
                storeInfo={storeInfo}
            />
            
            <StoreLanguageRoot language={effectiveLocale as any}>
                {children}
            </StoreLanguageRoot>
        </>
    );
}


