import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { CartItem } from './cart-context'

export interface OrderData {
  orderId?: string
  orderNumber?: string
  storeId: string
  userId?: string | null
  items: OrderItem[]
  total: number
  paymentMethod: 'online' | 'cash_on_delivery'
  paymentSubMethod?: 'efectivo' | 'tarjeta' | 'yape'
  paymentStatus: 'pending'
  status: 'pending'
  customer: {
    name: string
    email?: string
    phone: string
    address?: string
  }
  shippingCost?: number
  deliveryType?: 'home_delivery' | 'store_pickup'
  addressCoordinates?: {
    lat: number
    lng: number
  }
  reference?: string
  notes?: string
  createdAt?: any
}

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  subtotal: number
  variant?: {
    id: string
    name: string
    price: number
  }
}

// Convert cart items to order items
export const convertCartItemsToOrderItems = (cartItems: CartItem[]): OrderItem[] => {
  console.log('Converting cart items:', cartItems)
  
  const orderItems = cartItems.map(item => {
    const orderItem: OrderItem = {
      id: item.id,
      productId: item.productId,
      name: item.name,
      price: item.variant?.price || item.price,
      quantity: item.quantity,
      subtotal: (item.variant?.price || item.price) * item.quantity
    }
    
    // Only add variant if it exists
    if (item.variant) {
      orderItem.variant = {
        id: item.variant.id,
        name: item.variant.name,
        price: item.variant.price
      }
    }
    
    return orderItem
  })
  
  console.log('Converted order items:', orderItems)
  return orderItems
}

// Helper function to validate and clean data for Firestore
const cleanOrderData = (data: any): any => {
  if (Array.isArray(data)) {
    return data.map(item => cleanOrderData(item))
  }
  
  if (data && typeof data === 'object') {
    const cleaned: any = {}
    
    for (const [key, value] of Object.entries(data)) {
      // Skip undefined and functions, but KEEP null values (especially userId: null)
      if (value === undefined || typeof value === 'function') {
        continue
      }
      
      // Special handling for userId - always include it even if null
      if (key === 'userId') {
        cleaned[key] = value
        continue
      }
      
      // Skip other null values except userId
      if (value === null) {
        continue
      }
      
      // Handle different data types
      if (Array.isArray(value)) {
        const cleanedArray = value.map(item => cleanOrderData(item))
        if (cleanedArray.length > 0) {
          cleaned[key] = cleanedArray
        }
      } else if (value && typeof value === 'object') {
        // Skip special Firestore objects (like serverTimestamp)
        if (value.constructor && value.constructor.name === 'Object') {
          const cleanedNested = cleanOrderData(value)
          if (Object.keys(cleanedNested).length > 0) {
            cleaned[key] = cleanedNested
          }
        } else {
          // For non-plain objects, try to convert to plain object
          try {
            const plainObject = JSON.parse(JSON.stringify(value))
            const cleanedNested = cleanOrderData(plainObject)
            if (Object.keys(cleanedNested).length > 0) {
              cleaned[key] = cleanedNested
            }
          } catch (e) {
            console.warn(`Skipping non-serializable object in field ${key}:`, value)
          }
        }
      } else if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
        // Primitive values are safe
        cleaned[key] = value
      } else {
        console.warn(`Skipping unknown data type in field ${key}:`, typeof value, value)
      }
    }
    
    return cleaned
  }
  
  return data
}

// Create order in Firestore
export const createOrder = async (orderData: OrderData): Promise<string> => {
  let cleanedOrderData: any = null
  
  try {
    console.log('Starting order creation process...')
    console.log('Store ID:', orderData.storeId)
    console.log('Original orderData.userId:', orderData.userId)
    console.log('Original orderData:', JSON.stringify(orderData, null, 2))
    
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }
    console.log('Firebase db connection OK')

    const ordersRef = collection(db, 'stores', orderData.storeId, 'orders')
    console.log('Orders collection reference created for path:', `stores/${orderData.storeId}/orders`)
    
    // Generate order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 5).toUpperCase()}`
    console.log('Generated order number:', orderNumber)
    
    // Clean the order data to remove undefined values and add order number
    cleanedOrderData = cleanOrderData({
      ...orderData,
      orderNumber
    })
    console.log('After cleaning - userId:', cleanedOrderData.userId)
    
    console.log('Cleaned order data before adding timestamp:', JSON.stringify(cleanedOrderData, null, 2))
    
    const orderToSave = {
      ...cleanedOrderData,
      createdAt: serverTimestamp()
    }

    console.log('Attempting to save order to Firestore...')
    const docRef = await addDoc(ordersRef, orderToSave)
    console.log('Order created successfully with ID:', docRef.id)
    return docRef.id
  } catch (error) {
    console.error('Error creating order:', error)
    console.error('Error type:', typeof error)
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : String(error))
    console.error('Error code:', (error as any)?.code)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack')
    
    if (cleanedOrderData) {
      console.error('Cleaned order data that failed:', JSON.stringify(cleanedOrderData, null, 2))
    }
    
    // Check if it's a permissions error
    if (error && typeof error === 'object' && 'code' in error) {
      const firebaseError = error as any
      if (firebaseError.code === 'permission-denied') {
        throw new Error('Error de permisos: No tienes autorización para crear pedidos. Contacta al administrador.')
      }
      if (firebaseError.code === 'invalid-argument') {
        throw new Error('Error en los datos: Algunos campos tienen valores inválidos.')
      }
    }
    
    throw new Error('Error al crear el pedido. Por favor intenta de nuevo.')
  }
}