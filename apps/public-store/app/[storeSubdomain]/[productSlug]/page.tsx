import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { headers } from 'next/headers'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { getStoreProducts } from '../../../lib/products'
import { generateProductMetadata, generateProductStructuredData, optimizeImageForWhatsApp, cleanHtmlForSocialMedia } from '../../../lib/seo-utils'
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
  
  // Limpiar HTML de la descripción para redes sociales
  const cleanDescription = cleanHtmlForSocialMedia(product.description)
  
  const productDescription = cleanDescription.length > 160 
    ? cleanDescription.substring(0, 157) + '...'
    : cleanDescription
  const productImage = product.image || seo?.ogImage || serverStore.logoUrl
  const productUrl = `https://${serverStore.subdomain}.shopifree.app/${product.slug}`

  // Optimizar imagen para WhatsApp si es un crawler
  const whatsappOptimizedImage = optimizeImageForWhatsApp(product.image)
  const fallbackImage = whatsappOptimizedImage || productImage

  // 7. Los crawlers usarán generateMetadata para obtener los meta tags optimizados
  // No necesitamos renderizar HTML especial aquí

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