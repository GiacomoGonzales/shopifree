'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { useStore } from '../../../lib/store-context'
import { useFavorites } from '../../../lib/favorites-context'
import { getCurrencySymbol } from '../../../lib/store'
import HeartIcon from '../../../components/HeartIcon'
import VideoPlayer from '../../../components/VideoPlayer'
import { CartProvider } from '../../../lib/cart-context'
import { ThemeLayoutComponent, ThemeLayoutProps } from '../../../themes/theme-component'
import { getStoreCategories, Category } from '../../../lib/categories'
import { Tienda } from '../../../lib/types'
import { StoreDataClient } from '../../../lib/store'

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

// Helper para convertir StoreDataClient a Tienda
const convertStoreToTienda = (store: StoreDataClient): Tienda => ({
  ...store,
  theme: store.theme || 'base-default'
})

const FavoritesClientPage = () => {
  const { store } = useStore()
  const { favorites, isLoading } = useFavorites()
  const [mounted, setMounted] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [messages, setMessages] = useState<any>(null)
  const [storeLoading, setStoreLoading] = useState(true)

  // Cargar datos necesarios para el layout
  useEffect(() => {
    const loadData = async () => {
      if (!store?.id) return
      
      try {
        setStoreLoading(true)
        const [messagesModule, categoriesData] = await Promise.all([
          import('../../../messages/common/es.json').catch(() => ({ default: {} })),
          getStoreCategories(store.id).catch(() => [])
        ])
        
        setMessages(messagesModule.default)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setStoreLoading(false)
      }
    }
    
    loadData()
  }, [store?.id])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Importar layout del tema
  const ThemeLayout = useMemo(() => {
    if (!store?.theme) return DefaultLayout
    
    return dynamic<ThemeLayoutProps>(
      () => import(`../../../themes/${store.theme}/Layout`).then(mod => mod.default).catch(() => {
        console.error(`Theme Layout ${store.theme} not found, using default layout`)
        return DefaultLayout
      }),
      { 
        ssr: false,
        loading: () => null
      }
    )
  }, [store?.theme])

  if (!mounted || storeLoading || !messages || !store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    )
  }

  const FavoritesContent = () => {
    if (isLoading) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="animate-pulse">
            <div className="h-8 bg-neutral-200 rounded w-64 mb-8"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-neutral-100 rounded-lg h-80"></div>
              ))}
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500 mr-3" fill="currentColor" viewBox="0 0 24 24">
              <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <h1 className="text-3xl font-light text-neutral-900">Tus productos favoritos</h1>
          </div>
          <p className="text-neutral-600 font-light">
            {favorites.length > 0 
              ? `${favorites.length} producto${favorites.length !== 1 ? 's' : ''} guardado${favorites.length !== 1 ? 's' : ''}`
              : 'Aún no tienes productos favoritos'
            }
          </p>
        </div>

        {/* Contenido */}
        {favorites.length === 0 ? (
          /* Estado vacío */
          <div className="text-center py-16">
            <div className="w-24 h-24 mx-auto mb-8 bg-neutral-100 rounded-full flex items-center justify-center">
              <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-light text-neutral-900 mb-4">
              Aún no tienes productos favoritos
            </h2>
            <p className="text-neutral-600 font-light mb-8 max-w-md mx-auto">
              Explora nuestra tienda y marca tus productos favoritos haciendo clic en el corazón ❤️
            </p>
            <Link 
              href="/"
              className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors font-medium"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Explorar tienda
            </Link>
          </div>
        ) : (
          /* Grilla de productos favoritos */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {favorites.map((producto, index) => (
              <Link 
                key={producto.id} 
                href={`/${producto.slug}`}
                className="bg-white text-neutral-900 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 hover-lift animate-fade-in group cursor-pointer block relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Botón de favorito */}
                <div className="absolute top-3 right-3 z-10">
                  <HeartIcon product={producto} size="md" />
                </div>

                {/* Imagen del producto */}
                <div className="relative aspect-square overflow-hidden rounded-t-lg bg-neutral-100">
                  {producto.mediaFiles && producto.mediaFiles.length > 0 && producto.mediaFiles[0].type === 'video' ? (
                    <VideoPlayer
                      src={producto.mediaFiles[0].url}
                      alt={producto.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      showControls={false}
                      autoPlay={true}
                      loop={true}
                      muted={true}
                    />
                  ) : (
                    <img
                      src={producto.image}
                      alt={producto.name}
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = '/api/placeholder/300/400';
                      }}
                    />
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <h3 className="text-sm font-light text-neutral-900 mb-2 line-clamp-2 group-hover:text-neutral-700 transition-colors">
                    {producto.name}
                  </h3>
                  
                  {/* Precio */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-base font-medium text-neutral-900">
                        {getCurrencySymbol(store?.currency || 'USD')}{producto.price}
                      </span>
                      {producto.comparePrice && producto.comparePrice > producto.price && (
                        <span className="text-xs text-neutral-500 line-through font-light">
                          {getCurrencySymbol(store?.currency || 'USD')}{producto.comparePrice}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Rating */}
                  <div className="flex items-center mt-2">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(producto.rating || 0) ? 'text-yellow-400' : 'text-neutral-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span className="text-sm text-neutral-500 ml-2">
                      ({producto.reviews || 0})
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    )
  }

  return (
    <NextIntlClientProvider locale="es" messages={messages}>
      <CartProvider>
        <ThemeLayout tienda={convertStoreToTienda(store)} categorias={categories || []}>
          <FavoritesContent />
        </ThemeLayout>
      </CartProvider>
    </NextIntlClientProvider>
  )
}

export default FavoritesClientPage 