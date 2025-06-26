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
  telefonoTienda: string
  logoFile: File | null
  fotoLocalFile: File | null
  colorPrimario: string
  colorSecundario: string
  moneda: string
  redes: {
    facebook: string
    instagram: string
    whatsapp: string
    tiktok: string
  }
}

const tiposComercio = [
  'Ropa y Moda',
  'Electrónicos',
  'Hogar y Jardín',
  'Deportes y Fitness',
  'Belleza y Cuidado Personal',
  'Libros y Medios',
  'Juguetes y Niños',
  'Automóviles',
  'Comida y Bebidas',
  'Salud y Bienestar',
  'Arte y Manualidades',
  'Servicios',
  'Otro'
]

const monedas = [
  { code: 'USD', symbol: '$', name: 'Dólar Americano' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'MXN', symbol: '$', name: 'Peso Mexicano' },
  { code: 'COP', symbol: '$', name: 'Peso Colombiano' },
  { code: 'ARS', symbol: '$', name: 'Peso Argentino' },
  { code: 'CLP', symbol: '$', name: 'Peso Chileno' },
  { code: 'PEN', symbol: 'S/', name: 'Sol Peruano' }
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
    telefonoTienda: '',
    logoFile: null,
    fotoLocalFile: null,
    colorPrimario: '#3B82F6',
    colorSecundario: '#1F2937',
    moneda: 'USD',
    redes: {
      facebook: '',
      instagram: '',
      whatsapp: '',
      tiktok: ''
    }
  })
  
  const [creatingStore, setCreatingStore] = useState(false)
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
        if (!formData.telefonoTienda.trim()) {
          newErrors.telefonoTienda = t('errors.telefonoTiendaRequired')
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
    
    try {
      // Simular carga de archivos (en producción usarías Firebase Storage)
      const logoURL = formData.logoFile ? 'https://placeholder-logo.jpg' : ''
      const fotoLocalURL = formData.fotoLocalFile ? 'https://placeholder-foto.jpg' : ''
      
      const storeData = {
        storeName: formData.nombreTienda,
        subdomain: formData.subdominio,
        slogan: formData.slogan,
        description: formData.descripcion,
        hasPhysicalLocation: formData.tieneLocalFisico,
        address: formData.direccion,
        tipoComercio: formData.tipoComercio,
        phone: formData.telefonoTienda,
        primaryColor: formData.colorPrimario,
        secondaryColor: formData.colorSecundario,
        currency: formData.moneda,
        logo: logoURL,
        fotoLocal: fotoLocalURL,
        redes: formData.redes,
        ownerId: user.uid
      }
      
      // Mostrar modal de creación por 3 segundos
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      await createStore(storeData)
      
      router.push('/dashboard')
    } catch (error) {
      console.error('Error creating store:', error)
      alert(t('errors.createError'))
    } finally {
      setCreatingStore(false)
    }
  }

  // Modal de creación
  if (creatingStore) {
    return (
      <div className="min-h-screen bg-gray-900 bg-opacity-50 flex items-center justify-center">
        <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">{t('creating')}</h2>
          <p className="text-gray-600 mt-2">{t('creatingMessage')}</p>
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                  className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
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
              <input
                type="tel"
                value={formData.telefonoTienda}
                onChange={(e) => handleInputChange('telefonoTienda', e.target.value)}
                placeholder={t('telefonoTiendaPlaceholder')}
                className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.telefonoTienda ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.telefonoTienda && <p className="text-red-500 text-sm mt-1">{errors.telefonoTienda}</p>}
            </div>
          </div>
        )

      case 4:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('logo')} <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('logoFile', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('fotoLocal')} <span className="text-gray-400 text-xs">(opcional)</span>
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleFileChange('fotoLocalFile', e.target.files?.[0] || null)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('colorPrimario')} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.colorPrimario}
                    onChange={(e) => handleInputChange('colorPrimario', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.colorPrimario}
                    onChange={(e) => handleInputChange('colorPrimario', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('colorSecundario')} <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.colorSecundario}
                    onChange={(e) => handleInputChange('colorSecundario', e.target.value)}
                    className="w-12 h-12 border border-gray-300 rounded-lg cursor-pointer"
                  />
                  <input
                    type="text"
                    value={formData.colorSecundario}
                    onChange={(e) => handleInputChange('colorSecundario', e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
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
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Instagram</label>
                  <input
                    type="url"
                    value={formData.redes.instagram}
                    onChange={(e) => handleRedesChange('instagram', e.target.value)}
                    placeholder="https://instagram.com/mi-tienda"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">WhatsApp</label>
                  <input
                    type="tel"
                    value={formData.redes.whatsapp}
                    onChange={(e) => handleRedesChange('whatsapp', e.target.value)}
                    placeholder="+1234567890"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">TikTok</label>
                  <input
                    type="url"
                    value={formData.redes.tiktok}
                    onChange={(e) => handleRedesChange('tiktok', e.target.value)}
                    placeholder="https://tiktok.com/@mi-tienda"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          {/* Header con progreso */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-6">
            <div className="text-center text-white">
              <h1 className="text-2xl font-bold">{t('title')}</h1>
              <p className="text-blue-100 mt-1">Paso {currentStep} de {totalSteps}</p>
            </div>
            
            {/* Barra de progreso */}
            <div className="mt-6">
              <div className="bg-blue-800 bg-opacity-50 rounded-full h-2">
                <div 
                  className="bg-white h-2 rounded-full transition-all duration-300 ease-in-out"
                  style={{ width: `${(currentStep / totalSteps) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Contenido del formulario */}
          <div className="p-6 sm:p-8">
            {renderCurrentStep()}
          </div>

          {/* Botones de navegación */}
          <div className="bg-gray-50 px-6 py-4 sm:px-8 flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 1}
              className="px-6 py-3 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Anterior
            </button>

            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Siguiente
              </button>
            ) : (
              <button
                onClick={handleCreateStore}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                {t('createStore')}
              </button>
            )}
          </div>
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