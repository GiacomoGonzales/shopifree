import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { getStoreProducts } from '../../../lib/products'
import { generateProductMetadata, generateProductStructuredData, optimizeImageForWhatsApp } from '../../../lib/seo-utils'
import { Tienda } from '../../../lib/types'
import { isSocialMediaCrawler } from '../../../middleware'
import ProductClientPage from './ProductClientPage'

interface ProductPageProps {
  params: {
    storeSubdomain: string
    productSlug: string
  }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!serverStore) {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscas no existe o no está disponible'
    }
  }

  const clientStore = transformStoreForClient(serverStore)
  if (!clientStore) {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscas no existe o no está disponible'
    }
  }

  const allProducts = await getStoreProducts(clientStore.id)
  const product = allProducts.find(p => p.slug === params.productSlug)

  if (!product) {
    return {
      title: 'Producto no encontrado',
      description: 'El producto que buscas no existe o no está disponible'
    }
  }

  return generateProductMetadata(serverStore, product)
}

export default async function ProductPage({ params }: ProductPageProps) {
  console.log('🔍 ProductPage params:', params)
  console.log('🔍 Searching for store with subdomain:', params.storeSubdomain)
  
  // Detectar si es un crawler
  const headersList = headers()
  const userAgent = headersList.get('user-agent')
  const isCrawler = isSocialMediaCrawler(userAgent)
  
  if (isCrawler) {
    console.log('🤖 [PRODUCT] Social media crawler detected for product:', params.productSlug)
  }
  
  // 1. Obtener datos de la tienda
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  console.log('🏪 Store found:', serverStore ? serverStore.storeName : 'No store found')
  
  if (!serverStore) {
    console.log('❌ Store not found, calling notFound()')
    notFound()
  }

  // 2. Transformar datos del servidor a formato cliente
  const clientStore = transformStoreForClient(serverStore)
  
  if (!clientStore) {
    notFound()
  }

  // 3. Buscar el producto por slug
  const allProducts = await getStoreProducts(clientStore.id)
  const product = allProducts.find(p => p.slug === params.productSlug)

  if (!product) {
    notFound()
  }

  // 4. Determinar el tema y validar el idioma
  const themeId = clientStore.theme || 'base-default'
  const storeLanguage = clientStore.advanced?.language
  const locale = ['es', 'en'].includes(storeLanguage as 'es' | 'en') ? storeLanguage as 'es' | 'en' : 'es'

  // Convertir StoreDataClient a Tienda
  const tienda: Tienda = {
    ...clientStore,
    theme: themeId,
    socialMedia: clientStore.socialMedia || {}, // Inicializar campo requerido
  }

  // 5. Generar structured data para el producto
  const productStructuredData = generateProductStructuredData(serverStore, product)

  // 6. Generar metadatos para el producto
  const seo = serverStore.advanced?.seo
  const productTitle = `${product.name} - ${serverStore.storeName}`
  const productDescription = product.description.length > 160 
    ? product.description.substring(0, 157) + '...'
    : product.description
  const productImage = product.image || seo?.ogImage || serverStore.logoUrl
  const productUrl = `https://${serverStore.subdomain}.shopifree.app/${product.slug}`

  // Optimizar imagen para WhatsApp si es un crawler
  const whatsappOptimizedImage = optimizeImageForWhatsApp(product.image)
  const fallbackImage = whatsappOptimizedImage || productImage

  // 7. Si es un crawler, devolver HTML optimizado para compartir
  if (isCrawler) {
    return (
      <html lang={serverStore.advanced?.language || 'es'}>
        <head>
          <meta charSet="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          
          {/* Meta tags básicos específicos del producto */}
          <title>{productTitle}</title>
          <meta name="description" content={productDescription} />
          <meta name="robots" content="index,follow" />
          
          {/* Open Graph específico para producto - WhatsApp prioritario */}
          <meta property="og:type" content="product" />
          <meta property="og:title" content={productTitle} />
          <meta property="og:description" content={productDescription} />
          <meta property="og:url" content={productUrl} />
          <meta property="og:site_name" content={serverStore.storeName} />
          <meta property="og:locale" content={serverStore.advanced?.language === 'en' ? 'en_US' : 'es_ES'} />
          
          {/* Imagen optimizada para WhatsApp (400x400) */}
          {whatsappOptimizedImage && (
            <>
              <meta property="og:image" content={whatsappOptimizedImage} />
              <meta property="og:image:width" content="400" />
              <meta property="og:image:height" content="400" />
              <meta property="og:image:alt" content={product.name} />
              <meta property="og:image:type" content="image/jpeg" />
              <meta property="og:image:secure_url" content={whatsappOptimizedImage} />
            </>
          )}
          
          {/* Imagen estándar como fallback para otras redes sociales */}
          {productImage && productImage !== whatsappOptimizedImage && (
            <>
              <meta property="og:image" content={productImage} />
              <meta property="og:image:width" content="1200" />
              <meta property="og:image:height" content="630" />
              <meta property="og:image:alt" content={product.name} />
              <meta property="og:image:type" content="image/jpeg" />
              <meta property="og:image:secure_url" content={productImage} />
            </>
          )}
          
          {/* Twitter Card para producto */}
          <meta name="twitter:card" content="summary_large_image" />
          <meta name="twitter:title" content={productTitle} />
          <meta name="twitter:description" content={productDescription} />
          <meta name="twitter:image" content={fallbackImage} />
          
          {/* Datos del producto para crawlers */}
          <meta property="product:price:amount" content={product.price.toString()} />
          <meta property="product:price:currency" content={serverStore.currency} />
          <meta property="product:availability" content="in stock" />
          
          {/* Canonical URL */}
          <link rel="canonical" href={productUrl} />
          
          {/* Favicon */}
          <link rel="icon" href="/brand/icons/favicon.png" type="image/png" />
        </head>
        <body>
          <div>
            <h1>{product.name}</h1>
            <p>{product.description}</p>
            <p>Precio: {product.price} {serverStore.currency}</p>
            <p>Tienda: {serverStore.storeName}</p>
            {whatsappOptimizedImage && (
              <img src={whatsappOptimizedImage} alt={product.name} style={{ maxWidth: '400px' }} />
            )}
          </div>
          
          {/* Structured Data para el producto */}
          {productStructuredData && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: productStructuredData }}
            />
          )}
        </body>
      </html>
    )
  }

  // 8. Renderizar el componente del cliente para usuarios normales
  return (
    <>
      {/* Structured Data para el producto */}
      {productStructuredData && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: productStructuredData }}
        />
      )}
      <ProductClientPage tienda={tienda} product={product} locale={locale} />
    </>
  )
} 