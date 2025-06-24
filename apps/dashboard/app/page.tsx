'use client'

import { useState, useEffect } from 'react'
import { User } from 'firebase/auth'
import { onAuthStateChange } from '../lib/auth'
import { getUserStore, StoreWithId } from '../lib/store'
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
  const [storeData, setStoreData] = useState<StoreWithId | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string[]>([])

  // Debug function
  const addDebugInfo = (message: string) => {
    console.log(`[Dashboard Debug] ${message}`)
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`])
  }

  useEffect(() => {
    addDebugInfo('Component mounted, setting up auth listener')
    
    const unsubscribe = onAuthStateChange(async (authUser) => {
      addDebugInfo(`Auth state changed. User: ${authUser ? 'EXISTS' : 'NULL'}`)
      
      // Mark auth as initialized after first callback
      if (!authInitialized) {
        setAuthInitialized(true)
        addDebugInfo('Auth initialized')
      }
      
      setUser(authUser)
      
      if (authUser) {
        addDebugInfo(`User authenticated: ${authUser.email} (UID: ${authUser.uid})`)
        
        // User is authenticated - check if user has a store
        try {
          addDebugInfo('Checking user store...')
          const userStore = await getUserStore(authUser.uid)
          if (userStore) {
            addDebugInfo(`User has store: ${userStore.storeName}`)
            setHasStore(true)
            setStoreData(userStore)
          } else {
            addDebugInfo('User has no store')
            setHasStore(false)
          }
        } catch (error) {
          addDebugInfo(`Error getting user store: ${error}`)
          console.error('Error getting user store:', error)
          setHasStore(false)
        }
      } else {
        addDebugInfo(`User not authenticated. Auth initialized: ${authInitialized}`)
        
        // User is not authenticated - but only redirect if auth is initialized
        // This prevents premature redirects during initial Firebase auth check
        if (authInitialized) {
          addDebugInfo('Will redirect to login in 2 seconds...')
          // Increased delay to allow debugging
          setTimeout(() => {
            addDebugInfo('Redirecting to login now')
            window.location.href = getLandingUrl('/es/login')
          }, 2000)
        }
      }
      
      setLoading(false)
    })

    return () => {
      addDebugInfo('Cleaning up auth listener')
      unsubscribe()
    }
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
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Verificando autenticación...</h2>
          
          {/* Debug info */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 text-left bg-gray-100 p-3 rounded text-xs">
              <strong>Debug Info:</strong>
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // User not authenticated (only show this after auth is initialized)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900">Redirigiendo...</h2>
          <p className="text-gray-600 mt-2">Si no eres redirigido automáticamente, 
            <a href={getLandingUrl('/es/login')} className="text-blue-600 underline ml-1">
              haz clic aquí
            </a>
          </p>
          
          {/* Debug info for production */}
          <details className="mt-4 text-left">
            <summary className="cursor-pointer text-sm text-gray-500">Información de debug</summary>
            <div className="mt-2 bg-gray-100 p-3 rounded text-xs">
              <strong>Variables de entorno:</strong>
              <div>NEXT_PUBLIC_LANDING_URL: {process.env.NEXT_PUBLIC_LANDING_URL || 'undefined'}</div>
              <div>NEXT_PUBLIC_DASHBOARD_URL: {process.env.NEXT_PUBLIC_DASHBOARD_URL || 'undefined'}</div>
              <div>NEXT_PUBLIC_FIREBASE_PROJECT_ID: {process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'undefined'}</div>
              <br />
              <strong>Debug log:</strong>
              {debugInfo.map((info, index) => (
                <div key={index}>{info}</div>
              ))}
            </div>
          </details>
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