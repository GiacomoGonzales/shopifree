import { 
  doc, 
  setDoc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  collection, 
  where,
  orderBy,
  serverTimestamp,
  addDoc
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface Product {
  name: string
  description: string
  brandId: string | null
  categoryId: string | null
  subcategoryId: string | null
  sku: string
  unit: string
  condition: string
  status: string
  createdAt: any
  updatedAt: any
}

export type ProductWithId = Product & { id: string }

// Obtener todos los productos de una tienda
export const getProducts = async (storeId: string): Promise<ProductWithId[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return []
    }

    console.log('Consultando productos para store:', storeId)
    
    // Obtener productos ordenados por fecha de creación
    const productsQuery = query(
      collection(db, 'stores', storeId, 'products'),
      orderBy('createdAt', 'desc')
    )
    
    const productsSnapshot = await getDocs(productsQuery)
    console.log('Productos encontrados:', productsSnapshot.size)
    
    const products: ProductWithId[] = []
    
    productsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log('Producto:', doc.id, data)
      products.push({
        id: doc.id,
        ...data
      } as ProductWithId)
    })
    
    console.log('Todos los productos:', products)
    return products
  } catch (error) {
    console.error('Error getting products:', error)
    return []
  }
}

// Obtener un producto por ID
export const getProduct = async (storeId: string, productId: string): Promise<ProductWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) return null

    const productDoc = await getDoc(doc(db, 'stores', storeId, 'products', productId))
    
    if (productDoc.exists()) {
      return { id: productDoc.id, ...productDoc.data() } as ProductWithId
    }
    
    return null
  } catch (error) {
    console.error('Error getting product:', error)
    return null
  }
}

// Verificar si el SKU está disponible
export const checkSkuAvailability = async (
  storeId: string, 
  sku: string, 
  excludeProductId?: string
): Promise<boolean> => {
  try {
    const db = getFirebaseDb()
    if (!db) return false

    // Si no hay SKU, está disponible
    if (!sku || sku.trim() === '') return true

    const productsQuery = query(
      collection(db, 'stores', storeId, 'products'),
      where('sku', '==', sku.trim())
    )
    
    const querySnapshot = await getDocs(productsQuery)
    
    // Si existe un producto con ese SKU
    if (!querySnapshot.empty) {
      // Si estamos editando y es el mismo producto, está disponible
      if (excludeProductId && querySnapshot.docs[0].id === excludeProductId) {
        return true
      }
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking SKU availability:', error)
    return false
  }
}

// Crear nuevo producto
export const createProduct = async (
  storeId: string, 
  productData: Omit<Product, 'createdAt' | 'updatedAt'>
): Promise<ProductWithId> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Verificar que el SKU esté disponible si se proporciona
    if (productData.sku && productData.sku.trim() !== '') {
      const isSkuAvailable = await checkSkuAvailability(storeId, productData.sku)
      if (!isSkuAvailable) {
        throw new Error('El SKU ya está en uso')
      }
    }

    const newProduct: Product = {
      ...productData,
      name: productData.name.trim(),
      description: productData.description.trim(),
      sku: productData.sku.trim(),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(
      collection(db, 'stores', storeId, 'products'), 
      newProduct
    )
    
    return { id: docRef.id, ...newProduct }
  } catch (error) {
    console.error('Error creating product:', error)
    throw error
  }
}

// Actualizar producto
export const updateProduct = async (
  storeId: string, 
  productId: string, 
  productData: Partial<Omit<Product, 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    let updateData: any = {
      ...productData,
      updatedAt: serverTimestamp()
    }

    // Si se está actualizando el nombre, limpiar espacios
    if (productData.name !== undefined) {
      updateData.name = productData.name.trim()
    }

    // Si se está actualizando la descripción, limpiar espacios
    if (productData.description !== undefined) {
      updateData.description = productData.description.trim()
    }

    // Si se está actualizando el SKU, verificar disponibilidad
    if (productData.sku !== undefined) {
      const trimmedSku = productData.sku.trim()
      updateData.sku = trimmedSku
      
      if (trimmedSku !== '' && trimmedSku !== null) {
        const isSkuAvailable = await checkSkuAvailability(storeId, trimmedSku, productId)
        if (!isSkuAvailable) {
          throw new Error('El SKU ya está en uso')
        }
      }
    }

    await updateDoc(
      doc(db, 'stores', storeId, 'products', productId), 
      updateData
    )
  } catch (error) {
    console.error('Error updating product:', error)
    throw error
  }
}

// Actualizar campo específico del producto
export const updateProductField = async (
  storeId: string, 
  productId: string, 
  field: string, 
  value: any
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    let updateData: any = {
      [field]: value,
      updatedAt: serverTimestamp()
    }

    // Validaciones específicas por campo
    if (field === 'name' && typeof value === 'string') {
      updateData[field] = value.trim()
    }
    
    if (field === 'description' && typeof value === 'string') {
      updateData[field] = value.trim()
    }

    if (field === 'sku' && typeof value === 'string') {
      const trimmedSku = value.trim()
      updateData[field] = trimmedSku
      
      if (trimmedSku !== '') {
        const isSkuAvailable = await checkSkuAvailability(storeId, trimmedSku, productId)
        if (!isSkuAvailable) {
          throw new Error('El SKU ya está en uso')
        }
      }
    }

    await updateDoc(
      doc(db, 'stores', storeId, 'products', productId), 
      updateData
    )
  } catch (error) {
    console.error('Error updating product field:', error)
    throw error
  }
}

// Eliminar producto
export const deleteProduct = async (storeId: string, productId: string): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    await deleteDoc(doc(db, 'stores', storeId, 'products', productId))
  } catch (error) {
    console.error('Error deleting product:', error)
    throw error
  }
} 