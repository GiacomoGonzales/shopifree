/**
 * Sistema de tokens únicos para confirmaciones de pedidos
 *
 * Evita que las páginas de confirmación se puedan ver múltiples veces
 * o que se acumulen páginas infinitas de ventas anteriores.
 */

import { OrderData } from './orders'

export interface ConfirmationToken {
  id: string
  orderId: string
  orderData: OrderData
  createdAt: number
  expiresAt: number
  used: boolean
  paymentMethod: string
  storeId: string
}

const STORAGE_KEY_PREFIX = 'shopifree_confirmation_token_'
const TOKEN_EXPIRATION_TIME = 30 * 60 * 1000 // 30 minutos

/**
 * Genera un token único para confirmación de pedido
 */
export function generateConfirmationToken(
  orderData: OrderData,
  orderId: string,
  storeId: string = 'default'
): string {
  // Generar ID único
  const tokenId = generateUniqueId()

  const now = Date.now()

  const token: ConfirmationToken = {
    id: tokenId,
    orderId,
    orderData,
    createdAt: now,
    expiresAt: now + TOKEN_EXPIRATION_TIME,
    used: false,
    paymentMethod: orderData.payment.method,
    storeId
  }

  try {
    // Guardar en localStorage
    localStorage.setItem(
      `${STORAGE_KEY_PREFIX}${tokenId}`,
      JSON.stringify(token)
    )

    console.log('🎫 [ConfirmationToken] Token generado:', {
      tokenId,
      orderId,
      paymentMethod: orderData.payment.method,
      expiresInMinutes: TOKEN_EXPIRATION_TIME / 60000
    })

    return tokenId
  } catch (error) {
    console.error('🎫 [ConfirmationToken] Error generando token:', error)
    // Fallback: generar token simple sin persistencia
    return tokenId
  }
}

/**
 * Valida y consume un token de confirmación
 */
export function validateAndConsumeToken(tokenId: string): ConfirmationToken | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tokenId}`)

    if (!stored) {
      console.warn('🎫 [ConfirmationToken] Token no encontrado:', tokenId)
      return null
    }

    const token: ConfirmationToken = JSON.parse(stored)

    // Verificar si ha expirado
    if (Date.now() > token.expiresAt) {
      console.warn('🎫 [ConfirmationToken] Token expirado:', {
        tokenId,
        createdAt: new Date(token.createdAt).toLocaleString(),
        expiresAt: new Date(token.expiresAt).toLocaleString()
      })

      // Limpiar token expirado
      localStorage.removeItem(`${STORAGE_KEY_PREFIX}${tokenId}`)
      return null
    }

    // Verificar si ya fue usado
    if (token.used) {
      console.warn('🎫 [ConfirmationToken] Token ya fue usado:', tokenId)
      return null
    }

    // Marcar como usado
    token.used = true
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${tokenId}`, JSON.stringify(token))

    console.log('🎫 [ConfirmationToken] Token validado y consumido:', {
      tokenId,
      orderId: token.orderId,
      paymentMethod: token.paymentMethod,
      ageMinutes: Math.round((Date.now() - token.createdAt) / 60000)
    })

    return token
  } catch (error) {
    console.error('🎫 [ConfirmationToken] Error validando token:', error)
    return null
  }
}

/**
 * Limpia todos los tokens expirados
 */
export function cleanupExpiredTokens(): void {
  try {
    const keys = Object.keys(localStorage)
    const tokenKeys = keys.filter(key => key.startsWith(STORAGE_KEY_PREFIX))

    let cleanedCount = 0

    for (const key of tokenKeys) {
      try {
        const stored = localStorage.getItem(key)
        if (!stored) continue

        const token: ConfirmationToken = JSON.parse(stored)

        // Si está expirado, eliminar
        if (Date.now() > token.expiresAt) {
          localStorage.removeItem(key)
          cleanedCount++
        }
      } catch (error) {
        // Si hay error parseando, eliminar
        localStorage.removeItem(key)
        cleanedCount++
      }
    }

    if (cleanedCount > 0) {
      console.log(`🎫 [ConfirmationToken] Limpiados ${cleanedCount} tokens expirados`)
    }
  } catch (error) {
    console.error('🎫 [ConfirmationToken] Error en cleanup:', error)
  }
}

/**
 * Verifica si un token específico existe y es válido (sin consumirlo)
 */
export function isTokenValid(tokenId: string): boolean {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tokenId}`)
    if (!stored) return false

    const token: ConfirmationToken = JSON.parse(stored)

    // Verificar expiración y uso
    return Date.now() <= token.expiresAt && !token.used
  } catch (error) {
    return false
  }
}

/**
 * Genera un ID único para tokens
 */
function generateUniqueId(): string {
  // Combinar timestamp + random para mayor unicidad
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).substring(2, 15)

  return `${timestamp}_${random}`
}

/**
 * Obtiene información de un token sin consumirlo (para debugging)
 */
export function getTokenInfo(tokenId: string): Partial<ConfirmationToken> | null {
  try {
    const stored = localStorage.getItem(`${STORAGE_KEY_PREFIX}${tokenId}`)
    if (!stored) return null

    const token: ConfirmationToken = JSON.parse(stored)

    return {
      id: token.id,
      orderId: token.orderId,
      createdAt: token.createdAt,
      expiresAt: token.expiresAt,
      used: token.used,
      paymentMethod: token.paymentMethod,
      storeId: token.storeId
    }
  } catch (error) {
    return null
  }
}