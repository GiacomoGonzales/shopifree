'use client'

import { ReactNode, useEffect, useState } from 'react'
import { User, onAuthStateChanged } from 'firebase/auth'
import { getFirebaseAuth } from './firebase'
import { FavoritesProvider } from './favorites-context'

interface AuthFavoritesWrapperProps {
  children: ReactNode
  storeId: string
}

export function AuthFavoritesWrapper({ children, storeId }: AuthFavoritesWrapperProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const auth = getFirebaseAuth()
    if (!auth) {
      setLoading(false)
      return
    }

    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    )
  }

  return (
    <FavoritesProvider storeId={storeId} userId={user?.uid || null}>
      {children}
    </FavoritesProvider>
  )
} 