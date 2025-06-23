import { 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  collection, 
  where, 
  getDocs,
  serverTimestamp 
} from 'firebase/firestore'
import { db } from './firebase'

export interface StoreConfig {
  storeName: string
  slug: string
  slogan: string
  description: string
  hasPhysicalLocation: boolean
  address?: string
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  logo?: string
  ownerId: string
  createdAt: any
  updatedAt: any
}

// Check if user has a store
export const getUserStore = async (userId: string) => {
  try {
    const q = query(collection(db, 'stores'), where('ownerId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const storeDoc = querySnapshot.docs[0]
      return { id: storeDoc.id, ...storeDoc.data() }
    }
    
    return null
  } catch (error) {
    console.error('Error getting user store:', error)
    return null
  }
}

// Check if slug is available
export const checkSlugAvailability = async (slug: string) => {
  try {
    const q = query(collection(db, 'stores'), where('slug', '==', slug))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
  } catch (error) {
    console.error('Error checking slug availability:', error)
    return false
  }
}

// Create new store
export const createStore = async (storeData: Omit<StoreConfig, 'createdAt' | 'updatedAt'>) => {
  try {
    // Generate store ID
    const storeRef = doc(collection(db, 'stores'))
    
    const newStore: StoreConfig = {
      ...storeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(storeRef, newStore)
    
    return { id: storeRef.id, ...newStore }
  } catch (error) {
    console.error('Error creating store:', error)
    throw error
  }
} 