import Link from 'next/link'

// Client component for the back button
function BackButton() {
  'use client'
  
  return (
    <button
      onClick={() => window.history.back()}
      className="inline-block w-full px-6 py-3 bg-gray-200 text-gray-700 font-medium rounded-lg hover:bg-gray-300 transition-colors"
    >
      Regresar
    </button>
  )
}

export default function NotFound() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 404 Icon */}
        <div className="w-32 h-32 mx-auto mb-8 bg-gradient-to-br from-red-100 to-red-200 rounded-full flex items-center justify-center">
          <svg className="w-20 h-20 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Tienda no encontrada
        </h1>

        {/* Description */}
        <p className="text-lg text-gray-600 mb-2">
          La tienda que buscas no existe o no está disponible.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          Verifica que la URL sea correcta o contacta al propietario de la tienda.
        </p>

        {/* Actions */}
        <div className="space-y-4">
          {/* Primary Action */}
          <Link
            href="https://shopifree.app"
            className="inline-block w-full px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Ir a Shopifree
          </Link>

          {/* Secondary Action */}
          <BackButton />
        </div>

        {/* Help text */}
        <div className="mt-12 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            ¿Eres propietario de una tienda?
          </h3>
          <p className="text-xs text-blue-700">
            Crea tu tienda gratis en{' '}
            <Link 
              href="https://shopifree.app" 
              className="font-medium underline hover:no-underline"
            >
              Shopifree.app
            </Link>
            {' '}y comienza a vender online hoy mismo.
          </p>
        </div>
      </div>
    </main>
  )
} 