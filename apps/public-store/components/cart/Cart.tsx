'use client'

import { useEffect, useState } from 'react'
import CartPanel from './CartPanel'
import CartModal from './CartModal'
import CheckoutModal from '../checkout/CheckoutModal'
import { useCart } from '../../lib/cart-context'

export default function Cart() {
  const { state, closeCheckout } = useCart()
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return
    
    // Detectar si es móvil
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768) // md breakpoint
    }

    // Verificar al cargar
    checkIsMobile()

    // Verificar cuando cambie el tamaño de la ventana
    window.addEventListener('resize', checkIsMobile)
    return () => window.removeEventListener('resize', checkIsMobile)
  }, [isClient])

  if (!isClient) {
    return null
  }

  return (
    <>
      {isMobile ? <CartModal /> : <CartPanel />}
      <CheckoutModal 
        isOpen={state.isCheckoutOpen} 
        onClose={closeCheckout} 
      />
    </>
  )
} 