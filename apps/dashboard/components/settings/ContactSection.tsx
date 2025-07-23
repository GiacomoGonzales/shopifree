'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../lib/store'
import { googleMapsLoader } from '../../lib/google-maps'

export default function ContactSection() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [autocompleteRef, setAutocompleteRef] = useState<HTMLInputElement | null>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)

  const [formData, setFormData] = useState({
    hasPhysicalLocation: false,
    location: {
      address: '',
      lat: 0,
      lng: 0
    },
    phone: '',
    emailStore: '',
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
            hasPhysicalLocation: userStore.hasPhysicalLocation || false,
            location: {
              address: userStore.location?.address || userStore.address || '',
              lat: userStore.location?.lat || 0,
              lng: userStore.location?.lng || 0
            },
            phone: userStore.phone || '',
            emailStore: userStore.emailStore || '',
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

  // Cargar Google Maps API usando el loader centralizado
  useEffect(() => {
    if (formData.hasPhysicalLocation) {
      googleMapsLoader.load()
        .then(() => {
          console.log('Google Maps loaded for ContactSection')
          setIsGoogleMapsLoaded(true)
        })
        .catch((error: Error) => {
          console.error('Error loading Google Maps:', error)
        })
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
          
          handleChange('location.address', address)
          handleChange('location.lat', lat)
          handleChange('location.lng', lng)
        }
      })

      return () => {
        window.google.maps.event.clearInstanceListeners(autocomplete)
      }
    }
  }, [isGoogleMapsLoaded, autocompleteRef, formData.hasPhysicalLocation])

  const handleChange = (field: string, value: string | number | boolean) => {
    if (field.startsWith('location.')) {
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
            <h3 className="text-lg font-medium text-gray-900">{t('contact.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('contact.subtitle')}</p>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={formData.hasPhysicalLocation}
              onChange={(e) => handleChange('hasPhysicalLocation', e.target.checked)}
              className="checkbox-dashboard"
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
                  value={formData.location.address}
                  onChange={(e) => handleChange('location.address', e.target.value)}
                  placeholder={isGoogleMapsLoaded ? t('contact.addressPlaceholder') : t('contact.addressPlaceholder')}
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
              {formData.location.lat !== 0 && formData.location.lng !== 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  ✓ {t('contact.addressSaved')}
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