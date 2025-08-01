'use client'

import './styles.css'
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
import ProductVariantSelector from '../../components/ProductVariantSelector'

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
  WhatsApp: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
    </svg>
  ),
  Facebook: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  Twitter: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  ),
  Copy: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
    </svg>
  ),
  Check: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
}

export default function Product({ tienda, product, categorias = [] }: ThemeProductProps) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [selectedVariant, setSelectedVariant] = useState(product.variants?.[0] || null)
  const [selectedMetaVariant, setSelectedMetaVariant] = useState<{size?: string, color?: string, [key: string]: string | undefined}>({})
  const [isAddingToCart, setIsAddingToCart] = useState(false)
  const [showShareMenu, setShowShareMenu] = useState(false)
  const [shareSuccess, setShareSuccess] = useState(false)
  const { addItem, openCart } = useCart()
  
  // Generar breadcrumbs inteligentes
  const breadcrumbs = useBreadcrumbs({ product, categories: categorias })

  useEffect(() => {
    // Asegurar que la página se muestre desde arriba cuando se carga
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }, 100)
  }, [product.id])

  // Cerrar menú de compartir cuando se hace clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showShareMenu && !(event.target as Element).closest('.relative')) {
        setShowShareMenu(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showShareMenu])

  // Usar todos los archivos multimedia del producto o solo la imagen principal
  const productMedia = product.mediaFiles.length > 0 
    ? product.mediaFiles.map(file => ({
        ...file,
        type: file.type || (file.url.includes('.mp4') || file.url.includes('.webm') || file.url.includes('.mov') ? 'video' : 'image')
      }))
    : [{ id: 'main', url: product.image, type: 'image' as const }]

  // Debug log removido para evitar logs infinitos en producción

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
      // Crear el nombre del producto con variantes de metadatos
      const metaVariantName = Object.entries(selectedMetaVariant)
        .filter(([_, value]) => value)
        .map(([key, value]) => `${key}: ${value}`)
        .join(', ')
      
      let finalProductName = product.name
      let finalVariantInfo = selectedVariant
      
             // Si hay variantes de metadatos, usarlas
       if (metaVariantName) {
         finalProductName = `${product.name} (${metaVariantName})`
         finalVariantInfo = {
           id: Object.values(selectedMetaVariant).join('-'),
           name: metaVariantName,
           price: product.price,
           stock: 999 // Stock por defecto para variantes de metadatos
         }
       }

      const cartItem = {
        id: selectedVariant ? `${product.id}-${selectedVariant.id}` : finalVariantInfo ? `${product.id}-${finalVariantInfo.id}` : product.id,
        productId: product.id,
        name: finalProductName,
        price: selectedVariant?.price || product.price,
        currency: tienda.currency,
        image: productMedia[0]?.url || product.image,
        slug: product.slug || `producto-${product.id}`,
        variant: finalVariantInfo
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

  // Función para manejar el compartir
  const handleShare = async () => {
    const shareData = {
      title: `${product.name} - ${tienda.storeName}`,
      text: `Mira este producto: ${product.name}`,
      url: window.location.href
    }

    // Intentar usar Web Share API nativa primero (móviles y navegadores modernos)
    if (navigator.share) {
      try {
        await navigator.share(shareData)
        setShareSuccess(true)
        setTimeout(() => setShareSuccess(false), 2000)
        return
      } catch (error) {
        console.log('Error sharing:', error)
      }
    }

    // Si no está disponible la Web Share API, mostrar menú de opciones
    setShowShareMenu(!showShareMenu)
  }

  // Funciones específicas para cada plataforma
  const shareToWhatsApp = () => {
    const text = `*${product.name}*\n\n${product.description ? product.description.substring(0, 100) + '...' : 'Mira este producto'}\n\n${getCurrencySymbol(tienda.currency)}${product.price}\n\n${window.location.href}`
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(url, '_blank')
    setShowShareMenu(false)
  }

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const shareToTwitter = () => {
    const text = `${product.name} - ${tienda.storeName}`
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(window.location.href)}`
    window.open(url, '_blank', 'width=600,height=400')
    setShowShareMenu(false)
  }

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setShareSuccess(true)
      setTimeout(() => setShareSuccess(false), 2000)
      setShowShareMenu(false)
    } catch (error) {
      console.error('Error copying to clipboard:', error)
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
                  poster={productMedia[selectedImageIndex].url.replace(/\.(mp4|webm|mov)$/, '.jpg')}
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
                          autoPlay={false}
                          loop={false}
                          muted={true}
                          playsInline={true}
                          preload="metadata"
                          poster={media.url.replace(/\.(mp4|webm|mov)$/, '.jpg')}
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

            {/* Selector de Variantes (Metadatos) */}
            <ProductVariantSelector
              product={product}
              onVariantChange={setSelectedMetaVariant}
              theme="default"
            />

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
                  <div className="relative">
                    <button 
                      onClick={handleShare}
                      className={`w-full border transition-all duration-200 ease-in-out bg-transparent hover-scale inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-md font-medium ${
                        shareSuccess 
                          ? 'border-green-500 text-green-600 bg-green-50' 
                          : 'border-neutral-300 text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      {shareSuccess ? <Icons.Check /> : <Icons.Share />}
                      <span>{shareSuccess ? 'Copiado!' : 'Compartir'}</span>
                    </button>
                    
                    {/* Menú de opciones de compartir */}
                    {showShareMenu && (
                      <div className="absolute top-full mt-2 right-0 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-50 share-menu">
                        <div className="py-2">
                          <button
                            onClick={shareToWhatsApp}
                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 flex items-center space-x-3 share-menu-item share-whatsapp"
                          >
                            <Icons.WhatsApp />
                            <span>WhatsApp</span>
                          </button>
                          <button
                            onClick={shareToFacebook}
                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 flex items-center space-x-3 share-menu-item share-facebook"
                          >
                            <Icons.Facebook />
                            <span>Facebook</span>
                          </button>
                          <button
                            onClick={shareToTwitter}
                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 flex items-center space-x-3 share-menu-item share-twitter"
                          >
                            <Icons.Twitter />
                            <span>Twitter</span>
                          </button>
                          <div className="border-t border-neutral-200 my-1"></div>
                          <button
                            onClick={copyToClipboard}
                            className="w-full px-4 py-2 text-left text-sm text-neutral-700 flex items-center space-x-3 share-menu-item"
                          >
                            <Icons.Copy />
                            <span>Copiar enlace</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
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