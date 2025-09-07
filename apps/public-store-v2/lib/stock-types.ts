/**
 * Tipos para el sistema de validación de stock
 * 
 * Este archivo define las interfaces básicas para la validación de inventario.
 * No afecta el flujo actual - solo define tipos para uso futuro.
 */

import { CartItem } from './cart-context'

/**
 * Resultado de validación de stock para un producto específico
 */
export interface StockValidationResult {
  /** ID del producto validado */
  productId: string
  /** Cantidad solicitada por el usuario */
  requestedQuantity: number
  /** Si el producto está disponible en la cantidad solicitada */
  available: boolean
  /** Cantidad disponible en stock (solo si maneja stock) */
  availableStock?: number
  /** Mensaje descriptivo del estado */
  message?: string
  /** Si el producto maneja stock o no */
  manageStock: boolean
}

/**
 * Resultado completo de validación de un carrito
 */
export interface CartStockValidation {
  /** Resultados por producto */
  items: StockValidationResult[]
  /** Si todo el carrito está disponible */
  allAvailable: boolean
  /** Items que no están disponibles */
  unavailableItems: StockValidationResult[]
  /** Timestamp de la validación */
  validatedAt: Date
}

/**
 * Configuración de validación de stock por tienda
 */
export interface StockValidationConfig {
  /** Si la validación está habilitada */
  enabled: boolean
  /** Si debe bloquear el checkout en caso de stock insuficiente */
  blockOnUnavailable: boolean
  /** Solo registrar en logs sin afectar el flujo (para testing) */
  logOnly: boolean
}

/**
 * Opciones para la función de validación
 */
export interface StockValidationOptions {
  /** Configuración de validación */
  config?: StockValidationConfig
  /** Si debe usar cache o siempre consultar fresh data */
  useCache?: boolean
  /** Timeout en milisegundos para la validación */
  timeout?: number
}