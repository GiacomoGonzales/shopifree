'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import GeneralSettingsNav from '../../../../../components/settings/GeneralSettingsNav'
import LanguageSection from '../../../../../components/settings/LanguageSection'
import { Toast } from '../../../../../components/shared/Toast'
import { useToast } from '../../../../../lib/hooks/useToast'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../../lib/store'
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from '../../../../../lib/firebase'
import { hasFeatureAccess } from '../../../../../lib/subscription-utils'
import SubscriptionBlockedModal from '../../../../../components/SubscriptionBlockedModal'

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

  const { toast, showToast, hideToast } = useToast()

  // Estado para dominio personalizado
  const [domainLoading, setDomainLoading] = useState(true)
  const [domainSaving, setDomainSaving] = useState(false)
  const [customDomain, setCustomDomain] = useState('')
  const [domainDoc, setDomainDoc] = useState<any | null>(null)

  // Estado para control de acceso a funcionalidades premium
  const [hasCustomDomainAccess, setHasCustomDomainAccess] = useState(false)
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

  // Función para actualizar la tienda
  const handleStoreUpdate = async (data: Partial<StoreWithId>): Promise<boolean> => {
    if (!store?.id) return false
    setSaving(true)
    try {
      const success = await updateStore(store.id, data)
      if (success) {
        // Recargar datos de la tienda para reflejar cambios
        const updatedStore = await getUserStore(user?.uid || '')
        if (updatedStore) {
          setStore(updatedStore)
        }
      }
      return success
    } catch (error) {
      console.error('Error updating store:', error)
      return false
    } finally {
      setSaving(false)
    }
  }

  useEffect(() => {
    const load = async () => {
      if (!user?.uid) return
      try {
        const s = await getUserStore(user.uid)
        setStore(s)

        // Verificar acceso a dominio personalizado
        const customDomainAccess = await hasFeatureAccess(user.uid, 'hasCustomDomain')
        setHasCustomDomainAccess(customDomainAccess)

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
      // 1. Intentar agregar automáticamente a Vercel
      console.log('🔄 Agregando dominio a Vercel automáticamente:', domain)
      const vercelResponse = await fetch('/api/domain/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ domain })
      })
      
      let vercelData = null
      let vercelSuccess = false
      
      if (vercelResponse.ok) {
        vercelData = await vercelResponse.json()
        vercelSuccess = true
        console.log('✅ Dominio agregado a Vercel:', vercelData)
      } else {
        const error = await vercelResponse.json()
        console.log('⚠️ No se pudo agregar automáticamente a Vercel:', error.error)
      }

      // 2. Guardar en Firestore (siempre, independientemente del resultado de Vercel)
      console.log('💾 Guardando dominio en Firestore:', domain)
      const db = getFirebaseDb()
      if (!db) return
      const ref = doc(db, 'stores', store.id, 'settings', 'domain')
      const nowTs = serverTimestamp()
      if (domainDoc) {
        await updateDoc(ref, {
          customDomain: domain,
          status: 'connected',
          updatedAt: nowTs,
          vercelData: vercelData?.data || domainDoc.vercelData || {}
        })
      } else {
        await setDoc(ref, {
          customDomain: domain,
          status: 'connected',
          ssl: false,
          createdAt: nowTs,
          updatedAt: nowTs,
          vercelData: vercelData?.data || {
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
      
      // Mensaje de éxito siempre positivo
      showToast('Dominio guardado exitosamente', 'success')
      
    } catch (error) {
      console.error('❌ Error guardando dominio:', error)
      showToast(`Error: ${error instanceof Error ? error.message : 'Error desconocido'}`, 'error')
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
            showToast('Dominio verificado y URL canónica actualizada automáticamente', 'success')
          } else {
            showToast('Dominio verificado exitosamente', 'success')
          }
        } catch (error) {
          console.error('Error actualizando URL canónica:', error)
          showToast('Dominio verificado (error al actualizar URL canónica)', 'success')
        }
      }
    } finally {
      setDomainSaving(false)
    }
  }

  // Loading state mientras cargan los datos
  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <GeneralSettingsNav currentSection="advanced" />

            <div className="max-w-4xl space-y-6">
              {/* Loading skeleton para selector de idioma */}
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-6 py-6 space-y-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="animate-pulse flex items-center p-4 border rounded-lg">
                        <div className="w-4 h-4 bg-gray-200 rounded-full mr-3"></div>
                        <div className="flex-1">
                          <div className="h-4 bg-gray-200 rounded w-1/4 mb-1"></div>
                          <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Loading skeleton para dominio personalizado */}
              <div className="bg-white shadow-sm rounded-lg border border-gray-200">
                <div className="px-6 py-6 space-y-6">
                  <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                    <div className="h-4 bg-gray-100 rounded w-2/3"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/6 mb-2"></div>
                    <div className="h-10 bg-gray-100 rounded w-full"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-3"></div>
                    <div className="space-y-3">
                      <div className="h-16 bg-gray-100 rounded"></div>
                      <div className="h-16 bg-gray-100 rounded"></div>
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

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <GeneralSettingsNav currentSection="advanced" />

          <div className="max-w-4xl space-y-6">

            {/* Selector de idioma de la tienda */}
            {store && (
              <LanguageSection
                store={store}
                onUpdate={handleStoreUpdate}
                saving={saving}
                showToast={showToast}
              />
            )}

            {/* Conectar dominio personalizado */}
            <div className="bg-white shadow-sm rounded-lg border border-gray-200 relative">
              {/* Overlay de bloqueo para usuarios sin acceso */}
              {!hasCustomDomainAccess && (
                <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] rounded-lg z-10 flex items-center justify-center">
                  <div className="text-center px-6 py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Función Premium
                    </h3>
                    <p className="text-sm text-gray-600 mb-6 max-w-sm">
                      El dominio personalizado está disponible con el plan Premium. Activa tu periodo de prueba para acceder a esta función.
                    </p>
                    <button
                      onClick={() => setShowSubscriptionModal(true)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md inline-flex items-center gap-2"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      Activar con plan Premium
                    </button>
                  </div>
                </div>
              )}

              <div className={`px-6 py-6 space-y-6 ${!hasCustomDomainAccess ? 'pointer-events-none' : ''}`}>
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

                  {/* Guía de configuración DNS */}
                  <div className="md:col-span-2 bg-gray-50 rounded-lg p-4 border border-gray-200">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">{tAdv('customDomain.cnameGuide')}</h4>
                    <p className="text-sm text-gray-600 mb-4">
                      {tAdv('customDomain.cnameInstructions')}
                    </p>
                    
                    {/* Registro A */}
                    <div className="bg-white rounded-md p-3 border border-gray-200 mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {locale === 'es' ? 'Registro A (dominio raíz)' : 'A Record (root domain)'}
                        </span>
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                          @ → 216.198.79.1
                        </code>
                      </div>
                    </div>
                    
                    {/* Registro CNAME */}
                    <div className="bg-white rounded-md p-3 border border-gray-200">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-700">
                          {locale === 'es' ? 'Registro CNAME (www)' : 'CNAME Record (www)'}
                        </span>
                        <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded text-gray-800">
                          www → cname-ssl.vercel-dns.com
                        </code>
                      </div>
                    </div>

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
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Modal de suscripción bloqueada */}
      <SubscriptionBlockedModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        featureName="Dominio Personalizado"
        requiredPlan="premium"
        reason="plan_limitation"
      />
    </DashboardLayout>
  )
}


