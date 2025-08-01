import { 
  query, 
  collection, 
  getDocs,
  orderBy
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface PublicBrand {
  id: string
  name: string
  description: string
  image: string
  order: number
}

// Obtener todas las marcas visibles de una tienda
export const getStoreBrands = async (storeId: string): Promise<PublicBrand[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return []
    }

    console.log('🏷️ Obteniendo marcas para store:', storeId)
    
    // Obtener marcas ordenadas
    const brandsQuery = query(
      collection(db, 'stores', storeId, 'brands'),
      orderBy('order', 'asc')
    )
    
    const brandsSnapshot = await getDocs(brandsQuery)
    console.log('✅ Marcas encontradas:', brandsSnapshot.size)
    
    const brands: PublicBrand[] = []
    
    brandsSnapshot.docs.forEach(doc => {
      const data = doc.data()
      brands.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        image: data.image,
        order: data.order || 0
      })
    })
    
    console.log('✅ Marcas procesadas:', brands.length)
    return brands
  } catch (error) {
    console.error('❌ Error getting store brands:', error)
    return []
  }
}