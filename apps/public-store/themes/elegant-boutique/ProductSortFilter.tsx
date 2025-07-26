'use client'

import { useState } from 'react'
import { DynamicFilter, PriceRangeOption } from '../../lib/products'
import ElegantBoutiqueDynamicFilters from './DynamicFilters'

interface ProductSortFilterProps {
  filters: DynamicFilter[]
  priceRangeOptions: PriceRangeOption[]
  onFiltersChange: (filters: DynamicFilter[]) => void
  onPriceRangeChange: (options: PriceRangeOption[]) => void
  onClearFilters: () => void
  sortBy: 'name' | 'price-low' | 'price-high' | 'newest'
  onSortChange: (sortBy: 'name' | 'price-low' | 'price-high' | 'newest') => void
  showViewSelector?: boolean
  viewMode?: 'expanded' | 'compact' | 'list'
  onViewModeChange?: (mode: 'expanded' | 'compact' | 'list') => void
}

const Icons = {
  Sort: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7h18M3 12h9m-9 5h6" />
    </svg>
  ),
  GridExpanded: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  GridCompact: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6z" />
    </svg>
  ),
  ListView: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  )
}

export default function ProductSortFilter({
  filters,
  priceRangeOptions,
  onFiltersChange,
  onPriceRangeChange,
  onClearFilters,
  sortBy,
  onSortChange,
  showViewSelector = false,
  viewMode = 'expanded',
  onViewModeChange
}: ProductSortFilterProps) {
  const [showSort, setShowSort] = useState(false)

  const getCurrentViewIcon = () => {
    switch (viewMode) {
      case 'expanded':
        return <Icons.GridExpanded />
      case 'compact':
        return <Icons.GridCompact />
      case 'list':
        return <Icons.ListView />
      default:
        return <Icons.GridExpanded />
    }
  }

  const handleViewModeToggle = () => {
    if (!onViewModeChange) return
    const modes: ('expanded' | 'compact' | 'list')[] = ['expanded', 'compact', 'list']
    const currentIndex = modes.indexOf(viewMode)
    const nextIndex = (currentIndex + 1) % modes.length
    onViewModeChange(modes[nextIndex])
  }

  return (
    <div className="flex items-center gap-4">
      {/* Desktop: Filtros y ordenamiento normales */}
      <div className="hidden md:flex items-center gap-6">
        <ElegantBoutiqueDynamicFilters
          filters={filters}
          priceRangeOptions={priceRangeOptions}
          onFiltersChange={onFiltersChange}
          onPriceRangeChange={onPriceRangeChange}
          onClearFilters={onClearFilters}
        />
        
        {/* Ordenamiento - Desktop */}
        <div className="relative">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center gap-2 px-3 py-2 text-sm font-light border rounded-sm transition-all duration-200"
            style={{
              borderColor: `rgb(var(--theme-primary) / 0.2)`,
              backgroundColor: showSort ? `rgb(var(--theme-secondary))` : 'transparent',
              color: `rgb(var(--theme-neutral-medium))`,
              fontFamily: `var(--theme-font-body)`,
              transition: `var(--theme-transition)`
            }}
            onMouseEnter={(e) => {
              if (!showSort) {
                e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.3)`
              }
            }}
            onMouseLeave={(e) => {
              if (!showSort) {
                e.currentTarget.style.backgroundColor = 'transparent'
                e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
              }
            }}
          >
            <Icons.Sort />
            <span>Ordenar</span>
            <svg className={`w-3 h-3 transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          {showSort && (
            <div 
              className="absolute top-full right-0 mt-2 w-48 border rounded-sm z-50 animate-fade-in"
              style={{
                backgroundColor: `rgb(var(--theme-neutral-light))`,
                borderColor: `rgb(var(--theme-primary) / 0.1)`,
                boxShadow: `var(--theme-shadow-sm)`
              }}
            >
              <div className="p-3">
                {[
                  { value: 'newest', label: 'Más recientes' },
                  { value: 'name', label: 'Nombre A-Z' },
                  { value: 'price-low', label: 'Precio: menor a mayor' },
                  { value: 'price-high', label: 'Precio: mayor a menor' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value as 'name' | 'price-low' | 'price-high' | 'newest')
                      setShowSort(false)
                    }}
                    className="w-full text-left px-3 py-2 transition-colors duration-200 rounded-sm text-sm font-light"
                    style={{
                      backgroundColor: sortBy === option.value ? `rgb(var(--theme-secondary))` : 'transparent',
                      color: sortBy === option.value ? `rgb(var(--theme-neutral-dark))` : `rgb(var(--theme-neutral-medium))`,
                      fontFamily: `var(--theme-font-body)`,
                      transition: `var(--theme-transition)`
                    }}
                    onMouseEnter={(e) => {
                      if (sortBy !== option.value) {
                        e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                        e.currentTarget.style.color = `rgb(var(--theme-neutral-dark))`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (sortBy !== option.value) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.color = `rgb(var(--theme-neutral-medium))`
                      }
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selector de vista - Solo desktop si está habilitado */}
        {showViewSelector && onViewModeChange && (
          <button
            onClick={handleViewModeToggle}
            className="p-2 border rounded-sm transition-all duration-200"
            style={{
              borderColor: `rgb(var(--theme-primary) / 0.2)`,
              backgroundColor: 'transparent',
              color: `rgb(var(--theme-neutral-medium))`
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
              e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.3)`
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent'
              e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
            }}
          >
            {getCurrentViewIcon()}
          </button>
        )}
      </div>
      
      {/* Mobile: Tres botones alineados */}
      <div className="md:hidden flex items-center justify-between w-full gap-3">
        {/* Filtros - Izquierda */}
        <div className="flex-1">
          <ElegantBoutiqueDynamicFilters
            filters={filters}
            priceRangeOptions={priceRangeOptions}
            onFiltersChange={onFiltersChange}
            onPriceRangeChange={onPriceRangeChange}
            onClearFilters={onClearFilters}
          />
        </div>
        
        {/* Ordenamiento - Centro */}
        <div className="relative flex-1">
          <button
            onClick={() => setShowSort(!showSort)}
            className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-light border rounded-sm transition-all duration-200 w-full"
            style={{
              borderColor: `rgb(var(--theme-primary) / 0.2)`,
              backgroundColor: showSort ? `rgb(var(--theme-secondary))` : 'transparent',
              color: `rgb(var(--theme-neutral-medium))`,
              fontFamily: `var(--theme-font-body)`,
              transition: `var(--theme-transition)`
            }}
          >
            <Icons.Sort />
            <span>Ordenar</span>
            <svg className={`w-3 h-3 transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          
          {showSort && (
            <div 
              className="absolute top-full left-0 mt-2 w-64 border rounded-sm z-50 animate-fadeInUp"
              style={{ 
                backgroundColor: 'rgb(var(--theme-neutral-light))',
                borderColor: 'rgb(var(--theme-primary) / 0.1)',
                boxShadow: 'var(--theme-shadow-md)'
              }}
            >
              <div className="p-3">
                {[
                  { value: 'newest', label: 'Más recientes' },
                  { value: 'name', label: 'Nombre A-Z' },
                  { value: 'price-low', label: 'Precio: menor a mayor' },
                  { value: 'price-high', label: 'Precio: mayor a menor' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => {
                      onSortChange(option.value as 'name' | 'price-low' | 'price-high' | 'newest')
                      setShowSort(false)
                    }}
                    className={`w-full text-left px-3 py-2 hover-elegant transition-colors duration-200 rounded-sm text-sm font-light text-sans ${
                      sortBy === option.value 
                        ? 'font-medium' 
                        : ''
                    }`}
                    style={{ 
                      backgroundColor: sortBy === option.value ? 'rgb(var(--theme-secondary))' : 'transparent',
                      color: sortBy === option.value ? 'rgb(var(--theme-neutral-dark))' : 'rgb(var(--theme-neutral-medium))'
                    }}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Selector de vista - Derecha (solo móvil si está habilitado) */}
        {showViewSelector && onViewModeChange && (
          <button
            onClick={handleViewModeToggle}
            className="p-2 border rounded-sm transition-all duration-200"
            style={{
              borderColor: `rgb(var(--theme-primary) / 0.2)`,
              backgroundColor: 'transparent',
              color: `rgb(var(--theme-neutral-medium))`
            }}
          >
            {getCurrentViewIcon()}
          </button>
        )}
      </div>
    </div>
  )
} 