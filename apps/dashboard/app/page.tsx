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
  const [waitingForAuth, setWaitingForAuth] = useState(false)

  useEffect(() => {
    // Check if user was redirected from login
    const urlParams = new URLSearchParams(window.location.search)
    const fromLogin = urlParams.get('from_login')
    
    if (fromLogin) {
      setWaitingForAuth(true)
      // Clean URL
      window.history.replaceState({}, '', window.location.pathname)
    }
    
    let authTimeout: NodeJS.Timeout
    
    const unsubscribe = onAuthStateChange(async (authUser) => {
      // Mark auth as initialized after first callback
      if (!authInitialized) {
        setAuthInitialized(true)
      }
      
      setUser(authUser)
      
      if (authUser) {
        // User is authenticated
        setWaitingForAuth(false)
        
        // Clear any pending timeout
        if (authTimeout) {
          clearTimeout(authTimeout)
        }
        
        // Check if user has a store
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
        // User not authenticated
        if (authInitialized && !waitingForAuth) {
          // Redirect to login immediately if not waiting for auth
          window.location.href = getLandingUrl('/es/login')
        } else if (fromLogin || waitingForAuth) {
          // If coming from login, wait a bit longer
          authTimeout = setTimeout(() => {
            setWaitingForAuth(false)
            // If still no user after waiting, redirect to login
            if (!authUser) {
              window.location.href = getLandingUrl('/es/login')
            }
          }, 8000) // 8 seconds for auth sync
        }
      }
      
      setLoading(false)
    })

    return () => {
      if (authTimeout) {
        clearTimeout(authTimeout)
      }
      unsubscribe()
    }
  }, [authInitialized, waitingForAuth])

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

  const handleForceRefresh = () => {
    window.location.reload()
  }

  const handleManualLogin = () => {
    window.location.href = getLandingUrl('/es/login')
  }

  // Show loading while Firebase is checking authentication
  if (loading || (waitingForAuth && !user)) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            {waitingForAuth ? 'Sincronizando sesión...' : 'Verificando autenticación...'}
          </h2>
          <p className="text-sm text-gray-600 mt-2">
            {waitingForAuth 
              ? 'Esto puede tomar unos segundos después del login' 
              : 'Cargando tu información de usuario'
            }
          </p>
          
          {waitingForAuth && (
            <div className="mt-6 space-y-2">
              <button
                onClick={handleForceRefresh}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm"
              >
                Actualizar página
              </button>
              <br />
              <button
                onClick={handleManualLogin}
                className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 text-sm"
              >
                Volver al login
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  // User not authenticated (only show this after auth is properly checked)
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold text-gray-900">Redirigiendo al login...</h2>
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