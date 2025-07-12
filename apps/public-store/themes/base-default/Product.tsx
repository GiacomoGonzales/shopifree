'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeProductProps } from '../theme-component'
import { useCart } from '../../lib/cart-context'
import { getCurrencySymbol } from '../../lib/store'
import VideoPlayer from '../../components/VideoPlayer'
import HeartIcon from '../../components/HeartIcon'
import Breadcrumbs from '../../components/Breadcrumbs'
import { useBreadcrumbs } from '../../lib/hooks/useBreadcrumbs'

const Icons = {
  Star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Share: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
}

export default function Product({ tienda, product, categorias = [] }: ThemeProductProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null)
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const { addItem, openCart } = useCart()
  
  // Generar breadcrumbs inteligentes
  const breadcrumbs = useBreadcrumbs({ product, categories: categorias })

  useEffect(() => {
    // Asegurar que la página se muestre desde arriba cuando se carga
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }, [product.id])

  // Usar todos los archivos multimedia del producto o solo la imagen principal
  const productMedia = product.mediaFiles.length > 0 
    ? product.mediaFiles.map(file => ({
        ...file,
        type: file.type || (file.url.includes('.mp4') || file.url.includes('.webm') || file.url.includes('.mov') ? 'video' : 'image')
      }))
    : [{ id: 'main', url: product.image, type: 'image' as const }]

  // Debug log para verificar los tipos de archivos
  useEffect(() => {
    console.log('🎬 Product media files:', productMedia.map(media => ({
      id: media.id,
      type: media.type,
      url: media.url.substring(0, 50) + '...'
    })))
  }, [productMedia])

  const currentPrice = selectedVariant?.price || product.price
  const hasDiscount = product.comparePrice && product.comparePrice > currentPrice

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  const handleAddToCart = async () => {
    setIsAddingToCart(true)
    
    try {
      const cartItem = {
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id,
        productId: product.id,
        name: product.name,
        price: selectedVariant?.price || product.price,
        currency: tienda.currency,
        image: productMedia[0]?.url || product.image,
        slug: product.slug || `producto-${product.id}`,
        variant: selectedVariant ? {
          id: selectedVariant.id,
          name: selectedVariant.name,
          price: selectedVariant.price
        } : undefined
      }

      addItem(cartItem, quantity)
      
      // Pequeña pausa para mostrar el feedback visual
      setTimeout(() => {
        setIsAddingToCart(false)
        openCart() // Abrir el carrito después de agregar
      }, 500)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setIsAddingToCart(false)
    }
  }

  return (
    <div className="bg-white min-h-screen pt-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <Breadcrumbs items={breadcrumbs} />
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Media */}
          <div className="space-y-4">
            {/* Main Media */}
            <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
              {productMedia[selectedImageIndex].type === 'video' ? (
                <VideoPlayer
                  src={productMedia[selectedImageIndex].url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  showControls={true}
                  autoPlay={true}
                  loop={true}
                  muted={true}
                  playsInline={true}
                  preload="metadata"
                />
              ) : (
                <img
                  src={productMedia[selectedImageIndex].url}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                />
              )}
            </div>
            
            {/* Thumbnail Media */}
            {productMedia.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productMedia.map((media, index) => (
                  <button
                    key={media.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 relative ${
                      selectedImageIndex === index 
                        ? 'border-neutral-900' 
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    {media.type === 'video' ? (
                      <>
                        <VideoPlayer
                          src={media.url}
                          alt={`${product.name} ${index + 1}`}
                          className="w-full h-full object-cover"
                          showControls={false}
                          autoPlay={true}
                          loop={true}
                          muted={true}
                          playsInline={true}
                          preload="metadata"
                        />
                        {/* Video play icon overlay */}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z"/>
                          </svg>
                        </div>
                      </>
                    ) : (
                      <img
                        src={media.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-8">
            <div>
              <h1 className="text-3xl md:text-4xl font-light text-neutral-900 tracking-tight leading-tight mb-4">
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-2 mb-6">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className={`w-4 h-4 ${i < Math.floor(product.rating || 0) ? 'text-yellow-400' : 'text-neutral-300'}`}>
                      <Icons.Star />
                    </div>
                  ))}
                </div>
                <span className="text-sm text-neutral-500 font-light">
                  {product.rating || 0} ({product.reviews || 0} reseñas)
                </span>
              </div>

              {/* Price */}
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-3xl font-light text-neutral-900">
                  {getCurrencySymbol(tienda.currency)} {currentPrice}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-neutral-500 line-through font-light">
                    {getCurrencySymbol(tienda.currency)} {product.comparePrice}
                  </span>
                )}
              </div>

              {/* Description */}
              <div className="prose prose-neutral max-w-none">
                <div 
                  className="text-neutral-600 font-light leading-relaxed"
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              </div>
            </div>

            {/* Variants */}
            {product.hasVariants && product.variants.length > 0 && (
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Variantes</h3>
                <div className="grid grid-cols-2 gap-3">
                  {product.variants.map((variant) => (
                    <button
                      key={variant.id}
                      onClick={() => setSelectedVariant(variant)}
                      className={`p-3 border rounded-lg text-left transition-all duration-200 ${
                        selectedVariant?.id === variant.id
                          ? 'border-neutral-900 bg-neutral-50'
                          : 'border-neutral-300 hover:border-neutral-400'
                      }`}
                    >
                      <div className="font-medium text-neutral-900">{variant.name}</div>
                      <div className="text-sm text-neutral-600">{getCurrencySymbol(tienda.currency)} {variant.price}</div>
                      <div className="text-xs text-neutral-500">Stock: {variant.stock}</div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-neutral-900 mb-3">Cantidad</h3>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => handleQuantityChange(-1)}
                    className="p-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                  >
                    <Icons.Minus />
                  </button>
                  <span className="text-lg font-medium text-neutral-900 min-w-[3rem] text-center">
                    {quantity}
                  </span>
                  <button
                    onClick={() => handleQuantityChange(1)}
                    className="p-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
                  >
                    <Icons.Plus />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart}
                  className={`w-full px-6 py-4 rounded-md font-medium transition-all duration-200 ease-in-out border-0 hover-lift inline-flex items-center justify-center space-x-2 ${
                    isAddingToCart 
                      ? 'bg-green-600 text-white cursor-not-allowed' 
                      : 'bg-neutral-900 text-white hover:bg-neutral-800'
                  }`}
                >
                  {isAddingToCart ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                      <span>Agregado!</span>
                    </>
                  ) : (
                    <>
                      <Icons.ShoppingBag />
                      <span>Añadir al carrito</span>
                    </>
                  )}
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <div className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 rounded-md font-medium transition-all duration-200 ease-in-out bg-transparent hover-scale inline-flex items-center justify-center space-x-2">
                    <HeartIcon product={product} size="md" />
                    <span>Favoritos</span>
                  </div>
                  <button className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-4 py-3 rounded-md font-medium transition-all duration-200 ease-in-out bg-transparent hover-scale inline-flex items-center justify-center space-x-2">
                    <Icons.Share />
                    <span>Compartir</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Details */}
            <div className="border-t border-neutral-200 pt-8">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Detalles del producto</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">SKU:</span>
                  <span className="text-neutral-900">{product.id}</span>
                </div>
                {selectedVariant && (
                  <div className="flex justify-between">
                    <span className="text-neutral-600">Stock disponible:</span>
                    <span className="text-neutral-900">{selectedVariant.stock} unidades</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-neutral-600">Estado:</span>
                  <span className="text-green-600 capitalize">{product.status}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <div className="bg-neutral-50 border-t border-neutral-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900 mb-4">
              Productos relacionados
            </h2>
            <p className="text-neutral-600 font-light">
              Descubre más productos que podrían interesarte
            </p>
          </div>
          
          {/* Placeholder for related products */}
          <div className="text-center text-neutral-500">
            <p>Los productos relacionados aparecerán aquí</p>
          </div>
        </div>
      </div>
    </div>
  )
} 