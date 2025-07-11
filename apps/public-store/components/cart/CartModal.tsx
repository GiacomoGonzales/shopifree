'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useCart } from '../../lib/cart-context'
import { useStore } from '../../lib/store-context'
import { getCurrencySymbol } from '../../lib/store'

const Icons = {
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
    </svg>
  ),
}

export default function CartModal() {
  const { state, closeCart, removeItem, updateQuantity } = useCart()
  const { store } = useStore()

  // Solo prevenir scroll del body en desktop, permitir scroll interno del modal en mobile
  useEffect(() => {
    if (state.isOpen) {
      // En móvil no bloqueamos el scroll del body ya que el modal maneja su propio scroll
      // Solo aplicamos esto para mantener consistencia visual
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollbarWidth}px`
    } else {
      document.body.style.paddingRight = '0px'
    }

    return () => {
      document.body.style.paddingRight = '0px'
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
    <div className={`fixed inset-0 bg-white z-50 flex flex-col overflow-hidden transition-all duration-300 ease-out ${
      state.isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-full pointer-events-none'
    }`}>
      {/* Header del modal */}
      <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white">
        <button
          onClick={closeCart}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <Icons.ArrowLeft />
        </button>
        <div className="text-center">
          <h1 className="text-lg font-medium text-neutral-900">Tu Carrito</h1>
          <p className="text-sm text-neutral-500">
            {state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}
          </p>
        </div>
        <button
          onClick={closeCart}
          className="p-2 hover:bg-neutral-100 rounded-full transition-colors"
        >
          <Icons.Close />
        </button>
      </div>

      {/* Contenido principal */}
      <div className="flex-1 flex flex-col min-h-0">
        {state.items.length === 0 ? (
          /* Carrito vacío */
          <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
            <div className="w-20 h-20 bg-neutral-100 rounded-full flex items-center justify-center mb-6">
              <Icons.ShoppingBag />
            </div>
            <h2 className="text-xl font-medium text-neutral-900 mb-3">Tu carrito está vacío</h2>
            <p className="text-neutral-500 mb-8 max-w-sm">
              Agrega algunos productos para comenzar tu compra
            </p>
            <Link href="/" onClick={closeCart}>
              <button className="bg-neutral-900 text-white px-8 py-4 rounded-lg font-medium hover:bg-neutral-800 transition-colors text-lg">
                Explorar productos
              </button>
            </Link>
          </div>
        ) : (
          <>
            {/* Lista de productos */}
            <div className="flex-1 overflow-y-auto p-4 pb-48">
              <div className="space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-lg">
                    {/* Imagen del producto */}
                    <div className="relative w-20 h-20 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
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
                            target.src = '/api/placeholder/80/80'; // Final fallback
                          }
                        }}
                      />

                    </div>

                    {/* Información del producto */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/${item.slug}`} onClick={closeCart}>
                        <h3 className="text-base font-medium text-neutral-900 hover:text-neutral-600 transition-colors line-clamp-2 mb-1">
                          {item.name}
                        </h3>
                      </Link>
                      
                      {item.variant && (
                        <p className="text-sm text-neutral-500 mb-2">
                          {item.variant.name}
                        </p>
                      )}

                      <p className="text-lg font-medium text-neutral-900 mb-3">
                        {getCurrencySymbol(store?.currency || 'USD')} {(item.variant?.price || item.price).toFixed(2)}
                      </p>

                      {/* Controles de cantidad */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3 bg-white rounded-lg border border-neutral-200 p-1">
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="p-2 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <Icons.Minus />
                          </button>
                          <span className="w-12 text-center text-base font-medium">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="p-2 hover:bg-neutral-100 rounded transition-colors"
                          >
                            <Icons.Plus />
                          </button>
                        </div>

                        {/* Botón eliminar */}
                        <button
                          onClick={() => removeItem(item.id)}
                          className="p-3 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Icons.Trash />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Total fijo en la parte inferior */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 space-y-4">
              {/* Información del total */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-500">Total ({state.totalItems} productos)</p>
                  <p className="text-2xl font-bold text-neutral-900">
                    {getCurrencySymbol(store?.currency || 'USD')} {state.totalPrice.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-neutral-500">Envío gratis</p>
                  <p className="text-xs text-neutral-500">desde {getCurrencySymbol(store?.currency || 'USD')} 150</p>
                </div>
              </div>

              {/* Botón de checkout */}
              <button className="w-full bg-neutral-900 text-white py-4 rounded-lg font-medium hover:bg-neutral-800 transition-colors text-lg">
                Finalizar compra
              </button>

              {/* Texto informativo */}
              <p className="text-center text-xs text-neutral-500">
                ¿Tienes un cupón de descuento? Lo podrás aplicar en el checkout
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
} 