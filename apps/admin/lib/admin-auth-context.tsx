'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut
} from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseAuth, getFirebaseDb } from './firebase'

interface AdminUser {
  uid: string
  email: string | null
  displayName: string | null
  role: 'admin' | 'superadmin'
  permissions?: string[]
}

interface AdminAuthContextType {
  user: AdminUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AdminAuthContext = createContext<AdminAuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signOut: async () => {}
})

export function AdminAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Verificar si el usuario tiene rol de admin
  const checkAdminRole = async (uid: string): Promise<AdminUser | null> => {
    try {
      const db = getFirebaseDb()
      if (!db) {
        console.error('[Admin Auth] Firebase DB not available')
        return null
      }

      // Primero verificar en la colección users el campo role
      const userDoc = await getDoc(doc(db, 'users', uid))

      if (!userDoc.exists()) {
        console.log('[Admin Auth] User document not found')
        return null
      }

      const userData = userDoc.data()
      const userRole = userData.role

      // Verificar si es admin o superadmin
      if (userRole !== 'admin' && userRole !== 'superadmin') {
        console.log('[Admin Auth] User is not an admin. Role:', userRole)
        return null
      }

      console.log('[Admin Auth] ✅ Admin verified. Role:', userRole)

      return {
        uid,
        email: userData.email || null,
        displayName: userData.displayName || null,
        role: userRole as 'admin' | 'superadmin',
        permissions: userData.permissions || []
      }
    } catch (error) {
      console.error('[Admin Auth] Error checking admin role:', error)
      return null
    }
  }

  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      console.warn('[Admin Auth] Firebase Auth not available')
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      console.log('[Admin Auth] Auth state changed:', firebaseUser?.uid)

      if (firebaseUser) {
        // Verificar que sea admin
        const adminUser = await checkAdminRole(firebaseUser.uid)

        if (adminUser) {
          setUser(adminUser)
          console.log('[Admin Auth] ✅ Admin logged in:', adminUser.email)
        } else {
          // No es admin, cerrar sesión
          console.log('[Admin Auth] ❌ User is not admin, signing out')
          await firebaseSignOut(auth)
          setUser(null)
        }
      } else {
        setUser(null)
        console.log('[Admin Auth] No user logged in')
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    try {
      const auth = getFirebaseAuth()
      if (!auth) {
        throw new Error('Firebase Auth not available')
      }

      console.log('[Admin Auth] Attempting login for:', email)
      const userCredential = await signInWithEmailAndPassword(auth, email, password)

      // Verificar rol de admin
      const adminUser = await checkAdminRole(userCredential.user.uid)

      if (!adminUser) {
        // No es admin, cerrar sesión inmediatamente
        await firebaseSignOut(auth)
        throw new Error('Access denied. Admin privileges required.')
      }

      console.log('[Admin Auth] ✅ Login successful')
    } catch (error: any) {
      console.error('[Admin Auth] ❌ Login error:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      const auth = getFirebaseAuth()
      if (!auth) {
        throw new Error('Firebase Auth not available')
      }

      await firebaseSignOut(auth)
      setUser(null)
      console.log('[Admin Auth] ✅ Signed out')
    } catch (error) {
      console.error('[Admin Auth] ❌ Sign out error:', error)
      throw error
    }
  }

  return (
    <AdminAuthContext.Provider value={{ user, loading, signIn, signOut }}>
      {children}
    </AdminAuthContext.Provider>
  )
}

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (!context) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}
