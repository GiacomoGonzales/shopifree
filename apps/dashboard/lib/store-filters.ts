import { 
  doc, 
  collection,
  getDocs,
  query,
  orderBy,
  writeBatch,
  getDoc,
  setDoc,
  deleteDoc
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { getProducts, ProductWithId } from './products'

export interface StoreFilterConfig {
  id: string
  name: string
  type: 'text' | 'select' | 'tags' | 'range'
  visible: boolean
  order: number
  options: string[]
  productCount: number
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
    products.forEach(product => {
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

    // Get a new batch
    const batch = writeBatch(db)

    // Reference to the filters collection
    const filtersRef = collection(db, 'stores', storeId, 'filters')

    // Delete all existing filters first
    const existingFilters = await getDocs(filtersRef)
    existingFilters.forEach(doc => {
      batch.delete(doc.ref)
    })

    // Add all new filters
    filters.forEach(filter => {
      const filterDoc = doc(filtersRef, filter.id)
      batch.set(filterDoc, {
        ...filter,
        updatedAt: new Date()
      })
    })

    // Commit the batch
    await batch.commit()
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

    // Query the filters subcollection, ordered by order field
    const filtersRef = collection(db, 'stores', storeId, 'filters')
    const q = query(filtersRef, orderBy('order', 'asc'))
    const querySnapshot = await getDocs(q)
    
    const filters: StoreFilterConfig[] = []
    querySnapshot.forEach(doc => {
      const data = doc.data()
      filters.push({
        id: doc.id,
        name: data.name,
        type: data.type,
        visible: data.visible,
        order: data.order,
        options: data.options,
        productCount: data.productCount
      })
    })
    
    return filters
  } catch (error) {
    console.error('Error loading store filters:', error)
    return []
  }
} 