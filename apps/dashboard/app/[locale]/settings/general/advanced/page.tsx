'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import GeneralSettingsNav from '../../../../../components/settings/GeneralSettingsNav'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../../lib/store'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from '../../../../../lib/firebase'

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

  // Estado para dominio personalizado
  const [domainLoading, setDomainLoading] = useState(true)
  const [domainSaving, setDomainSaving] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [domainDoc, setDomainDoc] = useState<any | null>(null)

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      try {
        const s = await getUserStore(user.uid)
        setStore(s)
        const current = (s?.advanced?.language as 'es' | 'en' | undefined) || 'es'
        setLanguage(current)
        // Cargar domain settings desde subcolección: stores/{storeId}/settings/domain
        if (s?.id) {
          const db = getFirebaseDb()
          if (db) {
            const ref = doc(db, 'stores', s.id, 'settings', 'domain')
            const snap = await getDoc(ref)
            if (snap.exists()) {
              const data = snap.data() as any
              setDomainDoc(data)
              setCustomDomain((data?.customDomain as string) || '')
            }
          }
        }
      } finally {
        setLoading(false)
        setDomainLoading(false)
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

  const saveCustomDomain = async () => {
    if (!store?.id) return
    const domain = customDomain.trim().toLowerCase()
    if (!domain) return
    setDomainSaving(true)
    try {
      const db = getFirebaseDb()
      if (!db) return
      const ref = doc(db, 'stores', store.id, 'settings', 'domain')
      const nowTs = serverTimestamp()
      if (domainDoc) {
        await updateDoc(ref, {
          customDomain: domain,
          status: (domainDoc?.status as string) || 'connected',
          updatedAt: nowTs
        })
      } else {
        await setDoc(ref, {
          customDomain: domain,
          status: 'connected',
          ssl: false,
          createdAt: nowTs,
          updatedAt: nowTs,
          vercelData: {
            name: domain,
            apexName: domain,
            verified: false,
            createdAt: Date.now(),
            updatedAt: Date.now(),
            projectId: null,
            redirect: null,
            redirectStatusCode: null,
            gitBranch: null,
            customEnvironmentId: null
          }
        })
      }
      const snap = await getDoc(ref)
      setDomainDoc(snap.exists() ? (snap.data() as any) : null)
    } finally {
      setDomainSaving(false)
    }
  }

  const verifyCustomDomain = async () => {
    if (!store?.id) return
    setDomainSaving(true)
    try {
      const domain = customDomain.trim()
      // 1) Consultar endpoint interno para verificar HTTPS y cabeceras Vercel
      const res = await fetch('/api/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      })
      const data = res.ok ? await res.json() : { ssl: false, verified: false }

      // 2) Guardar resultado en Firestore
      const db = getFirebaseDb()
      if (!db) return
      const ref = doc(db, 'stores', store.id, 'settings', 'domain')
      await updateDoc(ref, {
        lastChecked: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ssl: Boolean(data?.ssl),
        vercelData: {
          ...(domainDoc?.vercelData || {}),
          verified: Boolean(data?.verified),
          updatedAt: Date.now()
        }
      })
      const snap = await getDoc(ref)
      setDomainDoc(snap.exists() ? (snap.data() as any) : null)
    } finally {
      setDomainSaving(false)
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GeneralSettingsNav currentSection="advanced" />

          <div className="max-w-4xl space-y-6">
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-6 space-y-6">
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

            {/* Conectar dominio personalizado */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{tAdv('customDomain.title')}</h3>
                  <p className="mt-1 text-sm text-gray-600">{tAdv('customDomain.description')}</p>
                </div>

                <div className="space-y-3">
                  <label className="block text-sm font-medium text-gray-700">{tAdv('customDomain.domainLabel')}</label>
                  <input
                    type="text"
                    value={customDomain}
                    onChange={(e) => setCustomDomain(e.target.value)}
                    placeholder={tAdv('customDomain.placeholder')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-white"
                    disabled={domainLoading || domainSaving}
                  />
                  {domainDoc && (
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><span className="font-medium">{tAdv('customDomain.status')}:</span> {domainDoc?.status || '—'}</div>
                      <div><span className="font-medium">{tAdv('customDomain.ssl')}:</span> {domainDoc?.ssl ? tAdv('customDomain.sslActive') : tAdv('customDomain.sslPending')}</div>
                      <div><span className="font-medium">{tAdv('customDomain.verified')}:</span> {domainDoc?.vercelData?.verified ? tAdv('customDomain.yes') : tAdv('customDomain.no')}</div>
                      <div><span className="font-medium">{tAdv('customDomain.lastChecked')}:</span> {domainDoc?.lastChecked?.toDate ? domainDoc?.lastChecked?.toDate().toLocaleString() : '—'}</div>
                    </div>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-3">
                  <button
                    onClick={saveCustomDomain}
                    disabled={domainSaving || domainLoading || !customDomain.trim()}
                    className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 ${domainSaving ? 'bg-gray-600 cursor-wait' : 'bg-black hover:bg-gray-800'}`}
                  >
                    {domainSaving ? tAdv('customDomain.saving') : tAdv('customDomain.save')}
                  </button>
                  <button
                    onClick={verifyCustomDomain}
                    disabled={domainSaving || domainLoading}
                    className="px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {tAdv('customDomain.verifyNow')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


