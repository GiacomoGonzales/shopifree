'use client'

import { useEffect, useState } from 'react'
import CartPanel from './CartPanel'
import CartModal from './CartModal'

export default function Cart() {
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
    </>
  )
} 