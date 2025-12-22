'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore } from '../../lib/store'
import AuthGuard from '../../components/AuthGuard'
import { useTranslations } from 'next-intl'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

function DashboardContent() {
  const t = useTranslations('loading')
  const router = useRouter()
  const { user, userData } = useAuth()
  const [storeLoading, setStoreLoading] = useState(true)
  const [onboardingChecked, setOnboardingChecked] = useState(false)

  // Check onboarding status and redirect if needed
  useEffect(() => {
    const checkOnboardingStatus = async () => {
      if (user?.uid && userData) {
        // Check if user has completed onboarding
        if (!userData.onboardingUserCompleted) {
          // Nuevo: redirigir al onboarding simplificado
          router.push('/onboarding/simple')
          return
        }

        // Check if user has a store
        setStoreLoading(true)
        try {
          const userStore = await getUserStore(user.uid)

          if (userStore) {
            setOnboardingChecked(true)

            // Redirigir al catálogo (nuevo home simplificado)
            router.push('/catalog')
            return
          } else {
            // Si no tiene tienda, ir al onboarding simple
            router.push('/onboarding/simple')
            return
          }
        } catch (error) {
          console.error('Error getting user store:', error)
        } finally {
          setStoreLoading(false)
        }
      } else if (user === null) {
        // User is not authenticated, reset states
        setStoreLoading(false)
        setOnboardingChecked(false)
      }
    }

    checkOnboardingStatus()
  }, [user?.uid, userData, router]) // Include userData and router in dependencies

  // Show loading while checking onboarding status or store data
  if (storeLoading || !onboardingChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
          <p className="mt-2 text-gray-600">{t('authentication')}</p>
        </div>
      </div>
    )
  }

  // This should never be reached as we redirect in the useEffect above
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-800 mx-auto"></div>
        <p className="mt-2 text-gray-600">{t('general')}</p>
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