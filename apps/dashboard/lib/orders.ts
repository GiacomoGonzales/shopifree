import { collection, doc, onSnapshot, updateDoc, orderBy, query, QuerySnapshot, DocumentData } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface OrderItem {
  id: string
  name: string
  presentation: string
  quantity: number
  price: number
  subtotal: number
  productId: string
}

// Tipos para el sistema de pagos
export type PaymentStatus = 
  | 'pending'           // Pendiente de pago
  | 'paid'             // Pagado completamente  
  | 'partial'          // Pago parcial
  | 'failed'           // Pago fallido
  | 'refunded'         // Reembolsado
  | 'cancelled'        // Cancelado (sin pago)

export type PaymentType =
  | 'cash_on_delivery'  // Efectivo contra entrega
  | 'card_on_delivery'  // Tarjeta contra entrega  
  | 'mobile_transfer'   // Yape, Plin, etc.
  | 'bank_transfer'     // Transferencia bancaria
  | 'online'           // Pago online (futuro)
  | 'mixed'            // Pago mixto

export interface Order {
  id: string
  userId: string
  createdAt: Date
  updatedAt: Date
  clientName: string
  clientPhone: string
  clientAddress?: string
  clientNotes?: string
  items: OrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  paymentMethod: 'cash' | 'transfer' | 'card' | 'other'
  status: string
  storeId: string
  
  // 🆕 NUEVOS CAMPOS DE PAGO (opcionales para backward compatibility)
  paymentStatus?: PaymentStatus
  paymentType?: PaymentType
  paidAmount?: number
  paymentNotes?: string
  paymentReference?: string
  paidAt?: Date | null
  processedBy?: string
}

// Obtener pedidos de una tienda en tiempo real
export const subscribeToStoreOrders = (
  storeId: string,
  callback: (orders: Order[]) => void,
  onError?: (error: Error) => void
) => {
  const db = getFirebaseDb()
  if (!db) {
    console.error('Firebase not initialized')
    return () => {}
  }
  
  const ordersRef = collection(db, 'stores', storeId, 'orders')
  const ordersQuery = query(ordersRef, orderBy('createdAt', 'desc'))

  return onSnapshot(
    ordersQuery,
    (snapshot: QuerySnapshot<DocumentData>) => {
      const orders: Order[] = []
      snapshot.forEach((doc) => {
        orders.push({
          id: doc.id,
          ...doc.data()
        } as Order)
      })
      callback(orders)
    },
    (error) => {
      console.error('Error fetching orders:', error)
      if (onError) onError(error)
    }
  )
}

// Actualizar estado de un pedido
export const updateOrderStatus = async (
  storeId: string,
  orderId: string,
  status: Order['status']
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }
    
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId)
    await updateDoc(orderRef, {
      status,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

// Formatear fecha para mostrar
export const formatOrderDate = (timestamp: unknown, locale: string = 'es-ES'): string => {
  if (!timestamp) return 'Fecha no disponible'
  
  try {
    // Type guard para objetos con método toDate
    const hasToDate = (obj: unknown): obj is { toDate: () => Date } => {
      return typeof obj === 'object' && obj !== null && 'toDate' in obj && typeof (obj as { toDate: unknown }).toDate === 'function'
    }
    
    const date = hasToDate(timestamp) ? timestamp.toDate() : new Date(timestamp as string | number | Date)
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date)
  } catch (error) {
    console.error('Error formatting date:', error)
    return 'Fecha inválida'
  }
}

// Formatear moneda
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  // Mapear códigos de moneda a símbolos específicos
  const currencySymbols: { [key: string]: string } = {
    'USD': '$',
    'PEN': 'S/',
    'EUR': '€',
    'GBP': '£',
    'JPY': '¥',
    'CNY': '¥',
    'CAD': 'C$',
    'AUD': 'A$',
    'MXN': '$',
    'BRL': 'R$',
    'COP': '$',
    'CLP': '$',
    'ARS': '$',
    'UYU': '$',
    'BOB': 'Bs',
    'PYG': '₲',
    'VES': 'Bs'
  }

  const symbol = currencySymbols[currency.toUpperCase()] || currency

  // Formatear el número con separadores de miles
  const formattedAmount = new Intl.NumberFormat('es-ES', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)

  return `${symbol} ${formattedAmount}`
}

// Generar mensaje de WhatsApp
export const generateWhatsAppMessage = (
  order: Order,
  storeName: string,
  locale: string = 'es'
): string => {
  const statusTranslations = {
    es: {
      pending: 'Pendiente',
      confirmed: 'Confirmado',
      preparing: 'Preparando',
      ready: 'Listo',
      shipped: 'Enviado',
      delivered: 'Entregado',
      cancelled: 'Cancelado'
    },
    en: {
      pending: 'Pending',
      confirmed: 'Confirmed',
      preparing: 'Preparing',
      ready: 'Ready',
      shipped: 'Shipped',
      delivered: 'Delivered',
      cancelled: 'Cancelled'
    }
  }

  const greetings = {
    es: `Hola! Te escribo desde ${storeName} sobre tu pedido #${order.id}.\n\nTu pedido está ahora en estado: ${statusTranslations.es[order.status as keyof typeof statusTranslations.es]}`,
    en: `Hello! I'm writing from ${storeName} about your order #${order.id}.\n\nYour order is now in status: ${statusTranslations.en[order.status as keyof typeof statusTranslations.en]}`
  }

  return encodeURIComponent(greetings[locale as keyof typeof greetings] || greetings.es)
}

// Generar URL de WhatsApp
export const generateWhatsAppURL = (phone: string, message: string): string => {
  // Limpiar número de teléfono (quitar espacios, guiones, etc.)
  const cleanPhone = phone.replace(/[^\d+]/g, '')
  return `https://wa.me/${cleanPhone}?text=${message}`
}

// 🆕 FUNCIONES PARA MANEJO DE PAGOS

// Mapear paymentMethod legacy a PaymentType nuevo
export const mapLegacyPaymentMethod = (legacyMethod: string): PaymentType => {
  switch (legacyMethod) {
    case 'cash': return 'cash_on_delivery'
    case 'card': return 'card_on_delivery' 
    case 'transfer': return 'mobile_transfer'
    default: return 'cash_on_delivery'
  }
}

// Obtener estado de pago inicial basado en método
export const getInitialPaymentStatus = (paymentType: PaymentType): PaymentStatus => {
  switch (paymentType) {
    case 'online':
      return 'paid' // Pago online ya está procesado
    case 'cash_on_delivery':
    case 'card_on_delivery':
    case 'mobile_transfer':
    case 'bank_transfer':
    case 'mixed':
    default:
      return 'pending' // Requiere confirmación manual
  }
}

// Actualizar estado de pago de un pedido
export const updateOrderPaymentStatus = async (
  storeId: string,
  orderId: string,
  paymentStatus: PaymentStatus,
  paymentData?: {
    paidAmount?: number
    paymentNotes?: string
    paymentReference?: string
    processedBy?: string
  }
): Promise<void> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase not initialized')
    }
    
    const orderRef = doc(db, 'stores', storeId, 'orders', orderId)
    const updateData: any = {
      paymentStatus,
      updatedAt: new Date()
    }

    // Agregar timestamp de pago si se marca como pagado
    if (paymentStatus === 'paid') {
      updateData.paidAt = new Date()
    }

    // Agregar datos adicionales del pago si se proporcionan
    if (paymentData) {
      if (paymentData.paidAmount !== undefined) updateData.paidAmount = paymentData.paidAmount
      if (paymentData.paymentNotes) updateData.paymentNotes = paymentData.paymentNotes
      if (paymentData.paymentReference) updateData.paymentReference = paymentData.paymentReference
      if (paymentData.processedBy) updateData.processedBy = paymentData.processedBy
    }

    await updateDoc(orderRef, updateData)
  } catch (error) {
    console.error('Error updating payment status:', error)
    throw error
  }
} 