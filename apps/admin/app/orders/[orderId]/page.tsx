"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { getFirebaseDb } from "../../../lib/firebase"
import AdminLayout from "../../../components/layout/AdminLayout"
import Link from "next/link"
import { useParams } from "next/navigation"

interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  image?: string
  variant?: {
    id: string
    name: string
    price: number
  }
}

type FirebaseTimestamp = {
  toDate: () => Date
  seconds: number
  nanoseconds: number
} | { seconds: number } | string | Date

interface Order {
  id: string
  userId: string
  userEmail?: string
  userName?: string
  userPhone?: string
  storeId: string
  items: OrderItem[]
  subtotal: number
  total: number
  currency: string
  status: string
  paymentMethod?: string
  shippingAddress?: {
    street?: string
    city?: string
    state?: string
    zipCode?: string
    country?: string
  }
  notes?: string
  createdAt: FirebaseTimestamp
  updatedAt: FirebaseTimestamp
}

interface Store {
  storeName: string
  subdomain: string
  currency: string
  primaryColor: string
  logoUrl?: string
}

export default function OrderDetailPage() {
  const params = useParams()
  const orderId = params?.orderId as string

  const [order, setOrder] = useState<Order | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadOrder = async () => {
      try {
        setLoading(true)
        const db = getFirebaseDb()
        if (!db) {
          console.error("Firebase DB not available")
          return
        }

        // Las órdenes están en subcolecciones de stores
        // Necesitamos buscar en todas las tiendas
        const storesSnapshot = await getDocs(collection(db, "stores"))
        let foundOrder: Order | null = null
        let foundStore: Store | null = null

        for (const storeDoc of storesSnapshot.docs) {
          const orderDoc = await getDoc(doc(db, "stores", storeDoc.id, "orders", orderId))

          if (orderDoc.exists()) {
            const storeData = storeDoc.data()
            foundStore = {
              storeName: storeData.storeName,
              subdomain: storeData.subdomain,
              currency: storeData.currency,
              primaryColor: storeData.primaryColor,
              logoUrl: storeData.logoUrl
            }

            const data = orderDoc.data()
            foundOrder = {
              id: orderDoc.id,
              userId: data.userId || "",
              userEmail: data.userEmail || data.email,
              userName: data.userName || data.customerName,
              userPhone: data.userPhone || data.phone,
              storeId: storeDoc.id,
              items: data.items || [],
              subtotal: data.subtotal || 0,
              total: data.total || 0,
              currency: foundStore.currency,
              status: data.status || "pending",
              paymentMethod: data.paymentMethod,
              shippingAddress: data.shippingAddress,
              notes: data.notes,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            }
            break
          }
        }

        if (foundOrder && foundStore) {
          setOrder(foundOrder)
          setStore(foundStore)
        } else {
          console.error("Order not found in any store")
        }
      } catch (error) {
        console.error("Error loading order:", error)
      } finally {
        setLoading(false)
      }
    }

    if (orderId) {
      loadOrder()
    }
  }, [orderId])

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  const formatDate = (timestamp: FirebaseTimestamp) => {
    if (!timestamp) return "Sin fecha"

    try {
      if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }

      if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }

      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        }
      }

      return "Sin fecha"
    } catch {
      return "Sin fecha"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "paid":
      case "processing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "shipped":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "pending":
        return "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
      case "cancelled":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-slate-600/10 text-slate-400 border-slate-600/20"
    }
  }

  const getStatusLabel = (status: string) => {
    const labels: { [key: string]: string } = {
      pending: "Pendiente",
      paid: "Pagado",
      processing: "Procesando",
      shipped: "Enviado",
      completed: "Completado",
      cancelled: "Cancelado"
    }
    return labels[status] || status
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-10 w-10 text-emerald-500"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            <p className="text-slate-400 text-lg">Loading order details...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!order) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <svg className="w-20 h-20 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Order Not Found</h2>
          <p className="text-slate-400 mb-6">The order you&apos;re looking for doesn&apos;t exist</p>
          <Link
            href="/orders"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Back to Orders
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/orders"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Order Details</h1>
              <p className="text-sm text-slate-400 mt-1 font-mono">#{order.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold border ${getStatusColor(order.status)}`}>
              {getStatusLabel(order.status)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">
                Order Items ({order.items.length})
              </h2>
              <div className="space-y-4">
                {order.items.map((item, index) => (
                  <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-700 last:border-0 last:pb-0">
                    <div className="flex-shrink-0 w-16 h-16 bg-slate-700 rounded-lg flex items-center justify-center">
                      {item.image ? (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-white font-medium">{item.name}</h3>
                      {item.variant && (
                        <p className="text-sm text-slate-400 mt-1">
                          Variant: {item.variant.name}
                        </p>
                      )}
                      <div className="flex items-center gap-4 mt-2 text-sm">
                        <span className="text-slate-400">Qty: {item.quantity}</span>
                        <span className="text-slate-400">×</span>
                        <span className="text-white font-semibold">
                          {formatCurrency(item.variant?.price || item.price, order.currency)}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold">
                        {formatCurrency((item.variant?.price || item.price) * item.quantity, order.currency)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Order Totals */}
              <div className="mt-6 pt-6 border-t border-slate-700 space-y-2">
                <div className="flex justify-between text-slate-300">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal, order.currency)}</span>
                </div>
                <div className="flex justify-between text-white font-bold text-lg">
                  <span>Total:</span>
                  <span>{formatCurrency(order.total, order.currency)}</span>
                </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Customer Information</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                  <p className="text-white">{order.userName || "Guest"}</p>
                </div>
                {order.userEmail && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Email</label>
                    <p className="text-white">{order.userEmail}</p>
                  </div>
                )}
                {order.userPhone && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Phone</label>
                    <p className="text-white">{order.userPhone}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Shipping Address */}
            {order.shippingAddress && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Shipping Address</h2>
                <div className="text-slate-300 space-y-1">
                  {order.shippingAddress.street && <p>{order.shippingAddress.street}</p>}
                  <p>
                    {[
                      order.shippingAddress.city,
                      order.shippingAddress.state,
                      order.shippingAddress.zipCode
                    ].filter(Boolean).join(', ')}
                  </p>
                  {order.shippingAddress.country && <p>{order.shippingAddress.country}</p>}
                </div>
              </div>
            )}

            {/* Notes */}
            {order.notes && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Order Notes</h2>
                <p className="text-slate-300 whitespace-pre-wrap">{order.notes}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Store Information */}
            {store && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Store</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt={store.storeName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-emerald-500 font-semibold text-lg">
                          {store.storeName[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{store.storeName}</p>
                      <p className="text-xs text-slate-400">{store.subdomain}.shopifree.app</p>
                    </div>
                  </div>
                  <Link
                    href={`/stores/${order.storeId}`}
                    className="block w-full text-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                  >
                    View Store Details
                  </Link>
                </div>
              </div>
            )}

            {/* Payment Method */}
            {order.paymentMethod && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Payment</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Method</label>
                  <p className="text-white capitalize">{order.paymentMethod}</p>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Timeline</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Created</label>
                  <p className="text-white text-sm">{formatDate(order.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Last Updated</label>
                  <p className="text-white text-sm">{formatDate(order.updatedAt)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
