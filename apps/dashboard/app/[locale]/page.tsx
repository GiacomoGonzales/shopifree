'use client'

import { useState } from 'react'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, StoreWithId } from '../../lib/store'
import AuthGuard from '../../components/AuthGuard'
import StoreSetup from '../../components/StoreSetup'
import Dashboard from '../../components/Dashboard'
import { useEffect } from 'react'
import { useTranslations } from 'next-intl'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function DashboardContent() {
  const t = useTranslations('loading')
  const { user, userData } = useAuth()
  const [hasStore, setHasStore] = useState(false)
  const [storeData, setStoreData] = useState<StoreWithId | null>(null)
  const [storeLoading, setStoreLoading] = useState(true)

  // Check if user has a store when component mounts or user changes
  useEffect(() => {
    const checkUserStore = async () => {
      if (user?.uid) {
        setStoreLoading(true)
        try {
          const userStore = await getUserStore(user.uid)
          
          if (userStore) {
            setHasStore(true)
            setStoreData(userStore)
          } else {
            setHasStore(false)
            setStoreData(null)
          }
        } catch (error) {
          console.error('Error getting user store:', error)
          setHasStore(false)
          setStoreData(null)
        } finally {
          setStoreLoading(false)
        }
      } else if (user === null) {
        // User is not authenticated, reset states
        setHasStore(false)
        setStoreData(null)
        setStoreLoading(false)
      }
    }

    checkUserStore()
  }, [user?.uid]) // Solo depende del UID del usuario

  const handleStoreCreated = async () => {
    // After store creation, refresh the store data
    if (user?.uid) {
      setStoreLoading(true)
      try {
        const userStore = await getUserStore(user.uid)
        if (userStore) {
          setHasStore(true)
          setStoreData(userStore)
        }
      } catch (error) {
        console.error('Error refreshing store data:', error)
      } finally {
        setStoreLoading(false)
      }
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
          <h2 className="text-xl font-semibold text-gray-900">{t('store')}</h2>
        </div>
      </div>
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