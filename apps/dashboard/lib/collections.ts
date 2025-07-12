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

export interface Collection {
  title: string
  slug: string
  description?: string
  image?: string
  productIds: string[]
  order: number
  visible: boolean
  createdAt: Date | unknown
  updatedAt: Date | unknown
}

export interface CollectionWithId extends Collection {
  id: string
}

// Generar slug desde el título
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Eliminar caracteres especiales
    .replace(/[\s_-]+/g, '-') // Reemplazar espacios y guiones bajos con guiones
    .replace(/^-+|-+$/g, '') // Eliminar guiones al inicio y final
}

// Verificar disponibilidad de slug
const checkSlugAvailability = async (
  storeId: string, 
  slug: string, 
  excludeId?: string
): Promise<boolean> => {
  try {
    const db = getFirebaseDb()
    if (!db) return false

    const collectionsQuery = query(
      collection(db, 'stores', storeId, 'collections'),
      where('slug', '==', slug)
    )
    
    const querySnapshot = await getDocs(collectionsQuery)
    
    // Si no hay documentos, el slug está disponible
    if (querySnapshot.empty) return true
    
    // Si hay documentos, verificar si alguno es diferente al que estamos excluyendo
    const existingDocs = querySnapshot.docs.filter(doc => doc.id !== excludeId)
    return existingDocs.length === 0
  } catch (error) {
    console.error('Error checking slug availability:', error)
    return false
  }
}

// Obtener todas las colecciones de una tienda
export const getCollections = async (storeId: string): Promise<CollectionWithId[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return []
    }

    console.log('Consultando colecciones para store:', storeId)
    
    const collectionsQuery = query(
      collection(db, 'stores', storeId, 'collections'),
      orderBy('order', 'asc')
    )
    
    const collectionsSnapshot = await getDocs(collectionsQuery)
    console.log('Colecciones encontradas:', collectionsSnapshot.size)
    
    const collections: CollectionWithId[] = []
    
    collectionsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log('Colección:', doc.id, data)
      collections.push({
        id: doc.id,
        ...data
      } as CollectionWithId)
    })
    
    console.log('Todas las colecciones ordenadas:', collections)
    return collections
  } catch (error) {
    console.error('Error getting collections:', error)
    return []
  }
}

// Crear nueva colección
export const createCollection = async (
  storeId: string, 
  collectionData: Omit<Collection, 'createdAt' | 'updatedAt' | 'slug' | 'order'>
): Promise<CollectionWithId> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Generar slug desde el título
    const slug = generateSlug(collectionData.title)
    
    // Verificar que el slug esté disponible
    const isSlugAvailable = await checkSlugAvailability(storeId, slug)
    if (!isSlugAvailable) {
      throw new Error('El título de la colección ya está en uso')
    }

    // Obtener el siguiente orden disponible
    const existingCollections = await getCollections(storeId)
    const nextOrder = existingCollections.length + 1

    const newCollection: Collection = {
      ...collectionData,
      slug,
      order: nextOrder,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(
      collection(db, 'stores', storeId, 'collections'), 
      newCollection
    )
    
    return { id: docRef.id, ...newCollection }
  } catch (error) {
    console.error('Error creating collection:', error)
    throw error
  }
}

// Actualizar colección
export const updateCollection = async (
  storeId: string, 
  collectionId: string, 
  collectionData: Partial<Omit<Collection, 'createdAt' | 'updatedAt' | 'slug'>>
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    let updateData: any = {
      ...collectionData,
      updatedAt: serverTimestamp()
    }

    // Si se está actualizando el título, regenerar el slug
    if (collectionData.title) {
      const newSlug = generateSlug(collectionData.title)
      
      // Verificar que el nuevo slug esté disponible (excluyendo la colección actual)
      const isSlugAvailable = await checkSlugAvailability(storeId, newSlug, collectionId)
      if (!isSlugAvailable) {
        throw new Error('El título de la colección ya está en uso')
      }
      
      updateData.slug = newSlug
    }

    const docRef = doc(db, 'stores', storeId, 'collections', collectionId)
    await updateDoc(docRef, updateData)
  } catch (error) {
    console.error('Error updating collection:', error)
    throw error
  }
}

// Eliminar colección
export const deleteCollection = async (storeId: string, collectionId: string): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    const docRef = doc(db, 'stores', storeId, 'collections', collectionId)
    await deleteDoc(docRef)
  } catch (error) {
    console.error('Error deleting collection:', error)
    throw error
  }
}

// Obtener colección por ID
export const getCollection = async (storeId: string, collectionId: string): Promise<CollectionWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return null
    }

    const docRef = doc(db, 'stores', storeId, 'collections', collectionId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as CollectionWithId
    }
    
    return null
  } catch (error) {
    console.error('Error getting collection:', error)
    return null
  }
}

// Actualizar orden de las colecciones
export const updateCollectionsOrder = async (
  storeId: string, 
  collectionsOrder: { id: string; order: number }[]
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Actualizar el orden de cada colección
    const updatePromises = collectionsOrder.map(({ id, order }) => {
      const docRef = doc(db, 'stores', storeId, 'collections', id)
      return updateDoc(docRef, { 
        order,
        updatedAt: serverTimestamp()
      })
    })

    await Promise.all(updatePromises)
  } catch (error) {
    console.error('Error updating collections order:', error)
    throw error
  }
} 