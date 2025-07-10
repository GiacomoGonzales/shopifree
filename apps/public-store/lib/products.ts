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
  mediaFiles: Array<{
    id: string
    url: string
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
    mediaFiles: dbProduct.mediaFiles || [],
    hasVariants: dbProduct.hasVariants || false,
    variants: dbProduct.variants || []
  }
  
  console.log('✨ Product transformed:', transformedProduct.name, 'Price:', transformedProduct.price)
  return transformedProduct
}

// Get all active products for a store
export const getStoreProducts = async (storeId: string): Promise<PublicProduct[]> => {
  try {
    console.log('🔍 Getting products for store:', storeId)
    const db = getFirebaseDb()
    if (!db) {
      console.error('❌ Firebase db not available - check environment variables')
      console.log('Firebase config check:', {
        hasApiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        hasProjectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        hasAuthDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
      })
      return []
    }
    
    console.log('✅ Firebase DB connected successfully')
    
    const productsCollectionRef = collection(db, 'stores', storeId, 'products')
    
    // Primero vamos a ver TODOS los productos para debug
    console.log('🔍 First checking ALL products in store...')
    const allProductsSnapshot = await getDocs(productsCollectionRef)
    console.log('📊 Total products in store (any status):', allProductsSnapshot.size)
    
    if (allProductsSnapshot.size === 0) {
      console.log('⚠️ No products found in store at all')
      return []
    }
    
    // Log de todos los productos para debug
    allProductsSnapshot.forEach((doc) => {
      const data = doc.data()
      console.log('📋 Product found:', doc.id, {
        status: data.status,
        name: data.name,
        price: data.price,
        description: data.description,
        hasAllFields: {
          status: !!data.status,
          name: !!data.name,
          price: !!data.price,
          description: !!data.description
        }
      })
    })
    
    // TEMPORALMENTE: Obtener TODOS los productos sin filtrar por status
    console.log('📋 Executing query for ALL products (no status filter for debug)...')
    const querySnapshot = await getDocs(productsCollectionRef)
    console.log('📊 Query completed. Documents found:', querySnapshot.size)
    
    const products: PublicProduct[] = []
    querySnapshot.forEach((doc) => {
      console.log('📄 Processing product:', doc.id, doc.data())
      const productData = { id: doc.id, ...doc.data() }
      try {
        const transformedProduct = transformToPublicProduct(productData)
        products.push(transformedProduct)
        console.log('✅ Product transformed successfully:', transformedProduct.name)
      } catch (transformError) {
        console.error('❌ Error transforming product:', doc.id, transformError)
      }
    })
    
    console.log('🎉 Total products processed:', products.length)
    return products
  } catch (error) {
    console.error('❌ Error getting store products:', error)
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
    const allProducts = await getStoreProducts(storeId)
    return allProducts.slice(0, limit)
  } catch (error) {
    console.error('Error getting featured products:', error)
    return []
  }
} 