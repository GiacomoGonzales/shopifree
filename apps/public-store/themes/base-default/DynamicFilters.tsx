'use client'

import { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'
import { DynamicFilter, PriceRangeOption } from '../../lib/products'

interface DynamicFiltersProps {
  filters: DynamicFilter[]
  priceRangeOptions: PriceRangeOption[]
  onFiltersChange: (filters: DynamicFilter[]) => void
  onPriceRangeChange: (options: PriceRangeOption[]) => void
  onClearFilters: () => void
  primaryColor?: string
}

export default function BaseDefaultDynamicFilters({
  filters,
  priceRangeOptions,
  onFiltersChange,
  onPriceRangeChange,
  onClearFilters,
  primaryColor = '#3B82F6'
}: DynamicFiltersProps) {
  const [showFilters, setShowFilters] = useState(false)
  const [tempFilters, setTempFilters] = useState<DynamicFilter[]>(filters)
  const [tempPriceRangeOptions, setTempPriceRangeOptions] = useState<PriceRangeOption[]>(priceRangeOptions)
  const filterRef = useRef<HTMLDivElement>(null)

  // Sincronizar estados cuando cambian los props
  useEffect(() => {
    setTempFilters(filters)
  }, [filters])

  useEffect(() => {
    setTempPriceRangeOptions(priceRangeOptions)
  }, [priceRangeOptions])

  // Manejar click fuera del filtro en desktop
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (filterRef.current && !filterRef.current.contains(event.target as Node) && showFilters) {
        handleCloseFilters()
      }
    }

    if (showFilters && window.innerWidth >= 768) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showFilters])

  const toggleFilterOption = (filterId: string, option: string) => {
    setTempFilters(prev => prev.map(filter => {
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
    }))
  }

  const togglePriceRange = (rangeId: string) => {
    setTempPriceRangeOptions(prev => prev.map(range => 
      range.id === rangeId 
        ? { ...range, selected: !range.selected }
        : range
    ))
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

  const handleApplyFilters = () => {
    onFiltersChange(tempFilters)
    onPriceRangeChange(tempPriceRangeOptions)
    setShowFilters(false)
  }

  const handleClearFilters = () => {
    const clearedFilters = filters.map(filter => ({ ...filter, selectedOptions: [] }))
    const clearedPriceRanges = priceRangeOptions.map(range => ({ ...range, selected: false }))
    setTempFilters(clearedFilters)
    setTempPriceRangeOptions(clearedPriceRanges)
    onClearFilters()
  }

  const handleCloseFilters = () => {
    setTempFilters(filters)
    setTempPriceRangeOptions(priceRangeOptions)
    setShowFilters(false)
  }

  // Estilo personalizado para checkboxes - ELIMINA COMPLETAMENTE todos los contornos
  const checkboxStyle = {
    accentColor: primaryColor,
    outline: 'none !important',
    boxShadow: 'none !important',
    border: 'none !important',
    backgroundColor: 'transparent !important',
    borderRadius: '2px',
    appearance: 'auto',
    WebkitAppearance: 'checkbox',
    MozAppearance: 'checkbox'
  } as React.CSSProperties

  return (
    <div className="relative" ref={filterRef}>
      {/* Botón de filtros */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className={`flex items-center gap-2 px-3 py-2 text-sm font-light border rounded-md transition-all duration-200 ${
          showFilters 
            ? 'border-neutral-300 bg-neutral-50 text-neutral-900' 
            : 'border-neutral-200 bg-white text-neutral-700 hover:bg-neutral-50 hover:text-neutral-900'
        }`}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        <span className="font-light">Filtros</span>
        {getActiveFiltersCount() > 0 && (
          <span className="bg-neutral-900 text-white text-xs font-medium rounded-full px-2 py-0.5 min-w-[18px] h-4 flex items-center justify-center">
            {getActiveFiltersCount()}
          </span>
        )}
      </button>

      {/* Dropdown para desktop */}
      {showFilters && (
        <div className="hidden md:block absolute top-full right-0 mt-2 w-80 bg-white border border-neutral-100 rounded-lg shadow-lg z-50">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-neutral-900">
                Filtros
              </h3>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-light text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
                >
                  Limpiar todo
                </button>
              )}
            </div>

            {/* Contenido de filtros */}
            <div className="space-y-6 max-h-[60vh] overflow-y-auto">
              {/* Filtro de precio */}
              {tempPriceRangeOptions.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium mb-3 text-neutral-900">
                    Precio
                  </h4>
                  <div className="space-y-2">
                    {tempPriceRangeOptions.map(range => (
                      <label
                        key={range.id}
                        className={`flex items-center gap-3 cursor-pointer p-2 rounded-md transition-colors duration-200 ${
                          range.selected ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                        }`}
                                             >
                                                                                                                                                                                                       <input
                              type="checkbox"
                              checked={range.selected}
                              onChange={() => togglePriceRange(range.id)}
                              className="w-3 h-3 border-0 focus:outline-none focus:ring-0 focus:shadow-none focus:border-0 focus:ring-offset-0 active:outline-none active:ring-0 active:shadow-none"
                              style={checkboxStyle}
                            />
                        <span className="text-sm font-light text-neutral-700">
                          {range.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Filtros dinámicos */}
              {tempFilters.map(filter => (
                <div key={filter.id}>
                  <h4 className="text-sm font-medium mb-3 text-neutral-900">
                    {filter.name}
                  </h4>
                  <div className="space-y-2">
                    {filter.options.map(option => (
                      <label
                        key={option}
                        className={`flex items-center gap-3 cursor-pointer p-2 rounded-md transition-colors duration-200 ${
                          filter.selectedOptions.includes(option) ? 'bg-neutral-50' : 'hover:bg-neutral-50'
                        }`}
                                             >
                                                                                                                                                                                                       <input
                              type="checkbox"
                              checked={filter.selectedOptions.includes(option)}
                              onChange={() => toggleFilterOption(filter.id, option)}
                              className="w-3 h-3 border-0 focus:outline-none focus:ring-0 focus:shadow-none focus:border-0 focus:ring-offset-0 active:outline-none active:ring-0 active:shadow-none"
                              style={checkboxStyle}
                            />
                        <span className="text-sm font-light text-neutral-700">
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {tempFilters.length === 0 && tempPriceRangeOptions.length === 0 && (
                <div className="text-center py-8 text-neutral-500">
                  <p className="text-sm font-light">No hay filtros disponibles</p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleApplyFilters}
                className="w-full bg-neutral-900 text-white py-2 rounded-md font-medium text-sm hover:bg-neutral-800 transition-colors duration-200"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={handleCloseFilters}
                className="w-full border border-neutral-300 text-neutral-900 py-2 rounded-md font-medium text-sm hover:bg-neutral-50 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal móvil usando Portal */}
      {showFilters && typeof window !== 'undefined' && createPortal(
        <div className="fixed inset-0 z-[9999] md:hidden flex flex-col bg-white">
          {/* Header con título y botón de cerrar */}
          <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0 bg-white">
            <h3 className="text-xl font-medium text-neutral-900">
              Filtros
            </h3>
            <button
              onClick={handleCloseFilters}
              className="p-2 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 rounded-full transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Contenido scrolleable */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Filtro de precio */}
            {tempPriceRangeOptions.length > 0 && (
              <div className="mb-8">
                <h4 className="text-lg font-medium mb-4 text-neutral-900">
                  Precio
                  {tempPriceRangeOptions.filter(range => range.selected).length > 0 && (
                    <span className="ml-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full px-3 py-1">
                      {tempPriceRangeOptions.filter(range => range.selected).length}
                    </span>
                  )}
                </h4>
                <div className="space-y-2">
                  {tempPriceRangeOptions.map(range => (
                    <label
                      key={range.id}
                      className={`flex items-center gap-4 cursor-pointer p-3 rounded-lg border transition-colors duration-200 ${
                        range.selected 
                          ? 'bg-neutral-50 border-neutral-300' 
                          : 'bg-white border-neutral-200 hover:bg-neutral-50'
                      }`}
                                         >
                                                                                                                                                                                       <input
                            type="checkbox"
                            checked={range.selected}
                            onChange={() => togglePriceRange(range.id)}
                            className="w-4 h-4 border-0 focus:outline-none focus:ring-0 focus:shadow-none focus:border-0 focus:ring-offset-0 active:outline-none active:ring-0 active:shadow-none"
                            style={checkboxStyle}
                          />
                      <span className="text-base font-light text-neutral-700">
                        {range.label}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Filtros dinámicos */}
            {tempFilters.map(filter => (
              <div key={filter.id} className="mb-8 last:mb-0">
                <h4 className="text-lg font-medium mb-4 text-neutral-900">
                  {filter.name}
                  {filter.selectedOptions.length > 0 && (
                    <span className="ml-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-full px-3 py-1">
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
                        className={`flex items-center gap-4 cursor-pointer p-3 rounded-lg border transition-colors duration-200 ${
                          isSelected 
                            ? 'bg-neutral-50 border-neutral-300' 
                            : 'bg-white border-neutral-200 hover:bg-neutral-50'
                        }`}
                                             >
                                                                                                                                                                                                       <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleFilterOption(filter.id, option)}
                              className="w-4 h-4 border-0 focus:outline-none focus:ring-0 focus:shadow-none focus:border-0 focus:ring-offset-0 active:outline-none active:ring-0 active:shadow-none"
                              style={checkboxStyle}
                            />
                        <span className="text-base font-light text-neutral-700">
                          {option}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}

            {tempFilters.length === 0 && tempPriceRangeOptions.length === 0 && (
              <div className="text-center py-16 text-neutral-500">
                <svg 
                  className="w-16 h-16 mx-auto mb-6 text-neutral-300" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <p className="text-lg font-light mb-2">No hay filtros disponibles</p>
                <p className="text-base font-light">Los filtros aparecerán cuando los productos tengan características definidas</p>
              </div>
            )}
          </div>

          {/* Botones de acción fijos en la parte inferior */}
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
                <span className="ml-2 bg-white text-neutral-900 text-sm font-medium rounded-full px-2 py-1 min-w-[24px] h-6 flex items-center justify-center">
                  {getTempActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Botón de limpiar filtros */}
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={handleClearFilters}
                className="w-full border border-neutral-300 text-neutral-900 py-3 rounded-lg font-medium text-base hover:bg-neutral-50 transition-colors duration-200 flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                </svg>
                Limpiar Todo
              </button>
            )}
          </div>
        </div>,
        document.body
      )}
    </div>
  )
} 