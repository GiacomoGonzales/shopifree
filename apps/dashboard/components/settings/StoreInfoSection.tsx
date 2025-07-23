'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../lib/store'

export default function StoreInfoSection() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)

  const [formData, setFormData] = useState({
    storeName: '',
    slogan: '',
    description: '',
    businessType: '',
  })

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return
      
      try {        
        const userStore = await getUserStore(user.uid)
        setStore(userStore)
        if (userStore) {
          setFormData({
            storeName: userStore.storeName || '',
            slogan: userStore.slogan || '',
            description: userStore.description || '',
            businessType: userStore.businessType || '',
          })
        }
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [user?.uid])

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    if (!store?.id) return
    
    setSaving(true)
    try {
      await updateStore(store.id, formData)
      setStore(prev => prev ? { ...prev, ...formData } : null)
      setSaveMessage(tActions('saved'))
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error updating store:', error)
      setSaveMessage(tActions('error'))
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              No se pudo cargar la información de tu tienda. Intenta recargar la página.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('storeInfo.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('storeInfo.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('storeInfo.storeName')}
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                placeholder={t('storeInfo.storeNamePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('contact.businessType')}
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleChange('businessType', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-white"
              >
                <option value="">{t('contact.businessTypePlaceholder')}</option>
                <option value="fashion">{t('contact.businessTypes.fashion')}</option>
                <option value="technology">{t('contact.businessTypes.technology')}</option>
                <option value="health">{t('contact.businessTypes.health')}</option>
                <option value="food">{t('contact.businessTypes.food')}</option>
                <option value="restaurant">{t('contact.businessTypes.restaurant')}</option>
                <option value="home">{t('contact.businessTypes.home')}</option>
                <option value="sports">{t('contact.businessTypes.sports')}</option>
                <option value="education">{t('contact.businessTypes.education')}</option>
                <option value="toys">{t('contact.businessTypes.toys')}</option>
                <option value="pets">{t('contact.businessTypes.pets')}</option>
                <option value="service">{t('contact.businessTypes.service')}</option>
                <option value="wholesale">{t('contact.businessTypes.wholesale')}</option>
                <option value="retail">{t('contact.businessTypes.retail')}</option>
                <option value="handcrafts">{t('contact.businessTypes.handcrafts')}</option>
                <option value="eco">{t('contact.businessTypes.eco')}</option>
                <option value="other">{t('contact.businessTypes.other')}</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('storeInfo.storeUrl')}
              </label>
              <div className="flex items-center space-x-2 relative">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    value={`${store.subdomain}.shopifree.app`}
                    disabled
                    className="w-full px-3 py-2 pr-20 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-700 text-sm font-medium"
                  />
                  <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex space-x-1">
                    <button
                      onClick={() => window.open(`https://${store.subdomain}.shopifree.app`, '_blank')}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title="Abrir tienda en nueva ventana"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </button>
                    <button
                      onClick={async () => {
                        try {
                          await navigator.clipboard.writeText(`https://${store.subdomain}.shopifree.app`)
                          setCopySuccess(true)
                          setTimeout(() => {
                            setCopySuccess(false)
                          }, 3000)
                        } catch (err) {
                          console.error('Error al copiar:', err)
                        }
                      }}
                      className="p-1 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                      title="Copiar URL"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                {/* Toast de éxito al copiar */}
                {copySuccess && (
                  <div className="absolute top-0 right-0 transform translate-x-full -translate-y-2 z-10 ml-2">
                    <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 shadow-lg transition-all duration-300 ease-out transform animate-pulse">
                      <div className="flex items-center space-x-2">
                        <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-sm font-medium text-green-800 whitespace-nowrap">¡URL copiada!</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <p className="mt-2 text-xs text-gray-500">
                {t('storeInfo.storeUrlHint')}
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storeInfo.slogan')}
            </label>
            <input
              type="text"
              value={formData.slogan}
              onChange={(e) => handleChange('slogan', e.target.value)}
              placeholder={t('storeInfo.sloganPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('storeInfo.description')}
            </label>
            <textarea
              rows={4}
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder={t('storeInfo.descriptionPlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm resize-none"
            />
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-between items-center">
        {saveMessage && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${
            saveMessage === tActions('saved')
              ? 'bg-gray-100 text-gray-800 border border-gray-300'
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {saveMessage}
          </div>
        )}
        <div className="ml-auto">
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 ${
              saving 
                ? 'bg-gray-600 cursor-wait' 
                : 'bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
          >
            {saving ? tActions('saving') : tActions('save')}
          </button>
        </div>
      </div>
    </div>
  )
} 