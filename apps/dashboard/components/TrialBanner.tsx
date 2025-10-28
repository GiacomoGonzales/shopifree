'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../lib/simple-auth-context'
import { getSubscriptionStatus, startPremiumTrial } from '../lib/subscription-utils'

export default function TrialBanner() {
  const { user, refreshUserData } = useAuth()
  const [bannerState, setBannerState] = useState<{
    type: 'activate' | 'active_trial' | 'none'
    daysRemaining?: number
    plan?: string
  }>({ type: 'none' })
  const [isLoading, setIsLoading] = useState(true)
  const [isActivating, setIsActivating] = useState(false)
  const [isDismissed, setIsDismissed] = useState(false)

  useEffect(() => {
    const checkStatus = async () => {
      if (!user) {
        setIsLoading(false)
        return
      }

      try {
        const subscriptionStatus = await getSubscriptionStatus(user.uid)

        // User is on FREE plan and hasn't activated trial
        if (subscriptionStatus.status === 'free') {
          setBannerState({ type: 'activate' })
        }
        // User is on trial
        else if (subscriptionStatus.status === 'trial' && subscriptionStatus.trialDaysRemaining) {
          setBannerState({
            type: 'active_trial',
            daysRemaining: subscriptionStatus.trialDaysRemaining,
            plan: subscriptionStatus.plan
          })
        }
        // User is on paid plan or trial expired
        else {
          setBannerState({ type: 'none' })
        }
      } catch (error) {
        console.error('Error checking subscription status:', error)
        setBannerState({ type: 'none' })
      } finally {
        setIsLoading(false)
      }
    }

    checkStatus()
  }, [user])

  const handleActivateTrial = async () => {
    if (!user || isActivating) return

    setIsActivating(true)
    try {
      await startPremiumTrial(user.uid)

      // Refresh user data to get updated subscription info
      await refreshUserData()

      // Update banner state
      setBannerState({
        type: 'active_trial',
        daysRemaining: 30,
        plan: 'premium'
      })
    } catch (error) {
      console.error('Error activating trial:', error)
      alert('Error al activar el periodo de prueba. Por favor intenta nuevamente.')
    } finally {
      setIsActivating(false)
    }
  }

  // Don't show if loading or no banner needed
  if (isLoading || bannerState.type === 'none' || isDismissed) {
    return null
  }

  // BANNER: Activate Trial (for FREE users)
  if (bannerState.type === 'activate') {
    return (
      <div className="bg-gray-50 border-b border-gray-200 px-4 py-4 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          {/* Icon + Message */}
          <div className="flex items-start md:items-center gap-3 flex-1">
            <div className="text-gray-600 flex-shrink-0 mt-0.5 md:mt-0">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>

            <div className="flex-1">
              <p className="text-gray-900 text-sm font-medium">
                Desbloquea todo el potencial de tu tienda
              </p>
              <p className="text-gray-600 text-xs mt-1">
                Activa 30 días gratis del plan Premium: hasta 50 productos, dominio personalizado, pagos integrados y más.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <button
              onClick={handleActivateTrial}
              disabled={isActivating}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 flex-1 md:flex-initial justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isActivating ? (
                <>
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Activando...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Activar 30 días gratis
                </>
              )}
            </button>

            {/* Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              className="text-gray-400 hover:text-gray-600 p-2 transition-colors"
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // BANNER: Active Trial (countdown)
  if (bannerState.type === 'active_trial' && bannerState.daysRemaining !== undefined) {
    const { daysRemaining, plan } = bannerState
    const planName = plan === 'premium' ? 'Premium' : 'Pro'

    // Determine urgency level
    const isUrgent = daysRemaining <= 7
    const isCritical = daysRemaining <= 3

    const bgColor = isCritical
      ? 'bg-red-50 border-red-200'
      : isUrgent
        ? 'bg-orange-50 border-orange-200'
        : 'bg-gray-50 border-gray-200'

    const textColor = isCritical
      ? 'text-red-900'
      : isUrgent
        ? 'text-orange-900'
        : 'text-gray-900'

    const iconColor = isCritical
      ? 'text-red-600'
      : isUrgent
        ? 'text-orange-600'
        : 'text-gray-600'

    const contactMessage = `Hola, quiero contratar el plan ${planName} de Shopifree. Mi periodo de prueba está por terminar.`
    const whatsappUrl = `https://wa.me/51958371017?text=${encodeURIComponent(contactMessage)}`

    return (
      <div className={`${bgColor} border-b px-4 py-4 relative`}>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Icon + Message */}
          <div className="flex items-start md:items-center gap-3 flex-1">
            <div className={`${iconColor} flex-shrink-0 mt-0.5 md:mt-0`}>
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="flex-1">
              <p className={`${textColor} text-sm font-medium`}>
                {daysRemaining === 1
                  ? 'Último día de prueba gratis'
                  : daysRemaining === 0
                    ? 'Tu periodo de prueba expira hoy'
                    : `Te quedan ${daysRemaining} días de prueba gratis del plan ${planName}`
                }
              </p>
              <p className={`${textColor} text-xs mt-1 opacity-90`}>
                Contacta con ventas para continuar disfrutando de todas las funcionalidades premium.
              </p>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 w-full md:w-auto">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md flex items-center gap-2 flex-1 md:flex-initial justify-center"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contactar Ventas
            </a>

            {/* Dismiss button */}
            <button
              onClick={() => setIsDismissed(true)}
              className={`${textColor} hover:opacity-70 p-2 transition-opacity`}
              aria-label="Cerrar"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    )
  }

  return null
}
