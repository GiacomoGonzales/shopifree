import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { generateStoreMetadata } from '../../../lib/seo-utils'
import { Tienda } from '../../../lib/types'
import CollectionsClientPage from './CollectionsClientPage'

interface CollectionsPageProps {
  params: {
    storeSubdomain: string
  }
}

export async function generateMetadata({ params }: CollectionsPageProps): Promise<Metadata> {
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!serverStore) {
    return {
      title: 'Colecciones no encontradas',
      description: 'Las colecciones que buscas no existen o no están disponibles'
    }
  }

  return generateStoreMetadata(serverStore, {
    title: `Colecciones - ${serverStore.storeName}`,
    metaDescription: `Explora todas las colecciones de ${serverStore.storeName}. ${serverStore.description}`
  })
}

export default async function CollectionsPage({ params }: CollectionsPageProps) {
  console.log('🔍 CollectionsPage params:', params)
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
  return <CollectionsClientPage tienda={tienda} locale={locale} />
} 