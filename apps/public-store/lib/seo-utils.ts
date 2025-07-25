import type { Metadata } from 'next'
import { StoreDataServer, StoreDataClient } from './store'
import { PublicProduct } from './products'

/**
 * Limpia texto HTML para usar en meta tags de redes sociales
 * Remueve todas las etiquetas HTML y decodifica entidades
 */
export function cleanHtmlForSocialMedia(htmlText: string): string {
  try {
    if (!htmlText || typeof htmlText !== 'string') return ''
    
    return htmlText
      // Primero decodificar entidades HTML comunes
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&nbsp;/g, ' ')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
      .replace(/&#x2F;/g, '/')
      .replace(/&apos;/g, "'")
      // Remover todas las etiquetas HTML
      .replace(/<[^>]*>/g, '')
      // Limpiar espacios extra y saltos de línea
      .replace(/\s+/g, ' ')
      .replace(/[\r\n]+/g, ' ')
      .trim()
  } catch (error) {
    console.warn('Error cleaning HTML for social media:', error)
    return String(htmlText || '').slice(0, 200) // Fallback seguro
  }
}

/**
 * Optimiza una imagen para WhatsApp usando Cloudinary
 * WhatsApp prefiere imágenes cuadradas de 400x400px
 */
export function optimizeImageForWhatsApp(imageUrl: string | null | undefined): string | null {
  try {
    if (!imageUrl || typeof imageUrl !== 'string') return null
    
    // Si la imagen ya está optimizada para WhatsApp, devolverla tal como está
    if (imageUrl.includes('c_fill,h_400,w_400')) {
      return imageUrl
    }
    
    // Si es una imagen de Cloudinary, aplicar transformaciones
    if (imageUrl.includes('cloudinary.com') || imageUrl.includes('res.cloudinary.com')) {
      // Extraer la parte después de /upload/
      const uploadIndex = imageUrl.indexOf('/upload/')
      if (uploadIndex !== -1) {
        const beforeUpload = imageUrl.substring(0, uploadIndex + 8) // incluye '/upload/'
        const afterUpload = imageUrl.substring(uploadIndex + 8)
        
        // Agregar transformaciones para WhatsApp: cuadrado, 400x400, optimizado
        return `${beforeUpload}c_fill,f_auto,q_auto,w_400,h_400/${afterUpload}`
      }
    }
    
    // Si no es de Cloudinary, devolver la imagen original
    return imageUrl
     } catch (error) {
     console.warn('Error optimizing image for WhatsApp:', error)
     return imageUrl || null // Devolver original si falla la optimización
   }
}

// Interfaces para SEO
export interface SEOConfig {
  title?: string
  metaDescription?: string
  keywords?: string[]
  ogTitle?: string
  ogDescription?: string
  ogImage?: string
  whatsappImage?: string
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
          alt: ogTitle,
          type: 'image/jpeg'
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
      'theme-color': store.primaryColor || '#000000',
      'og:image:width': '1200',
      'og:image:height': '630',
      'og:image:type': 'image/jpeg',
      'og:image:secure_url': safeOgImage,
    }
  }

  return metadata
}

/**
 * Genera metadatos para página de producto (con manejo robusto de errores)
 */
export function generateProductMetadata(
  store: StoreDataServer | StoreDataClient,
  product: PublicProduct
): Metadata {
  try {
    console.log('🔧 [SEO] Generating product metadata for:', product.name || 'Unknown product')
    
    // Validación de datos básicos
    if (!store || !product) {
      throw new Error('Store or product data is missing')
    }

    const seo = store.advanced?.seo
    const baseUrl = `https://${store.subdomain || 'unknown'}.shopifree.app`
    
    // Valores seguros con fallbacks
    const productName = product.name || 'Producto'
    const storeName = store.storeName || 'Tienda'
    const title = `${productName} - ${storeName}`
    
    // Limpiar HTML de la descripción para redes sociales (con fallback)
    let cleanDescription: string
    try {
      cleanDescription = cleanHtmlForSocialMedia(product.description || '')
    } catch (descError) {
      console.warn('Error cleaning product description:', descError)
      cleanDescription = 'Producto disponible en nuestra tienda online'
    }
    
    const description = cleanDescription.length > 160 
      ? cleanDescription.substring(0, 157) + '...'
      : cleanDescription || 'Producto disponible en nuestra tienda online'
    
    const ogImage = product.image || seo?.ogImage || store.logoUrl
         const safeOgImage = ogImage || '/brand/icons/favicon.png'
    
    // Crear imagen optimizada para WhatsApp (con manejo de errores)
    let whatsappOptimizedImage: string | null = null
    try {
      whatsappOptimizedImage = optimizeImageForWhatsApp(product.image)
    } catch (imageError) {
      console.warn('Error optimizing image for WhatsApp:', imageError)
      whatsappOptimizedImage = product.image || null
    }
    
    // Crear array de imágenes para máxima compatibilidad
    const images = []
    
    // 1. PRIORITARIO: Imagen optimizada para WhatsApp (400x400)
    if (whatsappOptimizedImage) {
      images.push({
        url: whatsappOptimizedImage,
        width: 400,
        height: 400,
        alt: productName,
        type: 'image/jpeg'
      })
    }
    
    // 2. Solo si es diferente, agregar imagen original para otras redes sociales
    if (product.image && product.image !== whatsappOptimizedImage) {
      images.push({
        url: product.image,
        width: 1200,
        height: 630,
        alt: productName,
        type: 'image/jpeg'
      })
    }
    
    // 3. Fallback si no hay imagen del producto
    if (!product.image && seo?.whatsappImage) {
      images.push({
        url: seo.whatsappImage,
        width: 400,
        height: 400,
        alt: productName,
        type: 'image/jpeg'
      })
    }

    // 4. Fallback final para garantizar al menos una imagen
    if (images.length === 0) {
      images.push({
        url: safeOgImage,
        width: 400,
        height: 400,
        alt: productName,
        type: 'image/jpeg'
      })
    }

    // Precio seguro
    const productPrice = (typeof product.price === 'number' && product.price >= 0) 
      ? product.price 
      : 0

    const metadata: Metadata = {
      title,
      description,
      keywords: [productName, storeName, ...(seo?.keywords || [])].join(', '),
      
      alternates: {
        canonical: `${baseUrl}/${product.slug || product.id || 'producto'}`
      },

      openGraph: {
        title,
        description,
        url: `${baseUrl}/${product.slug || product.id || 'producto'}`,
        siteName: storeName,
        images,
        locale: store.advanced?.language === 'en' ? 'en_US' : 'es_ES',
        type: 'website'
      },

      twitter: {
        card: 'summary_large_image',
        title,
        description,
        images: [safeOgImage] // Twitter usa la imagen estándar
      },

      // Agregar metadatos adicionales para WhatsApp y productos
      other: {
        // Meta tags específicos para productos
        'og:type': 'product',
        'product:price:amount': productPrice.toString(),
        'product:price:currency': store.currency || 'USD',
        'product:availability': 'in stock',
        
        // Para WhatsApp - priorizar imagen del producto optimizada
        'og:image:width': whatsappOptimizedImage ? '400' : '1200',
        'og:image:height': whatsappOptimizedImage ? '400' : '630',
        'og:image:type': 'image/jpeg',
        'og:image:secure_url': whatsappOptimizedImage || product.image || safeOgImage,
      }
    }

    console.log('✅ [SEO] Product metadata generated successfully')
    return metadata

  } catch (error) {
    console.error('🚨 [SEO] Error in generateProductMetadata:', error)
    
         // Fallback ultra-seguro cuando falla la generación completa
     const fallbackImage = '/brand/icons/favicon.png'
    const safeName = (product?.name || 'Producto').substring(0, 50)
    const safeStoreName = (store?.storeName || 'Tienda').substring(0, 50)
    
    return {
      title: `${safeName} - ${safeStoreName}`,
      description: 'Este producto no puede mostrarse temporalmente. Intenta nuevamente más tarde.',
      keywords: 'producto, tienda online',
      
             openGraph: {
         title: `${safeName} - ${safeStoreName}`,
         description: 'Este producto no puede mostrarse temporalmente.',
         type: 'website',
         siteName: safeStoreName,
         locale: 'es_ES',
         images: [{
           url: fallbackImage,
           width: 400,
           height: 400,
           alt: safeName,
           type: 'image/jpeg'
         }]
       },
      
      twitter: {
        card: 'summary_large_image',
        title: `${safeName} - ${safeStoreName}`,
        description: 'Este producto no puede mostrarse temporalmente.',
        images: [fallbackImage]
      },
      
      other: {
        'og:type': 'product',
        'product:availability': 'out of stock',
        'og:image:width': '400',
        'og:image:height': '400',
        'og:image:type': 'image/jpeg',
        'og:image:secure_url': fallbackImage,
      }
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
    whatsappImage: typeof seo?.whatsappImage === 'string' ? seo.whatsappImage : undefined,
    robots: ['index,follow', 'index,nofollow', 'noindex,follow', 'noindex,nofollow'].includes(seo?.robots) 
      ? seo.robots : 'index,follow',
    canonicalUrl: typeof seo?.canonicalUrl === 'string' ? seo.canonicalUrl : undefined,
    structuredDataEnabled: typeof seo?.structuredDataEnabled === 'boolean' ? seo.structuredDataEnabled : true,
    favicon: typeof seo?.favicon === 'string' ? seo.favicon : undefined
  }
} 