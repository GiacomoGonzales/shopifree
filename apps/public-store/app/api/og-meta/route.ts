import { NextRequest, NextResponse } from 'next/server'
import { getStoreBySubdomain } from '../../../lib/store'

// Función para sanitizar texto y evitar problemas con caracteres especiales
function sanitizeText(text: string | undefined | null): string {
  if (!text) return ''
  
  return text
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/&/g, '&amp;')
    .trim()
}

// Función para validar URL
function isValidUrl(url: string | undefined | null): boolean {
  if (!url) return false
  try {
    new URL(url)
    return true
  } catch {
    return false
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const subdomain = searchParams.get('subdomain')
    
    if (!subdomain) {
      return new NextResponse('Missing subdomain parameter', { status: 400 })
    }

    // Get store data
    const store = await getStoreBySubdomain(subdomain)
    
    if (!store) {
      return new NextResponse('Store not found', { status: 404 })
    }

    // Sanitizar y validar datos
    const seo = store.advanced?.seo
    const storeName = sanitizeText(store.storeName) || 'Tienda Online'
    const storeDescription = sanitizeText(store.description) || `Descubre los mejores productos en ${storeName}`
    const storeSlogan = sanitizeText(store.slogan) || 'Tienda Online'
    
    const ogTitle = sanitizeText(seo?.ogTitle || seo?.title || `${storeName} - ${storeSlogan}`)
    const ogDescription = sanitizeText(seo?.ogDescription || seo?.metaDescription || storeDescription)
    
    // Validar URLs de imágenes
    const ogImage = isValidUrl(seo?.ogImage) ? seo?.ogImage : (isValidUrl(store.logoUrl) ? store.logoUrl : '')
    const faviconUrl = isValidUrl(seo?.favicon) ? seo?.favicon : '/brand/icons/favicon.png'
    
    const baseUrl = `https://${subdomain}.shopifree.app`
    const language = store.advanced?.language || 'es'
    const locale = language === 'en' ? 'en_US' : 'es_ES'
    const robots = seo?.robots || 'index,follow'
    const primaryColor = store.primaryColor || '#000000'

    // Generar keywords
    const keywords = seo?.keywords && Array.isArray(seo.keywords) && seo.keywords.length > 0 
      ? seo.keywords.map(k => sanitizeText(k)).filter(k => k).join(', ')
      : ''

    // Return simplified HTML with all meta tags
    const html = `<!DOCTYPE html>
<html lang="${language}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Basic SEO Meta Tags -->
  <title>${ogTitle}</title>
  <meta name="description" content="${ogDescription}">
  ${keywords ? `<meta name="keywords" content="${keywords}">` : ''}
  <meta name="robots" content="${robots}">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDescription}">
  <meta property="og:url" content="${baseUrl}">
  <meta property="og:site_name" content="${storeName}">
  <meta property="og:locale" content="${locale}">
  
  <!-- Multiple images for different platforms - WhatsApp specific image first -->
  ${seo?.whatsappImage && isValidUrl(seo.whatsappImage) ? `
  <meta property="og:image" content="${seo.whatsappImage}">
  <meta property="og:image:width" content="400">
  <meta property="og:image:height" content="400">
  <meta property="og:image:alt" content="${ogTitle}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:secure_url" content="${seo.whatsappImage}">
  ` : ''}
  ${ogImage ? `
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${ogTitle}">
  <meta property="og:image:type" content="image/jpeg">
  <meta property="og:image:secure_url" content="${ogImage}">
  ` : ''}
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${ogDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${seo?.canonicalUrl && isValidUrl(seo.canonicalUrl) ? seo.canonicalUrl : baseUrl}">
  
  <!-- Favicon -->
  <link rel="icon" href="${faviconUrl}" type="image/png">
  <link rel="shortcut icon" href="${faviconUrl}" type="image/png">
  <link rel="apple-touch-icon" href="${faviconUrl}">
  
  <!-- Theme color -->
  <meta name="theme-color" content="${primaryColor}">
  
  <!-- Redirect to main site after meta tags are parsed -->
  <script>
    setTimeout(function() {
      window.location.href = '${baseUrl}';
    }, 1000);
  </script>
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>${storeName}</h1>
    <p>${storeDescription}</p>
    <p>Redirigiendo a la tienda...</p>
  </div>
</body>
</html>`

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'public, max-age=3600, s-maxage=3600',
      },
    })
    
  } catch (error) {
    console.error('Error in og-meta API route:', error)
    
    // Devolver una respuesta HTML básica en caso de error
    const fallbackHtml = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Tienda Online - Shopifree</title>
  <meta name="description" content="Descubre productos increíbles en nuestra tienda online">
  <meta property="og:type" content="website">
  <meta property="og:title" content="Tienda Online - Shopifree">
  <meta property="og:description" content="Descubre productos increíbles en nuestra tienda online">
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>Tienda Online</h1>
    <p>Cargando tienda...</p>
  </div>
</body>
</html>`
    
    return new NextResponse(fallbackHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'no-cache',
      },
    })
  }
} 