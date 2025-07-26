'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useCart } from '../../lib/cart-context'
import { useStore } from '../../lib/store-context'
import { getCurrencySymbol } from '../../lib/store'
import './styles.css'

const Icons = {
  Close: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Trash: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
    </svg>
  ),
  Plus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
    </svg>
  ),
  Minus: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m15.75 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125A1.125 1.125 0 0021 18.75v-3.375m0 0V14.25m0 0H9.75M21 14.25v2.25" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  ArrowLeft: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
    </svg>
  ),
}

export default function ElegantBoutiqueCart() {
  const { state, closeCart, removeItem, updateQuantity, openCheckout } = useCart()
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
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.overflow = 'hidden'
      document.body.style.paddingRight = `${scrollbarWidth}px`
      
      const header = document.querySelector('header')
      if (header) {
        header.style.paddingRight = `${scrollbarWidth}px`
      }
    } else {
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

  const handleCheckout = () => {
    closeCart()
    openCheckout()
  }

  const isDesktop = typeof window !== 'undefined' && window.innerWidth >= 768

  if (isDesktop) {
    // Versión Desktop - Panel lateral
    return (
      <>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 backdrop-blur-sm z-40 transition-all duration-300 ease-out ${
            state.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundColor: state.isOpen ? 'rgba(var(--theme-neutral-dark), 0.3)' : 'transparent'
          }}
          onClick={closeCart}
        />
        
        {/* Panel deslizante */}
        <div 
          className={`fixed top-0 right-0 h-full w-96 z-50 transform transition-all duration-300 ease-out flex flex-col ${
            state.isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'
          }`}
          style={{
            backgroundColor: 'rgb(var(--theme-neutral-light))',
            boxShadow: 'var(--theme-shadow-lg)'
          }}
        >
          
          {/* Header del panel */}
          <div className="flex items-center justify-between p-4 border-b flex-shrink-0" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
                <div style={{ color: 'rgb(var(--theme-accent))' }}>
                  <Icons.ShoppingBag />
                </div>
              </div>
              <div>
                <h2 className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Tu Carrito
                </h2>
                <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  {state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover-elegant rounded-full transition-colors"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              <Icons.Close />
            </button>
          </div>

          {/* Contenido del carrito */}
          <div className="flex-1 flex flex-col min-h-0">
            {state.items.length === 0 ? (
              /* Carrito vacío */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
                  <div style={{ color: 'rgb(var(--theme-accent))' }}>
                    <Icons.ShoppingBag />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-serif mb-3" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Tu carrito está vacío
                </h3>
                <p className="text-sans mb-8" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  Descubre nuestra elegante colección de productos premium
                </p>
                <Link href="/" onClick={closeCart}>
                  <button className="btn-boutique-primary">
                    Explorar Colección
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* Lista de productos */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: '0' }}>
                  {state.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start space-x-3 p-3 rounded-sm card-boutique"
                    >
                      {/* Imagen del producto */}
                      <div className="relative w-14 h-14 rounded-sm overflow-hidden flex-shrink-0 product-image-boutique" style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
                        <img
                          src={item.image.includes('.mp4') || item.image.includes('.webm') || item.image.includes('.mov') 
                            ? item.image.replace(/\.(mp4|webm|mov)$/, '.jpg')
                            : item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('.jpg') && item.image.includes('.mp4')) {
                              target.src = item.image.replace('.mp4', '.png');
                            } else if (target.src.includes('.png') && item.image.includes('.mp4')) {
                              target.src = '/api/placeholder/56/56';
                            }
                          }}
                        />
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/${item.slug}`} onClick={closeCart}>
                          <h4 className="text-sm font-medium text-serif hover-elegant transition-colors line-clamp-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                            {item.name}
                          </h4>
                        </Link>
                        
                        {item.variant && (
                          <p className="text-xs text-sans mt-1" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                            {item.variant.name}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-sm font-medium text-serif" style={{ color: 'rgb(var(--theme-accent))' }}>
                            {getCurrencySymbol(store?.currency || 'USD')} {(item.variant?.price || item.price).toFixed(2)}
                          </p>

                          {/* Controles de cantidad */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-1 hover-elegant rounded transition-colors"
                              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                            >
                              <Icons.Minus />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-1 hover-elegant rounded transition-colors"
                              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                            >
                              <Icons.Plus />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover-elegant rounded transition-colors"
                        style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer del carrito */}
                <div className="flex-shrink-0 border-t p-4" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
                  {/* Total y botón */}
                  <div className="card-boutique p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-base font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                        Total
                      </span>
                      <span className="text-xl font-bold text-serif" style={{ color: 'rgb(var(--theme-accent))' }}>
                        {getCurrencySymbol(store?.currency || 'USD')} {state.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      {state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}
                    </p>
                    
                    <button 
                      onClick={handleCheckout}
                      className="w-full btn-boutique-primary"
                    >
                      Finalizar compra
                    </button>
                  </div>

                  {/* Información adicional compacta */}
                  <div className="mt-3 text-center">
                    <div className="flex items-center justify-center space-x-2 text-xs text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      <div style={{ color: 'rgb(var(--theme-accent))' }}>
                        <Icons.Truck />
                      </div>
                      <span>Envío gratis desde {getCurrencySymbol(store?.currency || 'USD')} 150</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Modal de Checkout */}
        <ElegantBoutiqueCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
        />
      </>
    )
  } else {
    // Versión Mobile - Modal completo
    return (
      <>
        <div className={`fixed inset-0 z-50 flex flex-col overflow-hidden transition-all duration-300 ease-out ${
          state.isOpen ? 'opacity-100 transform translate-y-0' : 'opacity-0 transform translate-y-full pointer-events-none'
        }`} style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
          {/* Header del modal */}
          <div className="flex items-center justify-between p-4 border-b" style={{ 
            borderColor: 'rgb(var(--theme-primary) / 0.1)',
            backgroundColor: 'rgb(var(--theme-neutral-light))'
          }}>
            <button
              onClick={closeCart}
              className="p-2 hover-elegant rounded-full transition-colors"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              <Icons.ArrowLeft />
            </button>
            <div className="text-center">
              <h1 className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                Tu Carrito
              </h1>
              <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                {state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}
              </p>
            </div>
            <button
              onClick={closeCart}
              className="p-2 hover-elegant rounded-full transition-colors"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              <Icons.Close />
            </button>
          </div>

          {/* Contenido principal */}
          <div className="flex-1 flex flex-col min-h-0">
            {state.items.length === 0 ? (
              /* Carrito vacío */
              <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6" style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
                  <div style={{ color: 'rgb(var(--theme-accent))' }}>
                    <Icons.ShoppingBag />
                  </div>
                </div>
                <h3 className="text-xl font-medium text-serif mb-3" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Tu carrito está vacío
                </h3>
                <p className="text-sans mb-8" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  Descubre nuestra elegante colección
                </p>
                <Link href="/" onClick={closeCart}>
                  <button className="btn-boutique-primary">
                    Explorar Colección
                  </button>
                </Link>
              </div>
            ) : (
              <>
                {/* Lista de productos */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {state.items.map((item) => (
                    <div 
                      key={item.id} 
                      className="flex items-start space-x-4 p-4 rounded-sm card-boutique"
                    >
                      {/* Imagen del producto */}
                      <div className="relative w-20 h-20 rounded-sm overflow-hidden flex-shrink-0 product-image-boutique" style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
                        <img
                          src={item.image.includes('.mp4') || item.image.includes('.webm') || item.image.includes('.mov') 
                            ? item.image.replace(/\.(mp4|webm|mov)$/, '.jpg')
                            : item.image}
                          alt={item.name}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (target.src.includes('.jpg') && item.image.includes('.mp4')) {
                              target.src = item.image.replace('.mp4', '.png');
                            } else if (target.src.includes('.png') && item.image.includes('.mp4')) {
                              target.src = '/api/placeholder/80/80';
                            }
                          }}
                        />
                      </div>

                      {/* Información del producto */}
                      <div className="flex-1 min-w-0">
                        <Link href={`/${item.slug}`} onClick={closeCart}>
                          <h4 className="text-base font-medium text-serif hover-elegant transition-colors line-clamp-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                            {item.name}
                          </h4>
                        </Link>
                        
                        {item.variant && (
                          <p className="text-sm text-sans mt-1" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                            {item.variant.name}
                          </p>
                        )}

                        <div className="flex items-center justify-between mt-3">
                          <p className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-accent))' }}>
                            {getCurrencySymbol(store?.currency || 'USD')} {(item.variant?.price || item.price).toFixed(2)}
                          </p>

                          {/* Controles de cantidad */}
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                              className="p-2 hover-elegant rounded transition-colors"
                              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                            >
                              <Icons.Minus />
                            </button>
                            <span className="w-8 text-center text-base font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                              {item.quantity}
                            </span>
                            <button
                              onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                              className="p-2 hover-elegant rounded transition-colors"
                              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                            >
                              <Icons.Plus />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Botón eliminar */}
                      <button
                        onClick={() => removeItem(item.id)}
                        className="p-2 hover-elegant rounded transition-colors"
                        style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                      >
                        <Icons.Trash />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Footer del carrito */}
                <div className="border-t p-4 space-y-4" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
                  {/* Total y botón */}
                  <div className="card-boutique p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                        Total
                      </span>
                      <span className="text-2xl font-bold text-serif" style={{ color: 'rgb(var(--theme-accent))' }}>
                        {getCurrencySymbol(store?.currency || 'USD')} {state.totalPrice.toFixed(2)}
                      </span>
                    </div>
                    <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      {state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}
                    </p>
                    
                    <button 
                      onClick={handleCheckout}
                      className="w-full btn-boutique-primary"
                    >
                      Finalizar compra
                    </button>
                  </div>

                  {/* Información adicional */}
                  <div className="space-y-2 text-center">
                    <div className="flex items-center justify-center space-x-2 text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      <div style={{ color: 'rgb(var(--theme-accent))' }}>
                        <Icons.Truck />
                      </div>
                      <span>Envío gratis desde {getCurrencySymbol(store?.currency || 'USD')} 150</span>
                    </div>
                    <div className="flex items-center justify-center space-x-2 text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      <div style={{ color: 'rgb(var(--theme-accent))' }}>
                        <Icons.Tag />
                      </div>
                      <span>¿Tienes un cupón de descuento? Lo podrás aplicar en el checkout</span>
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
} 