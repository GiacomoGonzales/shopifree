import { Order } from './orders'
import { startOfDay, endOfDay, subDays, format, eachDayOfInterval, parseISO } from 'date-fns'

export interface ReportMetrics {
  // Ventas
  totalRevenue: number
  previousRevenue: number
  revenueGrowth: number

  // Pedidos
  totalOrders: number
  previousOrders: number
  ordersGrowth: number
  averageOrderValue: number

  // Estados
  ordersByStatus: {
    pending: number
    confirmed: number
    preparing: number
    ready: number
    delivered: number
    cancelled: number
  }

  // Productos
  topProducts: Array<{
    productId: string
    name: string
    quantity: number
    revenue: number
  }>

  // Clientes
  totalCustomers: number
  newCustomers: number
  repeatCustomers: number
}

export interface DailySalesData {
  date: string
  revenue: number
  orders: number
}

/**
 * Calcular métricas de reportes para un período dado
 */
export function calculateReportMetrics(
  orders: Order[],
  startDate: Date,
  endDate: Date
): ReportMetrics {
  // Filtrar órdenes del período actual
  const currentPeriodOrders = orders.filter(order => {
    const orderDate = order.createdAt instanceof Date
      ? order.createdAt
      : new Date((order.createdAt as any).seconds * 1000)

    return orderDate >= startDate && orderDate <= endDate
  })

  // Calcular período anterior (misma duración)
  const daysDifference = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
  const previousStartDate = subDays(startDate, daysDifference)
  const previousEndDate = subDays(endDate, daysDifference)

  const previousPeriodOrders = orders.filter(order => {
    const orderDate = order.createdAt instanceof Date
      ? order.createdAt
      : new Date((order.createdAt as any).seconds * 1000)

    return orderDate >= previousStartDate && orderDate <= previousEndDate
  })

  // Calcular ingresos totales
  const totalRevenue = currentPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  const previousRevenue = previousPeriodOrders.reduce((sum, order) => sum + (order.total || 0), 0)
  const revenueGrowth = previousRevenue > 0
    ? ((totalRevenue - previousRevenue) / previousRevenue) * 100
    : totalRevenue > 0 ? 100 : 0

  // Calcular órdenes
  const totalOrders = currentPeriodOrders.length
  const previousOrders = previousPeriodOrders.length
  const ordersGrowth = previousOrders > 0
    ? ((totalOrders - previousOrders) / previousOrders) * 100
    : totalOrders > 0 ? 100 : 0

  // Ticket promedio
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0

  // Órdenes por estado
  const ordersByStatus = currentPeriodOrders.reduce((acc, order) => {
    const status = order.status || 'pending'
    acc[status] = (acc[status] || 0) + 1
    return acc
  }, {} as any)

  // Top productos vendidos
  const productSales: Record<string, { name: string; quantity: number; revenue: number }> = {}

  currentPeriodOrders.forEach(order => {
    order.items?.forEach(item => {
      if (!productSales[item.productId]) {
        productSales[item.productId] = {
          name: item.name,
          quantity: 0,
          revenue: 0
        }
      }
      productSales[item.productId].quantity += item.quantity
      productSales[item.productId].revenue += item.subtotal || (item.price * item.quantity)
    })
  })

  const topProducts = Object.entries(productSales)
    .map(([productId, data]) => ({
      productId,
      ...data
    }))
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 10)

  // Clientes únicos
  const currentCustomers = new Set(currentPeriodOrders.map(o => o.clientPhone || o.clientName))
  const previousCustomers = new Set(previousPeriodOrders.map(o => o.clientPhone || o.clientName))

  const newCustomers = Array.from(currentCustomers).filter(c => !previousCustomers.has(c)).length
  const repeatCustomers = currentCustomers.size - newCustomers

  return {
    totalRevenue,
    previousRevenue,
    revenueGrowth,
    totalOrders,
    previousOrders,
    ordersGrowth,
    averageOrderValue,
    ordersByStatus: {
      pending: ordersByStatus.pending || 0,
      confirmed: ordersByStatus.confirmed || 0,
      preparing: ordersByStatus.preparing || 0,
      ready: ordersByStatus.ready || 0,
      delivered: ordersByStatus.delivered || 0,
      cancelled: ordersByStatus.cancelled || 0
    },
    topProducts,
    totalCustomers: currentCustomers.size,
    newCustomers,
    repeatCustomers
  }
}

/**
 * Generar datos de ventas diarias para gráficos
 */
export function generateDailySalesData(
  orders: Order[],
  startDate: Date,
  endDate: Date
): DailySalesData[] {
  // Crear objeto con todas las fechas del rango
  const dailyData: Record<string, DailySalesData> = {}

  const days = eachDayOfInterval({ start: startDate, end: endDate })
  days.forEach(day => {
    const dateKey = format(day, 'yyyy-MM-dd')
    dailyData[dateKey] = {
      date: dateKey,
      revenue: 0,
      orders: 0
    }
  })

  // Agrupar órdenes por día
  orders.forEach(order => {
    const orderDate = order.createdAt instanceof Date
      ? order.createdAt
      : new Date((order.createdAt as any).seconds * 1000)

    if (orderDate >= startDate && orderDate <= endDate) {
      const dateKey = format(orderDate, 'yyyy-MM-dd')

      if (dailyData[dateKey]) {
        dailyData[dateKey].revenue += order.total || 0
        dailyData[dateKey].orders += 1
      }
    }
  })

  // Convertir a array y ordenar por fecha
  return Object.values(dailyData).sort((a, b) => a.date.localeCompare(b.date))
}

/**
 * Formatear moneda
 */
export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2
  }).format(amount)
}

/**
 * Formatear porcentaje
 */
export function formatPercentage(value: number): string {
  const formatted = value.toFixed(1)
  return value > 0 ? `+${formatted}%` : `${formatted}%`
}

/**
 * Formatear número
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('es-ES').format(value)
}
