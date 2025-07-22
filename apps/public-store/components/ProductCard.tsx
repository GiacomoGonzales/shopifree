'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { PublicProduct } from '../lib/products'
import { Tienda } from '../lib/types'
import { useCart } from '../lib/cart-context'
import { getCurrencySymbol } from '../lib/store'
import VideoPlayer from './VideoPlayer'
import HeartIcon from './HeartIcon'

// Icons from base-default theme
const Icons = {
  Star: () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 20 20">
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

export type ProductViewMode = 'expanded' | 'compact' | 'list'

interface ProductCardProps {
  product: PublicProduct
  tienda: Tienda
  viewMode?: ProductViewMode
  index?: number
}

export default function ProductCard({ 
  product, 
  tienda, 
  viewMode = 'expanded', 
  index = 0 
}: ProductCardProps) {
  const [addingToCart, setAddingToCart] = useState(false)
  const { addItem, openCart } = useCart()

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault() // Prevenir navegación del Link
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
      
      // Pequeña pausa para mostrar el feedback visual
      setTimeout(() => {
        setAddingToCart(false)
        openCart() // Abrir el carrito después de agregar
      }, 800)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setAddingToCart(false)
    }
  }

  return (
    <Link 
      href={`/${product.slug}`}
      className={`bg-white text-neutral-900 rounded-lg border border-neutral-200 shadow-sm md:hover:shadow-md transition-shadow duration-200 md:hover-lift animate-fade-in group cursor-pointer block ${
        viewMode === 'list' ? 'flex flex-row items-center gap-4 p-4' : 'flex flex-col'
      }`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Product Image */}
      <div className={`relative overflow-hidden bg-neutral-100 ${
        viewMode === 'list' 
          ? 'w-20 h-20 rounded-lg flex-shrink-0' 
          : 'aspect-square rounded-t-lg'
      }`}>
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
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover transition-transform duration-300 md:group-hover:scale-105"
          />
        )}
        
        {/* Mostrar "Nuevo" para productos recientes - Oculto en vista lista */}
        {viewMode !== 'list' && (
          <span className={`absolute bg-neutral-900 text-white font-medium rounded-full ${
            viewMode === 'compact' 
              ? 'top-2 left-2 px-1.5 py-0.5 text-xs' 
              : 'top-3 left-3 px-2 py-1 text-xs'
          }`} style={{ fontSize: viewMode === 'compact' ? '0.625rem' : '0.75rem' }}>
            Nuevo
          </span>
        )}
        
        {/* Botón de favorito - Oculto en vista lista */}
        {viewMode !== 'list' && (
          <div className="absolute top-3 right-3 z-10">
            <HeartIcon product={product} size="md" />
          </div>
        )}
        
        <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/5 transition-colors duration-300"></div>
      </div>

      {/* Product Info */}
      <div className={`bg-white ${
        viewMode === 'list' 
          ? 'flex-1 space-y-2' 
          : 'p-6 pt-0 space-y-3'
      }`}>
        <h3 className={`font-light text-neutral-900 md:group-hover:text-neutral-600 transition-colors duration-200 ${
          viewMode === 'list' ? 'text-base' : 'text-lg pt-6'
        } ${
          viewMode === 'compact' ? 'text-sm' : ''
        }`}>
          {product.name}
        </h3>
        
        {/* Rating - Oculto en vista compacta */}
        {viewMode !== 'compact' && (
          <div className="flex items-center space-x-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`w-3 h-3 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-neutral-300'}`}>
                  <Icons.Star />
                </div>
              ))}
            </div>
            <span className="text-sm text-neutral-500 font-light">
              {product.rating || 0} ({product.reviews || 0})
            </span>
          </div>
        )}

        {/* Price */}
        <div className={`${viewMode === 'compact' ? 'space-y-2' : 'flex items-center justify-between'}`}>
          <div className={`${viewMode === 'compact' ? 'flex items-center justify-between' : 'flex items-center space-x-2'}`}>
            <span className={`font-medium text-neutral-900 ${
              viewMode === 'compact' ? 'text-sm' : 'text-xl'
            }`}>
              {getCurrencySymbol(tienda.currency)} {product.price}
            </span>
            {viewMode === 'compact' && (
              <button 
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`w-6 h-6 rounded-full transition-all duration-200 text-xs flex items-center justify-center ${
                  addingToCart
                    ? 'bg-green-600 text-white opacity-100'
                    : 'bg-neutral-900 text-white opacity-100 hover:bg-neutral-800'
                }`}
              >
                {addingToCart ? '✓' : '+'}
              </button>
            )}
          </div>
          {product.comparePrice && product.comparePrice > product.price && viewMode === 'compact' && (
            <span className="text-xs text-neutral-500 line-through font-light">
              {getCurrencySymbol(tienda.currency)} {product.comparePrice}
            </span>
          )}
          {product.comparePrice && product.comparePrice > product.price && viewMode !== 'compact' && (
            <span className="text-sm text-neutral-500 line-through font-light">
              {getCurrencySymbol(tienda.currency)} {product.comparePrice}
            </span>
          )}
          {viewMode !== 'compact' && (
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
          )}
        </div>
      </div>
    </Link>
  )
} 