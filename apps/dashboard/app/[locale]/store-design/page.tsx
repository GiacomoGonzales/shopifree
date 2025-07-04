'use client'

import DashboardLayout from '../../../components/DashboardLayout'
import { useState } from 'react'
import CurrentTheme from '../../../components/themes/CurrentTheme'
import ThemeGallery from '../../../components/themes/ThemeGallery'

type Section = 'logo-colors' | 'pages' | 'banners' | 'filters' | 'themes'

export default function StoreDesignPage() {
  const [currentSection, setCurrentSection] = useState<Section>('logo-colors')

  const tabs = [
    { 
      name: 'Logo y colores',
      id: 'logo-colors' as Section
    },
    { 
      name: 'Páginas',
      id: 'pages' as Section
    },
    { 
      name: 'Banners y secciones',
      id: 'banners' as Section
    },
    { 
      name: 'Filtros',
      id: 'filters' as Section
    },
    { 
      name: 'Temas',
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
                <h4 className="text-lg font-medium text-gray-900 mb-4">Logo</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Sube el logo de tu tienda. Recomendamos una imagen PNG con fondo transparente.
                </p>
                {/* Aquí irá el componente de subida de logo */}
              </div>
            </div>

            {/* Sección de Colores */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Colores</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Personaliza los colores principales de tu tienda.
                </p>
                {/* Aquí irán los selectores de color */}
              </div>
            </div>
          </div>
        )
      
      case 'pages':
        return (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">Páginas disponibles</h4>
              <p className="text-sm text-gray-500 mb-4">
                Personaliza el contenido y la visibilidad de las páginas de tu tienda.
              </p>
              {/* Aquí irá la lista de páginas configurables */}
            </div>
          </div>
        )

      case 'banners':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Banners principales</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Gestiona los banners que se mostrarán en la página principal de tu tienda.
                </p>
                {/* Aquí irá el gestor de banners */}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Secciones personalizadas</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Añade y personaliza secciones adicionales para tu tienda.
                </p>
                {/* Aquí irá el gestor de secciones */}
              </div>
            </div>
          </div>
        )

      case 'filters':
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Filtros disponibles</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Configura los filtros que tus clientes podrán usar para encontrar productos.
                </p>
                {/* Aquí irá la configuración de filtros */}
              </div>
            </div>

            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <h4 className="text-lg font-medium text-gray-900 mb-4">Orden de visualización</h4>
                <p className="text-sm text-gray-500 mb-4">
                  Organiza el orden en que se mostrarán los filtros en tu tienda.
                </p>
                {/* Aquí irá el ordenador de filtros */}
              </div>
            </div>
          </div>
        )

      case 'themes':
        return (
          <div className="space-y-6">
            <CurrentTheme />
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
          {/* Navegación por pestañas */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCurrentSection(tab.id)}
                  className={`
                    whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm
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

          {/* Contenedor principal */}
          <div className="mt-6">
            {renderContent()}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 