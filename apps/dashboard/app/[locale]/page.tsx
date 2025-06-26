'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
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
  const router = useRouter()
  const { user, userData } = useAuth()
  const [hasStore, setHasStore] = useState(false)
  const [storeData, setStoreData] = useState<StoreWithId | null>(null)
  const [storeLoading, setStoreLoading] = useState(true)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  // Check onboarding status and redirect if needed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      console.log('🔍 Checking onboarding status:', {
        userUid: user?.uid,
        hasUserData: !!userData,
        onboardingUserCompleted: userData?.onboardingUserCompleted,
        userDataKeys: userData ? Object.keys(userData) : []
      })

      if (user?.uid && userData) {
        // Check if user has completed onboarding
        if (!userData.onboardingUserCompleted) {
          console.log('👤 User onboarding not completed, redirecting to /onboarding/user')
          router.push('/onboarding/user')
          return
        }

        console.log('✅ User onboarding completed, checking for store...')

        // Check if user has a store
        setStoreLoading(true)
        try {
          const userStore = await getUserStore(user.uid)
          console.log('🏪 Store check result:', !!userStore, userStore?.id)
          
          if (userStore) {
            console.log('✅ Store found, showing dashboard')
            setHasStore(true)
            setStoreData(userStore)
            setOnboardingChecked(true)
          } else {
            console.log('🏪 User store not found, redirecting to /onboarding/store')
            router.push('/onboarding/store')
            return
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
        console.log('❌ User not authenticated, resetting states')
        setHasStore(false)
        setStoreData(null)
        setStoreLoading(false)
        setOnboardingChecked(false)
      } else {
        console.log('⏳ Waiting for user or userData...', {
          hasUser: !!user,
          hasUserData: !!userData
        })
      }
    }

    checkOnboardingStatus()
  }, [user?.uid, userData, router]) // Include userData and router in dependencies

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

  // Show loading while checking onboarding status or store data
  if (storeLoading || !onboardingChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-500 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-white animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{t('store')}</h2>
          <p className="text-gray-600 mt-2">Verificando estado de configuración...</p>
        </div>
      </div>
    )
  }

  // All onboarding completed - show dashboard
  return <Dashboard store={storeData} />
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
} 