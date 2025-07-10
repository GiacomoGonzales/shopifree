'use client'

import { useEffect, useState, Suspense } from 'react'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { Tienda } from '../../lib/types'
import { ThemeLayoutComponent, ThemeLayoutProps, ThemeComponentProps } from '../../themes/theme-component'
import { StoreProvider } from '../../lib/store-context'
import { getStoreCategories, Category } from '../../lib/categories'
import { getFeaturedProducts, PublicProduct } from '../../lib/products'

interface ClientPageProps {
  tienda: Tienda
  locale: 'es' | 'en'
}

// Componente de carga
const LoadingState = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center">
    <div className="text-center">
      <div className="w-16 h-16 mx-auto mb-4">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-gray-900"></div>
      </div>
      <h2 className="text-xl font-semibold text-gray-900">Cargando...</h2>
    </div>
  </div>
)

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

export default function ClientPage({ tienda, locale }: ClientPageProps) {
  console.log('🚀 ClientPage component initialized')
  console.log('🏪 Received tienda:', tienda)
  const [messages, setMessages] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<PublicProduct[]>([])

  useEffect(() => {
    // Cargar las traducciones
    import(`../../messages/common/${locale}.json`)
      .then(mod => setMessages(mod.default))
      .catch(error => {
        console.error('Error loading translations:', error)
        // Fallback a un objeto vacío para evitar errores
        setMessages({})
      })
  }, [locale])

  useEffect(() => {
    // Cargar las categorías de la tienda
    if (tienda.id) {
      getStoreCategories(tienda.id)
        .then(fetchedCategories => {
          setCategories(fetchedCategories)
        })
        .catch(error => {
          console.error('Error loading categories:', error)
          setCategories([])
        })
    }
  }, [tienda.id])

  useEffect(() => {
    // Cargar los productos destacados de la tienda
    if (tienda.id) {
      console.log('🔄 Fetching products for store:', tienda.id)
      console.log('🏪 Store data:', tienda)
      console.log('🗂️ Firebase path will be: stores/' + tienda.id + '/products')
      getFeaturedProducts(tienda.id, 8) // Obtener 8 productos destacados
        .then(fetchedProducts => {
          console.log('✅ Products fetched successfully:', fetchedProducts.length, fetchedProducts)
          setProducts(fetchedProducts)
        })
        .catch(error => {
          console.error('❌ Error loading products:', error)
          setProducts([])
        })
    } else {
      console.error('❌ No store ID available!', tienda)
    }
  }, [tienda.id])

  // Importar dinámicamente los componentes del tema
  const ThemeLayout = dynamic<ThemeLayoutProps>(
    () => import(`../../themes/${tienda.theme}/Layout`).catch(() => {
      console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
      return Promise.resolve(DefaultLayout)
    }),
    {
      loading: () => <LoadingState />,
      ssr: false
    }
  )

  const ThemeHome = dynamic<ThemeComponentProps>(
    () => import(`../../themes/${tienda.theme}/Home`).catch(() => {
      console.error(`Theme Home ${tienda.theme} not found, falling back to base-default`)
      // Fallback a un componente simple si Home no existe
      return Promise.resolve(() => <div>Contenido no encontrado.</div>)
    }),
    {
      loading: () => <LoadingState />,
      ssr: false
    }
  )

  if (!messages) {
    return <LoadingState />
  }

  return (
    <StoreProvider initialStore={tienda}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <Suspense fallback={<LoadingState />}>
          <ThemeLayout tienda={tienda} categorias={categories}>
            <ThemeHome tienda={tienda} categorias={categories} productos={products} />
          </ThemeLayout>
        </Suspense>
      </NextIntlClientProvider>
    </StoreProvider>
  )
} 