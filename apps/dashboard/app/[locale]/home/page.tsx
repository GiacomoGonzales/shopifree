'use client'

import { usePathname } from 'next/navigation'
import DashboardLayout from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/simple-auth-context'
import { useStore } from '../../../lib/hooks/useStore'

export default function HomePage() {
  const { userData } = useAuth()
  const { store } = useStore()
  const pathname = usePathname()
  const currentLocale = pathname.split('/')[1] || 'es'
  const isSpanish = currentLocale === 'es'

  // Verificar si los datos están listos
  const isDataLoaded = userData && store

  const getWelcomeTitle = () => {
    return isSpanish ? 'Bienvenido a Shopifree' : 'Welcome to Shopifree'
  }

  const getSubtitle = () => {
    return isSpanish
      ? '¡Felicitaciones por haber completado la configuración inicial de tu tienda!'
      : 'Congratulations on completing the initial setup of your store!'
  }

  const getSubtitle2 = () => {
    return isSpanish
      ? 'Ahora comienza lo más emocionante: dar vida a tu propio espacio online.'
      : 'Now begins the most exciting part: bringing your own online space to life.'
  }

  const getMainMessage = () => {
    if (isSpanish) {
      return 'En Shopifree creemos que crear una tienda virtual debe ser simple, rápido y gratuito, y por eso estamos aquí para acompañarte en cada paso. Poco a poco podrás personalizar tu tienda hasta que refleje exactamente lo que quieres transmitir a tus clientes.'
    } else {
      return 'At Shopifree we believe that creating an online store should be simple, fast and free, and that\'s why we\'re here to accompany you every step of the way. Little by little you\'ll be able to customize your store until it reflects exactly what you want to convey to your customers.'
    }
  }

  const getClosingMessage = () => {
    if (isSpanish) {
      return 'Recuerda: no estás solo. Nuestro objetivo es guiarte y darte las herramientas necesarias para que tu tienda crezca y sea el reflejo auténtico de tu marca.'
    } else {
      return 'Remember: you\'re not alone. Our goal is to guide you and give you the necessary tools so that your store grows and becomes an authentic reflection of your brand.'
    }
  }

  const getFinalMessage = () => {
    return isSpanish
      ? '¡Tu aventura en el mundo del ecommerce empieza hoy!'
      : 'Your adventure in the world of ecommerce starts today!'
  }

  // Mostrar loading mientras se cargan los datos
  if (!isDataLoaded) {
    return (
      <DashboardLayout>
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="w-full overflow-hidden">
              <div className="animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      {/* Sección de Bienvenida - Fuera del contenedor principal */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="w-full overflow-hidden">
            <h1 className="text-xl font-semibold text-gray-900 mb-3 break-words overflow-wrap-anywhere flex items-center">
              {getWelcomeTitle()}
              <svg className="w-6 h-6 ml-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </h1>

            <p className="text-base font-medium text-gray-700 mb-2 break-words overflow-wrap-anywhere">
              {getSubtitle()}
            </p>

            <p className="text-base text-gray-600 mb-4 break-words overflow-wrap-anywhere">
              {getSubtitle2()}
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mb-4 break-words overflow-wrap-anywhere">
              {getMainMessage()}
            </p>

            <p className="text-sm text-gray-600 leading-relaxed mb-4 break-words overflow-wrap-anywhere">
              {getClosingMessage()}
            </p>

            <p className="text-base font-medium text-gray-700 break-words overflow-wrap-anywhere">
              {getFinalMessage()}
            </p>
          </div>
        </div>
      </div>

    </DashboardLayout>
  )
}