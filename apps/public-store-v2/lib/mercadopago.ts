/**
 * Helpers para integración con MercadoPago
 * 
 * Este archivo contiene funciones auxiliares para trabajar con MercadoPago.
 * Completamente aislado - no afecta el flujo actual.
 */

import { MercadoPagoConfig } from './store'
import { OrderData } from './orders'

/**
 * Datos para crear una preferencia de pago en MercadoPago
 */
export interface MercadoPagoPreference {
  items: Array<{
    title: string
    quantity: number
    unit_price: number
    currency_id: string
  }>
  payer?: {
    name?: string
    email?: string
    phone?: {
      area_code?: string
      number?: string
    }
  }
  back_urls?: {
    success?: string
    failure?: string
    pending?: string
  }
  auto_return?: 'approved' | 'all'
  external_reference?: string
}

/**
 * Resultado de crear una preferencia de pago
 */
export interface MercadoPagoPreferenceResult {
  id: string
  init_point: string
  sandbox_init_point?: string
}

/**
 * Convierte un OrderData a formato de preferencia de MercadoPago
 * @param orderData Datos del pedido
 * @param config Configuración de MercadoPago
 * @returns Preferencia formateada para MercadoPago
 */
export function orderDataToPreference(
  orderData: OrderData, 
  config: MercadoPagoConfig
): MercadoPagoPreference {
  
  // Convertir items del carrito a formato MercadoPago
  const items = orderData.items.map(item => ({
    title: `${item.name}${item.variant ? ` - ${item.variant}` : ''}`,
    quantity: item.quantity,
    unit_price: item.price,
    currency_id: orderData.currency || 'COP'
  }))

  // Agregar shipping como item si existe
  if (orderData.shipping && orderData.totals.shipping > 0) {
    items.push({
      title: `Envío - ${orderData.shipping.method}`,
      quantity: 1,
      unit_price: orderData.totals.shipping,
      currency_id: orderData.currency || 'COP'
    })
  }

  // Preparar información del pagador
  const payer = {
    name: orderData.customer.fullName,
    email: orderData.customer.email,
    phone: orderData.customer.phone ? {
      number: orderData.customer.phone.replace(/[^\d]/g, '')
    } : undefined
  }

  return {
    items,
    payer,
    external_reference: `order-${Date.now()}`, // En producción usar el ID real del pedido
    auto_return: 'approved' as const
  }
}

/**
 * Valida si la configuración de MercadoPago es válida
 * @param config Configuración a validar
 * @returns true si es válida, string con error si no
 */
export function validateMercadoPagoConfig(config: MercadoPagoConfig): true | string {
  if (!config.enabled) {
    return 'MercadoPago está deshabilitado'
  }
  
  if (!config.publicKey || config.publicKey.trim() === '') {
    return 'Public Key de MercadoPago es requerido'
  }
  
  if (!config.accessToken || config.accessToken.trim() === '') {
    return 'Access Token de MercadoPago es requerido'
  }
  
  if (!['sandbox', 'production'].includes(config.environment)) {
    return 'Environment debe ser sandbox o production'
  }
  
  return true
}

/**
 * Obtiene la URL de inicialización según el ambiente
 * @param preferenceResult Resultado de crear la preferencia
 * @param environment Ambiente (sandbox o production)
 * @returns URL de inicialización
 */
export function getInitPoint(
  preferenceResult: MercadoPagoPreferenceResult, 
  environment: 'sandbox' | 'production'
): string {
  return environment === 'sandbox' 
    ? (preferenceResult.sandbox_init_point || preferenceResult.init_point)
    : preferenceResult.init_point
}

/**
 * Función placeholder para crear preferencia
 * En el siguiente paso implementaremos la lógica real con el SDK
 * @param preference Preferencia a crear
 * @param config Configuración de MercadoPago
 * @returns Promise con el resultado
 */
export async function createPreference(
  preference: MercadoPagoPreference,
  config: MercadoPagoConfig
): Promise<MercadoPagoPreferenceResult> {
  
  // Validar configuración
  const validation = validateMercadoPagoConfig(config)
  if (validation !== true) {
    throw new Error(validation)
  }
  
  console.log('🔄 [MercadoPago] Creando preferencia (placeholder):', {
    environment: config.environment,
    items: preference.items.length,
    total: preference.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0)
  })
  
  // Por ahora retornamos datos simulados
  // En el siguiente paso implementaremos la llamada real
  return {
    id: `pref-${Date.now()}-${config.environment}`,
    init_point: `https://www.mercadopago.com.co/checkout/v1/redirect?pref_id=test-${Date.now()}`,
    sandbox_init_point: `https://sandbox.mercadopago.com.co/checkout/v1/redirect?pref_id=test-${Date.now()}`
  }
}