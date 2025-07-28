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
  const t = useTranslations('storeDesign')
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
              {t('sections.themes.gallery.selected')}
            </span>
          </div>
        )}
        {theme.recommended && (
          <div className="absolute top-2 left-2">
            <span className="bg-yellow-400 text-gray-900 text-xs px-2 py-1 rounded-full">
              {t('sections.themes.gallery.recommended')}
            </span>
          </div>
        )}
      </div>

      {/* Información del tema */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">{themeT('name')}</h4>
        </div>
        
        <p className="text-sm text-gray-600 mb-4">{themeT('description')}</p>

        {/* Características */}
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-900 mb-2 uppercase tracking-wider">
            {t('sections.themes.gallery.features')}
          </h5>
          <div className="space-y-1">
            {features.slice(0, 3).map(([key, value]) => (
              <div key={key} className="flex items-center text-xs text-gray-600">
                <div className="w-1 h-1 bg-green-500 rounded-full mr-2"></div>
                {value}
              </div>
            ))}
            {features.length > 3 && (
              <div className="text-xs text-gray-500">
                {t('sections.themes.gallery.moreFeatures', { count: features.length - 3 })}
              </div>
            )}
          </div>
        </div>

        {/* Colores */}
        <div className="mb-4">
          <h5 className="text-xs font-medium text-gray-900 mb-2 uppercase tracking-wider">
            {t('sections.themes.gallery.colors')}
          </h5>
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1">
              <div 
                className="w-4 h-4 rounded-full border border-gray-200" 
                style={{ backgroundColor: theme.colors.primary }}
              ></div>
              <span className="text-xs text-gray-500">{t('sections.themes.gallery.primaryColor')}</span>
            </div>
            <div className="flex items-center space-x-1">
              <div 
                className="w-4 h-4 rounded-full border border-gray-200" 
                style={{ backgroundColor: theme.colors.secondary }}
              ></div>
              <span className="text-xs text-gray-500">{t('sections.themes.gallery.secondaryColor')}</span>
            </div>
          </div>
        </div>

        {/* Botón de selección */}
        <button
          onClick={onSelect}
          disabled={isLoading}
          className={`
            w-full py-2 px-4 rounded-md text-sm font-medium transition-colors
            ${isSelected 
              ? 'bg-gray-100 text-gray-500 cursor-not-allowed' 
              : 'bg-gray-900 text-white hover:bg-gray-800'
            }
            ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}
          `}
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>{t('sections.themes.gallery.applying')}</span>
            </div>
          ) : isSelected ? (
            t('sections.themes.gallery.currentTheme')
          ) : (
            t('sections.themes.gallery.selectTheme')
          )}
        </button>
      </div>
    </div>
  )
} 