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
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  )
} 