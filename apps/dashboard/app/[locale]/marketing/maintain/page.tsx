'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import DashboardLayout from '../../../../components/DashboardLayout'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore } from '../../../../lib/store'
import { getLoyaltyProgram, LoyaltyProgram } from '../../../../lib/loyalty'

export default function MaintainCustomersPage() {
  const t = useTranslations('marketing')
  const { user } = useAuth()
  const [loyaltyProgram, setLoyaltyProgram] = useState<LoyaltyProgram | null>(null)
  const [loadingLoyalty, setLoadingLoyalty] = useState(true)

  // Cargar estado del programa de lealtad
  useEffect(() => {
    const loadLoyaltyStatus = async () => {
      if (!user) {
        setLoadingLoyalty(false)
        return
      }

      try {
        const store = await getUserStore(user.uid)
        if (store) {
          const program = await getLoyaltyProgram(store.id)
          setLoyaltyProgram(program)
        }
      } catch (error) {
        console.error('Error loading loyalty program:', error)
      } finally {
        setLoadingLoyalty(false)
      }
    }

    loadLoyaltyStatus()
  }, [user])

  // Skeleton loader component
  if (loadingLoyalty) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          <div className="max-w-7xl mx-auto">
            {/* Header */}
            <div className="px-4 sm:px-6 lg:px-8 py-6">
              <div className="flex items-center mb-2">
                <Link href="/marketing" className="text-sm text-gray-500 hover:text-gray-700 mr-2">
                  Marketing
                </Link>
                <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <span className="text-sm text-gray-700 ml-2">{t('sections.maintain.title')}</span>
              </div>
              <h1 className="text-2xl font-light text-gray-900">{t('sections.maintain.title')}</h1>
              <p className="mt-1 text-sm text-gray-600">{t('sections.maintain.description')}</p>
            </div>

            <div className="px-4 sm:px-6 lg:px-8">
              <div className="space-y-6">
                {/* Skeleton Cards */}
                {[1, 2].map((i) => (
                  <div key={i} className="bg-white rounded-lg shadow-sm border border-gray-200">
                    <div className="p-4 sm:p-6">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                        <div className="flex items-start gap-3 sm:gap-4 flex-1">
                          <div className="bg-gray-100 p-2.5 sm:p-3 rounded-lg flex-shrink-0 animate-pulse">
                            <div className="h-5 w-5 sm:h-6 sm:w-6 bg-gray-200 rounded"></div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
                            <div className="flex items-start gap-2 flex-col sm:flex-row sm:items-center">
                              <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                              <div className="h-4 bg-gray-200 rounded w-full sm:w-96 animate-pulse"></div>
                            </div>
                          </div>
                        </div>
                        <div className="h-10 bg-gray-200 rounded-lg w-full sm:w-40 animate-pulse"></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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
            <div className="flex items-center mb-2">
              <Link href="/marketing" className="text-sm text-gray-500 hover:text-gray-700 mr-2">
                Marketing
              </Link>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm text-gray-700 ml-2">{t('sections.maintain.title')}</span>
            </div>
            <h1 className="text-2xl font-light text-gray-900">{t('sections.maintain.title')}</h1>
            <p className="mt-1 text-sm text-gray-600">{t('sections.maintain.description')}</p>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Carritos Abandonados */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="bg-gray-100 p-2.5 sm:p-3 rounded-lg flex-shrink-0">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Recuperación de Carritos Abandonados</h3>
                        <div className="flex items-start gap-2 flex-col sm:flex-row sm:items-center">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ✓ Activo
                          </span>
                          <p className="text-sm text-gray-500">Envía recordatorios automáticos con cupones de descuento para recuperar ventas perdidas</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/marketing/maintain/abandoned-carts"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors w-full sm:w-auto sm:flex-shrink-0"
                    >
                      Gestionar carritos
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Programa de Lealtad */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
                <div className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className="bg-gray-100 p-2.5 sm:p-3 rounded-lg flex-shrink-0">
                        <svg className="h-5 w-5 sm:h-6 sm:w-6 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-2">Programa de Lealtad</h3>
                        <div className="flex items-start gap-2 flex-col sm:flex-row sm:items-center">
                          {loyaltyProgram && loyaltyProgram.active ? (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✓ Activo
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Desactivado
                            </span>
                          )}
                          <p className="text-sm text-gray-500">Recompensa a tus clientes con puntos que pueden canjear por descuentos</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href="/marketing/maintain/loyalty"
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 transition-colors w-full sm:w-auto sm:flex-shrink-0"
                    >
                      Configurar programa
                      <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
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