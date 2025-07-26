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
}

export default function ElegantBoutiqueDynamicFilters({
  filters,
  priceRangeOptions,
  onFiltersChange,
  onPriceRangeChange,
  onClearFilters
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

  return (
    <div className="relative" ref={filterRef}>
      {/* Botón de filtros */}
      <button
        onClick={() => setShowFilters(!showFilters)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-light border rounded-sm transition-all duration-200"
        style={{ 
          borderColor: 'rgb(var(--theme-primary) / 0.2)',
          color: 'rgb(var(--theme-neutral-dark))',
          backgroundColor: showFilters ? 'rgb(var(--theme-primary) / 0.05)' : 'transparent'
        }}
      >
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
        </svg>
        <span className="font-light">Filtros</span>
        {getActiveFiltersCount() > 0 && (
          <span 
            className="text-white text-xs font-light rounded-sm px-2 py-0.5 min-w-[18px] h-4 flex items-center justify-center"
            style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
          >
            {getActiveFiltersCount()}
          </span>
        )}
      </button>

      {/* Dropdown para desktop */}
      {showFilters && (
        <div 
          className="hidden md:block absolute top-full right-0 mt-2 w-80 bg-white rounded-sm shadow-md z-50"
          style={{ 
            borderColor: 'rgb(var(--theme-primary) / 0.1)',
            boxShadow: 'var(--theme-shadow-md)'
          }}
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                Filtros
              </h3>
              {getActiveFiltersCount() > 0 && (
                <button
                  onClick={handleClearFilters}
                  className="text-xs font-light transition-colors duration-200"
                  style={{ color: 'rgb(var(--theme-neutral-medium))' }}
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
                  <h4 className="text-sm font-light mb-3" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    Precio
                  </h4>
                  <div className="space-y-2">
                    {tempPriceRangeOptions.map(range => (
                      <label
                        key={range.id}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-sm transition-colors duration-200"
                        style={{ 
                          backgroundColor: range.selected ? 'rgb(var(--theme-primary) / 0.05)' : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={range.selected}
                          onChange={() => togglePriceRange(range.id)}
                          className="w-3 h-3 rounded-sm"
                          style={{ 
                            borderColor: 'rgb(var(--theme-neutral-medium))',
                            accentColor: 'rgb(var(--theme-primary))'
                          }}
                        />
                        <span className="text-sm font-light" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
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
                  <h4 className="text-sm font-light mb-3" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    {filter.name}
                  </h4>
                  <div className="space-y-2">
                    {filter.options.map(option => (
                      <label
                        key={option}
                        className="flex items-center gap-3 cursor-pointer p-2 rounded-sm transition-colors duration-200"
                        style={{ 
                          backgroundColor: filter.selectedOptions.includes(option) 
                            ? 'rgb(var(--theme-primary) / 0.05)' 
                            : 'transparent'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={filter.selectedOptions.includes(option)}
                          onChange={() => toggleFilterOption(filter.id, option)}
                          className="w-3 h-3 rounded-sm"
                          style={{ 
                            borderColor: 'rgb(var(--theme-neutral-medium))',
                            accentColor: 'rgb(var(--theme-primary))'
                          }}
                        />
                        <span className="text-sm font-light" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                          {option}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              {tempFilters.length === 0 && tempPriceRangeOptions.length === 0 && (
                <div className="text-center py-8" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  <p className="text-sm font-light">No hay filtros disponibles</p>
                </div>
              )}
            </div>

            {/* Botones de acción */}
            <div className="mt-6 space-y-2">
              <button
                onClick={handleApplyFilters}
                className="w-full py-2 rounded-sm font-medium text-sm transition-colors duration-200 btn-boutique-primary"
              >
                Aplicar Filtros
              </button>
              <button
                onClick={handleCloseFilters}
                className="w-full py-2 rounded-sm font-medium text-sm transition-colors duration-200 btn-boutique-secondary"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal móvil - ESTRUCTURA SIMPLE como Pet Friendly usando Portal */}
      {showFilters && typeof window !== 'undefined' && createPortal(
        <div 
          className="fixed inset-0 z-[9999] md:hidden flex flex-col"
          style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}
        >
          {/* Header con título y botón de cerrar */}
          <div 
            className="flex items-center justify-between p-4 border-b flex-shrink-0"
            style={{ 
              backgroundColor: 'rgb(var(--theme-neutral-light))',
              borderColor: 'rgb(var(--theme-primary) / 0.1)' 
            }}
          >
            <h3 className="text-xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              Filtros
            </h3>
            <button
              onClick={handleCloseFilters}
              className="p-2 hover-elegant rounded-full transition-colors duration-200"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
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
                <h4 className="text-lg font-light mb-4 text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Precio
                  {tempPriceRangeOptions.filter(range => range.selected).length > 0 && (
                    <span 
                      className="ml-2 text-sm font-light rounded-sm px-3 py-1"
                      style={{ 
                        backgroundColor: 'rgb(var(--theme-primary) / 0.1)',
                        color: 'rgb(var(--theme-primary))'
                      }}
                    >
                      {tempPriceRangeOptions.filter(range => range.selected).length}
                    </span>
                  )}
                </h4>
                <div className="space-y-2">
                  {tempPriceRangeOptions.map(range => (
                    <label
                      key={range.id}
                      className="flex items-center gap-4 cursor-pointer p-3 rounded-sm transition-colors duration-200"
                      style={{
                        backgroundColor: range.selected 
                          ? 'rgb(var(--theme-primary) / 0.05)' 
                          : 'white',
                        borderWidth: '1px',
                        borderColor: range.selected 
                          ? 'rgb(var(--theme-primary) / 0.2)' 
                          : 'rgb(var(--theme-neutral-50))'
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={range.selected}
                        onChange={() => togglePriceRange(range.id)}
                        className="w-4 h-4 rounded-sm"
                        style={{ 
                          borderColor: 'rgb(var(--theme-neutral-medium))',
                          accentColor: 'rgb(var(--theme-primary))'
                        }}
                      />
                      <span className="text-base font-light" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
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
                <h4 className="text-lg font-light mb-4 text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  {filter.name}
                  {filter.selectedOptions.length > 0 && (
                    <span 
                      className="ml-2 text-sm font-light rounded-sm px-3 py-1"
                      style={{ 
                        backgroundColor: 'rgb(var(--theme-primary) / 0.1)',
                        color: 'rgb(var(--theme-primary))'
                      }}
                    >
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
                        className="flex items-center gap-4 cursor-pointer p-3 rounded-sm transition-colors duration-200"
                        style={{
                          backgroundColor: isSelected 
                            ? 'rgb(var(--theme-primary) / 0.05)' 
                            : 'white',
                          borderWidth: '1px',
                          borderColor: isSelected 
                            ? 'rgb(var(--theme-primary) / 0.2)' 
                            : 'rgb(var(--theme-neutral-50))'
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleFilterOption(filter.id, option)}
                          className="w-4 h-4 rounded-sm"
                          style={{ 
                            borderColor: 'rgb(var(--theme-neutral-medium))',
                            accentColor: 'rgb(var(--theme-primary))'
                          }}
                        />
                        <span className="text-base font-light" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                          {option}
                        </span>
                      </label>
                    )
                  })}
                </div>
              </div>
            ))}

            {tempFilters.length === 0 && tempPriceRangeOptions.length === 0 && (
              <div className="text-center py-16" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                <svg 
                  className="w-16 h-16 mx-auto mb-6" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24" 
                  strokeWidth={1}
                  style={{ color: 'rgb(var(--theme-neutral-50))' }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
                </svg>
                <p className="text-lg font-light mb-2">No hay filtros disponibles</p>
                <p className="text-base font-light">Los filtros aparecerán cuando los productos tengan características definidas</p>
              </div>
            )}
          </div>

          {/* Botones de acción fijos en la parte inferior */}
          <div 
            className="flex-shrink-0 border-t p-4 space-y-3"
            style={{ 
              backgroundColor: 'rgb(var(--theme-neutral-light))',
              borderColor: 'rgb(var(--theme-primary) / 0.1)' 
            }}
          >
            {/* Botón de aplicar filtros */}
            <button
              onClick={handleApplyFilters}
              className="w-full py-4 rounded-sm font-medium text-lg transition-colors duration-200 btn-boutique-primary flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
              Aplicar Filtros
              {getTempActiveFiltersCount() > 0 && (
                <span 
                  className="ml-2 rounded-sm px-2 py-1 min-w-[24px] h-6 flex items-center justify-center text-sm font-medium"
                  style={{ 
                    backgroundColor: 'white',
                    color: 'rgb(var(--theme-primary))'
                  }}
                >
                  {getTempActiveFiltersCount()}
                </span>
              )}
            </button>

            {/* Botón de limpiar filtros */}
            {getActiveFiltersCount() > 0 && (
              <button
                onClick={handleClearFilters}
                className="w-full py-3 rounded-sm font-medium text-base transition-colors duration-200 btn-boutique-secondary flex items-center justify-center gap-2"
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