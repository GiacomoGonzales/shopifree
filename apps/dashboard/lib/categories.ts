import { 
  doc, 
  getDoc, 
  getDocs,
  updateDoc,
  deleteDoc,
  query, 
  collection, 
  where,
  serverTimestamp,
  addDoc,
  FieldValue
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface Category {
  name: string
  description: string
  slug: string
  imageUrl: string
  imagePublicId: string
  parentCategoryId: string | null
  order: number
  createdAt: Date | unknown
  updatedAt: Date | unknown
}

export type CategoryWithId = Category & { id: string }

// Generar slug a partir del nombre
export const generateSlug = (name: string): string => {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/[^a-z0-9\s-]/g, '') // Remover caracteres especiales
    .replace(/\s+/g, '-') // Reemplazar espacios con guiones
    .replace(/-+/g, '-') // Remover guiones duplicados
    .trim()
}

// Verificar si el slug está disponible
export const checkSlugAvailability = async (
  storeId: string, 
  slug: string, 
  excludeCategoryId?: string,
  parentCategoryId?: string
): Promise<boolean> => {
  try {
    const db = getFirebaseDb()
    if (!db) return false

    let categoriesQuery
    
    if (parentCategoryId) {
      // Verificar en subcategorías
      categoriesQuery = query(
        collection(db, 'stores', storeId, 'categories', parentCategoryId, 'subcategorias'),
        where('slug', '==', slug)
      )
    } else {
      // Verificar en categorías padre
      categoriesQuery = query(
        collection(db, 'stores', storeId, 'categories'),
        where('slug', '==', slug)
      )
    }
    
    const querySnapshot = await getDocs(categoriesQuery)
    
    // Si existe una categoría con ese slug
    if (!querySnapshot.empty) {
      // Si estamos editando y es la misma categoría, está disponible
      if (excludeCategoryId && querySnapshot.docs[0].id === excludeCategoryId) {
        return true
      }
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error checking slug availability:', error)
    return false
  }
}

// Obtener todas las categorías de una tienda (padre + subcategorías)
export const getCategories = async (storeId: string): Promise<CategoryWithId[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return []
    }

    console.log('Consultando categorías para store:', storeId)
    
    // Obtener categorías padre
    const parentCategoriesQuery = query(
      collection(db, 'stores', storeId, 'categories')
    )
    
    const parentSnapshot = await getDocs(parentCategoriesQuery)
    console.log('Categorías padre encontradas:', parentSnapshot.size)
    
    const allCategories: CategoryWithId[] = []
    
    // Agregar categorías padre
    parentSnapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log('Categoría padre:', doc.id, data)
      allCategories.push({
        id: doc.id,
        ...data
      } as CategoryWithId)
    })
    
    // Obtener subcategorías de cada categoría padre
    for (const parentDoc of parentSnapshot.docs) {
      try {
        const subcategoriesQuery = query(
          collection(db, 'stores', storeId, 'categories', parentDoc.id, 'subcategorias')
        )
        
        const subcategoriesSnapshot = await getDocs(subcategoriesQuery)
        console.log(`Subcategorías de ${parentDoc.id}:`, subcategoriesSnapshot.size)
        
        subcategoriesSnapshot.docs.forEach(subDoc => {
          const subData = subDoc.data()
          console.log('Subcategoría:', subDoc.id, subData)
          allCategories.push({
            id: subDoc.id,
            ...subData,
            parentCategoryId: parentDoc.id // Asegurar que tiene el parentCategoryId
          } as CategoryWithId)
        })
      } catch (subError) {
        console.warn(`Error obteniendo subcategorías de ${parentDoc.id}:`, subError)
      }
    }
    
    // Ordenar en JavaScript
    allCategories.sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order || 0) - (b.order || 0)
      }
      // Si no hay createdAt, poner al final
      if (!a.createdAt) return 1
      if (!b.createdAt) return -1
      
      // Convertir timestamps a números para comparar
      const aTime = (a.createdAt as { seconds?: number })?.seconds || 0
      const bTime = (b.createdAt as { seconds?: number })?.seconds || 0
      return aTime - bTime
    })
    
    console.log('Todas las categorías ordenadas:', allCategories)
    return allCategories
  } catch (error) {
    console.error('Error getting categories:', error)
    return []
  }
}

// Obtener una categoría por ID
export const getCategory = async (storeId: string, categoryId: string, parentCategoryId?: string): Promise<CategoryWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) return null

    let categoryDoc
    
    if (parentCategoryId) {
      // Es una subcategoría
      categoryDoc = await getDoc(doc(db, 'stores', storeId, 'categories', parentCategoryId, 'subcategorias', categoryId))
    } else {
      // Es una categoría padre
      categoryDoc = await getDoc(doc(db, 'stores', storeId, 'categories', categoryId))
    }
    
    if (categoryDoc.exists()) {
      return { id: categoryDoc.id, ...categoryDoc.data() } as CategoryWithId
    }
    
    return null
  } catch (error) {
    console.error('Error getting category:', error)
    return null
  }
}

// Crear nueva categoría
export const createCategory = async (
  storeId: string, 
  categoryData: Omit<Category, 'createdAt' | 'updatedAt' | 'slug' | 'order'>
): Promise<CategoryWithId> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Generar slug desde el nombre
    const slug = generateSlug(categoryData.name)
    
    // Verificar que el slug esté disponible
    const isSlugAvailable = await checkSlugAvailability(storeId, slug, undefined, categoryData.parentCategoryId || undefined)
    if (!isSlugAvailable) {
      throw new Error('El nombre de la categoría ya está en uso')
    }

    // Obtener el siguiente orden disponible
    let nextOrder = 1
    if (categoryData.parentCategoryId) {
      // Si es subcategoría, obtener el siguiente orden dentro de la categoría padre
      const subcategories = await getSubcategories(storeId, categoryData.parentCategoryId)
      nextOrder = subcategories.length + 1
    } else {
      // Si es categoría padre, obtener el siguiente orden entre categorías padre
      const parentCategories = await getParentCategories(storeId)
      nextOrder = parentCategories.length + 1
    }

    const newCategory: Category = {
      ...categoryData,
      slug,
      order: nextOrder,
      parentCategoryId: categoryData.parentCategoryId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    let docRef
    
    if (categoryData.parentCategoryId) {
      // Guardar como subcategoría en la subcolección
      docRef = await addDoc(
        collection(db, 'stores', storeId, 'categories', categoryData.parentCategoryId, 'subcategorias'), 
        newCategory
      )
    } else {
      // Guardar como categoría padre
      docRef = await addDoc(
        collection(db, 'stores', storeId, 'categories'), 
        newCategory
      )
    }
    
    return { id: docRef.id, ...newCategory }
  } catch (error) {
    console.error('Error creating category:', error)
    throw error
  }
}

// Actualizar categoría
export const updateCategory = async (
  storeId: string, 
  categoryId: string, 
  categoryData: Partial<Omit<Category, 'createdAt' | 'updatedAt' | 'slug'>>,
  parentCategoryId?: string
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    const updateData: Record<string, string | number | FieldValue | null | undefined> = {
      ...categoryData,
      updatedAt: serverTimestamp()
    }

    // Si se está actualizando el nombre, regenerar el slug
    if (categoryData.name) {
      const newSlug = generateSlug(categoryData.name)
      
      // Verificar que el nuevo slug esté disponible
      const isSlugAvailable = await checkSlugAvailability(storeId, newSlug, categoryId, parentCategoryId)
      if (!isSlugAvailable) {
        throw new Error('El nombre de la categoría ya está en uso')
      }
      
      updateData.slug = newSlug
    }

    if (parentCategoryId) {
      // Actualizar subcategoría
      await updateDoc(
        doc(db, 'stores', storeId, 'categories', parentCategoryId, 'subcategorias', categoryId), 
        updateData
      )
    } else {
      // Actualizar categoría padre
      await updateDoc(
        doc(db, 'stores', storeId, 'categories', categoryId), 
        updateData
      )
    }
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

// Eliminar categoría
export const deleteCategory = async (storeId: string, categoryId: string, parentCategoryId?: string): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    if (parentCategoryId) {
      // Eliminar subcategoría
      await deleteDoc(doc(db, 'stores', storeId, 'categories', parentCategoryId, 'subcategorias', categoryId))
    } else {
      // Verificar si la categoría padre tiene subcategorías
      const subcategoriesQuery = query(
        collection(db, 'stores', storeId, 'categories', categoryId, 'subcategorias')
      )
      
      const subcategoriesSnapshot = await getDocs(subcategoriesQuery)
      
      if (!subcategoriesSnapshot.empty) {
        throw new Error('No se puede eliminar una categoría que tiene subcategorías. Elimina primero las subcategorías.')
      }

      // Eliminar categoría padre
      await deleteDoc(doc(db, 'stores', storeId, 'categories', categoryId))
    }
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

// Obtener categorías padre (sin parentCategoryId)
export const getParentCategories = async (storeId: string): Promise<CategoryWithId[]> => {
  try {
    console.log('Obteniendo categorías padre para store:', storeId)
    
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return []
    }
    
    const parentCategoriesQuery = query(
      collection(db, 'stores', storeId, 'categories')
    )
    
    const querySnapshot = await getDocs(parentCategoriesQuery)
    console.log('Categorías padre encontradas:', querySnapshot.size)
    
    const parentCategories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CategoryWithId[]
    
    // Ordenar por orden
    parentCategories.sort((a, b) => (a.order || 0) - (b.order || 0))
    
    console.log('Categorías padre ordenadas:', parentCategories)
    return parentCategories
  } catch (error) {
    console.error('Error getting parent categories:', error)
    return []
  }
}

// Obtener subcategorías de una categoría padre
export const getSubcategories = async (storeId: string, parentCategoryId: string): Promise<CategoryWithId[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) return []

    const subcategoriesQuery = query(
      collection(db, 'stores', storeId, 'categories', parentCategoryId, 'subcategorias')
    )
    
    const querySnapshot = await getDocs(subcategoriesQuery)
    
    const subcategories = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      parentCategoryId: parentCategoryId // Asegurar que tiene el parentCategoryId
    })) as CategoryWithId[]
    
    // Ordenar por orden
    subcategories.sort((a, b) => (a.order || 0) - (b.order || 0))
    
    return subcategories
  } catch (error) {
    console.error('Error getting subcategories:', error)
    return []
  }
}

// Actualizar orden de categorías
export const updateCategoriesOrder = async (
  storeId: string, 
  categoriesOrder: { id: string; order: number; parentCategoryId?: string }[]
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Actualizar todas las categorías en lote
    const batch = categoriesOrder.map(({ id, order, parentCategoryId }) => {
      if (parentCategoryId) {
        // Actualizar subcategoría
        return updateDoc(
          doc(db, 'stores', storeId, 'categories', parentCategoryId, 'subcategorias', id), 
          { 
            order,
            updatedAt: serverTimestamp() 
          }
        )
      } else {
        // Actualizar categoría padre
        return updateDoc(
          doc(db, 'stores', storeId, 'categories', id), 
          { 
            order,
            updatedAt: serverTimestamp() 
          }
        )
      }
    })

    await Promise.all(batch)
  } catch (error) {
    console.error('Error updating categories order:', error)
    throw error
  }
} 