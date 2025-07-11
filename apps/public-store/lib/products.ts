import { 
  doc, 
  getDoc, 
  query, 
  collection, 
  getDocs,
  orderBy,
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
}

// Transform database product to public product format
const transformToPublicProduct = (dbProduct: any): PublicProduct => {
  // Get the first media file as the main image, fallback to placeholder
  const mainImage = dbProduct.mediaFiles && dbProduct.mediaFiles.length > 0 
    ? dbProduct.mediaFiles[0].url 
    : '/api/placeholder/300/400'

  // Transform mediaFiles to include type detection
  const transformedMediaFiles = dbProduct.mediaFiles ? dbProduct.mediaFiles.map((file: any) => ({
    id: file.id,
    url: file.url,
    type: file.type || (file.url.includes('.mp4') || file.url.includes('.webm') || file.url.includes('.mov') ? 'video' : 'image'),
    cloudinaryPublicId: file.cloudinaryPublicId || null
  })) : []

  const transformedProduct = {
    id: dbProduct.id,
    name: dbProduct.name || 'Producto sin nombre',
    description: dbProduct.description || 'Sin descripción',
    price: dbProduct.price || 0,
    comparePrice: dbProduct.comparePrice,
    image: mainImage,
    currency: '$', // Default currency, could be from store settings
    rating: 4.5, // Mock rating for now
    reviews: Math.floor(Math.random() * 200) + 50, // Mock reviews
    status: dbProduct.status || 'active', // Default to active if no status
    slug: dbProduct.urlSlug || dbProduct.slug || `${dbProduct.name?.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${dbProduct.id?.slice(-6)}` || `producto-${dbProduct.id?.slice(-6)}`,
    selectedParentCategoryIds: dbProduct.selectedParentCategoryIds || [],
    mediaFiles: transformedMediaFiles,
    hasVariants: dbProduct.hasVariants || false,
    variants: dbProduct.variants || []
  }
  
  console.log('✨ Product transformed:', transformedProduct.name, 'Price:', transformedProduct.price, 'Media files:', transformedMediaFiles.length)
  return transformedProduct
}

// Get all active products for a store
export const getStoreProducts = async (storeId: string): Promise<PublicProduct[]> => {
  try {
    console.log('🔍 Getting products for store:', storeId)
    const db = getFirebaseDb()
    if (!db) {
      console.error('❌ Firebase db not available - check environment variables')
      return []
    }
    
    console.log('✅ Firebase DB connected successfully')
    
    const productsCollectionRef = collection(db, 'stores', storeId, 'products')
    
    // Obtener solo productos activos
    console.log('📋 Executing query for ACTIVE products only...')
    const activeProductsQuery = query(
      productsCollectionRef,
      where('status', '==', 'active')
    )
    
    const querySnapshot = await getDocs(activeProductsQuery)
    console.log('📊 Active products found:', querySnapshot.size)
    
    const products: PublicProduct[] = []
    querySnapshot.forEach((doc) => {
      console.log('📄 Processing active product:', doc.id, doc.data().name)
      const productData = { id: doc.id, ...doc.data() }
      try {
        const transformedProduct = transformToPublicProduct(productData)
        products.push(transformedProduct)
        console.log('✅ Product transformed successfully:', transformedProduct.name)
      } catch (transformError) {
        console.error('❌ Error transforming product:', doc.id, transformError)
      }
    })
    
    console.log('🎉 Total active products processed:', products.length)
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