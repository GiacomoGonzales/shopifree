'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { 
  User, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  browserLocalPersistence
} from 'firebase/auth'
import { 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  updateDoc,
  deleteField
} from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from './firebase'

// Tipos para el contexto
interface StoreCustomerData {
  uid: string
  email: string
  displayName?: string
  phone?: string
  address?: string
  location?: {
    address: string
    lat: number
    lng: number
  }
  totalOrders: number
  totalSpent: number
  joinedAt: Date
  lastActivity: Date
  preferences: {
    notifications: boolean
    newsletter: boolean
  }
}

interface StoreAuthContextType {
  user: User | null
  storeCustomerData: StoreCustomerData | null
  storeId: string | null
  isAuthenticated: boolean
  loading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  register: (email: string, password: string, userData?: Partial<StoreCustomerData>) => Promise<void>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateProfile: (data: Partial<StoreCustomerData>) => Promise<void>
  clearError: () => void
}

const StoreAuthContext = createContext<StoreAuthContextType | undefined>(undefined)

interface StoreAuthProviderProps {
  children: ReactNode
  storeId: string
}

export function StoreAuthProvider({ children, storeId }: StoreAuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [storeCustomerData, setStoreCustomerData] = useState<StoreCustomerData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Crear usuario global en la colección /users
  const createGlobalUser = async (user: User) => {
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase no está configurado')

    const userRef = doc(db, 'users', user.uid)
    const userDoc = await getDoc(userRef)

    if (!userDoc.exists()) {
      const userData: any = {
        uid: user.uid,
        email: user.email || '',
        role: 'customer',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        lastLoginAt: serverTimestamp()
      }
      
      // Solo agregar displayName si no es undefined
      if (user.displayName) {
        userData.displayName = user.displayName
      }
      
      await setDoc(userRef, userData)
    } else {
      // Actualizar última actividad
      await updateDoc(userRef, {
        lastLoginAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })
    }
  }

  // Crear perfil específico para esta tienda
  const createStoreCustomerProfile = async (userId: string, userData?: Partial<StoreCustomerData>) => {
    const db = getFirebaseDb()
    if (!db) throw new Error('Firebase no está configurado')

    const customerRef = doc(db, 'stores', storeId, 'customers', userId)
    const customerDoc = await getDoc(customerRef)

    if (!customerDoc.exists()) {
      // Obtener datos del usuario global
      const globalUserRef = doc(db, 'users', userId)
      const globalUserDoc = await getDoc(globalUserRef)
      const globalUserData = globalUserDoc.data()

      const customerData: any = {
        uid: userId,
        email: globalUserData?.email || user?.email || '',
        phone: userData?.phone || '',
        address: userData?.address || '',
        totalOrders: 0,
        totalSpent: 0,
        joinedAt: serverTimestamp(),
        lastActivity: serverTimestamp(),
        preferences: {
          notifications: true,
          newsletter: false,
          ...userData?.preferences
        }
      }
      
      // Solo agregar displayName si no es undefined
      const displayName = globalUserData?.displayName || user?.displayName || userData?.displayName
      if (displayName) {
        customerData.displayName = displayName
      }

      await setDoc(customerRef, customerData)
      return customerData
    } else {
      // Actualizar última actividad
      await updateDoc(customerRef, {
        lastActivity: serverTimestamp()
      })
      return customerDoc.data()
    }
  }

  // Obtener datos del cliente para esta tienda
  const getStoreCustomerData = async (userId: string): Promise<StoreCustomerData | null> => {
    const db = getFirebaseDb()
    if (!db) return null

    const customerRef = doc(db, 'stores', storeId, 'customers', userId)
    const customerDoc = await getDoc(customerRef)

    if (customerDoc.exists()) {
      const data = customerDoc.data()
      return {
        uid: userId,
        email: data.email,
        displayName: data.displayName,
        phone: data.phone,
        address: data.address,
        totalOrders: data.totalOrders || 0,
        totalSpent: data.totalSpent || 0,
        joinedAt: data.joinedAt?.toDate() || new Date(),
        lastActivity: data.lastActivity?.toDate() || new Date(),
        preferences: data.preferences || { notifications: true, newsletter: false }
      }
    }

    return null
  }

  // Funciones del contexto
  const login = async (email: string, password: string) => {
    try {
      setError(null)
      setLoading(true)

      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Firebase no está configurado')

      // Configurar persistencia
      await setPersistence(auth, browserLocalPersistence)

      // Login
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password)
      
      // Crear/actualizar usuario global
      await createGlobalUser(firebaseUser)

      // Crear/obtener perfil para esta tienda
      const customerData = await createStoreCustomerProfile(firebaseUser.uid)
      
      setUser(firebaseUser)
      setStoreCustomerData(customerData as StoreCustomerData)
    } catch (error: any) {
      console.error('Error en login:', error)
      setError(getErrorMessage(error))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const register = async (email: string, password: string, userData?: Partial<StoreCustomerData>) => {
    try {
      setError(null)
      setLoading(true)

      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Firebase no está configurado')

      // Configurar persistencia
      await setPersistence(auth, browserLocalPersistence)

      // Intentar crear usuario
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password)
      
      // Crear usuario global
      await createGlobalUser(firebaseUser)

      // Crear perfil para esta tienda
      const customerData = await createStoreCustomerProfile(firebaseUser.uid, userData)
      
      setUser(firebaseUser)
      setStoreCustomerData(customerData as StoreCustomerData)
    } catch (error: any) {
      console.error('Error en registro:', error)
      setError(getErrorMessage(error))
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = async () => {
    try {
      const auth = getFirebaseAuth()
      if (!auth) return

      await signOut(auth)
      setUser(null)
      setStoreCustomerData(null)
    } catch (error: any) {
      console.error('Error en logout:', error)
      setError(getErrorMessage(error))
    }
  }

  const resetPassword = async (email: string) => {
    try {
      setError(null)
      const auth = getFirebaseAuth()
      if (!auth) throw new Error('Firebase no está configurado')

      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Error en reset password:', error)
      setError(getErrorMessage(error))
      throw error
    }
  }

  const updateProfile = async (data: Partial<StoreCustomerData>) => {
    try {
      if (!user || !storeCustomerData) return

      setError(null)
      const db = getFirebaseDb()
      if (!db) throw new Error('Firebase no está configurado')

      const customerRef = doc(db, 'stores', storeId, 'customers', user.uid)
      await updateDoc(customerRef, {
        ...data,
        updatedAt: serverTimestamp()
      })

      // Actualizar estado local
      setStoreCustomerData(prev => prev ? { ...prev, ...data } : null)
    } catch (error: any) {
      console.error('Error actualizando perfil:', error)
      setError(getErrorMessage(error))
      throw error
    }
  }

  const clearError = () => setError(null)

  // Función para obtener mensajes de error amigables
  const getErrorMessage = (error: any): string => {
    if (error.code === 'auth/email-already-in-use') {
      return 'Este correo ya está registrado. Inicia sesión o recupera tu contraseña.'
    }
    if (error.code === 'auth/weak-password') {
      return 'La contraseña debe tener al menos 6 caracteres.'
    }
    if (error.code === 'auth/invalid-email') {
      return 'El formato del correo electrónico no es válido.'
    }
    if (error.code === 'auth/user-not-found') {
      return 'No existe una cuenta con este correo electrónico.'
    }
    if (error.code === 'auth/wrong-password') {
      return 'La contraseña es incorrecta.'
    }
    if (error.code === 'auth/too-many-requests') {
      return 'Demasiados intentos fallidos. Intenta más tarde.'
    }
    return error.message || 'Ha ocurrido un error inesperado.'
  }

  // Escuchar cambios en el estado de autenticación
  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (firebaseUser) {
          // Verificar si el usuario tiene role de customer
          const db = getFirebaseDb()
          if (db) {
            const userRef = doc(db, 'users', firebaseUser.uid)
            const userDoc = await getDoc(userRef)
            const userData = userDoc.data()

            if (userData?.role === 'store_owner') {
              // Si es dueño de tienda, redirigir al dashboard
              window.location.href = '/dashboard'
              return
            }
          }

          // Cargar datos del cliente para esta tienda
          const customerData = await getStoreCustomerData(firebaseUser.uid)
          
          if (!customerData) {
            // Si no tiene perfil en esta tienda, crearlo
            const newCustomerData = await createStoreCustomerProfile(firebaseUser.uid)
            setStoreCustomerData(newCustomerData as StoreCustomerData)
          } else {
            setStoreCustomerData(customerData)
          }
          
          setUser(firebaseUser)
        } else {
          setUser(null)
          setStoreCustomerData(null)
        }
      } catch (error) {
        console.error('Error en auth state change:', error)
        setError('Error al cargar los datos del usuario')
      } finally {
        setLoading(false)
      }
    })

    return () => unsubscribe()
  }, [storeId])

  const value: StoreAuthContextType = {
    user,
    storeCustomerData,
    storeId,
    isAuthenticated: !!user && !!storeCustomerData,
    loading,
    error,
    login,
    register,
    logout,
    resetPassword,
    updateProfile,
    clearError
  }

  return (
    <StoreAuthContext.Provider value={value}>
      {children}
    </StoreAuthContext.Provider>
  )
}

export const useStoreAuth = () => {
  const context = useContext(StoreAuthContext)
  if (context === undefined) {
    throw new Error('useStoreAuth must be used within a StoreAuthProvider')
  }
  return context
} 