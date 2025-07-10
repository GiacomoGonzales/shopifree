'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeProductProps } from '../theme-component'

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

export default function Product({ tienda, product }: ThemeProductProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null)

  useEffect(() => {
    // Asegurar que la página se muestre desde arriba cuando se carga
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }, [product.id])

  // Usar todas las imágenes del producto o solo la principal
  const productImages = product.mediaFiles.length > 0 
    ? product.mediaFiles.map(file => file.url)
    : [product.image]

  const currentPrice = selectedVariant?.price || product.price
  const hasDiscount = product.comparePrice && product.comparePrice > currentPrice

  const handleQuantityChange = (change: number) => {
    const newQuantity = quantity + change
    if (newQuantity >= 1) {
      setQuantity(newQuantity)
    }
  }

  return (
    <div className="bg-white min-h-screen">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        <nav className="flex text-sm text-neutral-500 font-light">
          <Link href="/" className="hover:text-neutral-900 transition-colors">Inicio</Link>
          <span className="mx-2">/</span>
          <span className="text-neutral-900">{product.name}</span>
        </nav>
      </div>

      {/* Product Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square overflow-hidden rounded-lg bg-neutral-100">
              <img
                src={productImages[selectedImageIndex]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
              />
            </div>
            
            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="grid grid-cols-4 gap-4">
                {productImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`aspect-square overflow-hidden rounded-lg border-2 transition-all duration-200 ${
                      selectedImageIndex === index 
                        ? 'border-neutral-900' 
                        : 'border-neutral-200 hover:border-neutral-400'
                    }`}
                  >
                    <img
                      src={image}
                      alt={`${product.name} ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
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
                  {product.currency}{currentPrice}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-neutral-500 line-through font-light">
                    {product.currency}{product.comparePrice}
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
                      <div className="text-sm text-neutral-600">{product.currency}{variant.price}</div>
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
                <button className="w-full bg-neutral-900 text-white hover:bg-neutral-800 px-6 py-4 rounded-md font-medium transition-all duration-200 ease-in-out border-0 hover-lift inline-flex items-center justify-center space-x-2">
                  <Icons.ShoppingBag />
                  <span>Añadir al carrito</span>
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 px-4 py-3 rounded-md font-medium transition-all duration-200 ease-in-out bg-transparent hover-scale inline-flex items-center justify-center space-x-2">
                    <Icons.Heart />
                    <span>Favoritos</span>
                  </button>
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