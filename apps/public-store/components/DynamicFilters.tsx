'use client'

import { useState, useEffect } from 'react'
import { DynamicFilter, PriceRangeOption } from '../lib/products'

interface DynamicFiltersProps {
  filters: DynamicFilter[]
  priceRangeOptions: PriceRangeOption[]
  onFiltersChange: (filters: DynamicFilter[]) => void
  onPriceRangeChange: (options: PriceRangeOption[]) => void
  onClearFilters: () => void
}

export default function DynamicFilters({
  filters,
  priceRangeOptions,
  onFiltersChange,
  onPriceRangeChange,
  onClearFilters
}: DynamicFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  
  // Estados temporales para los filtros (no aplicados hasta hacer clic en "Aplicar")
  const [tempFilters, setTempFilters] = useState<DynamicFilter[]>([])
  const [tempPriceRangeOptions, setTempPriceRangeOptions] = useState<PriceRangeOption[]>([])

  // Sincronizar estados temporales con los filtros actuales cuando cambian
  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  useEffect(() => {
    setTempPriceRangeOptions(priceRangeOptions)
  }, [priceRangeOptions])

  const toggleFilterOption = (filterId: string, option: string) => {
    const updatedFilters = tempFilters.map(filter => {
      if (filter.id === filterId) {
        const isSelected = filter.selectedOptions.includes(option)
        return {
          ...filter,
          selectedOptions: isSelected
            ? filter.selectedOptions.filter(o => o !== option)
            : [...filter.selectedOptions, option]
        }
      }
      return filter
    })
    
    setTempFilters(updatedFilters)
  }

  const togglePriceRange = (rangeId: string) => {
    const updatedRanges = tempPriceRangeOptions.map(range => 
      range.id === rangeId 
        ? { ...range, selected: !range.selected }
        : range
    )
    setTempPriceRangeOptions(updatedRanges)
  }

  const getActiveFiltersCount = () => {
    const filterCount = filters.reduce((count, filter) => count + filter.selectedOptions.length, 0)
    const priceRangeCount = priceRangeOptions.filter(range => range.selected).length
    return filterCount + priceRangeCount
  }

  const getTempActiveFiltersCount = () => {
    const filterCount = tempFilters.reduce((count, filter) => count + filter.selectedOptions.length, 0)
    const priceRangeCount = tempPriceRangeOptions.filter(range => range.selected).length
    return filterCount + priceRangeCount
  }

  const hasActiveFilters = getActiveFiltersCount() > 0
  const hasTempChanges = JSON.stringify(tempFilters) !== JSON.stringify(filters) || 
                        JSON.stringify(tempPriceRangeOptions) !== JSON.stringify(priceRangeOptions)

  const handleApplyFilters = () => {
    // Aplicar los filtros temporales
    onFiltersChange(tempFilters)
    onPriceRangeChange(tempPriceRangeOptions)
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    // Limpiar tanto los filtros aplicados como los temporales
    const clearedFilters = filters.map(filter => ({
      ...filter,
      selectedOptions: []
    }))
    
    const clearedPriceRanges = priceRangeOptions.map(range => ({
      ...range,
      selected: false
    }))
    
    setTempFilters(clearedFilters)
    setTempPriceRangeOptions(clearedPriceRanges)
    onClearFilters()
  }

  const handleCloseFilters = () => {
    // Revertir cambios temporales al cerrar sin aplicar
    setTempFilters(filters)
    setTempPriceRangeOptions(priceRangeOptions)
    setShowFilters(false)
  }

  // Prevenir scroll del body cuando el modal está abierto SOLO en móvil
  useEffect(() => {
    const isMobile = window.innerWidth < 768 // md breakpoint
    
    if (showFilters && isMobile) {
      // Solo bloquear scroll en móvil donde se muestra como modal
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
      document.body.style.paddingRight = `${scrollbarWidth}px`
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.paddingRight = '0px'
      document.body.style.overflow = 'auto'
    }

    return () => {
      document.body.style.paddingRight = '0px'
      document.body.style.overflow = 'auto'
    }
  }, [showFilters])

  return (
    <div className="relative">
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-light border border-neutral-200 rounded-md hover:bg-neutral-50 transition-all duration-200 text-neutral-700 hover:text-neutral-900"
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        <span className="font-light">Filtros</span>
        {hasActiveFilters && (
          <span className="bg-neutral-900 text-white text-xs font-light rounded-full px-2 py-0.5 min-w-[18px] h-4 flex items-center justify-center">
            {getActiveFiltersCount()}
          </span>
        )}
        <svg className={`w-3 h-3 transition-transform duration-200 ${showFilters ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Overlay para móvil con animación */}
      <div 
        className={`fixed inset-0 bg-black/50 z-[9998] md:hidden transition-opacity duration-300 ease-out ${
          showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleCloseFilters}
      />
      
      {/* Desktop dropdown */}
      {showFilters && (
        <div className="hidden md:block absolute top-full right-0 mt-2 w-80 bg-white border border-neutral-100 rounded-lg shadow-sm z-50 max-h-96 flex flex-col animate-fade-in">
          <div className="p-6 flex-1 overflow-y-auto" style={{ maxHeight: '300px' }}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light text-neutral-900">Filtros</h3>
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-light text-neutral-500 hover:text-neutral-900 transition-colors duration-200"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Filtro de precio */}
            {tempPriceRangeOptions.length > 0 && (
              <div className="mb-8">
                <h4 className="text-sm font-light text-neutral-900 mb-4">
                  Precio
                  {tempPriceRangeOptions.filter(range => range.selected).length > 0 && (
                    <span className="ml-2 bg-neutral-100 text-neutral-700 text-xs font-light rounded-full px-2 py-0.5">
                      {tempPriceRangeOptions.filter(range => range.selected).length}
                    </span>
                  )}
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300">
                  {tempPriceRangeOptions.map(range => (
                    <label
                      key={range.id}
                      className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={range.selected}
                        onChange={() => togglePriceRange(range.id)}
                        className="w-3 h-3 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-300 focus:ring-1"
                      />
                      <span className="text-sm font-light text-neutral-700">{range.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filtros dinámicos */}
            {tempFilters.map(filter => (
              <div key={filter.id} className="mb-8 last:mb-0">
                <h4 className="text-sm font-light text-neutral-900 mb-4">
                  {filter.name}
                  {filter.selectedOptions.length > 0 && (
                    <span className="ml-2 bg-neutral-100 text-neutral-700 text-xs font-light rounded-full px-2 py-0.5">
                      {filter.selectedOptions.length}
                    </span>
                  )}
                </h4>
                <div className="space-y-1 max-h-32 overflow-y-auto scrollbar-thin scrollbar-track-transparent scrollbar-thumb-neutral-200 hover:scrollbar-thumb-neutral-300">
                  {filter.options.map(option => {
                    const isSelected = filter.selectedOptions.includes(option)
                    return (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer hover:bg-neutral-50 p-2 rounded transition-colors duration-200"
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilterOption(filter.id, option)}
                          className="w-3 h-3 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-300 focus:ring-1"
                        />
                        <span className="text-sm font-light text-neutral-700">{option}</span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}

            {tempFilters.length === 0 && (
              <div className="text-center py-12 text-neutral-400">
                <svg className="w-10 h-10 mx-auto mb-4 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <p className="text-sm font-light mb-2">No hay filtros disponibles</p>
                <p className="text-xs font-light text-neutral-400">Los filtros aparecerán cuando los productos tengan características definidas</p>
              </div>
            )}

          </div>

          {/* Botones fijos en la parte inferior - Desktop */}
          {(hasTempChanges || hasActiveFilters) && (
            <div className="flex-shrink-0 border-t border-neutral-100 p-4 bg-white rounded-b-lg space-y-3">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-neutral-900 text-white py-2 rounded-md font-medium text-sm hover:bg-neutral-800 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
                Aplicar Filtros
                {getTempActiveFiltersCount() > 0 && (
                  <span className="bg-white text-neutral-900 text-xs font-medium rounded-full px-2 py-0.5 min-w-[18px] h-4 flex items-center justify-center">
                    {getTempActiveFiltersCount()}
                  </span>
                )}
              </button>

              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="w-full bg-neutral-100 text-neutral-700 py-2 rounded-md font-medium text-sm hover:bg-neutral-200 transition-colors duration-200 flex items-center justify-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  Limpiar Todo
                </button>
              )}
            </div>
          )}
        </div>
      )}

      {/* Modal de pantalla completa para móvil con animación suave */}
      <div className={`fixed inset-0 bg-white z-[9999] md:hidden flex flex-col transition-all duration-300 ease-out ${
        showFilters ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full pointer-events-none'
      }`} style={{ 
        maxHeight: '100vh',
        height: '100vh',
        overflowY: 'hidden'
      }}>
        {/* Header con título y botón de cerrar */}
        <div className="flex items-center justify-between p-4 border-b border-neutral-200 bg-white flex-shrink-0">
          <h3 className="text-xl font-light text-neutral-900">Filtros</h3>
          <button
            onClick={handleCloseFilters}
            className="p-2 hover:bg-neutral-100 rounded-full transition-colors duration-200"
          >
            <svg className="w-6 h-6 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="flex-1 overflow-y-auto p-4" style={{ 
          maxHeight: 'calc(100vh - 140px)', /* Restar altura del header y botones */
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch'
        }}>
          {/* Filtro de precio */}
          {tempPriceRangeOptions.length > 0 && (
            <div className="mb-8">
              <h4 className="text-lg font-light text-neutral-900 mb-4">
                Precio
                {tempPriceRangeOptions.filter(range => range.selected).length > 0 && (
                  <span className="ml-2 bg-neutral-100 text-neutral-700 text-sm font-light rounded-full px-3 py-1">
                    {tempPriceRangeOptions.filter(range => range.selected).length}
                  </span>
                )}
              </h4>
              <div className="space-y-2">
                {tempPriceRangeOptions.map(range => (
                  <label
                    key={range.id}
                    className="flex items-center gap-4 cursor-pointer hover:bg-neutral-50 p-3 rounded-lg transition-colors duration-200"
                  >
                    <input
                      type="checkbox"
                      checked={range.selected}
                      onChange={() => togglePriceRange(range.id)}
                      className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-300 focus:ring-2"
                    />
                    <span className="text-base font-light text-neutral-700">{range.label}</span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Filtros dinámicos */}
          {tempFilters.map(filter => (
            <div key={filter.id} className="mb-8 last:mb-0">
              <h4 className="text-lg font-light text-neutral-900 mb-4">
                {filter.name}
                {filter.selectedOptions.length > 0 && (
                  <span className="ml-2 bg-neutral-100 text-neutral-700 text-sm font-light rounded-full px-3 py-1">
                    {filter.selectedOptions.length}
                  </span>
                )}
              </h4>
              <div className="space-y-2">
                {filter.options.map(option => {
                  const isSelected = filter.selectedOptions.includes(option)
                  return (
                    <label
                      key={option}
                      className="flex items-center gap-4 cursor-pointer hover:bg-neutral-50 p-3 rounded-lg transition-colors duration-200"
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleFilterOption(filter.id, option)}
                        className="w-4 h-4 text-neutral-900 border-neutral-300 rounded focus:ring-neutral-300 focus:ring-2"
                      />
                      <span className="text-base font-light text-neutral-700">{option}</span>
                    </label>
                  )
                })}
              </div>
            </div>
          ))}

          {tempFilters.length === 0 && (
            <div className="text-center py-16 text-neutral-400">
              <svg className="w-16 h-16 mx-auto mb-6 text-neutral-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
              </svg>
              <p className="text-lg font-light mb-2">No hay filtros disponibles</p>
              <p className="text-base font-light text-neutral-400">Los filtros aparecerán cuando los productos tengan características definidas</p>
            </div>
          )}
        </div>

        {/* Botones de acción fijos en la parte inferior - Mobile */}
        <div className="flex-shrink-0 bg-white border-t border-neutral-200 p-4 space-y-3">
          {/* Botón de aplicar filtros */}
          <button
            onClick={handleApplyFilters}
            className="w-full bg-neutral-900 text-white py-4 rounded-lg font-medium text-lg hover:bg-neutral-800 transition-colors duration-200 flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            Aplicar Filtros
            {getTempActiveFiltersCount() > 0 && (
              <span className="bg-white text-neutral-900 text-sm font-medium rounded-full px-2 py-1 min-w-[24px] h-6 flex items-center justify-center">
                {getTempActiveFiltersCount()}
              </span>
            )}
          </button>

          {/* Botón de limpiar filtros */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="w-full bg-neutral-100 text-neutral-700 py-3 rounded-lg font-medium text-base hover:bg-neutral-200 transition-colors duration-200 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
              </svg>
              Limpiar Todo
            </button>
          )}
        </div>
      </div>
    </div>
  )
} 