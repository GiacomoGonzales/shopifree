'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { StoreWithId } from '../../lib/store'

interface AdvancedSettingsProps {
  store: StoreWithId
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
  saving: boolean
}

export default function AdvancedSettings({ store, onUpdate, saving }: AdvancedSettingsProps) {
  const t = useTranslations('pages.settings.advanced')
  const tActions = useTranslations('pages.settings.actions')
  
  const [activeSubTab, setActiveSubTab] = useState('checkout')
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const handleSave = async () => {
    const success = await onUpdate({
      advanced: {
        checkout: { method: 'whatsapp' },
        language: 'es'
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
        <nav className="flex space-x-8 border-b border-gray-200">
          {subTabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeSubTab === tab
                  ? 'border-indigo-500 text-indigo-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              {t(`tabs.${tab}`)}
            </button>
          ))}
        </nav>
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
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
        >
          {saving ? tActions('saving') : tActions('save')}
        </button>
      </div>
    </div>
  )
} 