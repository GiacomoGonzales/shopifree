'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function ContentPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'es'

  useEffect(() => {
    // Redirigir automáticamente a la sección de páginas
    router.replace(`/${locale}/content/pages`)
  }, [router, locale])

  return null
} 