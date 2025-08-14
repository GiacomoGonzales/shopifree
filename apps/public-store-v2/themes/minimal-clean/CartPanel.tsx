'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { useCart } from '../../lib/cart-context'
import { getStoreBasicInfo } from '../../lib/store'

const Icons = {
  Close: () => (<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>),
  Trash: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>),
  Plus: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>),
  Minus: () => (<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>),
  ShoppingBag: () => (<svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>),
}

export default function CartPanel() {
  const { state, closeCart, removeItem, updateQuantity } = useCart()

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape' && state.isOpen) closeCart() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [state.isOpen, closeCart])

  return (
    <>
      <div className={`fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-all duration-300 ${state.isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={closeCart} />
      <div className={`fixed top-0 right-0 h-full w-96 bg-white shadow-2xl z-50 transform transition-all duration-300 ${state.isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0 pointer-events-none'}`}>
        <div className="flex items-center justify-between p-6 border-b border-neutral-200">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-neutral-100 rounded-full flex items-center justify-center"><Icons.ShoppingBag /></div>
            <div>
              <h2 className="text-lg font-medium text-neutral-900">Tu Carrito</h2>
              <p className="text-sm text-neutral-500">{state.totalItems} {state.totalItems === 1 ? 'producto' : 'productos'}</p>
            </div>
          </div>
          <button onClick={closeCart} className="p-2 hover:bg-neutral-100 rounded-full transition-colors"><Icons.Close /></button>
        </div>
        <div className="flex flex-col h-full">
          {state.items.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4"><Icons.ShoppingBag /></div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">Tu carrito está vacío</h3>
              <p className="text-neutral-500 mb-6">Agrega algunos productos para comenzar tu compra</p>
              <Link href="/"><button className="bg-neutral-900 text-white px-6 py-3 rounded-md font-medium hover:bg-neutral-800 transition-colors">Explorar productos</button></Link>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {state.items.map((item) => (
                  <div key={item.id} className="flex items-start space-x-4 p-4 bg-neutral-50 rounded-lg">
                    <div className="relative w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden flex-shrink-0">
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-neutral-900 line-clamp-2">{item.name}</h4>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-sm font-medium text-neutral-900">{(item.variant?.price || item.price).toFixed(2)} {item.currency}</p>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="p-1 hover:bg-neutral-200 rounded transition-colors"><Icons.Minus /></button>
                          <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="p-1 hover:bg-neutral-200 rounded transition-colors"><Icons.Plus /></button>
                        </div>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.id)} className="p-2 text-neutral-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors"><Icons.Trash /></button>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  )
}


