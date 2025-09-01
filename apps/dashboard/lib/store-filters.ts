import { 
  doc, 
  collection,
  getDocs,
  query,
  orderBy,
  writeBatch
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { getProducts } from './products'
import { getStore } from './store'

// Import StoreLanguage type for consistency
type StoreLanguage = 'es' | 'en' | 'pt'

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
 * Process filter values - translate metadata keys using dashboard i18n system
 */
async function processFilterValue(value: string, fieldId: string, language: StoreLanguage = 'es'): Promise<string | null> {
  if (!value || typeof value !== 'string') return null
  
  let processedValue = value.trim()
  
  console.log(`🔄 Processing filter value: "${value}" for field "${fieldId}" in language: ${language}`)
  
  // If it's a metadata translation key, try to translate it
  if (processedValue.startsWith('metadata.values.')) {
    console.log(`🌐 Found translation key: "${processedValue}"`)
    
    // Extract the key parts: metadata.values.pet_type_options.Perro
    const parts = processedValue.split('.')
    if (parts.length >= 4) {
      const originalValue = parts[3] // Perro
      
      console.log(`🌐 Attempting to translate option "${originalValue}" for field "${fieldId}"`)
      
      // Use the translation system
      const translatedValue = await translateFilterOptionValue(fieldId, originalValue, language)
      processedValue = translatedValue
      console.log(`🌐 Translated value: "${processedValue}"`)
    } else {
      // Fallback: extract the last part
      processedValue = parts[parts.length - 1]
      console.log(`🌐 Fallback extraction: "${processedValue}"`)
    }
  } else {
    // For non-metadata values, still try to translate them
    const translatedValue = await translateFilterOptionValue(fieldId, processedValue, language)
    processedValue = translatedValue
    console.log(`🌐 Translated non-metadata value: "${processedValue}"`)
  }
  
  // Additional cleaning: normalize whitespace
  processedValue = processedValue.replace(/\s+/g, ' ').trim()
  
  // Skip empty values after processing
  if (processedValue.length === 0) {
    console.log(`🔄 Skipping empty value after processing`)
    return null
  }
  
  console.log(`🔄 Final processed value: "${processedValue}"`)
  return processedValue
}

/**
 * Extract available filters from store products based on their metaFieldValues
 */
export async function extractFiltersFromProducts(storeId: string): Promise<StoreFilterConfig[]> {
  try {
    const [products, store] = await Promise.all([
      getProducts(storeId),
      getStore(storeId)
    ])
    
    const storeLanguage = store?.advanced?.language || store?.language || 'es'
    console.log(`🌐 Store language detected: ${storeLanguage}`, { 
      advancedLanguage: store?.advanced?.language, 
      directLanguage: store?.language,
      storeId 
    })
    
    const filtersMap = new Map<string, Set<string>>()
    const filterCounts = new Map<string, number>()
    
    // Extract metadata from all products
    for (const [productIndex, product] of products.entries()) {
      console.log(`🔍 Processing product ${productIndex + 1}/${products.length}: "${product.name}"`)
      console.log(`🔍 Product metaFieldValues:`, product.metaFieldValues)
      
      if (product.metaFieldValues) {
        for (const [fieldId, value] of Object.entries(product.metaFieldValues)) {
          console.log(`🔍 Processing field "${fieldId}" with value:`, value)
          
          if (!filtersMap.has(fieldId)) {
            filtersMap.set(fieldId, new Set())
            filterCounts.set(fieldId, 0)
          }
          
          // Count products that have this field
          filterCounts.set(fieldId, (filterCounts.get(fieldId) || 0) + 1)
          
          // Collect unique values with processing
          if (Array.isArray(value)) {
            console.log(`🔍 Processing array values for "${fieldId}":`, value)
            for (const v of value) {
              const processedValue = await processFilterValue(v, fieldId, storeLanguage)
              if (processedValue) {
                console.log(`✅ Adding processed value "${processedValue}" to filter "${fieldId}"`)
                filtersMap.get(fieldId)?.add(processedValue)
              }
            }
          } else if (value && typeof value === 'string') {
            console.log(`🔍 Processing string value for "${fieldId}": "${value}"`)
            const processedValue = await processFilterValue(value, fieldId, storeLanguage)
            if (processedValue) {
              console.log(`✅ Adding processed value "${processedValue}" to filter "${fieldId}"`)
              filtersMap.get(fieldId)?.add(processedValue)
            }
          }
        }
      }
    }
    
    // Log final filter options before creating filters
    console.log('🔍 Final filter options after processing all products:')
    filtersMap.forEach((valueSet, fieldId) => {
      console.log(`  ${fieldId}: [${Array.from(valueSet).join(', ')}]`)
    })
    
    // Convert to FilterConfig array
    const filters: StoreFilterConfig[] = []
    for (const [fieldId, valueSet] of filtersMap.entries()) {
      if (valueSet.size > 0) {
        // Additional deduplication: convert to array, sort, and remove any remaining duplicates
        const optionsArray = Array.from(valueSet)
        const uniqueOptions = [...new Set(optionsArray)].sort()
        
        // Log if we found duplicates
        if (optionsArray.length !== uniqueOptions.length) {
          console.log(`⚠️ Found duplicates in filter "${fieldId}":`)
          console.log(`  Original: [${optionsArray.join(', ')}]`)
          console.log(`  Cleaned: [${uniqueOptions.join(', ')}]`)
        }
        
        // Translate field name and options
        const translatedName = await getFilterDisplayName(fieldId, storeLanguage)
        const translatedOptions: string[] = []
        
        for (const option of uniqueOptions) {
          const translatedOption = await translateFilterOptionValue(fieldId, option, storeLanguage)
          translatedOptions.push(translatedOption)
        }
        
        console.log(`🌐 Translated filter "${fieldId}": "${translatedName}" with options:`, translatedOptions)
        
        filters.push({
          id: fieldId,
          name: translatedName,
          type: getFilterType(fieldId),
          visible: true,
          order: filters.length,
          options: translatedOptions,
          productCount: filterCounts.get(fieldId) || 0
        })
      }
    }
    
    // Sort by product count (most used first)
    return filters.sort((a, b) => b.productCount - a.productCount)
  } catch (error) {
    console.error('Error extracting filters from products:', error)
    return []
  }
}

/**
 * Get display name for filter field using dashboard i18n system
 */
async function getFilterDisplayName(fieldId: string, language: 'es' | 'en' | 'pt' = 'es'): Promise<string> {
  console.log(`🔍 Attempting to translate field "${fieldId}" to language "${language}"`)
  
  try {
    // Cargar las traducciones de metadatos del dashboard
    const metadataMessages = await import(`../messages/${language}/categories/metadata.json`)
    const translations = metadataMessages.default
    
    console.log(`📖 Loaded translation file for ${language}, structure:`, {
      hasMetadata: !!translations?.metadata,
      hasFields: !!translations?.metadata?.fields,
      fieldExists: !!translations?.metadata?.fields?.[fieldId],
      availableFields: translations?.metadata?.fields ? Object.keys(translations.metadata.fields).slice(0, 5) : []
    })
    
    // Buscar la traducción del campo usando la estructura: metadata.fields.{fieldId}
    const translatedName = translations?.metadata?.fields?.[fieldId]
    
    if (translatedName) {
      console.log(`✅ Found translation for field "${fieldId}": "${translatedName}"`)
      return translatedName
    }
    
    console.log(`❌ No translation found for field "${fieldId}", using fallback`)
  } catch (error) {
    console.log(`❌ Error loading translations for field "${fieldId}":`, error)
  }

  // Fallback: format the field ID nicely
  const fallback = fieldId.charAt(0).toUpperCase() + fieldId.slice(1).replace(/_/g, ' ')
  console.log(`🔄 Using fallback for "${fieldId}": "${fallback}"`)
  return fallback
}

/**
 * Translate filter option value using dashboard i18n system
 */
async function translateFilterOptionValue(fieldId: string, optionValue: string, language: 'es' | 'en' | 'pt' = 'es'): Promise<string> {
  console.log(`🔍 Attempting to translate option "${optionValue}" for field "${fieldId}" to language "${language}"`)
  
  try {
    // Cargar las traducciones de metadatos del dashboard
    const metadataMessages = await import(`../messages/${language}/categories/metadata.json`)
    const translations = metadataMessages.default
    
    console.log(`📖 Loaded translations for ${language}, checking structure:`, {
      hasMetadata: !!translations?.metadata,
      hasValues: !!translations?.metadata?.values,
      hasFieldOptions: !!translations?.metadata?.values?.[`${fieldId}_options`],
      availableOptions: translations?.metadata?.values?.[`${fieldId}_options`] ? Object.keys(translations.metadata.values[`${fieldId}_options`]).slice(0, 3) : []
    })
    
    // Buscar la traducción de la opción usando la estructura: metadata.values.{fieldId}_options.{optionValue}
    const translatedOption = translations?.metadata?.values?.[`${fieldId}_options`]?.[optionValue]
    
    if (translatedOption) {
      console.log(`✅ Found translation for option "${optionValue}": "${translatedOption}"`)
      return translatedOption
    }
    
    console.log(`❌ No translation found for option "${optionValue}" in field "${fieldId}", using original`)
  } catch (error) {
    console.log(`❌ Error loading option translation for "${optionValue}":`, error)
  }

  // Fallback: return original value
  console.log(`🔄 Fallback: returning original value "${optionValue}"`)
  return optionValue
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
    console.log('Saving filters for store:', storeId, 'Filters count:', filters.length)
    
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase not initialized')

    // Get a new batch
    const batch = writeBatch(db)

    // Reference to the filters collection
    const filtersRef = collection(db, 'stores', storeId, 'filters')

    // Delete all existing filters first
    try {
      const existingFilters = await getDocs(filtersRef)
      console.log('Deleting existing filters:', existingFilters.size)
      existingFilters.forEach(doc => {
        batch.delete(doc.ref)
      })
    } catch (deleteError) {
      console.warn('Error deleting existing filters (might not exist):', deleteError)
    }

    // Add all new filters
    filters.forEach((filter, index) => {
      try {
        const filterDoc = doc(filtersRef, filter.id)
        const filterData = {
          id: filter.id,
          name: filter.name,
          type: filter.type,
          visible: filter.visible,
          order: filter.order,
          options: filter.options,
          productCount: filter.productCount,
          updatedAt: new Date()
        }
        batch.set(filterDoc, filterData)
        console.log(`Adding filter ${index + 1}/${filters.length}:`, filter.id, filter.name)
      } catch (filterError) {
        console.error(`Error preparing filter ${filter.id}:`, filterError)
        throw filterError
      }
    })

    // Commit the batch
    console.log('Committing batch with', filters.length, 'filters')
    await batch.commit()
    console.log('✅ Filters saved successfully')
  } catch (error) {
    console.error('❌ Error saving store filters:', error)
    if (error instanceof Error) {
      throw new Error(`Failed to save filters: ${error.message}`)
    }
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

/**
 * Update existing filter names to match store language
 * This is a utility function to fix existing filters with incorrect language
 */
export async function updateFilterNamesForLanguage(storeId: string): Promise<void> {
  try {
    console.log('🌐 Updating filter names for store language:', storeId)
    
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase not initialized')

    // Get store and existing filters
    const [store, existingFilters] = await Promise.all([
      getStore(storeId),
      getStoreFilters(storeId)
    ])

    if (!store || existingFilters.length === 0) {
      console.log('ℹ️ No store or filters found')
      return
    }

    const storeLanguage = store?.advanced?.language || store?.language || 'es'
    console.log('🌐 Store language:', storeLanguage)

    // Prepare batch update for filter names
    const batch = writeBatch(db)
    const filtersRef = collection(db, 'stores', storeId, 'filters')
    let hasChanges = false

    for (const filter of existingFilters) {
      const correctName = await getFilterDisplayName(filter.id, storeLanguage)
      
      if (filter.name !== correctName) {
        const filterDoc = doc(filtersRef, filter.id)
        batch.update(filterDoc, {
          name: correctName,
          updatedAt: new Date()
        })
        hasChanges = true
        
        console.log(`📝 Updating filter "${filter.id}": "${filter.name}" → "${correctName}"`)
      }
    }

    // Only commit if there are changes
    if (hasChanges) {
      await batch.commit()
      console.log('✅ Filter names updated successfully')
    } else {
      console.log('ℹ️ No filter name changes needed')
    }
  } catch (error) {
    console.error('❌ Error updating filter names:', error)
    throw error
  }
}

/**
 * Automatically update filters when a product is created or updated
 * This function maintains existing filter visibility settings while updating options
 */
export async function autoUpdateFiltersFromProduct(storeId: string, productMetaFieldValues: Record<string, string | string[]>): Promise<void> {
  try {
    if (!productMetaFieldValues || Object.keys(productMetaFieldValues).length === 0) {
      return // No metadata to process
    }

    console.log('🔄 Auto-updating filters for store:', storeId, 'with metadata:', productMetaFieldValues)
    
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase not initialized')

    // Get existing filters, all products, and store info
    const [existingFilters, allProducts, store] = await Promise.all([
      getStoreFilters(storeId),
      getProducts(storeId),
      getStore(storeId)
    ])
    
    const existingFiltersMap = new Map(existingFilters.map(f => [f.id, f]))
    const storeLanguage = store?.advanced?.language || store?.language || 'es'
    
    // Extract all unique filter values from all products
    const filtersMap = new Map<string, Set<string>>()
    const filterCounts = new Map<string, number>()
    
    for (const product of allProducts) {
      if (product.metaFieldValues) {
        for (const [fieldId, value] of Object.entries(product.metaFieldValues)) {
          if (!filtersMap.has(fieldId)) {
            filtersMap.set(fieldId, new Set())
            filterCounts.set(fieldId, 0)
          }
          
          // Count products that have this field
          filterCounts.set(fieldId, (filterCounts.get(fieldId) || 0) + 1)
          
          // Collect unique values with processing
          if (Array.isArray(value)) {
            for (const v of value) {
              const processedValue = await processFilterValue(v, fieldId, storeLanguage)
              if (processedValue) {
                filtersMap.get(fieldId)?.add(processedValue)
              }
            }
          } else if (value && typeof value === 'string') {
            const processedValue = await processFilterValue(value, fieldId, storeLanguage)
            if (processedValue) {
              filtersMap.get(fieldId)?.add(processedValue)
            }
          }
        }
      }
    }

    // Prepare batch update
    const batch = writeBatch(db)
    const filtersRef = collection(db, 'stores', storeId, 'filters')
    let hasChanges = false

    // Update or create filters
    for (const [fieldId, valueSet] of filtersMap.entries()) {
      if (valueSet.size > 0) {
        const existingFilter = existingFiltersMap.get(fieldId)
        
        // Additional deduplication: convert to array, sort, and remove any remaining duplicates
        const optionsArray = Array.from(valueSet)
        const newOptions = [...new Set(optionsArray)].sort()
        
        // Log if we found duplicates
        if (optionsArray.length !== newOptions.length) {
          console.log(`⚠️ Found duplicates in auto-update for filter "${fieldId}":`)
          console.log(`  Original: [${optionsArray.join(', ')}]`)
          console.log(`  Cleaned: [${newOptions.join(', ')}]`)
        }
        
        // Check if options have changed
        const optionsChanged = !existingFilter || 
          JSON.stringify(existingFilter.options) !== JSON.stringify(newOptions)
        
        if (optionsChanged || !existingFilter) {
          const filterDoc = doc(filtersRef, fieldId)
          const filterData = {
            id: fieldId,
            name: existingFilter?.name || await getFilterDisplayName(fieldId, storeLanguage),
            type: existingFilter?.type || getFilterType(fieldId),
            visible: existingFilter?.visible ?? true, // Default to visible for new filters
            order: existingFilter?.order ?? existingFilters.length,
            options: newOptions,
            productCount: filterCounts.get(fieldId) || 0,
            updatedAt: new Date()
          }
          
          batch.set(filterDoc, filterData)
          hasChanges = true
          
          console.log(`📝 ${existingFilter ? 'Updated' : 'Created'} filter: ${fieldId} with ${newOptions.length} options: [${newOptions.join(', ')}]`)
        }
      }
    }

    // Only commit if there are changes
    if (hasChanges) {
      await batch.commit()
      console.log('✅ Auto-updated filters successfully')
    } else {
      console.log('ℹ️ No filter changes needed')
    }
  } catch (error) {
    console.error('❌ Error auto-updating filters:', error)
    // Don't throw - we don't want to break product creation/update if filter update fails
  }
} 