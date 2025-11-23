'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth, getFirebaseDb } from './firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { createUserDocument } from './user'

// Simple user interface that works with existing data
interface UserData {
  uid: string
  email: string | null
  [key: string]: unknown // Allow any additional fields
}

interface DebugInfo {
  [key: string]: unknown
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  authInitialized: boolean
  error: string | null
  isAuthenticated: boolean
  signOut: () => Promise<void>
  refreshUserData: () => Promise<void> // Add refresh function
  debugInfo: DebugInfo // Add debug info
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<DebugInfo>({})
  const [hasRedirectedToRecover, setHasRedirectedToRecover] = useState(false)

  // Simple function to get user data - compatible with existing structure
  const getUserData = async (user: User): Promise<UserData | null> => {
    try {
      const db = getFirebaseDb()
      if (!db) {
        console.warn('❌ Firebase db not available')
        setDebugInfo((prev: DebugInfo) => ({ ...prev, dbAvailable: false }))
        return null
      }

      setDebugInfo((prev: DebugInfo) => ({ ...prev, dbAvailable: true }))

      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const data = userDocSnap.data()

        // 🚫 Verificar si la cuenta está marcada como eliminada
        if (data.deleted === true) {
          console.warn('🚫 Account is marked for deletion')

          setDebugInfo((prev: DebugInfo) => ({
            ...prev,
            userDocExists: true,
            accountDeleted: true,
            deletedAt: data.deletedAt,
            scheduledDeletionDate: data.scheduledDeletionDate,
            timestamp: new Date().toISOString()
          }))

          // Retornar los datos del usuario para permitir acceso temporal
          return {
            uid: user.uid,
            email: user.email,
            ...data
          }
        }

        setDebugInfo((prev: DebugInfo) => ({
          ...prev,
          userDocExists: true,
          userDocData: data,
          timestamp: new Date().toISOString()
        }))

        // Update last login without overwriting other data
        try {
          await setDoc(userDocRef, {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true })
        } catch (updateError) {
          console.warn('⚠️ Could not update last login:', updateError)
        }

        // Return normalized data
        return {
          uid: user.uid,
          email: user.email,
          ...data // Include all existing fields
        }
      }

      // Create user document automatically if not found
      try {
        const newUserData = await createUserDocument(user)
        
        setDebugInfo((prev: DebugInfo) => ({ 
          ...prev, 
          userDocExists: false,
          userDocCreated: true,
          searchedUid: user.uid,
          newUserData: newUserData,
          timestamp: new Date().toISOString()
        }))
        
        return newUserData
      } catch (createError) {
        console.error('❌ Error creating user document:', createError)
        setDebugInfo((prev: DebugInfo) => ({ 
          ...prev, 
          userDocExists: false,
          userDocCreated: false,
          createError: createError instanceof Error ? createError.message : String(createError),
          searchedUid: user.uid,
          timestamp: new Date().toISOString()
        }))
        return null
      }
    } catch (error) {
      console.error('❌ Error getting user data:', error)
      setDebugInfo((prev: DebugInfo) => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString()
      }))
      return null
    }
  }

  const refreshUserData = async () => {
    if (user) {
      try {
        const freshUserData = await getUserData(user)
        if (freshUserData) {
          setUserData(freshUserData)
        }
      } catch (error) {
        console.error('❌ Error refreshing user data:', error)
      }
    }
  }

  const signOut = async () => {
    try {
      const auth = getFirebaseAuth()
      if (auth) {
        await auth.signOut()
      }
    } catch (error) {
      console.error('Error signing out:', error)
      setError('Error al cerrar sesión')
    }
  }

  useEffect(() => {
    const auth = getFirebaseAuth()

    if (!auth) {
      console.warn('❌ Firebase auth not available')
      setDebugInfo({ authAvailable: false })
      setLoading(false)
      setAuthInitialized(true)
      return
    }

    setDebugInfo((prev: DebugInfo) => ({ ...prev, authAvailable: true }))

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null)

        if (firebaseUser) {
          setUser(firebaseUser)

          const userData = await getUserData(firebaseUser)
          if (userData) {
            setUserData(userData)
          } else {
            setError('Error al cargar los datos del usuario. Por favor, intenta nuevamente.')
          }
        } else {
          setUser(null)
          setUserData(null)
        }
      } catch (error) {
        console.error('❌ Auth error:', error)
        setError('Error de autenticación: ' + (error instanceof Error ? error.message : String(error)))
      } finally {
        setLoading(false)
        setAuthInitialized(true)
      }
    })

    return () => unsubscribe()
  }, [])

  // 🚫 Redirigir a página de recuperación si la cuenta está eliminada
  useEffect(() => {
    if (!loading && userData && (userData as any).deleted === true) {
      // Solo redirigir si no estamos en la página de recover y no hemos redirigido ya
      if (typeof window !== 'undefined' &&
          !window.location.pathname.includes('/account/recover') &&
          !hasRedirectedToRecover) {
        console.log('🔄 Redirecting to account recovery page...')
        setHasRedirectedToRecover(true)
        // Usar un pequeño timeout para evitar conflictos con otros efectos
        setTimeout(() => {
          window.location.href = '/es/account/recover'
        }, 100)
      }
    }
  }, [loading, userData, hasRedirectedToRecover])

  const value: AuthContextType = {
    user,
    userData,
    loading,
    authInitialized,
    error,
    isAuthenticated: !!user, // 🔥 Solo depender del user, no de userData
    signOut,
    refreshUserData,
    debugInfo
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

interface AuthProviderProps {
  children: ReactNode
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
