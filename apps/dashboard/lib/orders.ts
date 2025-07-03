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
export const formatOrderDate = (timestamp: any, locale: string = 'es-ES'): string => {
  if (!timestamp) return 'Fecha no disponible'
  
  try {
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
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
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency
  }).format(amount)
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

export async function getOrders(userId: string): Promise<Order[]> {
  // ... existing code ...
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  // ... existing code ...
} 