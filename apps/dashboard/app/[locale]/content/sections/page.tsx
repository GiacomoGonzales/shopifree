'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import { useStore } from '../../../../lib/hooks/useStore'
import { updateStoreSections, DEFAULT_SECTIONS_CONFIG, StoreSectionsConfig } from '../../../../lib/store'
import { Toast } from '../../../../components/shared/Toast'
import { useToast } from '../../../../lib/hooks/useToast'
import { 
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import DashboardLayout from '../../../../components/DashboardLayout'
import { ContentTabs } from '../../../../components/content/ContentTabs'

// Tipo para las secciones
interface Section {
  id: string
  enabled: boolean
  order: number
  locked?: boolean
}

// Componente para cada sección sortable
function SortableSection({ 
  section, 
  onToggle 
}: { 
  section: Section & { title: string; description: string }
  onToggle: (id: string) => void 
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: section.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between p-4 bg-gray-50 rounded-lg border ${
        section.locked ? 'opacity-50' : ''
      } ${isDragging ? 'z-50 shadow-lg' : ''}`}
    >
      {/* Handle de drag */}
      <div className="flex items-center flex-1">
        <div
          {...attributes}
          {...listeners}
          className={`mr-3 p-1 rounded ${section.locked ? 'cursor-not-allowed' : 'cursor-grab active:cursor-grabbing'} hover:bg-gray-200 transition-colors`}
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            className="text-gray-500"
          >
            <path
              d="M8 6h.01M8 10h.01M8 14h.01M8 18h.01M16 6h.01M16 10h.01M16 14h.01M16 18h.01"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
          </svg>
        </div>
        
        <div className="flex-1">
          <h6 className="font-medium text-gray-900">{section.title}</h6>
          <p className="text-sm text-gray-600 mt-1">{section.description}</p>
          {section.locked && (
            <p className="text-xs text-gray-500 mt-1 italic">Esta sección siempre está activa</p>
          )}
        </div>
      </div>

      {/* Switch */}
      <div className="flex items-center">
        <div 
          className={`relative inline-flex items-center ${section.locked ? 'cursor-not-allowed opacity-75' : 'cursor-pointer'}`}
          onClick={() => !section.locked && onToggle(section.id)}
        >
          <div className={`w-11 h-6 ${section.enabled ? 'bg-blue-600' : 'bg-gray-200'} rounded-full relative transition-colors duration-200`}>
            <div className={`absolute top-[2px] ${section.enabled ? 'right-[2px]' : 'left-[2px]'} bg-white border border-gray-300 rounded-full h-5 w-5 transition-transform duration-200`}></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function ContentSectionsPage() {
  const t = useTranslations('content')
  const params = useParams()
  const locale = params?.locale || 'es'
  const { store, loading } = useStore()
  const { toast, showToast, hideToast } = useToast()

  // Estado inicial de las secciones - cargar desde store o usar default
  const [sections, setSections] = useState<Section[]>(() => {
    const storeConfig = store?.sections || DEFAULT_SECTIONS_CONFIG
    console.log('🔍 [Dashboard] Estado inicial sections - store?.sections:', store?.sections)
    console.log('🔍 [Dashboard] Estado inicial sections - storeConfig:', storeConfig)
    console.log('🔍 [Dashboard] Estado inicial sections - store?.id:', store?.id)

    const initialSections = [
      { id: 'hero', enabled: storeConfig.hero?.enabled !== false, order: storeConfig.hero?.order || 1 },
      { id: 'categories', enabled: storeConfig.categories?.enabled !== false, order: storeConfig.categories?.order || 2 },
      { id: 'collections', enabled: storeConfig.collections?.enabled === true, order: storeConfig.collections?.order || 3 },
      { id: 'carousel', enabled: storeConfig.carousel?.enabled !== false, order: storeConfig.carousel?.order || 4 },
      { id: 'newsletter', enabled: storeConfig.newsletter?.enabled === true, order: storeConfig.newsletter?.order || 5 },
      { id: 'brands', enabled: storeConfig.brands?.enabled === true, order: storeConfig.brands?.order || 6 },
      { id: 'products', enabled: true, order: 7, locked: true },
    ]

    console.log('🔍 [Dashboard] Estado inicial sections - initialSections:', initialSections)
    return initialSections
  })

  const [saving, setSaving] = useState(false)

  // Actualizar secciones cuando se carga el store
  useEffect(() => {
    if (store?.sections) {
      console.log('🔄 [Dashboard] Store cargado, actualizando sections con:', store.sections)

      const updatedSections = [
        { id: 'hero', enabled: store.sections.hero?.enabled !== false, order: store.sections.hero?.order || 1 },
        { id: 'categories', enabled: store.sections.categories?.enabled !== false, order: store.sections.categories?.order || 2 },
        { id: 'collections', enabled: store.sections.collections?.enabled === true, order: store.sections.collections?.order || 3 },
        { id: 'carousel', enabled: store.sections.carousel?.enabled !== false, order: store.sections.carousel?.order || 4 },
        { id: 'newsletter', enabled: store.sections.newsletter?.enabled === true, order: store.sections.newsletter?.order || 5 },
        { id: 'brands', enabled: store.sections.brands?.enabled === true, order: store.sections.brands?.order || 6 },
        { id: 'products', enabled: true, order: 7, locked: true },
      ]

      console.log('🔄 [Dashboard] Sections actualizadas a:', updatedSections)
      setSections(updatedSections)
    }
  }, [store?.sections])

  // Configuración de sensores para drag and drop
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Manejar el final del drag
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      setSections((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id)
        const newIndex = items.findIndex((item) => item.id === over?.id)

        const newItems = arrayMove(items, oldIndex, newIndex)
        
        // Actualizar el orden
        return newItems.map((item, index) => ({
          ...item,
          order: index + 1
        }))
      })
    }
  }

  // Manejar toggle de secciones
  const handleToggle = (id: string) => {
    console.log('🔄 [Dashboard] Toggle section:', id)
    setSections(sections.map(section =>
      section.id === id
        ? { ...section, enabled: !section.enabled }
        : section
    ))
  }

  // Guardar configuración en Firestore
  const handleSave = async () => {
    console.log('💾 [Dashboard] Intentando guardar configuración...')
    console.log('💾 [Dashboard] store?.id:', store?.id)
    console.log('💾 [Dashboard] sections actual:', sections)

    if (!store?.id) {
      console.error('❌ [Dashboard] No hay store.id disponible')
      showToast('Error: No se encontró la tienda', 'error')
      return
    }

    setSaving(true)
    try {
      // Convertir a formato StoreSectionsConfig
      const sectionsConfig: StoreSectionsConfig = {}
      sections.forEach(section => {
        if (section.id !== 'products') { // products no se configura
          sectionsConfig[section.id as keyof StoreSectionsConfig] = {
            enabled: section.enabled,
            order: section.order
          }
        }
      })

      console.log('💾 [Dashboard] sectionsConfig a guardar:', sectionsConfig)
      await updateStoreSections(store.id, sectionsConfig)
      console.log('✅ [Dashboard] Configuración guardada exitosamente')
      showToast('Configuración guardada exitosamente', 'success')
    } catch (error) {
      console.error('❌ [Dashboard] Error saving sections:', error)
      showToast('Error al guardar la configuración', 'error')
    } finally {
      setSaving(false)
    }
  }

  // Obtener información de las secciones
  const getSectionInfo = (id: string) => {
    const sectionInfoMap: Record<string, { title: string; description: string }> = {
      hero: {
        title: t('sections.home.hero.title'),
        description: t('sections.home.hero.description')
      },
      categories: {
        title: t('sections.home.categories.title'),
        description: t('sections.home.categories.description')
      },
      newsletter: {
        title: t('sections.home.newsletter.title'),
        description: t('sections.home.newsletter.description')
      },
      brands: {
        title: t('sections.home.brands.title'),
        description: t('sections.home.brands.description')
      },
      collections: {
        title: t('sections.home.collections.title'),
        description: t('sections.home.collections.description')
      },
      carousel: {
        title: 'Carrusel de imágenes',
        description: 'Carrusel de imágenes adicionales que se muestra después de los productos'
      },
      promotional: {
        title: t('sections.home.promotional.title'),
        description: t('sections.home.promotional.description')
      },
      products: {
        title: t('sections.home.products.title'),
        description: t('sections.home.products.description')
      }
    }
    
    return sectionInfoMap[id] || { title: id, description: '' }
  }

  // Mostrar loading mientras se carga el store
  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Navegación por pestañas */}
            <ContentTabs currentTab="sections" />

            {/* Loading estado */}
            <div className="bg-white rounded-lg shadow">
              <div className="p-6">
                <div className="animate-pulse">
                  <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-6"></div>
                  <div className="space-y-3">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center flex-1">
                          <div className="w-4 h-4 bg-gray-300 rounded mr-3"></div>
                          <div className="flex-1">
                            <div className="h-4 bg-gray-300 rounded w-1/3 mb-2"></div>
                            <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                          </div>
                        </div>
                        <div className="w-11 h-6 bg-gray-300 rounded-full"></div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Navegación por pestañas */}
          <ContentTabs currentTab="sections" />

          {/* Contenido */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h4 className="text-lg font-medium text-gray-900 mb-4">{t('sections.title')}</h4>
              <p className="text-sm text-gray-500 mb-6">
                {t('sections.description')}
              </p>
              
              {/* Sección: Página de Inicio */}
              <div className="mb-8">
                <h5 className="text-md font-semibold text-gray-800 mb-4 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2v0a2 2 0 012-2h12a2 2 0 012 2v0" />
                  </svg>
                  {t('sections.home.title')}
                </h5>
                
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-sm text-blue-800">
                    <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Arrastra las secciones para cambiar su orden de aparición en la tienda
                  </p>
                </div>
                
                <DndContext 
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext 
                    items={sections.map(s => s.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-3">
                      {sections.map((section) => {
                        const sectionInfo = getSectionInfo(section.id)
                        return (
                          <SortableSection
                            key={section.id}
                            section={{ ...section, ...sectionInfo }}
                            onToggle={handleToggle}
                          />
                        )
                      })}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
              
              {/* Botones de acción */}
              <div className="border-t pt-6">
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving || !store?.id}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
                  >
                    {saving ? (
                      <svg className="w-4 h-4 mr-2 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    ) : (
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                    {saving ? 'Guardando...' : t('sections.actions.save')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </DashboardLayout>
  )
}
