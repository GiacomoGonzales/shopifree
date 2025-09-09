import React, { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '../../lib/hooks/useStore'
import { updateStoreField } from '../../lib/store'
import { availableThemes, DEFAULT_THEME_ID, isValidTheme } from '../../lib/themes/themes-list'
import ThemeCard from './ThemeCard'
import { Toast } from '../shared/Toast'
import { useToast } from '../../lib/hooks/useToast'

export default function ThemeGallery() {
  const t = useTranslations('storeDesign')
  const { store } = useStore()
  const { toast, showToast, hideToast } = useToast()
  const [selectedThemeId, setSelectedThemeId] = useState<string>(DEFAULT_THEME_ID)
  const [loadingThemeId, setLoadingThemeId] = useState<string | null>(null)

  // Update selectedThemeId when store data loads
  useEffect(() => {
    if (store?.theme) {
      setSelectedThemeId(store.theme)
    }
  }, [store?.theme])


  const handleThemeSelect = async (themeId: string) => {
    // Evitar seleccionar el tema actual
    if (themeId === selectedThemeId) {
      showToast(t('notifications.alreadySelected'), 'success')
      return
    }

    // Validaciones
    if (!store?.id) {
      showToast(t('notifications.storeNotFound'), 'error')
      return
    }

    if (loadingThemeId) {
      return // Evitar múltiples actualizaciones simultáneas
    }

    if (!isValidTheme(themeId)) {
      showToast(t('notifications.invalidTheme'), 'error')
      return
    }

    try {
      setLoadingThemeId(themeId)

      // Actualizar inmediatamente el estado local para el UI
      setSelectedThemeId(themeId)

      // Mostrar notificación de proceso
      showToast(t('notifications.applying'), 'success')

      // Actualizar en Firestore
      await updateStoreField(store.id, 'theme', themeId)

      // Obtener información del tema seleccionado
      const selectedTheme = availableThemes.find(theme => theme.id === themeId)
      const themeName = selectedTheme ? t(`sections.themes.themesList.${selectedTheme.translationKey}.name`) : 'el tema seleccionado'

      // Mostrar mensaje de éxito
      showToast(t('notifications.success', { themeName }), 'success')
      
    } catch (error) {
      console.error('Error al actualizar el tema:', error)
      
      // Revertir el estado local si hay error
      setSelectedThemeId(store?.theme || DEFAULT_THEME_ID)
      
      showToast(t('notifications.error'), 'error')
    } finally {
      setLoadingThemeId(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h3 className="text-lg font-medium text-gray-900">{t('sections.themes.gallery.title')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('sections.themes.gallery.description')}</p>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Grid de temas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {availableThemes.map((theme) => (
          <ThemeCard
            key={theme.id}
            theme={theme}
            isSelected={theme.id === selectedThemeId}
            isLoading={theme.id === loadingThemeId}
            onSelect={() => handleThemeSelect(theme.id)}
          />
        ))}
      </div>
    </div>
  )
} 