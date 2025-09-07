'use client'

import React from 'react'
import { StockValidationResult } from '../../lib/stock-types'
import { formatPrice } from '../../lib/currency'

interface StockWarningModalProps {
  isOpen: boolean
  onClose: () => void
  onContinue: () => void
  unavailableItems: StockValidationResult[]
  currency?: string
}

/**
 * Modal de advertencia para productos con stock limitado o sin stock
 * 
 * Este componente muestra una advertencia NO BLOQUEANTE al usuario
 * sobre productos que tienen problemas de inventario, pero permite
 * continuar con el checkout si el usuario lo desea.
 */
export default function StockWarningModal({
  isOpen,
  onClose,
  onContinue,
  unavailableItems,
  currency = 'COP'
}: StockWarningModalProps) {
  if (!isOpen) return null

  return (
    <div 
      className="nbd-modal-overlay" 
      style={{ 
        zIndex: 10002, // Un nivel más alto que otros modales
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
      <div 
        className="nbd-modal-content" 
        style={{ 
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}
      >
        {/* Header */}
        <div className="nbd-modal-header">
          <h2 
            className="nbd-modal-title" 
            style={{ 
              color: 'var(--nbd-warning, #f59e0b)',
              display: 'flex',
              alignItems: 'center',
              gap: 'var(--nbd-space-sm)'
            }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2L1 21h22L12 2zm0 3.99L19.53 19H4.47L12 5.99zM11 16h2v2h-2v-2zm0-6h2v4h-2v-4z"/>
            </svg>
            Productos con stock limitado
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

        {/* Body */}
        <div className="nbd-modal-body">
          <div style={{ marginBottom: 'var(--nbd-space-lg)' }}>
            <p style={{
              fontSize: 'var(--nbd-font-size-base)',
              color: 'var(--nbd-neutral-700)',
              lineHeight: '1.6',
              marginBottom: 'var(--nbd-space-md)'
            }}>
              Algunos productos en tu carrito tienen stock limitado o no están disponibles en la cantidad solicitada:
            </p>
          </div>

          {/* Lista de productos con problemas */}
          <div style={{
            backgroundColor: 'var(--nbd-neutral-50)',
            borderRadius: 'var(--nbd-radius-lg)',
            padding: 'var(--nbd-space-lg)',
            marginBottom: 'var(--nbd-space-lg)'
          }}>
            {unavailableItems.map((item, index) => (
              <div 
                key={item.productId} 
                style={{
                  padding: 'var(--nbd-space-md) 0',
                  borderBottom: index < unavailableItems.length - 1 ? '1px solid var(--nbd-neutral-200)' : 'none',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start'
                }}
              >
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontSize: 'var(--nbd-font-size-sm)',
                    fontWeight: '600',
                    color: 'var(--nbd-primary)',
                    marginBottom: 'var(--nbd-space-xs)'
                  }}>
                    Producto ID: {item.productId}
                  </p>
                  <p style={{
                    fontSize: 'var(--nbd-font-size-xs)',
                    color: 'var(--nbd-neutral-600)',
                    marginBottom: 'var(--nbd-space-xs)'
                  }}>
                    Cantidad solicitada: {item.requestedQuantity}
                  </p>
                  {item.availableStock !== undefined && (
                    <p style={{
                      fontSize: 'var(--nbd-font-size-xs)',
                      color: 'var(--nbd-neutral-600)'
                    }}>
                      Stock disponible: {item.availableStock}
                    </p>
                  )}
                </div>
                <div style={{
                  backgroundColor: 'var(--nbd-warning, #f59e0b)',
                  color: 'white',
                  padding: 'var(--nbd-space-xs) var(--nbd-space-sm)',
                  borderRadius: 'var(--nbd-radius-md)',
                  fontSize: 'var(--nbd-font-size-xs)',
                  fontWeight: '500'
                }}>
                  {item.availableStock !== undefined ? 'Stock limitado' : 'Sin stock'}
                </div>
              </div>
            ))}
          </div>

          {/* Mensaje informativo */}
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
              <strong>¿Qué significa esto?</strong><br/>
              Puedes continuar con tu pedido, pero es posible que algunos productos no estén disponibles 
              en la cantidad solicitada. La tienda te contactará para confirmar disponibilidad.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="nbd-modal-footer" style={{
          display: 'flex',
          gap: 'var(--nbd-space-sm)',
          flexDirection: 'column'
        }}>
          <button
            onClick={onContinue}
            className="nbd-btn"
            style={{
              backgroundColor: 'var(--nbd-primary)',
              color: 'white',
              border: 'none',
              width: '100%',
              padding: 'var(--nbd-space-md)',
              fontSize: 'var(--nbd-font-size-sm)',
              fontWeight: '600',
              borderRadius: 'var(--nbd-radius-md)',
              minHeight: '44px'
            }}
          >
            Entiendo, continuar con el pedido
          </button>
          <button
            onClick={onClose}
            className="nbd-btn"
            style={{
              backgroundColor: 'var(--nbd-neutral-100)',
              color: 'var(--nbd-neutral-700)',
              border: '1px solid var(--nbd-neutral-300)',
              width: '100%',
              padding: 'var(--nbd-space-sm)',
              fontSize: 'var(--nbd-font-size-sm)',
              fontWeight: '500',
              borderRadius: 'var(--nbd-radius-md)',
              minHeight: '40px'
            }}
          >
            Revisar mi carrito
          </button>
        </div>
      </div>
    </div>
  )
}