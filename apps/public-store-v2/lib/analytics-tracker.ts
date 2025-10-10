import { getFirebaseDb } from './firebase'
import { doc, setDoc, increment, serverTimestamp } from 'firebase/firestore'
import { format } from 'date-fns'

/**
 * Obtener o crear visitor ID único usando localStorage
 * Este ID persiste entre sesiones para identificar visitantes únicos
 */
function getVisitorId(): string {
  if (typeof window === 'undefined') return ''

  const VISITOR_KEY = 'shopifree_visitor_id'
  let visitorId = localStorage.getItem(VISITOR_KEY)

  if (!visitorId) {
    visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    localStorage.setItem(VISITOR_KEY, visitorId)
  }

  return visitorId
}

/**
 * Verificar si el visitante ya fue contado hoy
 */
function wasVisitorCountedToday(): boolean {
  if (typeof window === 'undefined') return true

  const LAST_VISIT_KEY = 'shopifree_last_visit'
  const today = format(new Date(), 'yyyy-MM-dd')
  const lastVisit = localStorage.getItem(LAST_VISIT_KEY)

  if (lastVisit === today) {
    return true
  }

  localStorage.setItem(LAST_VISIT_KEY, today)
  return false
}

/**
 * Trackear vista de página
 */
export async function trackPageView(
  storeId: string,
  pagePath: string
): Promise<void> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('[Analytics] Firebase no disponible')
      return
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    const analyticsRef = doc(db, 'stores', storeId, 'analytics', today)

    // Verificar si es visitante nuevo del día
    const isNewVisitor = !wasVisitorCountedToday()

    // Normalizar ruta de página (remover query params y trailing slash)
    const normalizedPath = pagePath.split('?')[0].replace(/\/$/, '') || '/'

    // Actualizar documento diario con incrementos atómicos
    await setDoc(
      analyticsRef,
      {
        date: today,
        pageViews: increment(1),
        uniqueVisitors: increment(isNewVisitor ? 1 : 0),
        pages: {
          [normalizedPath]: increment(1)
        },
        lastUpdated: serverTimestamp()
      },
      { merge: true }
    )

    console.log('[Analytics] Page view tracked:', { storeId, pagePath: normalizedPath, isNewVisitor })
  } catch (error) {
    console.error('[Analytics] Error tracking page view:', error)
  }
}

/**
 * Trackear vista de producto
 */
export async function trackProductView(
  storeId: string,
  productId: string,
  productName?: string
): Promise<void> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('[Analytics] Firebase no disponible')
      return
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    const analyticsRef = doc(db, 'stores', storeId, 'analytics', today)

    // Actualizar vistas de producto
    await setDoc(
      analyticsRef,
      {
        date: today,
        productViews: {
          [productId]: increment(1)
        },
        lastUpdated: serverTimestamp()
      },
      { merge: true }
    )

    console.log('[Analytics] Product view tracked:', { storeId, productId, productName })
  } catch (error) {
    console.error('[Analytics] Error tracking product view:', error)
  }
}

/**
 * Trackear evento personalizado
 */
export async function trackCustomEvent(
  storeId: string,
  eventName: string,
  eventData?: Record<string, any>
): Promise<void> {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('[Analytics] Firebase no disponible')
      return
    }

    const today = format(new Date(), 'yyyy-MM-dd')
    const analyticsRef = doc(db, 'stores', storeId, 'analytics', today)

    await setDoc(
      analyticsRef,
      {
        date: today,
        customEvents: {
          [eventName]: increment(1)
        },
        lastUpdated: serverTimestamp()
      },
      { merge: true }
    )

    console.log('[Analytics] Custom event tracked:', { storeId, eventName, eventData })
  } catch (error) {
    console.error('[Analytics] Error tracking custom event:', error)
  }
}
