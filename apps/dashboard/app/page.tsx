'use client'

import { useState } from 'react'
import { useAuth } from '../lib/auth-context'
import { getUserStore, StoreWithId } from '../lib/store'
import AuthGuard from '../components/AuthGuard'
import StoreSetup from '../components/StoreSetup'
import SuccessScreen from '../components/SuccessScreen'
import Dashboard from '../components/Dashboard'
import { useEffect } from 'react'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function DashboardContent() {
  const { user, userData } = useAuth()
  const [hasStore, setHasStore] = useState(false)
  const [storeData, setStoreData] = useState<StoreWithId | null>(null)
  const [showSuccess, setShowSuccess] = useState(false)
  const [storeLoading, setStoreLoading] = useState(true)

  // Check if user has a store when component mounts
  useEffect(() => {
    const checkUserStore = async () => {
      if (user) {
        try {
          const userStore = await getUserStore(user.uid)
          if (userStore) {
            setHasStore(true)
            setStoreData(userStore)
          } else {
            setHasStore(false)
          }
        } catch (error) {
          console.error('Error getting user store:', error)
          setHasStore(false)
        } finally {
          setStoreLoading(false)
        }
      }
    }

    checkUserStore()
  }, [user])

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

  // Show loading while checking store data
  if (storeLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Cargando tu tienda...</h2>
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
  return <Dashboard store={storeData} />
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
} 