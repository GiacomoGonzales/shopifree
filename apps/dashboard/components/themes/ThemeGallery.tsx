import { useStore } from '../../lib/hooks/useStore'
import { useTranslations } from 'next-intl'
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
  const t = useTranslations('pages.storeDesign.sections.themes')
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
      showNotification('info', t('notifications.alreadySelected'))
      return
    }

    // Validaciones
    if (!store?.id) {
      showNotification('error', t('notifications.storeNotFound'))
      return
    }

    if (loadingThemeId) {
      return // Evitar múltiples actualizaciones simultáneas
    }

    if (!isValidTheme(themeId)) {
      showNotification('error', t('notifications.invalidTheme'))
      return
    }

    try {
      setLoadingThemeId(themeId)

      // Actualizar inmediatamente el estado local para el UI
      setSelectedThemeId(themeId)

      // Mostrar notificación de proceso
      showNotification('info', t('notifications.applying'))

      // Actualizar en Firestore
      await updateStoreField(store.id, 'theme', themeId)

      // Obtener información del tema seleccionado
      const selectedTheme = availableThemes.find(theme => theme.id === themeId)
      const themeT = useTranslations(`pages.storeDesign.sections.themes.themesList.${selectedTheme?.translationKey}`)
      const themeName = themeT ? themeT('name') : 'el tema seleccionado'

      // Mostrar mensaje de éxito
      showNotification('success', t('notifications.success', { themeName }))
      
    } catch (error) {
      console.error('Error al actualizar el tema:', error)
      
      // Revertir el estado local si hay error
      setSelectedThemeId(store?.theme || DEFAULT_THEME_ID)
      
      showNotification('error', t('notifications.error'))
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
              {t('gallery.title')}
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto leading-relaxed">
              {t('gallery.description')}
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


        </div>
      </div>
    </>
  )
} 