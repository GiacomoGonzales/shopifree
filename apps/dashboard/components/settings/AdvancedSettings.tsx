'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StoreWithId } from '../../lib/store'

interface AdvancedSettingsProps {
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
  saving: boolean
}

export default function AdvancedSettings({ onUpdate, saving }: AdvancedSettingsProps) {
  const t = useTranslations('settings.advanced')
  const tActions = useTranslations('settings.actions')
  
  const [activeSubTab, setActiveSubTab] = useState('checkout')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es')

  const handleSave = async () => {
    const success = await onUpdate({
      advanced: {
        checkout: { method: 'whatsapp' },
        language: selectedLanguage
      }
    })
    
    if (success) {
      setSaveMessage(tActions('saved'))
      setTimeout(() => setSaveMessage(null), 3000)
    } else {
      setSaveMessage(tActions('error'))
      setTimeout(() => setSaveMessage(null), 3000)
    }
  }

  const subTabs = ['checkout', 'payments', 'shipping', 'seo']

  const renderContent = () => {
    switch (activeSubTab) {
      case 'checkout':
        return (
          <div className="space-y-8">
            {/* Método de Checkout */}
            <div className="space-y-4">
              <h4 className="text-lg font-medium">{t('checkout.title')}</h4>
              <p className="text-sm text-gray-600">{t('checkout.description')}</p>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="checkout" value="whatsapp" className="mr-2" />
                  {t('checkout.whatsappCheckout')}
                </label>
                <label className="flex items-center">
                  <input type="radio" name="checkout" value="traditional" className="mr-2" />
                  {t('checkout.traditionalCheckout')}
                </label>
              </div>
            </div>

            {/* Idioma de la tienda */}
            <div className="space-y-4 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-medium">Idioma de la tienda</h4>
              <p className="text-sm text-gray-600">
                Selecciona el idioma por defecto para elementos comunes de la tienda
              </p>
              <div>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'es' | 'en')}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="es">Español</option>
                  <option value="en">Inglés</option>
                </select>
              </div>
            </div>
          </div>
        )
      case 'payments':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium">{t('payments.title')}</h4>
            <p className="text-sm text-gray-600">{t('payments.description')}</p>
            <div>
              <label className="block text-sm font-medium mb-1">{t('payments.provider')}</label>
              <select className="w-full border border-gray-300 rounded-md p-2">
                <option value="">{t('payments.selectProvider')}</option>
                <option value="culqi">{t('payments.culqi')}</option>
                <option value="mercadopago">{t('payments.mercadopago')}</option>
              </select>
            </div>
          </div>
        )
      case 'shipping':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium">{t('shipping.title')}</h4>
            <p className="text-sm text-gray-600">{t('shipping.description')}</p>
            <label className="flex items-center">
              <input type="checkbox" className="mr-2" />
              {t('shipping.enableShipping')}
            </label>
          </div>
        )
      case 'seo':
        return (
          <div className="space-y-4">
            <h4 className="text-lg font-medium">{t('seo.title')}</h4>
            <p className="text-sm text-gray-600">{t('seo.description')}</p>
            <div>
              <label className="block text-sm font-medium mb-1">{t('seo.seoTitle')}</label>
              <input type="text" className="w-full border border-gray-300 rounded-md p-2" />
            </div>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div>
      {/* Sub-tabs */}
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
            {subTabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveSubTab(tab)}
                className={`py-2 px-3 border-b-2 font-medium text-sm whitespace-nowrap flex-shrink-0 ${
                  activeSubTab === tab
                    ? 'border-gray-600 text-gray-800'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {t(`tabs.${tab}`)}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white shadow rounded-lg p-6">
        {renderContent()}
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end space-x-3">
        {saveMessage && (
          <div className={`px-3 py-2 rounded text-sm ${
            saveMessage === tActions('saved') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {saveMessage}
          </div>
        )}
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50"
        >
          {saving ? tActions('saving') : tActions('save')}
        </button>
      </div>
    </div>
  )
} 