import { collection, query, where, getDocs, Timestamp } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

// Tipo para datos de servidor (con Firestore Timestamps y referencias)
export interface StoreDataServer {
  id: string
  storeName: string
  subdomain: string
  slug?: string
  slogan: string
  description: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  address?: string
  hasPhysicalLocation: boolean
  ownerId: string
  createdAt?: Timestamp | Date | any
  updatedAt?: Timestamp | Date | any
}

// Tipo para datos de cliente (completamente serializable)
export interface StoreDataClient {
  id: string
  storeName: string
  subdomain: string
  slug?: string
  slogan: string
  description: string
  logoUrl?: string
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  address?: string
  hasPhysicalLocation: boolean
  ownerId: string
  createdAt?: string // ISO string
  updatedAt?: string // ISO string
}

// Tipo legacy para compatibilidad
export type StoreData = StoreDataServer

/**
 * Transforma datos de servidor a formato serializable para cliente
 * Maneja Firestore Timestamps y limpia propiedades no serializables
 */
export function transformStoreForClient(serverStore: StoreDataServer | null): StoreDataClient | null {
  if (!serverStore) return null

  try {
    // Función helper para convertir timestamps
    const convertTimestamp = (timestamp: any): string | undefined => {
      if (!timestamp) return undefined
      
      // Firestore Timestamp
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toISOString()
      }
      
      // JavaScript Date
      if (timestamp instanceof Date) {
        return timestamp.toISOString()
      }
      
      // Firestore seconds format
      if (timestamp && typeof timestamp.seconds === 'number') {
        return new Date(timestamp.seconds * 1000).toISOString()
      }
      
      // String (ya ISO)
      if (typeof timestamp === 'string') {
        return timestamp
      }
      
      return undefined
    }

    const clientStore: StoreDataClient = {
      id: serverStore.id,
      storeName: serverStore.storeName,
      subdomain: serverStore.subdomain,
      slug: serverStore.slug,
      slogan: serverStore.slogan,
      description: serverStore.description,
      logoUrl: serverStore.logoUrl,
      primaryColor: serverStore.primaryColor,
      secondaryColor: serverStore.secondaryColor,
      currency: serverStore.currency,
      phone: serverStore.phone,
      address: serverStore.address,
      hasPhysicalLocation: serverStore.hasPhysicalLocation,
      ownerId: serverStore.ownerId,
      createdAt: convertTimestamp(serverStore.createdAt),
      updatedAt: convertTimestamp(serverStore.updatedAt),
    }

    // Validación de campos requeridos
    if (!clientStore.id || !clientStore.storeName || !clientStore.subdomain) {
      console.error('⚠️ Store data is missing required fields:', {
        id: !!clientStore.id,
        storeName: !!clientStore.storeName,
        subdomain: !!clientStore.subdomain
      })
      return null
    }

    return clientStore

  } catch (error) {
    console.error('❌ Error transforming store data for client:', error)
    return null
  }
}

/**
 * Obtiene una tienda por subdomain desde Firestore (servidor)
 * Devuelve datos en formato servidor con Firestore Timestamps
 */
export const getStoreBySubdomain = async (subdomain: string): Promise<StoreDataServer | null> => {
  try {
    // Validación de entrada
    if (!subdomain || typeof subdomain !== 'string' || subdomain.trim().length === 0) {
      console.error('❌ Invalid subdomain provided:', subdomain)
      return null
    }

    const cleanSubdomain = subdomain.trim().toLowerCase()
    
    const db = getFirebaseDb()
    if (!db) {
      console.error('❌ Firebase database not available')
      return null
    }

    console.log('🔍 Searching for store with subdomain:', cleanSubdomain)

    // Query stores collection for documents where subdomain matches
    const storesRef = collection(db, 'stores')
    let q = query(storesRef, where('subdomain', '==', cleanSubdomain))
    let querySnapshot = await getDocs(q)

    // Si no encuentra por subdomain, intentar buscar por slug (compatibilidad)
    if (querySnapshot.empty) {
      console.log('🔍 No store found by subdomain, trying legacy slug field...')
      q = query(storesRef, where('slug', '==', cleanSubdomain))
      querySnapshot = await getDocs(q)
    }

    if (querySnapshot.empty) {
      console.log('❌ Store not found for subdomain:', cleanSubdomain)
      return null
    }

    if (querySnapshot.docs.length > 1) {
      console.warn('⚠️ Multiple stores found for subdomain:', cleanSubdomain, 'Using first result')
    }

    // Get the first (and should be only) match
    const storeDoc = querySnapshot.docs[0]
    const rawData = storeDoc.data()
    
    const storeData: StoreDataServer = {
      id: storeDoc.id,
      storeName: rawData.storeName || '',
      subdomain: rawData.subdomain || '',
      slug: rawData.slug,
      slogan: rawData.slogan || '',
      description: rawData.description || '',
      logoUrl: rawData.logoUrl,
      primaryColor: rawData.primaryColor || '#3B82F6',
      secondaryColor: rawData.secondaryColor || '#EF4444',
      currency: rawData.currency || 'USD',
      phone: rawData.phone || '',
      address: rawData.address,
      hasPhysicalLocation: rawData.hasPhysicalLocation || false,
      ownerId: rawData.ownerId || '',
      createdAt: rawData.createdAt,
      updatedAt: rawData.updatedAt,
    }

    // Validación de datos críticos
    if (!storeData.storeName || !storeData.subdomain) {
      console.error('❌ Store data is incomplete:', {
        id: storeData.id,
        storeName: !!storeData.storeName,
        subdomain: !!storeData.subdomain
      })
      return null
    }

    console.log('✅ Store found:', storeData.storeName)
    return storeData

  } catch (error) {
    console.error('❌ Error fetching store from Firestore:', error)
    
    // Log más detalles del error si están disponibles
    if (error instanceof Error) {
      console.error('❌ Error details:', {
        message: error.message,
        stack: error.stack,
        subdomain: subdomain
      })
    }
    
    return null
  }
}

export const extractSubdomain = (host: string | null): string | null => {
  if (!host) return null
  
  // Remove port if present (for local development)
  const cleanHost = host.split(':')[0].toLowerCase()
  
  // For local development, handle localhost
  if (cleanHost === 'localhost' || cleanHost.includes('127.0.0.1')) {
    // For local testing, you can set a subdomain via query param or return null for main site
    return null // Return null to show main landing page in development
  }
  
  // Extract subdomain (everything before the first dot)
  const parts = cleanHost.split('.')
  if (parts.length < 2) return null
  
  const subdomain = parts[0]
  
  // Ignore reserved subdomains that should show the main landing
  const reservedSubdomains = ['www', 'shopifree', 'app', 'api', 'admin', 'dashboard']
  if (reservedSubdomains.includes(subdomain)) {
    return null
  }
  
  return subdomain
} 