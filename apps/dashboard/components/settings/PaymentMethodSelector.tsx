'use client'

import { useTranslations } from 'next-intl'



// Componente Switch reutilizable
interface SwitchProps {
  checked: boolean
  onChange: (checked: boolean) => void
  colorScheme?: 'blue' | 'green'
}

function Switch({ checked, onChange, colorScheme = 'blue' }: SwitchProps) {
  const colors = {
    blue: {
      bg: checked ? 'bg-blue-600' : 'bg-gray-200',
      focus: 'focus:ring-blue-300'
    },
    green: {
      bg: checked ? 'bg-green-600' : 'bg-gray-200', 
      focus: 'focus:ring-green-300'
    }
  }

  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`relative inline-flex items-center h-6 w-11 rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-4 ${colors[colorScheme].focus} ${colors[colorScheme].bg}`}
    >
      <span
        className={`inline-block w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ease-in-out ${
          checked ? 'translate-x-5' : 'translate-x-0.5'
        }`}
      />
    </button>
  )
}

interface PaymentMethodSettings {
  acceptCashOnDelivery: boolean
  cashOnDeliveryMethods: string[]
  acceptOnlinePayment: boolean
}

interface PaymentMethodSelectorProps {
  settings: PaymentMethodSettings
  onSettingsChange: (settings: PaymentMethodSettings) => void
  checkoutMethod?: 'whatsapp' | 'traditional'
}


const Icons = {
  CreditCard: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9v-9m0-9v9m0 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
    </svg>
  )
}

export default function PaymentMethodSelector({ settings, onSettingsChange, checkoutMethod = 'whatsapp' }: PaymentMethodSelectorProps) {
  const t = useTranslations('settings.paymentMethods')

  // Métodos de pago con traducciones dinámicas
  const paymentMethodsTranslated = [
    {
      id: 'efectivo',
      name: t('methods.cash'),
      icon: '/images/payment/cash.png',
      description: t('methods.cashDescription')
    },
    {
      id: 'tarjeta',
      name: t('methods.card'),
      icon: '/images/payment/card.png',
      description: t('methods.cardDescription')
    },
    {
      id: 'yape',
      name: t('methods.yape'),
      icon: '/images/payment/yape.png',
      description: t('methods.yapeDescription')
    },
    {
      id: 'transferencia_bancaria',
      name: t('methods.bankTransfer'),
      icon: '/images/payment/bank-transfer.png',
      description: t('methods.bankTransferDescription')
    }
  ]
  const handleCashOnDeliveryToggle = (enabled: boolean) => {
    onSettingsChange({
      ...settings,
      acceptCashOnDelivery: enabled,
      cashOnDeliveryMethods: enabled ? settings.cashOnDeliveryMethods : []
    })
  }

  const handleCashMethodToggle = (methodId: string, checked: boolean) => {
    const updatedMethods = checked 
      ? [...settings.cashOnDeliveryMethods, methodId]
      : settings.cashOnDeliveryMethods.filter(m => m !== methodId)
    
    onSettingsChange({
      ...settings,
      cashOnDeliveryMethods: updatedMethods
    })
  }

  const handleOnlinePaymentToggle = (enabled: boolean) => {
    onSettingsChange({
      ...settings,
      acceptOnlinePayment: enabled
    })
  }

  return (
    <div className="space-y-6">
      {/* Pagos manuales */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <div className="flex items-start justify-between mb-4 gap-3">
          <div className="flex items-center space-x-3 flex-1 min-w-0">
            <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
              <Icons.Truck />
            </div>
            <div className="min-w-0 flex-1">
              <h4 className="text-sm font-medium text-gray-900">{t('cashOnDelivery.title')}</h4>
              <p className="text-xs text-gray-500">{t('cashOnDelivery.description')}</p>
            </div>
          </div>
          <div className="flex-shrink-0">
            <Switch
              checked={settings.acceptCashOnDelivery}
              onChange={handleCashOnDeliveryToggle}
              colorScheme="blue"
            />
          </div>
        </div>

        {/* Opciones de pagos manuales */}
        {settings.acceptCashOnDelivery && (
          <div className="ml-0 sm:ml-14 space-y-3">
            <p className="text-xs text-gray-600 mb-3">{t('cashOnDelivery.selectMethods')}</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {paymentMethodsTranslated.map((method) => (
                <label
                  key={method.id}
                  className={`relative flex items-center space-x-3 p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                    settings.cashOnDeliveryMethods.includes(method.id)
                      ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={settings.cashOnDeliveryMethods.includes(method.id)}
                    onChange={(e) => handleCashMethodToggle(method.id, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <div className="flex items-center space-x-2 flex-1 min-w-0">
                    <img 
                      src={method.icon} 
                      alt={method.name}
                      className="w-6 h-6 object-contain"
                      onError={(e) => {
                        // Fallback si no existe la imagen
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.parentElement?.insertAdjacentHTML('beforeend', 
                          `<div class="w-6 h-6 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-500">${method.name.charAt(0)}</div>`
                        );
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{method.name}</p>
                      <p className="text-xs text-gray-500 truncate">{method.description}</p>
                    </div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pago online - Solo para checkout tradicional */}
      {checkoutMethod === 'traditional' && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Icons.Globe />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-sm font-medium text-gray-900">{t('onlinePayment.title')}</h4>
                <p className="text-xs text-gray-500">{t('onlinePayment.description')}</p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <Switch
                checked={settings.acceptOnlinePayment}
                onChange={handleOnlinePaymentToggle}
                colorScheme="green"
              />
            </div>
          </div>
          
          {settings.acceptOnlinePayment && (
            <div className="ml-0 sm:ml-14 mt-3">
              <p className="text-xs text-gray-600">
                {t('onlinePayment.configureGateway')}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}