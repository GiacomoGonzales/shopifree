import Image from 'next/image'
import { useTranslations } from 'next-intl'
import { useStore } from '../../lib/hooks/useStore'
import { getThemeById, DEFAULT_THEME_ID } from '../../lib/themes/themes-list'

export default function CurrentTheme() {
  const t = useTranslations('pages.storeDesign.sections.themes.currentTheme')
  const { store } = useStore()
  const currentThemeId = store?.theme || DEFAULT_THEME_ID
  const currentTheme = getThemeById(currentThemeId)

  if (!currentTheme) return null

  const themeT = useTranslations(`pages.storeDesign.sections.themes.themesList.${currentTheme.translationKey}`)
  const features = Object.values(themeT.raw('features') as Record<string, string>)

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2">{t('title')}</h3>
          <p className="text-gray-600">
            {t('description')}
          </p>
        </div>

        {/* Current Theme Card */}
        <div className="mb-6">
          <div className="relative rounded-xl border-2 border-blue-500 bg-blue-50 shadow-lg ring-4 ring-blue-100 overflow-hidden">
            {/* Active Badge */}
            <div className="absolute top-3 right-3 z-10">
              <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500 text-white shadow-sm">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                {t('active')}
              </div>
            </div>

            {/* Recommended badge if applicable */}
            {currentTheme.recommended && (
              <div className="absolute top-3 left-3 z-10">
                <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                  {t('recommended')}
                </div>
              </div>
            )}

            {/* Preview Image */}
            <div className="relative h-48 w-full overflow-hidden">
              <Image
                src={currentTheme.preview}
                alt={`${t('preview')} ${themeT('name')}`}
                fill
                className="object-cover transform scale-105"
                onError={(e) => {
                  console.warn(`Failed to load current theme preview: ${currentTheme.preview}`)
                  // Fallback to placeholder
                  const target = e.target as HTMLImageElement;
                  target.src = '/themes/placeholder-theme.svg';
                }}
              />
            </div>

            {/* Content */}
            <div className="p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-semibold text-blue-900 mb-2">
                  {themeT('name')}
                </h3>
                <p className="text-sm text-blue-700 leading-relaxed">
                  {themeT('description')}
                </p>
              </div>

              {/* Features */}
              {features.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    {t('features')}
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {features.slice(0, 4).map((feature, index) => (
                      <span 
                        key={index} 
                        className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {feature}
                      </span>
                    ))}
                    {features.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-500">
                        {t('moreFeatures', { count: features.length - 4 })}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Color palette */}
              {currentTheme.colors && (
                <div className="mb-4">
                  <h4 className="text-xs font-medium text-gray-700 uppercase tracking-wide mb-2">
                    {t('colors')}
                  </h4>
                  <div className="flex justify-center space-x-2">
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: currentTheme.colors.primary }}
                      title={t('primaryColor')}
                    />
                    <div 
                      className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                      style={{ backgroundColor: currentTheme.colors.secondary }}
                      title={t('secondaryColor')}
                    />
                  </div>
                </div>
              )}

              {/* Current status */}
              <div className="pt-4 border-t border-blue-100">
                <div className="w-full py-2 px-4 rounded-lg text-sm font-medium bg-blue-500 text-white text-center">
                  {t('currentlyApplied')}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Info box */}
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-blue-800">{t('changeTheme.title')}</h4>
              <p className="text-sm text-blue-700 mt-1">
                {t('changeTheme.description')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 