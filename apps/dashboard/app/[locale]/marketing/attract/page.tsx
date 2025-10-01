'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore } from '../../../../lib/store'
import { getCoupons } from '../../../../lib/coupons'
import { getPromotions } from '../../../../lib/promotions'

export default function AttractCustomersPage() {
  const t = useTranslations('marketing')
  const router = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [coupons, setCoupons] = useState<any[]>([])
  const [promotions, setPromotions] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.uid) return

    try {
      const store = await getUserStore(user.uid)
      if (store) {
        // Cargar cupones y promociones en paralelo
        const [storeCoupons, storePromotions] = await Promise.all([
          getCoupons(store.id),
          getPromotions(store.id)
        ])

        setCoupons(storeCoupons)
        setPromotions(storePromotions)
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
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="bg-gray-100 p-2.5 sm:p-3 rounded-lg flex-shrink-0">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('coupons.title')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('coupons.description')}</p>
                        <div className="mt-2 h-5">
                          {loading ? (
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                          ) : coupons.length > 0 ? (
                            <p className="text-sm text-gray-600">
                              {coupons.length} cupón{coupons.length !== 1 ? 'es' : ''} creado{coupons.length !== 1 ? 's' : ''}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/marketing/attract/coupons')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors w-full sm:w-auto sm:flex-shrink-0"
                    >
                      Gestionar cupones
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Promociones y precios rebajados */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="bg-gray-100 p-2.5 sm:p-3 rounded-lg flex-shrink-0">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 14l6-6m-5.5.5h.01m4.99 5h.01M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16l3.5-2 3.5 2 3.5-2 3.5 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900">{t('promotions.title')}</h3>
                        <p className="mt-1 text-sm text-gray-500">{t('promotions.description')}</p>
                        <div className="mt-2 h-5">
                          {loading ? (
                            <div className="h-4 w-32 bg-gray-200 rounded animate-pulse"></div>
                          ) : promotions.length > 0 ? (
                            <p className="text-sm text-gray-600">
                              {promotions.length} promoción{promotions.length !== 1 ? 'es' : ''} creada{promotions.length !== 1 ? 's' : ''}
                            </p>
                          ) : null}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => router.push('/marketing/attract/promotions')}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors w-full sm:w-auto sm:flex-shrink-0"
                    >
                      Gestionar promociones
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}