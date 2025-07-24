import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStoreBySubdomain, transformStoreForClient } from '../../../../lib/store'
import { getCollectionBySlug } from '../../../../lib/collections'
import { generateStoreMetadata } from '../../../../lib/seo-utils'
import { Tienda } from '../../../../lib/types'
import CollectionDetailClientPage from './CollectionDetailClientPage'

interface CollectionPageProps {
  params: {
    storeSubdomain: string
    collectionSlug: string
  }
}

export async function generateMetadata({ params }: CollectionPageProps): Promise<Metadata> {
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!serverStore) {
    return {
      title: 'Colección no encontrada',
      description: 'La colección que buscas no existe o no está disponible'
    }
  }

  const clientStore = transformStoreForClient(serverStore)
  if (!clientStore) {
    return {
      title: 'Colección no encontrada',
      description: 'La colección que buscas no existe o no está disponible'
    }
  }

  const collection = await getCollectionBySlug(clientStore.id, params.collectionSlug)
  
  if (!collection) {
    return {
      title: 'Colección no encontrada',
      description: 'La colección que buscas no existe o no está disponible'
    }
  }

  return generateStoreMetadata(serverStore, {
    title: `${collection.title} - ${serverStore.storeName}`,
    metaDescription: collection.description && collection.description.length > 160 
      ? collection.description.substring(0, 157) + '...'
      : collection.description || `Descubre la colección ${collection.title} en ${serverStore.storeName}`
  })
}

export default async function CollectionPage({ params }: CollectionPageProps) {
  console.log('🔍 CollectionPage params:', params)
  
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

  // 3. Obtener la colección por slug
  const collection = await getCollectionBySlug(clientStore.id, params.collectionSlug)
  
  if (!collection) {
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

  // 5. Renderizar el componente del cliente
  return <CollectionDetailClientPage tienda={tienda} collection={collection} locale={locale} />
} 