import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import CategoryClientPage from './CategoryClientPage'
import { getStoreBySubdomain, transformStoreForClient } from '../../../../lib/store'
import { generateStoreMetadata } from '../../../../lib/seo-utils'
import { Tienda } from '../../../../lib/types'

interface CategoryPageProps {
  params: {
    storeSubdomain: string
    categorySlug: string
  }
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!serverStore) {
    return {
      title: 'Categoría no encontrada',
      description: 'La categoría solicitada no fue encontrada',
    }
  }

  const storeMetadata = generateStoreMetadata(serverStore)
  return {
    ...storeMetadata,
    title: `${params.categorySlug} - ${serverStore.storeName}`,
    description: `Explora nuestra categoría ${params.categorySlug} en ${serverStore.storeName}`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  // 1. Obtener datos de la tienda
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!serverStore) {
    notFound()
  }

  // 2. Transformar datos del servidor a formato cliente
  const clientStore = transformStoreForClient(serverStore)
  
  if (!clientStore) {
    notFound()
  }

  // 3. Determinar el tema y validar el idioma
  const themeId = clientStore.theme || 'base-default'
  const storeLanguage = clientStore.advanced?.language
  const locale = ['es', 'en'].includes(storeLanguage as 'es' | 'en') ? storeLanguage as 'es' | 'en' : 'es'

  // Convertir StoreDataClient a Tienda
  const tienda: Tienda = {
    ...clientStore,
    theme: themeId,
    socialMedia: clientStore.socialMedia || {}, // Inicializar campo requerido
  }

  // 4. Renderizar el componente del cliente
  return <CategoryClientPage categorySlug={params.categorySlug} tienda={tienda} locale={locale} />
} 