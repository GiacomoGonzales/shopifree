'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { useFavorites } from '../../../lib/favorites-context'
import { getCurrencySymbol } from '../../../lib/store'
import HeartIcon from '../../../components/HeartIcon'
import VideoPlayer from '../../../components/VideoPlayer'
import { CartProvider, useCart } from '../../../lib/cart-context'
import { ThemeLayoutComponent, ThemeLayoutProps } from '../../../themes/theme-component'
import { getStoreCategories, Category } from '../../../lib/categories'
import { Tienda } from '../../../lib/types'

interface FavoritesClientPageProps {
  tienda: Tienda
  locale: 'es' | 'en'
}

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

// Componente de favoritos por defecto
const DefaultFavorites = ({ tienda }: { tienda: Tienda }) => {
  const { favorites, isLoading } = useFavorites()

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
          <div className="w-24 h-24 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-12 h-12 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <h3 className="text-xl font-light text-neutral-900 mb-3">
            No tienes productos favoritos aún
          </h3>
          <p className="text-neutral-600 font-light mb-8 max-w-md mx-auto">
            Explora nuestra colección y guarda los productos que más te gusten haciendo clic en el corazón.
          </p>
          <Link 
            href="/"
            className="inline-flex items-center px-6 py-3 bg-neutral-900 text-white rounded-md hover:bg-neutral-800 transition-colors duration-200 font-medium"
          >
            Explorar productos
          </Link>
        </div>
      ) : (
        /* Lista de favoritos */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {favorites.map((product) => (
            <FavoriteProductCard key={product.id} product={product} tienda={tienda} />
          ))}
        </div>
      )}
    </div>
  )
}

// Componente para cada producto favorito
const FavoriteProductCard = ({ product, tienda }: { product: any, tienda: Tienda }) => {
  const { addItem, openCart } = useCart()
  const [addingToCart, setAddingToCart] = useState(false)

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    setAddingToCart(true)
    
    try {
      const cartItem = {
        id: product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        currency: tienda.currency,
        image: product.image,
        slug: product.slug || `producto-${product.id}`
      }

      addItem(cartItem, 1)
      
      setTimeout(() => {
        setAddingToCart(false)
        openCart()
      }, 800)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setAddingToCart(false)
    }
  }

  return (
    <Link 
      href={`/${product.slug}`}
      className="bg-white text-neutral-900 rounded-lg border border-neutral-200 shadow-sm md:hover:shadow-md transition-shadow duration-200 md:hover-lift animate-fade-in group cursor-pointer block flex flex-col"
    >
      {/* Product Image */}
      <div className="relative overflow-hidden bg-neutral-100 aspect-square rounded-t-lg">
        {product.mediaFiles && product.mediaFiles.length > 0 && product.mediaFiles[0].type === 'video' ? (
          <VideoPlayer
            src={product.mediaFiles[0].url}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
            showControls={false}
            autoPlay={true}
            loop={true}
            muted={true}
            playsInline={true}
            preload="metadata"
            poster={product.mediaFiles[0].url.replace(/\.(mp4|webm|mov)$/, '.jpg')}
          />
        ) : (
          <img
            src={product.image}
            alt={product.name}
            className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/300/400';
            }}
          />
        )}
        
        {/* Botón de favorito */}
        <div className="absolute top-3 right-3 z-10">
          <HeartIcon product={product} size="md" />
        </div>
        
        <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/5 transition-colors duration-300"></div>
      </div>

      {/* Product Info */}
      <div className="bg-white p-6 pt-0 space-y-3">
        <h3 className="font-light text-neutral-900 md:group-hover:text-neutral-600 transition-colors duration-200 text-lg pt-6">
          {product.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <div key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-neutral-300'}`}>
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
              </div>
            ))}
          </div>
          <span className="text-sm text-neutral-500 font-light">
            {product.rating || 0} ({product.reviews || 0})
          </span>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="font-medium text-neutral-900 text-xl">
              {getCurrencySymbol(tienda.currency)} {product.price}
            </span>
            {product.comparePrice && product.comparePrice > product.price && (
              <span className="text-sm text-neutral-500 line-through font-light">
                {getCurrencySymbol(tienda.currency)} {product.comparePrice}
              </span>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`text-sm px-4 py-2 rounded-md transition-all duration-200 ${
              addingToCart
                ? 'bg-green-600 text-white opacity-100'
                : 'bg-neutral-900 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-neutral-800'
            }`}
          >
            {addingToCart ? '✓' : 'Añadir'}
          </button>
        </div>
      </div>
    </Link>
  )
}

const FavoritesClientPage = ({ tienda, locale }: FavoritesClientPageProps) => {
  const [mounted, setMounted] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)

  // Cargar datos necesarios para el layout
  useEffect(() => {
    const loadData = async () => {
      if (!tienda?.id) return
      
      try {
        setLoading(true)
        const [messagesModule, categoriesData] = await Promise.all([
          import(`../../../messages/common/${locale}.json`).catch(() => ({ default: {} })),
          getStoreCategories(tienda.id).catch(() => [])
        ])
        
        setMessages(messagesModule.default)
        setCategories(categoriesData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [tienda?.id, locale])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Importar layout del tema
  const ThemeLayout = useMemo(() => {
    if (!tienda?.theme) return DefaultLayout
    
    return dynamic<ThemeLayoutProps>(
      () => import(`../../../themes/${tienda.theme}/Layout`).then(mod => mod.default).catch(() => {
        console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
        return DefaultLayout
      }),
      { 
        ssr: false,
        loading: () => null
      }
    )
  }, [tienda?.theme])

  // Importar componente de favoritos del tema (si existe)
  // Solo intentar cargar para temas que sabemos que tienen componente de favoritos
  const ThemeFavorites = useMemo(() => {
    if (!tienda?.theme) return null
    
    // Lista de temas que tienen componente de favoritos específico
    const themesWithFavorites = ['elegant-boutique', 'pet-friendly', 'mobile-modern']
    
    if (!themesWithFavorites.includes(tienda.theme)) {
      return null // No intentar cargar si no existe
    }
    
    try {
      return dynamic<{ tienda: Tienda }>(
        () => import(`../../../themes/${tienda.theme}/Favoritos`).then(mod => {
          if (!mod.default) {
            throw new Error(`No default export found in ${tienda.theme}/Favoritos`)
          }
          return mod.default
        }),
        { 
          ssr: false,
          loading: () => (
            <div className="min-h-screen flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
            </div>
          )
        }
      )
    } catch (error) {
      console.log(`Error loading theme favorites for ${tienda.theme}:`, error)
      return null
    }
  }, [tienda?.theme])

  if (!mounted || loading || !messages || !tienda) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    )
  }

  const FavoritesContent = () => {
    // Si hay un componente específico del tema disponible, usarlo
    if (ThemeFavorites) {
      return <ThemeFavorites tienda={tienda} />
    }
    
    // Si no, usar el componente por defecto (para base-default y otros)
    return <DefaultFavorites tienda={tienda} />
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages as Record<string, string>}>
      <CartProvider>
        <ThemeLayout tienda={tienda} categorias={categories || []}>
          <FavoritesContent />
        </ThemeLayout>
      </CartProvider>
    </NextIntlClientProvider>
  )
}

export default FavoritesClientPage