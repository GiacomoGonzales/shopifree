'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ContentPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'es'

  useEffect(() => {
    // Redirigir automáticamente a la sección de secciones
    router.replace(`/${locale}/content/sections`)
  }, [router, locale])

  return null
} 