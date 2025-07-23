'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function GeneralSettingsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'es'

  useEffect(() => {
    // Redirigir automáticamente a la sección de información de la tienda
    router.replace(`/${locale}/settings/general/info`)
  }, [router, locale])

  return null
} 