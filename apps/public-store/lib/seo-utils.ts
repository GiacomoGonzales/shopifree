import type { Metadata } from 'next'
import { StoreDataServer, StoreDataClient } from './store'
import { PublicProduct } from './products'

// Interfaces para SEO
export interface SEOConfig {
  title?: string
  metaDescription?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  robots?: string
  canonicalUrl?: string
  structuredDataEnabled?: boolean
  favicon?: string
}

export interface AnalyticsConfig {
  googleAnalytics?: string
  metaPixel?: string
  tiktokPixel?: string
  googleSearchConsole?: string
}

/**
 * Genera metadatos básicos para una tienda
 */
export function generateStoreMetadata(
  store: StoreDataServer | StoreDataClient,
  overrides?: Partial<SEOConfig>
): Metadata {
  const seo = store.advanced?.seo
  const subdomain = store.subdomain

  // Título con fallback
  const title = overrides?.title || 
    seo?.title || 
    `${store.storeName} - ${store.slogan || 'Tienda Online'}`

  // Descripción con fallback
  const description = overrides?.metaDescription || 
    seo?.metaDescription || 
    store.description || 
    `Descubre los mejores productos en ${store.storeName}. ${store.slogan || 'Compra online de forma fácil y segura.'}`

  // Keywords con fallback
  const keywords = seo?.keywords || [store.storeName, 'tienda online', 'productos']

  // URL base
  const baseUrl = `https://${subdomain}.shopifree.app`
  const canonicalUrl = seo?.canonicalUrl || baseUrl

  // Open Graph
  const ogTitle = seo?.ogTitle || title
  const ogDescription = seo?.ogDescription || description
  const ogImage = seo?.ogImage || store.logoUrl || `${baseUrl}/og-default.jpg`
  
  // Asegurar que ogImage siempre sea string
  const safeOgImage = ogImage || '/brand/icons/favicon.png'

  // Favicon
  const favicon = seo?.favicon || '/brand/icons/favicon.png'

  const metadata: Metadata = {
    title,
    description,
    keywords: keywords.join(', '),
    robots: seo?.robots || 'index,follow',
    
    // URLs canónicas
    alternates: {
      canonical: canonicalUrl
    },

    // Open Graph
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url: baseUrl,
      siteName: store.storeName,
      images: [
        {
          url: safeOgImage,
          width: 1200,
          height: 630,
          alt: ogTitle
        }
      ],
      locale: store.advanced?.language === 'en' ? 'en_US' : 'es_ES',
      type: 'website'
    },

    // Twitter
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [safeOgImage]
    },

    // Iconos
    icons: {
      icon: favicon,
      shortcut: favicon,
      apple: favicon
    },

    // Metadatos adicionales
    other: {
      'theme-color': store.primaryColor || '#000000'
    }
  }

  return metadata
}

/**
 * Genera metadatos para página de producto
 */
export function generateProductMetadata(
  store: StoreDataServer | StoreDataClient,
  product: PublicProduct
): Metadata {
  const seo = store.advanced?.seo
  const baseUrl = `https://${store.subdomain}.shopifree.app`
  
  const title = `${product.name} - ${store.storeName}`
  const description = product.description.length > 160 
    ? product.description.substring(0, 157) + '...'
    : product.description
  
  const ogImage = product.image || seo?.ogImage || store.logoUrl
  const safeOgImage = ogImage || '/brand/icons/favicon.png'
  
  // Usar imagen específica de WhatsApp si está disponible, sino usar la imagen general
  const whatsappImage = seo?.whatsappImage || safeOgImage
  
  // Crear array de imágenes con la de WhatsApp primero (para que WhatsApp la detecte)
  const images = []
  
  // Imagen optimizada para WhatsApp (400x400)
  if (whatsappImage) {
    images.push({
      url: whatsappImage,
      width: 400,
      height: 400,
      alt: product.name
    })
  }
  
  // Imagen estándar para otras redes sociales (800x600)
  if (safeOgImage !== whatsappImage) {
    images.push({
      url: safeOgImage,
      width: 800,
      height: 600,
      alt: product.name
    })
  }

  return {
    title,
    description,
    keywords: [product.name, store.storeName, ...(seo?.keywords || [])].join(', '),
    
    alternates: {
      canonical: `${baseUrl}/${product.slug}`
    },

    openGraph: {
      title,
      description,
      url: `${baseUrl}/${product.slug}`,
      siteName: store.storeName,
      images,
      locale: store.advanced?.language === 'en' ? 'en_US' : 'es_ES',
      type: 'website'
    },

    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [safeOgImage] // Twitter usa la imagen estándar
    }
  }
}

/**
 * Genera datos estructurados (JSON-LD) para la tienda
 */
export function generateStoreStructuredData(store: StoreDataServer | StoreDataClient) {
  if (!store.advanced?.seo?.structuredDataEnabled) {
    return null
  }

  const baseUrl = `https://${store.subdomain}.shopifree.app`
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Store',
    name: store.storeName,
    description: store.description,
    url: baseUrl,
    logo: store.logoUrl,
    image: store.heroImageUrl || store.logoUrl,
    telephone: store.phone,
    currenciesAccepted: store.currency,
    paymentAccepted: ['Credit Card', 'Cash'],
    priceRange: '$$',
    ...(store.hasPhysicalLocation && store.address && {
      address: {
        '@type': 'PostalAddress',
        streetAddress: store.address
      }
    }),
    ...(store.socialMedia && {
      sameAs: Object.values(store.socialMedia).filter(Boolean)
    })
  }

  return JSON.stringify(structuredData)
}

/**
 * Genera datos estructurados para producto
 */
export function generateProductStructuredData(
  store: StoreDataServer | StoreDataClient,
  product: PublicProduct
) {
  if (!store.advanced?.seo?.structuredDataEnabled) {
    return null
  }

  const baseUrl = `https://${store.subdomain}.shopifree.app`
  
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.image,
    url: `${baseUrl}/${product.slug}`,
    brand: {
      '@type': 'Brand',
      name: store.storeName
    },
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: store.currency,
      availability: 'https://schema.org/InStock',
      seller: {
        '@type': 'Organization',
        name: store.storeName,
        url: baseUrl
      }
    },
    ...(product.rating && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviews || 1
      }
    })
  }

  return JSON.stringify(structuredData)
}

/**
 * Genera scripts de analytics
 */
export function generateAnalyticsScripts(store: StoreDataServer | StoreDataClient): string[] {
  const scripts: string[] = []
  const integrations = store.advanced?.integrations
  const seo = store.advanced?.seo

  // Google Analytics
  if (integrations?.googleAnalytics) {
    scripts.push(`
      <!-- Google Analytics -->
      <script async src="https://www.googletagmanager.com/gtag/js?id=${integrations.googleAnalytics}"></script>
      <script>
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${integrations.googleAnalytics}');
      </script>
    `)
  }

  // Meta Pixel (Facebook)
  if (integrations?.metaPixel) {
    scripts.push(`
      <!-- Meta Pixel -->
      <script>
        !function(f,b,e,v,n,t,s)
        {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
        n.callMethod.apply(n,arguments):n.queue.push(arguments)};
        if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
        n.queue=[];t=b.createElement(e);t.async=!0;
        t.src=v;s=b.getElementsByTagName(e)[0];
        s.parentNode.insertBefore(t,s)}(window, document,'script',
        'https://connect.facebook.net/en_US/fbevents.js');
        fbq('init', '${integrations.metaPixel}');
        fbq('track', 'PageView');
      </script>
      <noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${integrations.metaPixel}&ev=PageView&noscript=1"/></noscript>
    `)
  }

  // TikTok Pixel
  if (seo?.tiktokPixel) {
    scripts.push(`
      <!-- TikTok Pixel -->
      <script>
        !function (w, d, t) {
          w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify","instances","debug","on","off","once","ready","alias","group","enableCookie","disableCookie"],ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.instance=function(t){for(var e=ttq._i[t]||[],n=0;n<ttq.methods.length;n++)ttq.setAndDefer(e,ttq.methods[n]);return e},ttq.load=function(e,n){var i="https://analytics.tiktok.com/i18n/pixel/events.js";ttq._i=ttq._i||{},ttq._i[e]=[],ttq._i[e]._u=i,ttq._t=ttq._t||{},ttq._t[e]=+new Date,ttq._o=ttq._o||{},ttq._o[e]=n||{};var o=document.createElement("script");o.type="text/javascript",o.async=!0,o.src=i+"?sdkid="+e+"&lib="+t;var a=document.getElementsByTagName("script")[0];a.parentNode.insertBefore(o,a)};
          ttq.load('${seo.tiktokPixel}');
          ttq.page();
        }(window, document, 'ttq');
      </script>
    `)
  }

  // Google Search Console
  if (seo?.googleSearchConsole) {
    scripts.push(`<meta name="google-site-verification" content="${seo.googleSearchConsole}" />`)
  }

  return scripts
}

/**
 * Valida y sanitiza datos SEO
 */
export function validateSEOData(seo: any): SEOConfig {
  return {
    title: typeof seo?.title === 'string' ? seo.title.substring(0, 60) : undefined,
    metaDescription: typeof seo?.metaDescription === 'string' ? seo.metaDescription.substring(0, 160) : undefined,
    keywords: Array.isArray(seo?.keywords) ? seo.keywords.slice(0, 10) : undefined,
    ogTitle: typeof seo?.ogTitle === 'string' ? seo.ogTitle : undefined,
    ogDescription: typeof seo?.ogDescription === 'string' ? seo.ogDescription : undefined,
    ogImage: typeof seo?.ogImage === 'string' ? seo.ogImage : undefined,
    robots: ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'].includes(seo?.robots) 
      ? seo.robots : 'index,follow',
    canonicalUrl: typeof seo?.canonicalUrl === 'string' ? seo.canonicalUrl : undefined,
    structuredDataEnabled: typeof seo?.structuredDataEnabled === 'boolean' ? seo.structuredDataEnabled : true,
    favicon: typeof seo?.favicon === 'string' ? seo.favicon : undefined
  }
} 