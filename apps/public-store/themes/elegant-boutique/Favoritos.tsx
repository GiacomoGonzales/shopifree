'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useFavorites } from '../../lib/favorites-context'
import { useCart } from '../../lib/cart-context'
import { getCurrencySymbol } from '../../lib/store'
import HeartIcon from '../../components/HeartIcon'
import VideoPlayer from '../../components/VideoPlayer'
import { setNavigationContext } from '../../lib/hooks/useBreadcrumbs'
import { Tienda } from '../../lib/types'
import { PublicProduct } from '../../lib/products'

interface ElegantFavoritosProps {
  tienda: Tienda
}

// Iconos elegantes para la página
const Icons = {
  Heart: () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  HeartOutline: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423L16.5 15.75l.394 1.183a2.25 2.25 0 001.423 1.423L19.5 18.75l-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  )
}

export default function ElegantFavoritos({ tienda }: ElegantFavoritosProps) {
  const { favorites, isLoading } = useFavorites()
  const { addItem, openCart } = useCart()
  const [mounted, setMounted] = useState(false)
  const [addingToCart, setAddingToCart] = useState<string | null>(null)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleAddToCart = async (product: PublicProduct, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setAddingToCart(product.id)
    
    try {
      await addItem({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        slug: product.slug,
        quantity: 1
      })
      
      // Mostrar el carrito automáticamente después de agregar
      setTimeout(() => {
        openCart()
      }, 100)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(null)
    }
  }

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
        <div 
          className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent"
          style={{ borderColor: 'rgb(var(--theme-primary))' }}
        ></div>
      </div>
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-12 pb-12 elegant-favoritos-spacing">
        <div className="animate-pulse">
          <div className="h-8 rounded w-64 mb-8" style={{ backgroundColor: 'rgb(var(--theme-neutral-100))' }}></div>
          <div className="grid grid-boutique-products gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="rounded-sm h-80" style={{ backgroundColor: 'rgb(var(--theme-neutral-100))' }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 md:pt-12 pb-12 elegant-favoritos-spacing">
      {/* Header con estilo elegant boutique */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center mb-6">
          <div 
            className="w-16 h-16 rounded-full flex items-center justify-center mr-4"
            style={{ backgroundColor: 'rgb(var(--theme-primary) / 0.1)' }}
          >
            <Icons.Heart />
          </div>
          <div>
            <h1 
              className="text-4xl font-light mb-2"
              style={{
                color: 'rgb(var(--theme-neutral-dark))',
                fontFamily: 'var(--theme-font-heading)',
                fontWeight: '300'
              }}
            >
              Tus Favoritos
            </h1>
            <p 
              className="font-light"
              style={{
                color: 'rgb(var(--theme-neutral-medium))',
                fontFamily: 'var(--theme-font-body)'
              }}
            >
              {favorites.length > 0 
                ? `${favorites.length} producto${favorites.length !== 1 ? 's' : ''} seleccionado${favorites.length !== 1 ? 's' : ''}`
                : 'Tu colección de deseos está esperando'
              }
            </p>
          </div>
        </div>

        {/* Separador elegante */}
        <div className="separator-elegant mx-auto mb-8 max-w-xs"></div>
      </div>

      {/* Contenido */}
      {favorites.length === 0 ? (
        /* Estado vacío con estilo elegant boutique */
        <div className="text-center py-16">
          <div 
            className="w-32 h-32 mx-auto mb-8 rounded-full flex items-center justify-center"
            style={{ backgroundColor: 'rgb(var(--theme-neutral-50))' }}
          >
            <Icons.HeartOutline />
          </div>
          <h2 
            className="text-3xl font-light mb-4"
            style={{
              color: 'rgb(var(--theme-neutral-dark))',
              fontFamily: 'var(--theme-font-heading)',
              fontWeight: '300'
            }}
          >
            Tu Lista de Deseos Está Vacía
          </h2>
          <p 
            className="font-light mb-8 max-w-md mx-auto leading-relaxed"
            style={{
              color: 'rgb(var(--theme-neutral-medium))',
              fontFamily: 'var(--theme-font-body)'
            }}
          >
            Descubre nuestra exclusiva colección y guarda tus piezas favoritas para crear tu lista de deseos perfecta.
          </p>
          <Link 
            href="/"
            className="btn-boutique-primary inline-flex items-center space-x-2"
          >
            <Icons.Sparkles />
            <span>Explorar Colección</span>
          </Link>
        </div>
      ) : (
        /* Grilla de productos favoritos con estilo elegant boutique */
        <div className="grid grid-boutique-products gap-6">
          {favorites.map((producto, index) => (
            <Link 
              key={producto.id} 
              href={`/${producto.slug}`}
              onClick={() => {
                setNavigationContext({
                  type: 'favorites'
                })
              }}
              className="product-card-boutique animate-fade-in group cursor-pointer block relative"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Botón de favorito */}
              <div className="absolute top-3 right-3 z-10">
                <HeartIcon product={producto} size="md" />
              </div>

              {/* Imagen del producto */}
              <div className="relative aspect-square overflow-hidden rounded-sm bg-neutral-100 product-image-boutique">
                {producto.mediaFiles && producto.mediaFiles.length > 0 && producto.mediaFiles[0].type === 'video' ? (
                  <VideoPlayer
                    src={producto.mediaFiles[0].url}
                    alt={producto.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    showControls={false}
                    autoPlay={true}
                    loop={true}
                    muted={true}
                  />
                ) : (
                  <img
                    src={producto.image}
                    alt={producto.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.src = '/api/placeholder/300/400';
                    }}
                  />
                )}
              </div>

              {/* Información del producto */}
              <div className="p-4">
                <h3 
                  className="text-lg font-light mb-2 line-clamp-2 group-hover:opacity-75 transition-opacity"
                  style={{
                    color: 'rgb(var(--theme-neutral-dark))',
                    fontFamily: 'var(--theme-font-body)'
                  }}
                >
                  {producto.name}
                </h3>
                
                {/* Precio */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span 
                      className="text-xl font-medium"
                      style={{
                        color: 'rgb(var(--theme-primary))',
                        fontFamily: 'var(--theme-font-heading)'
                      }}
                    >
                      {getCurrencySymbol(tienda?.currency || 'USD')}{producto.price}
                    </span>
                    {producto.comparePrice && producto.comparePrice > producto.price && (
                      <span 
                        className="text-sm line-through font-light"
                        style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                      >
                        {getCurrencySymbol(tienda?.currency || 'USD')}{producto.comparePrice}
                      </span>
                    )}
                  </div>
                </div>

                {/* Rating */}
                {(producto.rating || 0) > 0 && (
                  <div className="flex items-center mb-4">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className={`w-4 h-4 ${i < Math.floor(producto.rating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ))}
                    </div>
                    <span 
                      className="text-sm ml-2"
                      style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                    >
                      ({producto.reviews || 0})
                    </span>
                  </div>
                )}

                {/* Botón de agregar al carrito */}
                <button
                  onClick={(e) => handleAddToCart(producto, e)}
                  disabled={addingToCart === producto.id}
                  className="btn-boutique-outline w-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {addingToCart === producto.id ? (
                    <div className="flex items-center justify-center">
                      <div 
                        className="animate-spin rounded-full h-4 w-4 border-2 border-t-transparent mr-2"
                        style={{ borderColor: 'rgb(var(--theme-primary))' }}
                      ></div>
                      Agregando...
                    </div>
                  ) : (
                    'Agregar al Carrito'
                  )}
                </button>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
} 