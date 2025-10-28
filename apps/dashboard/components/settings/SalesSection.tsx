'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../lib/store'
import PaymentMethodSelector from './PaymentMethodSelector'
import { Toast } from '../shared/Toast'
import { useToast } from '../../lib/hooks/useToast'
import { hasFeatureAccess } from '../../lib/subscription-utils'
import SubscriptionBlockedModal from '../SubscriptionBlockedModal'

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
  const tPayments = useTranslations('payments')
  
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const { toast, showToast, hideToast } = useToast()

  // Subscription state
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [hasTraditionalCheckoutAccess, setHasTraditionalCheckoutAccess] = useState(false)
  const [hasIntegratedPaymentsAccess, setHasIntegratedPaymentsAccess] = useState(false)

  const [formData, setFormData] = useState({
    currency: 'USD',
    advanced: {
      checkout: {
        method: 'whatsapp' as 'whatsapp' | 'traditional'
      },
      payments: {
        provider: '' as '' | 'culqi' | 'mercadopago' | 'stripe' | 'paypal',
        publicKey: '',
        secretKey: '',
        webhookEndpoint: '',
        connected: false,
        acceptCashOnDelivery: false,
        cashOnDeliveryMethods: [] as string[],
        acceptOnlinePayment: false
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
              },
              payments: {
                provider: userStore.advanced?.payments?.provider || '',
                publicKey: userStore.advanced?.payments?.publicKey || '',
                secretKey: userStore.advanced?.payments?.secretKey || '',
                webhookEndpoint: userStore.advanced?.payments?.webhookEndpoint || '',
                connected: userStore.advanced?.payments?.connected || false,
                acceptCashOnDelivery: userStore.advanced?.payments?.acceptCashOnDelivery || false,
                cashOnDeliveryMethods: userStore.advanced?.payments?.cashOnDeliveryMethods || [],
                acceptOnlinePayment: userStore.advanced?.payments?.acceptOnlinePayment || false
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

  // Check feature access for traditional checkout and integrated payments
  useEffect(() => {
    const checkFeatures = async () => {
      if (!user?.uid) return

      try {
        const [checkoutAccess, paymentsAccess] = await Promise.all([
          hasFeatureAccess(user.uid, 'hasTraditionalCheckout'),
          hasFeatureAccess(user.uid, 'hasIntegratedPayments')
        ])
        setHasTraditionalCheckoutAccess(checkoutAccess)
        setHasIntegratedPaymentsAccess(paymentsAccess)
      } catch (error) {
        console.error('Error checking feature access:', error)
        setHasTraditionalCheckoutAccess(false)
        setHasIntegratedPaymentsAccess(false)
      }
    }

    checkFeatures()
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
    } else if (field.startsWith('advanced.payments.')) {
      const paymentField = field.replace('advanced.payments.', '')
      setFormData(prev => ({
        ...prev,
        advanced: {
          ...prev.advanced,
          payments: {
            ...(prev.advanced?.payments || {}),
            [paymentField]: value
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

  const handlePaymentMethodsChange = (settings: {
    acceptCashOnDelivery: boolean
    cashOnDeliveryMethods: string[]
    acceptOnlinePayment: boolean
  }) => {
    setFormData(prev => ({
      ...prev,
      advanced: {
        ...prev.advanced,
        payments: {
          ...(prev.advanced?.payments || {}),
          acceptCashOnDelivery: settings.acceptCashOnDelivery,
          cashOnDeliveryMethods: settings.cashOnDeliveryMethods,
          acceptOnlinePayment: settings.acceptOnlinePayment
        }
      }
    }))
  }

  const testConnection = async () => {
    if (!formData.advanced.payments.publicKey || !formData.advanced.payments.secretKey) {
      showToast('Por favor ingrese las credenciales antes de probar la conexión', 'error')
      return
    }

    setTestingConnection(true)
    console.log('Testing payment gateway connection...', {
      provider: formData.advanced.payments.provider,
      publicKey: formData.advanced.payments.publicKey.substring(0, 8) + '...',
    })

    try {
      // Simular llamada a API de test de conexión
      await new Promise(resolve => setTimeout(resolve, 2500))

      // Simular una conexión exitosa con probabilidad del 80%
      const isSuccess = Math.random() > 0.2

      if (isSuccess) {
        setFormData(prev => ({
          ...prev,
          advanced: {
            ...prev.advanced,
            payments: {
              ...prev.advanced.payments,
              connected: true
            }
          }
        }))
        showToast('Conexión exitosa con la pasarela de pago', 'success')
      } else {
        setFormData(prev => ({
          ...prev,
          advanced: {
            ...prev.advanced,
            payments: {
              ...prev.advanced.payments,
              connected: false
            }
          }
        }))
        showToast('Error de conexión: Verifique sus credenciales', 'error')
      }
    } catch (error) {
      console.error('Error testing connection:', error)
      setFormData(prev => ({
        ...prev,
        advanced: {
          ...prev.advanced,
          payments: {
            ...prev.advanced.payments,
            connected: false
          }
        }
      }))
      showToast('Error al probar la conexión', 'error')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSave = async () => {
    if (!store?.id) return
    
    setSaving(true)
    try {
      // Crear objeto de actualización preservando datos existentes de shipping
      const updateData = {
        currency: formData.currency,
        advanced: {
          ...store?.advanced, // Preservar todos los datos existentes de advanced
          checkout: {
            ...store?.advanced?.checkout, // Preservar checkout existente
            ...formData.advanced.checkout  // Solo sobrescribir campos específicos de ventas
          },
          payments: {
            ...store?.advanced?.payments, // Preservar payments existentes (ej: de SEO)
            ...formData.advanced.payments  // Solo sobrescribir campos específicos de ventas
          }
        }
      }
      
      await updateStore(store.id, updateData)
      setStore(prev => prev ? { ...prev, ...updateData } : null)
      showToast(tActions('saved'), 'success')
    } catch (error) {
      console.error('Error updating store:', error)
      showToast(tActions('error'), 'error')
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
      {/* Configuración de Ventas */}
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
              {/* Updated descriptions */}
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
                      onChange={() => {
                        if (!hasTraditionalCheckoutAccess) {
                          setShowSubscriptionModal(true)
                        } else {
                          handleChange('advanced.checkout.method', 'traditional')
                        }
                      }}
                      disabled={!hasTraditionalCheckoutAccess && formData.advanced?.checkout?.method !== 'traditional'}
                      className={`focus:ring-gray-600 h-4 w-4 text-gray-800 border-gray-300 ${
                        !hasTraditionalCheckoutAccess && formData.advanced?.checkout?.method !== 'traditional'
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer'
                      }`}
                    />
                  </div>
                  <div className="ml-3 text-sm flex-1">
                    <div className="flex items-center gap-2">
                      <label htmlFor="traditional-checkout" className={`font-medium ${
                        !hasTraditionalCheckoutAccess && formData.advanced?.checkout?.method !== 'traditional'
                          ? 'text-gray-400'
                          : 'text-gray-700'
                      }`}>
                        {t('sales.traditionalCheckout')}
                      </label>
                      {!hasTraditionalCheckoutAccess && formData.advanced?.checkout?.method !== 'traditional' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                          </svg>
                          Premium
                        </span>
                      )}
                    </div>
                    <p className={`${
                      !hasTraditionalCheckoutAccess && formData.advanced?.checkout?.method !== 'traditional'
                        ? 'text-gray-400'
                        : 'text-gray-500'
                    }`}>
                      {t('sales.traditionalCheckoutDescription')}
                    </p>
                    {!hasTraditionalCheckoutAccess && formData.advanced?.checkout?.method !== 'traditional' && (
                      <button
                        type="button"
                        onClick={() => setShowSubscriptionModal(true)}
                        className="mt-2 text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        Activar con plan Premium
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Métodos de pago aceptados */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200">
        <div className="px-6 py-6 space-y-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">{t('paymentMethods.title')}</h3>
            <p className="mt-1 text-sm text-gray-600">
              {t('paymentMethods.description')}
            </p>
          </div>

          <PaymentMethodSelector
            settings={{
              acceptCashOnDelivery: formData.advanced.payments.acceptCashOnDelivery,
              cashOnDeliveryMethods: formData.advanced.payments.cashOnDeliveryMethods,
              acceptOnlinePayment: formData.advanced.payments.acceptOnlinePayment
            }}
            onSettingsChange={handlePaymentMethodsChange}
            checkoutMethod={formData.advanced?.checkout?.method || 'whatsapp'}
          />
        </div>
      </div>

      {/* Configuración de Pasarela de Pago */}
      <div className="bg-white shadow-sm rounded-lg border border-gray-200 relative">
        {/* Overlay para usuarios FREE */}
        {!hasIntegratedPaymentsAccess && (
          <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] z-10 rounded-lg flex items-center justify-center">
            <div className="text-center max-w-md mx-auto px-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
                <svg className="w-8 h-8 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Función Premium
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Las pasarelas de pago integradas están disponibles con el plan Premium. Acepta pagos con tarjeta directamente en tu tienda.
              </p>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Activar con plan Premium
              </button>
            </div>
          </div>
        )}

        <div className={`px-6 py-6 space-y-6 ${!hasIntegratedPaymentsAccess ? 'pointer-events-none select-none' : ''}`}>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-medium text-gray-900">{tPayments('title')}</h3>
              <p className="mt-1 text-sm text-gray-600">{tPayments('description')}</p>
            </div>
            {!hasIntegratedPaymentsAccess && (
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
                Premium
              </span>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {tPayments('provider')}
              </label>
              <select
                value={formData.advanced.payments.provider}
                onChange={(e) => handleChange('advanced.payments.provider', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm bg-white"
              >
                <option value="">{tPayments('selectProvider')}</option>
                <option value="culqi">{tPayments('culqi')}</option>
                <option value="mercadopago">{tPayments('mercadopago')}</option>
                <option value="stripe">{tPayments('stripe')}</option>
                <option value="paypal">{tPayments('paypal')}</option>
              </select>
            </div>

            {formData.advanced.payments.provider && (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tPayments('publicKey')}
                    </label>
                    <input
                      type="text"
                      value={formData.advanced.payments.publicKey}
                      onChange={(e) => handleChange('advanced.payments.publicKey', e.target.value)}
                      placeholder="pk_test_..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {tPayments('secretKey')}
                    </label>
                    <input
                      type="password"
                      value={formData.advanced.payments.secretKey}
                      onChange={(e) => handleChange('advanced.payments.secretKey', e.target.value)}
                      placeholder="sk_test_..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {tPayments('webhookEndpoint')} (Opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.advanced.payments.webhookEndpoint}
                    onChange={(e) => handleChange('advanced.payments.webhookEndpoint', e.target.value)}
                    placeholder="https://tu-tienda.com/webhook/payments"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-gray-600 focus:border-gray-600 text-sm"
                  />
                  <p className="mt-1 text-xs text-gray-500">
                    {tPayments('configuration.webhookInfo')}
                  </p>
                </div>

                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className={`h-3 w-3 rounded-full mr-3 ${
                      formData.advanced.payments.connected ? 'bg-green-400' : 'bg-red-400'
                    }`}></div>
                    <span className="text-sm font-medium text-gray-700">
                      {tPayments('connectionStatus')}: {formData.advanced.payments.connected ? tPayments('connected') : tPayments('notConnected')}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={testConnection}
                    disabled={testingConnection || !formData.advanced.payments.publicKey || !formData.advanced.payments.secretKey}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {testingConnection && (
                      <svg className="animate-spin -ml-1 h-4 w-4 text-gray-700" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{testingConnection ? 'Probando...' : tPayments('testConnection')}</span>
                  </button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h4 className="text-sm font-medium text-blue-800">
                        {tPayments('configuration.title')}
                      </h4>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>{tPayments('configuration.testKeysInfo')}</li>
                          <li>{tPayments('configuration.securityInfo')}</li>
                          <li>{tPayments('configuration.webhookInfo')}</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Botón de guardar */}
      <div className="flex justify-end items-center">
        <div>
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
      
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Subscription blocked modal */}
      <SubscriptionBlockedModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        featureName={!hasIntegratedPaymentsAccess && !hasTraditionalCheckoutAccess
          ? "Funciones Premium (Checkout Tradicional y Pasarelas de Pago)"
          : !hasTraditionalCheckoutAccess
            ? "Checkout Tradicional (Ventas Automatizadas)"
            : "Pasarelas de Pago Integradas"}
        requiredPlan="premium"
        reason="plan_limitation"
      />
    </div>
  )
} 