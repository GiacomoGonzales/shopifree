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

// Función auxiliar para actualizar URL canónica cuando se verifica un dominio
const updateCanonicalUrl = async (storeId: string, customDomain: string) => {
  try {
    const db = getFirebaseDb()
    if (!db) return
    
    const storeRef = doc(db, 'stores', storeId)
    const storeSnap = await getDoc(storeRef)
    
    if (storeSnap.exists()) {
      const storeData = storeSnap.data()
      const currentCanonicalUrl = storeData?.advanced?.seo?.canonicalUrl || ''
      const expectedCanonicalUrl = `https://${customDomain}`
      
      // Actualizar si la URL canónica no coincide con el dominio personalizado
      if (currentCanonicalUrl !== expectedCanonicalUrl) {
        await updateDoc(storeRef, {
          advanced: {
            ...(storeData.advanced || {}),
            seo: {
              ...(storeData.advanced?.seo || {}),
              canonicalUrl: expectedCanonicalUrl
            }
          },
          updatedAt: serverTimestamp()
        })
        
        console.log('✅ URL canónica actualizada automáticamente:', expectedCanonicalUrl)
        return true // Indica que se actualizó
      }
    }
    return false // Indica que no se necesitó actualizar
  } catch (error) {
    console.error('❌ Error actualizando URL canónica:', error)
    throw error
  }
}

export default function GeneralSettingsAdvancedPage() {
  const t = useTranslations('settings')
  const tAdv = useTranslations('settings.advanced')
  const params = useParams()
  const locale = (params?.locale as string) || 'es'
  const { user } = useAuth()

  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      console.log(`🔍 Iniciando verificación de dominio: ${domain}`)
      
      // 1) Consultar endpoint interno para verificar HTTPS y cabeceras Vercel
      const res = await fetch('/api/domain/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      })
      const data = res.ok ? await res.json() : { ssl: false, verified: false }
      console.log('✅ Respuesta de verificación:', data)

      // 2) Guardar resultado en Firestore
      const db = getFirebaseDb()
      if (!db) return
      const ref = doc(db, 'stores', store.id, 'settings', 'domain')
      await updateDoc(ref, {
        lastChecked: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ssl: Boolean(data?.ssl),
        verified: Boolean(data?.verified), // Campo principal de verificación
        vercelData: {
          ...(domainDoc?.vercelData || {}),
          verified: Boolean(data?.verified),
          updatedAt: Date.now(),
          source: data?.source || 'unknown'
        }
      })
      const snap = await getDoc(ref)
      const updatedDomainDoc = snap.exists() ? (snap.data() as any) : null
      setDomainDoc(updatedDomainDoc)
      
      // ✅ Si el dominio se verificó exitosamente, actualizar URL canónica automáticamente
      if (Boolean(data?.verified) && updatedDomainDoc?.customDomain) {
        try {
          const wasUpdated = await updateCanonicalUrl(store.id, updatedDomainDoc.customDomain)
          if (wasUpdated) {
            setMessage('✅ Dominio verificado y URL canónica actualizada automáticamente')
          } else {
            setMessage('✅ Dominio verificado exitosamente')
          }
          setTimeout(() => setMessage(null), 4000)
        } catch (error) {
          console.error('Error actualizando URL canónica:', error)
          setMessage('✅ Dominio verificado (error al actualizar URL canónica)')
          setTimeout(() => setMessage(null), 4000)
        }
      }
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

            {/* Conectar dominio personalizado */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200">
              <div className="px-6 py-6 space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">{tAdv('customDomain.title')}</h3>
                  <p className="mt-1 text-sm text-gray-600">{tAdv('customDomain.description')}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tAdv('customDomain.domainLabel')}
                    </label>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      placeholder={tAdv('customDomain.placeholder')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-white"
                      disabled={domainLoading || domainSaving}
                    />
                    <p className="mt-2 text-xs text-gray-500">
                      {tAdv('customDomain.hint')}
                    </p>
                  </div>

                  {domainDoc && (
                    <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <h4 className="text-sm font-medium text-gray-900 mb-3">{tAdv('customDomain.statusTitle')}</h4>
                      
                      {/* Debug info para verificar datos */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-xs text-blue-800">
                          <strong>Debug:</strong> SSL: {String(domainDoc?.ssl)}, Verified(root): {String(domainDoc?.verified)}, Verified(vercel): {String(domainDoc?.vercelData?.verified)}
                        </div>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            domainDoc?.status === 'connected' ? 'bg-green-500' : 'bg-yellow-500'
                          }`}></div>
                          <div>
                            <span className="font-medium text-gray-700">{tAdv('customDomain.status')}: </span>
                            <span className="text-gray-900">{domainDoc?.status || '—'}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            domainDoc?.ssl ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <span className="font-medium text-gray-700">{tAdv('customDomain.ssl')}: </span>
                            <span className="text-gray-900">
                              {domainDoc?.ssl ? tAdv('customDomain.sslActive') : tAdv('customDomain.sslPending')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${
                            (domainDoc?.verified || domainDoc?.vercelData?.verified) ? 'bg-green-500' : 'bg-red-500'
                          }`}></div>
                          <div>
                            <span className="font-medium text-gray-700">{tAdv('customDomain.verified')}: </span>
                            <span className="text-gray-900">
                              {(domainDoc?.verified || domainDoc?.vercelData?.verified) ? tAdv('customDomain.yes') : tAdv('customDomain.no')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
                          <div>
                            <span className="font-medium text-gray-700">{tAdv('customDomain.lastChecked')}: </span>
                            <span className="text-gray-900 text-xs">
                              {domainDoc?.lastChecked?.toDate ? 
                                domainDoc?.lastChecked?.toDate().toLocaleDateString() : '—'
                              }
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>


              </div>
            </div>

            {/* Botones del dominio personalizado */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex-1">
                {/* Espaciador para alineación */}
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={verifyCustomDomain}
                  disabled={domainSaving || domainLoading || !customDomain.trim()}
                  className="px-4 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {domainSaving ? tAdv('customDomain.verifying') : tAdv('customDomain.verifyNow')}
                </button>
                <button
                  onClick={saveCustomDomain}
                  disabled={domainSaving || domainLoading || !customDomain.trim()}
                  className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 ${
                    domainSaving 
                      ? 'bg-gray-600 cursor-wait' 
                      : 'bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
                  }`}
                >
                  {domainSaving ? tAdv('customDomain.saving') : tAdv('customDomain.save')}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}


