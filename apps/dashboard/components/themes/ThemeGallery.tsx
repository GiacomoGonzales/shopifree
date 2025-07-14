import { useStore } from '../../lib/hooks/useStore'
import { availableThemes, DEFAULT_THEME_ID, isValidTheme } from '../../lib/themes/themes-list'
import { updateStoreField } from '../../lib/store'
import ThemeCard from './ThemeCard'
import { useState, useEffect } from 'react'

type NotificationType = 'success' | 'error' | 'info'

interface Notification {
  type: NotificationType
  message: string
  show: boolean
}

export default function ThemeGallery() {
  const { store } = useStore()
  const [loadingThemeId, setLoadingThemeId] = useState<string | null>(null)
  const [selectedThemeId, setSelectedThemeId] = useState<string>(store?.theme || DEFAULT_THEME_ID)
  const [notification, setNotification] = useState<Notification>({
    type: 'success',
    message: '',
    show: false
  })

  // Sincronizar el estado local con el store cuando cambie
  useEffect(() => {
    if (store?.theme) {
      setSelectedThemeId(store.theme)
    }
  }, [store?.theme])

  // Auto-hide notification after 5 seconds
  useEffect(() => {
    if (notification.show) {
      const timer = setTimeout(() => {
        setNotification(prev => ({ ...prev, show: false }))
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [notification.show])

  const showNotification = (type: NotificationType, message: string) => {
    setNotification({
      type,
      message,
      show: true
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({ ...prev, show: false }))
  }

  const handleThemeSelect = async (themeId: string) => {
    // Evitar seleccionar el tema actual
    if (themeId === selectedThemeId) {
      showNotification('info', 'Este tema ya está seleccionado')
      return
    }

    // Validaciones
    if (!store?.id) {
      showNotification('error', 'No se encontró la información de la tienda')
      return
    }

    if (loadingThemeId) {
      return // Evitar múltiples actualizaciones simultáneas
    }

    if (!isValidTheme(themeId)) {
      showNotification('error', 'El tema seleccionado no es válido')
      return
    }

    try {
      setLoadingThemeId(themeId)

      // Actualizar inmediatamente el estado local para el UI
      setSelectedThemeId(themeId)

      // Mostrar notificación de proceso
      showNotification('info', 'Aplicando tema...')

      // Actualizar en Firestore
      await updateStoreField(store.id, 'theme', themeId)

      // Obtener información del tema seleccionado
      const selectedTheme = availableThemes.find(theme => theme.id === themeId)
      const themeName = selectedTheme?.nombre || 'el tema seleccionado'

      // Mostrar mensaje de éxito
      showNotification('success', `¡Perfecto! ${themeName} ha sido aplicado a tu tienda`)
      
    } catch (error) {
      console.error('Error al actualizar el tema:', error)
      
      // Revertir el estado local si hay error
      setSelectedThemeId(store?.theme || DEFAULT_THEME_ID)
      
      showNotification('error', 'Hubo un problema al aplicar el tema. Por favor, intenta de nuevo.')
    } finally {
      setLoadingThemeId(null)
    }
  }

  // Notification Component
  const NotificationBanner = () => {
    if (!notification.show) return null

    const getNotificationStyles = () => {
      switch (notification.type) {
        case 'success':
          return 'bg-green-50 border-green-200 text-green-800'
        case 'error':
          return 'bg-red-50 border-red-200 text-red-800'
        case 'info':
          return 'bg-blue-50 border-blue-200 text-blue-800'
        default:
          return 'bg-gray-50 border-gray-200 text-gray-800'
      }
    }

    const getIcon = () => {
      switch (notification.type) {
        case 'success':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          )
        case 'error':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )
        case 'info':
          return (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )
        default:
          return null
      }
    }

    return (
      <div className={`
        fixed top-4 right-4 z-50 max-w-md w-full mx-auto
        border rounded-lg p-4 shadow-lg backdrop-blur-sm
        transform transition-all duration-300 ease-out
        ${notification.show ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'}
        ${getNotificationStyles()}
      `}>
        <div className="flex items-start">
          <div className="flex-shrink-0">
            {getIcon()}
          </div>
          <div className="ml-3 flex-1">
            <p className="text-sm font-medium">{notification.message}</p>
          </div>
          <div className="ml-4 flex-shrink-0">
            <button
              onClick={hideNotification}
              className="rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <>
      <NotificationBanner />
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              Galería de Temas
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Elige el diseño perfecto para tu tienda. Cada tema está optimizado para ofrecer 
              la mejor experiencia a tus clientes y reflejar la personalidad de tu marca.
            </p>
          </div>

          {/* Themes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {availableThemes.map(theme => (
              <ThemeCard
                key={theme.id}
                theme={theme}
                isSelected={theme.id === selectedThemeId}
                onSelect={handleThemeSelect}
                isLoading={loadingThemeId === theme.id}
              />
            ))}
          </div>

          {/* Info section */}
          <div className="mt-12 pt-8 border-t border-gray-100">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="space-y-2">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Responsive</h4>
                <p className="text-sm text-gray-600">Todos los temas se adaptan perfectamente a móviles y tablets</p>
              </div>

              <div className="space-y-2">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Rápidos</h4>
                <p className="text-sm text-gray-600">Optimizados para cargar rápidamente y ofrecer la mejor experiencia</p>
              </div>

              <div className="space-y-2">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto">
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
                  </svg>
                </div>
                <h4 className="font-semibold text-gray-900">Personalizables</h4>
                <p className="text-sm text-gray-600">Puedes ajustar colores, logos y contenido según tu marca</p>
              </div>
            </div>
          </div>

          {/* Preview note */}
          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <div className="flex items-start">
              <svg className="w-5 h-5 text-amber-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div>
                <h4 className="text-sm font-medium text-amber-800">Imágenes de ejemplo</h4>
                <p className="text-sm text-amber-700 mt-1">
                  Las imágenes mostradas son ejemplos temporales. Una vez que agregues tus productos y contenido, 
                  verás cómo se ve realmente tu tienda con el tema seleccionado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
} 