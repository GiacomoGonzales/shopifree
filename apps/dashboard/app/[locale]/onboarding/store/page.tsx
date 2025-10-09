'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../lib/simple-auth-context'
import { createStore, checkSubdomainAvailability } from '../../../../lib/store'
import { useTranslations } from 'next-intl'
import AuthGuard from '../../../../components/AuthGuard'
import { uploadImageToCloudinary, validateImageFile } from '../../../../lib/cloudinary'
import { brandColors } from '@shopifree/ui'
import { googleMapsLoader } from '../../../../lib/google-maps'

interface StoreFormData {
  storeName: string
  subdomain: string
  slogan: string
  description: string
  hasPhysicalLocation: boolean
  address: string
  location: {
    address: string
    lat: number
    lng: number
  }
  businessType: string
  countryCode: string
  localPhone: string
  logoFile: File | null
  storePhotoFile: File | null
  logoUrl: string
  logoPublicId: string
  storefrontImageUrl: string
  storefrontImagePublicId: string
  primaryColor: string
  secondaryColor: string
  currency: string
  socialMedia: {
    facebook: string
    instagram: string
    tiktok: string
    x: string
    snapchat: string
    linkedin: string
    telegram: string
    youtube: string
    pinterest: string
  }
}

const countryCodes = [
  { code: '+1', country: 'Estados Unidos / Canadá', flag: '🇺🇸' },
  { code: '+52', country: 'México', flag: '🇲🇽' },
  { code: '+34', country: 'España', flag: '🇪🇸' },
  { code: '+54', country: 'Argentina', flag: '🇦🇷' },
  { code: '+57', country: 'Colombia', flag: '🇨🇴' },
  { code: '+51', country: 'Perú', flag: '🇵🇪' },
  { code: '+56', country: 'Chile', flag: '🇨🇱' },
  { code: '+58', country: 'Venezuela', flag: '🇻🇪' },
  { code: '+593', country: 'Ecuador', flag: '🇪🇨' },
  { code: '+591', country: 'Bolivia', flag: '🇧🇴' },
  { code: '+595', country: 'Paraguay', flag: '🇵🇾' },
  { code: '+598', country: 'Uruguay', flag: '🇺🇾' },
  { code: '+55', country: 'Brasil', flag: '🇧🇷' },
  { code: '+33', country: 'Francia', flag: '🇫🇷' },
  { code: '+49', country: 'Alemania', flag: '🇩🇪' },
  { code: '+39', country: 'Italia', flag: '🇮🇹' },
  { code: '+44', country: 'Reino Unido', flag: '🇬🇧' },
  { code: '+351', country: 'Portugal', flag: '🇵🇹' },
  { code: '+31', country: 'Países Bajos', flag: '🇳🇱' },
  { code: '+41', country: 'Suiza', flag: '🇨🇭' },
  { code: '+43', country: 'Austria', flag: '🇦🇹' },
  { code: '+32', country: 'Bélgica', flag: '🇧🇪' },
  { code: '+45', country: 'Dinamarca', flag: '🇩🇰' },
  { code: '+46', country: 'Suecia', flag: '🇸🇪' },
  { code: '+47', country: 'Noruega', flag: '🇳🇴' },
  { code: '+358', country: 'Finlandia', flag: '🇫🇮' }
]

const businessTypes = [
  { value: 'fashion' },
  { value: 'technology' },
  { value: 'health' },
  { value: 'food' },
  { value: 'restaurant' },
  { value: 'home' },
  { value: 'sports' },
  { value: 'education' },
  { value: 'toys' },
  { value: 'pets' },
  { value: 'service' },
  { value: 'wholesale' },
  { value: 'retail' },
  { value: 'handcrafts' },
  { value: 'eco' },
  { value: 'other' }
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

const getCreationSteps = (t: (key: string) => string) => [
  { text: 'basicInfo', progress: 33 },
  { text: 'contact', progress: 66 },
  { text: 'branding', progress: 100 }
]

function StoreOnboardingContent() {
  const t = useTranslations('onboarding.store')
  const router = useRouter()
  const { user } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 3
  
  const [formData, setFormData] = useState<StoreFormData>({
    storeName: '',
    subdomain: '',
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
    countryCode: '+52', // México por defecto
    localPhone: '',
    logoFile: null,
    storePhotoFile: null,
    logoUrl: '',
    logoPublicId: '',
    storefrontImageUrl: '',
    storefrontImagePublicId: '',
    primaryColor: brandColors.primary,
    secondaryColor: brandColors.secondary,
    currency: 'USD',
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
  
  const [creatingStore, setCreatingStore] = useState(false)
  const [creationStep, setCreationStep] = useState(0)
  const [creationProgress, setCreationProgress] = useState(0)
  const [isRedirecting, setIsRedirecting] = useState(false)
  const [errors, setErrors] = useState<Partial<Record<keyof StoreFormData, string>>>({})
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')
  const [autocompleteRef, setAutocompleteRef] = useState<HTMLInputElement | null>(null)
  const [isGoogleMapsLoaded, setIsGoogleMapsLoaded] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [uploadingStorefront, setUploadingStorefront] = useState(false)

  // Validación de subdominio simplificada (sin estado de loading)
  const validateSubdomain = useCallback(async (subdomain: string) => {
    if (!subdomain) return

    try {
      const result = await checkSubdomainAvailability(subdomain)
      if (result) {
        setSubdomainStatus('available')
        setErrors(prev => ({ ...prev, subdomain: undefined }))
      } else {
        setSubdomainStatus('unavailable')
        setErrors(prev => ({ ...prev, subdomain: t('steps.info.fields.subdomain.errorTaken') }))
      }
    } catch (error) {
      console.error('Error checking subdomain:', error)
      setSubdomainStatus('unavailable')
      setErrors(prev => ({ ...prev, subdomain: t('steps.info.fields.subdomain.errorCheck') }))
    }
  }, [t])

  useEffect(() => {
    if (formData.subdomain && currentStep === 1) {
      setSubdomainStatus('checking')
      const timer = setTimeout(() => {
        validateSubdomain(formData.subdomain)
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [formData.subdomain, currentStep, validateSubdomain])

  // Cargar Google Maps API usando el loader centralizado
  useEffect(() => {
    if (formData.hasPhysicalLocation && currentStep === 2) {
      googleMapsLoader.load()
        .then(() => {
          console.log('Google Maps loaded for StoreOnboarding')
          setIsGoogleMapsLoaded(true)
        })
        .catch((error: Error) => {
          console.error('Error loading Google Maps:', error)
        })
    }
  }, [formData.hasPhysicalLocation, currentStep])

  // Configurar el autocompletado cuando Google Maps esté cargado y el input esté disponible
  useEffect(() => {
    if (isGoogleMapsLoaded && autocompleteRef && formData.hasPhysicalLocation && currentStep === 2) {
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

            // Actualizar la dirección y coordenadas en la nueva estructura
            setFormData(prev => ({
              ...prev,
              address: address,
              location: {
                address: address,
                lat: lat,
                lng: lng
              }
            }))
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
  }, [isGoogleMapsLoaded, autocompleteRef, formData.hasPhysicalLocation, currentStep])

  // Validar paso actual
  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<Record<keyof StoreFormData, string>> = {}
    
    switch (currentStep) {
      case 1: // Información de la tienda
        if (!formData.storeName.trim()) {
          newErrors.storeName = t('steps.info.fields.storeName.error')
        }
        if (!formData.subdomain.trim()) {
          newErrors.subdomain = t('steps.info.fields.subdomain.error')
        } else if (subdomainStatus !== 'available') {
          newErrors.subdomain = t('steps.info.fields.subdomain.errorNotAvailable')
        }
        if (!formData.businessType) {
          newErrors.businessType = t('steps.info.fields.businessType.error')
        }
        if (!formData.slogan.trim()) {
          newErrors.slogan = t('steps.info.fields.slogan.error')
        }
        if (!formData.description.trim()) {
          newErrors.description = t('steps.info.fields.description.error')
        }
        break
        
      case 2: // Datos de contacto
        if (!formData.currency) {
          newErrors.currency = t('steps.contact.fields.currency.error')
        }
        if (formData.hasPhysicalLocation && !formData.address.trim()) {
          newErrors.address = t('steps.contact.fields.address.error')
        }
        if (!formData.localPhone.trim()) {
          newErrors.localPhone = t('steps.contact.fields.phone.error')
        } else if (!/^[\d\s-()]+$/.test(formData.localPhone)) {
          newErrors.localPhone = t('steps.contact.fields.phone.errorInvalid')
        }
        break
        
      case 3: // Branding
        // Los colores son obligatorios pero ya tienen valores por defecto
        break
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateCurrentStep() && currentStep < totalSteps) {
      setCurrentStep(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(prev => prev - 1)
      setErrors({}) // Limpiar errores al retroceder
    }
  }

  const handleInputChange = (field: keyof StoreFormData, value: string | boolean | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleRedesChange = (platform: keyof StoreFormData['socialMedia'], value: string) => {
    setFormData(prev => ({
      ...prev,
      socialMedia: { ...prev.socialMedia, [platform]: value }
    }))
  }

  const handleFileChange = (field: 'logoFile' | 'storePhotoFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  // Función para subir logo a Cloudinary
  const handleLogoUpload = async (file: File) => {
    setUploadingLogo(true)
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      const result = await uploadImageToCloudinary(file, {
        folder: 'logos',
        storeId: 'temp' // Usamos 'temp' hasta que se cree la tienda
      })
      
      setFormData(prev => ({
        ...prev,
        logoUrl: result.secure_url,
        logoPublicId: result.public_id
      }))
      
    } catch (error) {
      console.error('Error uploading logo:', error)
      alert('Error al subir logo')
    } finally {
      setUploadingLogo(false)
    }
  }

  // Función para subir foto de tienda a Cloudinary
  const handleStorefrontUpload = async (file: File) => {
    setUploadingStorefront(true)
    try {
      const validation = validateImageFile(file)
      if (!validation.isValid) {
        throw new Error(validation.error)
      }
      
      const result = await uploadImageToCloudinary(file, {
        folder: 'hero',
        storeId: 'temp' // Usamos 'temp' hasta que se cree la tienda
      })
      
      setFormData(prev => ({
        ...prev,
        storefrontImageUrl: result.secure_url,
        storefrontImagePublicId: result.public_id
      }))
      
    } catch (error) {
      console.error('Error uploading storefront image:', error)
      alert('Error al subir imagen de tienda')
    } finally {
      setUploadingStorefront(false)
    }
  }

  const handleCreateStore = async () => {
    if (!validateCurrentStep() || !user?.uid) return
    
    setCreatingStore(true)
    setCreationStep(0)
    setCreationProgress(0)
    
    try {
      // Simular cada paso de creación con progreso
      const creationSteps = getCreationSteps(t)
      for (let i = 0; i < creationSteps.length; i++) {
        setCreationStep(i)
        setCreationProgress(creationSteps[i].progress)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Combinar código de país con teléfono local
      const phoneCompleto = `${formData.countryCode}${formData.localPhone}`
      
      const storeData = {
        storeName: formData.storeName,
        subdomain: formData.subdomain,
        slogan: formData.slogan,
        description: formData.description,
        hasPhysicalLocation: formData.hasPhysicalLocation,
        // Solo incluir location si hay coordenadas, sino usar address legacy
        ...(formData.location.lat !== 0 && formData.location.lng !== 0
          ? { location: formData.location }
          : { address: formData.address }
        ),
        businessType: formData.businessType,
        // Determinar tema basado en el tipo de negocio
        theme: (formData.businessType === 'restaurant' || formData.businessType === 'food')
          ? 'restaurant'
          : 'new-base-default',
        phone: phoneCompleto,
        primaryColor: formData.primaryColor,
        secondaryColor: formData.secondaryColor,
        currency: formData.currency,
        language: 'es', // Mantener el valor por defecto
        // Usar los campos de Cloudinary si existen, sino usar los legacy para compatibilidad
        logoUrl: formData.logoUrl,
        logoPublicId: formData.logoPublicId,
        // Hero image - usar los mismos campos que store-design
        heroMediaUrl: formData.storefrontImageUrl,
        heroMediaPublicId: formData.storefrontImagePublicId,
        heroMediaType: formData.storefrontImageUrl ? 'image' : null,
        // Mantener campos legacy para compatibilidad
        logo: formData.logoUrl || '',
        storePhoto: formData.storefrontImageUrl || '',
        heroImageUrl: formData.storefrontImageUrl || '',
        heroImagePublicId: formData.storefrontImagePublicId || '',
        socialMedia: formData.socialMedia,
        // Configuración de pagos por defecto
        advanced: {
          payments: {
            acceptCashOnDelivery: true,
            cashOnDeliveryMethods: ['cash', 'card'],
            acceptOnlinePayment: false
          }
        },
        ownerId: user.uid
      }
      
      await createStore(storeData)
      
      // Pausa final antes de redireccionar
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setIsRedirecting(true)
      router.push('/')
    } catch (error) {
      console.error('Error creating store:', error)
      alert(t('errors.createError'))
      setCreatingStore(false)
      setCreationStep(0)
      setCreationProgress(0)
    }
  }

  // En el modal de creación o redirección
  if (creatingStore || isRedirecting) {
    const isComplete = creationProgress === 100
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-12 px-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center transition-all duration-500 ${
            isComplete ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            {isComplete ? (
              <svg className="w-8 h-8 text-green-600 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-8 h-8 text-gray-800 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {isRedirecting 
              ? t('progress.redirecting')
              : (isComplete 
                ? t('success.title')
                : t('progress.creating')
              )
            }
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isRedirecting 
              ? t('progress.redirectingMessage')
              : (isComplete 
                ? t('success.message')
                : t(`progress.steps.${getCreationSteps(t)[creationStep]?.text}`) || t('progress.creatingMessage')
              )
            }
          </p>
          
          {/* Barra de progreso */}
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div 
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${
                isComplete ? 'bg-green-500' : 'bg-gray-800'
              }`}
              style={{ width: `${creationProgress}%` }}
            ></div>
          </div>
          
          <div className="text-sm text-gray-500">
            {isComplete 
              ? t('success.completed')
              : t('progress.completed', { count: creationProgress })
            }
          </div>
        </div>
      </div>
    )
  }

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1: // Información de la tienda
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('steps.info.fields.storeName.label')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleInputChange('storeName', e.target.value)}
                placeholder={t('steps.info.fields.storeName.placeholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.storeName ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.storeName && <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('steps.info.fields.businessType.label')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.businessType}
                onChange={(e) => handleInputChange('businessType', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.businessType ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t('steps.info.fields.businessType.placeholder')}</option>
                {businessTypes.map(tipo => (
                  <option key={tipo.value} value={tipo.value}>
                    {t(`steps.info.fields.businessType.options.${tipo.value}`)}
                  </option>
                ))}
              </select>
              {errors.businessType && <p className="text-red-500 text-sm mt-1">{errors.businessType}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('steps.info.fields.subdomain.label')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.subdomain}
                  onChange={(e) => handleInputChange('subdomain', e.target.value.toLowerCase())}
                  placeholder={t('steps.info.fields.subdomain.placeholder')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                    errors.subdomain ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {subdomainStatus === 'checking' && (
                  <div className="absolute right-3 top-3.5">
                    <svg className="w-5 h-5 text-blue-500 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </div>
                )}
                {subdomainStatus === 'available' && (
                  <div className="absolute right-3 top-3.5">
                    <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                )}
              </div>
              {formData.subdomain && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('steps.info.fields.subdomain.hint')}: <strong>{formData.subdomain}.shopifree.app</strong>
                </p>
              )}
              {errors.subdomain && <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('steps.info.fields.slogan.label')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                placeholder={t('steps.info.fields.slogan.placeholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.slogan ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.slogan && <p className="text-red-500 text-sm mt-1">{errors.slogan}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('steps.info.fields.description.label')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder={t('steps.info.fields.description.placeholder')}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.description ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>
          </div>
        )

      case 2: // Datos de contacto
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('steps.contact.fields.currency.label')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleInputChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
              >
                {monedas.map(moneda => (
                  <option key={moneda.code} value={moneda.code}>
                    {moneda.symbol} {moneda.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.hasPhysicalLocation}
                  onChange={(e) => handleInputChange('hasPhysicalLocation', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{t('steps.contact.fields.hasPhysicalLocation.label')}</span>
              </label>
            </div>

            {formData.hasPhysicalLocation && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('steps.contact.fields.address.label')} <span className="text-red-500">*</span>
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
                    placeholder={isGoogleMapsLoaded ? t('steps.contact.fields.address.hint') : t('steps.contact.fields.address.placeholder')}
                    className={`w-full px-3 py-2 pr-10 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                      errors.address ? 'border-red-500' : 'border-gray-300'
                    }`}
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
                    ✓ {t('steps.contact.fields.address.locationSaved')}
                  </p>
                )}
                {errors.address && <p className="text-red-500 text-sm mt-1">{errors.address}</p>}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('steps.contact.fields.phone.label')} <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select
                  value={formData.countryCode}
                  onChange={(e) => handleInputChange('countryCode', e.target.value)}
                  className="w-24 px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white text-sm"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.localPhone}
                  onChange={(e) => handleInputChange('localPhone', e.target.value)}
                  placeholder={t('steps.contact.fields.phone.placeholder')}
                  className={`flex-1 min-w-0 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                    errors.localPhone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.localPhone && <p className="text-red-500 text-sm mt-1">{errors.localPhone}</p>}
              <p className="text-xs text-gray-500 mt-1 break-words">
                {t('steps.contact.fields.phone.hint')}
              </p>
            </div>
          </div>
        )

      case 3: // Branding
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('steps.branding.fields.logo.label')} <span className="text-red-500">*</span>
                </label>
                <div className="relative flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer group h-full flex flex-col justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null
                        handleFileChange('logoFile', file)
                        if (file) {
                          await handleLogoUpload(file)
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.logoFile ? (
                      <div className="relative w-full h-full min-h-[200px] flex flex-col">
                        <div className="flex-1 flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(formData.logoFile)}
                            alt="Preview del logo"
                            className="max-w-full max-h-[160px] object-contain rounded-lg"
                          />
                        </div>
                        {uploadingLogo && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="text-white text-center">
                              <svg className="w-8 h-8 animate-spin mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <p className="text-xs">Subiendo...</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 text-center">
                          <span className="text-xs text-gray-600 font-medium">{formData.logoFile.name}</span>
                          {formData.logoUrl && (
                            <div className="flex items-center justify-center mt-1">
                              <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs text-green-600">Subido</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileChange('logoFile', null)
                            setFormData(prev => ({
                              ...prev,
                              logoUrl: '',
                              logoPublicId: ''
                            }))
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg className="w-12 h-12 text-gray-400 mx-auto group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-gray-700 group-hover:text-gray-800">{t('steps.branding.fields.logo.uploadHint')}</span>
                        </div>
                        <p className="text-xs text-gray-500">{t('actions.fileFormat')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Hero Image Upload */}
              <div className="flex flex-col h-full">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  {t('steps.branding.fields.storePhoto.label')} <span className="text-red-500">*</span>
                </label>
                <div className="relative flex-1">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer group h-full flex flex-col justify-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0] || null
                        handleFileChange('storePhotoFile', file)
                        if (file) {
                          await handleStorefrontUpload(file)
                        }
                      }}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.storePhotoFile ? (
                      <div className="relative w-full h-full min-h-[200px] flex flex-col">
                        <div className="flex-1 flex items-center justify-center">
                          <img
                            src={URL.createObjectURL(formData.storePhotoFile)}
                            alt="Preview de la imagen de portada"
                            className="max-w-full max-h-[160px] object-cover rounded-lg"
                          />
                        </div>
                        {uploadingStorefront && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded-lg">
                            <div className="text-white text-center">
                              <svg className="w-8 h-8 animate-spin mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                              </svg>
                              <p className="text-xs">Subiendo...</p>
                            </div>
                          </div>
                        )}
                        <div className="mt-2 text-center">
                          <span className="text-xs text-gray-600 font-medium">{formData.storePhotoFile.name}</span>
                          {formData.storefrontImageUrl && (
                            <div className="flex items-center justify-center mt-1">
                              <svg className="w-3 h-3 text-green-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              <span className="text-xs text-green-600">Subido</span>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileChange('storePhotoFile', null)
                            setFormData(prev => ({
                              ...prev,
                              storefrontImageUrl: '',
                              storefrontImagePublicId: ''
                            }))
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <svg className="w-12 h-12 text-gray-400 mx-auto group-hover:text-gray-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <div className="text-sm text-gray-600">
                          <span className="font-medium text-gray-700 group-hover:text-gray-800">{t('steps.branding.fields.storePhoto.uploadHint')}</span>
                        </div>
                        <p className="text-xs text-gray-500">{t('actions.fileFormat')}</p>
                        <p className="text-xs text-gray-500">{t('steps.branding.fields.storePhoto.hint')}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Color Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">{t('steps.branding.fields.colors.title')}</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('steps.branding.fields.colors.primary')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="color"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors appearance-none"
                        style={{ backgroundColor: formData.primaryColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.primaryColor}
                        onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                        placeholder={brandColors.primary}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    {t('steps.branding.fields.colors.secondary')} <span className="text-red-500">*</span>
                  </label>
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <input
                        type="color"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors appearance-none"
                        style={{ backgroundColor: formData.secondaryColor }}
                      />
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.secondaryColor}
                        onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                        placeholder={brandColors.secondary}
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-3 sm:px-6 lg:px-8">
      <div className="max-w-sm sm:max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow-xl p-4 sm:p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="mx-auto w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-6 h-6 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-4m-5 0H3m2 0h4M9 7h6m-6 4h6m-2 4h2M7 7h.01M7 11h.01M7 15h.01" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
            <p className="text-gray-600 mt-2">{t('navigation.stepOf', { current: currentStep, total: totalSteps })}</p>
            
            {/* Barra de progreso minimalista */}
            <div className="mt-4 w-full bg-gray-200 rounded-full h-1">
              <div 
                className="bg-gray-800 h-1 rounded-full transition-all duration-300 ease-in-out"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
          </div>

          <form className="space-y-6">
            {renderCurrentStep()}
            
            {/* Botones de navegación */}
            <div className="flex justify-between pt-4 sm:pt-6">
              <button
                type="button"
                onClick={handlePrevious}
                disabled={currentStep === 1}
                className="px-4 sm:px-6 py-2 text-gray-600 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
              >
                {t('navigation.previous')}
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 sm:px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base"
                >
                  {t('navigation.next')}
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateStore}
                  className="px-4 sm:px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base"
                >
                  {t('actions.createStore')}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function StoreOnboardingPage() {
  return (
    <AuthGuard>
      <StoreOnboardingContent />
    </AuthGuard>
  )
} 