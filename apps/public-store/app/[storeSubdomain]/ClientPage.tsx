'use client'

import { useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { Tienda } from '../../lib/types'
import { ThemeLayoutComponent, ThemeLayoutProps, ThemeComponentProps } from '../../themes/theme-component'
import { StoreProvider } from '../../lib/store-context'
import { CartProvider } from '../../lib/cart-context'
import { StoreAuthProvider } from '../../lib/store-auth-context'
import { LOADING_CONFIG } from '../../lib/loading-config'
import { useStoreData } from '../../lib/hooks/useStoreData'
import { Category } from '../../lib/categories'
import { PublicProduct } from '../../lib/products'

interface ClientPageProps {
  tienda: Tienda
  locale: string
}

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

// Componente de fallback para Home
const DefaultHome = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-3"></div>
              <p className="text-neutral-600 font-light">{LOADING_CONFIG.LOADING_MESSAGES.store}</p>
    </div>
  </div>
)

export default function ClientPage({ tienda, locale }: ClientPageProps) {
  // Usar el hook personalizado para cargar datos de manera eficiente
  const { categories, products, messages, isLoading, error } = useStoreData({
    tienda,
    locale,
    productsLimit: 8
  })

  // Scroll al top solo una vez cuando se monta el componente
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

    // Importar componentes del tema de forma consolidada
  const ThemeComponents = useMemo(() => {
    const ThemeLayout = dynamic<ThemeLayoutProps>(
      () => import(`../../themes/${tienda.theme}/Layout`).then(mod => mod.default).catch(() => {
        console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
        return DefaultLayout
      }),
      { 
        ssr: false,
        loading: () => null
      }
    )

    const ThemeHome = dynamic<ThemeComponentProps>(
      () => import(`../../themes/${tienda.theme}/Home`).then(mod => mod.default).catch(() => {
        console.error(`Theme Home ${tienda.theme} not found, falling back to base-default`)
        return () => <div className="min-h-screen flex items-center justify-center">
          <p className="text-neutral-600">Contenido no disponible</p>
        </div>
      }),
      { 
        ssr: false,
        loading: () => null
      }
    )

    return { ThemeLayout, ThemeHome }
  }, [tienda.theme])

  // Mostrar loading hasta que todos los datos estén listos
  if (isLoading || !messages) {
    return <DefaultHome />
  }

  // Mostrar error si algo falló
  if (error) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error al cargar la tienda</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <StoreProvider initialStore={tienda}>
      <StoreAuthProvider storeId={tienda.id}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <CartProvider>
            <ThemeComponents.ThemeLayout tienda={tienda} categorias={categories}>
              <ThemeComponents.ThemeHome tienda={tienda} categorias={categories} productos={products} />
            </ThemeComponents.ThemeLayout>
          </CartProvider>
        </NextIntlClientProvider>
      </StoreAuthProvider>
    </StoreProvider>
  )
} 