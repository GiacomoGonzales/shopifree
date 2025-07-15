'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error details
    console.error('Application Error:', {
      message: error.message,
      digest: error.digest,
      stack: error.stack,
      timestamp: new Date().toISOString()
    })
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.232 18.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Error del servidor
          </h2>
          <p className="text-gray-600 mb-6">
            Ha ocurrido un error interno del servidor. Nuestro equipo ha sido notificado.
          </p>
          {process.env.NODE_ENV === 'development' && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6 text-left">
              <h3 className="text-sm font-medium text-red-800 mb-2">Detalles del error (desarrollo):</h3>
              <p className="text-xs text-red-700 font-mono break-all">{error.message}</p>
              {error.digest && (
                <p className="text-xs text-red-600 mt-2">Digest: {error.digest}</p>
              )}
            </div>
          )}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors"
            >
              Intentar de nuevo
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors"
            >
              Ir al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  )
} 