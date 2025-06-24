'use client'

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth, getFirebaseDb } from './firebase'
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'

// Simple user interface that works with existing data
interface UserData {
  uid: string
  email: string | null
  [key: string]: any // Allow any additional fields
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  loading: boolean
  error: string | null
  isAuthenticated: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Simple function to get user data - compatible with existing structure
  const getUserData = async (user: User): Promise<UserData | null> => {
    try {
      const db = getFirebaseDb()
      if (!db) {
        console.warn('Firebase db not available')
        return null
      }

      const userDocRef = doc(db, 'users', user.uid)
      const userDocSnap = await getDoc(userDocRef)

      if (userDocSnap.exists()) {
        const data = userDocSnap.data()
        
        // Update last login without overwriting other data
        try {
          await setDoc(userDocRef, {
            lastLoginAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          }, { merge: true })
        } catch (updateError) {
          console.warn('Could not update last login:', updateError)
        }

        // Return normalized data
        return {
          uid: user.uid,
          email: user.email,
          ...data // Include all existing fields
        }
      }

      console.log('No user document found for:', user.uid)
      return null
    } catch (error) {
      console.error('Error getting user data:', error)
      return null
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
      console.warn('Firebase auth not available')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        setError(null)
        
        if (firebaseUser) {
          setUser(firebaseUser)
          
          const userData = await getUserData(firebaseUser)
          if (userData) {
            setUserData(userData)
          } else {
            setError('No se encontró información del usuario en la base de datos.')
          }
        } else {
          setUser(null)
          setUserData(null)
        }
      } catch (error) {
        console.error('Auth error:', error)
        setError('Error de autenticación')
      } finally {
        setLoading(false)
      }
    })

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
