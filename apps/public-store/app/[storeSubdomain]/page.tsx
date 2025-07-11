import { notFound } from 'next/navigation'
import { getStoreBySubdomain } from '../../lib/store'
import { Tienda } from '../../lib/types'
import ClientPage from './ClientPage'

interface PageProps {
  params: {
    storeSubdomain: string
  }
}

export default async function StorePage({ params }: PageProps) {
  // 1. Obtener datos de la tienda
  const store = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!store) {
    notFound()
  }

  // 2. Determinar el tema y validar el idioma
  const themeId = store.theme || 'base-default'
  const storeLanguage = store.advanced?.language
  const locale = ['es', 'en'].includes(storeLanguage as 'es' | 'en') ? storeLanguage as 'es' | 'en' : 'es'

  // Convertir StoreDataServer a Tienda
  const tienda: Tienda = {
    ...store,
    theme: themeId,
    socialMedia: store.socialMedia || {} // Inicializar campo requerido
  }

  // 3. Renderizar el componente del cliente con preload hint
  return (
    <>
      {/* Preload del tema para mejorar la carga inicial */}
      <link rel="modulepreload" href={`/themes/${themeId}/Layout.js`} />
      <link rel="modulepreload" href={`/themes/${themeId}/Home.js`} />
      <ClientPage tienda={tienda} locale={locale} />
    </>
  )
} 