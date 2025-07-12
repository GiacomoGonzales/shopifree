import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getStoreBySubdomain } from '../../../lib/store'
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
  const store = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!store) {
    redirect('/not-found')
  }

  // Convertir StoreDataServer a Tienda
  const tienda: Tienda = {
    ...store,
    theme: store.theme || 'base-default',
    socialMedia: store.socialMedia || {}, // Inicializar campo requerido
    createdAt: store.createdAt ? new Date(store.createdAt as string).toISOString() : undefined,
    updatedAt: store.updatedAt ? new Date(store.updatedAt as string).toISOString() : undefined
  }

  return <MiCuentaClient tienda={tienda} />
} 