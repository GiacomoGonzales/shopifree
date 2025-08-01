import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { Tienda } from '../../../lib/types'
import { getStoreCategories } from '../../../lib/categories'
import MiCuentaClientPage from './MiCuentaClientPage'



interface MiCuentaPageProps {
  params: { storeSubdomain: string }
}

export async function generateMetadata({ params }: MiCuentaPageProps): Promise<Metadata> {
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  return {
    title: `Mi Cuenta - ${serverStore?.storeName || 'Tienda'}`,
    description: `Gestiona tu cuenta en ${serverStore?.storeName || 'nuestra tienda'}`,
  }
}

export default async function MiCuentaPage({ params }: MiCuentaPageProps) {
  // Obtener datos de la tienda
  const serverStore = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!serverStore) {
    redirect('/not-found')
  }

  // Transformar datos del servidor a formato cliente
  const clientStore = transformStoreForClient(serverStore)
  
  if (!clientStore) {
    redirect('/not-found')
  }

  // Convertir StoreDataClient a Tienda
  const tienda: Tienda = {
    ...clientStore,
    theme: clientStore.theme || 'base-default',
    socialMedia: clientStore.socialMedia || {}, // Inicializar campo requerido
  }

  // Obtener categorías para el Layout
  const categories = await getStoreCategories(tienda.id)

  return <MiCuentaClientPage tienda={tienda} categories={categories} />
} 