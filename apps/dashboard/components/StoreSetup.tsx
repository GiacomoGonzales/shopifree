'use client'

import { useState } from 'react'
import { Button, Input } from '@shopifree/ui'
import { checkSlugAvailability, createStore } from '../lib/store'
import { getCurrentUser } from '../lib/auth'
import LoadingAnimation from './LoadingAnimation'
import { useTranslations } from 'next-intl'

interface StoreSetupProps {
  onStoreCreated: () => void
}

export default function StoreSetup({ onStoreCreated }: StoreSetupProps) {
  const t = useTranslations('storeSetup')
  const tErrors = useTranslations('storeSetup.errors')
  const [formData, setFormData] = useState({
    storeName: '',
    slug: '',
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
  
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [loading, setLoading] = useState(false)
  const [showLoading, setShowLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const checkSlug = async (slug: string) => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null)
      return
    }
    
    setSlugChecking(true)
    const available = await checkSlugAvailability(slug.toLowerCase())
    setSlugAvailable(available)
    setSlugChecking(false)
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!formData.storeName.trim()) newErrors.storeName = tErrors('storeNameRequired')
    if (!formData.slug.trim()) newErrors.slug = tErrors('slugRequired')
    if (formData.slug.length < 3) newErrors.slug = tErrors('slugMinLength')
    if (slugAvailable === false) newErrors.slug = tErrors('slugTaken')
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
      alert('Usuario no autenticado')
      return
    }

    setLoading(true)
    setShowLoading(true)

    try {
      const storeData = {
        ...formData,
        slug: formData.slug.toLowerCase(),
        ownerId: user.uid
      }
      
      await createStore(storeData)
      
      // Simulate loading for 5 seconds
      setTimeout(() => {
        setShowLoading(false)
        onStoreCreated()
      }, 5000)
      
    } catch (error) {
      console.error('Error creating store:', error)
      alert('Error al crear la tienda. Inténtalo de nuevo.')
      setLoading(false)
      setShowLoading(false)
    }
  }

  if (showLoading) {
    return <LoadingAnimation />
  }

  return (
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

            {/* Slug */}
            <div>
              <div className="flex items-center space-x-2">
                <Input
                  label={`${t('subdomain')} ${t('required')}`}
                  value={formData.slug}
                  onChange={(e) => {
                    const slug = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')
                    handleInputChange('slug', slug)
                    if (slug.length >= 3) {
                      checkSlug(slug)
                    }
                  }}
                  placeholder={t('subdomainPlaceholder')}
                />
                {slugChecking && (
                  <div className="text-yellow-500 text-sm">{t('checking')}</div>
                )}
                {slugAvailable === true && (
                  <div className="text-green-500 text-sm">{t('available')}</div>
                )}
                {slugAvailable === false && (
                  <div className="text-red-500 text-sm">{t('notAvailable')}</div>
                )}
              </div>
              {errors.slug && (
                <p className="text-red-500 text-sm mt-1">{errors.slug}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                {t('subdomainHint')} {formData.slug}.shopifree.app
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
                disabled={loading || slugAvailable === false}
                className="w-full py-3 text-lg"
              >
                {loading ? t('creating') : t('createStore')}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 