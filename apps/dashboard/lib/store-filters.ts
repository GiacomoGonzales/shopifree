import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { getProducts, ProductWithId } from './products'

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

/**
 * Extract available filters from store products based on their metaFieldValues
 */
export async function extractFiltersFromProducts(storeId: string): Promise<StoreFilterConfig[]> {
  try {
    const products = await getProducts(storeId)
    
    const filtersMap = new Map<string, Set<string>>()
    const filterCounts = new Map<string, number>()
    
    // Extract metadata from all products
    products.forEach((product: ProductWithId) => {
      if (product.metaFieldValues) {
        Object.entries(product.metaFieldValues).forEach(([fieldId, value]) => {
          if (!filtersMap.has(fieldId)) {
            filtersMap.set(fieldId, new Set())
            filterCounts.set(fieldId, 0)
          }
          
          // Count products that have this field
          filterCounts.set(fieldId, (filterCounts.get(fieldId) || 0) + 1)
          
          // Collect unique values
          if (Array.isArray(value)) {
            value.forEach(v => {
              if (v && v.trim()) {
                filtersMap.get(fieldId)?.add(v.trim())
              }
            })
          } else if (value && typeof value === 'string') {
            if (value.trim()) {
              filtersMap.get(fieldId)?.add(value.trim())
            }
          }
        })
      }
    })
    
    // Convert to FilterConfig array
    const filters: StoreFilterConfig[] = []
    filtersMap.forEach((valueSet, fieldId) => {
      if (valueSet.size > 0) {
        filters.push({
          id: fieldId,
          name: getFilterDisplayName(fieldId),
          type: getFilterType(fieldId),
          enabled: true,
          visible: true,
          order: filters.length,
          options: Array.from(valueSet).sort(),
          productCount: filterCounts.get(fieldId) || 0
        })
      }
    })
    
    // Sort by product count (most used first)
    return filters.sort((a, b) => b.productCount - a.productCount)
  } catch (error) {
    console.error('Error extracting filters from products:', error)
    return []
  }
}

/**
 * Get display name for filter field
 */
function getFilterDisplayName(fieldId: string): string {
  const nameMap: Record<string, string> = {
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
    'age_group': 'Grupo de edad',
    'processor': 'Procesador',
    'ram': 'Memoria RAM',
    'storage': 'Almacenamiento',
    'screen_size': 'Tamaño de Pantalla'
  }
  return nameMap[fieldId] || fieldId.charAt(0).toUpperCase() + fieldId.slice(1).replace(/_/g, ' ')
}

/**
 * Get filter type based on field ID
 */
function getFilterType(fieldId: string): 'text' | 'select' | 'tags' | 'range' {
  const typeMap: Record<string, 'text' | 'select' | 'tags' | 'range'> = {
    'color': 'tags',
    'size': 'tags',
    'gender': 'select',
    'material': 'select',
    'occasion': 'tags',
    'season': 'select',
    'style': 'tags',
    'category_type': 'select',
    'care': 'tags',
    'brand': 'select',
    'fit': 'select',
    'neckline': 'select',
    'sleeve_type': 'select',
    'pattern': 'tags',
    'age_group': 'select',
    'processor': 'select',
    'ram': 'tags',
    'storage': 'tags',
    'screen_size': 'select'
  }
  return typeMap[fieldId] || 'tags'
}

/**
 * Save store filters configuration to Firestore
 */
export async function saveStoreFilters(storeId: string, filters: StoreFilterConfig[]): Promise<void> {
  try {
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase not initialized')

    const storeRef = doc(db, 'stores', storeId)
    
    const filtersSettings: StoreFiltersSettings = {
      enabled: true,
      availableFilters: filters,
      displayOrder: filters
        .filter(f => f.enabled && f.visible)
        .sort((a, b) => a.order - b.order)
        .map(f => f.id)
    }
    
    await updateDoc(storeRef, {
      'settings.filters': filtersSettings,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error saving store filters:', error)
    throw error
  }
}

/**
 * Load store filters configuration from Firestore
 */
export async function getStoreFilters(storeId: string): Promise<StoreFilterConfig[]> {
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
    
    return filtersSettings?.availableFilters || []
  } catch (error) {
    console.error('Error loading store filters:', error)
    return []
  }
}

/**
 * Get store filters settings (complete configuration)
 */
export async function getStoreFiltersSettings(storeId: string): Promise<StoreFiltersSettings> {
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