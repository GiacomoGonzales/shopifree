"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, query } from "firebase/firestore"
import { getFirebaseDb } from "../../lib/firebase"
import AdminLayout from "../../components/layout/AdminLayout"
import Link from "next/link"

interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  variant?: {
    id: string
    name: string
  }
}

type FirebaseTimestamp = {
  toDate: () => Date
  toMillis: () => number
  seconds: number
  nanoseconds: number
} | { seconds: number } | string | Date

interface ShippingAddress {
  street?: string
  city?: string
  state?: string
  zipCode?: string
  country?: string
}

interface Order {
  id: string
  userId: string
  userEmail?: string
  userName?: string
  storeId: string
  storeName?: string
  storeSubdomain?: string
  items: OrderItem[]
  subtotal: number
  total: number
  currency: string
  status: string
  paymentMethod?: string
  shippingAddress?: ShippingAddress
  createdAt: FirebaseTimestamp
  updatedAt: FirebaseTimestamp
}

interface Store {
  id: string
  storeName: string
  subdomain: string
  currency: string
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const loadStores = useCallback(async () => {
    try {
      const db = getFirebaseDb()
      if (!db) return []

      const storesSnapshot = await getDocs(collection(db, "stores"))
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        storeName: doc.data().storeName,
        subdomain: doc.data().subdomain,
        currency: doc.data().currency
      })) as Store[]

      return storesData
    } catch (error) {
      console.error("Error loading stores:", error)
      return []
    }
  }, [])

  const loadOrders = useCallback(async () => {
    try {
      setLoading(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase DB not available")
        return
      }

      // Cargar tiendas primero
      const storesData = await loadStores()
      setStores(storesData)

      // Cargar órdenes de todas las tiendas (están en subcolecciones)
      const allOrders: Order[] = []

      for (const store of storesData) {
        const ordersQuery = query(collection(db, "stores", store.id, "orders"))
        const ordersSnapshot = await getDocs(ordersQuery)

        ordersSnapshot.docs.forEach(doc => {
          const data = doc.data()

          allOrders.push({
            id: doc.id,
            userId: data.userId || "",
            userEmail: data.userEmail || data.email,
            userName: data.userName || data.customerName,
            storeId: store.id,
            storeName: store.storeName,
            storeSubdomain: store.subdomain,
            items: data.items || [],
            subtotal: data.subtotal || 0,
            total: data.total || 0,
            currency: store.currency,
            status: data.status || "pending",
            paymentMethod: data.paymentMethod,
            shippingAddress: data.shippingAddress,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          })
        })
      }

      // Ordenar por fecha de creación (más recientes primero)
      allOrders.sort((a, b) => {
        const aTime = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0
        const bTime = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0
        return bTime - aTime
      })

      setOrders(allOrders)
    } catch (error) {
      console.error("Error loading orders:", error)
    } finally {
      setLoading(false)
    }
  }, [loadStores])

  useEffect(() => {
    loadOrders()
  }, [loadOrders])

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStore, selectedStatus])

  const filteredOrders = orders.filter(order => {
    // Filtro de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        order.id?.toLowerCase().includes(search) ||
        order.userEmail?.toLowerCase().includes(search) ||
        order.userName?.toLowerCase().includes(search) ||
        order.storeName?.toLowerCase().includes(search)
      if (!matchesSearch) return false
    }

    // Filtro de tienda
    if (selectedStore !== "all" && order.storeId !== selectedStore) {
      return false
    }

    // Filtro de estado
    if (selectedStatus !== "all" && order.status !== selectedStatus) {
      return false
    }

    return true
  })

  // Paginación
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedOrders = filteredOrders.slice(startIndex, endIndex)

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
          month: "short",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }

      if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
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
            month: "short",
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

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Orders Management</h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">Manage all orders across all stores</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs sm:text-sm">
              Total: <span className="font-bold text-white">{orders.length}</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by order ID, customer email, or store..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Store Filter */}
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Stores</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.storeName}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="pending">Pendiente</option>
                <option value="paid">Pagado</option>
                <option value="processing">Procesando</option>
                <option value="shipped">Enviado</option>
                <option value="completed">Completado</option>
                <option value="cancelled">Cancelado</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={loadOrders}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Orders Table/Cards */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-emerald-500"
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
                <p className="text-slate-400">Loading orders...</p>
              </div>
            </div>
          ) : paginatedOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-slate-400 text-lg font-medium mb-1">No orders found</p>
              <p className="text-slate-500 text-sm">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Order ID</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Customer</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Store</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Total</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Items</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-mono text-emerald-400">
                            {order.id.substring(0, 8)}...
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm">
                            <div className="font-medium text-white truncate max-w-xs">
                              {order.userName || "Guest"}
                            </div>
                            <div className="text-xs text-slate-400 truncate max-w-xs">
                              {order.userEmail || "No email"}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-white">{order.storeName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-white">
                            {formatCurrency(order.total, order.currency)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-300">
                            {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                            {getStatusLabel(order.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {formatDate(order.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Link
                            href={`/orders/${order.id}`}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors"
                            title="View details"
                          >
                            <svg className="w-5 h-5 inline-block" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-slate-700">
                {paginatedOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-mono text-emerald-400 mb-1">
                          #{order.id.substring(0, 12)}...
                        </p>
                        <p className="text-sm font-medium text-white truncate">
                          {order.userName || "Guest"}
                        </p>
                        <p className="text-xs text-slate-400 truncate">{order.userEmail}</p>
                      </div>
                      <Link
                        href={`/orders/${order.id}`}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                      <span className="font-semibold text-white text-sm">
                        {formatCurrency(order.total, order.currency)}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">
                        {order.items.length} {order.items.length === 1 ? 'item' : 'items'}
                      </span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">{order.storeName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold border ${getStatusColor(order.status)}`}>
                        {getStatusLabel(order.status)}
                      </span>
                      <span className="text-slate-400 text-xs">{formatDate(order.createdAt)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-white">{Math.min(endIndex, filteredOrders.length)}</span> of{" "}
              <span className="font-semibold text-white">{filteredOrders.length}</span> orders
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div className="text-center text-sm text-slate-400">
            Total: <span className="font-semibold text-white">{filteredOrders.length}</span> orders found
            {orders.length !== filteredOrders.length && (
              <span> (filtered from <span className="font-semibold text-white">{orders.length}</span> total)</span>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
