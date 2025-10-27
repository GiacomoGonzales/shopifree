'use client'

import { useState, useEffect } from 'react'

declare global {
  interface Window {
    gtag: (...args: any[]) => void
  }
}

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Verificar si el usuario ya dio su consentimiento
    const consent = localStorage.getItem('cookie-consent')
    if (!consent) {
      // Mostrar banner después de un pequeño delay
      setTimeout(() => setShowBanner(true), 1000)
    }
  }, [])

  const handleAccept = () => {
    // Guardar consentimiento
    localStorage.setItem('cookie-consent', 'accepted')

    // Actualizar Google Consent Mode
    if (typeof window.gtag !== 'undefined') {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted',
        ad_storage: 'granted',
        ad_user_data: 'granted',
        ad_personalization: 'granted'
      })
    }

    setShowBanner(false)
  }

  const handleReject = () => {
    // Guardar rechazo
    localStorage.setItem('cookie-consent', 'rejected')

    // Mantener Google Consent Mode en denied
    if (typeof window.gtag !== 'undefined') {
      window.gtag('consent', 'update', {
        analytics_storage: 'denied',
        ad_storage: 'denied',
        ad_user_data: 'denied',
        ad_personalization: 'denied'
      })
    }

    setShowBanner(false)
  }

  if (!showBanner) return null

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 shadow-2xl"
      style={{
        animation: 'slideUp 0.4s ease-out'
      }}
    >
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Texto */}
          <div className="flex-1 text-sm text-gray-700">
            <p className="font-semibold mb-1">🍪 Usamos cookies</p>
            <p className="text-gray-600">
              Utilizamos cookies para analizar el tráfico del sitio y optimizar tu experiencia.
              Al aceptar, tus datos se agregarán con los de otros usuarios.
            </p>
          </div>

          {/* Botones */}
          <div className="flex gap-3 flex-shrink-0">
            <button
              onClick={handleReject}
              className="px-6 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
            >
              Rechazar
            </button>
            <button
              onClick={handleAccept}
              className="px-6 py-2.5 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors duration-200 shadow-lg shadow-emerald-600/30"
            >
              Aceptar cookies
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
