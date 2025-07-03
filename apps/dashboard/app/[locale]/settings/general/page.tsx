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
import { uploadImageToCloudinary, validateImageFile, replaceImageInCloudinary, deleteImageFromCloudinary } from '../../../../lib/cloudinary'

const sections = [
  { id: 'info', key: 'info' },
  { id: 'contact', key: 'contact' },
  { id: 'branding', key: 'branding' },
  { id: 'sales', key: 'sales' },
  { id: 'social', key: 'social' },
  { id: 'location', key: 'location' },
]

const monedas = [
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
  { code: 'PEN', symbol: 'S/', name: 'Nuevo Sol' },
  { code: 'BRL', symbol: 'R$', name: 'Real Brasileño' },
  { code: 'UYU', symbol: '$', name: 'Peso Uruguayo' },
  { code: 'PYG', symbol: '₲', name: 'Guaraní Paraguayo' },
  { code: 'BOB', symbol: 'Bs', name: 'Boliviano' },
  { code: 'VES', symbol: 'Bs', name: 'Bolívar Venezolano' },
  { code: 'GTQ', symbol: 'Q', name: 'Quetzal Guatemalteco' },
  { code: 'CRC', symbol: '₡', name: 'Colón Costarricense' },
  { code: 'NIO', symbol: 'C$', name: 'Córdoba Nicaragüense' },
  { code: 'PAB', symbol: 'B/.', name: 'Balboa Panameño' },
  { code: 'DOP', symbol: 'RD$', name: 'Peso Dominicano' },
  { code: 'HNL', symbol: 'L', name: 'Lempira Hondureño' },
  { code: 'SVC', symbol: '$', name: 'Colón Salvadoreño' },
  { code: 'GBP', symbol: '£', name: 'Libra Esterlina' },
  { code: 'CAD', symbol: 'C$', name: 'Dólar Canadiense' },
  { code: 'CHF', symbol: 'CHF', name: 'Franco Suizo' },
  { code: 'JPY', symbol: '¥', name: 'Yen Japonés' },
  { code: 'CNY', symbol: '¥', name: 'Yuan Chino' },
  { code: 'AUD', symbol: 'A$', name: 'Dólar Australiano' }
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
    logoUrl: '',
    storefrontImageUrl: '',
    logoPublicId: '',
    storefrontImagePublicId: '',
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
  
  // Estados para manejar la subida de imágenes
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingStorefront, setUploadingStorefront] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  
  // Estados para drag & drop feedback visual
  const [isDraggingOverLogo, setIsDraggingOverLogo] = useState(false)
  const [isDraggingOverStorefront, setIsDraggingOverStorefront] = useState(false)

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
            address: userStore.location?.address || userStore.address || '',
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
            logoUrl: userStore.logoUrl || userStore.logo || '', // Fallback to legacy field
            storefrontImageUrl: userStore.storefrontImageUrl || userStore.storePhoto || '', // Fallback to legacy field
            logoPublicId: userStore.logoPublicId || '',
            storefrontImagePublicId: userStore.storefrontImagePublicId || '',
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

  // Handler para subir logo
  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true)
    setUploadError(null)
    
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      // Usar la función de reemplazo que elimina la imagen anterior
      const result = await replaceImageInCloudinary(
        file, 
        { folder: 'logos', storeId: store?.id },
        formData.logoPublicId || undefined
      )
      
      // Actualizar tanto la URL como el public_id
      handleChange('logoUrl', result.secure_url)
      handleChange('logoPublicId', result.public_id)
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir imagen')
      console.error('Error uploading logo:', error)
    } finally {
      setUploadingLogo(false)
    }
  }

  // Handler para subir foto de tienda
  const handleStorefrontUpload = async (file: File) => {
    setUploadingStorefront(true)
    setUploadError(null)
    
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      // Usar la función de reemplazo que elimina la imagen anterior
      const result = await replaceImageInCloudinary(
        file, 
        { folder: 'store_photos', storeId: store?.id },
        formData.storefrontImagePublicId || undefined
      )
      
      // Actualizar tanto la URL como el public_id
      handleChange('storefrontImageUrl', result.secure_url)
      handleChange('storefrontImagePublicId', result.public_id)
      
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Error al subir imagen')
      console.error('Error uploading storefront image:', error)
    } finally {
      setUploadingStorefront(false)
    }
  }

  // Handlers para drag & drop del logo
  const handleLogoDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverLogo(true)
  }

  const handleLogoDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverLogo(false)
  }

  const handleLogoDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleLogoDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverLogo(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleLogoUpload(files[0])
    }
  }

  // Handlers para drag & drop de la foto de tienda
  const handleStorefrontDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverStorefront(true)
  }

  const handleStorefrontDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverStorefront(false)
  }

  const handleStorefrontDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleStorefrontDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOverStorefront(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleStorefrontUpload(files[0])
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
                  value={formData.location.address}
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
              {formData.location.lat !== 0 && formData.location.lng !== 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  ✓ Ubicación guardada
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
          
          {/* Mostrar errores si los hay */}
          {uploadError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{uploadError}</p>
                </div>
                <div className="ml-auto pl-3">
                  <button
                    onClick={() => setUploadError(null)}
                    className="text-red-400 hover:text-red-600"
                  >
                    <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sección de imágenes */}
          <div className="space-y-6">
            <h4 className="text-base font-medium text-gray-900">
              {t('branding.logo')} 
              {formData.hasPhysicalLocation && ` & ${t('branding.storePhoto')}`}
            </h4>
            <div className={`grid grid-cols-1 gap-6 ${formData.hasPhysicalLocation ? 'lg:grid-cols-2' : ''}`}>
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('branding.logo')}
                </label>
                <div className="relative">
                  {formData.logoUrl ? (
                    /* Vista previa del logo */
                    <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                      <img
                        src={formData.logoUrl}
                        alt="Logo preview"
                        className="w-full h-32 object-contain"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex space-x-2">
                          <label className="px-3 py-1 bg-white text-gray-700 text-xs rounded shadow hover:bg-gray-50 transition-colors cursor-pointer">
                            {t('branding.changeImage')}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleLogoUpload(file)
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              // Eliminar de Cloudinary si existe public_id
                              if (formData.logoPublicId) {
                                await deleteImageFromCloudinary(formData.logoPublicId)
                              }
                              // Limpiar el estado
                              handleChange('logoUrl', '')
                              handleChange('logoPublicId', '')
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded shadow hover:bg-red-600 transition-colors"
                          >
                            {t('branding.removeImage')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Área de subida */
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer group ${
                        isDraggingOverLogo 
                          ? 'border-gray-400 bg-gray-100 scale-105 shadow-lg' 
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                      }`}
                      onDragEnter={handleLogoDragEnter}
                      onDragLeave={handleLogoDragLeave}
                      onDragOver={handleLogoDragOver}
                      onDrop={handleLogoDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingLogo}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleLogoUpload(file)
                        }}
                      />
                      {uploadingLogo ? (
                        <div className="space-y-3">
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100">
                            <svg className="animate-spin h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            {t('branding.uploading')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-lg transition-colors ${
                            isDraggingOverLogo 
                              ? 'bg-gray-200' 
                              : 'bg-gray-200 group-hover:bg-gray-300'
                          }`}>
                            {isDraggingOverLogo ? (
                              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium transition-colors ${
                              isDraggingOverLogo 
                                ? 'text-gray-700' 
                                : 'text-gray-700 group-hover:text-gray-800'
                            }`}>
                              {isDraggingOverLogo ? '¡Suelta aquí tu logo!' : t('branding.logoUploadHint')}
                            </p>
                            <p className={`text-xs mt-1 transition-colors ${
                              isDraggingOverLogo 
                                ? 'text-gray-500' 
                                : 'text-gray-500'
                            }`}>
                              {t('branding.fileFormat')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  {t('branding.logoHint')}
                </p>
              </div>

              {/* Store Photo Upload - Solo mostrar si tiene ubicación física */}
              {formData.hasPhysicalLocation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('branding.storePhoto')} <span className="text-gray-400 text-xs">({t('branding.optional')})</span>
                  </label>
                <div className="relative">
                  {formData.storefrontImageUrl ? (
                    /* Vista previa de la foto de tienda */
                    <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                      <img
                        src={formData.storefrontImageUrl}
                        alt="Store photo preview"
                        className="w-full h-32 object-contain"
                      />
                      <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                        <div className="flex space-x-2">
                          <label className="px-3 py-1 bg-white text-gray-700 text-xs rounded shadow hover:bg-gray-50 transition-colors cursor-pointer">
                            {t('branding.changeImage')}
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={(e) => {
                                const file = e.target.files?.[0]
                                if (file) handleStorefrontUpload(file)
                              }}
                            />
                          </label>
                          <button
                            type="button"
                            onClick={async () => {
                              // Eliminar de Cloudinary si existe public_id
                              if (formData.storefrontImagePublicId) {
                                await deleteImageFromCloudinary(formData.storefrontImagePublicId)
                              }
                              // Limpiar el estado
                              handleChange('storefrontImageUrl', '')
                              handleChange('storefrontImagePublicId', '')
                            }}
                            className="px-3 py-1 bg-red-500 text-white text-xs rounded shadow hover:bg-red-600 transition-colors"
                          >
                            {t('branding.removeImage')}
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    /* Área de subida */
                    <div 
                      className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer group ${
                        isDraggingOverStorefront 
                          ? 'border-gray-400 bg-gray-100 scale-105 shadow-lg' 
                          : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                      }`}
                      onDragEnter={handleStorefrontDragEnter}
                      onDragLeave={handleStorefrontDragLeave}
                      onDragOver={handleStorefrontDragOver}
                      onDrop={handleStorefrontDrop}
                    >
                      <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={uploadingStorefront}
                        onChange={(e) => {
                          const file = e.target.files?.[0]
                          if (file) handleStorefrontUpload(file)
                        }}
                      />
                      {uploadingStorefront ? (
                        <div className="space-y-3">
                          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100">
                            <svg className="animate-spin h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                          </div>
                          <p className="text-sm font-medium text-gray-600">
                            {t('branding.uploading')}
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-lg transition-colors ${
                            isDraggingOverStorefront 
                              ? 'bg-gray-200' 
                              : 'bg-gray-200 group-hover:bg-gray-300'
                          }`}>
                            {isDraggingOverStorefront ? (
                              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                              </svg>
                            ) : (
                              <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2M7 7h.01M7 11h.01M7 15h.01" />
                              </svg>
                            )}
                          </div>
                          <div>
                            <p className={`text-sm font-medium transition-colors ${
                              isDraggingOverStorefront 
                                ? 'text-gray-700' 
                                : 'text-gray-700 group-hover:text-gray-800'
                            }`}>
                              {isDraggingOverStorefront ? '¡Suelta aquí la foto de tu tienda!' : t('branding.storePhotoUploadHint')}
                            </p>
                            <p className={`text-xs mt-1 transition-colors ${
                              isDraggingOverStorefront 
                                ? 'text-gray-500' 
                                : 'text-gray-500'
                            }`}>
                              {t('branding.fileFormat')}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
                                  <p className="mt-2 text-xs text-gray-500">
                    {t('branding.storePhotoHint')}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Sección de colores */}
          <div className="space-y-6">
            <h4 className="text-base font-medium text-gray-900">{t('branding.primaryColor')} & {t('branding.secondaryColor')}</h4>
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
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderSalesSection = () => (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('sales.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('sales.subtitle')}</p>
          </div>
          
          <div className="space-y-6">
                         <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">
                 {t('sales.currency')}
               </label>
               <select
                 value={formData.currency}
                 onChange={(e) => handleChange('currency', e.target.value)}
                 className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-white"
               >
                 {monedas.map(moneda => (
                   <option key={moneda.code} value={moneda.code}>
                     {moneda.symbol} {moneda.name}
                   </option>
                 ))}
               </select>
               <p className="mt-1 text-xs text-gray-500">
                 {t('sales.currencyHint')}
               </p>
             </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('sales.checkoutMethod')}
              </label>
              <div className="space-y-3">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="whatsapp-sales"
                      name="checkout-method"
                      type="radio"
                      checked={true}
                      readOnly
                      className="focus:ring-gray-600 h-4 w-4 text-gray-800 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="whatsapp-sales" className="font-medium text-gray-700">
                      {t('sales.whatsappSales')}
                    </label>
                    <p className="text-gray-500">{t('sales.whatsappSalesDescription')}</p>
                  </div>
                </div>
                
                <div className="relative flex items-start opacity-50">
                  <div className="flex items-center h-5">
                    <input
                      id="traditional-checkout"
                      name="checkout-method"
                      type="radio"
                      disabled
                      className="focus:ring-gray-600 h-4 w-4 text-gray-800 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="traditional-checkout" className="font-medium text-gray-700">
                      {t('sales.traditionalCheckout')}
                    </label>
                    <p className="text-gray-500">{t('sales.traditionalCheckoutDescription')}</p>
                  </div>
                </div>
              </div>
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
      case 'sales':
        return renderSalesSection()
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
        </div>
      </div>
    </DashboardLayout>
  )
} 