'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '../../../../lib/simple-auth-context'
import { createStore, checkSubdomainAvailability, validateSubdomain } from '../../../../lib/store'
import { useTranslations } from 'next-intl'
import AuthGuard from '../../../../components/AuthGuard'

interface StoreFormData {
  nombreTienda: string
  subdominio: string
  slogan: string
  descripcion: string
  tieneLocalFisico: boolean
  direccion: string
  tipoComercio: string
  codigoPaisTienda: string
  telefonoLocalTienda: string
  logoFile: File | null
  fotoLocalFile: File | null
  colorPrimario: string
  colorSecundario: string
  moneda: string
  redes: {
    facebook: string
    instagram: string
    tiktok: string
    x: string
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

const tiposComercio = [
  'Minimarket y Tienda de Conveniencia',
  'Supermercado y Abarrotes',
  'Moda y Accesorios',
  'Tecnología y Electrónicos',
  'Hogar y Decoración',
  'Salud y Belleza',
  'Productos Naturales y Orgánicos',
  'Farmacia y Medicamentos',
  'Deportes, Fitness y Suplementos',
  'Comida y Bebidas',
  'Panadería y Repostería',
  'Restaurante y Comida Rápida',
  'Entretenimiento y Cultura',
  'Librería y Papelería',
  'Mascotas y Animales',
  'Automotriz',
  'Ferretería y Construcción',
  'Servicios Profesionales',
  'Servicios Personales',
  'Educación y Capacitación',
  'Salud y Bienestar',
  'Inmobiliaria',
  'Turismo y Viajes',
  'Agricultura y Ganadería',
  'Manufactura e Industria',
  'Servicios Financieros',
  'Logística y Transporte',
  'Energía y Medio Ambiente',
  'ONGs y Fundaciones',
  'Otro'
]

const monedas = [
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' },
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

const creationSteps = [
  { text: 'Configurando información básica...', progress: 20 },
  { text: 'Aplicando colores y branding...', progress: 40 },
  { text: 'Configurando métodos de pago...', progress: 60 },
  { text: 'Estableciendo redes sociales...', progress: 80 },
  { text: '¡Tienda creada exitosamente!', progress: 100 }
]

function StoreOnboardingContent() {
  const t = useTranslations('onboarding.store')
  const router = useRouter()
  const { user } = useAuth()
  
  const [currentStep, setCurrentStep] = useState(1)
  const totalSteps = 5
  
  const [formData, setFormData] = useState<StoreFormData>({
    nombreTienda: '',
    subdominio: '',
    slogan: '',
    descripcion: '',
    tieneLocalFisico: false,
    direccion: '',
    tipoComercio: '',
    codigoPaisTienda: '+52', // México por defecto
    telefonoLocalTienda: '',
    logoFile: null,
    fotoLocalFile: null,
    colorPrimario: '#3B82F6',
    colorSecundario: '#1F2937',
    moneda: 'USD',
    redes: {
      facebook: '',
      instagram: '',
      tiktok: '',
      x: ''
    }
  })
  
  const [creatingStore, setCreatingStore] = useState(false)
  const [creationStep, setCreationStep] = useState(0)
  const [creationProgress, setCreationProgress] = useState(0)
  const [errors, setErrors] = useState<Partial<Record<keyof StoreFormData, string>>>({})
  const [subdomainStatus, setSubdomainStatus] = useState<'idle' | 'checking' | 'available' | 'unavailable'>('idle')

  // Validación de subdominio en tiempo real
  const checkSubdomain = async (subdomain: string) => {
    if (!subdomain) {
      setSubdomainStatus('idle')
      return
    }
    
    const validation = validateSubdomain(subdomain)
    if (!validation.isValid) {
      setErrors(prev => ({ ...prev, subdominio: validation.error }))
      setSubdomainStatus('unavailable')
      return
    }
    
    setSubdomainStatus('checking')
    try {
      const isAvailable = await checkSubdomainAvailability(subdomain)
      setSubdomainStatus(isAvailable ? 'available' : 'unavailable')
      if (!isAvailable) {
        setErrors(prev => ({ ...prev, subdominio: t('errors.subdomainTaken') }))
      } else {
        setErrors(prev => ({ ...prev, subdominio: undefined }))
      }
    } catch (error) {
      setSubdomainStatus('unavailable')
      setErrors(prev => ({ ...prev, subdominio: t('errors.subdomainCheckError') }))
    }
  }

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.subdominio && currentStep === 1) {
        checkSubdomain(formData.subdominio)
      }
    }, 500)
    
    return () => clearTimeout(timeoutId)
  }, [formData.subdominio, currentStep])

  // Validar paso actual
  const validateCurrentStep = (): boolean => {
    const newErrors: Partial<Record<keyof StoreFormData, string>> = {}
    
    switch (currentStep) {
      case 1:
        if (!formData.nombreTienda.trim()) {
          newErrors.nombreTienda = t('errors.nombreTiendaRequired')
        }
        if (!formData.subdominio.trim()) {
          newErrors.subdominio = t('errors.subdomainRequired')
        } else if (subdomainStatus !== 'available') {
          newErrors.subdominio = t('errors.subdomainNotAvailable')
        }
        break
        
      case 2:
        if (!formData.descripcion.trim()) {
          newErrors.descripcion = t('errors.descripcionRequired')
        }
        if (formData.tieneLocalFisico && !formData.direccion.trim()) {
          newErrors.direccion = t('errors.direccionRequired')
        }
        break
        
      case 3:
        if (!formData.tipoComercio) {
          newErrors.tipoComercio = t('errors.tipoComercioRequired')
        }
        if (!formData.telefonoLocalTienda.trim()) {
          newErrors.telefonoLocalTienda = t('errors.telefonoTiendaRequired')
        } else if (!/^[\d\s-()]+$/.test(formData.telefonoLocalTienda)) {
          newErrors.telefonoLocalTienda = t('errors.telefonoInvalid')
        }
        break
        
      case 4:
        // Colores son obligatorios, pero ya tienen valores por defecto
        break
        
      case 5:
        // Moneda es obligatoria, pero ya tiene valor por defecto
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

  const handleInputChange = (field: keyof StoreFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleRedesChange = (platform: keyof StoreFormData['redes'], value: string) => {
    setFormData(prev => ({
      ...prev,
      redes: { ...prev.redes, [platform]: value }
    }))
  }

  const handleFileChange = (field: 'logoFile' | 'fotoLocalFile', file: File | null) => {
    setFormData(prev => ({ ...prev, [field]: file }))
  }

  const handleCreateStore = async () => {
    if (!validateCurrentStep() || !user?.uid) return
    
    setCreatingStore(true)
    setCreationStep(0)
    setCreationProgress(0)
    
    try {
      // Simular cada paso de creación con progreso
      for (let i = 0; i < creationSteps.length; i++) {
        setCreationStep(i)
        setCreationProgress(creationSteps[i].progress)
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
      
      // Simular carga de archivos (en producción usarías Firebase Storage)
      const logoURL = formData.logoFile ? 'https://placeholder-logo.jpg' : ''
      const fotoLocalURL = formData.fotoLocalFile ? 'https://placeholder-foto.jpg' : ''
      
      // Combinar código de país con teléfono local
      const telefonoCompleto = `${formData.codigoPaisTienda}${formData.telefonoLocalTienda}`
      
      const storeData = {
        storeName: formData.nombreTienda,
        subdomain: formData.subdominio,
        slogan: formData.slogan,
        description: formData.descripcion,
        hasPhysicalLocation: formData.tieneLocalFisico,
        address: formData.direccion,
        tipoComercio: formData.tipoComercio,
        phone: telefonoCompleto,
        primaryColor: formData.colorPrimario,
        secondaryColor: formData.colorSecundario,
        currency: formData.moneda,
        logo: logoURL,
        fotoLocal: fotoLocalURL,
        redes: formData.redes,
        ownerId: user.uid
      }
      
      await createStore(storeData)
      
      // Pausa final antes de redireccionar
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      router.push('/')
    } catch (error) {
      console.error('Error creating store:', error)
      alert(t('errors.createError'))
    } finally {
      setCreatingStore(false)
      setCreationStep(0)
      setCreationProgress(0)
    }
  }

  // Modal de creación
  if (creatingStore) {
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
            {isComplete ? '¡Tienda Creada!' : 'Creando tu tienda...'}
          </h2>
          
          <p className="text-gray-600 mb-6">
            {isComplete 
              ? 'Tu tienda está lista para recibir clientes'
              : creationSteps[creationStep]?.text || 'Iniciando configuración...'
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
            {creationProgress}% completado
          </div>
        </div>
      </div>
    )
  }

  // Renderizar paso actual
  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('nombreTienda')} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.nombreTienda}
                onChange={(e) => handleInputChange('nombreTienda', e.target.value)}
                placeholder={t('nombreTiendaPlaceholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.nombreTienda ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.nombreTienda && <p className="text-red-500 text-sm mt-1">{errors.nombreTienda}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('subdominio')} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.subdominio}
                  onChange={(e) => handleInputChange('subdominio', e.target.value.toLowerCase())}
                  placeholder={t('subdomainPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                    errors.subdominio ? 'border-red-500' : 'border-gray-300'
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
              {formData.subdominio && (
                <p className="text-xs text-gray-500 mt-1">
                  {t('subdomainHint')}: <strong>{formData.subdominio}.shopifree.app</strong>
                </p>
              )}
              {errors.subdominio && <p className="text-red-500 text-sm mt-1">{errors.subdominio}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('slogan')} <span className="text-gray-400 text-xs">(opcional)</span>
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => handleInputChange('slogan', e.target.value)}
                placeholder={t('sloganPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
              />
            </div>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('descripcion')} <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => handleInputChange('descripcion', e.target.value)}
                placeholder={t('descripcionPlaceholder')}
                rows={4}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.descripcion ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.descripcion && <p className="text-red-500 text-sm mt-1">{errors.descripcion}</p>}
            </div>

            <div>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.tieneLocalFisico}
                  onChange={(e) => handleInputChange('tieneLocalFisico', e.target.checked)}
                  className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-medium text-gray-700">{t('tieneLocalFisico')}</span>
              </label>
            </div>

            {formData.tieneLocalFisico && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('direccion')} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => handleInputChange('direccion', e.target.value)}
                  placeholder={t('direccionPlaceholder')}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                    errors.direccion ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.direccion && <p className="text-red-500 text-sm mt-1">{errors.direccion}</p>}
              </div>
            )}
          </div>
        )

      case 3:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('tipoComercio')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.tipoComercio}
                onChange={(e) => handleInputChange('tipoComercio', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 ${
                  errors.tipoComercio ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">{t('tipoComercioPlaceholder')}</option>
                {tiposComercio.map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
              {errors.tipoComercio && <p className="text-red-500 text-sm mt-1">{errors.tipoComercio}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('telefonoTienda')} <span className="text-red-500">*</span>
              </label>
              <div className="flex space-x-1 sm:space-x-2">
                <select
                  value={formData.codigoPaisTienda}
                  onChange={(e) => handleInputChange('codigoPaisTienda', e.target.value)}
                  className="w-20 sm:w-24 px-1 sm:px-2 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 bg-white text-xs sm:text-sm"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={formData.telefonoLocalTienda}
                  onChange={(e) => handleInputChange('telefonoLocalTienda', e.target.value)}
                  placeholder="1234567890"
                  className={`flex-1 px-2 sm:px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 text-xs sm:text-sm ${
                    errors.telefonoLocalTienda ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              </div>
              {errors.telefonoLocalTienda && <p className="text-red-500 text-sm mt-1">{errors.telefonoLocalTienda}</p>}
              <p className="text-xs text-gray-500 mt-1 break-words">
                Ingresa solo el número local (sin código de país)
              </p>
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Logo <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('logoFile', e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.logoFile ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(formData.logoFile)}
                          alt="Preview del logo"
                          className="w-full h-32 object-contain rounded-lg"
                        />
                        <div className="mt-2 text-center">
                          <span className="text-xs text-gray-600 font-medium">{formData.logoFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileChange('logoFile', null)
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
                          <span className="font-medium text-gray-700 group-hover:text-gray-800">Haz clic para subir</span> o arrastra aquí
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Store Photo Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Foto de la tienda <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <div className="relative">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange('fotoLocalFile', e.target.files?.[0] || null)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    {formData.fotoLocalFile ? (
                      <div className="relative w-full h-full">
                        <img
                          src={URL.createObjectURL(formData.fotoLocalFile)}
                          alt="Preview de la foto de tienda"
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <div className="mt-2 text-center">
                          <span className="text-xs text-gray-600 font-medium">{formData.fotoLocalFile.name}</span>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleFileChange('fotoLocalFile', null)
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
                          <span className="font-medium text-gray-700 group-hover:text-gray-800">Haz clic para subir</span> o arrastra aquí
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG hasta 5MB</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Color Section */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900">Colores de tu marca</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color Primario <span className="text-red-500">*</span>
                  </label>
                                     <div className="flex items-center space-x-4">
                     <div className="relative">
                       <input
                         type="color"
                         value={formData.colorPrimario}
                         onChange={(e) => handleInputChange('colorPrimario', e.target.value)}
                         className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors appearance-none"
                         style={{ backgroundColor: formData.colorPrimario }}
                       />
                     </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.colorPrimario}
                        onChange={(e) => handleInputChange('colorPrimario', e.target.value)}
                        placeholder="#3B82F6"
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">
                    Color Secundario <span className="text-red-500">*</span>
                  </label>
                                     <div className="flex items-center space-x-4">
                     <div className="relative">
                       <input
                         type="color"
                         value={formData.colorSecundario}
                         onChange={(e) => handleInputChange('colorSecundario', e.target.value)}
                         className="w-16 h-16 border-2 border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors appearance-none"
                         style={{ backgroundColor: formData.colorSecundario }}
                       />
                     </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={formData.colorSecundario}
                        onChange={(e) => handleInputChange('colorSecundario', e.target.value)}
                        placeholder="#1F2937"
                        className="w-full px-3 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600 font-mono text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )

      case 5:
        return (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('moneda')} <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.moneda}
                onChange={(e) => handleInputChange('moneda', e.target.value)}
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
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {t('redesSociales')} <span className="text-gray-400 text-sm font-normal">(todas opcionales)</span>
              </h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Facebook</label>
                  <input
                    type="url"
                    value={formData.redes.facebook}
                    onChange={(e) => handleRedesChange('facebook', e.target.value)}
                    placeholder="https://facebook.com/mi-tienda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.redes.instagram}
                    onChange={(e) => handleRedesChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/mi-tienda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">X (Twitter)</label>
                  <input
                    type="url"
                    value={formData.redes.x}
                    onChange={(e) => handleRedesChange('x', e.target.value)}
                    placeholder="https://x.com/mi-tienda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                  <input
                    type="url"
                    value={formData.redes.tiktok}
                    onChange={(e) => handleRedesChange('tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@mi-tienda"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-600"
                  />
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
            <p className="text-gray-600 mt-2">Paso {currentStep} de {totalSteps}</p>
            
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
                Anterior
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 sm:px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleCreateStore}
                  className="px-4 sm:px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-600 text-sm sm:text-base"
                >
                  {t('createStore')}
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