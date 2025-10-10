import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'
import { format, startOfDay, endOfDay } from 'date-fns'

export interface AnalyticsDay {
  date: string
  pageViews: number
  uniqueVisitors: number
  productViews: Record<string, number>
  pages: Record<string, number>
}

export interface AnalyticsMetrics {
  totalPageViews: number
  totalUniqueVisitors: number
  averagePageViewsPerDay: number
  topProducts: Array<{
    productId: string
    views: number
  }>
  topPages: Array<{
    page: string
    views: number
  }>
  dailyData: Array<{
    date: string
    views: number
    visitors: number
  }>
}

/**
 * Obtener analytics de un rango de fechas
 */
export async function getStoreAnalytics(
  storeId: string,
  startDate: Date,
  endDate: Date
): Promise<AnalyticsMetrics> {
  const db = getFirebaseDb()
  if (!db) {
    throw new Error('Firebase not initialized')
  }

  try {
    // Query analytics documents por rango de fechas
    const analyticsRef = collection(db, 'stores', storeId, 'analytics')

    // Convertir fechas a strings para query
    const startDateStr = format(startOfDay(startDate), 'yyyy-MM-dd')
    const endDateStr = format(endOfDay(endDate), 'yyyy-MM-dd')

    const q = query(
      analyticsRef,
      where('date', '>=', startDateStr),
      where('date', '<=', endDateStr)
    )

    const snapshot = await getDocs(q)

    // Procesar datos
    let totalPageViews = 0
    let totalUniqueVisitors = 0
    const productViewsMap: Record<string, number> = {}
    const pagesMap: Record<string, number> = {}
    const dailyData: Array<{ date: string; views: number; visitors: number }> = []

    snapshot.forEach((doc) => {
      const data = doc.data() as AnalyticsDay

      totalPageViews += data.pageViews || 0
      totalUniqueVisitors += data.uniqueVisitors || 0

      // Acumular vistas por producto
      if (data.productViews) {
        Object.entries(data.productViews).forEach(([productId, views]) => {
          productViewsMap[productId] = (productViewsMap[productId] || 0) + views
        })
      }

      // Acumular vistas por página
      if (data.pages) {
        Object.entries(data.pages).forEach(([page, views]) => {
          pagesMap[page] = (pagesMap[page] || 0) + views
        })
      }

      // Datos diarios para gráficos
      dailyData.push({
        date: data.date,
        views: data.pageViews || 0,
        visitors: data.uniqueVisitors || 0
      })
    })

    // Ordenar datos diarios por fecha
    dailyData.sort((a, b) => a.date.localeCompare(b.date))

    // Top productos más vistos
    const topProducts = Object.entries(productViewsMap)
      .map(([productId, views]) => ({ productId, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Top páginas más visitadas
    const topPages = Object.entries(pagesMap)
      .map(([page, views]) => ({ page, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)

    // Calcular promedio de vistas por día
    const dayCount = snapshot.size || 1
    const averagePageViewsPerDay = totalPageViews / dayCount

    return {
      totalPageViews,
      totalUniqueVisitors,
      averagePageViewsPerDay,
      topProducts,
      topPages,
      dailyData
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
    // Retornar datos vacíos en caso de error
    return {
      totalPageViews: 0,
      totalUniqueVisitors: 0,
      averagePageViewsPerDay: 0,
      topProducts: [],
      topPages: [],
      dailyData: []
    }
  }
}
