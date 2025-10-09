'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../lib/store'
import { googleMapsLoader } from '../../lib/google-maps'
import { Toast } from '../shared/Toast'
import { useToast } from '../../lib/hooks/useToast'

export default function ContactSection() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const { toast, showToast, hideToast } = useToast()
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
    socialMedia: {
      facebook: '',
      instagram: '',
      tiktok: '',
      x: '',
      snapchat: '',
      linkedin: '',
      telegram: '',
      youtube: '',
      pinterest: ''
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
            hasPhysicalLocation: userStore.hasPhysicalLocation || false,
            location: {
              address: userStore.location?.address || userStore.address || '',
              lat: userStore.location?.lat || 0,
              lng: userStore.location?.lng || 0
            },
            phone: userStore.phone || '',
            emailStore: userStore.emailStore || '',
            socialMedia: {
              facebook: userStore.socialMedia?.facebook || '',
              instagram: userStore.socialMedia?.instagram || '',
              tiktok: userStore.socialMedia?.tiktok || '',
              x: userStore.socialMedia?.x || '',
              snapchat: userStore.socialMedia?.snapchat || '',
              linkedin: userStore.socialMedia?.linkedin || '',
              telegram: userStore.socialMedia?.telegram || '',
              youtube: userStore.socialMedia?.youtube || '',
              pinterest: userStore.socialMedia?.pinterest || ''
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
      // Intentar obtener ubicación del usuario para priorizar resultados cercanos
      const setupAutocomplete = (userLocation?: google.maps.LatLng) => {
        const autocompleteOptions: google.maps.places.AutocompleteOptions = {
          types: ['address']
        }

        // Si tenemos la ubicación del usuario, priorizar resultados cercanos
        if (userLocation) {
          autocompleteOptions.location = userLocation
          autocompleteOptions.radius = 50000 // 50km de radio para priorizar resultados locales
          console.log('📍 Autocomplete configurado con ubicación del usuario:', userLocation.lat(), userLocation.lng())
        } else {
          console.log('🌍 Autocomplete configurado para búsqueda global (sin restricciones)')
        }

        const autocomplete = new window.google.maps.places.Autocomplete(autocompleteRef, autocompleteOptions)

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

        return autocomplete
      }

      // Intentar obtener la ubicación del usuario
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = new window.google.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            )
            const autocomplete = setupAutocomplete(userLocation)

            return () => {
              window.google.maps.event.clearInstanceListeners(autocomplete)
            }
          },
          (error) => {
            console.log('⚠️ No se pudo obtener ubicación del usuario, usando búsqueda global:', error.message)
            const autocomplete = setupAutocomplete()

            return () => {
              window.google.maps.event.clearInstanceListeners(autocomplete)
            }
          },
          {
            timeout: 5000,
            maximumAge: 600000 // Cache de 10 minutos
          }
        )
      } else {
        console.log('⚠️ Geolocalización no disponible, usando búsqueda global')
        const autocomplete = setupAutocomplete()

        return () => {
          window.google.maps.event.clearInstanceListeners(autocomplete)
        }
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
    } else if (field.startsWith('socialMedia.')) {
      const socialField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        socialMedia: {
          ...prev.socialMedia,
          [socialField]: value
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
      showToast(tActions('saved'), 'success')
    } catch (error) {
      console.error('Error updating store:', error)
      showToast(tActions('error'), 'error')
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
      {/* Información de Contacto */}
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

      {/* Redes Sociales */}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.x')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.x}
                onChange={(e) => handleChange('socialMedia.x', e.target.value)}
                placeholder={t('socialMedia.xPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.snapchat')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.snapchat}
                onChange={(e) => handleChange('socialMedia.snapchat', e.target.value)}
                placeholder={t('socialMedia.snapchatPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.linkedin')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.linkedin}
                onChange={(e) => handleChange('socialMedia.linkedin', e.target.value)}
                placeholder={t('socialMedia.linkedinPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.telegram')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.telegram}
                onChange={(e) => handleChange('socialMedia.telegram', e.target.value)}
                placeholder={t('socialMedia.telegramPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.youtube')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.youtube}
                onChange={(e) => handleChange('socialMedia.youtube', e.target.value)}
                placeholder={t('socialMedia.youtubePlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('socialMedia.pinterest')}
              </label>
              <input
                type="url"
                value={formData.socialMedia.pinterest}
                onChange={(e) => handleChange('socialMedia.pinterest', e.target.value)}
                placeholder={t('socialMedia.pinterestPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end items-center">
        <div>
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
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
} 