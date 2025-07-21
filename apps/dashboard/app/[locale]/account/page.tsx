'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../../lib/simple-auth-context'
import DashboardLayout from '../../../components/DashboardLayout'

export default function AccountPage() {
  const { user, userData } = useAuth()
  const t = useTranslations('settings.account')
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    
    try {
      // TODO: Implementar actualización de datos
      setSaveMessage('Cambios guardados')
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      setSaveMessage('Error al guardar')
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-semibold text-gray-900">{t('title')}</h1>
          <p className="mt-1 text-sm text-gray-500">{t('subtitle')}</p>

          <div className="mt-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Información personal */}
              <div className="lg:col-span-2">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {t('personalInfo.title')}
                    </h3>
                    
                    <form className="space-y-4" onSubmit={handleSubmit}>
                      <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                          {t('personalInfo.email.label')}
                        </label>
                        <input
                          type="email"
                          name="email"
                          id="email"
                          value={user?.email || ''}
                          disabled
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 sm:text-sm"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          {t('personalInfo.email.hint')}
                        </p>
                      </div>
                      
                      <div>
                        <label htmlFor="displayName" className="block text-sm font-medium text-gray-700">
                          {t('personalInfo.displayName.label')}
                        </label>
                        <input
                          type="text"
                          name="displayName"
                          id="displayName"
                          value={(userData?.displayName as string) || ''}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                          placeholder={t('personalInfo.displayName.placeholder')}
                        />
                      </div>
                      
                      <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                          {t('personalInfo.phone.label')}
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          id="phone"
                          value={(userData?.phone as string) || ''}
                          className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-gray-600 focus:border-gray-600 sm:text-sm"
                          placeholder={t('personalInfo.phone.placeholder')}
                        />
                      </div>
                      
                      <div className="flex justify-end space-x-3">
                        {saveMessage && (
                          <div className={`px-3 py-2 rounded text-sm ${
                            saveMessage === 'Cambios guardados' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {saveMessage}
                          </div>
                        )}
                        <button
                          type="submit"
                          disabled={saving}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50"
                        >
                          {t('actions.saveChanges')}
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>

              {/* Información de la cuenta */}
              <div className="lg:col-span-1">
                <div className="bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {t('accountInfo.title')}
                    </h3>
                    
                    <dl className="space-y-3">
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('accountInfo.status.label')}</dt>
                        <dd className="text-sm text-gray-900">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            {t('accountInfo.status.active')}
                          </span>
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('accountInfo.registrationDate.label')}</dt>
                        <dd className="text-sm text-gray-900">
                          {user?.metadata?.creationTime ? 
                            new Date(user.metadata.creationTime).toLocaleDateString() : 
                            t('accountInfo.registrationDate.notAvailable')
                          }
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('accountInfo.lastLogin.label')}</dt>
                        <dd className="text-sm text-gray-900">
                          {user?.metadata?.lastSignInTime ? 
                            new Date(user.metadata.lastSignInTime).toLocaleDateString() : 
                            t('accountInfo.lastLogin.notAvailable')
                          }
                        </dd>
                      </div>
                      
                      <div>
                        <dt className="text-sm font-medium text-gray-500">{t('accountInfo.userId.label')}</dt>
                        <dd className="text-sm text-gray-900 font-mono text-xs">
                          {user?.uid}
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>

                {/* Acciones de cuenta */}
                <div className="mt-6 bg-white shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                      {t('actions.title')}
                    </h3>
                    
                    <div className="space-y-3">
                      <button
                        type="button"
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                      >
                        {t('actions.changePassword')}
                      </button>
                      
                      <button
                        type="button"
                        className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        {t('actions.deleteAccount')}
                      </button>
                    </div>
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