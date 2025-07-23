'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { StoreWithId } from '../../lib/store'

interface PaymentsSectionProps {
  store: StoreWithId | null
  onUpdate: (data: Partial<StoreWithId>) => Promise<boolean>
}

export default function PaymentsSection({ store, onUpdate }: PaymentsSectionProps) {
  const t = useTranslations('payments')
  const tActions = useTranslations('settings.actions')
  
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)
  const [selectedProvider, setSelectedProvider] = useState(store?.payments?.provider || '')

  const handleSave = async () => {
    setSaving(true)
    try {
      const success = await onUpdate({
        payments: {
          ...store?.payments,
          provider: selectedProvider
        }
      })
      
      if (success) {
        setSaveMessage(tActions('saved'))
        setTimeout(() => setSaveMessage(null), 3000)
      } else {
        setSaveMessage(tActions('error'))
        setTimeout(() => setSaveMessage(null), 3000)
      }
    } catch (error) {
      console.error('Error updating payments:', error)
      setSaveMessage(tActions('error'))
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="bg-white shadow-sm rounded-lg border border-gray-200">
      <div className="px-6 py-6 space-y-6">
        <div>
          <h3 className="text-lg font-medium text-gray-900">{t('title')}</h3>
          <p className="mt-1 text-sm text-gray-600">{t('description')}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t('provider')}
          </label>
          <select
            value={selectedProvider}
            onChange={(e) => setSelectedProvider(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
          >
            <option value="">{t('selectProvider')}</option>
            <option value="culqi">{t('culqi')}</option>
            <option value="mercadopago">{t('mercadopago')}</option>
          </select>
        </div>

        <p className="text-sm text-gray-500 italic">{t('comingSoon')}</p>

        {/* Botón de guardar */}
        <div className="flex justify-between items-center pt-4">
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
  )
} 