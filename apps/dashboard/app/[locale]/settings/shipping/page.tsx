'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ShippingPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'es'

  useEffect(() => {
    // Redirigir automáticamente a la sección de recojo en tienda
    router.replace(`/${locale}/settings/shipping/store-pickup`)
  }, [router, locale])

  return null
} 