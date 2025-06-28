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
            console.log('✅ Store found, redirecting to home')
            setHasStore(true)
            setStoreData(userStore)
            setOnboardingChecked(true)
            
            // Redirect to home page
            const currentLocale = window.location.pathname.split('/')[1] || 'es'
            router.push(`/${currentLocale}/home`)
            return
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
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-2 text-gray-600">Verificando configuración...</p>
        </div>
      </div>
    )
  }

  // This should never be reached as we redirect in the useEffect above
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  )
} 