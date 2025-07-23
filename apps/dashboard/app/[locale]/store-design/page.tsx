'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function StoreDesignPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'es'

  useEffect(() => {
    // Redirigir automáticamente a la sección de logo y colores
    router.replace(`/${locale}/store-design/logo-colors`)
  }, [router, locale])

  return null
} 