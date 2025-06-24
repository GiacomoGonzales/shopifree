'use client'

import { useEffect } from 'react'
import { useAuth } from '../lib/auth-context'
import { getLandingUrl } from '../lib/config'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, userData, loading, error, isAuthenticated } = useAuth()

  useEffect(() => {
    // Only redirect if loading is complete and user is not authenticated
    if (!loading && !isAuthenticated) {
      // Small delay to prevent flashing
      const timer = setTimeout(() => {
        window.location.href = getLandingUrl('/es/login')
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [loading, isAuthenticated])

  // Show loading state
  if (loading) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Verificando autenticación...</h2>
          <p className="text-gray-600 mt-2">Cargando tu información de usuario</p>
        </div>
      </div>
    )
  }

  // Show error if there's an issue with user data
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Error de Autenticación</h2>
          <p className="text-gray-600 mt-2 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
            >
              Reintentar
            </button>
            <br />
            <a
              href={getLandingUrl('/es/login')}
              className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm inline-block"
            >
              Volver al Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Show redirecting message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Redirigiendo al login...</h2>
          <p className="text-gray-600 mt-2">
            Si no eres redirigido automáticamente,{' '}
            <a href={getLandingUrl('/es/login')} className="text-blue-600 underline">
              haz clic aquí
            </a>
          </p>
        </div>
      </div>
    )
  }

  // User is authenticated and has valid data - render children
  return <>{children}</>
} 