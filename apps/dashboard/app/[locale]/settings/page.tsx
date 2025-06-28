'use client'

import { useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'

export default function SettingsPage() {
  const router = useRouter()
  const params = useParams()
  const locale = params?.locale || 'es'

  useEffect(() => {
    // Redirigir automáticamente a la configuración general
    router.replace(`/${locale}/settings/general`)
  }, [router, locale])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-gray-600">Cargando...</p>
      </div>
    </div>
  )
} 