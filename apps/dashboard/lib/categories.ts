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

export interface CategoryName {
  es: string
  en: string
}

export interface CategoryDescription {
  es: string
  en: string
}

export interface Category {
  name: CategoryName
  description: CategoryDescription
  slug: string
  imageUrl: string
  imagePublicId: string
  parentCategoryId: string | null
  order: number
  createdAt: any
  updatedAt: any
}

export type CategoryWithId = Category & { id: string }

// Generar slug a partir del nombre en español
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
  excludeCategoryId?: string
): Promise<boolean> => {
  try {
    const db = getFirebaseDb()
    if (!db) return false

    const categoriesQuery = query(
      collection(db, 'stores', storeId, 'categories'),
      where('slug', '==', slug)
    )
    
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

// Obtener todas las categorías de una tienda
export const getCategories = async (storeId: string): Promise<CategoryWithId[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return []
    }

    console.log('Consultando categorías para store:', storeId)
    
    // Primero intentar sin orderBy para evitar problemas de índice
    const categoriesQuery = query(
      collection(db, 'stores', storeId, 'categories')
    )
    
    const querySnapshot = await getDocs(categoriesQuery)
    console.log('Documentos encontrados:', querySnapshot.size)
    
    const categories = querySnapshot.docs.map(doc => {
      const data = doc.data()
      console.log('Documento:', doc.id, data)
      return {
        id: doc.id,
        ...data
      }
    }) as CategoryWithId[]
    
    // Ordenar en JavaScript
    categories.sort((a, b) => {
      if (a.order !== b.order) {
        return (a.order || 0) - (b.order || 0)
      }
      // Si no hay createdAt, poner al final
      if (!a.createdAt) return 1
      if (!b.createdAt) return -1
      
      // Convertir timestamps a números para comparar
      const aTime = a.createdAt.seconds || 0
      const bTime = b.createdAt.seconds || 0
      return aTime - bTime
    })
    
    console.log('Categorías ordenadas:', categories)
    return categories
  } catch (error) {
    console.error('Error getting categories:', error)
    return []
  }
}

// Obtener una categoría por ID
export const getCategory = async (storeId: string, categoryId: string): Promise<CategoryWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) return null

    const categoryDoc = await getDoc(doc(db, 'stores', storeId, 'categories', categoryId))
    
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

    // Generar slug desde el nombre en español
    const slug = generateSlug(categoryData.name.es)
    
    // Verificar que el slug esté disponible
    const isSlugAvailable = await checkSlugAvailability(storeId, slug)
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
      parentCategoryId: categoryData.parentCategoryId || null, // Asegurar que sea null en lugar de undefined
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    const docRef = await addDoc(collection(db, 'stores', storeId, 'categories'), newCategory)
    
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
  categoryData: Partial<Omit<Category, 'createdAt' | 'updatedAt' | 'slug'>>
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    let updateData: any = {
      ...categoryData,
      updatedAt: serverTimestamp()
    }

    // Si se está actualizando el nombre, regenerar el slug
    if (categoryData.name?.es) {
      const newSlug = generateSlug(categoryData.name.es)
      
      // Verificar que el nuevo slug esté disponible
      const isSlugAvailable = await checkSlugAvailability(storeId, newSlug, categoryId)
      if (!isSlugAvailable) {
        throw new Error('El nombre de la categoría ya está en uso')
      }
      
      updateData.slug = newSlug
    }

    await updateDoc(doc(db, 'stores', storeId, 'categories', categoryId), updateData)
  } catch (error) {
    console.error('Error updating category:', error)
    throw error
  }
}

// Eliminar categoría
export const deleteCategory = async (storeId: string, categoryId: string): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Verificar si la categoría tiene subcategorías
    const subcategoriesQuery = query(
      collection(db, 'stores', storeId, 'categories'),
      where('parentCategoryId', '==', categoryId)
    )
    
    const subcategoriesSnapshot = await getDocs(subcategoriesQuery)
    
    if (!subcategoriesSnapshot.empty) {
      throw new Error('No se puede eliminar una categoría que tiene subcategorías. Elimina primero las subcategorías.')
    }

    await deleteDoc(doc(db, 'stores', storeId, 'categories', categoryId))
  } catch (error) {
    console.error('Error deleting category:', error)
    throw error
  }
}

// Obtener categorías padre (sin parentCategoryId)
export const getParentCategories = async (storeId: string): Promise<CategoryWithId[]> => {
  try {
    console.log('Obteniendo categorías padre para store:', storeId)
    
    // Usar la función getCategories que ya funciona y filtrar
    const allCategories = await getCategories(storeId)
    console.log('Filtrando categorías padre de:', allCategories)
    
    // Filtrar categorías padre (sin parentCategoryId o con parentCategoryId null/undefined/vacío)
    const parentCategories = allCategories.filter(cat => !cat.parentCategoryId)
    console.log('Categorías padre encontradas:', parentCategories)
    
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
      collection(db, 'stores', storeId, 'categories'),
      where('parentCategoryId', '==', parentCategoryId),
      orderBy('order'),
      orderBy('createdAt')
    )
    
    const querySnapshot = await getDocs(subcategoriesQuery)
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as CategoryWithId[]
  } catch (error) {
    console.error('Error getting subcategories:', error)
    return []
  }
}

// Actualizar orden de categorías
export const updateCategoriesOrder = async (
  storeId: string, 
  categoriesOrder: { id: string; order: number }[]
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }

    // Actualizar todas las categorías en lote
    const batch = categoriesOrder.map(({ id, order }) => 
      updateDoc(doc(db, 'stores', storeId, 'categories', id), { 
        order,
        updatedAt: serverTimestamp() 
      })
    )

    await Promise.all(batch)
  } catch (error) {
    console.error('Error updating categories order:', error)
    throw error
  }
} 