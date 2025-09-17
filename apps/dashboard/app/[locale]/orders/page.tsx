'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useAuth } from '../../../lib/simple-auth-context'
import { getUserStore } from '../../../lib/store'
import DashboardLayout from '../../../components/DashboardLayout'
import { 
  subscribeToStoreOrders, 
  updateOrderStatus, 
  updateOrderPaymentStatus,
  formatOrderDate, 
  formatCurrency,
  generateWhatsAppMessage,
  generateWhatsAppURL,
  Order,
  OrderItem,
  PaymentStatus
} from '../../../lib/orders'

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [updating, setUpdating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [paymentFormData, setPaymentFormData] = useState({
    paymentStatus: 'paid' as PaymentStatus,
    paidAmount: '',
    paymentReference: '',
    paymentNotes: ''
  })
  const [storeData, setStoreData] = useState<{ id: string; storeName: string; currency: string } | null>(null)

  // Estados para filtros y paginación
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [paymentFilter, setPaymentFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('date-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  const itemsPerPage = 10
  
  const { user } = useAuth()
  const t = useTranslations('orders')

  // Cargar datos de la tienda y suscribirse a pedidos
  useEffect(() => {
    const loadStoreAndOrders = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }
      
      setLoading(true) // Reiniciar loading al cambiar de usuario

      try {
        // Obtener datos de la tienda
        const store = await getUserStore(user.uid)
        if (!store) {
          console.error('No store found for user')
          return
        }
        
        setStoreData(store)

        // Suscribirse a pedidos en tiempo real
        const unsubscribe = subscribeToStoreOrders(
          store.id,
          (ordersData) => {
            setOrders(ordersData)
            setLoading(false) // Marcar como cargado cuando lleguen los datos
          },
          (error) => {
            console.error('Error loading orders:', error)
            setLoading(false) // También marcar como cargado en caso de error
          }
        )

        // Cleanup function
        return () => unsubscribe()
      } catch (error) {
        console.error('Error loading store:', error)
        setLoading(false) // Marcar como cargado también en caso de error
      }
    }

    const cleanup = loadStoreAndOrders()
    return () => {
      if (cleanup instanceof Promise) {
        cleanup.then(fn => fn && fn())
      }
    }
  }, [user?.uid])

  // Lógica de filtrado y paginación
  useEffect(() => {
    let filtered = [...orders]

    // Aplicar búsqueda
    if (searchQuery.trim()) {
      const searchTerm = searchQuery.toLowerCase()
      filtered = filtered.filter(order =>
        order.clientName?.toLowerCase().includes(searchTerm) ||
        order.clientPhone?.toLowerCase().includes(searchTerm) ||
        (order as any).email?.toLowerCase().includes(searchTerm) ||
        order.id.toLowerCase().includes(searchTerm)
      )
    }

    // Aplicar filtro de estado
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Aplicar filtro de pago
    if (paymentFilter !== 'all') {
      filtered = filtered.filter(order => (order as any).paymentStatus === paymentFilter)
    }

    // Aplicar ordenamiento
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        case 'date-asc':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        case 'total-desc':
          return b.total - a.total
        case 'total-asc':
          return a.total - b.total
        case 'customer-asc':
          return (a.clientName || '').localeCompare(b.clientName || '')
        case 'customer-desc':
          return (b.clientName || '').localeCompare(a.clientName || '')
        default:
          return 0
      }
    })

    // Calcular paginación
    const totalItems = filtered.length
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    const paginatedOrders = filtered.slice(startIndex, endIndex)

    setFilteredOrders(paginatedOrders)
    setTotalItems(totalItems)
    setTotalPages(totalPages)
  }, [orders, searchQuery, statusFilter, paymentFilter, sortBy, currentPage])

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, statusFilter, paymentFilter, sortBy])

  // Manejar cambio de estado
  const handleStatusUpdate = async (orderId: string, newStatus: Order['status']) => {
    if (!storeData) return

    try {
      setUpdating(true)
      await updateOrderStatus(storeData.id, orderId, newStatus)
      
      // Actualizar el pedido localmente para feedback inmediato
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      )

      // Actualizar también el pedido seleccionado si es el mismo
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, status: newStatus } : null)
      }
    } catch (error) {
      console.error('Error updating order status:', error)
    } finally {
      setUpdating(false)
    }
  }

  // Abrir WhatsApp
  const handleWhatsAppReply = (order: Order) => {
    if (!storeData || !order.clientPhone) return

    const message = generateWhatsAppMessage(order, storeData.storeName, 'es')
    const url = generateWhatsAppURL(order.clientPhone, message)
    window.open(url, '_blank')
  }

  // 🆕 Manejar cambio de estado de pago (simple)
  const handlePaymentStatusUpdate = async (orderId: string, newPaymentStatus: PaymentStatus) => {
    if (!storeData) return

    try {
      setUpdating(true)
      await updateOrderPaymentStatus(storeData.id, orderId, newPaymentStatus)
      
      // Actualizar el pedido localmente para feedback inmediato
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === orderId ? { ...order, paymentStatus: newPaymentStatus } : order
        )
      )

      // Actualizar también el pedido seleccionado si es el mismo
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(prev => prev ? { ...prev, paymentStatus: newPaymentStatus } : null)
      }
    } catch (error) {
      console.error('Error updating payment status:', error)
    } finally {
      setUpdating(false)
    }
  }

  // 🆕 Abrir modal de pago avanzado
  const openPaymentModal = (order: Order) => {
    setPaymentFormData({
      paymentStatus: 'paid',
      paidAmount: order.total.toString(),
      paymentReference: '',
      paymentNotes: ''
    })
    setPaymentModalOpen(true)
  }

  // 🆕 Manejar actualización avanzada de pago
  const handleAdvancedPaymentUpdate = async () => {
    if (!selectedOrder || !storeData) return

    try {
      setUpdating(true)
      
      const paidAmount = parseFloat(paymentFormData.paidAmount) || 0
      
      await updateOrderPaymentStatus(
        storeData.id, 
        selectedOrder.id, 
        paymentFormData.paymentStatus,
        {
          paidAmount,
          paymentReference: paymentFormData.paymentReference,
          paymentNotes: paymentFormData.paymentNotes,
          processedBy: user?.email || 'Admin'
        }
      )
      
      // Actualizar localmente
      const updatedOrder = {
        ...selectedOrder,
        paymentStatus: paymentFormData.paymentStatus,
        paidAmount,
        paymentReference: paymentFormData.paymentReference,
        paymentNotes: paymentFormData.paymentNotes,
        processedBy: user?.email || 'Admin',
        paidAt: paymentFormData.paymentStatus === 'paid' ? new Date() : null
      }
      
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.id === selectedOrder.id ? updatedOrder : order
        )
      )
      
      setSelectedOrder(updatedOrder)
      setPaymentModalOpen(false)
      
    } catch (error) {
      console.error('Error updating payment:', error)
      alert('Error al actualizar el pago. Por favor intenta de nuevo.')
    } finally {
      setUpdating(false)
    }
  }

  // Componente de estado con colores
  const StatusBadge = ({ status }: { status: Order['status'] }) => {
    const colorMap = {
      pending: 'bg-yellow-100 text-yellow-800',
      whatsapp_sent: 'bg-green-100 text-green-800',
      confirmed: 'bg-gray-100 text-gray-800',
      preparing: 'bg-orange-100 text-orange-800',
      ready: 'bg-purple-100 text-purple-800',
      shipped: 'bg-gray-200 text-gray-900',
      delivered: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800'
    } as const

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colorMap[status as keyof typeof colorMap]}`}>
        {t(`status.${status}`)}
      </span>
    )
  }

  // El loading lo maneja el DashboardLayout, no mostramos loading individual aquí

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Barra de controles */}
          {!loading && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="px-4 sm:px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Información de totales */}
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{totalItems}</span>
                    <span className="ml-1">
                      {totalItems === 1 ? 'pedido' : 'pedidos'}
                    </span>
                  </div>

                  {/* Controles de búsqueda y filtros */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Barra de búsqueda */}
                    <div className="relative flex-1 sm:flex-none">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                        placeholder="Buscar por cliente, teléfono o ID..."
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Filtro de estado */}
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      >
                        <option value="all">Todos los estados</option>
                        <option value="pending">Pendiente</option>
                        <option value="whatsapp_sent">Enviado por WhatsApp</option>
                        <option value="confirmed">Confirmado</option>
                        <option value="preparing">Preparando</option>
                        <option value="ready">Listo</option>
                        <option value="shipped">Enviado</option>
                        <option value="delivered">Entregado</option>
                        <option value="cancelled">Cancelado</option>
                      </select>

                      {/* Filtro de pago */}
                      <select
                        value={paymentFilter}
                        onChange={(e) => setPaymentFilter(e.target.value)}
                        className="block w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      >
                        <option value="all">Todos los pagos</option>
                        <option value="pending">Pago pendiente</option>
                        <option value="paid">Pagado</option>
                        <option value="partial">Pago parcial</option>
                        <option value="failed">Pago fallido</option>
                      </select>

                      {/* Ordenar */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="block w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-all"
                      >
                        <option value="date-desc">Más recientes</option>
                        <option value="date-asc">Más antiguos</option>
                        <option value="total-desc">Mayor total</option>
                        <option value="total-asc">Menor total</option>
                        <option value="customer-asc">Cliente A-Z</option>
                        <option value="customer-desc">Cliente Z-A</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="mt-8">
            {loading ? (
              // Estado de carga
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.date')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.customer')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.total')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.paymentMethod')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {/* Skeleton rows */}
                      {[...Array(5)].map((_, index) => (
                        <tr key={index} className="animate-pulse">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="space-y-2">
                              <div className="h-4 bg-gray-200 rounded w-32"></div>
                              <div className="h-3 bg-gray-200 rounded w-24"></div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-20"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-28"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : orders.length === 0 ? (
              // Estado vacío (solo se muestra cuando no está cargando y no hay pedidos)
              <div className="text-center py-12">
                <svg className="mx-auto h-16 w-16 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  {t('noOrders')}
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                  {t('noOrdersDescription')}
                </p>
              </div>
            ) : (
              // Tabla de pedidos
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.date')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.customer')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.total')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.paymentMethod')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.status')}
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          {t('table.actions')}
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredOrders.map((order) => (
                        <tr key={order.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {formatOrderDate(order.createdAt)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm font-medium text-gray-900">
                              {order.clientName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {order.clientPhone}
                            </div>
                            <div className="mt-1 flex flex-wrap gap-1">
                              {(order as any).checkoutMethod && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  (order as any).checkoutMethod === 'whatsapp' 
                                    ? 'bg-green-100 text-green-800' 
                                    : 'bg-blue-100 text-blue-800'
                                }`}>
                                  {t(`checkoutMethods.${(order as any).checkoutMethod}`)}
                                </span>
                              )}
                              {(order as any).paymentStatus && (
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                                  (order as any).paymentStatus === 'paid' 
                                    ? 'bg-emerald-100 text-emerald-800' 
                                    : (order as any).paymentStatus === 'pending'
                                    ? 'bg-orange-100 text-orange-800'
                                    : (order as any).paymentStatus === 'partial'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : (order as any).paymentStatus === 'failed'
                                    ? 'bg-red-100 text-red-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {t(`paymentStatus.${(order as any).paymentStatus}`)}
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(order.total, storeData?.currency || 'USD')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {t(`paymentMethods.${order.paymentMethod}`)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <StatusBadge status={order.status} />
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <button
                              onClick={() => setSelectedOrder(order)}
                              className="text-gray-800 hover:text-gray-900"
                            >
                              {t('table.viewDetails')}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Paginación */}
                {totalPages > 1 && (
                  <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                      {/* Mobile pagination controls */}
                      <div className="flex justify-between sm:hidden">
                        <button
                          onClick={() => setCurrentPage(currentPage - 1)}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center justify-center px-4 py-3 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[100px]"
                        >
                          <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                          </svg>
                          Anterior
                        </button>
                        <div className="flex items-center px-4">
                          <span className="text-sm text-gray-700">
                            {currentPage} / {totalPages}
                          </span>
                        </div>
                        <button
                          onClick={() => setCurrentPage(currentPage + 1)}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center justify-center px-4 py-3 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[100px]"
                        >
                          Siguiente
                          <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </button>
                      </div>

                      {/* Desktop pagination info and controls */}
                      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                        <div>
                          <p className="text-sm text-gray-700">
                            Mostrando <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> a{' '}
                            <span className="font-medium">
                              {Math.min(currentPage * itemsPerPage, totalItems)}
                            </span>{' '}
                            de <span className="font-medium">{totalItems}</span> pedidos
                          </p>
                        </div>
                        <div>
                          <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <button
                              onClick={() => setCurrentPage(currentPage - 1)}
                              disabled={currentPage === 1}
                              className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Anterior</span>
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                              </svg>
                            </button>

                            {/* Page numbers */}
                            {(() => {
                              const delta = 2
                              const pages = []
                              const start = Math.max(1, currentPage - delta)
                              const end = Math.min(totalPages, currentPage + delta)

                              for (let i = start; i <= end; i++) {
                                pages.push(i)
                              }

                              return pages.map((page) => (
                                <button
                                  key={page}
                                  onClick={() => setCurrentPage(page)}
                                  className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                                    page === currentPage
                                      ? 'z-10 bg-gray-900 text-white'
                                      : 'text-gray-900'
                                  }`}
                                >
                                  {page}
                                </button>
                              ))
                            })()}

                            <button
                              onClick={() => setCurrentPage(currentPage + 1)}
                              disabled={currentPage === totalPages}
                              className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              <span className="sr-only">Siguiente</span>
                              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal de detalles */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  {t('details.title')} #{selectedOrder.id.slice(-8)}
                </h3>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-6">
                {/* Información del cliente */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">{t('details.customerInfo')}</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div><strong>{t('details.name')}:</strong> {selectedOrder.clientName}</div>
                    <div><strong>{t('details.phone')}:</strong> {selectedOrder.clientPhone}</div>
                    {(selectedOrder as any).email && (
                      <div><strong>{t('details.email')}:</strong> {(selectedOrder as any).email}</div>
                    )}
                    {(selectedOrder as any).shippingMethod && (
                      <div><strong>{t('details.shippingMethod')}:</strong> {t(`shippingMethods.${(selectedOrder as any).shippingMethod}`)}</div>
                    )}
                    {selectedOrder.clientAddress && (
                      <div><strong>{t('details.address')}:</strong> {selectedOrder.clientAddress}</div>
                    )}
                    {selectedOrder.clientNotes && (
                      <div><strong>{t('details.notes')}:</strong> {selectedOrder.clientNotes}</div>
                    )}
                  </div>
                </div>

                {/* 🆕 Información de Pago */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">💳 Información de Pago</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between items-center">
                      <span><strong>Estado del pago:</strong></span>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (selectedOrder as any).paymentStatus === 'paid' 
                          ? 'bg-emerald-100 text-emerald-800' 
                          : (selectedOrder as any).paymentStatus === 'pending'
                          ? 'bg-orange-100 text-orange-800'
                          : (selectedOrder as any).paymentStatus === 'partial'
                          ? 'bg-yellow-100 text-yellow-800'
                          : (selectedOrder as any).paymentStatus === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {(selectedOrder as any).paymentStatus 
                          ? t(`paymentStatus.${(selectedOrder as any).paymentStatus}`)
                          : 'Pendiente de pago'
                        }
                      </span>
                    </div>
                    
                    {(selectedOrder as any).paymentType && (
                      <div><strong>Tipo de pago:</strong> {t(`paymentTypes.${(selectedOrder as any).paymentType}`)}</div>
                    )}
                    
                    <div className="flex justify-between">
                      <span><strong>Monto total:</strong></span>
                      <span>{formatCurrency(selectedOrder.total, storeData?.currency || 'USD')}</span>
                    </div>
                    
                    {(selectedOrder as any).paidAmount !== undefined && (selectedOrder as any).paidAmount > 0 && (
                      <div className="flex justify-between">
                        <span><strong>Monto pagado:</strong></span>
                        <span className="text-green-600">{formatCurrency((selectedOrder as any).paidAmount, storeData?.currency || 'USD')}</span>
                      </div>
                    )}
                    
                    {(selectedOrder as any).paymentReference && (
                      <div><strong>Referencia:</strong> {(selectedOrder as any).paymentReference}</div>
                    )}
                    
                    {(selectedOrder as any).paidAt && (
                      <div><strong>Pagado el:</strong> {formatOrderDate((selectedOrder as any).paidAt)}</div>
                    )}
                    
                    {(selectedOrder as any).paymentNotes && (
                      <div><strong>Notas de pago:</strong> {(selectedOrder as any).paymentNotes}</div>
                    )}
                    
                    {(selectedOrder as any).processedBy && (
                      <div><strong>Procesado por:</strong> {(selectedOrder as any).processedBy}</div>
                    )}
                  </div>
                </div>

                {/* Productos */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">{t('details.orderItems')}</h4>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('details.product')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('details.presentation')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('details.quantity')}
                          </th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t('details.subtotal')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {selectedOrder.items.map((item: OrderItem, index: number) => (
                          <tr key={index}>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {item.name}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.presentation}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                              {item.quantity}
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(item.subtotal, storeData?.currency || 'USD')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Resumen del pedido */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">{t('details.orderSummary')}</h4>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span>{t('details.itemsSubtotal')}:</span>
                      <span>{formatCurrency(selectedOrder.subtotal, storeData?.currency || 'USD')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>{t('details.shippingCost')}:</span>
                      <span>{formatCurrency(selectedOrder.shippingCost, storeData?.currency || 'USD')}</span>
                    </div>
                    {(selectedOrder as any).discount && (selectedOrder as any).discount > 0 && (
                      <div className="flex justify-between text-green-600">
                        <span>
                          {t('details.discount')}
                          {(selectedOrder as any).appliedCoupon?.code && (
                            <span className="text-sm text-gray-500"> ({(selectedOrder as any).appliedCoupon.code})</span>
                          )}:
                        </span>
                        <span>-{formatCurrency((selectedOrder as any).discount, storeData?.currency || 'USD')}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>{t('details.total')}:</span>
                      <span>{formatCurrency(selectedOrder.total, storeData?.currency || 'USD')}</span>
                    </div>
                  </div>
                </div>

                {/* Acciones */}
                <div>
                  <h4 className="text-md font-medium text-gray-900 mb-3">{t('details.actions')}</h4>
                  <div className="space-y-4">
                    {/* Actualizar estado del pedido */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-semibold text-blue-700 min-w-0 flex-shrink-0">
                          📦 Estado del pedido:
                        </label>
                        <select
                          value={selectedOrder.status}
                          onChange={(e) => handleStatusUpdate(selectedOrder.id, e.target.value as Order['status'])}
                          disabled={updating}
                          className="flex-1 max-w-xs pl-3 pr-10 py-2 text-base border-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md bg-white"
                        >
                          <option value="pending">{t('status.pending')}</option>
                          <option value="whatsapp_sent">{t('status.whatsapp_sent')}</option>
                          <option value="confirmed">{t('status.confirmed')}</option>
                          <option value="preparing">{t('status.preparing')}</option>
                          <option value="ready">{t('status.ready')}</option>
                          <option value="shipped">{t('status.shipped')}</option>
                          <option value="delivered">{t('status.delivered')}</option>
                          <option value="cancelled">{t('status.cancelled')}</option>
                        </select>
                        {updating && (
                          <span className="text-sm text-blue-600">{t('details.updating')}</span>
                        )}
                      </div>
                    </div>

                    {/* Actualizar estado de pago */}
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center space-x-4">
                        <label className="text-sm font-semibold text-green-700 min-w-0 flex-shrink-0">
                          💳 Estado de pago:
                        </label>
                        <select
                          value={(selectedOrder as any).paymentStatus || 'pending'}
                          onChange={(e) => handlePaymentStatusUpdate(selectedOrder.id, e.target.value as PaymentStatus)}
                          disabled={updating}
                          className="flex-1 max-w-xs pl-3 pr-10 py-2 text-base border-green-300 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md bg-white"
                        >
                          <option value="pending">Pendiente</option>
                          <option value="paid">Pagado</option>
                          <option value="partial">Pago parcial</option>
                          <option value="failed">Fallido</option>
                        </select>

                        {/* Botón para pago avanzado */}
                        <button
                          onClick={() => openPaymentModal(selectedOrder)}
                          disabled={updating}
                          className="inline-flex items-center px-3 py-1.5 border border-green-300 rounded-md text-xs font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50"
                          title="Configuración avanzada de pago"
                        >
                          ⚙️ Detalles
                        </button>
                      </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      {selectedOrder.clientPhone && (
                        <button
                          onClick={() => handleWhatsAppReply(selectedOrder)}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                        >
                          <svg className="-ml-1 mr-2 h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.097"/>
                          </svg>
                          {t('details.replyWhatsApp')}
                        </button>
                      )}
                      
                      <button
                        disabled
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-400 bg-gray-100 cursor-not-allowed"
                      >
                        <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {t('details.resendEmail')} (Pro)
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-6 flex justify-end">
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                >
                  {t('details.close')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 🆕 Modal de Actualización Avanzada de Pago */}
      {paymentModalOpen && selectedOrder && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-2/3 lg:w-1/2 shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-medium text-gray-900">
                  💳 Actualizar Pago - Pedido #{selectedOrder.id.slice(-8)}
                </h3>
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                {/* Estado del Pago */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado del pago
                  </label>
                  <select
                    value={paymentFormData.paymentStatus}
                    onChange={(e) => setPaymentFormData(prev => ({ 
                      ...prev, 
                      paymentStatus: e.target.value as PaymentStatus 
                    }))}
                    className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-600 focus:border-gray-600 sm:text-sm rounded-md"
                  >
                    <option value="paid">✅ Pagado</option>
                    <option value="partial">⚠️ Pago parcial</option>
                    <option value="pending">⏳ Pendiente</option>
                    <option value="failed">❌ Fallido</option>
                    <option value="refunded">↩️ Reembolsado</option>
                  </select>
                </div>

                {/* Monto Pagado */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Monto pagado ({storeData?.currency || 'USD'})
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.01"
                      value={paymentFormData.paidAmount}
                      onChange={(e) => setPaymentFormData(prev => ({ 
                        ...prev, 
                        paidAmount: e.target.value 
                      }))}
                      className="block w-full pl-3 pr-12 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-600 focus:border-gray-600 sm:text-sm rounded-md"
                      placeholder="0.00"
                    />
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">
                        / {formatCurrency(selectedOrder.total, storeData?.currency || 'USD')}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Referencia/Comprobante */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Referencia o número de comprobante
                  </label>
                  <input
                    type="text"
                    value={paymentFormData.paymentReference}
                    onChange={(e) => setPaymentFormData(prev => ({ 
                      ...prev, 
                      paymentReference: e.target.value 
                    }))}
                    className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-600 focus:border-gray-600 sm:text-sm rounded-md"
                    placeholder="Ej: YAPE-123456, REF001, etc."
                  />
                </div>

                {/* Notas */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas del pago
                  </label>
                  <textarea
                    rows={3}
                    value={paymentFormData.paymentNotes}
                    onChange={(e) => setPaymentFormData(prev => ({ 
                      ...prev, 
                      paymentNotes: e.target.value 
                    }))}
                    className="block w-full px-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-600 focus:border-gray-600 sm:text-sm rounded-md"
                    placeholder="Ej: Cliente pagó con Yape, comprobante enviado por WhatsApp..."
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={() => setPaymentModalOpen(false)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAdvancedPaymentUpdate}
                  disabled={updating}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-800 hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50"
                >
                  {updating ? 'Actualizando...' : '💾 Guardar cambios'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
} 