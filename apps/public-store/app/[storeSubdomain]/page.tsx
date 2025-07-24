import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { getStoreBySubdomain, transformStoreForClient } from '../../lib/store'
import { generateStoreMetadata } from '../../lib/seo-utils'
import { Tienda } from '../../lib/types'
import ClientPage from './ClientPage'

interface PageProps {
  params: {
    storeSubdomain: string
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!serverStore) {
    return {
      title: 'Tienda no encontrada',
      description: 'La tienda que buscas no existe o no está disponible'
    }
  }

  return generateStoreMetadata(serverStore)
}

export default async function StorePage({ params }: PageProps) {
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

  // 4. Renderizar el componente del cliente con preload hint
  return (
    <>
      {/* Preload del tema para mejorar la carga inicial */}
      <link rel="modulepreload" href={`/themes/${themeId}/Layout.js`} />
      <link rel="modulepreload" href={`/themes/${themeId}/Home.js`} />
      <ClientPage tienda={tienda} locale={locale} />
    </>
  )
} 