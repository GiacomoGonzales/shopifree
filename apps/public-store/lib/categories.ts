import { collection, getDocs, query, orderBy } from 'firebase/firestore'
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
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return []
    }

    const categoriesRef = collection(db, 'stores', storeId, 'categories')
    const categoriesQuery = query(categoriesRef, orderBy('order', 'asc'))
    const categoriesSnapshot = await getDocs(categoriesQuery)
    
    const categories: Category[] = []
    categoriesSnapshot.forEach((doc) => {
      const categoryData = doc.data() as Omit<Category, 'id'>
      categories.push({
        id: doc.id,
        ...categoryData
      })
    })
    
    // Ordenar por campo order (manejar casos donde order sea undefined)
    categories.sort((a, b) => {
      const orderA = a.order ?? 999999 // Si no tiene order, ponerlo al final
      const orderB = b.order ?? 999999
      return orderA - orderB
    })
    
    console.log('✅ Categories loaded and sorted:', categories.length)
    return categories
  } catch (error) {
    console.error('❌ Error getting store categories:', error)
    return []
  }
} 