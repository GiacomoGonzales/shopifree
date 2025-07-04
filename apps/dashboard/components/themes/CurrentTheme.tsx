import Image from 'next/image'
import { useStore } from '../../lib/hooks/useStore'
import { getThemeById, DEFAULT_THEME_ID } from '../../lib/themes/themes-list'

export default function CurrentTheme() {
  const { store } = useStore()
  const currentThemeId = store?.theme || DEFAULT_THEME_ID
  const currentTheme = getThemeById(currentThemeId)

  if (!currentTheme) return null

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Tema actual</h4>
        <p className="text-sm text-gray-500 mb-6">
          Este es el tema que está actualmente aplicado a tu tienda.
        </p>

        <div className="rounded-lg border border-gray-200 overflow-hidden">
          {/* Preview Image */}
          <div className="relative h-64 w-full">
            <Image
              src={currentTheme.preview}
              alt={`Preview de ${currentTheme.nombre}`}
              fill
              className="object-cover"
            />
          </div>

          {/* Theme Info */}
          <div className="p-4 bg-gray-50">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-medium text-gray-900">
                  {currentTheme.nombre}
                </h3>
                <p className="mt-1 text-sm text-gray-500">
                  {currentTheme.descripcion}
                </p>
              </div>

              {/* Active indicator */}
              <div className="ml-2 flex-shrink-0">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  Activo
                </span>
              </div>
            </div>

            {/* Features list */}
            {currentTheme.features && currentTheme.features.length > 0 && (
              <div className="mt-4 border-t border-gray-200 pt-4">
                <h4 className="text-sm font-medium text-gray-900 mb-2">
                  Características
                </h4>
                <ul className="grid grid-cols-2 gap-2">
                  {currentTheme.features.map((feature, index) => (
                    <li key={index} className="text-sm text-gray-500 flex items-center">
                      <svg className="h-4 w-4 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 