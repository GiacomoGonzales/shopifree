import { notFound } from 'next/navigation'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { Tienda } from '../../../lib/types'
import CollectionsClientPage from './CollectionsClientPage'

interface CollectionsPageProps {
  params: {
    storeSubdomain: string
  }
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