import { notFound } from 'next/navigation'
import { getStoreBySubdomain } from '../../../lib/store'
import { getStoreProducts } from '../../../lib/products'
import { Tienda } from '../../../lib/types'
import ProductClientPage from './ProductClientPage'

interface ProductPageProps {
  params: {
    storeSubdomain: string
    productSlug: string
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  console.log('🔍 ProductPage params:', params)
  console.log('🔍 Searching for store with subdomain:', params.storeSubdomain)
  
  // 1. Obtener datos de la tienda
  const store = await getStoreBySubdomain(params.storeSubdomain)
  
  console.log('🏪 Store found:', store ? store.storeName : 'No store found')
  
  if (!store) {
    console.log('❌ Store not found, calling notFound()')
    notFound()
  }

  // 2. Buscar el producto por slug
  const allProducts = await getStoreProducts(store.id)
  const product = allProducts.find(p => p.slug === params.productSlug)

  if (!product) {
    notFound()
  }

  // 3. Determinar el tema y validar el idioma
  const themeId = store.theme || 'base-default'
  const storeLanguage = store.advanced?.language
  const locale = ['es', 'en'].includes(storeLanguage as 'es' | 'en') ? storeLanguage as 'es' | 'en' : 'es'

  // Convertir StoreDataServer a Tienda
  const tienda: Tienda = {
    ...store,
    theme: themeId,
    socialMedia: store.socialMedia || {}, // Inicializar campo requerido
    createdAt: store.createdAt ? new Date(store.createdAt as string).toISOString() : undefined,
    updatedAt: store.updatedAt ? new Date(store.updatedAt as string).toISOString() : undefined
  }

  // 4. Renderizar el componente del cliente
  return <ProductClientPage tienda={tienda} product={product} locale={locale} />
} 