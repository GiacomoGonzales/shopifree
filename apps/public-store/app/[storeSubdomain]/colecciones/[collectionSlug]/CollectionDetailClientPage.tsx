'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Tienda } from '../../../../lib/types'
import { PublicCollection, getStoreCollections } from '../../../../lib/collections'
import { PublicProduct, getStoreProducts } from '../../../../lib/products'
import { getStoreCategories, Category } from '../../../../lib/categories'
import { ThemeLayoutComponent } from '../../../../themes/theme-component'
import { StoreProvider } from '../../../../lib/store-context'
import { CartProvider } from '../../../../lib/cart-context'
import ProductCard from '../../../../components/ProductCard'

interface CollectionDetailClientPageProps {
  tienda: Tienda
  collection: PublicCollection
  locale: 'es' | 'en'
}

// Componente de loading
const CollectionLoading = () => (
  <div className="min-h-screen bg-white flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-3"></div>
      <p className="text-neutral-600 font-light">Cargando colección...</p>
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

// Componente de Breadcrumbs mejorado
const CollectionBreadcrumbs = ({ 
  collectionTitle, 
  onBackClick 
}: { 
  collectionTitle: string
  onBackClick: () => void 
}) => (
  <div className="bg-neutral-50 border-b border-neutral-200 py-4">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <nav className="flex items-center space-x-2 text-sm">
        <Link 
          href="/" 
          className="text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Inicio
        </Link>
        <span className="text-neutral-400">/</span>
        <Link 
          href="/colecciones" 
          className="text-neutral-500 hover:text-neutral-700 transition-colors"
        >
          Colecciones
        </Link>
        <span className="text-neutral-400">/</span>
        <span className="text-neutral-900 font-medium">{collectionTitle}</span>
      </nav>
      
      {/* Botón de volver mejorado */}
      <button
        onClick={onBackClick}
        className="mt-3 inline-flex items-center text-sm text-neutral-600 hover:text-neutral-900 transition-colors group"
      >
        <svg 
          className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Volver a todas las colecciones
      </button>
    </div>
  </div>
)

// Componente para navegación entre colecciones
const CollectionNavigation = ({ 
  currentCollection, 
  allCollections, 
  tienda 
}: { 
  currentCollection: PublicCollection
  allCollections: PublicCollection[]
  tienda: Tienda 
}) => {
  const otherCollections = allCollections.filter(c => c.id !== currentCollection.id).slice(0, 3)
  
  if (otherCollections.length === 0) return null

  return (
    <div className="bg-neutral-50 py-12 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h3 className="text-2xl font-light text-neutral-900 mb-2">
            Explora otras colecciones
          </h3>
          <p className="text-neutral-600">
            Descubre más estilos que podrían interesarte
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {otherCollections.map((collection) => (
            <Link 
              key={collection.id} 
              href={`/colecciones/${collection.slug}`}
              className="group block"
            >
              <div className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200">
                <div className="aspect-square bg-neutral-100 relative overflow-hidden">
                  {collection.image ? (
                    <img
                      src={collection.image}
                      alt={collection.title}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-12 h-12 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="font-medium text-neutral-900 group-hover:text-neutral-700 transition-colors">
                    {collection.title}
                  </h4>
                  {collection.description && (
                    <p className="text-sm text-neutral-600 mt-1">
                      {collection.description}
                    </p>
                  )}
                  <span className="text-xs text-neutral-500 mt-2 block">
                    {collection.productIds.length} productos
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        
        <div className="text-center mt-8">
          <Link 
            href="/colecciones"
            className="inline-flex items-center px-6 py-3 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            Ver todas las colecciones
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default function CollectionDetailClientPage({ tienda, collection, locale }: CollectionDetailClientPageProps) {
  const router = useRouter()
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [collectionProducts, setCollectionProducts] = useState<PublicProduct[]>([])
  const [allCollections, setAllCollections] = useState<PublicCollection[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Hacer scroll al top cuando se carga la página
    window.scrollTo(0, 0)
  }, [])

  useEffect(() => {
    // Cargar las traducciones y datos
    const loadData = async () => {
      try {
        const [messagesModule, categoriesData, productsData, collectionsData] = await Promise.all([
          import(`../../../../messages/common/${locale}.json`).catch(() => ({ default: {} })),
          getStoreCategories(tienda.id).catch(() => []),
          getStoreProducts(tienda.id).catch(() => []),
          getStoreCollections(tienda.id).catch(() => [])
        ])
        
        setMessages(messagesModule.default)
        setCategories(categoriesData)
        setProducts(productsData)
        setAllCollections(collectionsData)
        
        // Filtrar productos de la colección
        const filtered = productsData.filter(product => 
          collection.productIds.includes(product.id)
        )
        setCollectionProducts(filtered)
        
      } catch (error) {
        console.error('Error loading data:', error)
        setMessages({})
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [locale, tienda.id, collection.productIds])

  const handleBackToCollections = () => {
    router.push('/colecciones')
  }

  // Importar dinámicamente los componentes del tema
  const ThemeLayout = dynamic(
    () => import(`../../../../themes/${tienda.theme}/Layout`).then(mod => mod.default).catch(() => {
      console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
      return DefaultLayout
    }),
    { 
      ssr: true,
      loading: () => <CollectionLoading />
    }
  )

  // Si no hay mensajes aún, mostrar un loading consistente
  if (!messages || loading) {
    return <CollectionLoading />
  }

  return (
    <StoreProvider initialStore={tienda}>
      <NextIntlClientProvider locale={locale} messages={messages as Record<string, string>}>
        <CartProvider>
          {/* @ts-expect-error: Dynamic theme component typing issue */}
          <ThemeLayout tienda={tienda} categorias={categories}>
            <div className="min-h-screen bg-white pt-20">
              {/* Breadcrumb */}
              <CollectionBreadcrumbs 
                collectionTitle={collection.title} 
                onBackClick={handleBackToCollections} 
              />

              {/* Hero de la colección */}
              <div className="bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                  {collection.image && (
                    <div className="aspect-[16/6] bg-neutral-100 rounded-lg overflow-hidden mb-8">
                      <img
                        src={collection.image}
                        alt={collection.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  
                  <div className="text-center max-w-3xl mx-auto">
                    <h1 className="text-3xl md:text-4xl lg:text-5xl font-light text-neutral-900 tracking-tight mb-4">
                      {collection.title}
                    </h1>
                    {collection.description && (
                      <p className="text-lg md:text-xl text-neutral-600 font-light leading-relaxed">
                        {collection.description}
                      </p>
                    )}
                    <div className="mt-6">
                      <span className="text-sm text-neutral-500">
                        {collectionProducts.length} {collectionProducts.length === 1 ? 'producto' : 'productos'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Productos de la colección */}
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
                {collectionProducts.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {collectionProducts.map((product, index) => (
                      <ProductCard 
                        key={product.id} 
                        product={product} 
                        tienda={tienda} 
                        viewMode="expanded"
                        index={index}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <div className="mb-4">
                      <svg className="w-16 h-16 text-neutral-300 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-neutral-900 mb-2">Esta colección está vacía</h3>
                    <p className="text-neutral-600 mb-6">
                      Los productos de esta colección no están disponibles en este momento.
                    </p>
                    <Link 
                      href="/colecciones"
                      className="inline-flex items-center px-4 py-2 text-sm font-medium text-neutral-900 bg-white border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                    >
                      Ver otras colecciones
                    </Link>
                  </div>
                )}
              </div>

              {/* Navegación entre colecciones */}
              <CollectionNavigation 
                currentCollection={collection} 
                allCollections={allCollections} 
                tienda={tienda} 
              />
            </div>
          </ThemeLayout>
        </CartProvider>
      </NextIntlClientProvider>
    </StoreProvider>
  )
} 