'use client'

import React, { useState, useEffect } from 'react'
import { StoreBasicInfo } from '../../lib/store'
import { formatPrice } from '../../lib/currency'

interface OrderData {
  customer: {
    fullName: string
    email: string
    phone: string
  }
  shipping: {
    method: string
    addressText?: string
    cost: number
  }
  payment: {
    method: string
    notes?: string
  }
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
    variant?: {
      name: string
      price: number
    }
  }>
  totals: {
    subtotal: number
    shipping: number
    total: number
  }
  metadata?: {
    orderId?: string
    currency?: string
  }
}

interface ConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  orderData: OrderData | null
  storeInfo: StoreBasicInfo
}

export default function ConfirmationModal({ 
  isOpen, 
  onClose, 
  orderData, 
  storeInfo 
}: ConfirmationModalProps) {
  const [currentStep, setCurrentStep] = useState<'loading' | 'success'>('loading')

  useEffect(() => {
    if (isOpen) {
      console.log('🎯 ConfirmationModal abierto!', { orderData })
      setCurrentStep('loading')
      // Simular proceso de envío del pedido
      const timer = setTimeout(() => {
        console.log('🎯 Cambiando a success state')
        setCurrentStep('success')
      }, 2500) // 2.5 segundos de animación de carga

      return () => clearTimeout(timer)
    }
  }, [isOpen, orderData])

  if (!isOpen || !orderData) return null

  const currency = orderData.metadata?.currency || storeInfo.currency || 'COP'
  const orderId = orderData.metadata?.orderId

  // Función para volver a la tienda
  const goToHome = () => {
    if (typeof window === 'undefined') return
    
    const pathname = window.location.pathname
    const host = window.location.hostname
    const isCustomDomain = !host.endsWith('shopifree.app') && !host.endsWith('localhost') && host !== 'localhost'
    
    let homeUrl
    if (isCustomDomain) {
      homeUrl = '/'
    } else {
      const pathParts = pathname.split('/')
      const storeSubdomain = pathParts[1]
      homeUrl = `/${storeSubdomain}`
    }
    
    onClose()
    window.location.href = homeUrl
  }

  // Función para contactar por WhatsApp
  const contactWhatsApp = () => {
    if (!storeInfo?.phone) {
      alert('El número de WhatsApp no está configurado para esta tienda')
      return
    }

    const orderSummary = orderData.items
      .map(item => `• ${item.name} x${item.quantity} - ${formatPrice(item.price * item.quantity, currency)}`)
      .join('\n')

    const message = `¡Hola! 👋

Acabo de realizar un pedido en ${storeInfo.storeName}${orderId ? ` (#${orderId})` : ''}:

🛍️ *Resumen del pedido:*
${orderSummary}

💰 *Total: ${formatPrice(orderData.totals.total, currency)}*

📦 *Método de envío:* ${orderData.shipping.method}
${orderData.shipping.addressText ? `📍 *Dirección:* ${orderData.shipping.addressText}` : ''}
💳 *Método de pago:* ${orderData.payment.method}

¿Podrían confirmarme el estado de mi pedido?

¡Gracias!`

    const whatsappNumber = storeInfo.phone.replace(/[^\d]/g, '')
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`
    
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div 
      className="nbd-modal-overlay" 
      style={{ 
        zIndex: 10001,
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0, 0, 0, 0.7)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <div className="nbd-modal-content" style={{ maxWidth: '600px' }}>
        {currentStep === 'loading' && (
          <>
            <div className="nbd-modal-header">
              <h2 className="nbd-modal-title">Procesando tu pedido</h2>
            </div>
            <div className="nbd-modal-body" style={{ textAlign: 'center', padding: 'var(--nbd-space-4xl)' }}>
              <div className="nbd-loading-spinner">
                <svg 
                  width="64" 
                  height="64" 
                  viewBox="0 0 64 64" 
                  fill="none"
                  style={{ margin: '0 auto var(--nbd-space-xl)' }}
                >
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    stroke="var(--nbd-neutral-200)" 
                    strokeWidth="8"
                  />
                  <circle 
                    cx="32" 
                    cy="32" 
                    r="28" 
                    stroke="var(--nbd-primary)" 
                    strokeWidth="8" 
                    strokeLinecap="round"
                    strokeDasharray="175"
                    strokeDashoffset="175"
                    style={{
                      animation: 'nbd-loading-spin 1.5s ease-in-out infinite'
                    }}
                  />
                </svg>
              </div>
              <h3 style={{ 
                fontSize: 'var(--nbd-font-size-lg)', 
                fontWeight: '600', 
                color: 'var(--nbd-primary)',
                marginBottom: 'var(--nbd-space-sm)'
              }}>
                Enviando tu pedido...
              </h3>
              <p style={{ 
                color: 'var(--nbd-neutral-600)', 
                fontSize: 'var(--nbd-font-size-base)'
              }}>
                Por favor espera mientras procesamos tu orden
              </p>
            </div>
          </>
        )}

        {currentStep === 'success' && (
          <>
            <div className="nbd-modal-header">
              <h2 className="nbd-modal-title" style={{ color: 'var(--nbd-success)' }}>
                ¡Pedido realizado con éxito!
              </h2>
              <button
                onClick={onClose}
                className="nbd-modal-close"
                aria-label="Cerrar modal"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="nbd-modal-body">
              {/* Icono de éxito */}
              <div style={{ textAlign: 'center', marginBottom: 'var(--nbd-space-xl)' }}>
                <div style={{
                  width: '80px',
                  height: '80px',
                  backgroundColor: 'var(--nbd-success)',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto var(--nbd-space-lg)',
                  animation: 'nbd-success-bounce 0.6s ease-out'
                }}>
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 style={{ 
                  fontSize: 'var(--nbd-font-size-xl)', 
                  fontWeight: '600', 
                  color: 'var(--nbd-primary)',
                  marginBottom: 'var(--nbd-space-sm)'
                }}>
                  ¡Gracias por tu compra!
                </h3>
                <p style={{ 
                  color: 'var(--nbd-neutral-600)', 
                  fontSize: 'var(--nbd-font-size-base)'
                }}>
                  Tu pedido ha sido recibido y está siendo procesado
                </p>
              </div>

              {/* Información del pedido */}
              <div style={{
                backgroundColor: 'var(--nbd-neutral-50)',
                borderRadius: 'var(--nbd-radius-lg)',
                padding: 'var(--nbd-space-xl)',
                marginBottom: 'var(--nbd-space-xl)'
              }}>
                {orderId && (
                  <div style={{ marginBottom: 'var(--nbd-space-lg)' }}>
                    <p style={{ 
                      fontSize: 'var(--nbd-font-size-sm)', 
                      color: 'var(--nbd-neutral-600)',
                      marginBottom: 'var(--nbd-space-xs)'
                    }}>
                      Número de pedido:
                    </p>
                    <p style={{ 
                      fontSize: 'var(--nbd-font-size-lg)', 
                      fontWeight: '600', 
                      color: 'var(--nbd-primary)'
                    }}>
                      #{orderId}
                    </p>
                  </div>
                )}

                <div style={{ marginBottom: 'var(--nbd-space-lg)' }}>
                  <h4 style={{ 
                    fontSize: 'var(--nbd-font-size-base)', 
                    fontWeight: '600', 
                    color: 'var(--nbd-primary)',
                    marginBottom: 'var(--nbd-space-sm)'
                  }}>
                    Productos:
                  </h4>
                  {orderData.items.map((item, index) => (
                    <div key={index} style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: 'var(--nbd-space-sm) 0',
                      borderBottom: index < orderData.items.length - 1 ? '1px solid var(--nbd-neutral-200)' : 'none'
                    }}>
                      <div>
                        <p style={{ 
                          fontSize: 'var(--nbd-font-size-sm)', 
                          fontWeight: '500', 
                          color: 'var(--nbd-primary)'
                        }}>
                          {item.name}
                        </p>
                        {item.variant && (
                          <p style={{ 
                            fontSize: 'var(--nbd-font-size-xs)', 
                            color: 'var(--nbd-neutral-600)'
                          }}>
                            {item.variant.name}
                          </p>
                        )}
                        <p style={{ 
                          fontSize: 'var(--nbd-font-size-xs)', 
                          color: 'var(--nbd-neutral-600)'
                        }}>
                          Cantidad: {item.quantity}
                        </p>
                      </div>
                      <p style={{ 
                        fontSize: 'var(--nbd-font-size-sm)', 
                        fontWeight: '600', 
                        color: 'var(--nbd-primary)'
                      }}>
                        {formatPrice(item.price * item.quantity, currency)}
                      </p>
                    </div>
                  ))}
                </div>

                <div style={{ borderTop: '2px solid var(--nbd-neutral-200)', paddingTop: 'var(--nbd-space-lg)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--nbd-space-sm)' }}>
                    <span style={{ color: 'var(--nbd-neutral-600)' }}>Subtotal:</span>
                    <span>{formatPrice(orderData.totals.subtotal, currency)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--nbd-space-sm)' }}>
                    <span style={{ color: 'var(--nbd-neutral-600)' }}>Envío:</span>
                    <span>{formatPrice(orderData.totals.shipping, currency)}</span>
                  </div>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between',
                    fontSize: 'var(--nbd-font-size-lg)',
                    fontWeight: '700',
                    color: 'var(--nbd-primary)'
                  }}>
                    <span>Total:</span>
                    <span>{formatPrice(orderData.totals.total, currency)}</span>
                  </div>
                </div>
              </div>

              {/* Información adicional */}
              <div style={{ marginBottom: 'var(--nbd-space-xl)' }}>
                <p style={{ 
                  fontSize: 'var(--nbd-font-size-sm)', 
                  color: 'var(--nbd-neutral-600)',
                  lineHeight: '1.6'
                }}>
                  <strong>Método de envío:</strong> {orderData.shipping.method}<br />
                  {orderData.shipping.addressText && (
                    <>
                      <strong>Dirección:</strong> {orderData.shipping.addressText}<br />
                    </>
                  )}
                  <strong>Método de pago:</strong> {orderData.payment.method}
                  {orderData.payment.notes && (
                    <>
                      <br />
                      <strong>Notas:</strong> {orderData.payment.notes}
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="nbd-modal-footer">
              <button
                onClick={goToHome}
                className="nbd-btn"
                style={{
                  backgroundColor: 'var(--nbd-neutral-100)',
                  color: 'var(--nbd-primary)',
                  border: '1px solid var(--nbd-neutral-300)',
                  flex: '1'
                }}
              >
                🏪 Volver a la tienda
              </button>
              <button
                onClick={contactWhatsApp}
                className="nbd-btn"
                style={{
                  backgroundColor: '#25D366',
                  color: 'white',
                  border: 'none',
                  flex: '1'
                }}
              >
                💬 Contactar por WhatsApp
              </button>
            </div>
          </>
        )}
      </div>

      <style jsx>{`
        @keyframes nbd-loading-spin {
          0% {
            stroke-dashoffset: 175;
            transform: rotate(0deg);
          }
          50% {
            stroke-dashoffset: 50;
            transform: rotate(180deg);
          }
          100% {
            stroke-dashoffset: 175;
            transform: rotate(360deg);
          }
        }

        @keyframes nbd-success-bounce {
          0% {
            transform: scale(0);
            opacity: 0;
          }
          50% {
            transform: scale(1.1);
          }
          100% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  )
}
