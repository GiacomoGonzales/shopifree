import { collection, getDocs } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  order?: number
  storeId: string
}

export async function getStoreCategories(storeId: string): Promise<Category[]> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.error('❌ Firebase database not available')
      return []
    }

    const categoriesRef = collection(db, 'stores', storeId, 'categories')
    const querySnapshot = await getDocs(categoriesRef)

    const categories: Category[] = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    } as Category))

    // Ordenar por el campo order si existe, o por nombre
    return categories.sort((a, b) => {
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