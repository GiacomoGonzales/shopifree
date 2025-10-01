'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import DashboardLayout from '../../../../components/DashboardLayout'

export default function MaintainCustomersPage() {
  const t = useTranslations('marketing')

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

              {/* Email Marketing */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-start sm:items-center space-x-3">
                      <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                        <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900">{t('email.title')}</h3>
                        <p className="text-sm text-gray-500 mt-1">{t('email.description')}</p>
                      </div>
                    </div>
                    <button className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 w-full sm:w-auto">
                      {t('email.create')}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('email.empty')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('email.emptyDescription')}</p>
                  </div>
                </div>
              </div>

              {/* Automatizaciones */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200">
                  {/* Mobile Layout */}
                  <div className="sm:hidden space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="bg-gray-100 p-2 rounded-lg flex-shrink-0">
                        <svg className="h-4 w-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-medium text-gray-900">{t('automation.title')}</h3>
                        <p className="text-sm text-gray-500 mt-1">{t('automation.description')}</p>
                      </div>
                    </div>
                    <div className="pl-11">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                        {t('comingSoon')}
                      </span>
                    </div>
                  </div>

                  {/* Desktop Layout */}
                  <div className="hidden sm:flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-lg mr-3">
                        <svg className="h-5 w-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{t('automation.title')}</h3>
                        <p className="text-sm text-gray-500">{t('automation.description')}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                      {t('comingSoon')}
                    </span>
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