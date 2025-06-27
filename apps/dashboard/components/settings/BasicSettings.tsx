'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StoreWithId } from '../../lib/store'

interface BasicSettingsProps {
  store: StoreWithId
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
  saving: boolean
}

export default function BasicSettings({ store, onUpdate, saving }: BasicSettingsProps) {
  const t = useTranslations('pages.settings.basic')
  const tActions = useTranslations('pages.settings.actions')
  
  const [formData, setFormData] = useState({
    storeName: store.storeName || '',
    slogan: store.slogan || '',
    description: store.description || '',
    hasPhysicalLocation: store.hasPhysicalLocation || false,
    address: store.address || '',
    tipoComercio: store.tipoComercio || '',
    phone: store.phone || '',
    primaryColor: store.primaryColor || '#4F46E5',
    secondaryColor: store.secondaryColor || '#06B6D4',
    currency: store.currency || 'USD',
    redes: {
      facebook: store.redes?.facebook || '',
      instagram: store.redes?.instagram || '',
      whatsapp: store.redes?.whatsapp || '',
      tiktok: store.redes?.tiktok || ''
    }
  })

  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleChange = (field: string, value: any) => {
    if (field.startsWith('redes.')) {
      const socialField = field.split('.')[1]
      setFormData(prev => ({
        ...prev,
        redes: {
          ...prev.redes,
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
    const success = await onUpdate(formData)
    if (success) {
      setSaveMessage(tActions('saved'))
      setTimeout(() => setSaveMessage(null), 3000)
    } else {
      setSaveMessage(tActions('error'))
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  return (
    <div className="space-y-8">
      {/* Información de la Tienda */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            {t('storeInfo.title')}
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('storeInfo.storeName')}
              </label>
              <input
                type="text"
                value={formData.storeName}
                onChange={(e) => handleChange('storeName', e.target.value)}
                placeholder={t('storeInfo.storeNamePlaceholder')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('storeInfo.subdomain')}
              </label>
              <input
                type="text"
                value={store.subdomain}
                disabled
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
              />
              <p className="mt-1 text-xs text-gray-500">
                {t('storeInfo.subdomainHint')} {store.subdomain}.shopifree.app
              </p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('storeInfo.slogan')}
              </label>
              <input
                type="text"
                value={formData.slogan}
                onChange={(e) => handleChange('slogan', e.target.value)}
                placeholder={t('storeInfo.sloganPlaceholder')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700">
                {t('storeInfo.description')}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => handleChange('description', e.target.value)}
                placeholder={t('storeInfo.descriptionPlaceholder')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Contacto y Colores en una sección */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            Contacto y Branding
          </h3>

          <div className="space-y-6">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.hasPhysicalLocation}
                onChange={(e) => handleChange('hasPhysicalLocation', e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
              />
              <label className="ml-2 block text-sm text-gray-900">
                {t('contact.hasPhysicalLocation')}
              </label>
            </div>

            {formData.hasPhysicalLocation && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('contact.address')}
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleChange('address', e.target.value)}
                  placeholder={t('contact.addressPlaceholder')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>
            )}

            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('contact.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder={t('contact.phonePlaceholder')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('branding.currency')}
                </label>
                <input
                  type="text"
                  value={formData.currency}
                  onChange={(e) => handleChange('currency', e.target.value)}
                  placeholder={t('branding.currencyPlaceholder')}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('branding.primaryColor')}
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={formData.primaryColor}
                    onChange={(e) => handleChange('primaryColor', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  {t('branding.secondaryColor')}
                </label>
                <div className="mt-1 flex items-center space-x-3">
                  <input
                    type="color"
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="h-10 w-20 border border-gray-300 rounded-md"
                  />
                  <input
                    type="text"
                    value={formData.secondaryColor}
                    onChange={(e) => handleChange('secondaryColor', e.target.value)}
                    className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Redes Sociales */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
            {t('socialMedia.title')}
          </h3>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('socialMedia.facebook')}
              </label>
              <input
                type="url"
                value={formData.redes.facebook}
                onChange={(e) => handleChange('redes.facebook', e.target.value)}
                placeholder={t('socialMedia.facebookPlaceholder')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('socialMedia.instagram')}
              </label>
              <input
                type="url"
                value={formData.redes.instagram}
                onChange={(e) => handleChange('redes.instagram', e.target.value)}
                placeholder={t('socialMedia.instagramPlaceholder')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('socialMedia.whatsapp')}
              </label>
              <input
                type="tel"
                value={formData.redes.whatsapp}
                onChange={(e) => handleChange('redes.whatsapp', e.target.value)}
                placeholder={t('socialMedia.whatsappPlaceholder')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                {t('socialMedia.tiktok')}
              </label>
              <input
                type="url"
                value={formData.redes.tiktok}
                onChange={(e) => handleChange('redes.tiktok', e.target.value)}
                placeholder={t('socialMedia.tiktokPlaceholder')}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end space-x-3">
        {saveMessage && (
          <div className={`px-4 py-2 rounded-md text-sm font-medium ${
            saveMessage === tActions('saved')
              ? 'bg-green-100 text-green-800'
              : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {saving ? tActions('saving') : tActions('save')}
        </button>
      </div>
    </div>
  )
} 