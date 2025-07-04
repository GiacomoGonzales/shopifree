import { useStore } from '../../lib/hooks/useStore'
import { availableThemes, DEFAULT_THEME_ID, isValidTheme } from '../../lib/themes/themes-list'
import { updateStoreField } from '../../lib/store'
import ThemeCard from './ThemeCard'
import { useState } from 'react'

export default function ThemeGallery() {
  const { store } = useStore()
  const [isUpdating, setIsUpdating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const currentThemeId = store?.theme || DEFAULT_THEME_ID

  const handleThemeSelect = async (themeId: string) => {
    // Validaciones
    if (!store?.id) {
      setError('No se encontró la tienda')
      return
    }

    if (isUpdating) {
      return // Evitar múltiples actualizaciones simultáneas
    }

    if (!isValidTheme(themeId)) {
      setError('Tema no válido')
      return
    }

    try {
      setIsUpdating(true)
      setError(null)

      // Actualizar en Firestore
      await updateStoreField(store.id, 'theme', themeId)

      // Opcional: Mostrar mensaje de éxito
      console.log('Tema actualizado correctamente:', themeId)
      
    } catch (error) {
      console.error('Error al actualizar el tema:', error)
      setError('Error al actualizar el tema. Por favor, intenta de nuevo.')
    } finally {
      setIsUpdating(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow mt-6">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Galería de temas</h4>
        <p className="text-sm text-gray-500 mb-6">
          Explora y selecciona entre los temas disponibles para tu tienda.
        </p>

        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative" role="alert">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {/* Grid de temas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableThemes.map(theme => (
            <ThemeCard
              key={theme.id}
              theme={theme}
              isSelected={theme.id === currentThemeId}
              onSelect={handleThemeSelect}
            />
          ))}
        </div>

        {/* Loading state */}
        {isUpdating && (
          <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 