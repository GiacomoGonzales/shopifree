/**
 * Utilidad para manejar estado de checkout en localStorage
 *
 * Permite guardar y restaurar el estado completo del checkout
 * cuando el usuario es redirigido a pasarelas de pago externas.
 */

import { CartItem } from './cart-context'
import { OrderData } from './orders'

export interface CheckoutState {
  // Información del pedido
  orderData: OrderData

  // Estado del modal
  currentStep: number

  // Información de pago
  paymentProvider: 'mercadopago' | 'culqi' | 'manual'
  paymentStatus: 'pending' | 'success' | 'failed' | null

  // Metadata
  timestamp: number
  expiresAt: number

  // IDs de transacción (si están disponibles)
  transactionIds?: {
    paymentId?: string
    preferenceId?: string
    externalReference?: string
  }
}

const STORAGE_KEY = 'shopifree_checkout_state'
const EXPIRATION_TIME = 30 * 60 * 1000 // 30 minutos

/**
 * Guarda el estado del checkout en localStorage
 */
export function saveCheckoutState(
  orderData: OrderData,
  currentStep: number,
  paymentProvider: CheckoutState['paymentProvider'],
  transactionIds?: CheckoutState['transactionIds']
): void {
  try {
    const now = Date.now()

    const state: CheckoutState = {
      orderData,
      currentStep,
      paymentProvider,
      paymentStatus: 'pending',
      timestamp: now,
      expiresAt: now + EXPIRATION_TIME,
      ...(transactionIds && { transactionIds })
    }

    console.log('💾 [CheckoutState] Guardando estado:', {
      step: currentStep,
      provider: paymentProvider,
      itemsCount: orderData.items.length,
      total: orderData.totals.total,
      customer: orderData.customer.email,
      expiresIn: `${EXPIRATION_TIME / 60000} min`
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch (error) {
    console.error('💾 [CheckoutState] Error guardando estado:', error)
  }
}

/**
 * Recupera el estado del checkout desde localStorage
 */
export function getCheckoutState(): CheckoutState | null {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) {
      return null
    }

    const state: CheckoutState = JSON.parse(stored)

    // Verificar si ha expirado
    if (Date.now() > state.expiresAt) {
      console.log('💾 [CheckoutState] Estado expirado, eliminando')
      clearCheckoutState()
      return null
    }

    console.log('💾 [CheckoutState] Recuperando estado:', {
      step: state.currentStep,
      provider: state.paymentProvider,
      status: state.paymentStatus,
      itemsCount: state.orderData.items.length,
      ageMinutes: Math.round((Date.now() - state.timestamp) / 60000)
    })

    return state
  } catch (error) {
    console.error('💾 [CheckoutState] Error recuperando estado:', error)
    // Si hay error, limpiar localStorage corrupto
    clearCheckoutState()
    return null
  }
}

/**
 * Actualiza el estado de pago sin reemplazar todo el estado
 */
export function updatePaymentStatus(
  status: CheckoutState['paymentStatus'],
  transactionIds?: CheckoutState['transactionIds']
): void {
  try {
    const currentState = getCheckoutState()
    if (!currentState) {
      console.warn('💾 [CheckoutState] No hay estado para actualizar')
      return
    }

    const updatedState: CheckoutState = {
      ...currentState,
      paymentStatus: status,
      ...(transactionIds && {
        transactionIds: {
          ...currentState.transactionIds,
          ...transactionIds
        }
      })
    }

    console.log('💾 [CheckoutState] Actualizando estado de pago:', {
      oldStatus: currentState.paymentStatus,
      newStatus: status,
      transactionIds
    })

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedState))
  } catch (error) {
    console.error('💾 [CheckoutState] Error actualizando estado:', error)
  }
}

/**
 * Limpia el estado del checkout
 */
export function clearCheckoutState(): void {
  try {
    const hadState = localStorage.getItem(STORAGE_KEY) !== null
    localStorage.removeItem(STORAGE_KEY)

    if (hadState) {
      console.log('💾 [CheckoutState] Estado limpiado')
    }
  } catch (error) {
    console.error('💾 [CheckoutState] Error limpiando estado:', error)
  }
}

/**
 * Verifica si hay un estado válido guardado
 */
export function hasValidCheckoutState(): boolean {
  return getCheckoutState() !== null
}

/**
 * Obtiene solo los IDs de transacción guardados
 */
export function getStoredTransactionIds(): CheckoutState['transactionIds'] | null {
  const state = getCheckoutState()
  return state?.transactionIds || null
}

/**
 * Limpia automáticamente estados expirados (llamar en init de app)
 */
export function cleanupExpiredStates(): void {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return

    const state: CheckoutState = JSON.parse(stored)
    if (Date.now() > state.expiresAt) {
      clearCheckoutState()
      console.log('💾 [CheckoutState] Estado expirado eliminado en cleanup')
    }
  } catch (error) {
    // Si hay error parseando, limpiar
    clearCheckoutState()
  }
}