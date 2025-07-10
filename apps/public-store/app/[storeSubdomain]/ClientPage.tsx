'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { Tienda } from '../../lib/types'
import { ThemeLayoutComponent, ThemeLayoutProps, ThemeComponentProps } from '../../themes/theme-component'
import { StoreProvider } from '../../lib/store-context'
import { CartProvider } from '../../lib/cart-context'
import { getStoreCategories, Category } from '../../lib/categories'
import { getFeaturedProducts, PublicProduct } from '../../lib/products'

interface ClientPageProps {
  tienda: Tienda
  locale: 'es' | 'en'
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
      <p className="text-neutral-600 font-light">Cargando contenido...</p>
    </div>
  </div>
)

export default function ClientPage({ tienda, locale }: ClientPageProps) {
  const [messages, setMessages] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<PublicProduct[]>([])

  useEffect(() => {
    // Hacer scroll al top cuando se carga la página
    window.scrollTo(0, 0)
  }, [])

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
        .then(fetchedCategories => setCategories(fetchedCategories))
        .catch(error => {
          console.error('Error loading categories:', error)
          setCategories([])
        })
    }
  }, [tienda.id])

  useEffect(() => {
    // Cargar los productos destacados de la tienda
    if (tienda.id) {
      getFeaturedProducts(tienda.id, 8) // Obtener 8 productos destacados
        .then(fetchedProducts => setProducts(fetchedProducts))
        .catch(error => {
          console.error('❌ Error loading products:', error)
          setProducts([])
        })
    }
  }, [tienda.id])

  // Importar dinámicamente los componentes del tema con SSR habilitado
  const ThemeLayout = dynamic<ThemeLayoutProps>(
    () => import(`../../themes/${tienda.theme}/Layout`).then(mod => mod.default).catch(() => {
      console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
      return DefaultLayout
    }),
    { 
      ssr: true,
      loading: () => <DefaultHome />
    }
  )

  const ThemeHome = dynamic<ThemeComponentProps>(
    () => import(`../../themes/${tienda.theme}/Home`).then(mod => mod.default).catch(() => {
      console.error(`Theme Home ${tienda.theme} not found, falling back to base-default`)
      return () => <div>Contenido no encontrado.</div>
    }),
    { 
      ssr: true,
      loading: () => <DefaultHome />
    }
  )

  // Si no hay mensajes aún, mostrar un loading consistente
  if (!messages) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-3"></div>
          <p className="text-neutral-600 font-light">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <StoreProvider initialStore={tienda}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        <CartProvider>
          <ThemeLayout tienda={tienda} categorias={categories}>
            <ThemeHome tienda={tienda} categorias={categories} productos={products} />
          </ThemeLayout>
        </CartProvider>
      </NextIntlClientProvider>
    </StoreProvider>
  )
} 