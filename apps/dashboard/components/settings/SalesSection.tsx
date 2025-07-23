'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../lib/store'

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

export default function SalesSection() {
  const { user } = useAuth()
  const t = useTranslations('settings')
  const tActions = useTranslations('settings.actions')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    currency: 'USD',
    advanced: {
      checkout: {
        method: 'whatsapp' as 'whatsapp' | 'traditional'
      }
    }
  })

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return
      
      try {        
        const userStore = await getUserStore(user.uid)
        setStore(userStore)
        if (userStore) {
          setFormData({
            currency: userStore.currency || 'USD',
            advanced: {
              checkout: {
                method: userStore.advanced?.checkout?.method || 'whatsapp'
              }
            }
          })
        }
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [user?.uid])

  const handleChange = (field: string, value: string) => {
    if (field === 'advanced.checkout.method') {
      setFormData(prev => ({
        ...prev,
        advanced: {
          ...prev.advanced,
          checkout: {
            ...(prev.advanced?.checkout || {}),
            method: value as 'whatsapp' | 'traditional'
          }
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
    if (!store?.id) return
    
    setSaving(true)
    try {
      await updateStore(store.id, formData)
      setStore(prev => prev ? { ...prev, ...formData } : null)
      setSaveMessage(tActions('saved'))
      setTimeout(() => setSaveMessage(null), 3000)
    } catch (error) {
      console.error('Error updating store:', error)
      setSaveMessage(tActions('error'))
      setTimeout(() => setSaveMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!store) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex">
          <div className="flex-shrink-0">
            <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div className="ml-3">
            <p className="text-sm text-red-700">
              No se pudo cargar la información de tu tienda. Intenta recargar la página.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('sales.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">{t('sales.subtitle')}</p>
          </div>
          
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('sales.currency')}
              </label>
              <select
                value={formData.currency}
                onChange={(e) => handleChange('currency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-white"
              >
                {monedas.map(moneda => (
                  <option key={moneda.code} value={moneda.code}>
                    {moneda.symbol} {moneda.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-xs text-gray-500">
                {t('sales.currencyHint')}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('sales.checkoutMethod')}
              </label>
              <div className="space-y-3">
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="whatsapp-sales"
                      name="checkout-method"
                      type="radio"
                      checked={formData.advanced?.checkout?.method === 'whatsapp'}
                      onChange={() => handleChange('advanced.checkout.method', 'whatsapp')}
                      className="focus:ring-gray-600 h-4 w-4 text-gray-800 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="whatsapp-sales" className="font-medium text-gray-700">
                      {t('sales.whatsappSales')}
                    </label>
                    <p className="text-gray-500">{t('sales.whatsappSalesDescription')}</p>
                  </div>
                </div>
                
                <div className="relative flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      id="traditional-checkout"
                      name="checkout-method"
                      type="radio"
                      checked={formData.advanced?.checkout?.method === 'traditional'}
                      onChange={() => handleChange('advanced.checkout.method', 'traditional')}
                      className="focus:ring-gray-600 h-4 w-4 text-gray-800 border-gray-300"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label htmlFor="traditional-checkout" className="font-medium text-gray-700">
                      {t('sales.traditionalCheckout')}
                    </label>
                    <p className="text-gray-500">{t('sales.traditionalCheckoutDescription')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-between items-center">
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
  )
} 