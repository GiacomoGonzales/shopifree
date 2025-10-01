'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import DashboardLayout from '../../../../../components/DashboardLayout'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getStoreByOwner } from '../../../../../lib/store'
import {
  getAbandonedCarts,
  getAbandonedCartStats,
  markCartEmailSent,
  generateRecoveryCoupon,
  calculateDiscountValue,
  createRecoveryCoupon,
  type CustomerWithAbandonedCart
} from '../../../../../lib/abandoned-carts'
import type { AbandonedCartEmailData } from '../../../../../../../public-store-v2/lib/email'

export default function AbandonedCartsPage() {
  const t = useTranslations('marketing')
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [abandonedCarts, setAbandonedCarts] = useState<CustomerWithAbandonedCart[]>([])
  const [stats, setStats] = useState<any>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeUrl, setStoreUrl] = useState<string>('')
  const [storeName, setStoreName] = useState<string>('')
  const [sendingEmails, setSendingEmails] = useState<{ [key: string]: boolean }>({})
  const [timeFilter, setTimeFilter] = useState<number>(24) // 24 horas por defecto
  const [discounts, setDiscounts] = useState<{ [key: string]: number }>({}) // Descuento por cada carrito

  useEffect(() => {
    loadData()
  }, [user, timeFilter])

  const loadData = async () => {
    if (!user) return

    try {
      setLoading(true)

      // Obtener tienda del usuario
      const store = await getStoreByOwner(user.uid)
      if (!store) {
        console.error('No se encontró tienda para el usuario')
        setLoading(false)
        return
      }

      setStoreId(store.id)
      setStoreName(store.storeName || 'Tu tienda')

      // Construir URL de la tienda
      if (store.customDomain) {
        setStoreUrl(`https://${store.customDomain}`)
      } else if (store.subdomain) {
        setStoreUrl(`https://${store.subdomain}.shopifree.app`)
      }

      // Cargar carritos abandonados
      const carts = await getAbandonedCarts(store.id, timeFilter)
      setAbandonedCarts(carts)

      // Cargar estadísticas
      const statistics = await getAbandonedCartStats(store.id)
      setStats(statistics)

    } catch (error) {
      console.error('Error al cargar datos:', error)
    } finally {
      setLoading(false)
    }
  }

  const sendRecoveryEmail = async (customer: CustomerWithAbandonedCart) => {
    if (!storeId || !storeUrl) {
      alert('Error: Información de tienda no disponible')
      return
    }

    try {
      setSendingEmails(prev => ({ ...prev, [customer.id]: true }))

      // Obtener descuento seleccionado o usar 10% por defecto
      const discountPercentage = discounts[customer.id] || 10

      // Generar cupón de recuperación
      const couponCode = generateRecoveryCoupon(customer.email, discountPercentage)
      const discountValue = calculateDiscountValue(customer.abandonedCart.subtotal, discountPercentage)

      // Preparar datos del email
      const emailData: AbandonedCartEmailData = {
        customerName: customer.displayName || customer.fullName || 'Cliente',
        customerEmail: customer.email,
        storeName: storeName,
        storeUrl: storeUrl,
        cartItems: customer.abandonedCart.items.map(item => ({
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity,
          currency: item.currency,
          slug: item.slug
        })),
        subtotal: customer.abandonedCart.subtotal,
        currency: customer.abandonedCart.currency,
        couponCode: couponCode,
        couponDiscount: discountValue
      }

      // Enviar email mediante API
      const response = await fetch('/api/abandoned-carts/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ emailData })
      })

      const result = await response.json()

      if (result.success) {
        // Crear cupón en Firestore
        const couponCreated = await createRecoveryCoupon(
          storeId,
          couponCode,
          customer.email,
          discountPercentage
        )

        if (!couponCreated) {
          console.warn('[AbandonedCarts] ⚠️ Cupón no se pudo crear en Firestore, pero el email fue enviado')
        }

        // Marcar como enviado en Firestore
        await markCartEmailSent(storeId, customer.id)

        alert(`✅ Email enviado exitosamente a ${customer.email}\n\nCupón generado: ${couponCode}`)

        // Recargar datos
        await loadData()
      } else {
        alert(`❌ Error al enviar email: ${result.error}`)
      }

    } catch (error) {
      console.error('Error al enviar email:', error)
      alert('❌ Error al enviar email. Ver consola para detalles.')
    } finally {
      setSendingEmails(prev => ({ ...prev, [customer.id]: false }))
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    const symbol = currency === 'USD' ? '$' : currency === 'PEN' ? 'S/' : currency
    return `${symbol}${amount.toFixed(2)}`
  }

  const formatTimeAgo = (timestamp: any) => {
    const now = Date.now()
    const then = timestamp.toMillis()
    const diffMs = now - then
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffHours / 24)

    if (diffDays > 0) {
      return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`
    } else if (diffHours > 0) {
      return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`
    } else {
      const diffMins = Math.floor(diffMs / (1000 * 60))
      return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-gray-300 border-t-gray-900 rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando carritos abandonados...</p>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <div className="flex items-center mb-2">
                  <Link href="/marketing/maintain" className="text-sm text-gray-500 hover:text-gray-700 mr-2">
                    Mantener Clientes
                  </Link>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm text-gray-700 ml-2">Carritos Abandonados</span>
                </div>
                <h1 className="text-2xl font-light text-gray-900">Recuperación de Carritos Abandonados</h1>
                <p className="mt-1 text-sm text-gray-600">Recupera ventas enviando recordatorios a clientes con carritos pendientes</p>
              </div>

              {/* Time Filter */}
              <div className="flex items-center space-x-2">
                <select
                  value={timeFilter}
                  onChange={(e) => setTimeFilter(Number(e.target.value))}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-900"
                >
                  <option value={1}>Última hora</option>
                  <option value={24}>Últimas 24 horas</option>
                  <option value={72}>Últimos 3 días</option>
                  <option value={168}>Última semana</option>
                </select>
              </div>
            </div>

            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Total Carritos</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.totalCarts}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Emails Enviados</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.emailsSent}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Pendientes</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">{stats.pendingEmails}</p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-600">Valor Total</p>
                      <p className="text-2xl font-semibold text-gray-900 mt-1">
                        {formatCurrency(stats.totalValue, 'PEN')}
                      </p>
                    </div>
                    <div className="bg-gray-100 p-3 rounded-lg">
                      <svg className="h-6 w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Abandoned Carts List */}
          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            {abandonedCarts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No hay carritos abandonados</h3>
                <p className="text-gray-600">No se encontraron carritos abandonados en el período seleccionado.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {abandonedCarts.map((customer) => (
                  <div key={customer.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
                    {/* Header - Responsive */}
                    <div className="flex flex-col space-y-3 mb-4">
                      {/* Nombre y badge */}
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-medium text-gray-900">{customer.displayName}</h3>
                        {customer.abandonedCart.emailSent && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                            <svg className="h-3 w-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            Email enviado ({customer.abandonedCart.reminderCount || 1}x)
                          </span>
                        )}
                      </div>

                      {/* Info del cliente - Stack en móvil */}
                      <div className="flex flex-col sm:flex-row sm:flex-wrap gap-2 sm:gap-4 text-sm text-gray-600">
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                          <span className="truncate">{customer.email}</span>
                        </span>
                        {customer.phone && (
                          <span className="flex items-center">
                            <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            {customer.phone}
                          </span>
                        )}
                        <span className="flex items-center">
                          <svg className="h-4 w-4 mr-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          {formatTimeAgo(customer.abandonedCart.abandonedAt)}
                        </span>
                      </div>

                      {/* Total y controles - Stack en móvil, lado a lado en desktop */}
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between sm:justify-start sm:gap-6">
                          <div>
                            <p className="text-xs text-gray-600">Total del carrito</p>
                            <p className="text-lg font-semibold text-gray-900">
                              {formatCurrency(customer.abandonedCart.subtotal, customer.abandonedCart.currency)}
                            </p>
                          </div>

                          {/* Selector de descuento */}
                          <div>
                            <label htmlFor={`discount-${customer.id}`} className="block text-xs text-gray-600 mb-1">
                              Descuento
                            </label>
                            <select
                              id={`discount-${customer.id}`}
                              value={discounts[customer.id] || 10}
                              onChange={(e) => setDiscounts(prev => ({ ...prev, [customer.id]: Number(e.target.value) }))}
                              className="block w-full sm:w-24 rounded-md border-gray-300 shadow-sm focus:border-gray-900 focus:ring-gray-900 text-sm"
                            >
                              <option value={5}>5%</option>
                              <option value={10}>10%</option>
                              <option value={15}>15%</option>
                              <option value={20}>20%</option>
                              <option value={25}>25%</option>
                              <option value={30}>30%</option>
                            </select>
                          </div>
                        </div>

                        {/* Botón enviar */}
                        <button
                          onClick={() => sendRecoveryEmail(customer)}
                          disabled={sendingEmails[customer.id]}
                          className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed w-full sm:w-auto"
                        >
                          {sendingEmails[customer.id] ? (
                            <>
                              <svg className="animate-spin h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Enviando...
                            </>
                          ) : (
                            <>
                              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                              </svg>
                              Enviar Email
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Cart Items */}
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">Productos en el carrito:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                        {customer.abandonedCart.items.map((item, idx) => (
                          <div key={idx} className="flex items-center space-x-3 bg-gray-50 rounded-lg p-3">
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-16 h-16 object-cover rounded-md border border-gray-200"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                              <p className="text-xs text-gray-600">
                                Cantidad: {item.quantity} × {formatCurrency(item.price, item.currency)}
                              </p>
                              <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(item.price * item.quantity, item.currency)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
