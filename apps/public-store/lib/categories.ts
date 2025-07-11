import { collection, getDocs, query } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  order?: number
  storeId: string
  parentCategoryId?: string | null
}

export async function getStoreCategories(storeId: string): Promise<Category[]> {
  try {
    if (!storeId) {
      console.warn('No store ID provided for categories')
      return []
    }
    
    const db = getFirebaseDb()
    if (!db) {
      console.error('❌ Firebase database not available')
      return []
    }

    console.log('Consultando categorías para store:', storeId)
    
    // Obtener categorías padre
    const parentCategoriesQuery = query(
      collection(db, 'stores', storeId, 'categories')
    )
    
    const parentSnapshot = await getDocs(parentCategoriesQuery)
    console.log('Categorías padre encontradas:', parentSnapshot.size)
    
    const allCategories: Category[] = []
    
    // Agregar categorías padre
    parentSnapshot.docs.forEach(doc => {
      const data = doc.data()
      console.log('Categoría padre:', doc.id, data)
      allCategories.push({
        id: doc.id,
        ...data
      } as Category)
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
          } as Category)
        })
      } catch (subError) {
        console.warn(`Error obteniendo subcategorías de ${parentDoc.id}:`, subError)
      }
    }

    // Ordenar por el campo order si existe, o por nombre
    return allCategories.sort((a, b) => {
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order
      }
      return a.name.localeCompare(b.name)
    })

  } catch (error) {
    console.error('❌ Error fetching categories:', error)
    return []
  }
} 