'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StoreWithId } from '../../lib/store'
import ShippingConfiguration from './ShippingConfiguration'

interface AdvancedSettingsProps {
  store?: StoreWithId | null
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
  saving: boolean
}

export default function AdvancedSettings({ store, onUpdate, saving }: AdvancedSettingsProps) {
  const t = useTranslations('settings.advanced')
  const tActions = useTranslations('settings.actions')
  
  const [activeSubTab, setActiveSubTab] = useState('checkout')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [selectedLanguage, setSelectedLanguage] = useState<'es' | 'en'>('es')
  const [shippingData, setShippingData] = useState<any>(null)

  // Función para limpiar valores undefined de un objeto
  const cleanUndefinedValues = (obj: any): any => {
    if (obj === null || obj === undefined) return null
    if (typeof obj !== 'object') return obj
    if (Array.isArray(obj)) return obj.map(cleanUndefinedValues)
    
    const cleaned: any = {}
    Object.keys(obj).forEach(key => {
      const value = obj[key]
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value)
      }
    })
    return cleaned
  }

  const handleSave = async () => {
    console.log('Saving shipping data:', shippingData)
    
    // Limpiar datos de shipping antes de guardar
    const cleanedShippingData = shippingData ? cleanUndefinedValues(shippingData) : null
    console.log('Cleaned shipping data:', cleanedShippingData)
    
    const success = await onUpdate({
      advanced: {
        ...store?.advanced,
        checkout: { method: 'whatsapp' },
        language: selectedLanguage,
        ...(cleanedShippingData && { shipping: cleanedShippingData })
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
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-8">
              {/* Método de Checkout */}
              <div className="space-y-4">
                <h4 className="text-lg font-medium">{t('checkout.title')}</h4>
                <p className="text-sm text-gray-600">{t('checkout.description')}</p>
                <div className="space-y-4">
                  <div className="relative flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id="whatsapp-checkout"
                        name="checkout-method"
                        type="radio"
                        checked={true}
                        readOnly
                        className="focus:ring-gray-600 h-4 w-4 text-gray-800 border-gray-300"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor="whatsapp-checkout" className="font-medium text-gray-700">
                        {t('checkout.whatsappCheckout')}
                      </label>
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
                        {t('checkout.traditionalCheckout')}
                      </label>
                    </div>
                  </div>
              </div>
            </div>

            {/* Idioma de la tienda */}
            <div className="space-y-4 pt-8 border-t border-gray-200">
              <h4 className="text-lg font-medium">{t('checkout.language.title')}</h4>
              <p className="text-sm text-gray-600">{t('checkout.language.description')}</p>
              <div>
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value as 'es' | 'en')}
                  className="w-full border border-gray-300 rounded-md p-2"
                >
                  <option value="es">{t('checkout.language.spanish')}</option>
                  <option value="en">{t('checkout.language.english')}</option>
                </select>
              </div>
            </div>
            </div>
          </div>
        )
      case 'payments':
        return (
          <div className="bg-white shadow rounded-lg p-6">
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
              <p className="text-sm text-gray-500 italic mt-4">{t('payments.comingSoon')}</p>
            </div>
          </div>
        )
      case 'shipping':
        return (
          <div className="space-y-6">
            <ShippingConfiguration
              store={store}
              onUpdate={onUpdate}
              saving={saving}
              onShippingDataChange={setShippingData}
            />
          </div>
        )
      case 'seo':
        return (
          <div className="bg-white shadow rounded-lg p-6">
            <div className="space-y-4">
              <h4 className="text-lg font-medium">{t('seo.title')}</h4>
              <p className="text-sm text-gray-600">{t('seo.description')}</p>
              <div>
                <label className="block text-sm font-medium mb-1">{t('seo.seoTitle')}</label>
                <input 
                  type="text" 
                  placeholder={t('seo.seoTitlePlaceholder')}
                  disabled
                  className="w-full border border-gray-300 rounded-md p-2 bg-gray-50" 
                />
              </div>
              <p className="text-sm text-gray-500 italic mt-4">{t('seo.comingSoon')}</p>
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
      <div>
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