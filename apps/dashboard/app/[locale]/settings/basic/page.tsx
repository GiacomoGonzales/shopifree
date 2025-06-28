'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export default function BasicSettingsRedirect() {
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Extraer el locale de la URL actual
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentLocale = pathSegments[0] || 'es'
    
    // Redirigir a la nueva ruta /settings/general
    const newPath = `/${currentLocale}/settings/general`
    router.replace(newPath)
  }, [router, pathname])

  // Mostrar un loader mientras redirige
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
} 