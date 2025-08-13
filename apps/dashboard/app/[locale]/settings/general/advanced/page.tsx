'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import GeneralSettingsNav from '../../../../../components/settings/GeneralSettingsNav'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../../lib/store'

export default function GeneralSettingsAdvancedPage() {
  const t = useTranslations('settings')
  const tAdv = useTranslations('settings.advanced')
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const { user } = useAuth()

  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [language, setLanguage] = useState<'es' | 'en'>('es')
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      try {
        const s = await getUserStore(user.uid)
        setStore(s)
        const current = (s?.advanced?.language as 'es' | 'en' | undefined) || 'es'
        setLanguage(current)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [user?.uid])

  const handleSave = async () => {
    if (!store?.id) return
    setSaving(true)
    try {
      await updateStore(store.id, { advanced: { ...(store.advanced || {}), language } })
      setMessage(tAdv('actions.saved'))
      setTimeout(() => setMessage(null), 2500)
    } catch (e) {
      setMessage(tAdv('actions.error'))
      setTimeout(() => setMessage(null), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GeneralSettingsNav currentSection="advanced" />

          <div className="max-w-3xl space-y-6">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-6 space-y-4">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{tAdv('checkout.language.title')}</h3>
                  <p className="mt-1 text-sm text-gray-600">{tAdv('checkout.language.description')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="store-language"
                      value="es"
                      checked={language === 'es'}
                      onChange={() => setLanguage('es')}
                    />
                    <span>{tAdv('checkout.language.spanish')}</span>
                  </label>
                  <label className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer">
                    <input
                      type="radio"
                      name="store-language"
                      value="en"
                      checked={language === 'en'}
                      onChange={() => setLanguage('en')}
                    />
                    <span>{tAdv('checkout.language.english')}</span>
                  </label>
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleSave}
                    disabled={saving || loading}
                    className={`px-6 py-3 rounded-md text-sm font-medium text-white ${saving ? 'bg-gray-600' : 'bg-black hover:bg-gray-800'}`}
                  >
                    {saving ? t('actions.saving') : t('actions.save')}
                  </button>
                  {message && (
                    <span className="ml-3 text-sm text-gray-700">{message}</span>
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


