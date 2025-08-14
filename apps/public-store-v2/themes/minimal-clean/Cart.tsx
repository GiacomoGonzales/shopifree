'use client'

import { useEffect, useState } from 'react'
import CartPanel from './CartPanel'
import { useCart } from '../../lib/cart-context'

export default function Cart() {
  const { state } = useCart()
  const [isMobile, setIsMobile] = useState(false)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => { setIsClient(true) }, [])
  useEffect(() => {
    if (!isClient) return
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [isClient])

  if (!isClient) return null

  return (<CartPanel />)
}


