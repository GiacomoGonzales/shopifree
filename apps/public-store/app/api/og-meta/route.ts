import { NextRequest, NextResponse } from 'next/server'
import { getStoreBySubdomain } from '../../../lib/store'

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

    // Generate meta tags
    const seo = store.advanced?.seo
    const ogTitle = seo?.ogTitle || seo?.title || `${store.storeName} - ${store.slogan || 'Tienda Online'}`
    const ogDescription = seo?.ogDescription || seo?.metaDescription || store.description || `Descubre los mejores productos en ${store.storeName}`
    const ogImage = seo?.ogImage || store.logoUrl
    const baseUrl = `https://${store.subdomain}.shopifree.app`
    const faviconUrl = seo?.favicon || '/brand/icons/favicon.png'

    // Return simplified HTML with all meta tags
    const html = `<!DOCTYPE html>
<html lang="${store.advanced?.language || 'es'}">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  
  <!-- Basic SEO Meta Tags -->
  <title>${ogTitle}</title>
  <meta name="description" content="${ogDescription}">
  ${seo?.keywords && seo.keywords.length > 0 ? 
    `<meta name="keywords" content="${seo.keywords.join(', ')}">` : ''
  }
  <meta name="robots" content="${seo?.robots || 'index,follow'}">
  
  <!-- Open Graph Meta Tags -->
  <meta property="og:type" content="website">
  <meta property="og:title" content="${ogTitle}">
  <meta property="og:description" content="${ogDescription}">
  <meta property="og:url" content="${baseUrl}">
  <meta property="og:site_name" content="${store.storeName}">
  <meta property="og:locale" content="${store.advanced?.language === 'en' ? 'en_US' : 'es_ES'}">
  ${ogImage ? `
  <meta property="og:image" content="${ogImage}">
  <meta property="og:image:width" content="1200">
  <meta property="og:image:height" content="630">
  <meta property="og:image:alt" content="${ogTitle}">
  <meta property="og:image:type" content="image/jpeg">
  ` : ''}
  
  <!-- Twitter Card Meta Tags -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${ogTitle}">
  <meta name="twitter:description" content="${ogDescription}">
  ${ogImage ? `<meta name="twitter:image" content="${ogImage}">` : ''}
  
  <!-- Canonical URL -->
  <link rel="canonical" href="${seo?.canonicalUrl || baseUrl}">
  
  <!-- Favicon -->
  <link rel="icon" href="${faviconUrl}" type="image/png">
  <link rel="shortcut icon" href="${faviconUrl}" type="image/png">
  <link rel="apple-touch-icon" href="${faviconUrl}">
  
  <!-- Theme color -->
  <meta name="theme-color" content="${store.primaryColor || '#000000'}">
  
  <!-- Redirect to main site after meta tags are parsed -->
  <script>
    setTimeout(function() {
      window.location.href = '${baseUrl}';
    }, 1000);
  </script>
</head>
<body>
  <div style="text-align: center; padding: 50px; font-family: Arial, sans-serif;">
    <h1>${store.storeName}</h1>
    <p>${store.description}</p>
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
    return new NextResponse('Internal Server Error', { status: 500 })
  }
} 