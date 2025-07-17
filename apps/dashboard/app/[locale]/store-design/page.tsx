'use client'

import DashboardLayout from '../../../components/DashboardLayout'
import { useState } from 'react'
import { useTranslations } from 'next-intl'
import ThemeGallery from '../../../components/themes/ThemeGallery'
import HeroImageUpload from '../../../components/store-design/HeroImageUpload'
import CarouselImagesUpload from '../../../components/store-design/CarouselImagesUpload'

type Section = 'logo-colors' | 'banners' | 'themes'

export default function StoreDesignPage() {
  const t = useTranslations('storeDesign')
  const [currentSection, setCurrentSection] = useState<Section>('logo-colors')

  const tabs = [
    { 
      name: t('tabs.logoColors'),
      id: 'logo-colors' as Section
    },
    { 
      name: t('tabs.banners'),
      id: 'banners' as Section
    },
    { 
      name: t('tabs.themes'),
      id: 'themes' as Section
    },
  ]

  const renderContent = () => {
    switch (currentSection) {
      case 'logo-colors':
        return (
          <div className="space-y-6">
            {/* Sección de Logo */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">{t('sections.logo.title')}</h4>
                <p className="text-sm text-gray-500 mb-4">
                  {t('sections.logo.description')}
                </p>
                {/* Aquí irá el componente de subida de logo */}
              </div>
            </div>

            {/* Sección de Colores */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">{t('sections.colors.title')}</h4>
                <p className="text-sm text-gray-500 mb-4">
                  {t('sections.colors.description')}
                </p>
                {/* Aquí irán los selectores de color */}
              </div>
            </div>
          </div>
        )

      case 'banners':
        return (
          <div className="space-y-6">
            {/* Imagen Hero */}
            <HeroImageUpload />

            <CarouselImagesUpload />

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">{t('sections.customSections.title')}</h4>
                <p className="text-sm text-gray-500 mb-4">
                  {t('sections.customSections.description')}
                </p>
                {/* Aquí irá el gestor de secciones */}
              </div>
            </div>
          </div>
        )

      case 'themes':
        return (
          <div>
            <ThemeGallery />
          </div>
        )

      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
            <p className="mt-1 text-sm text-gray-500">{t('description')}</p>
          </div>

          {/* Navegación por pestañas - Carrusel horizontal */}
          <div className="border-b border-gray-200">
            <div className="overflow-x-auto scrollbar-hide">
              <nav className="flex space-x-8 min-w-max" aria-label="Tabs">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setCurrentSection(tab.id)}
                    className={`
                      whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex-shrink-0
                      ${tab.id === currentSection
                        ? 'border-gray-900 text-gray-900'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }
                    `}
                  >
                    {tab.name}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenedor principal */}
          <div className="mt-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 