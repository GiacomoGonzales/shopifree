import { 
  doc, 
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

export interface Brand {
  name: string
  description: string
  image: string
  order: number
  createdAt: Date | unknown
  updatedAt: Date | unknown
}

export type BrandWithId = Brand & { id: string }

// Obtener todas las marcas de una tienda
export const getBrands = async (storeId: string): Promise<BrandWithId[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return []
    }

    // Obtener marcas ordenadas
    const brandsQuery = query(
      collection(db, 'stores', storeId, 'brands'),
      orderBy('order', 'asc')
    )

    const brandsSnapshot = await getDocs(brandsQuery)

    const brands: BrandWithId[] = []

    brandsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      brands.push({
        id: doc.id,
        ...data
      } as BrandWithId)
    })

    return brands
  } catch (error) {
    console.error('Error getting brands:', error)
    return []
  }
}

// Obtener una marca por ID
export const getBrand = async (storeId: string, brandId: string): Promise<BrandWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) return null

    const brandDoc = await getDoc(doc(db, 'stores', storeId, 'brands', brandId))
    
    if (brandDoc.exists()) {
      return { id: brandDoc.id, ...brandDoc.data() } as BrandWithId
    }
    
    return null
  } catch (error) {
    console.error('Error getting brand:', error)
    return null
  }
}

// Verificar si el nombre de marca está disponible
export const checkBrandNameAvailability = async (
  storeId: string, 
  name: string, 
  excludeBrandId?: string
): Promise<boolean> => {
  try {
    const db = getFirebaseDb()
    if (!db) return false

    const brandsQuery = query(
      collection(db, 'stores', storeId, 'brands'),
      where('name', '==', name.trim())
    )
    
    const querySnapshot = await getDocs(brandsQuery)
    
    // Si existe una marca con ese nombre
    if (!querySnapshot.empty) {
      // Si estamos editando y es la misma marca, está disponible
      if (excludeBrandId && querySnapshot.docs[0].id === excludeBrandId) {
        return true
      }
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking brand name availability:', error)
    return false
  }
}

// Crear nueva marca
export const createBrand = async (
  storeId: string, 
  brandData: Omit<Brand, 'createdAt' | 'updatedAt' | 'order'>
): Promise<BrandWithId> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Verificar que el nombre esté disponible
    const isNameAvailable = await checkBrandNameAvailability(storeId, brandData.name)
    if (!isNameAvailable) {
      throw new Error('El nombre de la marca ya está en uso')
    }

    // Obtener el siguiente orden disponible
    const existingBrands = await getBrands(storeId)
    const nextOrder = existingBrands.length + 1

    const newBrand: Brand = {
      ...brandData,
      name: brandData.name.trim(),
      description: brandData.description.trim(),
      order: nextOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(
      collection(db, 'stores', storeId, 'brands'), 
      newBrand
    )
    
    return { id: docRef.id, ...newBrand }
  } catch (error) {
    console.error('Error creating brand:', error)
    throw error
  }
}

// Actualizar marca
export const updateBrand = async (
  storeId: string, 
  brandId: string, 
  brandData: Partial<Omit<Brand, 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    const updateData = {
      ...brandData,
      updatedAt: serverTimestamp()
    }

    // Si se está actualizando el nombre, verificar disponibilidad
    if (brandData.name) {
      const isNameAvailable = await checkBrandNameAvailability(storeId, brandData.name, brandId)
      if (!isNameAvailable) {
        throw new Error('El nombre de la marca ya está en uso')
      }
      updateData.name = brandData.name.trim()
    }

    // Si se está actualizando la descripción, limpiar espacios
    if (brandData.description !== undefined) {
      updateData.description = brandData.description.trim()
    }

    await updateDoc(
      doc(db, 'stores', storeId, 'brands', brandId), 
      updateData
    )
  } catch (error) {
    console.error('Error updating brand:', error)
    throw error
  }
}

// Eliminar marca
export const deleteBrand = async (storeId: string, brandId: string): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    await deleteDoc(doc(db, 'stores', storeId, 'brands', brandId))
  } catch (error) {
    console.error('Error deleting brand:', error)
    throw error
  }
}

// Actualizar orden de marcas
export const updateBrandsOrder = async (
  storeId: string, 
  brandsOrder: { id: string; order: number }[]
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Actualizar todas las marcas en lote
    const batch = brandsOrder.map(({ id, order }) => {
      return updateDoc(
        doc(db, 'stores', storeId, 'brands', id), 
        { 
          order,
          updatedAt: serverTimestamp() 
        }
      )
    })

    await Promise.all(batch)
  } catch (error) {
    console.error('Error updating brands order:', error)
    throw error
  }
} 