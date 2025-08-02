'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseDb } from '../../../../lib/firebase'
import { useStore } from '../../../../lib/store-context'
import { useStoreAuth } from '../../../../lib/store-auth-context'
import { getCurrencySymbol } from '../../../../lib/store'
import Link from 'next/link'

interface OrderItem {
  id: string
  name: string
  price: number
  quantity: number
  variant?: {
    name: string
    price: number
  }
}

interface OrderData {
  id: string
  orderNumber: string
  items: OrderItem[]
  total: number
  shippingCost: number
  status: string
  paymentMethod: string
  paymentSubMethod?: string
  paymentStatus: string
  customer: {
    name: string
    phone: string
    email?: string
    address?: string
  }
  deliveryType?: string
  createdAt: any
  storeId: string
}

const Icons = {
  Check: () => (
    <svg className="w-16 h-16 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.63"/>
    </svg>
  ),
  Eye: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ),
  Info: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  )
}

export default function OrderConfirmationPage() {
  const params = useParams()
  const orderId = params?.orderId as string
  const { store } = useStore()
  const { isAuthenticated } = useStoreAuth()
  
  const [order, setOrder] = useState<OrderData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId || !store?.id) return

      try {
        const db = getFirebaseDb()
        if (!db) {
          throw new Error('Firebase database not available')
        }

        const orderDoc = await getDoc(doc(db, 'stores', store.id, 'orders', orderId))
        
        if (orderDoc.exists()) {
          const orderData = { id: orderDoc.id, ...orderDoc.data() } as OrderData
          setOrder(orderData)
        } else {
          setError('Pedido no encontrado')
        }
      } catch (err) {
        console.error('Error fetching order:', err)
        setError('Error al cargar el pedido')
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId, store?.id])

  const openWhatsApp = () => {
    if (store?.contact?.whatsapp && order) {
      const message = `Hola! Tengo una consulta sobre mi pedido #${order.orderNumber}`
      const whatsappUrl = `https://wa.me/${store.contact.whatsapp.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`
      window.open(whatsappUrl, '_blank')
    }
  }

  const getPaymentMethodText = (method: string, subMethod?: string) => {
    if (method === 'online') {
      return 'Pago en línea (MercadoPago)'
    } else if (method === 'cash_on_delivery') {
      switch (subMethod) {
        case 'efectivo':
          return 'Pago contra entrega - Efectivo'
        case 'tarjeta':
          return 'Pago contra entrega - Tarjeta'
        case 'yape':
          return 'Pago contra entrega - Yape'
        default:
          return 'Pago contra entrega'
      }
    }
    return method
  }

  const getDeliveryTypeText = (type: string) => {
    switch (type) {
      case 'home_delivery':
        return 'Envío a domicilio'
      case 'store_pickup':
        return 'Recojo en tienda'
      default:
        return type
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    )
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.996-.833-2.464 0L3.349 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-gray-900 mb-2">Error</h1>
            <p className="text-gray-600 mb-6">{error}</p>
            <Link href="/" className="bg-gray-900 text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors">
              Volver al inicio
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const currencySymbol = getCurrencySymbol(store?.currency || 'USD')

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header de confirmación */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-6 text-center">
          <div className="flex justify-center mb-4">
            <Icons.Check />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">¡Gracias por tu compra!</h1>
          <p className="text-lg text-gray-600 mb-4">Tu pedido fue creado exitosamente.</p>
          <div className="bg-gray-100 rounded-lg p-4 inline-block">
            <p className="text-sm text-gray-600">ID del pedido:</p>
            <p className="text-xl font-semibold text-gray-900">#{order.orderNumber}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal del pedido */}
          <div className="lg:col-span-2 space-y-6">
            {/* Productos */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Productos pedidos</h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex justify-between items-start border-b border-gray-200 pb-4 last:border-b-0 last:pb-0">
                    <div className="flex-1">
                      <h3 className="font-medium text-gray-900">{item.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-gray-600">{item.variant.name}</p>
                      )}
                      <p className="text-sm text-gray-600">Cantidad: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900">
                        {currencySymbol} {((item.variant?.price || item.price) * item.quantity).toFixed(2)}
                      </p>
                      <p className="text-sm text-gray-600">
                        {currencySymbol} {(item.variant?.price || item.price).toFixed(2)} c/u
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Total */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">{currencySymbol} {(order.total - order.shippingCost).toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-gray-600">Envío:</span>
                  <span className="font-medium">
                    {order.shippingCost === 0 ? 'Gratis' : `${currencySymbol} ${order.shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between items-center text-lg font-semibold text-gray-900 pt-2 border-t border-gray-200">
                  <span>Total:</span>
                  <span>{currencySymbol} {order.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Información de entrega y pago */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Detalles del pedido</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Información de entrega</h3>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Tipo:</span> {getDeliveryTypeText(order.deliveryType || 'home_delivery')}</p>
                    {order.customer.address && <p><span className="text-gray-600">Dirección:</span> {order.customer.address}</p>}
                    <p><span className="text-gray-600">Teléfono:</span> {order.customer.phone}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-gray-900 mb-2">Método de pago</h3>
                  <div className="space-y-2 text-sm">
                    <p>{getPaymentMethodText(order.paymentMethod, order.paymentSubMethod)}</p>
                    <p><span className="text-gray-600">Estado:</span> 
                      <span className="ml-1 px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">
                        Pendiente
                      </span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar con opciones */}
          <div className="space-y-6">
            {/* Acciones */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Opciones</h2>
              <div className="space-y-3">
                {isAuthenticated ? (
                  <Link 
                    href={`/mi-cuenta`}
                    className="w-full bg-gray-900 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Icons.Eye />
                    <span>Ver mis pedidos</span>
                  </Link>
                ) : (
                  <button
                    onClick={openWhatsApp}
                    className="w-full bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 transition-colors flex items-center justify-center space-x-2"
                  >
                    <Icons.WhatsApp />
                    <span>Contactar por WhatsApp</span>
                  </button>
                )}
              </div>
            </div>

            {/* Información de entrega */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <Icons.Info />
                <span>Información de entrega</span>
              </h2>
              <div className="space-y-3 text-sm text-gray-600">
                <div className="flex items-start space-x-2">
                  <Icons.Clock />
                  <div>
                    <p className="font-medium text-gray-900">Horarios de entrega</p>
                    <p>Lunes a Viernes: 9:00 AM - 6:00 PM</p>
                    <p>Sábados: 9:00 AM - 2:00 PM</p>
                  </div>
                </div>
                <div className="flex items-start space-x-2">
                  <Icons.Truck />
                  <div>
                    <p className="font-medium text-gray-900">Tiempo de entrega</p>
                    <p>1-2 días hábiles para Lima</p>
                    <p>2-5 días hábiles para provincias</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Enlaces útiles */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Enlaces útiles</h2>
              <div className="space-y-2">
                <Link 
                  href="../../../policies/shipping" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Políticas de envío
                </Link>
                <Link 
                  href="../../../policies/returns" 
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                >
                  Políticas de devoluciones
                </Link>
                <button
                  onClick={openWhatsApp}
                  className="block text-sm text-blue-600 hover:text-blue-800 hover:underline text-left"
                >
                  Contactar por WhatsApp
                </button>
              </div>
            </div>

            {/* Mensaje informativo */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>¿Tienes alguna consulta?</strong><br />
                Contáctanos por WhatsApp o revisa nuestras políticas de envío para más información.
              </p>
            </div>
          </div>
        </div>

        {/* Footer de la página */}
        <div className="mt-8 text-center">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Continuar comprando
          </Link>
        </div>
      </div>
    </div>
  )
}