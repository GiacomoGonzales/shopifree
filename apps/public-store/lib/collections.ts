import { collection, getDocs, query, orderBy, where } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface PublicCollection {
  id: string
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

// Obtener todas las colecciones visibles de una tienda
// Obtener las colecciones a las que pertenece un producto específico
export const getProductCollections = async (storeId: string, productId: string): Promise<PublicCollection[]> => {
  try {
    const allCollections = await getStoreCollections(storeId)
    return allCollections.filter(collection => collection.productIds.includes(productId))
  } catch (error) {
    console.error('Error getting product collections:', error)
    return []
  }
}

export const getStoreCollections = async (storeId: string): Promise<PublicCollection[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Database not available')
      return []
    }

    console.log('🔍 Obteniendo colecciones para store:', storeId)
    
    // Primero intentar con filtro y orden (requiere índice)
    try {
      const collectionsQuery = query(
        collection(db, 'stores', storeId, 'collections'),
        where('visible', '==', true),
        orderBy('order', 'asc')
      )
      
      const collectionsSnapshot = await getDocs(collectionsQuery)
      console.log('✅ Colecciones encontradas con filtro:', collectionsSnapshot.size)
      
      const collections: PublicCollection[] = []
      
      collectionsSnapshot.docs.forEach(doc => {
        const data = doc.data()
        console.log('📄 Colección encontrada:', doc.id, {
          title: data.title,
          visible: data.visible,
          order: data.order
        })
        
        collections.push({
          id: doc.id,
          title: data.title,
          slug: data.slug,
          description: data.description,
          image: data.image,
          productIds: data.productIds || [],
          order: data.order,
          visible: data.visible,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt
        })
      })
      
      console.log('✅ Colecciones procesadas con filtro:', collections.length)
      return collections
      
    } catch (indexError) {
      console.warn('⚠️ Error con filtro e índice, intentando sin filtro:', indexError)
      
      // Fallback: obtener todas las colecciones y filtrar manualmente
      const allCollectionsQuery = query(
        collection(db, 'stores', storeId, 'collections')
      )
      
      const allSnapshot = await getDocs(allCollectionsQuery)
      console.log('📋 Total colecciones sin filtro:', allSnapshot.size)
      
      const collections: PublicCollection[] = []
      
      allSnapshot.docs.forEach(doc => {
        const data = doc.data()
        console.log('📄 Colección sin filtro:', doc.id, {
          title: data.title,
          visible: data.visible,
          visibleType: typeof data.visible,
          order: data.order
        })
        
        // Filtrar solo las visibles (manejar tanto boolean como string)
        const isVisible = data.visible === true || data.visible === 'true' || data.visible === 1
        if (isVisible) {
          collections.push({
            id: doc.id,
            title: data.title,
            slug: data.slug,
            description: data.description,
            image: data.image,
            productIds: data.productIds || [],
            order: data.order || 0,
            visible: true, // Normalizar a boolean
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          })
        }
      })
      
      // Ordenar manualmente por order
      collections.sort((a, b) => a.order - b.order)
      
      console.log('✅ Colecciones filtradas manualmente:', collections.length)
      return collections
    }
    
  } catch (error) {
    console.error('❌ Error general getting store collections:', error)
    return []
  }
}

// Obtener una colección específica por slug
export const getCollectionBySlug = async (storeId: string, slug: string): Promise<PublicCollection | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) return null

    const collectionsQuery = query(
      collection(db, 'stores', storeId, 'collections'),
      where('slug', '==', slug),
      where('visible', '==', true)
    )
    
    const collectionsSnapshot = await getDocs(collectionsQuery)
    
    if (collectionsSnapshot.empty) {
      return null
    }
    
    const doc = collectionsSnapshot.docs[0]
    const data = doc.data()
    
    return {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      image: data.image,
      productIds: data.productIds || [],
      order: data.order,
      visible: data.visible,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt
    }
  } catch (error) {
    console.error('❌ Error getting collection by slug:', error)
    return null
  }
} 