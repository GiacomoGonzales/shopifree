import { 
  doc, 
  getDoc, 
  query, 
  collection, 
  getDocs,
  where
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

// Product interfaces for public store
export interface PublicProduct {
  id: string
  name: string
  description: string
  price: number
  comparePrice?: number | null
  image: string
  currency: string
  rating?: number
  reviews?: number
  status: 'draft' | 'active' | 'archived'
  slug?: string
  selectedParentCategoryIds?: string[]
  mediaFiles: Array<{
    id: string
    url: string
    type?: 'image' | 'video'
    cloudinaryPublicId?: string | null
  }>
  hasVariants: boolean
  variants: Array<{
    id: string
    name: string
    price: number
    stock: number
  }>
  metaFieldValues?: Record<string, string | string[]>
}

// Transform database product to public product format
const transformToPublicProduct = (dbProduct: Record<string, unknown>): PublicProduct => {
  // Get the first media file as the main image, fallback to placeholder
  const mediaFiles = dbProduct.mediaFiles as Array<{ id: string; url: string; type?: string; cloudinaryPublicId?: string }> || []
  const mainImage = mediaFiles.length > 0 ? mediaFiles[0].url : '/api/placeholder/300/400'

  // Transform mediaFiles to include type detection
  const transformedMediaFiles = mediaFiles.map((file) => ({
    id: file.id,
    url: file.url,
    type: (file.type || (file.url.includes('.mp4') || file.url.includes('.webm') || file.url.includes('.mov') ? 'video' : 'image')) as 'image' | 'video',
    cloudinaryPublicId: file.cloudinaryPublicId || null
  }))

  const productName = dbProduct.name as string || 'Producto sin nombre'
  const productId = dbProduct.id as string

  const transformedProduct = {
    id: productId,
    name: productName,
    description: dbProduct.description as string || 'Sin descripción',
    price: dbProduct.price as number || 0,
    comparePrice: dbProduct.comparePrice as number | null,
    image: mainImage,
    currency: '$', // Default currency, could be from store settings
    rating: 4.5, // Mock rating for now
    reviews: Math.floor(Math.random() * 200) + 50, // Mock reviews
    status: (dbProduct.status as 'draft' | 'active' | 'archived') || 'active', // Default to active if no status
    slug: (dbProduct.urlSlug as string) || (dbProduct.slug as string) || `${productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${productId.slice(-6)}` || `producto-${productId.slice(-6)}`,
    selectedParentCategoryIds: dbProduct.selectedParentCategoryIds as string[] || [],
    mediaFiles: transformedMediaFiles,
    hasVariants: dbProduct.hasVariants as boolean || false,
    variants: dbProduct.variants as Array<{ id: string; name: string; price: number; stock: number }> || [],
    metaFieldValues: dbProduct.metaFieldValues as Record<string, string | string[]> || {}
  }
  
  return transformedProduct
}

// Get all active products for a store
export async function getStoreProducts(storeId: string): Promise<PublicProduct[]> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return []
    }

    console.log('🏪 Getting products for store:', storeId)
    
    const productsRef = collection(db, 'stores', storeId, 'products')
    
    // Intentar con diferentes filtros según los campos disponibles
    let querySnapshot
    try {
      // Primero intentar con el filtro de status = 'active'
      const activeProductsQuery = query(
        productsRef,
        where('status', '==', 'active')
      )
      querySnapshot = await getDocs(activeProductsQuery)
      console.log('✅ Found products with status filter:', querySnapshot.size)
    } catch (statusError) {
      console.log('⚠️ Status filter failed, trying without filters')
      // Si falla, obtener todos los productos
      querySnapshot = await getDocs(productsRef)
      console.log('✅ Found products without filters:', querySnapshot.size)
    }
    
    const products: PublicProduct[] = []
    querySnapshot.forEach((doc) => {
      const productData = { id: doc.id, ...doc.data() }
      try {
        const transformedProduct = transformToPublicProduct(productData)
        // Solo agregar productos que estén activos
        if (transformedProduct.status === 'active') {
          products.push(transformedProduct)
        }
      } catch (transformError) {
        console.error('❌ Error transforming product:', doc.id, transformError)
      }
    })
    
    console.log('✅ Active products loaded:', products.length)
    return products
  } catch (error) {
    console.error('❌ Error getting store products:', error)
    return []
  }
}

// Search products by query
export const searchProducts = async (storeId: string, searchQuery: string, limit: number = 10): Promise<PublicProduct[]> => {
  try {
    console.log('🔍 Searching products for store:', storeId, 'Query:', searchQuery)
    
    if (!searchQuery || searchQuery.trim().length === 0) {
      return []
    }
    
    // Get all products first (since Firestore doesn't support full-text search natively)
    const allProducts = await getStoreProducts(storeId)
    
    // Filter products based on search query
    const searchTerms = searchQuery.toLowerCase().trim().split(' ')
    
    const filteredProducts = allProducts.filter(product => {
      const productText = `${product.name} ${product.description}`.toLowerCase()
      
      // Check if all search terms are found in the product text
      return searchTerms.every(term => productText.includes(term))
    })
    
    console.log('🎯 Search results:', filteredProducts.length, 'products found')
    
    // Return limited results
    return filteredProducts.slice(0, limit)
  } catch (error) {
    console.error('❌ Error searching products:', error)
    return []
  }
}

// Get search suggestions based on existing products
export const getSearchSuggestions = async (storeId: string): Promise<string[]> => {
  try {
    const allProducts = await getStoreProducts(storeId)
    
    // Extract unique words from product names for suggestions
    const suggestions = new Set<string>()
    
    allProducts.forEach(product => {
      // Add product name words
      const nameWords = product.name.toLowerCase().split(' ')
      nameWords.forEach(word => {
        if (word.length > 2) { // Only words longer than 2 characters
          suggestions.add(word.charAt(0).toUpperCase() + word.slice(1))
        }
      })
    })
    
    // Convert to array and return first 5
    return Array.from(suggestions).slice(0, 5)
  } catch (error) {
    console.error('❌ Error getting search suggestions:', error)
    return []
  }
}

// Get a specific product by ID
export const getStoreProduct = async (storeId: string, productId: string): Promise<PublicProduct | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return null
    }
    
    const productRef = doc(db, 'stores', storeId, 'products', productId)
    const productDoc = await getDoc(productRef)
    
    if (productDoc.exists()) {
      const productData = { id: productDoc.id, ...productDoc.data() }
      return transformToPublicProduct(productData)
    }
    
    return null
  } catch (error) {
    console.error('Error getting store product:', error)
    return null
  }
}

// Get featured products (first 6 active products)
export const getFeaturedProducts = async (storeId: string, limit: number = 6): Promise<PublicProduct[]> => {
  try {
    if (!storeId) {
      console.warn('No store ID provided for featured products')
      return []
    }
    
    const allProducts = await getStoreProducts(storeId)
    return allProducts.slice(0, limit)
  } catch (error) {
    console.error('Error getting featured products:', error)
    return []
  }
}

// Interface for dynamic filters
export interface DynamicFilter {
  id: string
  name: string
  type: 'select' | 'tags' | 'range'
  options: string[]
  selectedOptions: string[]
}

// Interface for price range filter
export interface PriceRange {
  min: number
  max: number
}

// Extract dynamic filters from products based on their metaFieldValues
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

// Interface for price range options
export interface PriceRangeOption {
  id: string
  label: string
  min: number
  max: number
  selected: boolean
}

// Get price range from products
export const getPriceRange = (products: PublicProduct[]): PriceRange => {
  if (products.length === 0) {
    return { min: 0, max: 1000 }
  }
  
  const prices = products.map(p => p.price).filter(p => p > 0)
  
  if (prices.length === 0) {
    return { min: 0, max: 1000 }
  }
  
  return {
    min: Math.min(...prices),
    max: Math.max(...prices)
  }
}

// Generate price range options based on products
export const generatePriceRangeOptions = (products: PublicProduct[]): PriceRangeOption[] => {
  if (products.length === 0) {
    return []
  }
  
  const prices = products.map(p => p.price).filter(p => p > 0)
  
  if (prices.length === 0) {
    return []
  }
  
  const minPrice = Math.min(...prices)
  const maxPrice = Math.max(...prices)
  
  // Si el rango es muy pequeño, crear rangos más granulares
  const priceRange = maxPrice - minPrice
  
  const options: PriceRangeOption[] = []
  
  if (priceRange <= 100) {
    // Para rangos pequeños (0-100), crear rangos de 25
    const ranges = [
      { min: 0, max: 25 },
      { min: 25, max: 50 },
      { min: 50, max: 75 },
      { min: 75, max: 100 },
      { min: 100, max: Infinity }
    ]
    
    ranges.forEach((range, index) => {
      const effectiveMax = range.max === Infinity ? maxPrice : range.max
      const hasProducts = products.some(p => p.price >= range.min && p.price < (range.max === Infinity ? Infinity : range.max))
      
      if (hasProducts && range.min <= maxPrice) {
        options.push({
          id: `range-${index}`,
          label: range.max === Infinity ? `Más de S/ ${range.min}` : `S/ ${range.min} - S/ ${effectiveMax}`,
          min: range.min,
          max: effectiveMax,
          selected: false
        })
      }
    })
  } else if (priceRange <= 500) {
    // Para rangos medianos (100-500), crear rangos de 50
    const ranges = [
      { min: 0, max: 50 },
      { min: 50, max: 100 },
      { min: 100, max: 200 },
      { min: 200, max: 300 },
      { min: 300, max: 500 },
      { min: 500, max: Infinity }
    ]
    
    ranges.forEach((range, index) => {
      const effectiveMax = range.max === Infinity ? maxPrice : range.max
      const hasProducts = products.some(p => p.price >= range.min && p.price < (range.max === Infinity ? Infinity : range.max))
      
      if (hasProducts && range.min <= maxPrice) {
        options.push({
          id: `range-${index}`,
          label: range.max === Infinity ? `Más de S/ ${range.min}` : `S/ ${range.min} - S/ ${effectiveMax}`,
          min: range.min,
          max: effectiveMax,
          selected: false
        })
      }
    })
  } else {
    // Para rangos grandes (500+), crear rangos de 100
    const ranges = [
      { min: 0, max: 100 },
      { min: 100, max: 200 },
      { min: 200, max: 300 },
      { min: 300, max: 500 },
      { min: 500, max: 1000 },
      { min: 1000, max: Infinity }
    ]
    
    ranges.forEach((range, index) => {
      const effectiveMax = range.max === Infinity ? maxPrice : range.max
      const hasProducts = products.some(p => p.price >= range.min && p.price < (range.max === Infinity ? Infinity : range.max))
      
      if (hasProducts && range.min <= maxPrice) {
        options.push({
          id: `range-${index}`,
          label: range.max === Infinity ? `Más de S/ ${range.min}` : `S/ ${range.min} - S/ ${effectiveMax}`,
          min: range.min,
          max: effectiveMax,
          selected: false
        })
      }
    })
  }
  
  return options
}

// Apply dynamic filters to products
export const applyDynamicFilters = (
  products: PublicProduct[],
  filters: DynamicFilter[],
  priceRangeOptions: PriceRangeOption[]
): PublicProduct[] => {
  return products.filter(product => {
    // Aplicar filtro de precio por rangos
    const selectedPriceRanges = priceRangeOptions.filter(option => option.selected)
    if (selectedPriceRanges.length > 0) {
      const priceMatches = selectedPriceRanges.some(range => 
        product.price >= range.min && product.price <= range.max
      )
      if (!priceMatches) {
        return false
      }
    }
    
    // Aplicar filtros dinámicos
    for (const filter of filters) {
      if (filter.selectedOptions.length > 0) {
        const productValues = product.metaFieldValues?.[filter.id]
        
        if (!productValues) {
          return false
        }
        
        let hasMatch = false
        
        if (Array.isArray(productValues)) {
          // Para campos de tipo 'tags', verificar si algún valor coincide
          hasMatch = productValues.some(value => 
            filter.selectedOptions.includes(value)
          )
        } else if (typeof productValues === 'string') {
          // Para campos de tipo 'select' o 'text'
          hasMatch = filter.selectedOptions.includes(productValues)
        }
        
        if (!hasMatch) {
          return false
        }
      }
    }
    
    return true
  })
} 