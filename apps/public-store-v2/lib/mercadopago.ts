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
  notification_url?: string
  statement_descriptor?: string
  expires?: boolean
  binary_mode?: boolean
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
    title: `${item.name}${item.selectedVariant?.name ? ` - ${item.selectedVariant.name}` : ''}`,
    quantity: item.quantity,
    unit_price: Math.round((item.currentPrice || item.price) * 100) / 100, // Asegurar máximo 2 decimales
    currency_id: orderData.currency || 'COP'
  }))

  // Agregar shipping como item si existe
  if (orderData.shipping && orderData.totals.shipping > 0) {
    items.push({
      title: `Envío - ${orderData.shipping.method}`,
      quantity: 1,
      unit_price: Math.round(orderData.totals.shipping * 100) / 100, // Asegurar máximo 2 decimales
      currency_id: orderData.currency || 'COP'
    })
  }

  // Preparar información del pagador
  const payer: any = {}
  
  // Solo agregar campos si tienen valores válidos
  if (orderData.customer.fullName?.trim()) {
    payer.name = orderData.customer.fullName.trim()
  }
  
  if (orderData.customer.email?.trim()) {
    payer.email = orderData.customer.email.trim()
  }
  
  if (orderData.customer.phone?.trim()) {
    const cleanPhone = orderData.customer.phone.replace(/[^\d]/g, '')
    if (cleanPhone.length >= 7) { // Mínimo 7 dígitos para ser válido
      payer.phone = {
        number: cleanPhone
      }
    }
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
 * Crea una preferencia de pago real en MercadoPago
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
  
  console.log('🔄 [MercadoPago] Creando preferencia REAL:', {
    environment: config.environment,
    items: preference.items.length,
    total: preference.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
    accessToken: config.accessToken.substring(0, 20) + '...'
  })
  
  // Determinar URL de API según environment
  const apiUrl = config.environment === 'sandbox' 
    ? 'https://api.mercadopago.com/checkout/preferences'  // Mismo endpoint para sandbox y production
    : 'https://api.mercadopago.com/checkout/preferences'
  
  try {
    // Preparar el payload para enviar
    const payload = {
      ...preference,
      // Configuraciones adicionales para mejorar la experiencia
      back_url: {
        success: `${window.location.origin}/checkout/success`,
        failure: `${window.location.origin}/checkout/failure`, 
        pending: `${window.location.origin}/checkout/pending`
      },
      auto_return: 'approved',
      ...(config.webhookUrl && { notification_url: config.webhookUrl }), // Solo si está configurado
      statement_descriptor: 'Tienda Online', // Aparece en el estado de cuenta
      expires: false, // La preferencia no expira
      binary_mode: false // Permite pagos pendientes
    };
    
    console.log('🔄 [MercadoPago] Payload completo a enviar:', JSON.stringify(payload, null, 2));
    
    // Llamada real a la API de MercadoPago
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${config.accessToken}`,
        'Content-Type': 'application/json',
        'X-Integrator-Id': 'dev_24c65fb163bf11ea96500242ac130004' // Opcional: ID de integrador
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }))
      console.error('🔄 [MercadoPago] Error en API:', {
        status: response.status,
        statusText: response.statusText,
        url: apiUrl,
        error: errorData,
        fullResponse: errorData
      })
      
      // Si hay detalles específicos del error, mostrarlos
      if (errorData?.cause && Array.isArray(errorData.cause)) {
        console.error('🔄 [MercadoPago] Detalles del error:', errorData.cause);
      }
      
      throw new Error(`Error ${response.status}: ${errorData.message || errorData.error || response.statusText}`)
    }

    const result = await response.json()
    
    console.log('🔄 [MercadoPago] Preferencia creada exitosamente:', {
      id: result.id,
      client_id: result.client_id,
      collector_id: result.collector_id,
      init_point: result.init_point ? 'PRESENTE' : 'FALTANTE',
      sandbox_init_point: result.sandbox_init_point ? 'PRESENTE' : 'FALTANTE'
    })

    return {
      id: result.id,
      init_point: result.init_point,
      sandbox_init_point: result.sandbox_init_point
    }

  } catch (error) {
    console.error('🔄 [MercadoPago] Error al crear preferencia:', error)
    
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error('Error de conexión. Verifica tu conexión a internet.')
    }
    
    throw error
  }
}