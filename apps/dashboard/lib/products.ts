import { 
  doc, 
  getDoc, 
  query, 
  collection, 
  getDocs,
  serverTimestamp,
  updateDoc,
  deleteDoc,
  addDoc,
  orderBy
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

// Interfaces para productos
export interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
}

export interface MediaFile {
  id: string
  url: string
  cloudinaryPublicId?: string | null
}

export interface MetaField {
  id: string
  name: string
  type: 'text' | 'select' | 'tags'
  value?: string | string[]
}

export interface Product {
  // Información básica
  name: string
  description: string
  
  // Multimedia
  mediaFiles: MediaFile[]
  
  // Precios
  price: number
  comparePrice?: number | null
  cost?: number | null
  chargeTaxes: boolean
  
  // Organización
  selectedBrandId?: string | null
  selectedCategory?: string | null
  selectedParentCategoryIds: string[]
  selectedSubcategoryIds: string[]
  metaFieldValues: Record<string, string | string[]>
  
  // Variantes
  hasVariants: boolean
  variants: ProductVariant[]
  
  // Stock
  trackStock: boolean
  stockQuantity?: number | null
  
  // Envío
  requiresShipping: boolean
  weight?: number | null
  countryOrigin?: string | null
  harmonizedCode?: string | null
  
  // SEO
  seoTitle?: string | null
  metaDescription?: string | null
  urlSlug?: string
  
  // Estado
  status: 'draft' | 'active' | 'archived'
  
  // Metadatos
  storeId: string
  createdAt: Date | unknown
  updatedAt: Date | unknown
}

export type ProductWithId = Product & { id: string }

// Función auxiliar para limpiar valores undefined de un objeto
const cleanUndefinedValues = (obj: unknown): unknown => {
  if (obj === null || obj === undefined) {
    return null
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues).filter(item => item !== undefined)
  }
  
  if (typeof obj === 'object') {
    const cleaned: Record<string, unknown> = {}
    for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value)
      }
    }
    return cleaned
  }
  
  return obj
}

// Crear un nuevo producto
export const createProduct = async (storeId: string, productData: Omit<Product, 'storeId' | 'createdAt' | 'updatedAt'>) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }
    
    // Crear referencia a la subcolección de productos dentro de la tienda
    const productsCollectionRef = collection(db, 'stores', storeId, 'products')
    
    const newProduct: Product = {
      ...productData,
      storeId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Limpiar valores undefined antes de guardar
    const cleanedProduct = cleanUndefinedValues(newProduct)
    
    // Usar addDoc para generar automáticamente un ID
    const docRef = await addDoc(productsCollectionRef, cleanedProduct)
    
    // Auto-update filters if the product has metadata
    if (productData.metaFieldValues && Object.keys(productData.metaFieldValues).length > 0) {
      // Import dynamically to avoid circular dependency
      const { autoUpdateFiltersFromProduct } = await import('./store-filters')
      await autoUpdateFiltersFromProduct(storeId, productData.metaFieldValues)
    }
    
    return { id: docRef.id, ...newProduct }
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

// Obtener todos los productos de una tienda
export const getProducts = async (storeId: string): Promise<ProductWithId[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return []
    }
    
    const productsCollectionRef = collection(db, 'stores', storeId, 'products')
    const q = query(productsCollectionRef, orderBy('createdAt', 'desc'))
    const querySnapshot = await getDocs(q)
    
    const products: ProductWithId[] = []
    querySnapshot.forEach((doc) => {
      products.push({ id: doc.id, ...doc.data() } as ProductWithId)
    })
    
    return products
  } catch (error) {
    console.error('Error getting products:', error)
    return []
  }
}

// Obtener un producto específico
export const getProduct = async (storeId: string, productId: string): Promise<ProductWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return null
    }
    
    const productRef = doc(db, 'stores', storeId, 'products', productId)
    const productDoc = await getDoc(productRef)
    
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() } as ProductWithId
    }
    
    return null
  } catch (error) {
    console.error('Error getting product:', error)
    return null
  }
}

// Actualizar un producto
export const updateProduct = async (storeId: string, productId: string, data: Partial<Product>) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }
    
    const productRef = doc(db, 'stores', storeId, 'products', productId)
    await updateDoc(productRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    
    // Auto-update filters if the product metadata was updated
    if (data.metaFieldValues && Object.keys(data.metaFieldValues).length > 0) {
      // Import dynamically to avoid circular dependency
      const { autoUpdateFiltersFromProduct } = await import('./store-filters')
      await autoUpdateFiltersFromProduct(storeId, data.metaFieldValues)
    }
    
    return true
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// Eliminar un producto
export const deleteProduct = async (storeId: string, productId: string) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }
    
    const productRef = doc(db, 'stores', storeId, 'products', productId)
    await deleteDoc(productRef)
    
    return true
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
}

// Generar URL slug desde el nombre del producto
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
}

// Validar datos del producto
export const validateProduct = (productData: Partial<Product>): { isValid: boolean; errors: string[] } => {
  const errors: string[] = []
  
  if (!productData.name || productData.name.trim().length === 0) {
    errors.push('El nombre del producto es requerido')
  }
  
  if (!productData.price || productData.price <= 0) {
    errors.push('El precio debe ser mayor a 0')
  }
  
  if (productData.hasVariants && (!productData.variants || productData.variants.length === 0)) {
    errors.push('Debe agregar al menos una variante si el producto tiene variantes')
  }
  
  if (productData.variants && productData.variants.length > 0) {
    productData.variants.forEach((variant, index) => {
      if (!variant.name || variant.name.trim().length === 0) {
        errors.push(`La variante ${index + 1} debe tener un nombre`)
      }
      if (!variant.price || variant.price <= 0) {
        errors.push(`La variante ${index + 1} debe tener un precio válido`)
      }
      if (variant.stock < 0) {
        errors.push(`La variante ${index + 1} no puede tener stock negativo`)
      }
    })
  }
  
  // Validaciones opcionales
  if (productData.comparePrice && productData.comparePrice <= productData.price!) {
    errors.push('El precio de comparación debe ser mayor al precio regular')
  }
  
  if (productData.weight && productData.weight <= 0) {
    errors.push('El peso debe ser mayor a 0')
  }
  
  return { isValid: errors.length === 0, errors }
}

// Tipos para filtros y ordenación
export type SortOption = 'name-asc' | 'name-desc' | 'price-asc' | 'price-desc' | 'created-asc' | 'created-desc'

export interface ProductFilters {
  searchQuery?: string
  sortBy?: SortOption
  status?: 'all' | 'active' | 'draft' | 'archived'
  brandId?: string
  categoryId?: string
}

// Función para filtrar productos por texto de búsqueda
export const filterProductsBySearch = (products: ProductWithId[], searchQuery: string): ProductWithId[] => {
  if (!searchQuery || searchQuery.trim() === '') {
    return products
  }
  
  const query = searchQuery.toLowerCase().trim()
  
  return products.filter(product => {
    // Buscar en nombre y descripción del producto
    const nameMatch = product.name.toLowerCase().includes(query)
    const descriptionMatch = product.description?.toLowerCase().includes(query)
    
    return nameMatch || descriptionMatch
  })
}

// Función para ordenar productos
export const sortProducts = (products: ProductWithId[], sortBy: SortOption): ProductWithId[] => {
  const sortedProducts = [...products]
  
  switch (sortBy) {
    case 'name-asc':
      return sortedProducts.sort((a, b) => a.name.localeCompare(b.name))
    case 'name-desc':
      return sortedProducts.sort((a, b) => b.name.localeCompare(a.name))
    case 'price-asc':
      return sortedProducts.sort((a, b) => a.price - b.price)
    case 'price-desc':
      return sortedProducts.sort((a, b) => b.price - a.price)
    case 'created-asc':
      return sortedProducts.sort((a, b) => {
        const aTime = (a.createdAt as { seconds?: number })?.seconds || 0
        const bTime = (b.createdAt as { seconds?: number })?.seconds || 0
        return aTime - bTime
      })
    case 'created-desc':
    default:
      return sortedProducts.sort((a, b) => {
        const aTime = (a.createdAt as { seconds?: number })?.seconds || 0
        const bTime = (b.createdAt as { seconds?: number })?.seconds || 0
        return bTime - aTime
      })
  }
}

// Función para filtrar productos por estado
export const filterProductsByStatus = (products: ProductWithId[], status: 'all' | 'active' | 'draft' | 'archived'): ProductWithId[] => {
  if (status === 'all') {
    return products
  }
  return products.filter(product => product.status === status)
}

// Función para paginar productos
export const paginateProducts = (products: ProductWithId[], page: number, itemsPerPage: number): { 
  paginatedProducts: ProductWithId[], 
  totalPages: number,
  currentPage: number,
  totalItems: number
} => {
  const totalItems = products.length
  const totalPages = Math.ceil(totalItems / itemsPerPage)
  const currentPage = Math.max(1, Math.min(page, totalPages))
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  
  return {
    paginatedProducts: products.slice(startIndex, endIndex),
    totalPages,
    currentPage,
    totalItems
  }
}

// Función principal para obtener productos filtrados y paginados
export const getFilteredProducts = async (
  storeId: string, 
  filters: ProductFilters,
  page: number = 1,
  itemsPerPage: number = 15
) => {
  try {
    // Obtener todos los productos
    let products = await getProducts(storeId)
    
    // Aplicar filtros
    if (filters.searchQuery) {
      products = filterProductsBySearch(products, filters.searchQuery)
    }
    
    if (filters.status && filters.status !== 'all') {
      products = filterProductsByStatus(products, filters.status)
    }
    
    // Aplicar ordenación
    if (filters.sortBy) {
      products = sortProducts(products, filters.sortBy)
    }
    
    // Paginar
    const paginationResult = paginateProducts(products, page, itemsPerPage)
    
    return paginationResult
  } catch (error) {
    console.error('Error getting filtered products:', error)
    return {
      paginatedProducts: [],
      totalPages: 0,
      currentPage: 1,
      totalItems: 0
    }
  }
} 