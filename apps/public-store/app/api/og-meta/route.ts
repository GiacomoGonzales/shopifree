import { NextRequest, NextResponse } from 'next/server'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { getStoreProducts } from '../../../lib/products'
import { generateProductMetadata, cleanHtmlForSocialMedia, optimizeImageForWhatsApp } from '../../../lib/seo-utils'

// Lista de crawlers de redes sociales
const SOCIAL_MEDIA_CRAWLERS = [
  'facebookexternalhit',
  'Facebot',
  'Twitterbot',
  'WhatsApp',
  'WhatsApp/2',
  'LinkedInBot',
  'TelegramBot',
  'InstagramBot',
  'SnapchatBot',
  'PinterestBot',
  'TikTokBot',
  'GoogleBot',
  'SlackBot',
  'DiscordBot'
]

// Función para validar URL
function isValidUrl(string: string): boolean {
  try {
    new URL(string)
    return true
  } catch (_) {
    return false
  }
}

function isSocialMediaCrawler(userAgent: string | null): boolean {
  if (!userAgent) return false
  return SOCIAL_MEDIA_CRAWLERS.some(crawler => 
    userAgent.toLowerCase().includes(crawler.toLowerCase())
  )
}

async function generateProductOG(subdomain: string, productSlug: string) {
  try {
    console.log('🔧 [OG-API] Generating product OG for:', subdomain, productSlug)
    
    // 1. Obtener datos de la tienda
    const serverStore = await getStoreBySubdomain(subdomain)
    if (!serverStore) {
      throw new Error('Store not found')
    }

    const clientStore = transformStoreForClient(serverStore)
    if (!clientStore) {
      throw new Error('Store transformation failed')
    }

    // 2. Buscar el producto
    const allProducts = await getStoreProducts(clientStore.id)
    const product = allProducts.find(p => p.slug === productSlug)
    
    if (!product) {
      throw new Error('Product not found')
    }

    // 3. Generar HTML con metadatos Open Graph
    const productTitle = `${product.name} - ${serverStore.storeName}`
    const cleanDescription = cleanHtmlForSocialMedia(product.description || '')
    const productDescription = cleanDescription.length > 160 
      ? cleanDescription.substring(0, 157) + '...'
      : cleanDescription || 'Producto disponible en nuestra tienda online'
    
    const whatsappOptimizedImage = optimizeImageForWhatsApp(product.image)
    const productImage = whatsappOptimizedImage || product.image || serverStore.logoUrl || '/brand/icons/favicon.png'
    const productUrl = `https://${serverStore.subdomain}.shopifree.app/${product.slug}`
    
    const htmlResponse = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Basic SEO -->
  <title>${productTitle}</title>
  <meta name="description" content="${productDescription}">
  <meta name="robots" content="index,follow">
  
  <!-- Open Graph básico -->
  <meta property="og:type" content="product">
  <meta property="og:title" content="${productTitle}">
  <meta property="og:description" content="${productDescription}">
  <meta property="og:url" content="${productUrl}">
  <meta property="og:site_name" content="${serverStore.storeName}">
  <meta property="og:locale" content="es_ES">
  
  <!-- Open Graph imágenes -->
  <meta property="og:image" content="${productImage}">
  <meta property="og:image:width" content="400">
  <meta property="og:image:height" content="400">
  <meta property="og:image:alt" content="${product.name}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:secure_url" content="${productImage}">
  
  <!-- Meta tags específicos para productos -->
  <meta name="product:price:amount" content="${product.price}">
  <meta name="product:price:currency" content="${serverStore.currency || 'USD'}">
  <meta name="product:availability" content="in stock">
  
  <!-- Twitter -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${productTitle}">
  <meta name="twitter:description" content="${productDescription}">
  <meta name="twitter:image" content="${productImage}">
  
  <!-- Canonical -->
  <link rel="canonical" href="${productUrl}">
  
  <!-- Favicon -->
  <link rel="icon" href="${serverStore.advanced?.seo?.favicon || '/brand/icons/favicon.png'}">
</head>
<body>
  <h1>${product.name}</h1>
  <p>${productDescription}</p>
  <p>Precio: ${serverStore.currency || 'USD'} ${product.price}</p>
  <p><a href="${productUrl}">Ver producto</a></p>
  
  <!-- Para crawlers que necesitan contenido visible -->
  <div style="display: none;">
    <img src="${productImage}" alt="${product.name}">
  </div>
</body>
</html>`

    return htmlResponse

  } catch (error) {
    console.error('🚨 [OG-API] Error generating product OG:', error)
    
    // Fallback HTML para cuando todo falla
    const fallbackHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Producto - Shopifree</title>
  <meta name="description" content="Producto no disponible temporalmente">
  <meta property="og:type" content="product">
  <meta property="og:title" content="Producto - Shopifree">
  <meta property="og:description" content="Producto no disponible temporalmente">
  <meta property="og:image" content="/brand/icons/favicon.png">
  <meta property="og:image:width" content="400">
  <meta property="og:image:height" content="400">
  <meta name="twitter:card" content="summary_large_image">
</head>
<body>
  <h1>Producto no disponible</h1>
  <p>Este producto no está disponible temporalmente.</p>
</body>
</html>`
    
    return fallbackHtml
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')
    const productSlug = searchParams.get('productSlug')
    const userAgent = request.headers.get('user-agent')
    
    console.log('🔧 [OG-API] Request received:', {
      subdomain,
      productSlug,
      userAgent,
      isCrawler: isSocialMediaCrawler(userAgent)
    })
    
    // Solo procesar si es un bot de redes sociales
    if (!isSocialMediaCrawler(userAgent)) {
      return NextResponse.redirect(new URL(`/${subdomain}/${productSlug}`, request.url))
    }
    
    if (!subdomain || !productSlug) {
      return new NextResponse('Missing parameters', { status: 400 })
    }
    
    const htmlContent = await generateProductOG(subdomain, productSlug)
    
    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400'
      }
    })
    
  } catch (error) {
    console.error('🚨 [OG-API] Error in GET handler:', error)
    
    // Respuesta de error mínima pero válida para bots
    const errorHtml = `<!DOCTYPE html>
<html><head>
<title>Error - Shopifree</title>
<meta property="og:title" content="Error - Shopifree">
<meta property="og:description" content="Error al cargar el producto">
<meta property="og:type" content="website">
</head><body><h1>Error</h1></body></html>`
    
    return new NextResponse(errorHtml, {
      status: 500,
      headers: { 'Content-Type': 'text/html; charset=utf-8' }
    })
  }
} 