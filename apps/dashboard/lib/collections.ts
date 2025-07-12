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

export type CollectionWithId = Collection & { id: string }

// Generar slug desde el título
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Solo letras, números, espacios y guiones
    .trim()
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Múltiples guiones a uno solo
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
    
    // Obtener colecciones ordenadas
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

// Obtener una colección por ID
export const getCollection = async (storeId: string, collectionId: string): Promise<CollectionWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) return null

    const collectionDoc = await getDoc(doc(db, 'stores', storeId, 'collections', collectionId))
    
    if (collectionDoc.exists()) {
      return { id: collectionDoc.id, ...collectionDoc.data() } as CollectionWithId
    }
    
    return null
  } catch (error) {
    console.error('Error getting collection:', error)
    return null
  }
}

// Verificar si el título de colección está disponible
export const checkCollectionTitleAvailability = async (
  storeId: string, 
  title: string, 
  excludeCollectionId?: string
): Promise<boolean> => {
  try {
    const db = getFirebaseDb()
    if (!db) return false

    const collectionsQuery = query(
      collection(db, 'stores', storeId, 'collections'),
      where('title', '==', title.trim())
    )
    
    const querySnapshot = await getDocs(collectionsQuery)
    
    // Si existe una colección con ese título
    if (!querySnapshot.empty) {
      // Si estamos editando y es la misma colección, está disponible
      if (excludeCollectionId && querySnapshot.docs[0].id === excludeCollectionId) {
        return true
      }
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking collection title availability:', error)
    return false
  }
}

// Verificar si el slug está disponible
export const checkCollectionSlugAvailability = async (
  storeId: string, 
  slug: string, 
  excludeCollectionId?: string
): Promise<boolean> => {
  try {
    const db = getFirebaseDb()
    if (!db) return false

    const collectionsQuery = query(
      collection(db, 'stores', storeId, 'collections'),
      where('slug', '==', slug.trim())
    )
    
    const querySnapshot = await getDocs(collectionsQuery)
    
    // Si existe una colección con ese slug
    if (!querySnapshot.empty) {
      // Si estamos editando y es la misma colección, está disponible
      if (excludeCollectionId && querySnapshot.docs[0].id === excludeCollectionId) {
        return true
      }
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking collection slug availability:', error)
    return false
  }
}

// Crear nueva colección
export const createCollection = async (
  storeId: string, 
  collectionData: Omit<Collection, 'createdAt' | 'updatedAt' | 'order' | 'slug' | 'visible'>
): Promise<CollectionWithId> => {
  try {
    console.log('🔥 Iniciando creación de colección:', { storeId, collectionData })
    
    const db = getFirebaseDb()
    if (!db) {
      console.error('❌ Firebase db no disponible')
      throw new Error('Firebase db not available')
    }
    console.log('✅ Firebase db disponible')

    // Verificar que el título esté disponible
    console.log('🔍 Verificando disponibilidad del título:', collectionData.title)
    const isTitleAvailable = await checkCollectionTitleAvailability(storeId, collectionData.title)
    if (!isTitleAvailable) {
      console.error('❌ Título ya en uso')
      throw new Error('El título de la colección ya está en uso')
    }
    console.log('✅ Título disponible')

    // Generar slug automáticamente
    const slug = generateSlug(collectionData.title)
    console.log('🔗 Slug generado:', slug)
    
    // Verificar que el slug esté disponible
    console.log('🔍 Verificando disponibilidad del slug:', slug)
    const isSlugAvailable = await checkCollectionSlugAvailability(storeId, slug)
    if (!isSlugAvailable) {
      console.error('❌ Slug ya en uso')
      throw new Error('El slug generado ya está en uso')
    }
    console.log('✅ Slug disponible')

    // Obtener el siguiente orden disponible
    console.log('📊 Obteniendo colecciones existentes para calcular orden')
    const existingCollections = await getCollections(storeId)
    const nextOrder = existingCollections.length + 1
    console.log('📊 Orden calculado:', nextOrder)

    const newCollection: Collection = {
      ...collectionData,
      title: collectionData.title.trim(),
      slug,
      description: collectionData.description?.trim() || '',
      order: nextOrder,
      visible: true, // Por defecto las colecciones son visibles
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    console.log('📝 Datos de la nueva colección:', newCollection)
    console.log('💾 Guardando en Firestore path:', `stores/${storeId}/collections`)

    const docRef = await addDoc(
      collection(db, 'stores', storeId, 'collections'), 
      newCollection
    )
    
    console.log('✅ Colección creada exitosamente con ID:', docRef.id)
    return { id: docRef.id, ...newCollection }
  } catch (error) {
    console.error('❌ Error creating collection:', error)
    throw error
  }
}

// Actualizar colección
export const updateCollection = async (
  storeId: string, 
  collectionId: string, 
  collectionData: Partial<Omit<Collection, 'createdAt' | 'updatedAt'>>
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    const updateData: Partial<Collection> & { updatedAt: unknown } = {
      ...collectionData,
      updatedAt: serverTimestamp()
    }

    // Si se está actualizando el título, verificar disponibilidad y regenerar slug
    if (collectionData.title) {
      const isTitleAvailable = await checkCollectionTitleAvailability(storeId, collectionData.title, collectionId)
      if (!isTitleAvailable) {
        throw new Error('El título de la colección ya está en uso')
      }
      
      updateData.title = collectionData.title.trim()
      
      // Regenerar slug automáticamente
      const newSlug = generateSlug(collectionData.title)
      const isSlugAvailable = await checkCollectionSlugAvailability(storeId, newSlug, collectionId)
      if (!isSlugAvailable) {
        throw new Error('El slug generado ya está en uso')
      }
      updateData.slug = newSlug
    }

    // Si se está actualizando la descripción, limpiar espacios
    if (collectionData.description !== undefined) {
      updateData.description = collectionData.description.trim()
    }

    await updateDoc(
      doc(db, 'stores', storeId, 'collections', collectionId), 
      updateData
    )
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

    await deleteDoc(doc(db, 'stores', storeId, 'collections', collectionId))
  } catch (error) {
    console.error('Error deleting collection:', error)
    throw error
  }
}

// Actualizar orden de colecciones
export const updateCollectionsOrder = async (
  storeId: string, 
  collectionsOrder: { id: string; order: number }[]
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Actualizar todas las colecciones en lote
    const batch = collectionsOrder.map(({ id, order }) => {
      return updateDoc(
        doc(db, 'stores', storeId, 'collections', id), 
        { 
          order,
          updatedAt: serverTimestamp() 
        }
      )
    })

    await Promise.all(batch)
  } catch (error) {
    console.error('Error updating collections order:', error)
    throw error
  }
}

// Agregar productos a una colección
export const addProductsToCollection = async (
  storeId: string, 
  collectionId: string, 
  productIds: string[]
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Obtener la colección actual
    const currentCollection = await getCollection(storeId, collectionId)
    if (!currentCollection) {
      throw new Error('Colección no encontrada')
    }

    // Combinar productos existentes con los nuevos, evitando duplicados
    const existingProductIds = currentCollection.productIds || []
    const newProductIds = Array.from(new Set([...existingProductIds, ...productIds]))

    await updateDoc(
      doc(db, 'stores', storeId, 'collections', collectionId), 
      { 
        productIds: newProductIds,
        updatedAt: serverTimestamp() 
      }
    )
  } catch (error) {
    console.error('Error adding products to collection:', error)
    throw error
  }
}

// Remover productos de una colección
export const removeProductsFromCollection = async (
  storeId: string, 
  collectionId: string, 
  productIds: string[]
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Obtener la colección actual
    const currentCollection = await getCollection(storeId, collectionId)
    if (!currentCollection) {
      throw new Error('Colección no encontrada')
    }

    // Filtrar productos para remover los especificados
    const existingProductIds = currentCollection.productIds || []
    const updatedProductIds = existingProductIds.filter(id => !productIds.includes(id))

    await updateDoc(
      doc(db, 'stores', storeId, 'collections', collectionId), 
      { 
        productIds: updatedProductIds,
        updatedAt: serverTimestamp() 
      }
    )
  } catch (error) {
    console.error('Error removing products from collection:', error)
    throw error
  }
} 