import { Filter } from '../../../lib/filters'

export type SortType = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'name-asc' | 'name-desc'
export type ViewMode = 'expanded' | 'grid' | 'list'

interface ProductFiltersProps {
  // State management
  filtersModalOpen: boolean
  sortDropdownOpen: boolean
  currentSort: SortType
  mobileViewMode: ViewMode
  selectedFilters: Record<string, string[]>
  filters: Filter[]

  // Event handlers
  toggleFiltersModal: () => void
  toggleSortDropdown: () => void
  handleSortChange: (sortType: SortType) => void
  handleFilterChange: (filterKey: string, optionValue: string, checked: boolean) => void
  clearAllFilters: () => void
  setMobileViewMode: (mode: ViewMode | ((prev: ViewMode) => ViewMode)) => void

  // Utilities
  getActiveFiltersCount: () => number

  // Texts
  t: (key: string) => string
  additionalText: (key: string) => string

  // Optional
  showFiltersButton?: boolean
}

interface SortOption {
  value: SortType
  label: string
}

export function ProductFilters({
  filtersModalOpen,
  sortDropdownOpen,
  currentSort,
  mobileViewMode,
  selectedFilters,
  filters,
  toggleFiltersModal,
  toggleSortDropdown,
  handleSortChange,
  handleFilterChange,
  clearAllFilters,
  setMobileViewMode,
  getActiveFiltersCount,
  t,
  additionalText,
  showFiltersButton = true
}: ProductFiltersProps) {
  
  const sortOptions: SortOption[] = [
    { value: 'newest', label: additionalText('newest') },
    { value: 'oldest', label: additionalText('oldest') },
    { value: 'price-low', label: additionalText('priceLowHigh') },
    { value: 'price-high', label: additionalText('priceHighLow') },
    { value: 'name-asc', label: additionalText('nameAZ') },
    { value: 'name-desc', label: additionalText('nameZA') }
  ]

  return (
    <>
      {/* Controles de productos */}
      <div className="nbd-product-controls">

        {/* Filtros */}
        {showFiltersButton && (
          <button
            className={`nbd-control-btn ${getActiveFiltersCount() > 0 ? 'nbd-control-btn--active' : ''}`}
            onClick={toggleFiltersModal}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <span>{t('filters')}</span>
            {getActiveFiltersCount() > 0 && (
              <span className="nbd-filter-badge">{getActiveFiltersCount()}</span>
            )}
          </button>
        )}

        {/* Ordenar */}
        <div className="nbd-sort-dropdown">
          <button 
            className={`nbd-control-btn ${sortDropdownOpen ? 'nbd-control-btn--active' : ''}`}
            onClick={toggleSortDropdown}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M3 7h3m0 0l3-3m-3 3l3 3M3 17h9m0 0l3-3m-3 3l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <span>{t('sortOrder')}</span>
            <svg 
              width="12" height="12" 
              viewBox="0 0 24 24" 
              fill="none"
              className={`nbd-dropdown-arrow ${sortDropdownOpen ? 'nbd-dropdown-arrow--open' : ''}`}
            >
              <path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
          
          {sortDropdownOpen && (
            <div className="nbd-dropdown-menu">
              {sortOptions.map((option) => (
                <button
                  key={option.value}
                  className={`nbd-dropdown-option ${currentSort === option.value ? 'nbd-dropdown-option--active' : ''}`}
                  onClick={() => handleSortChange(option.value)}
                >
                  {option.label}
                  {currentSort === option.value && (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Vista */}
        <button 
          className="nbd-control-btn nbd-view-btn"
          onClick={() => {
            setMobileViewMode(prev => {
              if (prev === 'expanded') return 'grid';
              if (prev === 'grid') return 'list';
              return 'expanded';
            });
          }}
          title={`Vista actual: ${
            mobileViewMode === 'grid' ? '2 por fila' : 
            mobileViewMode === 'expanded' ? 'Expandida' : 
            'Lista'
          }`}
        >
          {mobileViewMode === 'expanded' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="18" height="18" stroke="currentColor" strokeWidth="1.5" rx="2"/>
            </svg>
          )}
          {mobileViewMode === 'grid' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" rx="1"/>
            </svg>
          )}
          {mobileViewMode === 'list' && (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
              <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          )}
          <span>{t('viewType')}</span>
        </button>
      </div>

      {/* Modal de Filtros */}
      {filtersModalOpen && (
        <div className="nbd-modal-overlay" onClick={(e) => {
          if (e.target === e.currentTarget) {
            toggleFiltersModal();
          }
        }}>
          <div className="nbd-modal-content nbd-filters-modal">
            {/* Header del modal */}
            <div className="nbd-modal-header">
              <h3 className="nbd-modal-title">{t('filters')}</h3>
              <button 
                className="nbd-modal-close"
                onClick={toggleFiltersModal}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="nbd-modal-body">
              {filters.length === 0 ? (
                <div className="nbd-no-filters">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none">
                    <path d="M3 6h18M7 12h10M11 18h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <h4>{additionalText('noFiltersAvailable')}</h4>
                  <p>{additionalText('filtersConfigured')}</p>
                </div>
              ) : (
                <div className="nbd-filters-list">
                  {filters.map((filter) => (
                    <div key={filter.id} className="nbd-filter-group">
                      <h4 className="nbd-filter-title">{filter.name}</h4>
                      <div className="nbd-filter-options">
                        {Object.entries(filter.options || {}).map(([optionKey, optionLabel]) => {
                          const isSelected = selectedFilters[filter.id]?.includes(optionLabel) || false;
                          return (
                            <label key={optionKey} className={`nbd-filter-option ${isSelected ? 'nbd-filter-option--selected' : ''}`}>
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={(e) => handleFilterChange(filter.id, optionLabel, e.target.checked)}
                                className="nbd-filter-checkbox"
                              />
                              <span className="nbd-filter-checkmark"></span>
                              <span className="nbd-filter-label">{optionLabel}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer del modal */}
            {filters.length > 0 && (
              <div className="nbd-modal-footer">
                <button 
                  className="nbd-btn nbd-btn--ghost"
                  onClick={clearAllFilters}
                  disabled={getActiveFiltersCount() === 0}
                >
                  {additionalText('clearFilters')}
                </button>
                <button 
                  className="nbd-btn nbd-btn--primary"
                  onClick={toggleFiltersModal}
                >
                  {additionalText('apply')} ({getActiveFiltersCount()})
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}