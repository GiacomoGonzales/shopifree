'use client'

import { useState } from 'react'
import { Button, Input } from '@shopifree/ui'
import { checkSubdomainAvailability, validateSubdomain, createStore } from '../lib/store'
import { createSubdomain } from '../lib/createSubdomain'
import { getCurrentUser } from '../lib/auth'
import LoadingAnimation from './LoadingAnimation'
import { useTranslations } from 'next-intl'

interface StoreSetupProps {
  onStoreCreated: () => void
}

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top duration-300">
      <div className={`px-6 py-4 rounded-lg shadow-lg max-w-md ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            {type === 'success' ? (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            )}
            <span className="font-medium">{message}</span>
          </div>
          <button
            onClick={onClose}
            className="ml-4 text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}

export default function StoreSetup({ onStoreCreated }: StoreSetupProps) {
  const t = useTranslations('storeSetup')
  const tErrors = useTranslations('storeSetup.errors')
  const [formData, setFormData] = useState({
    storeName: '',
    subdomain: '',
    slogan: '',
    description: '',
    hasPhysicalLocation: false,
    address: '',
    primaryColor: '#3B82F6',
    secondaryColor: '#EF4444',
    currency: 'USD',
    phone: '',
    logo: ''
  })
  
  const [subdomainAvailable, setSubdomainAvailable] = useState<boolean | null>(null)
  const [subdomainChecking, setSubdomainChecking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
    // Auto-hide toast after 5 seconds
    setTimeout(() => {
      setToast(null)
    }, 5000)
  }

  const closeToast = () => {
    setToast(null)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const checkSubdomain = async (subdomain: string) => {
    if (!subdomain || subdomain.length < 3) {
      setSubdomainAvailable(null)
      return
    }
    
    // Validar formato primero
    const validation = validateSubdomain(subdomain)
    if (!validation.isValid) {
      setSubdomainAvailable(false)
      setErrors(prev => ({ ...prev, subdomain: validation.error || '' }))
      return
    }
    
    setSubdomainChecking(true)
    const available = await checkSubdomainAvailability(subdomain.toLowerCase())
    setSubdomainAvailable(available)
    setSubdomainChecking(false)
    
    if (!available) {
      setErrors(prev => ({ ...prev, subdomain: tErrors('subdomainTaken') }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.storeName.trim()) newErrors.storeName = tErrors('storeNameRequired')
    
    // Validación de subdominio
    if (!formData.subdomain.trim()) {
      newErrors.subdomain = tErrors('subdomainRequired')
    } else {
      const validation = validateSubdomain(formData.subdomain)
      if (!validation.isValid) {
        newErrors.subdomain = validation.error || tErrors('subdomainInvalidChars')
      } else if (subdomainAvailable === false) {
        newErrors.subdomain = tErrors('subdomainTaken')
      }
    }
    
    if (!formData.slogan.trim()) newErrors.slogan = tErrors('sloganRequired')
    if (!formData.description.trim()) newErrors.description = tErrors('descriptionRequired')
    if (!formData.currency.trim()) newErrors.currency = tErrors('currencyRequired')
    if (!formData.phone.trim()) newErrors.phone = tErrors('phoneRequired')
    if (formData.hasPhysicalLocation && !formData.address.trim()) {
      newErrors.address = tErrors('addressRequired')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return
    
    const user = getCurrentUser()
    if (!user) {
      showToast(t('userNotAuthenticated'), 'error')
      return
    }

    setLoading(true)
    setShowLoading(true)

    try {
      const storeData = {
        ...formData,
        subdomain: formData.subdomain.toLowerCase(),
        ownerId: user.uid
      }
      
      // 1. Crear tienda en Firestore
      await createStore(storeData)
      console.log('✅ Tienda creada en Firestore:', storeData.subdomain)
      
      // 2. Crear subdominio en Vercel automáticamente
      try {
        console.log('🚀 Creando subdominio en Vercel:', storeData.subdomain)
        await createSubdomain(storeData.subdomain)
        console.log('✅ Subdominio creado exitosamente:', `${storeData.subdomain}.shopifree.app`)
      } catch (subdomainError) {
        console.warn('⚠️ Error creando subdominio (la tienda se creó pero sin subdominio):', subdomainError)
        // No detenemos el proceso, solo loggeamos el error
        // La tienda ya fue creada exitosamente en Firestore
      }
      
      // Show success toast and close loading immediately
      showToast(t('successTitle'), 'success')
      setShowLoading(false)
      setLoading(false)
      
      // Call onStoreCreated to refresh dashboard state immediately
      // The parent component will handle the transition
      onStoreCreated()
      
    } catch (error) {
      console.error('Error creating store:', error)
      setLoading(false)
      setShowLoading(false)
      
      // Show error toast with more specific message
      const errorMessage = error instanceof Error 
        ? `${t('genericError')}: ${error.message}` 
        : t('genericError')
      showToast(errorMessage, 'error')
    }
  }

  if (showLoading) {
    return <LoadingAnimation />
  }

  return (
    <>
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
      
      <div className="min-h-screen bg-gray-50 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                {t('title')} 🎉
              </h1>
              <p className="text-gray-600">
                {t('subtitle')}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Store Name */}
              <div>
                <Input
                  label={`${t('storeName')} ${t('required')}`}
                  value={formData.storeName}
                  onChange={(e) => handleInputChange('storeName', e.target.value)}
                  placeholder={t('storeNamePlaceholder')}
                />
                {errors.storeName && (
                  <p className="text-red-500 text-sm mt-1">{errors.storeName}</p>
                )}
              </div>

              {/* Subdomain */}
              <div>
                <div className="flex items-center space-x-2">
                  <Input
                    label={`${t('subdomain')} ${t('required')}`}
                    value={formData.subdomain}
                    onChange={(e) => {
                      const subdomain = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                      handleInputChange('subdomain', subdomain)
                      // Limpiar error cuando el usuario empiece a escribir
                      if (errors.subdomain) {
                        setErrors(prev => ({ ...prev, subdomain: '' }))
                      }
                      if (subdomain.length >= 3) {
                        checkSubdomain(subdomain)
                      } else {
                        setSubdomainAvailable(null)
                      }
                    }}
                    placeholder={t('subdomainPlaceholder')}
                  />
                  {subdomainChecking && (
                    <div className="text-yellow-500 text-sm">{t('checking')}</div>
                  )}
                  {subdomainAvailable === true && (
                    <div className="text-green-500 text-sm">{t('available')}</div>
                  )}
                  {(subdomainAvailable === false || errors.subdomain) && (
                    <div className="text-red-500 text-sm">{t('notAvailable')}</div>
                  )}
                </div>
                {errors.subdomain && (
                  <p className="text-red-500 text-sm mt-1">{errors.subdomain}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  {t('subdomainHint')} {formData.subdomain}.shopifree.app
                </p>
              </div>

              {/* Slogan */}
              <div>
                <Input
                  label={`${t('slogan')} ${t('required')}`}
                  value={formData.slogan}
                  onChange={(e) => handleInputChange('slogan', e.target.value)}
                  placeholder={t('sloganPlaceholder')}
                />
                {errors.slogan && (
                  <p className="text-red-500 text-sm mt-1">{errors.slogan}</p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t('description')} {t('required')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder={t('descriptionPlaceholder')}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>

              {/* Physical Location */}
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="hasPhysicalLocation"
                  checked={formData.hasPhysicalLocation}
                  onChange={(e) => handleInputChange('hasPhysicalLocation', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor="hasPhysicalLocation" className="text-sm font-medium text-gray-700">
                  {t('hasPhysicalLocation')}
                </label>
              </div>

              {/* Address (conditional) */}
              {formData.hasPhysicalLocation && (
                <div>
                  <Input
                    label={`${t('address')} ${t('required')}`}
                    value={formData.address}
                    onChange={(e) => handleInputChange('address', e.target.value)}
                    placeholder={t('addressPlaceholder')}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-sm mt-1">{errors.address}</p>
                  )}
                </div>
              )}

              {/* Colors */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('primaryColor')}
                  </label>
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleInputChange('primaryColor', e.target.value)}
                    className="h-10 w-full rounded border border-gray-300"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t('secondaryColor')}
                  </label>
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleInputChange('secondaryColor', e.target.value)}
                    className="h-10 w-full rounded border border-gray-300"
                  />
                </div>
              </div>

              {/* Currency & Phone */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Input
                    label={`${t('currency')} ${t('required')}`}
                    value={formData.currency}
                    onChange={(e) => handleInputChange('currency', e.target.value)}
                    placeholder={t('currencyPlaceholder')}
                  />
                  {errors.currency && (
                    <p className="text-red-500 text-sm mt-1">{errors.currency}</p>
                  )}
                </div>
                <div>
                  <Input
                    label={`${t('whatsapp')} ${t('required')}`}
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder={t('whatsappPlaceholder')}
                  />
                  {errors.phone && (
                    <p className="text-red-500 text-sm mt-1">{errors.phone}</p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-6">
                <Button
                  type="submit"
                  disabled={loading || subdomainAvailable === false || !!errors.subdomain}
                  className="w-full py-3 text-lg"
                >
                  {loading ? t('creating') : t('createStore')}
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  )
} 