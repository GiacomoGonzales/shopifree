'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore } from '../../../../lib/store'
import { getCoupons, getCouponUsageCount } from '../../../../lib/coupons'
import { getPromotions } from '../../../../lib/promotions'

// Mapeo de códigos de moneda a símbolos
const currencySymbols: Record<string, string> = {
  'USD': '$', 'EUR': '€', 'MXN': '$', 'COP': '$', 'ARS': '$', 'CLP': '$',
  'PEN': 'S/', 'BRL': 'R$', 'UYU': '$', 'PYG': '₲', 'BOB': 'Bs', 'VES': 'Bs',
  'GTQ': 'Q', 'CRC': '₡', 'NIO': 'C$', 'PAB': 'B/.', 'DOP': 'RD$', 'HNL': 'L',
  'SVC': '$', 'GBP': '£', 'CAD': 'C$', 'CHF': 'CHF', 'JPY': '¥', 'CNY': '¥', 'AUD': 'A$'
}

export default function AttractCustomersPage() {
  const t = useTranslations('marketing')
  const router = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])
  const [storeId, setStoreId] = useState<string | null>(null)
  const [storeCurrency, setStoreCurrency] = useState('USD')
  const [couponUsageCounts, setCouponUsageCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.uid) return

    try {
      const store = await getUserStore(user.uid)
      if (store) {
        setStoreId(store.id)
        setStoreCurrency(store.currency || 'USD')

        // Cargar cupones y promociones en paralelo
        const [storeCoupons, storePromotions] = await Promise.all([
          getCoupons(store.id),
          getPromotions(store.id)
        ])

        setCoupons(storeCoupons)
        setPromotions(storePromotions)

        // 🆕 Cargar conteos dinámicos de uso de cupones
        if (storeCoupons.length > 0) {
          const counts: Record<string, number> = {}
          for (const coupon of storeCoupons) {
            const count = await getCouponUsageCount(store.id, coupon.id)
            counts[coupon.id] = count
          }
          setCouponUsageCounts(counts)
        }
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Link href="/marketing" className="text-sm text-gray-500 hover:text-gray-700 mr-2">
                    Marketing
                  </Link>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm text-gray-700 ml-2">{t('sections.attract.title')}</span>
                </div>
                <h1 className="text-2xl font-light text-gray-900">{t('sections.attract.title')}</h1>
                <p className="mt-1 text-sm text-gray-600">{t('sections.attract.description')}</p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="space-y-6">
              {/* Cupones de descuento */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-blue-100 p-2 rounded-lg mr-3">
                        <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{t('coupons.title')}</h3>
                        <p className="text-sm text-gray-500">{t('coupons.description')}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => router.push('/marketing/attract/coupons')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {t('coupons.create')}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Cargando cupones...</p>
                    </div>
                  ) : coupons.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">{t('coupons.empty')}</h3>
                      <p className="mt-1 text-sm text-gray-500">{t('coupons.emptyDescription')}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                          {coupons.length} cupón{coupons.length !== 1 ? 'es' : ''} activo{coupons.length !== 1 ? 's' : ''}
                        </p>
                        <Link
                          href="/marketing/attract/coupons"
                          className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                        >
                          Ver todos →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {coupons.slice(0, 3).map((coupon) => (
                          <div key={coupon.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-3">
                                  {coupon.code}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{coupon.name}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {coupon.type === 'percentage' ? `${coupon.value}%` :
                                 coupon.type === 'fixed_amount' ? `${currencySymbols[storeCurrency] || '$'}${coupon.value}` :
                                 'Envío gratis'}
                              </div>
                              <div className="text-xs text-gray-500">
                                {couponUsageCounts[coupon.id] !== undefined ? couponUsageCounts[coupon.id] : (coupon.totalUses || 0)} usos
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Promociones y precios rebajados */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 p-2 rounded-lg mr-3">
                        <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{t('promotions.title')}</h3>
                        <p className="text-sm text-gray-500">{t('promotions.description')}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/marketing/attract/promotions')}
                      className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50"
                    >
                      {t('promotions.create')}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                      <p className="mt-2 text-sm text-gray-500">Cargando promociones...</p>
                    </div>
                  ) : promotions.length === 0 ? (
                    <div className="text-center py-8">
                      <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                      </svg>
                      <h3 className="mt-2 text-sm font-medium text-gray-900">{t('promotions.empty')}</h3>
                      <p className="mt-1 text-sm text-gray-500">{t('promotions.emptyDescription')}</p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <p className="text-sm text-gray-600">
                          {promotions.length} promoción{promotions.length !== 1 ? 'es' : ''} activa{promotions.length !== 1 ? 's' : ''}
                        </p>
                        <Link
                          href="/marketing/attract/promotions"
                          className="text-sm text-green-600 hover:text-green-800 font-medium"
                        >
                          Ver todos →
                        </Link>
                      </div>
                      <div className="space-y-3">
                        {promotions.slice(0, 3).map((promotion) => (
                          <div key={promotion.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <div className="flex items-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium mr-3 ${
                                  promotion.status === 'active' ? 'bg-green-100 text-green-800' :
                                  promotion.status === 'paused' ? 'bg-yellow-100 text-yellow-800' :
                                  promotion.status === 'scheduled' ? 'bg-blue-100 text-blue-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {promotion.status === 'active' ? 'Activa' :
                                   promotion.status === 'paused' ? 'Pausada' :
                                   promotion.status === 'scheduled' ? 'Programada' :
                                   'Expirada'}
                                </span>
                                <span className="text-sm font-medium text-gray-900">{promotion.name}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm font-medium text-gray-900">
                                {promotion.type === 'percentage' ? `${promotion.discountValue}%` :
                                 promotion.type === 'price_discount' ? `${currencySymbols[storeCurrency] || '$'}${promotion.discountValue}` :
                                 `${promotion.discountValue} gratis`}
                              </div>
                              <div className="text-xs text-gray-500">
                                {promotion.targetType === 'all_products' ? 'Todos los productos' :
                                 `${promotion.targetIds.length} producto${promotion.targetIds.length !== 1 ? 's' : ''}`}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}