'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange } from '../lib/auth'
import { getUserStore } from '../lib/store'
import { getLandingUrl } from '../lib/config'
import StoreSetup from '../components/StoreSetup'
import SuccessScreen from '../components/SuccessScreen'
import Dashboard from '../components/Dashboard'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [authInitialized, setAuthInitialized] = useState(false)
  const [hasStore, setHasStore] = useState(false)
  const [storeData, setStoreData] = useState<any>(null)
  const [showSuccess, setShowSuccess] = useState(false)

  useEffect(() => {
    const unsubscribe = onAuthStateChange(async (authUser) => {
      // Mark auth as initialized after first callback
      if (!authInitialized) {
        setAuthInitialized(true)
      }
      
      setUser(authUser)
      
      if (authUser) {
        // User is authenticated - check if user has a store
        try {
          const userStore = await getUserStore(authUser.uid)
          if (userStore) {
            setHasStore(true)
            setStoreData(userStore)
          } else {
            setHasStore(false)
          }
        } catch (error) {
          console.error('Error getting user store:', error)
          setHasStore(false)
        }
      } else {
        // User is not authenticated - but only redirect if auth is initialized
        // This prevents premature redirects during initial Firebase auth check
        if (authInitialized) {
          // Small delay to ensure this isn't a temporary state
          setTimeout(() => {
            window.location.href = getLandingUrl('/es/login')
          }, 100)
        }
      }
      
      setLoading(false)
    })

    return () => unsubscribe()
  }, [authInitialized])

  const handleStoreCreated = () => {
    setShowSuccess(true)
  }

  const handleSuccessContinue = () => {
    setShowSuccess(false)
    setHasStore(true)
    // Reload store data
    if (user) {
      getUserStore(user.uid).then(store => {
        setStoreData(store)
      })
    }
  }

  // Show loading while Firebase is checking authentication
  if (loading || !authInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Verificando autenticación...</h2>
        </div>
      </div>
    )
  }

  // User not authenticated (only show this after auth is initialized)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900">Redirigiendo...</h2>
          <p className="text-gray-600 mt-2">Si no eres redirigido automáticamente, 
            <a href={getLandingUrl('/es/login')} className="text-blue-600 underline ml-1">
              haz clic aquí
            </a>
          </p>
        </div>
      </div>
    )
  }

  // Show success screen after store creation
  if (showSuccess && storeData) {
    return (
      <SuccessScreen 
        storeName={storeData.storeName || "Tu Tienda"} 
        onContinue={handleSuccessContinue} 
      />
    )
  }

  // User doesn't have a store - show setup
  if (!hasStore) {
    return <StoreSetup onStoreCreated={handleStoreCreated} />
  }

  // User has a store - show dashboard
  return <Dashboard user={user} store={storeData} />
} 