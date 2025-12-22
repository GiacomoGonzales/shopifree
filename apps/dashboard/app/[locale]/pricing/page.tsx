'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import DashboardLayout from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/simple-auth-context'
import { getSubscriptionStatus } from '../../../lib/subscription-utils'

export default function PricingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()

  const [subscriptionData, setSubscriptionData] = useState<{
    status: 'active' | 'cancelled' | 'expired' | 'free'
    plan: 'free' | 'starter' | 'premium' | 'pro'
    isExpired: boolean
  } | null>(null)
  const [loadingSubscription, setLoadingSubscription] = useState(true)
  const [loadingCheckout, setLoadingCheckout] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Check if cancelled
  const cancelled = searchParams.get('cancelled')

  // Load subscription info
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

  // Handle Stripe checkout
  const handleCheckout = async (plan: 'starter' | 'premium') => {
    if (!user?.uid) return

    setLoadingCheckout(plan)
    setError(null)

    try {
      const response = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          userId: user.uid,
          userEmail: user.email,
        }),
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error)
        return
      }

      if (data.url) {
        window.location.href = data.url
      }
    } catch (err) {
      console.error('Checkout error:', err)
      setError('Error al procesar el pago. Intenta de nuevo.')
    } finally {
      setLoadingCheckout(null)
    }
  }

  const plans = [
    {
      id: 'free',
      name: 'Catalogo',
      price: 'Gratis',
      priceDetail: 'para siempre',
      description: 'Perfecto para empezar',
      features: [
        { text: 'Hasta 20 productos', included: true },
        { text: '1 foto por producto', included: true },
        { text: 'Pedidos por WhatsApp', included: true },
        { text: 'Link compartible', included: true },
        { text: 'Categorias', included: false },
        { text: 'Sin branding Shopifree', included: false },
        { text: 'Dominio personalizado', included: false },
        { text: 'Pagos integrados', included: false }
      ],
      highlighted: false
    },
    {
      id: 'starter',
      name: 'Emprendedor',
      price: '$1',
      priceDetail: '/mes',
      description: 'Para negocios en crecimiento',
      features: [
        { text: 'Hasta 50 productos', included: true },
        { text: '5 fotos por producto', included: true },
        { text: 'Pedidos por WhatsApp', included: true },
        { text: 'Categorias', included: true },
        { text: 'Sin branding Shopifree', included: true },
        { text: 'Link compartible', included: true },
        { text: 'Dominio personalizado', included: false },
        { text: 'Pagos integrados', included: false }
      ],
      highlighted: false
    },
    {
      id: 'premium',
      name: 'Tienda',
      price: '$5',
      priceDetail: '/mes',
      description: 'Para tiendas profesionales',
      features: [
        { text: 'Productos ilimitados', included: true },
        { text: '10 fotos por producto', included: true },
        { text: 'Pedidos por WhatsApp', included: true },
        { text: 'Checkout completo', included: true },
        { text: 'Pagos integrados (MercadoPago, Stripe)', included: true },
        { text: 'Categorias y variantes', included: true },
        { text: 'Dominio personalizado', included: true },
        { text: 'Cupones y promociones', included: true },
        { text: 'Sin branding Shopifree', included: true },
        { text: 'Google Analytics & Meta Pixel', included: true }
      ],
      highlighted: true
    }
  ]

  const getButtonForPlan = (planId: string) => {
    if (loadingSubscription) {
      return (
        <button
          disabled
          className="w-full px-6 py-3 rounded-xl text-sm font-medium bg-gray-200 text-gray-400 cursor-not-allowed"
        >
          Cargando...
        </button>
      )
    }

    // Plan CATALOGO (FREE)
    if (planId === 'free') {
      if (subscriptionData?.plan === 'free') {
        return (
          <button
            disabled
            className="w-full px-6 py-3 rounded-xl text-sm font-medium bg-gray-100 text-gray-600 cursor-default border border-gray-200"
          >
            Plan actual
          </button>
        )
      }
      return null
    }

    // Plan EMPRENDEDOR ($1)
    if (planId === 'starter') {
      if (subscriptionData?.plan === 'starter' && subscriptionData?.status === 'active') {
        return (
          <button
            disabled
            className="w-full px-6 py-3 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200"
          >
            Plan actual
          </button>
        )
      }

      return (
        <button
          onClick={() => handleCheckout('starter')}
          disabled={loadingCheckout === 'starter'}
          className="w-full px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gray-900 hover:bg-gray-800 transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingCheckout === 'starter' ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Suscribirme
            </>
          )}
        </button>
      )
    }

    // Plan TIENDA (PREMIUM - $5)
    if (planId === 'premium') {
      if (subscriptionData?.plan === 'premium' && subscriptionData?.status === 'active') {
        return (
          <button
            disabled
            className="w-full px-6 py-3 rounded-xl text-sm font-medium bg-emerald-100 text-emerald-700 cursor-default border border-emerald-200"
          >
            Plan actual
          </button>
        )
      }

      return (
        <button
          onClick={() => handleCheckout('premium')}
          disabled={loadingCheckout === 'premium'}
          className="w-full px-6 py-4 rounded-xl text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition-all duration-200 inline-flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loadingCheckout === 'premium' ? (
            <>
              <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Procesando...
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
              Suscribirme
            </>
          )}
        </button>
      )
    }

    return null
  }

  return (
    <DashboardLayout>
      <div className="py-8 bg-gray-50 min-h-screen">
        <div className="px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl font-light text-gray-900 mb-3">
              Mejora tu plan
            </h1>
            <p className="text-lg text-gray-600 font-light max-w-xl mx-auto">
              Desbloquea todas las funciones para hacer crecer tu negocio.
            </p>
          </div>

          {/* Cancelled notice */}
          {cancelled && (
            <div className="mb-8 bg-yellow-50 border border-yellow-200 rounded-xl p-4 max-w-5xl mx-auto">
              <p className="text-yellow-800 text-sm text-center">
                El pago fue cancelado. Puedes intentarlo de nuevo cuando quieras.
              </p>
            </div>
          )}

          {/* Error notice */}
          {error && (
            <div className="mb-8 bg-red-50 border border-red-200 rounded-xl p-4 max-w-5xl mx-auto">
              <p className="text-red-800 text-sm text-center">{error}</p>
            </div>
          )}

          {/* Current Plan Banner */}
          {!loadingSubscription && subscriptionData && (
            <div className="mb-8 bg-white rounded-xl border border-gray-200 p-4 max-w-5xl mx-auto">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-500">Plan actual:</span>
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700 border border-gray-200">
                    {subscriptionData.plan === 'free' && 'Catalogo (Gratis)'}
                    {subscriptionData.plan === 'starter' && 'Emprendedor ($1/mes)'}
                    {(subscriptionData.plan === 'premium' || subscriptionData.plan === 'pro') && 'Tienda ($5/mes)'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative bg-white rounded-2xl border-2 transition-all duration-200 overflow-hidden ${
                  plan.highlighted
                    ? 'border-emerald-500 shadow-xl shadow-emerald-100'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Popular badge */}
                {plan.highlighted && (
                  <div className="bg-emerald-500 text-white text-xs font-semibold py-1 px-4 text-center">
                    RECOMENDADO
                  </div>
                )}

                <div className="p-8">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-1">
                      {plan.name}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {plan.description}
                    </p>
                  </div>

                  {/* Price */}
                  <div className="mb-8">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-gray-900">
                        {plan.price}
                      </span>
                      {plan.priceDetail && (
                        <span className="text-gray-500">
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
                    <ul className="space-y-3">
                      {plan.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-3">
                          {feature.included ? (
                            <svg className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5 text-gray-300 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                          <span className={`text-sm ${feature.included ? 'text-gray-700' : 'text-gray-400'}`}>
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

          {/* FAQ */}
          <div className="mt-12 bg-white rounded-2xl border border-gray-200 p-8 max-w-5xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Preguntas frecuentes</h2>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Como me suscribo?</h3>
                <p className="text-gray-600 text-sm">
                  Haz clic en "Suscribirme" y seras redirigido a nuestra pasarela de pago segura. Aceptamos todas las tarjetas de credito y debito.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Puedo cancelar cuando quiera?</h3>
                <p className="text-gray-600 text-sm">
                  Si, puedes cancelar tu suscripcion en cualquier momento desde tu cuenta. No hay contratos ni compromisos.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Hay comisiones por venta?</h3>
                <p className="text-gray-600 text-sm">
                  No. Shopifree no cobra comisiones. Solo pagas la suscripcion mensual fija.
                </p>
              </div>
              <div>
                <h3 className="font-medium text-gray-900 mb-1">Es seguro el pago?</h3>
                <p className="text-gray-600 text-sm">
                  Si, usamos Stripe para procesar los pagos. Es la misma plataforma que usan empresas como Google, Amazon y Shopify.
                </p>
              </div>
            </div>
          </div>

          {/* Contact */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 text-sm mb-3">
              Tienes mas preguntas?
            </p>
            <a
              href="https://wa.me/51958371017?text=Hola,%20tengo%20preguntas%20sobre%20los%20planes%20de%20Shopifree"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-emerald-600 hover:text-emerald-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              Contactanos por WhatsApp
            </a>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
