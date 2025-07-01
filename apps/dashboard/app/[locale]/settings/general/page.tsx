'use client'

import { useState, useEffect } from 'react'

// Declaración de tipos para Google Maps API
declare global {
  interface Window {
    google: any
  }
}
import { useTranslations } from 'next-intl'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../lib/store'
import DashboardLayout from '../../../../components/DashboardLayout'

const sections = [
  { id: 'info', key: 'info' },
  { id: 'contact', key: 'contact' },
  { id: 'branding', key: 'branding' },
  { id: 'social', key: 'social' },
  { id: 'location', key: 'location' },
]

export default function GeneralSettingsPage() {
  const { user } = useAuth()
  const t = useTranslations('pages.settings.basic')
  const tActions = useTranslations('pages.settings.actions')
  
  const [activeSection, setActiveSection] = useState('info')
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [copySuccess, setCopySuccess] = useState(false)
  const [autocompleteRef, setAutocompleteRef] = useState<HTMLInputElement | null>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  const [formData, setFormData] = useState({
    storeName: '',
    slogan: '',
    description: '',
    hasPhysicalLocation: false,
    address: '',
    location: {
      address: '',
      lat: 0,
      lng: 0
    },
    businessType: '',
    phone: '',
    emailStore: '',
    primaryColor: '#4F46E5',
    secondaryColor: '#06B6D4',
    currency: 'USD',
    socialMedia: {
      facebook: '',
      instagram: '',
      whatsapp: '',
      tiktok: ''
    }
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
            hasPhysicalLocation: userStore.hasPhysicalLocation || false,
            address: userStore.address || '',
            location: {
              address: userStore.location?.address || userStore.address || '',
              lat: userStore.location?.lat || 0,
              lng: userStore.location?.lng || 0
            },
            businessType: userStore.businessType || '',
            phone: userStore.phone || '',
            emailStore: userStore.emailStore || '',
            primaryColor: userStore.primaryColor || '#4F46E5',
            secondaryColor: userStore.secondaryColor || '#06B6D4',
            currency: userStore.currency || 'USD',
            socialMedia: {
              facebook: userStore.socialMedia?.facebook || '',
              instagram: userStore.socialMedia?.instagram || '',
              whatsapp: userStore.socialMedia?.whatsapp || '',
              tiktok: userStore.socialMedia?.tiktok || ''
            }
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

  // Cargar Google Maps API
  useEffect(() => {
    const loadGoogleMapsScript = () => {
      // Verificar si el script ya está cargado
      if (window.google && window.google.maps && window.google.maps.places) {
        setIsGoogleMapsLoaded(true)
        return
      }

      // Verificar si el script ya existe en el DOM
      if (document.querySelector('script[src*="maps.googleapis.com"]')) {
        // Esperar a que se cargue
        const checkLoaded = setInterval(() => {
          if (window.google && window.google.maps && window.google.maps.places) {
            setIsGoogleMapsLoaded(true)
            clearInterval(checkLoaded)
          }
        }, 100)
        return
      }

      // Crear y añadir el script
      const script = document.createElement('script')
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_MAPS_API_KEY || ''}&libraries=places&language=es`
      script.async = true
      script.defer = true
      
      script.onload = () => {
        setIsGoogleMapsLoaded(true)
      }
      
      script.onerror = () => {
        console.error('Error loading Google Maps API')
      }
      
      document.head.appendChild(script)
    }

    if (formData.hasPhysicalLocation) {
      loadGoogleMapsScript()
    }
  }, [formData.hasPhysicalLocation])

  // Configurar el autocompletado cuando Google Maps esté cargado y el input esté disponible
  useEffect(() => {
    if (isGoogleMapsLoaded && autocompleteRef && formData.hasPhysicalLocation) {
      const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef, {
        types: ['address'],
        componentRestrictions: { country: ['mx', 'ar', 'co', 'pe', 'cl', 've', 'ec', 'bo', 'py', 'uy', 'br', 'es', 'us'] }
      })

      autocomplete.addListener('place_changed', () => {
        const place = autocomplete.getPlace()
        
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat()
          const lng = place.geometry.location.lng()
          const address = place.formatted_address || place.name || ''
          
          // Actualizar la dirección y coordenadas en la nueva estructura
          handleChange('location.address', address)
          handleChange('location.lat', lat)
          handleChange('location.lng', lng)
          
          // Sincronizar el campo legacy para compatibilidad con la UI
          setFormData(prev => ({
            ...prev,
            address: address
          }))
        }
      })

      return () => {
        // Limpiar listeners si es necesario
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [isGoogleMapsLoaded, autocompleteRef, formData.hasPhysicalLocation])

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
        }
      }))
    } else if (field.startsWith('location.')) {
      const locationField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        location: {
          ...prev.location,
          [locationField]: value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [field]: value
      }))
    }
  }

  const handleSave = async () => {
    if (!store?.id) return
    
    setSaving(true)
    try {
      // Crear una copia de formData sin el campo address legacy para evitar duplicación
      const { address, ...dataToSave } = formData
      
      // Si hay dirección en location, no enviar el campo address legacy
      const finalData = formData.location.address 
        ? dataToSave 
        : { ...dataToSave, address: formData.address }
      
      await updateStore(store.id, finalData)
      setStore(prev => prev ? { ...prev, ...finalData } : null)
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
      <DashboardLayout>
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 px-8 py-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="h-96 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="flex min-h-screen bg-gray-50">
          <div className="flex-1 px-8 py-8">
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
          </div>
        </div>
      </DashboardLayout>
    )
  }

  const renderStoreInfoSection = () => (
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
                <option value="retail">{t('contact.businessTypes.retail')}</option>
                <option value="wholesale">{t('contact.businessTypes.wholesale')}</option>
                <option value="service">{t('contact.businessTypes.service')}</option>
                <option value="restaurant">{t('contact.businessTypes.restaurant')}</option>
                <option value="fashion">{t('contact.businessTypes.fashion')}</option>
                <option value="technology">{t('contact.businessTypes.technology')}</option>
                <option value="health">{t('contact.businessTypes.health')}</option>
                <option value="sports">{t('contact.businessTypes.sports')}</option>
                <option value="education">{t('contact.businessTypes.education')}</option>
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
    </div>
  )

  const renderContactSection = () => (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('contact.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('contact.subtitle')}</p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.hasPhysicalLocation}
              onChange={(e) => handleChange('hasPhysicalLocation', e.target.checked)}
              className="h-4 w-4 text-gray-800 focus:ring-gray-600 border-gray-300 rounded"
            />
            <label className="ml-3 block text-sm font-medium text-gray-700">
              {t('contact.hasPhysicalLocation')}
            </label>
          </div>

          {formData.hasPhysicalLocation && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('contact.address')}
              </label>
              <div className="relative">
                <input
                  ref={setAutocompleteRef}
                  type="text"
                  value={formData.address}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData(prev => ({
                      ...prev,
                      address: value,
                      location: {
                        ...prev.location,
                        address: value
                      }
                    }))
                  }}
                  placeholder={isGoogleMapsLoaded ? "Empieza a escribir tu dirección..." : t('contact.addressPlaceholder')}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                />
                {formData.hasPhysicalLocation && !isGoogleMapsLoaded && (
                  <div className="absolute right-3 top-3">
                    <svg className="w-4 h-4 text-gray-400 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {isGoogleMapsLoaded && formData.location.lat !== 0 && formData.location.lng !== 0 && (
                  <div className="absolute right-3 top-3">
                    <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                )}
              </div>
              {isGoogleMapsLoaded && (
                <p className="mt-1 text-xs text-gray-500">
                  ✨ Autocompletado habilitado - Las coordenadas se guardarán automáticamente
                </p>
              )}
              {formData.location.lat !== 0 && formData.location.lng !== 0 && (
                <p className="mt-1 text-xs text-green-600">
                  📍 Coordenadas: {formData.location.lat.toFixed(6)}, {formData.location.lng.toFixed(6)}
                </p>
              )}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contact.phone')}
            </label>
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => handleChange('phone', e.target.value)}
              placeholder={t('contact.phonePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t('contact.emailStore')}
            </label>
            <input
              type="email"
              value={formData.emailStore}
              onChange={(e) => handleChange('emailStore', e.target.value)}
              placeholder={t('contact.emailStorePlaceholder')}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
            />
            <p className="mt-1 text-xs text-gray-500">
              {t('contact.emailStoreHint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderBrandingSection = () => (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('branding.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('branding.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('branding.primaryColor')}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.primaryColor}
                  onChange={(e) => handleChange('primaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('branding.secondaryColor')}
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="color"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="h-10 w-16 border border-gray-300 rounded-md cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.secondaryColor}
                  onChange={(e) => handleChange('secondaryColor', e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('branding.currency')}
              </label>
              <input
                type="text"
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                placeholder={t('branding.currencyPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSocialSection = () => (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('socialMedia.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('socialMedia.subtitle')}</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.facebook')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.facebook}
                onChange={(e) => handleChange('socialMedia.facebook', e.target.value)}
                placeholder={t('socialMedia.facebookPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.instagram')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.instagram}
                onChange={(e) => handleChange('socialMedia.instagram', e.target.value)}
                placeholder={t('socialMedia.instagramPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.whatsapp')}
              </label>
              <input
                type="tel"
                value={formData.socialMedia.whatsapp}
                onChange={(e) => handleChange('socialMedia.whatsapp', e.target.value)}
                placeholder={t('socialMedia.whatsappPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.tiktok')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.tiktok}
                onChange={(e) => handleChange('socialMedia.tiktok', e.target.value)}
                placeholder={t('socialMedia.tiktokPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderLocationSection = () => (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Localización</h3>
            <p className="mt-1 text-sm text-gray-600">Configura la ubicación y zona horaria de tu tienda</p>
          </div>
          
          <div className="text-center py-12 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="mt-4 text-sm font-medium text-gray-900">Próximamente</h3>
            <p className="mt-2 text-sm text-gray-500">
              Configuración de zona horaria y localización avanzada
            </p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSection = () => {
    switch (activeSection) {
      case 'info':
        return renderStoreInfoSection()
      case 'contact':
        return renderContactSection()
      case 'branding':
        return renderBrandingSection()
      case 'social':
        return renderSocialSection()
      case 'location':
        return renderLocationSection()
      default:
        return renderStoreInfoSection()
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Tabs horizontales */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav 
                className="flex space-x-8 overflow-x-auto px-4 sm:px-0 scrollbar-none" 
                style={{
                  scrollbarWidth: 'none', 
                  msOverflowStyle: 'none',
                  WebkitOverflowScrolling: 'touch'
                }}
              >
                {sections.map((section) => (
                  <button
                    key={section.id}
                    onClick={() => setActiveSection(section.id)}
                    className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                      activeSection === section.id
                        ? 'border-gray-600 text-gray-800'
                        : 'border-transparent text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {t(`sections.${section.key}`)}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Contenido dinámico */}
          <div className="max-w-4xl">
            {renderSection()}

            {/* Botón de guardar */}
            <div className="mt-8 flex justify-between items-center">
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
                  className="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {saving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {tActions('saving')}
                    </>
                  ) : (
                    tActions('save')
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 