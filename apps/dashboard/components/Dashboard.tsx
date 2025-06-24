'use client'

import { useAuth } from '../lib/simple-auth-context'
import { getLandingUrl } from '../lib/config'
import { useTranslations } from 'next-intl'

interface DashboardProps {
  store: any
}

export default function Dashboard({ store }: DashboardProps) {
  const { user, userData, signOut } = useAuth()
  const t = useTranslations('dashboard')

  const handleSignOut = async () => {
    await signOut()
    window.location.href = getLandingUrl('/es')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {store?.storeName || t('title')}
              </h1>
              <span className="ml-3 px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                {t('active')}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-600">
                {t('hello')}, <span className="font-medium">{user?.email || userData?.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-md text-sm font-medium text-gray-700"
              >
                {t('signOut')}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Store Info Card */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            {t('welcome')} 🎉
          </h2>
          <div className="space-y-1 text-sm text-gray-600">
            <p><span className="font-medium">{t('store')}:</span> {store?.storeName}</p>
            <p><span className="font-medium">{t('url')}:</span> {store?.slug}.shopifree.app</p>
            <p><span className="font-medium">{t('slogan')}:</span> {store?.slogan}</p>
            <p><span className="font-medium">{t('currency')}:</span> {store?.currency}</p>
          </div>
        </div>

        {/* User Info Card (Optional - shows Firestore data) */}
        {userData && (
          <div className="bg-white rounded-lg shadow p-6 mb-8">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t('userInfo')}</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <p><span className="font-medium">{t('email')}:</span> {userData.email}</p>
              <p><span className="font-medium">{t('uid')}:</span> {userData.uid}</p>
              {userData.displayName && (
                <p><span className="font-medium">{t('name')}:</span> {userData.displayName}</p>
              )}
            </div>
          </div>
        )}

        {/* Getting Started */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">{t('storeReady')} 🚀</h3>
          <p className="text-gray-600">
            {t('storeReadyDescription')}
          </p>
        </div>
      </main>
    </div>
  )
} 