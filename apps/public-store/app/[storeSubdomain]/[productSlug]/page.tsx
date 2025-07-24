import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { getStoreProducts } from '../../../lib/products'
import { generateProductMetadata, generateProductStructuredData } from '../../../lib/seo-utils'
import { Tienda } from '../../../lib/types'
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

  // 7. Renderizar el componente del cliente
  return (
    <>
      {/* Meta tags específicos para el producto */}
      <head>
        <title>{productTitle}</title>
        <meta name="description" content={productDescription} />
        
        {/* Open Graph específico para producto */}
        <meta property="og:type" content="product" />
        <meta property="og:title" content={productTitle} />
        <meta property="og:description" content={productDescription} />
        <meta property="og:url" content={productUrl} />
        <meta property="og:site_name" content={serverStore.storeName} />
        {productImage && (
          <>
            <meta property="og:image" content={productImage} />
            <meta property="og:image:width" content="800" />
            <meta property="og:image:height" content="600" />
            <meta property="og:image:alt" content={product.name} />
          </>
        )}
        
        {/* Twitter Card para producto */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={productTitle} />
        <meta name="twitter:description" content={productDescription} />
        {productImage && <meta name="twitter:image" content={productImage} />}
        
        {/* Canonical URL para el producto */}
        <link rel="canonical" href={productUrl} />
      </head>
      
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