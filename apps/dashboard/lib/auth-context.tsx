'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from './firebase'
import { getUserDocument, createUserDocument, UserDocument } from './user'

// Types
interface AuthContextType {
  user: User | null
  userData: UserDocument | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Auth Provider Component
interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserDocument | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Get or create user document from Firestore
  const fetchOrCreateUserData = async (user: User): Promise<UserDocument | null> => {
    try {
      // First try to get existing user document
      let userData = await getUserDocument(user.uid)
      
      if (!userData) {
        // If user document doesn't exist, create it
        console.log(`Creating new user document for ${user.email}`)
        userData = await createUserDocument(user)
      } else {
        // Update last login time for existing users
        userData = await createUserDocument(user)
      }
      
      return userData
    } catch (error) {
      console.error('Error fetching/creating user data:', error)
      throw error
    }
  }

  // Sign out function
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
      console.warn('Firebase auth not available')
      setLoading(false)
      return
    }

    // Set up auth state listener
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null)
        
        if (firebaseUser) {
          // User is signed in
          setUser(firebaseUser)
          
          // Fetch or create user data in Firestore
          try {
            const userData = await fetchOrCreateUserData(firebaseUser)
            setUserData(userData)
            
            if (!userData) {
              setError('No se pudo crear o cargar tu perfil de usuario.')
            }
          } catch (error) {
            console.error('Error with user data:', error)
            setError('Error al cargar los datos del usuario')
            setUserData(null)
          }
        } else {
          // User is signed out
          setUser(null)
          setUserData(null)
        }
      } catch (error) {
        console.error('Auth state change error:', error)
        setError('Error de autenticación')
      } finally {
        setLoading(false)
      }
    })

    // Cleanup subscription
    return () => unsubscribe()
  }, [])

  const value: AuthContextType = {
    user,
    userData,
    loading,
    error,
    isAuthenticated: !!user && !!userData,
    signOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

// Hook to use auth context
export function useAuth(): AuthContextType {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 