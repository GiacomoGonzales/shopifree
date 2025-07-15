'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ThemeProductProps } from "../theme-component"
import { useCart } from '../../lib/cart-context'
import { getCurrencySymbol } from '../../lib/store'
import VideoPlayer from '../../components/VideoPlayer'
import HeartIcon from '../../components/HeartIcon'
import './styles.css'

const Icons = {
  Star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12h-15" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m15.75 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125A1.125 1.125 0 0021 18.75v-3.375m0 0V14.25m0 0H9.75M21 14.25v2.25" />
    </svg>
  ),
}

export default function ElegantBoutiqueProduct({ tienda, product, categorias = [] }: ThemeProductProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [addingToCart, setAddingToCart] = useState(false)
  const { addItem, openCart } = useCart()

  const images = product.mediaFiles || [{ id: '1', url: product.image, type: 'image' as const }]

  const handleAddToCart = async () => {
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

      addItem(cartItem, quantity)
      
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
    <div style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 elegant-boutique-product-container">
        {/* Breadcrumb */}
        <nav className="mb-8">
          <div className="flex items-center space-x-3 text-sm text-sans">
            <Link 
              href="/" 
              className="hover-elegant transition-colors"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              Inicio
            </Link>
            <span style={{ color: 'rgb(var(--theme-accent))' }}>›</span>
            <Link 
              href="/" 
              className="hover-elegant transition-colors"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              Productos
            </Link>
            <span style={{ color: 'rgb(var(--theme-accent))' }}>›</span>
            <span style={{ color: 'rgb(var(--theme-neutral-dark))' }} className="font-medium">
              {product.name}
            </span>
          </div>
        </nav>

        {/* Botón de regreso */}
        <div className="mb-8">
          <Link 
            href="/"
            className="inline-flex items-center space-x-2 btn-boutique-secondary"
          >
            <Icons.ArrowLeft />
            <span>Volver a la colección</span>
          </Link>
        </div>

        {/* Contenido principal del producto */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Galería de imágenes */}
          <div className="space-y-6">
            {/* Imagen principal */}
            <div className="relative aspect-square overflow-hidden rounded-sm" style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
              {images[selectedImageIndex]?.type === 'video' ? (
                <VideoPlayer
                  src={images[selectedImageIndex].url}
                  alt={product.name}
                  className="w-full h-full object-cover"
                  showControls={true}
                  autoPlay={false}
                  loop={true}
                  muted={true}
                  playsInline={true}
                  preload="metadata"
                  poster={images[selectedImageIndex].url.replace(/\.(mp4|webm|mov)$/, '.jpg')}
                />
              ) : (
                <div className="product-image-boutique w-full h-full">
                  <Image
                    src={images[selectedImageIndex]?.url || product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              {/* Botón de favorito */}
              <div className="absolute top-4 right-4 z-10">
                <HeartIcon product={product} size="lg" />
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-3">
                {images.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-square overflow-hidden rounded-sm transition-all duration-300 ${
                      selectedImageIndex === index 
                        ? 'ring-2 ring-offset-2' 
                        : 'hover-elegant'
                    }`}
                    style={{ 
                      backgroundColor: 'rgb(var(--theme-secondary))',
                      '--tw-ring-color': selectedImageIndex === index ? 'rgb(var(--theme-accent))' : 'transparent'
                    } as React.CSSProperties}
                  >
                    {image.type === 'video' ? (
                      <VideoPlayer
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        className="w-full h-full object-cover"
                        showControls={false}
                        autoPlay={false}
                        loop={false}
                        muted={true}
                        playsInline={true}
                        preload="metadata"
                        poster={image.url.replace(/\.(mp4|webm|mov)$/, '.jpg')}
                      />
                    ) : (
                      <Image
                        src={image.url}
                        alt={`${product.name} ${index + 1}`}
                        fill
                        className="object-cover"
                      />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="space-y-8">
            {/* Título y precio */}
            <div className="space-y-4">
              <h1 
                className="text-3xl md:text-4xl font-light text-serif leading-tight"
                style={{ color: 'rgb(var(--theme-neutral-dark))' }}
              >
                {product.name}
              </h1>
              
              {/* Rating */}
              <div className="flex items-center space-x-3">
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <div 
                      key={i} 
                      className="w-4 h-4"
                      style={{ 
                        color: i < Math.floor(product.rating || 0) 
                          ? 'rgb(var(--theme-accent))' 
                          : 'rgb(var(--theme-neutral-medium) / 0.3)' 
                      }}
                    >
                      <Icons.Star />
                    </div>
                  ))}
                </div>
                <span className="text-sm font-light text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  ({product.reviews || 0} reseñas)
                </span>
              </div>

              {/* Precio */}
              <div className="flex items-center space-x-4">
                <span 
                  className="text-3xl font-medium text-serif"
                  style={{ color: 'rgb(var(--theme-accent))' }}
                >
                  {getCurrencySymbol(tienda.currency)} {product.price}
                </span>
                {product.comparePrice && product.comparePrice > product.price && (
                  <span 
                    className="text-xl line-through font-light text-sans"
                    style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                  >
                    {getCurrencySymbol(tienda.currency)} {product.comparePrice}
                  </span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-4">
              <h3 
                className="text-xl font-medium text-serif"
                style={{ color: 'rgb(var(--theme-neutral-dark))' }}
              >
                Descripción
              </h3>
              <div 
                className="leading-relaxed text-sans product-description-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                dangerouslySetInnerHTML={{
                  __html: product.description || 'Pieza elegante cuidadosamente seleccionada para nuestra colección premium. Diseñada con los más altos estándares de calidad y sofisticación.'
                }}
              />
            </div>

            {/* Cantidad y agregar al carrito */}
            <div className="space-y-6">
              {/* Selector de cantidad */}
              <div className="space-y-3">
                <label 
                  className="block text-sm font-medium text-serif"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  Cantidad
                </label>
                <div className="flex items-center space-x-4">
                  <div className="flex items-center border rounded-sm" style={{ borderColor: 'rgb(var(--theme-primary) / 0.2)' }}>
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="p-3 hover-elegant transition-colors"
                      style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                    >
                      <Icons.Minus />
                    </button>
                    <span 
                      className="px-4 py-3 text-lg font-medium text-sans"
                      style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                    >
                      {quantity}
                    </span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="p-3 hover-elegant transition-colors"
                      style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                    >
                      <Icons.Plus />
                    </button>
                  </div>
                </div>
              </div>

              {/* Botón agregar al carrito */}
              <button
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`w-full py-4 px-6 rounded-sm font-medium transition-all duration-300 text-lg text-sans ${
                  addingToCart ? 'cursor-not-allowed' : ''
                }`}
                style={{
                  backgroundColor: addingToCart 
                    ? 'rgb(var(--theme-success))' 
                    : 'rgb(var(--theme-primary))',
                  color: 'rgb(var(--theme-neutral-light))',
                  boxShadow: 'var(--theme-shadow-sm)'
                }}
              >
                {addingToCart ? '✓ Agregado al carrito' : 'Agregar al carrito'}
              </button>
            </div>

            {/* Garantías */}
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                {[
                  { icon: Icons.Shield, text: 'Autenticidad garantizada' },
                  { icon: Icons.Truck, text: 'Envío premium gratuito' },
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div style={{ color: 'rgb(var(--theme-accent))' }}>
                      <item.icon />
                    </div>
                    <span 
                      className="text-sm font-light text-sans"
                      style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                    >
                      {item.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Separador elegante */}
        <div className="separator-elegant my-16"></div>

        {/* Información adicional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Cuidados */}
          <div className="space-y-4">
            <h3 
              className="text-xl font-medium text-serif"
              style={{ color: 'rgb(var(--theme-neutral-dark))' }}
            >
              Cuidados y Mantenimiento
            </h3>
            <div 
              className="space-y-2 text-sm font-light text-sans"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              <p>• Seguir las instrucciones de cuidado específicas</p>
              <p>• Almacenar en lugar seco y protegido</p>
              <p>• Evitar exposición directa al sol prolongada</p>
              <p>• Consultar con especialistas para mantenimiento</p>
            </div>
          </div>

          {/* Política de devoluciones */}
          <div className="space-y-4">
            <h3 
              className="text-xl font-medium text-serif"
              style={{ color: 'rgb(var(--theme-neutral-dark))' }}
            >
              Política de Devoluciones
            </h3>
            <div 
              className="space-y-2 text-sm font-light text-sans"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              <p>• 30 días para devoluciones sin preguntas</p>
              <p>• Producto en condiciones originales</p>
              <p>• Empaque y etiquetas incluidas</p>
              <p>• Envío de devolución gratuito</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 