import { collection, query, where, orderBy, getDocs, doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface CustomerOrder {
  id: string
  storeId: string
  customerId: string
  clientName: string
  clientPhone: string
  clientAddress?: string
  clientNotes?: string
  items: CustomerOrderItem[]
  subtotal: number
  shippingCost: number
  total: number
  paymentMethod: 'cash' | 'transfer' | 'card' | 'other'
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface CustomerOrderItem {
  id: string
  name: string
  presentation: string
  quantity: number
  price: number
  subtotal: number
  productId: string
}

// Obtener órdenes del cliente para una tienda específica
export const getCustomerOrders = async (storeId: string, customerId: string): Promise<CustomerOrder[]> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.error('Firebase db not available')
      return []
    }

    const ordersRef = collection(db, 'stores', storeId, 'orders')
    
    // Intentar con índices primero (nueva estructura con orderBy)
    try {
      let q = query(
        ordersRef,
        where('userId', '==', customerId),
        orderBy('createdAt', 'desc')
      )

      let querySnapshot = await getDocs(q)
      
      // Si no encuentra resultados, intentar con customerId (estructura antigua)
      if (querySnapshot.empty) {
        q = query(
          ordersRef,
          where('customerId', '==', customerId),
          orderBy('createdAt', 'desc')
        )
        querySnapshot = await getDocs(q)
      }

      const orders: CustomerOrder[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        
        // Adaptar los datos a la estructura esperada
        orders.push({
          id: doc.id,
          storeId: data.storeId,
          customerId: data.userId || data.customerId || customerId,
          clientName: data.customer?.name || data.clientName || '',
          clientPhone: data.customer?.phone || data.clientPhone || '',
          clientAddress: data.customer?.address || data.clientAddress || '',
          clientNotes: data.notes || data.clientNotes || '',
          items: data.items || [],
          subtotal: (data.total || 0) - (data.shippingCost || 0),
          shippingCost: data.shippingCost || 0,
          total: data.total || 0,
          paymentMethod: mapPaymentMethod(data.paymentMethod),
          status: mapOrderStatus(data.status),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date()
        })
      })

      // Ordenar manualmente por fecha si no se pudo usar orderBy
      return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())

    } catch (indexError: any) {
      console.log('Index not ready, using fallback query without orderBy:', indexError.message)
      
      // Fallback: consulta sin orderBy mientras se construyen los índices
      let q = query(
        ordersRef,
        where('userId', '==', customerId)
      )

      let querySnapshot = await getDocs(q)
      
      // Si no encuentra resultados, intentar con customerId (estructura antigua)
      if (querySnapshot.empty) {
        q = query(
          ordersRef,
          where('customerId', '==', customerId)
        )
        querySnapshot = await getDocs(q)
      }

      const orders: CustomerOrder[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        
        // Adaptar los datos a la estructura esperada
        orders.push({
          id: doc.id,
          storeId: data.storeId,
          customerId: data.userId || data.customerId || customerId,
          clientName: data.customer?.name || data.clientName || '',
          clientPhone: data.customer?.phone || data.clientPhone || '',
          clientAddress: data.customer?.address || data.clientAddress || '',
          clientNotes: data.notes || data.clientNotes || '',
          items: data.items || [],
          subtotal: (data.total || 0) - (data.shippingCost || 0),
          shippingCost: data.shippingCost || 0,
          total: data.total || 0,
          paymentMethod: mapPaymentMethod(data.paymentMethod),
          status: mapOrderStatus(data.status),
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || data.createdAt?.toDate() || new Date()
        })
      })

      // Ordenar manualmente por fecha descendente
      return orders.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    }

  } catch (error) {
    console.error('Error getting customer orders:', error)
    return []
  }
}

// Helper function to map payment methods
const mapPaymentMethod = (method: string): 'cash' | 'transfer' | 'card' | 'other' => {
  switch (method) {
    case 'online':
      return 'card'
    case 'cash_on_delivery':
      return 'cash'
    default:
      return 'other'
  }
}

// Helper function to map order status
const mapOrderStatus = (status: string): 'pending' | 'confirmed' | 'preparing' | 'ready' | 'shipped' | 'delivered' | 'cancelled' => {
  switch (status) {
    case 'pending':
      return 'pending'
    case 'confirmed':
      return 'confirmed'
    case 'preparing':
      return 'preparing'
    case 'ready':
      return 'ready'
    case 'shipped':
      return 'shipped'
    case 'delivered':
      return 'delivered'
    case 'cancelled':
      return 'cancelled'
    default:
      return 'pending'
  }
}

// Obtener una orden específica
export const getCustomerOrder = async (storeId: string, orderId: string, customerId: string): Promise<CustomerOrder | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.error('Firebase db not available')
      return null
    }

    const orderRef = doc(db, 'stores', storeId, 'orders', orderId)
    const orderDoc = await getDoc(orderRef)

    if (!orderDoc.exists()) {
      return null
    }

    const data = orderDoc.data()
    
    // Verificar que la orden pertenece al cliente
    if (data.customerId !== customerId) {
      return null
    }

    return {
      id: orderDoc.id,
      storeId: data.storeId,
      customerId: data.customerId,
      clientName: data.clientName,
      clientPhone: data.clientPhone,
      clientAddress: data.clientAddress,
      clientNotes: data.clientNotes,
      items: data.items || [],
      subtotal: data.subtotal || 0,
      shippingCost: data.shippingCost || 0,
      total: data.total || 0,
      paymentMethod: data.paymentMethod || 'cash',
      status: data.status || 'pending',
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date()
    }
  } catch (error) {
    console.error('Error getting customer order:', error)
    return null
  }
}

// Formatear fecha para mostrar
export const formatOrderDate = (date: Date): string => {
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Formatear moneda
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  const currencySymbols: { [key: string]: string } = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    COP: '$',
    MXN: '$',
    ARS: '$',
    CLP: '$',
    PEN: 'S/',
    BOB: 'Bs.',
    PYG: '₲',
    UYU: '$U'
  }

  const symbol = currencySymbols[currency] || currency
  return `${symbol}${amount.toLocaleString('es-ES', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
}

// Obtener texto del estado de la orden
export const getOrderStatusText = (status: CustomerOrder['status']): string => {
  const statusTexts = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    preparing: 'Preparando',
    ready: 'Listo',
    shipped: 'Enviado',
    delivered: 'Entregado',
    cancelled: 'Cancelado'
  }

  return statusTexts[status] || status
}

// Obtener color del estado
export const getOrderStatusColor = (status: CustomerOrder['status']): string => {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-gray-100 text-gray-800',
    preparing: 'bg-orange-100 text-orange-800',
    ready: 'bg-purple-100 text-purple-800',
    shipped: 'bg-gray-200 text-gray-900',
    delivered: 'bg-green-100 text-green-800',
    cancelled: 'bg-red-100 text-red-800'
  }

  return statusColors[status] || 'bg-gray-100 text-gray-800'
} 