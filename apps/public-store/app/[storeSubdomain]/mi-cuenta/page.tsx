import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getStoreBySubdomain } from '../../../lib/store'
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
  const tienda = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!tienda) {
    redirect('/not-found')
  }

  return <MiCuentaClient tienda={tienda} />
} 