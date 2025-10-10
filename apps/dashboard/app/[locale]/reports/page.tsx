'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../components/DashboardLayout'
import { useStore } from '../../../lib/hooks/useStore'
import { subscribeToStoreOrders, Order } from '../../../lib/orders'
import {
  calculateReportMetrics,
  generateDailySalesData,
  formatCurrency,
  formatPercentage,
  formatNumber,
  ReportMetrics,
  DailySalesData
} from '../../../lib/reports'
import { getStoreAnalytics, AnalyticsMetrics } from '../../../lib/analytics'
import { subDays, startOfDay, endOfDay, format as formatDate } from 'date-fns'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

type DateRange = '7d' | '30d' | '90d' | '1y' | 'custom'

export default function ReportsPage() {
  const t = useTranslations('reports')
  const { store } = useStore()

  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<DateRange>('30d')
  const [metrics, setMetrics] = useState<ReportMetrics | null>(null)
  const [dailySales, setDailySales] = useState<DailySalesData[]>([])
  const [analyticsMetrics, setAnalyticsMetrics] = useState<AnalyticsMetrics | null>(null)
  const [loadingAnalytics, setLoadingAnalytics] = useState(true)

  // Calcular fechas según el rango seleccionado
  const getDateRange = (range: DateRange) => {
    const end = endOfDay(new Date())
    let start: Date

    switch (range) {
      case '7d':
        start = startOfDay(subDays(end, 7))
        break
      case '30d':
        start = startOfDay(subDays(end, 30))
        break
      case '90d':
        start = startOfDay(subDays(end, 90))
        break
      case '1y':
        start = startOfDay(subDays(end, 365))
        break
      default:
        start = startOfDay(subDays(end, 30))
    }

    return { start, end }
  }

  // Suscribirse a órdenes
  useEffect(() => {
    if (!store?.id) return

    const unsubscribe = subscribeToStoreOrders(
      store.id,
      (fetchedOrders) => {
        setOrders(fetchedOrders)
        setLoading(false)
      },
      (error) => {
        console.error('Error fetching orders:', error)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [store?.id])

  // Calcular métricas cuando cambian las órdenes o el rango de fecha
  useEffect(() => {
    if (orders.length === 0) {
      setMetrics(null)
      setDailySales([])
      return
    }

    const { start, end } = getDateRange(dateRange)
    const calculatedMetrics = calculateReportMetrics(orders, start, end)
    const calculatedDailySales = generateDailySalesData(orders, start, end)

    setMetrics(calculatedMetrics)
    setDailySales(calculatedDailySales)
  }, [orders, dateRange])

  // Obtener analytics cuando cambia el rango de fecha
  useEffect(() => {
    if (!store?.id) return

    const fetchAnalytics = async () => {
      setLoadingAnalytics(true)
      try {
        const { start, end } = getDateRange(dateRange)
        const data = await getStoreAnalytics(store.id, start, end)
        setAnalyticsMetrics(data)
      } catch (error) {
        console.error('Error fetching analytics:', error)
        setAnalyticsMetrics(null)
      } finally {
        setLoadingAnalytics(false)
      }
    }

    fetchAnalytics()
  }, [store?.id, dateRange])

  const currency = store?.currency || 'USD'

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-8"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-white shadow rounded-lg h-32"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header con filtros */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                {t('title')}
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                {t('subtitle')}
              </p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-gray-900 focus:border-gray-900 sm:text-sm rounded-md"
              >
                <option value="7d">Últimos 7 días</option>
                <option value="30d">Últimos 30 días</option>
                <option value="90d">Últimos 90 días</option>
                <option value="1y">Último año</option>
              </select>
            </div>
          </div>

          {!metrics ? (
            /* Sin datos */
            <div className="bg-white overflow-hidden shadow rounded-lg p-6">
              <div className="text-center">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <h3 className="mt-2 text-sm font-medium text-gray-900">Sin datos</h3>
                <p className="mt-1 text-sm text-gray-500">
                  No hay pedidos en este período. Las métricas aparecerán cuando comiences a recibir pedidos.
                </p>
              </div>
            </div>
          ) : (
            <>
              {/* Grid de KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                {/* Ventas del período */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Ingresos Totales
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {formatCurrency(metrics.totalRevenue, currency)}
                        </dd>
                        <dd className={`mt-1 text-sm font-medium flex items-center ${
                          metrics.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metrics.revenueGrowth >= 0 ? (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          )}
                          {formatPercentage(Math.abs(metrics.revenueGrowth))}
                        </dd>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pedidos */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Total de Pedidos
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {formatNumber(metrics.totalOrders)}
                        </dd>
                        <dd className={`mt-1 text-sm font-medium flex items-center ${
                          metrics.ordersGrowth >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {metrics.ordersGrowth >= 0 ? (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                            </svg>
                          )}
                          {formatPercentage(Math.abs(metrics.ordersGrowth))}
                        </dd>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ticket promedio */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Ticket Promedio
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {formatCurrency(metrics.averageOrderValue, currency)}
                        </dd>
                        <dd className="mt-1 text-sm text-gray-500">
                          Por pedido
                        </dd>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Clientes */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Clientes
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {formatNumber(metrics.totalCustomers)}
                        </dd>
                        <dd className="mt-1 text-sm text-gray-500">
                          {metrics.newCustomers} nuevos
                        </dd>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Vistas de página */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Vistas de Página
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {loadingAnalytics ? (
                            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                          ) : (
                            formatNumber(analyticsMetrics?.totalPageViews || 0)
                          )}
                        </dd>
                        <dd className="mt-1 text-sm text-gray-500">
                          Total del período
                        </dd>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Visitantes únicos */}
                <div className="bg-white overflow-hidden shadow rounded-lg border border-gray-200">
                  <div className="p-5">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <dt className="text-sm font-medium text-gray-500 truncate">
                          Visitantes Únicos
                        </dt>
                        <dd className="mt-1 text-2xl font-semibold text-gray-900">
                          {loadingAnalytics ? (
                            <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                          ) : (
                            formatNumber(analyticsMetrics?.totalUniqueVisitors || 0)
                          )}
                        </dd>
                        <dd className="mt-1 text-sm text-gray-500">
                          {analyticsMetrics?.totalPageViews && analyticsMetrics.totalUniqueVisitors
                            ? `${(analyticsMetrics.totalPageViews / analyticsMetrics.totalUniqueVisitors).toFixed(1)} páginas/visitante`
                            : 'Del período'}
                        </dd>
                      </div>
                      <div className="flex-shrink-0">
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Productos Vendidos */}
              {metrics.topProducts.length > 0 && (
                <div className="bg-white shadow rounded-lg border border-gray-200 mb-8">
                  <div className="px-6 py-5 border-b border-gray-200">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Top Productos Vendidos
                    </h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            #
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Producto
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Cantidad Vendida
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Ingresos
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {metrics.topProducts.map((product, index) => (
                          <tr key={product.productId} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {index + 1}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {product.name}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatNumber(product.quantity)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {formatCurrency(product.revenue, currency)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Gráfico de ventas en el tiempo */}
              {dailySales.length > 0 && (
                <div className="bg-white shadow rounded-lg border border-gray-200 p-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">
                    Ventas en el Tiempo
                  </h3>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart
                      data={dailySales}
                      margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) => formatDate(new Date(value), 'MMM dd')}
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                      />
                      <YAxis
                        yAxisId="left"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                        tickFormatter={(value) => formatCurrency(value, currency).replace(/\s/g, '')}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        stroke="#9CA3AF"
                        style={{ fontSize: '12px' }}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#fff',
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                        }}
                        formatter={(value: any, name: string) => {
                          if (name === 'revenue') {
                            return [formatCurrency(value, currency), 'Ingresos']
                          }
                          return [value, 'Pedidos']
                        }}
                        labelFormatter={(label) => formatDate(new Date(label), 'dd MMM yyyy')}
                      />
                      <Legend
                        wrapperStyle={{ paddingTop: '20px' }}
                        formatter={(value) => {
                          if (value === 'revenue') return 'Ingresos'
                          if (value === 'orders') return 'Pedidos'
                          return value
                        }}
                      />
                      <Line
                        yAxisId="left"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#111827"
                        strokeWidth={2}
                        dot={{ fill: '#111827', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                      <Line
                        yAxisId="right"
                        type="monotone"
                        dataKey="orders"
                        stroke="#9CA3AF"
                        strokeWidth={2}
                        dot={{ fill: '#9CA3AF', r: 4 }}
                        activeDot={{ r: 6 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
