/**
 * Helpers para integración con Culqi
 * Implementación completa para procesamiento de pagos
 */

import { CulqiConfig } from './store'
import { OrderData } from './orders'

/**
 * Valida si la configuración de Culqi es válida
 * @param config Configuración a validar
 * @returns true si es válida, string con error si no
 */
export function validateCulqiConfig(config: CulqiConfig): true | string {
  if (!config.enabled) {
    return 'Culqi está deshabilitado'
  }

  if (!config.publicKey || config.publicKey.trim() === '') {
    return 'Public Key de Culqi es requerido'
  }

  if (!config.secretKey || config.secretKey.trim() === '') {
    return 'Secret Key de Culqi es requerido'
  }

  if (!['test', 'live'].includes(config.environment)) {
    return 'Environment debe ser test o live'
  }

  return true
}

/**
 * Datos para crear un cargo en Culqi
 */
export interface CulqiCharge {
  amount: number
  currency_code: string
  description: string
  order_id?: string
  email: string
  client_details: {
    first_name: string
    last_name: string
    phone_number?: string
  }
  capture?: boolean
}

/**
 * Token de tarjeta de Culqi (generado por Culqi.js)
 */
export interface CulqiToken {
  id: string
  type: string
  creation_date: number
  email: string
  card_number: string
  last_four: string
  active: boolean
}

/**
 * Resultado de crear un cargo
 */
export interface CulqiChargeResult {
  object: string
  id: string
  creation_date: number
  amount: number
  amount_refunded: number
  current_amount: number
  installments: number
  installments_amount?: number
  currency_code: string
  email: string
  description: string
  source: {
    object: string
    id: string
    type: string
    creation_date: number
    card_number: string
    last_four: string
    active: boolean
    iin: any
    client: any
    metadata: any
  }
  outcome: {
    network_response_code: string
    network_response_message: string
    merchant_message: string
    type: string
    code: string
    merchant_code: string
    decline_code: any
    network_decline_code: string
    reason: string
  }
  reference_code: string
  authorization_code: string
  paid: boolean
  refunded: boolean
  captured: boolean
  dispute: boolean
  fraudulent: boolean
}

/**
 * Convierte un OrderData a formato de cargo de Culqi
 * @param orderData Datos del pedido
 * @param config Configuración de Culqi
 * @returns Charge formateado para Culqi
 */
export function orderDataToCharge(
  orderData: OrderData,
  config: CulqiConfig
): Omit<CulqiCharge, 'source_id'> {

  // Calcular monto total en centavos (Culqi requiere centavos)
  const totalInCents = Math.round(orderData.totals.total * 100)

  // Preparar descripción del pedido
  const itemsCount = orderData.items.reduce((sum, item) => sum + item.quantity, 0)
  const description = `Pedido de ${itemsCount} producto${itemsCount > 1 ? 's' : ''} - ${orderData.items[0]?.name}${itemsCount > 1 ? ' y más' : ''}`

  // Dividir nombre completo en nombre y apellido
  const fullName = orderData.customer.fullName?.trim() || 'Cliente'
  const nameParts = fullName.split(' ')
  const firstName = nameParts[0] || 'Cliente'
  const lastName = nameParts.slice(1).join(' ') || 'Usuario'

  // Limpiar número de teléfono
  const cleanPhone = orderData.customer.phone?.replace(/[^\d]/g, '')

  // Crear email único para entorno de pruebas
  const baseEmail = orderData.customer.email || 'test@example.com'
  const uniqueEmail = config.environment === 'test'
    ? `test.${Date.now()}@culqi.com`  // Email único para pruebas
    : baseEmail  // Email real para producción

  return {
    amount: totalInCents,
    currency_code: orderData.currency || 'PEN', // Culqi principalmente maneja PEN (Soles)
    description: description.substring(0, 80), // Culqi tiene límite de 80 caracteres
    order_id: `order-${Date.now()}`, // En producción usar el ID real del pedido
    email: uniqueEmail, // Email en nivel raíz y único para pruebas
    client_details: {
      first_name: firstName,
      last_name: lastName,
      ...(cleanPhone && cleanPhone.length >= 7 && { phone_number: cleanPhone })
    },
    capture: true // Capturar automáticamente
  }
}

/**
 * Obtiene la URL de API según el ambiente
 * @param environment Ambiente (test o live)
 * @returns URL base de la API
 */
export function getCulqiApiUrl(environment: 'test' | 'live'): string {
  return 'https://api.culqi.com'
}

/**
 * Crea un cargo real en Culqi
 * @param chargeData Datos del cargo
 * @param tokenId ID del token de tarjeta generado por Culqi.js
 * @param config Configuración de Culqi
 * @returns Promise con el resultado
 */
export async function createCharge(
  chargeData: Omit<CulqiCharge, 'source_id'>,
  tokenId: string,
  config: CulqiConfig
): Promise<CulqiChargeResult> {

  // Validar configuración
  const validation = validateCulqiConfig(config)
  if (validation !== true) {
    throw new Error(validation)
  }

  console.log('🔄 [Culqi] Creando cargo REAL:', {
    environment: config.environment,
    amount: chargeData.amount,
    currency: chargeData.currency_code,
    description: chargeData.description,
    tokenId: tokenId.substring(0, 20) + '...',
    secretKey: config.secretKey.substring(0, 20) + '...'
  })

  const apiUrl = `${getCulqiApiUrl(config.environment)}/v2/charges`

  try {
    // Preparar el payload para enviar
    const payload = {
      ...chargeData,
      source_id: tokenId
    };

    console.log('🔄 [Culqi] Payload completo a enviar:', JSON.stringify(payload, null, 2));

    // Llamada real a la API de Culqi
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.secretKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      console.error('🔄 [Culqi] Error en API:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        error: errorData
      })

      throw new Error(`Error ${response.status}: ${errorData.merchant_message || errorData.user_message || errorData.message || response.statusText}`)
    }

    const result = await response.json()

    console.log('🔄 [Culqi] Cargo creado exitosamente:', {
      id: result.id,
      amount: result.amount,
      currency: result.currency_code,
      paid: result.paid,
      outcome: result.outcome?.type
    })

    return result

  } catch (error) {
    console.error('🔄 [Culqi] Error al crear cargo:', error)

    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.')
    }

    throw error
  }
}