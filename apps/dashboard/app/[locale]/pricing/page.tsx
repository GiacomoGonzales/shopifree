'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/simple-auth-context'
import { getSubscriptionStatus, startPremiumTrial } from '../../../lib/subscription-utils'
import { Toast } from '../../../components/shared/Toast'
import { useToast } from '../../../lib/hooks/useToast'

export default function PricingPage() {
  const router = useRouter()
  const { user, refreshUserData } = useAuth()
  const { toast, showToast, hideToast } = useToast()

  const [subscriptionData, setSubscriptionData] = useState<{
    status: 'trial' | 'active' | 'cancelled' | 'expired' | 'free'
    plan: 'free' | 'premium' | 'pro'
    trialDaysRemaining?: number
    isExpired: boolean
  } | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [activatingTrial, setActivatingTrial] = useState(false)

  // Cargar información de suscripción
  useEffect(() => {
    const loadSubscription = async () => {
      if (!user?.uid) return
      try {
        const subscription = await getSubscriptionStatus(user.uid)
        setSubscriptionData(subscription)
      } catch (error) {
        console.error('Error loading subscription:', error)
      } finally {
        setLoadingSubscription(false)
      }
    }
    loadSubscription()
  }, [user?.uid])

  // Función para activar trial de Premium
  const handleActivateTrial = async () => {
    if (!user?.uid || activatingTrial) return
    setActivatingTrial(true)
    try {
      await startPremiumTrial(user.uid)
      await refreshUserData()

      // Recargar datos de suscripción
      const subscription = await getSubscriptionStatus(user.uid)
      setSubscriptionData(subscription)

      showToast('¡Trial de Premium activado! Tienes 30 días de acceso completo.', 'success')
    } catch (error) {
      console.error('Error activating trial:', error)
      showToast('Error al activar el trial. Intenta nuevamente.', 'error')
    } finally {
      setActivatingTrial(false)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 'Gratis',
      priceDetail: 'de por vida',
      description: 'Perfecto para empezar',
      features: [
        { text: 'Hasta 12 productos', included: true },
        { text: 'Ventas ilimitadas', included: true },
        { text: 'Ventas por WhatsApp', included: true },
        { text: 'Pagos manuales', included: true },
        { text: 'Subdominio gratis (.shopifree.app)', included: true },
        { text: 'SSL gratis', included: true },
        { text: 'Cupones de descuento', included: true },
        { text: 'Reportes básicos', included: true },
        { text: 'SEO avanzado', included: true },
        { text: 'Hosting ilimitado', included: true },
        { text: 'Dominio personalizado', included: false },
        { text: 'Pagos integrados', included: false },
        { text: 'Checkout tradicional', included: false }
      ],
      highlighted: false
    },
    {
      id: 'premium',
      name: 'Premium',
      price: '$15',
      priceDetail: '/mes',
      description: 'Para tiendas en crecimiento',
      includesAll: 'Free',
      features: [
        { text: 'Hasta 50 productos', included: true },
        { text: 'Pagos integrados (MercadoPago, PayPal, Stripe)', included: true },
        { text: 'Checkout tradicional', included: true },
        { text: 'Recuperación de carritos abandonados', included: true },
        { text: 'Emails automáticos', included: true },
        { text: 'Dominio personalizado', included: true },
        { text: 'Reportes completos', included: true },
        { text: 'Google Analytics', included: true },
        { text: 'Google Search Console', included: true },
        { text: 'Meta Pixel & TikTok Pixel', included: true }
      ],
      highlighted: true,
      badge: '30 días gratis'
    },
    {
      id: 'pro',
      name: 'Pro',
      price: '$30',
      priceDetail: '/mes',
      description: 'Para tiendas profesionales',
      includesAll: 'Premium',
      features: [
        { text: 'Productos ilimitados', included: true },
        { text: 'Ventas internacionales', included: true },
        { text: 'Múltiples idiomas', included: true },
        { text: 'Traducción automática', included: true },
        { text: 'Segmentación de clientes', included: true },
        { text: 'Marketing avanzado', included: true },
        { text: 'Analíticas por país', included: true },
        { text: 'Temas exclusivos', included: true },
        { text: 'Soporte prioritario 24/7', included: true }
      ],
      highlighted: false
    }
  ]

  const getButtonForPlan = (planId: string) => {
    if (loadingSubscription) {
      return (
        <button
          disabled
          className="w-full px-6 py-3 rounded-lg text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed"
        >
          Cargando...
        </button>
      )
    }

    // Plan FREE
    if (planId === 'free') {
      if (subscriptionData?.plan === 'free' && subscriptionData?.status === 'free') {
        return (
          <button
            disabled
            className="w-full px-6 py-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 cursor-default"
          >
            Plan actual
          </button>
        )
      }
      return null // No mostrar botón si ya tiene un plan superior
    }

    // Plan PREMIUM
    if (planId === 'premium') {
      // Si es FREE, puede activar trial
      if (subscriptionData?.plan === 'free' && subscriptionData?.status === 'free') {
        return (
          <button
            onClick={handleActivateTrial}
            disabled={activatingTrial}
            className="w-full px-6 py-3 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center justify-center gap-2"
          >
            {activatingTrial ? (
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
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Probar 30 días gratis
              </>
            )}
          </button>
        )
      }

      // Si ya está en trial o tiene Premium activo
      if ((subscriptionData?.plan === 'premium' && subscriptionData?.status === 'trial') ||
          (subscriptionData?.plan === 'premium' && subscriptionData?.status === 'active')) {
        return (
          <button
            disabled
            className="w-full px-6 py-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 cursor-default border border-gray-200"
          >
            {subscriptionData?.status === 'trial' ? 'Trial activo' : 'Plan actual'}
          </button>
        )
      }

      // Si tiene Pro, puede hacer downgrade contactando ventas
      return (
        <a
          href="https://wa.me/51958371017?text=Hola,%20quiero%20contratar%20el%20plan%20Premium%20de%20Shopifree"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-6 py-3 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-all duration-200 inline-flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Contactar Ventas
        </a>
      )
    }

    // Plan PRO
    if (planId === 'pro') {
      // Si ya tiene Pro activo
      if (subscriptionData?.plan === 'pro' && subscriptionData?.status === 'active') {
        return (
          <button
            disabled
            className="w-full px-6 py-3 rounded-lg text-sm font-medium bg-gray-100 text-gray-600 cursor-default border border-gray-200"
          >
            Plan actual
          </button>
        )
      }

      // Cualquier otro caso: contactar ventas
      return (
        <a
          href="https://wa.me/51958371017?text=Hola,%20quiero%20contratar%20el%20plan%20Pro%20de%20Shopifree"
          target="_blank"
          rel="noopener noreferrer"
          className="w-full px-6 py-3 rounded-lg text-sm font-medium text-white bg-gray-900 hover:bg-gray-800 transition-all duration-200 inline-flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
          </svg>
          Contactar Ventas
        </a>
      )
    }

    return null
  }

  return (
    <DashboardLayout>
      <div className="py-6 bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light text-gray-900 mb-3">
              Planes y Precios
            </h1>
            <p className="text-lg text-gray-600 font-light max-w-2xl mx-auto">
              Elige el plan perfecto para tu negocio. Comienza gratis y crece cuando estés listo.
            </p>
          </div>

          {/* Current Plan Banner */}
          {!loadingSubscription && subscriptionData && (
            <div className="mb-8 bg-white rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-500 font-light">Plan actual:</span>
                    {subscriptionData.status === 'free' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-normal bg-gray-50 text-gray-700 border border-gray-200">
                        Free
                      </span>
                    )}
                    {subscriptionData.status === 'trial' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-normal bg-gray-50 text-gray-700 border border-gray-300">
                        Premium Trial ({subscriptionData.trialDaysRemaining} días restantes)
                      </span>
                    )}
                    {subscriptionData.status === 'active' && subscriptionData.plan === 'premium' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-normal bg-gray-50 text-gray-700 border border-gray-300">
                        Premium
                      </span>
                    )}
                    {subscriptionData.status === 'active' && subscriptionData.plan === 'pro' && (
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-normal bg-gray-50 text-gray-700 border border-gray-300">
                        Pro
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => router.push('/account')}
                  className="text-sm text-gray-500 hover:text-gray-700 transition-colors font-light"
                >
                  Ver detalles →
                </button>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl shadow-sm border transition-all duration-200 ${
                  plan.highlighted
                    ? 'border-gray-900 shadow-lg'
                    : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                }`}
              >
                {/* Badge */}
                {plan.badge && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="inline-flex items-center px-4 py-1 rounded-full text-xs font-medium bg-gray-900 text-white">
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-light text-gray-900 mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-600 font-light">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-light text-gray-900">
                        {plan.price}
                      </span>
                      {plan.priceDetail && (
                        <span className="text-gray-600 font-light">
                          {plan.priceDetail}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="mb-8">
                    {getButtonForPlan(plan.id)}
                  </div>

                  {/* Features */}
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                      Características
                    </p>

                    {plan.includesAll && (
                      <div className="pb-2 border-b border-gray-200">
                        <p className="text-xs text-gray-600 italic">
                          Todo lo de <span className="font-semibold">{plan.includesAll}</span>, más:
                        </p>
                      </div>
                    )}

                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className={`text-sm font-light ${feature.included ? 'text-gray-600' : 'text-gray-400'}`}>
                            {feature.text}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* FAQ or Additional Info */}
          <div className="mt-16 text-center">
            <p className="text-gray-600 font-light mb-4">
              ¿Tienes preguntas sobre los planes?
            </p>
            <a
              href="https://wa.me/51958371017?text=Hola,%20tengo%20preguntas%20sobre%20los%20planes%20de%20Shopifree"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-normal transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contáctanos por WhatsApp
            </a>
          </div>
        </div>
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </DashboardLayout>
  )
}
