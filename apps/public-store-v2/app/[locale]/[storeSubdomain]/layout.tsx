import type { Metadata } from "next";
import { headers } from 'next/headers';
import { getStoreMetadata } from "../../../server-only/store-metadata";
import SEOScripts from "../../../components/SEOScripts";
import { generateAllImageVariants } from "../../../lib/image-optimization";

export async function generateMetadata({ params }: { params: { storeSubdomain: string; locale: string } }): Promise<Metadata> {
    const subdomain = params?.storeSubdomain ?? "store";
    const locale = params?.locale ?? "es";
    const data = await getStoreMetadata(subdomain);
    
    // Detectar dominio personalizado usando headers
    const headersList = headers();
    const host = headersList.get('host') || '';
    const isCustomDomain = !host.endsWith('shopifree.app') && 
                          !host.endsWith('localhost') && 
                          host !== 'localhost';
    
    console.log('🔍 [Layout] Debug dominio:', { 
        host, 
        isCustomDomain, 
        canonicalUrl: data?.canonicalUrl
    });
    
    // Usar datos SEO personalizados o fallbacks
    const title = data?.title ?? `${subdomain} | Shopifree`;
    const description = data?.description ?? "Tienda en Shopifree.";
    const ogTitle = data?.ogTitle || title;
    const ogDescription = data?.ogDescription || description;
    const ogImage = data?.ogImage || data?.image || "/default-og.png";
    const keywords = data?.keywords;
    const robots = data?.robots || "index,follow";
    
    // Construir URLs absolutas correctas según el tipo de dominio
    let baseUrl: string;
    let storeUrl: string;
    
    if (isCustomDomain) {
        // Para dominios personalizados: usar el hostname del request
        const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
        baseUrl = `${protocol}://${host}`;
        storeUrl = data?.canonicalUrl || baseUrl;
    } else {
        // Para subdominios de plataforma: usar configuración normal
        baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://shopifree.app';
        storeUrl = data?.canonicalUrl || `${baseUrl}/${locale}/${subdomain}`;
    }
    
    // Site name mejorado (solo nombre de tienda, sin eslogan)
    const siteName = data?.storeName || subdomain;
    
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
    
    // Agregar Google Search Console verification
    if (data?.googleSearchConsole) {
        metadata.verification = {
            google: data.googleSearchConsole.replace('google-site-verification=', '')
        };
    }
    
    // Configurar canonical URL y hreflang basado en el tipo de dominio
    metadata.alternates = {
        canonical: storeUrl,
        languages: isCustomDomain ? {
            // Para dominios personalizados: usar el mismo dominio
            'es': `${baseUrl}/es`,
            'en': `${baseUrl}/en`,
            'x-default': `${baseUrl}/es`
        } : {
            // Para subdominios de plataforma: usar formato con subdominio
            'es': `${baseUrl}/es/${subdomain}`,
            'en': `${baseUrl}/en/${subdomain}`,
            'x-default': `${baseUrl}/es/${subdomain}`
        }
    };

    // Agregar referencia al sitemap dinámico
    metadata.other = {
        'sitemap': `${storeUrl}/sitemap.xml`,
        'robots': `${storeUrl}/robots.txt`
    };
    
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


