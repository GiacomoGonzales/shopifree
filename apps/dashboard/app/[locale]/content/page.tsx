'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../components/DashboardLayout'
import FilterManager from '../../../components/store-design/FilterManager'

type Section = 'pages' | 'filters'

export default function ContentPage() {
  const t = useTranslations('content')
  const [currentSection, setCurrentSection] = useState<Section>('pages')

  const tabs = [
    { 
      name: t('tabs.pages'),
      id: 'pages' as Section
    },
    { 
      name: t('tabs.filters'),
      id: 'filters' as Section
    }
  ]

  const renderContent = () => {
    switch (currentSection) {
      case 'pages':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{t('pages.title')}</h4>
              <p className="text-sm text-gray-500 mb-4">
                {t('pages.description')}
              </p>
              {/* Aquí irá la lista de páginas configurables */}
            </div>
          </div>
        )

      case 'filters':
        return <FilterManager />

      default:
        return null
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {t('title')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t('subtitle')}
              </p>
            </div>
          </div>

          {/* Navegación por pestañas - Carrusel horizontal */}
          <div className="border-b border-gray-200 mt-6">
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