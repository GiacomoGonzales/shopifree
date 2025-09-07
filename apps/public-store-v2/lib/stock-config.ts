/**
 * Configuración y helpers para stock validation
 * 
 * Este archivo proporciona funciones para obtener y manejar la configuración
 * de validación de stock por tienda. Completamente aislado - no afecta el flujo actual.
 */

import { StoreStockConfig, StockValidationConfig } from './stock-types'
import { getStoreCheckoutConfig } from './store'

/**
 * Configuración por defecto para stock validation
 */
export const DEFAULT_STOCK_CONFIG: StockValidationConfig = {
  enabled: false,           // Por defecto deshabilitado
  blockOnUnavailable: false, // No bloquear por defecto
  logOnly: true,           // Solo logging por defecto
  showWarnings: false      // Sin advertencias por defecto
}

/**
 * Configuración por defecto para la tienda completa
 */
export const DEFAULT_STORE_STOCK_CONFIG: StoreStockConfig = {
  validation: DEFAULT_STOCK_CONFIG,
  reserveStock: false,
  reserveDurationMinutes: 30
}

/**
 * Obtiene la configuración de stock para una tienda específica
 * @param storeId ID de la tienda
 * @returns Configuración de stock con valores por defecto como fallback
 */
export async function getStoreStockConfig(storeId: string): Promise<StoreStockConfig> {
  try {
    // Intentar obtener configuración avanzada de la tienda
    const advancedConfig = await getStoreCheckoutConfig(storeId)
    
    // Extraer configuración de stock si existe
    const stockConfig = (advancedConfig as any)?.stock as StoreStockConfig | undefined
    
    if (!stockConfig) {
      console.log(`[Stock Config] No stock config found for store ${storeId}, using defaults`)
      return DEFAULT_STORE_STOCK_CONFIG
    }

    // Merge con defaults para asegurar que todas las propiedades existan
    return {
      validation: {
        ...DEFAULT_STOCK_CONFIG,
        ...stockConfig.validation
      },
      reserveStock: stockConfig.reserveStock ?? DEFAULT_STORE_STOCK_CONFIG.reserveStock,
      reserveDurationMinutes: stockConfig.reserveDurationMinutes ?? DEFAULT_STORE_STOCK_CONFIG.reserveDurationMinutes
    }

  } catch (error) {
    console.warn(`[Stock Config] Error getting stock config for store ${storeId}:`, error)
    return DEFAULT_STORE_STOCK_CONFIG
  }
}

/**
 * Función helper para verificar si la validación debe ejecutarse
 * @param config Configuración de validación
 * @returns true si debe ejecutarse la validación
 */
export function shouldValidateStock(config: StockValidationConfig): boolean {
  return config.enabled === true
}

/**
 * Función helper para verificar si debe bloquear el checkout
 * @param config Configuración de validación
 * @returns true si debe bloquear cuando hay problemas de stock
 */
export function shouldBlockOnUnavailable(config: StockValidationConfig): boolean {
  return config.enabled && config.blockOnUnavailable && !config.logOnly
}

/**
 * Función helper para verificar si debe mostrar advertencias
 * @param config Configuración de validación
 * @returns true si debe mostrar advertencias al usuario
 */
export function shouldShowWarnings(config: StockValidationConfig): boolean {
  return config.enabled && config.showWarnings
}

/**
 * Función para logging de configuración (debugging)
 * @param storeId ID de la tienda
 * @param config Configuración cargada
 */
export function logStockConfig(storeId: string, config: StoreStockConfig): void {
  console.log(`[Stock Config] Configuration for store ${storeId}:`, {
    validationEnabled: config.validation?.enabled,
    blockOnUnavailable: config.validation?.blockOnUnavailable,
    logOnly: config.validation?.logOnly,
    showWarnings: config.validation?.showWarnings,
    reserveStock: config.reserveStock,
    reserveDuration: config.reserveDurationMinutes
  })
}