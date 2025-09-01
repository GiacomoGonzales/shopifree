'use client'

import { useState, useEffect } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useStore } from '../../lib/hooks/useStore'
import { 
  StoreFilterConfig, 
  extractFiltersFromProducts, 
  saveStoreFilters, 
  getStoreFilters
} from '../../lib/store-filters'

// Función para traducir opciones de filtros para mostrar en la UI
async function translateFilterOptions(fieldId: string, options: string[], language: 'es' | 'en' | 'pt' = 'es'): Promise<string[]> {
  try {
    // Cargar las traducciones de metadatos del dashboard
    const metadataMessages = await import(`../../messages/${language}/categories/metadata.json`)
    const translations = metadataMessages.default
    
    return options.map(option => {
      // Buscar la traducción de la opción usando la estructura: metadata.values.{fieldId}_options.{option}
      const translatedOption = translations?.metadata?.values?.[`${fieldId}_options`]?.[option]
      return translatedOption || option // Si no encuentra traducción, usar el original
    })
  } catch (error) {
    console.log(`❌ Error translating options for field "${fieldId}":`, error)
    return options // Fallback: devolver opciones originales
  }
}

interface FilterManagerProps {
  onFiltersChange?: (filters: StoreFilterConfig[]) => void
}

interface SortableFilterItemProps {
  filter: StoreFilterConfig
  onToggle: (filterId: string) => void
  saving: boolean
  translatedOptions?: string[]
}

function SortableFilterItem({ filter, onToggle, saving, translatedOptions }: SortableFilterItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: filter.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.8 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        isDragging ? 'shadow-lg z-10' : ''
      }`}
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
              title="Arrastra para reordenar"
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="2" cy="2" r="1"/>
                <circle cx="6" cy="2" r="1"/>
                <circle cx="2" cy="6" r="1"/>
                <circle cx="6" cy="6" r="1"/>
                <circle cx="2" cy="10" r="1"/>
                <circle cx="6" cy="10" r="1"/>
              </svg>
            </div>

            {/* Icono del filtro */}
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
            </div>

            {/* Información del filtro */}
            <div className="flex-1 mr-4">
                             <div className="flex items-center gap-2">
                 <h3 className="text-sm font-medium text-gray-900">
                   {filter.name}
                 </h3>
                 <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                   filter.type === 'tags' ? 'bg-blue-100 text-blue-800' :
                   filter.type === 'select' ? 'bg-green-100 text-green-800' :
                   filter.type === 'range' ? 'bg-purple-100 text-purple-800' :
                   'bg-gray-100 text-gray-800'
                 }`}>
                   {filter.type}
                 </span>
               </div>
              <p className="text-sm text-gray-500 mt-1 line-clamp-2 pr-8">
                {filter.options.length} opciones: {(translatedOptions || filter.options).slice(0, 3).join(', ')}
                {filter.options.length > 3 && '...'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Filtro activo • <span className="ml-1">{filter.productCount} productos</span>
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filter.visible}
                onChange={() => onToggle(filter.id)}
                className="rounded border-gray-300 text-black focus:ring-gray-500"
                disabled={saving}
              />
              <span className="ml-2 text-sm text-gray-700">Visible</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function FilterManager({ onFiltersChange }: FilterManagerProps) {
  const { store } = useStore()
  const [availableFilters, setAvailableFilters] = useState<StoreFilterConfig[]>([])
  const [translatedOptions, setTranslatedOptions] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px of movement required before dragging starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Load available filters on component mount
  useEffect(() => {
    if (store?.id) {
      loadFilters()
    }
  }, [store?.id])

  // Función para traducir opciones para mostrar en la UI del dashboard
  const translateOptionsForDisplay = async (filters: StoreFilterConfig[]) => {
    const storeLanguage = store?.advanced?.language || store?.language || 'es'
    const newTranslatedOptions: Record<string, string[]> = {}
    
    for (const filter of filters) {
      const translated = await translateFilterOptions(filter.id, filter.options, storeLanguage as 'es' | 'en' | 'pt')
      newTranslatedOptions[filter.id] = translated
    }
    
    setTranslatedOptions(newTranslatedOptions)
  }

  const loadFilters = async () => {
    if (!store?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // First try to load saved filters
      const savedFilters = await getStoreFilters(store.id)
      
      if (savedFilters.length > 0) {
        setAvailableFilters(savedFilters)
        
        // Traducir opciones para mostrar en la UI
        await translateOptionsForDisplay(savedFilters)
      } else {
        // If no saved filters, extract from products
        const extractedFilters = await extractFiltersFromProducts(store.id)
        setAvailableFilters(extractedFilters)
        
        // Traducir opciones para mostrar en la UI
        await translateOptionsForDisplay(extractedFilters)
      }
    } catch (err) {
      console.error('Error loading filters:', err)
      setError('Error al cargar los filtros')
    } finally {
      setLoading(false)
    }
  }



  // 🚀 Función combinada que actualiza filtros Y traduce todo
  const handleUpdateFiltersAndTranslate = async () => {
    if (!store?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Extract fresh filters from products (esto ya traduce nombres y opciones)
      const extractedFilters = await extractFiltersFromProducts(store.id)
      
      // Preserve visibility and order from existing filters
      const existingFiltersMap = new Map(availableFilters.map(f => [f.id, f]))
      
      const updatedFilters = extractedFilters.map((newFilter, index) => {
        const existingFilter = existingFiltersMap.get(newFilter.id)
        if (existingFilter) {
          return {
            ...newFilter,
            visible: existingFilter.visible,
            order: existingFilter.order
          }
        } else {
          return {
            ...newFilter,
            visible: true,
            order: availableFilters.length + index
          }
        }
      })
      
      // Sort by order to maintain consistency
      updatedFilters.sort((a, b) => a.order - b.order)

      setAvailableFilters(updatedFilters)
      await saveFilters(updatedFilters)
      
      // Traducir opciones para mostrar en la UI
      await translateOptionsForDisplay(updatedFilters)
      
      setSuccessMessage('Filtros actualizados y traducidos correctamente')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error updating and translating filters:', err)
      setError('Error al actualizar los filtros')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterToggle = async (filterId: string) => {
    const filterToToggle = availableFilters.find(f => f.id === filterId)
    if (!filterToToggle) return

    const isBecomingVisible = !filterToToggle.visible
    
    let updatedFilters: StoreFilterConfig[]
    
    if (isBecomingVisible) {
      // Filter is becoming visible - add it to the end of visible filters
      const visibleFilters = availableFilters.filter(f => f.visible && f.id !== filterId)
      const hiddenFilters = availableFilters.filter(f => !f.visible && f.id !== filterId)
      
      const newOrder = visibleFilters.length
      
      updatedFilters = [
        ...visibleFilters,
        { ...filterToToggle, visible: true, order: newOrder },
        ...hiddenFilters.map((filter, index) => ({
          ...filter,
          order: newOrder + 1 + index
        }))
      ]
    } else {
      // Filter is becoming hidden - remove from visible list and renumber
      const visibleFilters = availableFilters.filter(f => f.visible && f.id !== filterId)
      const hiddenFilters = availableFilters.filter(f => !f.visible && f.id !== filterId)
      
      // Renumber visible filters
      const reorderedVisible = visibleFilters.map((filter, index) => ({
        ...filter,
        order: index
      }))
      
      updatedFilters = [
        ...reorderedVisible,
        { ...filterToToggle, visible: false, order: reorderedVisible.length },
        ...hiddenFilters.map((filter, index) => ({
          ...filter,
          order: reorderedVisible.length + 1 + index
        }))
      ]
    }
    
    setAvailableFilters(updatedFilters)
    await saveFilters(updatedFilters)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    // Get visible filters sorted by current order
    const visibleFilters = availableFilters.filter(f => f.visible).sort((a, b) => a.order - b.order)
    const hiddenFilters = availableFilters.filter(f => !f.visible)
    
    const oldIndex = visibleFilters.findIndex(filter => filter.id === active.id)
    const newIndex = visibleFilters.findIndex(filter => filter.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    // Reorder the visible filters
    const reorderedVisible = arrayMove(visibleFilters, oldIndex, newIndex)

    // Update order values for visible filters
    const updatedVisible = reorderedVisible.map((filter, index) => ({
      ...filter,
      order: index
    }))

    // Assign higher order values to hidden filters to keep them at the end
    const updatedHidden = hiddenFilters.map((filter, index) => ({
      ...filter,
      order: updatedVisible.length + index
    }))

    // Combine all filters
    const updatedFilters = [...updatedVisible, ...updatedHidden]

    setAvailableFilters(updatedFilters)
    await saveFilters(updatedFilters)
  }

  const saveFilters = async (filters: StoreFilterConfig[]) => {
    if (!store?.id) return
    
    try {
      setSaving(true)
      setError(null)
      
      console.log('FilterManager: Saving filters...', filters.length)
      await saveStoreFilters(store.id, filters)
      
      if (onFiltersChange) {
        onFiltersChange(filters)
      }
      
      setSuccessMessage('Configuración guardada')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('FilterManager: Error saving filters:', err)
      const errorMessage = err instanceof Error 
        ? `Error al guardar: ${err.message}` 
        : 'Error al guardar la configuración'
      setError(errorMessage)
      
      // Mantener el error por más tiempo para que el usuario lo vea
      setTimeout(() => setError(null), 10000)
    } finally {
      setSaving(false)
    }
  }

  const getVisibleFilters = () => {
    return availableFilters.filter(filter => filter.visible).sort((a, b) => a.order - b.order)
  }

  const getHiddenFilters = () => {
    return availableFilters.filter(filter => !filter.visible)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        <span className="ml-3 text-gray-600">Cargando filtros...</span>
      </div>
    )
  }

  return (
    <div>
      {/* Header with unified action button */}
      <div className="flex justify-end space-x-3 mb-6">
        <button
          onClick={handleUpdateFiltersAndTranslate}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {loading ? 'Actualizando...' : 'Actualizar filtros'}
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="rounded-md bg-green-50 p-4 mb-6">
          <div className="flex">
            <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Lista de filtros */}
      <div>
        {availableFilters.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Sin filtros disponibles</h3>
            <p className="mt-1 text-sm text-gray-500">
              Agrega productos con metadatos para generar filtros automáticamente.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {/* Visible filters with drag & drop */}
            {getVisibleFilters().length > 0 && (
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={getVisibleFilters().map(f => f.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {getVisibleFilters().map((filter) => (
                    <SortableFilterItem
                      key={filter.id}
                      filter={filter}
                      onToggle={handleFilterToggle}
                      saving={saving}
                      translatedOptions={translatedOptions[filter.id]}
                    />
                  ))}
                </SortableContext>
              </DndContext>
            )}
            
            {/* Hidden filters (non-draggable) */}
            {getHiddenFilters().map((filter) => (
              <div key={filter.id} className="bg-white border rounded-lg shadow-sm opacity-75">
                <div className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      {/* Icono de oculto */}
                      <div className="w-5 h-5 flex items-center justify-center text-gray-300">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 104.243 4.243m0 0L16.536 16.536M14.12 14.12L16.536 16.536" />
                        </svg>
                      </div>

                      {/* Icono del filtro deshabilitado */}
                      <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                        <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                        </svg>
                      </div>

                      {/* Información del filtro */}
                      <div className="flex-1 mr-4">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-medium text-gray-500">
                            {filter.name}
                          </h3>
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                            {filter.type}
                          </span>
                        </div>
                        <p className="text-sm text-gray-400 mt-1 line-clamp-2 pr-8">
                          {filter.options.length} opciones: {(translatedOptions || filter.options).slice(0, 3).join(', ')}
                          {filter.options.length > 3 && '...'}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Filtro oculto • <span className="ml-1">{filter.productCount} productos</span>
                        </p>
                      </div>
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filter.visible}
                          onChange={() => handleFilterToggle(filter.id)}
                          className="rounded border-gray-300 text-black focus:ring-gray-500"
                          disabled={saving}
                        />
                        <span className="ml-2 text-sm text-gray-700">Visible</span>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Saving indicator */}
      {saving && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
            <span>Guardando...</span>
          </div>
        </div>
      )}
    </div>
  )
} 