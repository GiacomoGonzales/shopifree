'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '../../lib/cart-context'
import { useStore } from '../../lib/store-context'
import { getCurrencySymbol } from '../../lib/store'

const Icons = {
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
}

export default function CartPanel() {
  const { state, closeCart, removeItem, updateQuantity } = useCart()
  const { store } = useStore()

  // Cerrar carrito con Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && state.isOpen) {
        closeCart()
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [state.isOpen, closeCart])

  // Prevenir scroll del body cuando el carrito está abierto
  useEffect(() => {
    if (state.isOpen) {
      // Calcular el ancho de la barra de scroll antes de ocultarla
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      
      // Aplicar padding-right para compensar la barra de scroll
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      
      // También aplicar el mismo padding al header fijo para mantener la alineación
      const header = document.querySelector('header')
      if (header) {
        header.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
      // Restaurar estilos originales
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
      
      const header = document.querySelector('header')
      if (header) {
        header.style.paddingRight = '0px'
      }
    }

    return () => {
      document.body.style.overflow = 'unset'
      document.body.style.paddingRight = '0px'
      
      const header = document.querySelector('header')
      if (header) {
        header.style.paddingRight = '0px'
      }
    }
  }, [state.isOpen])

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId)
    } else {
      updateQuantity(itemId, newQuantity)
    }
  }

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ease-out ${
          state.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={closeCart}
      />
      
      {/* Panel deslizante */}
      <div 
        className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-all duration-300 ease-out ${
          state.isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
        }`}
      >
        
        {/* Header del panel */}
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center">
              <Icons.ShoppingBag />
            </div>
            <div>
              <h2 className="text-lg font-medium text-neutral-900">Tu Carrito</h2>
              <p className="text-sm text-neutral-500">
                {state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}
              </p>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
          >
            <Icons.Close />
          </button>
        </div>

        {/* Contenido del carrito */}
        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            /* Carrito vacío */
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
                <Icons.ShoppingBag />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-neutral-500 mb-6">
                Agrega algunos productos para comenzar tu compra
              </p>
              <Link href="/" onClick={closeCart}>
                <button className="bg-neutral-900 text-white px-6 py-3 rounded-md font-medium hover:bg-neutral-800 transition-colors">
                  Explorar productos
                </button>
              </Link>
            </div>
          ) : (
            <>
              {/* Lista de productos */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {state.items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-lg"
                  >
                    {/* Imagen del producto */}
                    <div className="relative w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img
                        src={item.image.includes('.mp4') || item.image.includes('.webm') || item.image.includes('.mov') 
                          ? item.image.replace(/\.(mp4|webm|mov)$/, '.jpg') // Cloudinary auto-generates thumbnails
                          : item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback si no existe el thumbnail
                          const target = e.target as HTMLImageElement;
                          if (target.src.includes('.jpg') && item.image.includes('.mp4')) {
                            target.src = item.image.replace('.mp4', '.png'); // Try PNG thumbnail
                          } else if (target.src.includes('.png') && item.image.includes('.mp4')) {
                            target.src = '/api/placeholder/64/64'; // Final fallback
                          }
                        }}
                      />

                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/${item.slug}`} onClick={closeCart}>
                        <h4 className="text-sm font-medium text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-2">
                          {item.name}
                        </h4>
                      </Link>
                      
                      {item.variant && (
                        <p className="text-xs text-neutral-500 mt-1">
                          {item.variant.name}
                        </p>
                      )}

                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-medium text-neutral-900">
                          {getCurrencySymbol(store?.currency || 'USD')} {(item.variant?.price || item.price).toFixed(2)}
                        </p>

                        {/* Controles de cantidad */}
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                          >
                            <Icons.Minus />
                          </button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-1 hover:bg-neutral-200 rounded transition-colors"
                          >
                            <Icons.Plus />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Botón eliminar */}
                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"
                    >
                      <Icons.Trash />
                    </button>
                  </div>
                ))}
              </div>

              {/* Footer del carrito */}
              <div className="border-t border-neutral-200 p-6 space-y-4">
                {/* Total y botón juntos */}
                <div className="bg-neutral-50 p-4 rounded-lg space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-medium text-neutral-900">Total</span>
                    <span className="text-2xl font-bold text-neutral-900">
                      {getCurrencySymbol(store?.currency || 'USD')} {state.totalPrice.toFixed(2)}
                    </span>
                  </div>
                  <p className="text-sm text-neutral-500">
                    {state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}
                  </p>
                  
                  {/* Botón de checkout dentro de la caja del total */}
                  <button className="w-full bg-neutral-900 text-white py-3 rounded-lg font-medium hover:bg-neutral-800 transition-colors">
                    Finalizar compra
                  </button>
                </div>

                {/* Información adicional */}
                <div className="space-y-2 text-center">
                  <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600">
                    <Icons.Truck />
                    <span>Envío gratis a partir de {getCurrencySymbol(store?.currency || 'USD')} 150</span>
                  </div>
                  <div className="flex items-center justify-center space-x-2 text-sm text-neutral-600">
                    <Icons.Tag />
                    <span>¿Tienes un cupón de descuento?</span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
} 