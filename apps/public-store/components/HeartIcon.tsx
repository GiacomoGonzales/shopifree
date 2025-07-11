'use client'

import { useState } from 'react'
import { useFavorites } from '../lib/favorites-context'
import { PublicProduct } from '../lib/products'

interface HeartIconProps {
  product: PublicProduct
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export const HeartIcon = ({ product, size = 'md', className = '' }: HeartIconProps) => {
  const { isFavorite, addToFavorites, removeFromFavorites } = useFavorites()
  const [isAnimating, setIsAnimating] = useState(false)
  
  const isProductFavorite = isFavorite(product.id)
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6'
  }

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setIsAnimating(true)
    
    try {
      if (isProductFavorite) {
        await removeFromFavorites(product.id)
      } else {
        await addToFavorites(product)
      }
    } catch (error) {
      console.error('Error toggling favorite:', error)
    }
    
    // Animación de "latido" del corazón
    setTimeout(() => setIsAnimating(false), 300)
  }

  return (
    <button
      onClick={handleToggleFavorite}
      className={`
        relative p-2 rounded-full transition-all duration-200 group
        ${isProductFavorite 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-neutral-400 hover:text-red-500'
        }
        ${isAnimating ? 'animate-pulse scale-110' : 'hover:scale-105'}
        ${className}
      `}
      title={isProductFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
    >
      {/* Fondo del botón con hover effect */}
      <div className="absolute inset-0 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
      
      {/* Icono de corazón */}
      <svg 
        className={`
          ${sizeClasses[size]} 
          relative z-10 transition-all duration-200
          ${isAnimating ? 'animate-bounce' : ''}
        `}
        fill={isProductFavorite ? 'currentColor' : 'none'}
        stroke="currentColor" 
        viewBox="0 0 24 24"
        strokeWidth={isProductFavorite ? 0 : 1.5}
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
        />
      </svg>
      
      {/* Efecto de "like" animado */}
      {isAnimating && !isProductFavorite && (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-3 h-3 bg-red-500 rounded-full animate-ping opacity-75" />
        </div>
      )}
    </button>
  )
}

export default HeartIcon 