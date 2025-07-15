'use client'

import { useState, useEffect } from 'react'
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd'
import { useStore } from '../../lib/hooks/useStore'
import { 
  StoreFilterConfig, 
  extractFiltersFromProducts, 
  saveStoreFilters, 
  getStoreFilters 
} from '../../lib/store-filters'

interface FilterManagerProps {
  onFiltersChange?: (filters: StoreFilterConfig[]) => void
}

export default function FilterManager({ onFiltersChange }: FilterManagerProps) {
  const { store } = useStore()
  const [availableFilters, setAvailableFilters] = useState<StoreFilterConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  // Load available filters on component mount
  useEffect(() => {
    if (store?.id) {
      loadFilters()
    }
  }, [store?.id])

  const loadFilters = async () => {
    if (!store?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // First try to load saved filters
      const savedFilters = await getStoreFilters(store.id)
      
      if (savedFilters.length > 0) {
        setAvailableFilters(savedFilters)
      } else {
        // If no saved filters, extract from products
        const extractedFilters = await extractFiltersFromProducts(store.id)
        setAvailableFilters(extractedFilters)
      }
    } catch (err) {
      console.error('Error loading filters:', err)
      setError('Error al cargar los filtros')
    } finally {
      setLoading(false)
    }
  }

  const handleRefreshFilters = async () => {
    if (!store?.id) return
    
    try {
      setLoading(true)
      setError(null)
      
      // Extract fresh filters from products
      const extractedFilters = await extractFiltersFromProducts(store.id)
      setAvailableFilters(extractedFilters)
      
      setSuccessMessage('Filtros actualizados desde los productos')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error refreshing filters:', err)
      setError('Error al actualizar los filtros')
    } finally {
      setLoading(false)
    }
  }

  const handleFilterToggle = async (filterId: string) => {
    const updatedFilters = availableFilters.map(filter => 
      filter.id === filterId 
        ? { ...filter, visible: !filter.visible, enabled: !filter.visible ? true : filter.enabled }
        : filter
    )
    
    setAvailableFilters(updatedFilters)
    await saveFilters(updatedFilters)
  }

  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return

    // Only reorder visible filters
    const visibleFilters = availableFilters.filter(f => f.visible).sort((a, b) => a.order - b.order)
    const hiddenFilters = availableFilters.filter(f => !f.visible)
    
    const reorderedVisible = Array.from(visibleFilters)
    const [reorderedItem] = reorderedVisible.splice(result.source.index, 1)
    reorderedVisible.splice(result.destination.index, 0, reorderedItem)

    // Update order for visible filters
    const updatedVisible = reorderedVisible.map((filter, index) => ({
      ...filter,
      order: index
    }))

    // Combine with hidden filters (keep their original order)
    const updatedFilters = [...updatedVisible, ...hiddenFilters]

    setAvailableFilters(updatedFilters)
    await saveFilters(updatedFilters)
  }

  const saveFilters = async (filters: StoreFilterConfig[]) => {
    if (!store?.id) return
    
    try {
      setSaving(true)
      setError(null)
      
      await saveStoreFilters(store.id, filters)
      
      if (onFiltersChange) {
        onFiltersChange(filters)
      }
      
      setSuccessMessage('Configuración guardada')
      setTimeout(() => setSuccessMessage(null), 3000)
    } catch (err) {
      console.error('Error saving filters:', err)
      setError('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const getVisibleFilters = () => {
    return availableFilters.filter(filter => filter.visible).sort((a, b) => a.order - b.order)
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
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-gray-900">
            Gestión de Filtros
          </h3>
          <p className="text-sm text-gray-500">
            Configura qué filtros mostrar en tu tienda
          </p>
        </div>
        <button
          onClick={handleRefreshFilters}
          disabled={loading}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Actualizar desde productos
        </button>
      </div>

      {/* Messages */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
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
        <div className="rounded-md bg-green-50 p-4">
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

      {/* Available filters with integrated drag & drop */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h4 className="text-lg font-medium text-gray-900 mb-4">
            Filtros disponibles ({availableFilters.length})
          </h4>
          <p className="text-sm text-gray-500 mb-6">
            Estos filtros se generan automáticamente basándose en los metadatos de tus productos. 
            Arrastra los filtros visibles para cambiar su orden.
          </p>
          
          {availableFilters.length === 0 ? (
            <div className="text-center py-8">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Sin filtros disponibles</h3>
              <p className="mt-1 text-sm text-gray-500">
                Agrega productos con metadatos para generar filtros automáticamente.
              </p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="all-filters">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                    {/* Visible filters (draggable) */}
                    {getVisibleFilters().map((filter, index) => (
                      <Draggable key={filter.id} draggableId={filter.id} index={index}>
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className={`flex items-center justify-between p-4 border-2 border-blue-200 bg-blue-50 rounded-lg transition-all ${
                              snapshot.isDragging ? 'shadow-lg border-blue-300' : ''
                            }`}
                          >
                            <div className="flex items-center space-x-3">
                              <div {...provided.dragHandleProps} className="cursor-move">
                                <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                </svg>
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center space-x-3">
                                  <h5 className="font-medium text-gray-900">{filter.name}</h5>
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                    filter.type === 'tags' ? 'bg-blue-100 text-blue-800' :
                                    filter.type === 'select' ? 'bg-green-100 text-green-800' :
                                    filter.type === 'range' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {filter.type}
                                  </span>
                                  <span className="text-sm text-gray-500">
                                    {filter.productCount} productos
                                  </span>
                                  <span className="text-sm font-medium text-blue-600">
                                    #{index + 1}
                                  </span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                  {filter.options.length} opciones: {filter.options.slice(0, 3).join(', ')}
                                  {filter.options.length > 3 && '...'}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex items-center">
                              <label className="flex items-center">
                                <input
                                  type="checkbox"
                                  checked={filter.visible}
                                  onChange={() => handleFilterToggle(filter.id)}
                                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                  disabled={saving}
                                />
                                <span className="ml-2 text-sm text-gray-700">Mostrar en tienda</span>
                              </label>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    
                    {/* Hidden filters (non-draggable) */}
                    {availableFilters.filter(f => !f.visible).map((filter) => (
                      <div key={filter.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg bg-gray-50">
                        <div className="flex items-center space-x-3">
                          <div className="w-5 h-5 flex items-center justify-center">
                            <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464M9.878 9.878a3 3 0 104.243 4.243m0 0L16.536 16.536M14.12 14.12L16.536 16.536" />
                            </svg>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-3">
                              <h5 className="font-medium text-gray-500">{filter.name}</h5>
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {filter.type}
                              </span>
                              <span className="text-sm text-gray-400">
                                {filter.productCount} productos
                              </span>
                            </div>
                            <p className="text-sm text-gray-400 mt-1">
                              {filter.options.length} opciones: {filter.options.slice(0, 3).join(', ')}
                              {filter.options.length > 3 && '...'}
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center">
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filter.visible}
                              onChange={() => handleFilterToggle(filter.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              disabled={saving}
                            />
                            <span className="ml-2 text-sm text-gray-700">Mostrar en tienda</span>
                          </label>
                        </div>
                      </div>
                    ))}
                    
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
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