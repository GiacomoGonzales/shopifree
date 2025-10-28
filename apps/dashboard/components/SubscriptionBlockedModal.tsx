'use client'

import { Fragment } from 'react'
import { Dialog, Transition } from '@headlessui/react'

interface SubscriptionBlockedModalProps {
  isOpen: boolean
  onClose: () => void
  featureName: string
  requiredPlan?: 'premium' | 'pro'
  reason?: 'trial_expired' | 'plan_limitation' | 'product_limit'
  currentCount?: number
  maxCount?: number
}

export default function SubscriptionBlockedModal({
  isOpen,
  onClose,
  featureName,
  requiredPlan = 'premium',
  reason = 'trial_expired',
  currentCount,
  maxCount
}: SubscriptionBlockedModalProps) {
  const planName = requiredPlan === 'premium' ? 'Premium' : 'Pro'
  const planPrice = requiredPlan === 'premium' ? '$15/mes ($120/año)' : '$30/mes ($300/año)'

  // Generar mensaje según la razón
  const getMessage = () => {
    switch (reason) {
      case 'product_limit':
        return `Has alcanzado el límite de ${maxCount} productos del plan gratuito. Actualiza al plan ${planName} para agregar hasta ${requiredPlan === 'premium' ? '50' : 'ilimitados'} productos.`
      case 'plan_limitation':
        return `La función "${featureName}" requiere el plan ${planName} para funcionar.`
      case 'trial_expired':
      default:
        return `Tu periodo de prueba de 30 días ha terminado. Para seguir usando "${featureName}" y otras funciones premium, contrata el plan ${planName}.`
    }
  }

  // Features según el plan
  const getPlanFeatures = () => {
    if (requiredPlan === 'premium') {
      return [
        'Hasta 50 productos',
        'Dominio personalizado',
        'Pagos integrados (MercadoPago, Stripe, etc.)',
        'Checkout tradicional',
        'Recuperación de carritos abandonados',
        'Emails automáticos',
        'Google Analytics + Meta Pixel',
        'Reportes completos'
      ]
    } else {
      return [
        'Productos ilimitados',
        'Ventas internacionales',
        'Múltiples idiomas',
        'Traducción automática',
        'Segmentación de clientes',
        'Marketing avanzado',
        'Temas exclusivos',
        'Soporte prioritario'
      ]
    }
  }

  const contactMessage = `Hola, quiero contratar el plan ${planName} de Shopifree.`
  const whatsappUrl = `https://wa.me/51958371017?text=${encodeURIComponent(contactMessage)}`
  const emailSubject = `Consulta sobre plan ${planName}`
  const emailBody = `Hola,%0D%0A%0D%0AQuiero contratar el plan ${planName} de Shopifree.%0D%0A%0D%0AGracias!`
  const emailUrl = `mailto:admin@shopifree.app?subject=${encodeURIComponent(emailSubject)}&body=${emailBody}`

  const handleFreeDowngrade = () => {
    // Si es por límite de productos, simplemente cerrar el modal
    // El usuario ya está en plan free, solo no puede crear más productos
    onClose()
  }

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                {/* Icon */}
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-yellow-100 mb-4">
                  <svg className="h-6 w-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>

                {/* Title */}
                <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900 text-center mb-2">
                  {reason === 'product_limit' ? 'Límite de productos alcanzado' : 'Función no disponible'}
                </Dialog.Title>

                {/* Message */}
                <div className="mt-2">
                  <p className="text-sm text-gray-600 text-center">
                    {getMessage()}
                  </p>
                </div>

                {/* Plan Details */}
                <div className="mt-4 bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">Plan {planName}</p>
                      <p className="text-xs text-gray-600">{planPrice}</p>
                    </div>
                    {requiredPlan === 'premium' && (
                      <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-1 rounded-full font-medium">
                        Recomendado
                      </span>
                    )}
                  </div>

                  <ul className="space-y-2">
                    {getPlanFeatures().slice(0, 4).map((feature, index) => (
                      <li key={index} className="flex items-start text-xs text-gray-700">
                        <svg className="w-4 h-4 text-emerald-500 mr-2 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                    {getPlanFeatures().length > 4 && (
                      <li className="text-xs text-gray-500 italic ml-6">
                        Y mucho más...
                      </li>
                    )}
                  </ul>
                </div>

                {/* Actions */}
                <div className="mt-6 space-y-3">
                  {/* WhatsApp Button */}
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
                    onClick={onClose}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Contactar por WhatsApp
                  </a>

                  {/* Email Button */}
                  <a
                    href={emailUrl}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                    onClick={onClose}
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Enviar Email
                  </a>

                  {/* Cancel / Free Button */}
                  {reason === 'trial_expired' ? (
                    <button
                      onClick={handleFreeDowngrade}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Continuar con plan gratuito
                    </button>
                  ) : (
                    <button
                      onClick={onClose}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                      Cerrar
                    </button>
                  )}
                </div>

                {/* Footer note */}
                <p className="mt-4 text-xs text-center text-gray-500">
                  ¿Tienes dudas? Escríbenos a{' '}
                  <a href="mailto:admin@shopifree.app" className="text-emerald-600 hover:text-emerald-700 font-medium">
                    admin@shopifree.app
                  </a>
                </p>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
