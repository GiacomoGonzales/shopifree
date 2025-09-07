'use client'

import React from 'react'
import { MercadoPagoConfig } from '../../../lib/store'
import { OrderData } from '../../../lib/orders'

interface MercadoPagoCheckoutProps {
  config: MercadoPagoConfig
  orderData: OrderData
  onSuccess: (paymentData: any) => void
  onError: (error: any) => void
  onPending?: (paymentData: any) => void
}

/**
 * Componente de checkout con MercadoPago
 * 
 * Este componente maneja la integración con MercadoPago para procesar pagos.
 * Está aislado y no afecta el flujo existente hasta que se integre.
 */
export default function MercadoPagoCheckout({
  config,
  orderData,
  onSuccess,
  onError,
  onPending
}: MercadoPagoCheckoutProps) {
  
  // Por ahora solo renderizamos un placeholder
  // En el siguiente paso agregaremos la lógica de MercadoPago
  return (
    <div 
      className="nbd-mercadopago-checkout"
      style={{
        padding: 'var(--nbd-space-lg)',
        border: '1px solid var(--nbd-neutral-200)',
        borderRadius: 'var(--nbd-radius-lg)',
        backgroundColor: 'var(--nbd-neutral-50)'
      }}
    >
      <h3 style={{
        fontSize: 'var(--nbd-font-size-lg)',
        fontWeight: '600',
        color: 'var(--nbd-primary)',
        marginBottom: 'var(--nbd-space-md)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--nbd-space-sm)'
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        Pago con MercadoPago
      </h3>
      
      <div style={{
        backgroundColor: 'var(--nbd-info-50, #eff6ff)',
        border: '1px solid var(--nbd-info-200, #bfdbfe)',
        borderRadius: 'var(--nbd-radius-md)',
        padding: 'var(--nbd-space-md)',
        marginBottom: 'var(--nbd-space-lg)'
      }}>
        <p style={{
          fontSize: 'var(--nbd-font-size-sm)',
          color: 'var(--nbd-info-700, #1d4ed8)',
          margin: 0,
          lineHeight: '1.5'
        }}>
          <strong>Componente MercadoPago creado</strong><br/>
          Configuración: {config.environment} - {config.enabled ? 'Habilitado' : 'Deshabilitado'}<br/>
          Total a pagar: {orderData.totals.total} {orderData.currency}
        </p>
      </div>

      <div style={{
        display: 'flex',
        gap: 'var(--nbd-space-sm)',
        marginTop: 'var(--nbd-space-lg)'
      }}>
        <button
          onClick={() => onSuccess({ 
            id: 'test-payment-' + Date.now(),
            status: 'approved',
            detail: 'Test payment for development'
          })}
          style={{
            backgroundColor: 'var(--nbd-success, #10b981)',
            color: 'white',
            border: 'none',
            padding: 'var(--nbd-space-md)',
            borderRadius: 'var(--nbd-radius-md)',
            fontSize: 'var(--nbd-font-size-sm)',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          🧪 Simular Pago Exitoso
        </button>
        
        <button
          onClick={() => onError({ 
            message: 'Pago rechazado para pruebas',
            status: 'rejected'
          })}
          style={{
            backgroundColor: 'var(--nbd-danger, #ef4444)',
            color: 'white',
            border: 'none',
            padding: 'var(--nbd-space-md)',
            borderRadius: 'var(--nbd-radius-md)',
            fontSize: 'var(--nbd-font-size-sm)',
            fontWeight: '500',
            cursor: 'pointer'
          }}
        >
          🧪 Simular Pago Fallido
        </button>
      </div>
    </div>
  )
}