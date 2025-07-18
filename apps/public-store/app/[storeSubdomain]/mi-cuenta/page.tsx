import { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { getStoreBySubdomain, transformStoreForClient } from '../../../lib/store'
import { Tienda } from '../../../lib/types'
import MiCuentaClient from './MiCuentaClient'
import dynamic from 'next/dynamic'

// Importar dinámicamente el componente específico del tema Elegant Boutique
const MiCuentaElegant = dynamic(
  () => import('../../../themes/elegant-boutique/MiCuenta').then(mod => mod.default).catch(() => {
    console.error('Elegant Boutique MiCuenta component not found, using default')
    return MiCuentaClient
  }),
  { 
    ssr: false,
    loading: () => (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    )
  }
)

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

  // Usar el componente específico del tema si es Elegant Boutique
  if (tienda.theme === 'elegant-boutique') {
    return <MiCuentaElegant tienda={tienda} />
  }

  // Para otros temas, usar el componente por defecto
  return <MiCuentaClient tienda={tienda} />
} 