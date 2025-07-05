import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface StorePage {
  title: string
  slug: string
  content: string
  status: 'published' | 'draft'
  fixed: boolean
  visible: boolean
  seoTitle: string
  seoDescription: string
  createdAt: Date
  updatedAt: Date
}

const DEFAULT_HOME_CONTENT = `
<div class="max-w-4xl mx-auto px-4 py-12">
  <h1 class="text-3xl font-bold text-center mb-6">Bienvenido a tu tienda</h1>
  <p class="text-lg text-gray-600 text-center">Personaliza tu página principal desde el panel de administración.</p>
</div>
`

export async function getHomePage(storeId: string): Promise<StorePage | null> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.error('Firebase not initialized')
      return null
    }

    // Intentar obtener la página home directamente
    const homePageRef = doc(db, `stores/${storeId}/content/pages/home`)
    const homePageSnap = await getDoc(homePageRef)

    if (homePageSnap.exists()) {
      const data = homePageSnap.data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as StorePage
    }

    // Si no existe, buscar una página con slug "/"
    const pagesRef = collection(db, `stores/${storeId}/content/pages`)
    const q = query(pagesRef, where('slug', '==', '/'))
    const querySnapshot = await getDocs(q)

    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data()
      return {
        ...data,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date()
      } as StorePage
    }

    // Si no se encuentra la página, devolver una página por defecto
    return {
      title: 'Página principal',
      slug: '/',
      content: DEFAULT_HOME_CONTENT,
      status: 'published',
      fixed: true,
      visible: true,
      seoTitle: 'Inicio',
      seoDescription: 'Bienvenido a nuestra tienda online',
      createdAt: new Date(),
      updatedAt: new Date()
    }

  } catch (error) {
    console.error('Error fetching home page:', error)
    return null
  }
} 