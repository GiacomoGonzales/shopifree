'use client'

import { useEffect } from 'react'
import { useAuth } from '../lib/simple-auth-context'

interface AuthGuardProps {
  children: React.ReactNode
  fallback?: React.ReactNode
}

export default function AuthGuard({ children, fallback }: AuthGuardProps) {
  const { user, userData, loading, authInitialized, error, isAuthenticated } = useAuth()

  useEffect(() => {
    // Redirect to login if Firebase is initialized and user is not authenticated
    if (authInitialized && !isAuthenticated) {
      const timer = setTimeout(() => {
        window.location.href = '/es/login'
      }, 100)
      
      return () => clearTimeout(timer)
    }
  }, [authInitialized, isAuthenticated])

  // Show loading state while Firebase is initializing or loading user data
  if (!authInitialized || loading) {
    return fallback || (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-2 text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Show error if there's an issue with authentication
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
          <p className="text-gray-600 mt-2 mb-6">Ha ocurrido un error. Por favor, intenta nuevamente.</p>
          
          <div className="space-y-3">
            <button
              onClick={() => window.location.reload()}
              className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
            >
              Reintentar
            </button>
            <a
              href="/es/login"
              className="block w-full px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-center"
            >
              Ir al Login
            </a>
          </div>
        </div>
      </div>
    )
  }

  // Redirect immediately if not authenticated (no loading screen)
  if (!isAuthenticated) {
    return null
  }

  // User is authenticated - render children
  return <>{children}</>
} 