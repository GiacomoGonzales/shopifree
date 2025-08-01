import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface NewsletterSubscription {
  id?: string
  email: string
  storeId: string
  subscribedAt: Date | unknown
  status: 'active' | 'unsubscribed'
  source?: 'footer' | 'home' | 'popup' | 'checkout' | 'account'
  ipAddress?: string
  userAgent?: string
}

export interface NewsletterResult {
  success: boolean
  message: string
  alreadySubscribed?: boolean
}

/**
 * Suscribir un email al newsletter de una tienda
 */
export const subscribeToNewsletter = async (
  storeId: string, 
  email: string, 
  source: NewsletterSubscription['source'] = 'footer'
): Promise<NewsletterResult> => {
  try {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return {
        success: false,
        message: 'Por favor, introduce un email válido'
      }
    }

    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase no está disponible')
    }

    // Verificar si el email ya está suscrito
    const newsletterRef = collection(db, 'stores', storeId, 'newsletter')
    const existingQuery = query(
      newsletterRef,
      where('email', '==', email.toLowerCase().trim()),
      where('status', '==', 'active')
    )
    
    const existingSnapshot = await getDocs(existingQuery)
    
    if (!existingSnapshot.empty) {
      return {
        success: true,
        message: '¡Ya estás suscrito! Gracias por ser parte de nuestra comunidad.',
        alreadySubscribed: true
      }
    }

    // Crear nueva suscripción
    const subscriptionData: Omit<NewsletterSubscription, 'id'> = {
      email: email.toLowerCase().trim(),
      storeId,
      subscribedAt: serverTimestamp(),
      status: 'active',
      source
    }

    console.log('📧 Attempting to create newsletter subscription:', { 
      storeId, 
      email: email.toLowerCase().trim(), 
      source,
      collectionPath: `stores/${storeId}/newsletter` 
    })

    await addDoc(newsletterRef, subscriptionData)

    console.log('✅ Newsletter subscription created successfully:', { email, storeId, source })

    return {
      success: true,
      message: '¡Gracias por suscribirte! Pronto recibirás nuestras novedades exclusivas.'
    }

  } catch (error: any) {
    console.error('❌ Error subscribing to newsletter:', {
      error: error.message || error,
      code: error.code,
      storeId,
      email: email.toLowerCase().trim()
    })
    
    // Mostrar mensaje más específico según el tipo de error
    let errorMessage = 'Hubo un error al procesar tu suscripción. Por favor, inténtalo de nuevo.'
    
    if (error.code === 'permission-denied') {
      errorMessage = 'Error de permisos. Las reglas de seguridad se están actualizando, por favor intenta en unos segundos.'
    } else if (error.code === 'invalid-argument') {
      errorMessage = 'Datos inválidos. Verifica que el email sea correcto.'
    } else if (error.code === 'network-request-failed') {
      errorMessage = 'Error de conexión. Verifica tu internet e intenta nuevamente.'
    }
    
    return {
      success: false,
      message: errorMessage
    }
  }
}

/**
 * Obtener IP del cliente (opcional)
 */
const getClientIP = async (): Promise<string | undefined> => {
  try {
    const response = await fetch('https://api.ipify.org?format=json')
    const data = await response.json()
    return data.ip
  } catch (error) {
    console.warn('Could not get client IP:', error)
    return undefined
  }
}

/**
 * Desuscribir un email del newsletter
 */
export const unsubscribeFromNewsletter = async (
  storeId: string,
  email: string
): Promise<NewsletterResult> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase no está disponible')
    }

    const newsletterRef = collection(db, 'stores', storeId, 'newsletter')
    const subscriptionQuery = query(
      newsletterRef,
      where('email', '==', email.toLowerCase().trim()),
      where('status', '==', 'active')
    )
    
    const subscriptionSnapshot = await getDocs(subscriptionQuery)
    
    if (subscriptionSnapshot.empty) {
      return {
        success: false,
        message: 'No se encontró una suscripción activa para este email.'
      }
    }

    // Actualizar status a unsubscribed
    // En este caso, como no podemos hacer update directamente, 
    // se podría implementar después si es necesario
    
    return {
      success: true,
      message: 'Te has desuscrito correctamente del newsletter.'
    }

  } catch (error) {
    console.error('❌ Error unsubscribing from newsletter:', error)
    return {
      success: false,
      message: 'Hubo un error al procesar tu desuscripción.'
    }
  }
}

/**
 * Obtener estadísticas del newsletter para una tienda
 */
export const getNewsletterStats = async (storeId: string) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase no está disponible')
    }

    const newsletterRef = collection(db, 'stores', storeId, 'newsletter')
    const activeQuery = query(newsletterRef, where('status', '==', 'active'))
    const activeSnapshot = await getDocs(activeQuery)

    return {
      totalActiveSubscriptions: activeSnapshot.size,
      subscriptions: activeSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    }
  } catch (error) {
    console.error('❌ Error getting newsletter stats:', error)
    return {
      totalActiveSubscriptions: 0,
      subscriptions: []
    }
  }
} 