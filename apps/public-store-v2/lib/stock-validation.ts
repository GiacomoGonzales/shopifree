/**
 * Servicio de validación de stock
 * 
 * Funciones para validar disponibilidad de productos en el carrito.
 * Esta implementación inicial NO afecta el flujo existente - solo proporciona
 * funcionalidad de consulta sin side effects.
 */

import { getFirebaseDb } from './firebase'
import { doc, getDoc, collection, getDocs, query, where } from 'firebase/firestore'
import { CartItem } from './cart-context'
import { 
  StockValidationResult, 
  CartStockValidation, 
  StockValidationOptions 
} from './stock-types'

/**
 * Valida el stock de un producto individual
 * @param productId ID del producto a validar
 * @param requestedQuantity Cantidad solicitada
 * @param options Opciones de validación
 * @returns Resultado de validación para el producto
 */
export async function validateProductStock(
  productId: string, 
  requestedQuantity: number,
  options: StockValidationOptions = {}
): Promise<StockValidationResult> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('[Stock Validation] Firebase not initialized, assuming available')
      return {
        productId,
        requestedQuantity,
        available: true,
        manageStock: false,
        message: 'Firebase not available - assuming stock available'
      }
    }

    // Obtener información del producto
    const productRef = doc(db, 'products', productId)
    const productSnap = await getDoc(productRef)
    
    if (!productSnap.exists()) {
      return {
        productId,
        requestedQuantity,
        available: false,
        manageStock: false,
        message: 'Producto no encontrado'
      }
    }

    const productData = productSnap.data()
    
    // Si el producto NO maneja stock, siempre está disponible
    if (!productData.manageStock) {
      return {
        productId,
        requestedQuantity,
        available: true,
        manageStock: false,
        message: 'Producto sin manejo de stock - siempre disponible'
      }
    }

    // Si SÍ maneja stock, verificar cantidad disponible
    const currentStock = productData.stock || 0
    const isAvailable = currentStock >= requestedQuantity

    return {
      productId,
      requestedQuantity,
      available: isAvailable,
      availableStock: currentStock,
      manageStock: true,
      message: isAvailable 
        ? `Stock suficiente: ${currentStock} disponibles`
        : `Stock insuficiente: solo ${currentStock} disponibles, se requieren ${requestedQuantity}`
    }

  } catch (error) {
    console.error('[Stock Validation] Error validating product:', productId, error)
    
    // En caso de error, asumir disponible para no romper el flujo
    return {
      productId,
      requestedQuantity,
      available: true,
      manageStock: false,
      message: `Error de validación: ${error instanceof Error ? error.message : 'Unknown error'} - asumiendo disponible`
    }
  }
}

/**
 * Valida el stock de todos los productos en un carrito
 * @param cartItems Items del carrito a validar
 * @param options Opciones de validación
 * @returns Resultado completo de validación del carrito
 */
export async function validateCartStock(
  cartItems: CartItem[], 
  options: StockValidationOptions = {}
): Promise<CartStockValidation> {
  const startTime = Date.now()
  
  try {
    console.log(`[Stock Validation] Validating ${cartItems.length} items...`)

    // Validar cada producto en paralelo para mejor performance
    const validationPromises = cartItems.map(item => 
      validateProductStock(item.id, item.quantity, options)
    )

    const validationResults = await Promise.all(validationPromises)
    
    // Identificar items no disponibles
    const unavailableItems = validationResults.filter(result => !result.available)
    const allAvailable = unavailableItems.length === 0

    const result: CartStockValidation = {
      items: validationResults,
      allAvailable,
      unavailableItems,
      validatedAt: new Date()
    }

    const duration = Date.now() - startTime
    console.log(`[Stock Validation] Completed in ${duration}ms:`, {
      totalItems: cartItems.length,
      availableItems: validationResults.filter(r => r.available).length,
      unavailableItems: unavailableItems.length,
      allAvailable
    })

    return result

  } catch (error) {
    console.error('[Stock Validation] Error validating cart:', error)
    
    // En caso de error general, asumir todo disponible para no romper el flujo
    return {
      items: cartItems.map(item => ({
        productId: item.id,
        requestedQuantity: item.quantity,
        available: true,
        manageStock: false,
        message: `Error de validación general - asumiendo disponible`
      })),
      allAvailable: true,
      unavailableItems: [],
      validatedAt: new Date()
    }
  }
}

/**
 * Función de utilidad para logging de resultados de validación
 * @param validation Resultado de validación a loggear
 */
export function logStockValidation(validation: CartStockValidation): void {
  if (validation.allAvailable) {
    console.log('✅ [Stock Validation] All items available')
  } else {
    console.warn('⚠️ [Stock Validation] Some items unavailable:', {
      unavailableCount: validation.unavailableItems.length,
      unavailableItems: validation.unavailableItems.map(item => ({
        productId: item.productId,
        requested: item.requestedQuantity,
        available: item.availableStock,
        message: item.message
      }))
    })
  }
}