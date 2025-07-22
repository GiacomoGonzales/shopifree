'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { NextIntlClientProvider } from 'next-intl'
import { Tienda } from '../../../lib/types'
import { PublicCollection, getStoreCollections } from '../../../lib/collections'
import { PublicProduct, getStoreProducts } from '../../../lib/products'
import { getStoreCategories, Category } from '../../../lib/categories'
import { ThemeLayoutComponent } from '../../../themes/theme-component'
import { StoreProvider } from '../../../lib/store-context'
import { CartProvider } from '../../../lib/cart-context'

interface CollectionsClientPageProps {
  tienda: Tienda
  locale: 'es' | 'en'
}

// Componente de loading
const CollectionsLoading = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-3"></div>
      <p className="text-neutral-600 font-light">Cargando colecciones...</p>
    </div>
  </div>
)

// Componente de layout por defecto
const DefaultLayout = ({ children }: { children: React.ReactNode }) => (
  <div className="min-h-screen bg-white">
    <div className="pt-20">
      {children}
    </div>
  </div>
)

export default function CollectionsClientPage({ tienda, locale }: CollectionsClientPageProps) {
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [collections, setCollections] = useState<PublicCollection[]>([])
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hacer scroll al top cuando se carga la página
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Cargar las traducciones y datos
    const loadData = async () => {
      try {
        console.log('🔍 CollectionsClientPage: Loading data for tienda.id:', tienda.id)
        
        const [messagesModule, categoriesData, collectionsData, productsData] = await Promise.all([
          import(`../../../messages/common/${locale}.json`).catch(() => ({ default: {} })),
          getStoreCategories(tienda.id).catch(() => []),
          getStoreCollections(tienda.id).catch(() => []),
          getStoreProducts(tienda.id).catch(() => [])
        ])
        
        console.log('📊 CollectionsClientPage: Data loaded:', {
          collections: collectionsData.length,
          products: productsData.length,
          categories: categoriesData.length
        })
        
        setMessages(messagesModule.default)
        setCategories(categoriesData)
        setCollections(collectionsData)
        setProducts(productsData)
      } catch (error) {
        console.error('❌ CollectionsClientPage: Error loading data:', error)
        setMessages({})
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [locale, tienda.id])

  // Importar dinámicamente los componentes del tema
  const ThemeLayout = dynamic(
    () => import(`../../../themes/${tienda.theme}/Layout`).then(mod => mod.default).catch(() => {
      console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
      return DefaultLayout
    }),
    { 
      ssr: true,
      loading: () => <CollectionsLoading />
    }
  )

  // Si no hay mensajes aún, mostrar un loading consistente
  if (!messages || loading) {
    return <CollectionsLoading />
  }

  // Componente principal de colecciones
  const CollectionsGrid = () => {
    if (collections.length === 0) {
      return (
        <div className="min-h-[400px] flex flex-col items-center justify-center text-center">
          <div className="mb-4">
            <svg className="w-16 h-16 text-neutral-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-xl font-medium text-neutral-900 mb-2">No hay colecciones disponibles</h3>
          <p className="text-neutral-600 max-w-md">
            Por el momento no tenemos colecciones publicadas. Vuelve pronto para descubrir nuestras nuevas colecciones.
          </p>
        </div>
      )
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {collections.map((collection, index) => {
          // Obtener productos de la colección
          const collectionProducts = products.filter(product => 
            collection.productIds.includes(product.id)
          )

          return (
            <Link 
              key={collection.id} 
              href={`/colecciones/${collection.slug}`} 
              className="group cursor-pointer block animate-fade-in"
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="relative bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
                <div className="aspect-square bg-neutral-100 overflow-hidden relative">
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200">
                      <svg className="w-16 h-16 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                  
                  {/* Overlay con información */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-sm font-medium mb-1">
                            {collectionProducts.length} {collectionProducts.length === 1 ? 'producto' : 'productos'}
                          </div>
                          <div className="text-xs opacity-90">
                            Explorar colección
                          </div>
                        </div>
                        <div className="bg-white/20 backdrop-blur-sm rounded-full p-2 translate-x-2 group-hover:translate-x-0 transition-transform duration-300">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Badge de productos */}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm text-neutral-800 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
                    {collectionProducts.length} productos
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-light text-neutral-900 mb-3 group-hover:text-neutral-700 transition-colors">
                    {collection.title}
                  </h3>
                  {collection.description && (
                    <p className="text-neutral-600 text-sm font-light leading-relaxed line-clamp-3">
                      {collection.description}
                    </p>
                  )}
                  
                  {/* Call to action */}
                  <div className="mt-4 flex items-center text-sm font-medium text-neutral-900 group-hover:text-neutral-600 transition-colors">
                    <span>Ver colección</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    )
  }

  return (
    <StoreProvider initialStore={tienda}>
      <NextIntlClientProvider locale={locale} messages={messages as Record<string, string>}>
        <CartProvider>
          {/* @ts-expect-error: Dynamic theme component typing issue */}
          <ThemeLayout tienda={tienda} categorias={categories}>
            <div className="min-h-screen bg-white pt-20">
              {/* Header */}
              <div className="bg-white border-b border-neutral-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  <div className="text-center">
                    <h1 className="text-3xl md:text-4xl font-light text-neutral-900 tracking-tight mb-4">
                      Nuestras Colecciones
                    </h1>
                    <p className="text-lg text-neutral-600 font-light max-w-2xl mx-auto">
                      Descubre nuestras colecciones cuidadosamente curadas, cada una con su propia personalidad y estilo único.
                    </p>
                  </div>
                </div>
              </div>

              {/* Collections Grid */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <CollectionsGrid />
              </div>
            </div>
          </ThemeLayout>
        </CartProvider>
      </NextIntlClientProvider>
    </StoreProvider>
  )
} 