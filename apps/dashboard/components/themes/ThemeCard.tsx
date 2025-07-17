import React from 'react'
import { useTranslations } from 'next-intl'
import { Theme } from '../../lib/themes/theme-types'

interface ThemeCardProps {
  theme: Theme
  isSelected: boolean
  isLoading: boolean
  onSelect: () => void
}

export default function ThemeCard({ theme, isSelected, isLoading, onSelect }: ThemeCardProps) {
  const t = useTranslations('storeDesign.sections.themes')
  const themeT = useTranslations(`storeDesign.sections.themes.themesList.${theme.translationKey}`)

  // Get features from translations
  const features = Object.entries(themeT.raw('features') as Record<string, string>)

  return (
    <div className={`
      relative rounded-lg border overflow-hidden transition-all duration-200
      ${isSelected ? 'border-gray-900 shadow-lg' : 'border-gray-200 hover:border-gray-300'}
    `}>
      {/* Imagen de vista previa */}
      <div className="aspect-video relative">
        <img
          src={theme.preview}
          alt={themeT('name')}
          className="w-full h-full object-cover"
        />
        {isSelected && (
          <div className="absolute top-2 right-2">
            <span className="bg-gray-900 text-white text-xs px-2 py-1 rounded-full">
              {t('gallery.selected')}
            </span>
          </div>
        )}
        {theme.recommended && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full">
              {t('gallery.recommended')}
            </span>
          </div>
        )}
      </div>

      {/* Información del tema */}
      <div className="p-4">
        <h3 className="text-lg font-medium text-gray-900 mb-1">
          {themeT('name')}
        </h3>
        <p className="text-sm text-gray-500 mb-4">
          {themeT('description')}
        </p>

        {/* Características */}
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">
            {t('gallery.features')}
          </h4>
          <ul className="space-y-1">
            {features.slice(0, 3).map(([key, value]) => (
              <li key={key} className="text-sm text-gray-600 flex items-center">
                <svg className="w-4 h-4 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {value}
              </li>
            ))}
            {features.length > 3 && (
              <li className="text-sm text-gray-500">
                {t('gallery.moreFeatures', { count: features.length - 3 })}
              </li>
            )}
          </ul>
        </div>

        {/* Colores */}
        {theme.colors && (
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              {t('gallery.colors')}
            </h4>
            <div className="flex space-x-4">
              <div>
                <div
                  className="w-6 h-6 rounded-full mb-1"
                  style={{ backgroundColor: theme.colors.primary }}
                />
                <span className="text-xs text-gray-500">{t('gallery.primaryColor')}</span>
              </div>
              <div>
                <div
                  className="w-6 h-6 rounded-full mb-1"
                  style={{ backgroundColor: theme.colors.secondary }}
                />
                <span className="text-xs text-gray-500">{t('gallery.secondaryColor')}</span>
              </div>
            </div>
          </div>
        )}

        {/* Botón de selección */}
        <div className="mt-4">
          <button
            onClick={onSelect}
            disabled={isLoading || isSelected}
            className={`
              w-full py-2 px-4 rounded-md text-sm font-medium
              ${isSelected
                ? 'bg-gray-100 text-gray-500 cursor-not-allowed'
                : 'bg-gray-900 text-white hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900'
              }
            `}
          >
            {isLoading ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                {t('gallery.applying')}
              </span>
            ) : isSelected ? (
              t('gallery.currentTheme')
            ) : (
              t('gallery.selectTheme')
            )}
          </button>
        </div>
      </div>
    </div>
  )
} 