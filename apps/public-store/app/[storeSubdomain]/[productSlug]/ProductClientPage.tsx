'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { Tienda } from '../../../lib/types'
import { PublicProduct } from '../../../lib/products'
import { getStoreCategories, Category } from '../../../lib/categories'
import { ThemeLayoutComponent, ThemeProductProps } from '../../../themes/theme-component'
import { StoreProvider } from '../../../lib/store-context'
import { CartProvider } from '../../../lib/cart-context'

interface ProductClientPageProps {
  tienda: Tienda
  product: PublicProduct
  locale: 'es' | 'en'
}

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

// Componente de producto por defecto
const DefaultProduct = ({ product }: ThemeProductProps) => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <img 
            src={product.image} 
            alt={product.name}
            className="w-full h-96 object-cover rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">{product.name}</h1>
          <p className="text-gray-600 mb-6">{product.description}</p>
          <div className="text-2xl font-bold text-gray-900 mb-6">
            {product.currency}{product.price}
          </div>
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  </div>
)

// Componente de loading para productos
const ProductLoading = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-3"></div>
      <p className="text-neutral-600 font-light">Cargando producto...</p>
    </div>
  </div>
)

export default function ProductClientPage({ tienda, product, locale }: ProductClientPageProps) {
  const [messages, setMessages] = useState<any>(null)
  const [categories, setCategories] = useState<Category[]>([])

  useEffect(() => {
    // Hacer scroll al top cuando se carga la página
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Cargar las traducciones y categorías
    const loadData = async () => {
      try {
        const [messagesModule, categoriesData] = await Promise.all([
          import(`../../../messages/common/${locale}.json`).catch(() => ({ default: {} })),
          getStoreCategories(tienda.id).catch(() => [])
        ])
        
        setMessages(messagesModule.default)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading data:', error)
        setMessages({})
      }
    }
    
    loadData()
  }, [locale, tienda.id])

  // Importar dinámicamente los componentes del tema con SSR habilitado
  const ThemeLayout = dynamic<any>(
    () => import(`../../../themes/${tienda.theme}/Layout`).then(mod => mod.default).catch(() => {
      console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
      return DefaultLayout
    }),
    { 
      ssr: true,
      loading: () => <ProductLoading />
    }
  )

  const ThemeProduct = dynamic<ThemeProductProps>(
    () => import(`../../../themes/${tienda.theme}/Product`).then(mod => mod.default).catch(() => {
      console.error(`Theme Product ${tienda.theme} not found, using default product component`)
      return DefaultProduct
    }),
    { 
      ssr: true,
      loading: () => <ProductLoading />
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
            <ThemeProduct tienda={tienda} product={product} categorias={categories} />
          </ThemeLayout>
        </CartProvider>
      </NextIntlClientProvider>
    </StoreProvider>
  )
} 