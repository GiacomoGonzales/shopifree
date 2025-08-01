'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { PublicProduct } from './products'
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { useStoreAuth } from './store-auth-context'

interface FavoritesContextType {
  favorites: PublicProduct[]
  isFavorite: (productId: string) => boolean
  addToFavorites: (product: PublicProduct) => Promise<void>
  removeFromFavorites: (productId: string) => Promise<void>
  clearFavorites: () => Promise<void>
  isLoading: boolean
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined)

export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}

interface FavoritesProviderProps {
  children: ReactNode
  storeId: string
  userId?: string | null // No usado, solo para compatibilidad
}

export const FavoritesProvider = ({ children, storeId }: FavoritesProviderProps) => {
  const { user } = useStoreAuth()
  const [favorites, setFavorites] = useState<PublicProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  const userId = user?.uid || null

  // Clave para localStorage específica de la tienda
  const localStorageKey = `favorites_${storeId}`

  // Cargar favoritos desde localStorage
  const loadFromLocalStorage = (): PublicProduct[] => {
    try {
      const stored = localStorage.getItem(localStorageKey)
      return stored ? JSON.parse(stored) : []
    } catch (error) {
      console.error('Error loading favorites from localStorage:', error)
      return []
    }
  }

  // Guardar favoritos en localStorage
  const saveToLocalStorage = (favorites: PublicProduct[]) => {
    try {
      localStorage.setItem(localStorageKey, JSON.stringify(favorites))
    } catch (error) {
      console.error('Error saving favorites to localStorage:', error)
    }
  }

  // Cargar favoritos desde Firestore (estructura mejorada)
  const loadFromFirestore = async (userId: string): Promise<PublicProduct[]> => {
    try {
      const db = getFirebaseDb()
      if (!db) return []

      // Usar estructura centralizada: users/{userId}/favorites
      const favoritesRef = collection(db, 'users', userId, 'favorites')
      const q = query(favoritesRef, where('storeId', '==', storeId))
      const querySnapshot = await getDocs(q)
      
      const firestoreFavorites: PublicProduct[] = []
      querySnapshot.forEach((doc) => {
        const data = doc.data()
        if (data.productData) {
          firestoreFavorites.push(data.productData)
        }
      })
      
      return firestoreFavorites
    } catch (error) {
      console.error('Error loading favorites from Firestore:', error)
      return []
    }
  }

  // Sincronizar favoritos de localStorage a Firestore (estructura mejorada)
  const syncToFirestore = async (userId: string, favorites: PublicProduct[]) => {
    try {
      const db = getFirebaseDb()
      if (!db) return

      // Usar estructura centralizada: users/{userId}/favorites
      const favoritesRef = collection(db, 'users', userId, 'favorites')
      
      // Primero, eliminar favoritos existentes de esta tienda
      const q = query(favoritesRef, where('storeId', '==', storeId))
      const querySnapshot = await getDocs(q)
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Luego, agregar todos los favoritos actuales
      const addPromises = favorites.map(product => {
        const favoriteId = `${storeId}_${product.id}`
        return setDoc(doc(favoritesRef, favoriteId), {
          storeId,
          productId: product.id,
          productData: product,
          storeName: storeId, // Se puede mejorar con el nombre real
          addedAt: new Date().toISOString()
        })
      })
      await Promise.all(addPromises)
    } catch (error) {
      console.error('Error syncing favorites to Firestore:', error)
    }
  }

  // Agregar a favoritos en Firestore (estructura mejorada)
  const addToFirestore = async (userId: string, product: PublicProduct) => {
    try {
      const db = getFirebaseDb()
      if (!db) return

      const favoritesRef = collection(db, 'users', userId, 'favorites')
      const favoriteId = `${storeId}_${product.id}`
      
      await setDoc(doc(favoritesRef, favoriteId), {
        storeId,
        productId: product.id,
        productData: product,
        storeName: storeId, // Se puede mejorar con el nombre real
        addedAt: new Date().toISOString()
      })
    } catch (error) {
      console.error('Error adding to Firestore favorites:', error)
    }
  }

  // Eliminar de favoritos en Firestore (estructura mejorada)
  const removeFromFirestore = async (userId: string, productId: string) => {
    try {
      const db = getFirebaseDb()
      if (!db) return

      const favoritesRef = collection(db, 'users', userId, 'favorites')
      const favoriteId = `${storeId}_${productId}`
      await deleteDoc(doc(favoritesRef, favoriteId))
    } catch (error) {
      console.error('Error removing from Firestore favorites:', error)
    }
  }

  // Inicializar favoritos
  useEffect(() => {
    const initializeFavorites = async () => {
      setIsLoading(true)
      
      if (userId) {
        // Usuario autenticado: cargar desde Firestore
        const firestoreFavorites = await loadFromFirestore(userId)
        
        // Si hay favoritos en localStorage, sincronizar con Firestore
        const localFavorites = loadFromLocalStorage()
        if (localFavorites.length > 0) {
          // Combinar favoritos (evitar duplicados)
          const combined = [...firestoreFavorites]
          localFavorites.forEach(localFav => {
            if (!combined.find(f => f.id === localFav.id)) {
              combined.push(localFav)
            }
          })
          
          // Sincronizar con Firestore y limpiar localStorage
          await syncToFirestore(userId, combined)
          localStorage.removeItem(localStorageKey)
          setFavorites(combined)
        } else {
          setFavorites(firestoreFavorites)
        }
      } else {
        // Usuario no autenticado: usar localStorage
        const localFavorites = loadFromLocalStorage()
        setFavorites(localFavorites)
      }
      
      setIsLoading(false)
    }

    initializeFavorites()
  }, [userId, storeId])

  // Verificar si un producto está en favoritos
  const isFavorite = (productId: string): boolean => {
    return favorites.some(fav => fav.id === productId)
  }

  // Agregar producto a favoritos
  const addToFavorites = async (product: PublicProduct) => {
    if (isFavorite(product.id)) return

    const newFavorites = [...favorites, product]
    setFavorites(newFavorites)

    if (userId) {
      await addToFirestore(userId, product)
    } else {
      saveToLocalStorage(newFavorites)
    }
  }

  // Eliminar producto de favoritos
  const removeFromFavorites = async (productId: string) => {
    const newFavorites = favorites.filter(fav => fav.id !== productId)
    setFavorites(newFavorites)

    if (userId) {
      await removeFromFirestore(userId, productId)
    } else {
      saveToLocalStorage(newFavorites)
    }
  }

  // Limpiar todos los favoritos
  const clearFavorites = async () => {
    setFavorites([])

    if (userId) {
      await syncToFirestore(userId, [])
    } else {
      localStorage.removeItem(localStorageKey)
    }
  }

  const value: FavoritesContextType = {
    favorites,
    isFavorite,
    addToFavorites,
    removeFromFavorites,
    clearFavorites,
    isLoading
  }

  return (
    <FavoritesContext.Provider value={value}>
      {children}
    </FavoritesContext.Provider>
  )
} 