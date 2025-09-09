'use client'

import { useTranslations } from 'next-intl'
import Link from 'next/link'
import DashboardLayout from '../../../../components/DashboardLayout'

export default function RecoverCustomersPage() {
  const t = useTranslations('marketing')

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
                  <span className="text-sm text-gray-700 ml-2">{t('sections.recover.title')}</span>
                </div>
                <h1 className="text-2xl font-light text-gray-900">{t('sections.recover.title')}</h1>
                <p className="mt-1 text-sm text-gray-600">{t('sections.recover.description')}</p>
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800">
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('createCampaign')}
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
            <div className="space-y-6">
              {/* Carritos abandonados */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-orange-100 p-2 rounded-lg mr-3">
                        <svg className="h-5 w-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 21m0 0h8m-8 0V9" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{t('abandoned.title')}</h3>
                        <p className="text-sm text-gray-500">{t('abandoned.description')}</p>
                      </div>
                    </div>
                    <button className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50">
                      {t('abandoned.configure')}
                    </button>
                  </div>
                </div>
                <div className="p-6">
                  <div className="text-center py-8">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m1.6 8L6 21m0 0h8m-8 0V9" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">{t('abandoned.empty')}</h3>
                    <p className="mt-1 text-sm text-gray-500">{t('abandoned.emptyDescription')}</p>
                  </div>
                </div>
              </div>

              {/* Segmentación de clientes */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-pink-100 p-2 rounded-lg mr-3">
                        <svg className="h-5 w-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                        </svg>
                      </div>
                      <div>
                        <h3 className="text-base font-medium text-gray-900">{t('segmentation.title')}</h3>
                        <p className="text-sm text-gray-500">{t('segmentation.description')}</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                      {t('proPlan')}
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