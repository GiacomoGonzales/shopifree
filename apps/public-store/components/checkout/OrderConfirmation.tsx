'use client'

import { useStoreAuth } from '../../lib/store-auth-context'
import { useStore } from '../../lib/store-context'

interface OrderConfirmationProps {
  orderId: string
  onClose: () => void
}

const Icons = {
  CheckCircle: () => (
    <svg className="w-12 h-12" fill="currentColor" viewBox="0 0 20 20">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63z"/>
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  )
}

export default function OrderConfirmation({ orderId, onClose }: OrderConfirmationProps) {
  const { isAuthenticated } = useStoreAuth()
  const { store } = useStore()

  const handleViewOrder = () => {
    if (isAuthenticated) {
      // Redirect to order details in account section
      window.location.href = `/mi-cuenta/orders/${orderId}`
    }
  }

  const handleWhatsAppContact = () => {
    if (store?.phone) {
      const phoneNumber = store.phone.replace(/\D/g, '')
      const message = encodeURIComponent(`Hola! Acabo de realizar un pedido en ${store.storeName} con el ID: ${orderId}. ¿Podrían ayudarme con el seguimiento?`)
      const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`
      window.open(whatsappUrl, '_blank')
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Overlay */}
      <div 
        className="fixed inset-0 backdrop-blur-sm transition-all duration-300 ease-out"
        style={{ 
          backgroundColor: `rgba(var(--theme-neutral-dark), 0.75)`,
          backdropFilter: 'blur(4px)'
        }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="w-full max-w-md rounded-lg shadow-2xl"
          style={{
            backgroundColor: `rgb(var(--theme-neutral-light))`,
            boxShadow: `var(--theme-shadow-lg)`,
            border: `1px solid rgb(var(--theme-primary) / 0.1)`
          }}
        >
          {/* Content */}
          <div className="p-6 text-center">
            {/* Success icon */}
            <div 
              className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center"
              style={{
                backgroundColor: `rgb(var(--theme-success) / 0.1)`,
                color: `rgb(var(--theme-success))`
              }}
            >
              <Icons.CheckCircle />
            </div>

            {/* Title */}
            <h2 
              className="text-xl font-semibold mb-2"
              style={{
                color: `rgb(var(--theme-neutral-dark))`,
                fontFamily: `var(--theme-font-heading)`
              }}
            >
              ¡Gracias por tu compra!
            </h2>

            {/* Subtitle */}
            <p 
              className="text-sm mb-4"
              style={{
                color: `rgb(var(--theme-neutral-medium))`,
                fontFamily: `var(--theme-font-body)`
              }}
            >
              Tu pedido fue creado exitosamente.
            </p>

            {/* Order ID */}
            <div 
              className="p-3 rounded-lg mb-6 text-sm"
              style={{
                backgroundColor: `rgb(var(--theme-secondary))`,
                border: `1px solid rgb(var(--theme-primary) / 0.1)`
              }}
            >
              <span 
                style={{
                  color: `rgb(var(--theme-neutral-medium))`,
                  fontFamily: `var(--theme-font-body)`
                }}
              >
                ID del pedido: 
              </span>
              <strong 
                style={{
                  color: `rgb(var(--theme-neutral-dark))`,
                  fontFamily: `var(--theme-font-body)`
                }}
              >
                {orderId}
              </strong>
            </div>

            {/* Action buttons */}
            <div className="space-y-3">
              {isAuthenticated ? (
                <button
                  onClick={handleViewOrder}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: `rgb(var(--theme-primary))`,
                    color: `rgb(var(--theme-neutral-light))`,
                    fontFamily: `var(--theme-font-body)`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-primary) / 0.9)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-primary))`
                  }}
                >
                  <Icons.Eye />
                  <span>Ver mi pedido</span>
                </button>
              ) : (
                <button
                  onClick={handleWhatsAppContact}
                  className="w-full py-3 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2"
                  style={{
                    backgroundColor: `rgb(var(--theme-success))`,
                    color: `rgb(var(--theme-neutral-light))`,
                    fontFamily: `var(--theme-font-body)`
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-success) / 0.9)`
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-success))`
                  }}
                >
                  <Icons.WhatsApp />
                  <span>Contactar por WhatsApp</span>
                </button>
              )}

              {/* Close button */}
              <button
                onClick={onClose}
                className="w-full py-2 px-4 rounded-lg font-medium transition-all duration-300"
                style={{
                  backgroundColor: `rgb(var(--theme-secondary))`,
                  color: `rgb(var(--theme-neutral-dark))`,
                  fontFamily: `var(--theme-font-body)`,
                  border: `1px solid rgb(var(--theme-primary) / 0.2)`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = `rgb(var(--theme-primary) / 0.1)`
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                }}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}