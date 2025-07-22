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
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return []
    }

    const categoriesRef = collection(db, 'stores', storeId, 'categories')
    const categoriesSnapshot = await getDocs(categoriesRef)
    
    const categories: Category[] = []
    categoriesSnapshot.forEach((doc) => {
      const categoryData = doc.data() as Omit<Category, 'id'>
      categories.push({
        id: doc.id,
        ...categoryData
      })
    })
    
    console.log('✅ Categories loaded:', categories.length)
    return categories
  } catch (error) {
    console.error('❌ Error getting store categories:', error)
    return []
  }
} 