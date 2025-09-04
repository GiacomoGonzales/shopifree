import { ProductFilters, SortType, ViewMode } from '../../../components/shared'
import { Filter } from '../../../lib/filters'

interface NewBaseDefaultProductFiltersProps {
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
}

export function NewBaseDefaultProductFilters({
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
  additionalText
}: NewBaseDefaultProductFiltersProps) {
  return (
    <ProductFilters
      filtersModalOpen={filtersModalOpen}
      sortDropdownOpen={sortDropdownOpen}
      currentSort={currentSort}
      mobileViewMode={mobileViewMode}
      selectedFilters={selectedFilters}
      filters={filters}
      toggleFiltersModal={toggleFiltersModal}
      toggleSortDropdown={toggleSortDropdown}
      handleSortChange={handleSortChange}
      handleFilterChange={handleFilterChange}
      clearAllFilters={clearAllFilters}
      setMobileViewMode={setMobileViewMode}
      getActiveFiltersCount={getActiveFiltersCount}
      t={t}
      additionalText={additionalText}
    />
  )
}