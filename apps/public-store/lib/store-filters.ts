import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { PublicProduct } from './products'

export interface StoreFilterConfig {
  id: string
  name: string
  type: 'text' | 'select' | 'tags' | 'range'
  enabled: boolean
  visible: boolean
  order: number
  options: string[]
  productCount: number
}

export interface StoreFiltersSettings {
  enabled: boolean
  availableFilters: StoreFilterConfig[]
  displayOrder: string[]
}

export interface DynamicFilter {
  id: string
  name: string
  type: 'select' | 'tags' | 'range'
  options: string[]
  selectedOptions: string[]
}

/**
 * Get configured filters for a store from the database
 */
export async function getStoreConfiguredFilters(storeId: string): Promise<StoreFiltersSettings> {
  try {
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase not initialized')

    const storeRef = doc(db, 'stores', storeId)
    const storeDoc = await getDoc(storeRef)
    
    if (!storeDoc.exists()) {
      throw new Error('Store not found')
    }
    
    const storeData = storeDoc.data()
    const filtersSettings = storeData?.settings?.filters as StoreFiltersSettings
    
    return filtersSettings || {
      enabled: false,
      availableFilters: [],
      displayOrder: []
    }
  } catch (error) {
    console.error('Error loading store filters settings:', error)
    return {
      enabled: false,
      availableFilters: [],
      displayOrder: []
    }
  }
}

/**
 * Extract dynamic filters from products based on store configuration
 */
export const extractConfiguredFilters = (
  products: PublicProduct[], 
  storeConfig: StoreFiltersSettings
): DynamicFilter[] => {
  if (!storeConfig.enabled || storeConfig.availableFilters.length === 0) {
    return []
  }

  const filtersMap = new Map<string, Set<string>>()
  
  // Only extract values for configured and visible filters
  const visibleFilters = storeConfig.availableFilters.filter(f => f.enabled && f.visible)
  
  // Extract values from products for each configured filter
  products.forEach(product => {
    if (product.metaFieldValues) {
      visibleFilters.forEach(filterConfig => {
        const fieldId = filterConfig.id
        const value = product.metaFieldValues?.[fieldId]
        
        if (value) {
          if (!filtersMap.has(fieldId)) {
            filtersMap.set(fieldId, new Set())
          }
          
          const valueSet = filtersMap.get(fieldId)!
          
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (v && v.trim()) {
                valueSet.add(v.trim())
              }
            })
          } else if (typeof value === 'string') {
            if (value.trim()) {
              valueSet.add(value.trim())
            }
          }
        }
      })
    }
  })
  
  // Convert to DynamicFilter array using display order
  const filters: DynamicFilter[] = []
  
  storeConfig.displayOrder.forEach(filterId => {
    const filterConfig = visibleFilters.find(f => f.id === filterId)
    const valueSet = filtersMap.get(filterId)
    
    if (filterConfig && valueSet && valueSet.size > 0) {
      filters.push({
        id: filterConfig.id,
        name: filterConfig.name,
        type: filterConfig.type as 'select' | 'tags' | 'range',
        options: Array.from(valueSet).sort(),
        selectedOptions: []
      })
    }
  })
  
  return filters
}

/**
 * Fallback function to extract filters when no configuration exists
 */
export const extractDynamicFilters = (products: PublicProduct[]): DynamicFilter[] => {
  const filtersMap = new Map<string, Set<string>>()
  
  // Mapeo de IDs de metafields a nombres legibles en español
  const metaFieldNames: Record<string, string> = {
    'color': 'Color',
    'size': 'Talla',
    'gender': 'Género',
    'material': 'Material',
    'occasion': 'Ocasión',
    'season': 'Temporada',
    'style': 'Estilo',
    'category_type': 'Tipo',
    'care': 'Cuidado',
    'fit': 'Ajuste',
    'neckline': 'Cuello',
    'sleeve_type': 'Manga',
    'pattern': 'Patrón',
    'brand': 'Marca',
    'age_group': 'Grupo de edad'
  }
  
  // Iterar sobre todos los productos para extraer valores únicos
  products.forEach(product => {
    if (product.metaFieldValues) {
      Object.entries(product.metaFieldValues).forEach(([fieldId, value]) => {
        if (!filtersMap.has(fieldId)) {
          filtersMap.set(fieldId, new Set())
        }
        
        const valueSet = filtersMap.get(fieldId)!
        
        if (Array.isArray(value)) {
          // Para campos de tipo 'tags', agregar cada valor
          value.forEach(v => {
            if (v && v.trim()) {
              valueSet.add(v.trim())
            }
          })
        } else if (value && typeof value === 'string') {
          // Para campos de tipo 'select' o 'text'
          if (value.trim()) {
            valueSet.add(value.trim())
          }
        }
      })
    }
  })
  
  // Convertir a array de filtros
  const filters: DynamicFilter[] = []
  
  filtersMap.forEach((valueSet, fieldId) => {
    if (valueSet.size > 0) {
      const options = Array.from(valueSet).sort()
      
      filters.push({
        id: fieldId,
        name: metaFieldNames[fieldId] || fieldId.charAt(0).toUpperCase() + fieldId.slice(1),
        type: 'tags', // Por defecto, se puede ajustar según el tipo de campo
        options,
        selectedOptions: []
      })
    }
  })
  
  // Ordenar filtros por nombre
  return filters.sort((a, b) => a.name.localeCompare(b.name))
} 