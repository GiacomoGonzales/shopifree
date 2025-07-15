import Image from 'next/image'
import { Theme } from '../../lib/themes/theme-types'
import { useState } from 'react'

interface ThemeCardProps {
  theme: Theme
  isSelected: boolean
  onSelect: (themeId: string) => void
  isLoading?: boolean
}

export default function ThemeCard({ theme, isSelected, onSelect, isLoading }: ThemeCardProps) {
  const [imageLoaded, setImageLoaded] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <div
      className={`
        group relative rounded-xl border-2 transition-all duration-300 cursor-pointer overflow-hidden
        ${isSelected 
          ? 'border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100' 
          : 'border-gray-200 hover:border-gray-300 hover:shadow-md bg-white'
        }
        ${isLoading ? 'pointer-events-none opacity-60' : ''}
      `}
      onClick={() => !isLoading && onSelect(theme.id)}
    >
      {/* Selected indicator badge */}
      {isSelected && (
        <div className="absolute top-3 right-3 z-10">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
            Seleccionado
          </div>
        </div>
      )}

      {/* Recommended badge */}
      {theme.recommended && !isSelected && (
        <div className="absolute top-3 left-3 z-10">
          <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            ⭐ Recomendado
          </div>
        </div>
      )}

      {/* Preview Image Container */}
      <div className="relative h-56 w-full overflow-hidden bg-gray-100">
        {/* Loading placeholder */}
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-3 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="w-16 h-2 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        )}

        {/* Error placeholder */}
        {imageError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-lg mx-auto mb-2 flex items-center justify-center">
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-xs text-gray-500">Vista previa</p>
            </div>
          </div>
        )}

        {/* Actual Image */}
        {!imageError && (
          <Image
            src={theme.preview}
            alt={`Vista previa del tema ${theme.nombre}`}
            fill
            className={`
              object-cover transition-all duration-500
              ${imageLoaded ? 'opacity-100' : 'opacity-0'}
              ${isSelected ? 'scale-105' : 'group-hover:scale-105'}
            `}
            onLoad={() => setImageLoaded(true)}
            onError={(e) => {
              console.warn(`Failed to load theme preview: ${theme.preview}`)
              setImageError(true)
              setImageLoaded(false)
            }}
            priority={isSelected} // Prioridad para el tema seleccionado
          />
        )}
        
        {/* Overlay gradiente para mejor legibilidad */}
        <div className={`
          absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent 
          transition-opacity duration-300
          ${imageLoaded ? 'opacity-0 group-hover:opacity-100' : 'opacity-0'}
        `} />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <h3 className={`
              text-lg font-semibold transition-colors duration-200
              ${isSelected ? 'text-blue-900' : 'text-gray-900 group-hover:text-gray-700'}
            `}>
              {theme.nombre}
            </h3>
            <p className={`
              mt-1 text-sm leading-relaxed
              ${isSelected ? 'text-blue-700' : 'text-gray-600'}
            `}>
              {theme.descripcion}
            </p>
          </div>
        </div>

        {/* Features list */}
        {theme.features && theme.features.length > 0 && (
          <div className="mt-4">
            <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
              Características
            </h4>
            <div className="flex flex-wrap gap-1">
              {theme.features.slice(0, 4).map((feature, index) => (
                <span 
                  key={index} 
                  className={`
                    inline-flex items-center px-2 py-1 rounded-md text-xs font-medium
                    ${isSelected 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-gray-100 text-gray-700'
                    }
                  `}
                >
                  {feature}
                </span>
              ))}
              {theme.features.length > 4 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                  +{theme.features.length - 4} más
                </span>
              )}
            </div>
          </div>
        )}

        {/* Color palette preview */}
        {theme.colors && (
          <div className="mt-4">
            <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
              Colores
            </h4>
            <div className="flex space-x-2">
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.colors.primary }}
                title="Color primario"
              />
              <div 
                className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                style={{ backgroundColor: theme.colors.secondary }}
                title="Color secundario"
              />
            </div>
          </div>
        )}

        {/* Action button */}
        <div className="mt-5 pt-4 border-t border-gray-100">
          <button
            className={`
              w-full py-2 px-4 rounded-lg text-sm font-medium transition-all duration-200
              ${isSelected
                ? 'bg-blue-500 text-white shadow-sm'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 group-hover:bg-blue-50 group-hover:text-blue-700'
              }
              ${isLoading ? 'cursor-not-allowed' : 'cursor-pointer'}
            `}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Aplicando...
              </div>
            ) : isSelected ? (
              'Tema Actual'
            ) : (
              'Seleccionar Tema'
            )}
          </button>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
          <div className="text-center">
            <svg className="animate-spin h-8 w-8 text-blue-500 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <p className="text-sm text-gray-600 mt-2">Aplicando tema...</p>
          </div>
        </div>
      )}
    </div>
  )
} 