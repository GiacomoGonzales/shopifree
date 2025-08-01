'use client'

import { StoreAuthProvider } from '../../../lib/store-auth-context'
import { CartProvider } from '../../../lib/cart-context'
import { Tienda } from '../../../lib/types'
import { Category } from '../../../lib/categories'
import dynamic from 'next/dynamic'

interface MiCuentaClientPageProps {
  tienda: Tienda
  categories: Category[]
}

// Layout por defecto en caso de error
const DefaultLayout = ({ children }: any) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

// Componente de Mi Cuenta por defecto  
const DefaultMiCuenta = () => (
  <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
    <div className="text-center">
      <h1 className="text-2xl font-light text-neutral-900 mb-4">Mi Cuenta</h1>
      <p className="text-neutral-600">Funcionalidad de cuenta no disponible para este tema</p>
    </div>
  </div>
)

export default function MiCuentaClientPage({ tienda, categories }: MiCuentaClientPageProps) {
  // Importar dinámicamente el Layout del tema
  const ThemeLayout = dynamic(
    () => import(`../../../themes/${tienda.theme}/Layout`).then(mod => mod.default).catch(() => {
      console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
      return DefaultLayout
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

  // Importar dinámicamente el componente de Mi Cuenta del tema
  const ThemeMiCuenta = dynamic(
    () => import(`../../../themes/${tienda.theme}/MiCuenta`).then(mod => mod.default).catch(() => {
      console.log(`Theme MiCuenta ${tienda.theme} not found, using default`)
      return DefaultMiCuenta
    }),
    { 
      ssr: false,
      loading: () => (
        <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
        </div>
      )
    }
  )

  return (
    <StoreAuthProvider storeId={tienda.id}>
      <CartProvider>
        {/* @ts-expect-error: Dynamic theme component typing issue */}
        <ThemeLayout tienda={tienda} categorias={categories}>
          {/* @ts-expect-error: Dynamic theme component typing issue */}
          <ThemeMiCuenta tienda={tienda} />
        </ThemeLayout>
      </CartProvider>
    </StoreAuthProvider>
  )
}