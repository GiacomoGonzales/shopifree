import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { Tienda } from '../../../lib/types'
import MiCuentaClient from './MiCuentaClient'

interface MiCuentaPageProps {
  params: { storeSubdomain: string }
}

export async function generateMetadata({ params }: MiCuentaPageProps): Promise<Metadata> {
  const tienda = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!tienda) {
    return {
      title: 'Mi Cuenta',
      description: 'Accede a tu cuenta'
    }
  }

  return {
    title: `Mi Cuenta - ${tienda.storeName}`,
    description: `Accede a tu cuenta en ${tienda.storeName}. Ve tu historial de pedidos, actualiza tu información personal y gestiona tus preferencias.`,
    robots: 'noindex, nofollow' // Página privada
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

  return <MiCuentaClient tienda={tienda} />
} 