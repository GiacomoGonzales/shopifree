import { notFound } from 'next/navigation'
import dynamic from 'next/dynamic'
import { getStoreBySubdomain } from '../../lib/store'
import { Tienda } from '../../lib/types'
import { ThemeComponent, ThemeLayoutComponent, ThemeComponentProps, ThemeLayoutProps } from '../../themes/theme-component'

interface PageProps {
  params: {
    storeSubdomain: string
  }
}

// Componente de carga
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Cargando tienda...</h2>
    </div>
  </div>
)

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children, tienda }) => (
  <>
    <main className="min-h-screen bg-gray-50">{children}</main>
  </>
)

export default async function StorePage({ params }: PageProps) {
  // 1. Obtener datos de la tienda
  const store = await getStoreBySubdomain(params.storeSubdomain)
  
  if (!store) {
    notFound()
  }

  // 2. Determinar el tema a usar
  const themeId = store.theme || 'base-default'

  // 3. Importar dinámicamente los componentes del tema
  const ThemeLayout = dynamic<ThemeLayoutProps>(
    () => import(`../../themes/${themeId}/Layout`).catch(() => {
      console.error(`Theme Layout ${themeId} not found, using default layout`)
      return Promise.resolve(DefaultLayout)
    }),
    {
      loading: LoadingState,
      ssr: true
    }
  )

  const ThemeHome = dynamic<ThemeComponentProps>(
    () => import(`../../themes/${themeId}/Home`).catch(() => {
      console.error(`Theme Home ${themeId} not found, falling back to base-default`)
      return import('../../themes/base-default/Home')
    }),
    {
      loading: LoadingState,
      ssr: true
    }
  )

  // Convertir StoreDataServer a Tienda
  const tienda: Tienda = {
    ...store,
    theme: themeId,
    socialMedia: {} // Inicializar campo requerido
  }

  // 4. Renderizar el layout y el contenido
  return (
    <ThemeLayout tienda={tienda}>
      <ThemeHome tienda={tienda} />
    </ThemeLayout>
  )
} 