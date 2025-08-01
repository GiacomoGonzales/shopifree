import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import FavoritesClientPage from './FavoritesClientPage'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { generateStoreMetadata } from '../../../lib/seo-utils'
import { Tienda } from '../../../lib/types'

interface FavoritesPageProps {
  params: {
    storeSubdomain: string
  }
}

export async function generateMetadata({ params }: FavoritesPageProps): Promise<Metadata> {
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!serverStore) {
    return {
      title: 'Favoritos no encontrados',
      description: 'La página de favoritos no fue encontrada',
    }
  }

  const storeMetadata = generateStoreMetadata(serverStore)
  return {
    ...storeMetadata,
    title: `Favoritos - ${serverStore.storeName}`,
    description: `Tus productos favoritos en ${serverStore.storeName}`,
  }
}

export default async function FavoritesPage({ params }: FavoritesPageProps) {
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
  return <FavoritesClientPage tienda={tienda} locale={locale} />
} 