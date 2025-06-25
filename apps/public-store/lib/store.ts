import { collection, query, where, getDocs } from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface StoreData {
  id: string
  storeName: string
  subdomain: string // Campo principal para el subdominio
  slug?: string // Campo legacy para compatibilidad
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
  createdAt?: any
  updatedAt?: any
}

export const getStoreBySubdomain = async (subdomain: string): Promise<StoreData | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.error('Firebase database not available')
      return null
    }

    console.log('🔍 Searching for store with subdomain:', subdomain)

    // Query stores collection for documents where subdomain matches
    const storesRef = collection(db, 'stores')
    let q = query(storesRef, where('subdomain', '==', subdomain))
    let querySnapshot = await getDocs(q)

    // Si no encuentra por subdomain, intentar buscar por slug (compatibilidad)
    if (querySnapshot.empty) {
      console.log('🔍 No store found by subdomain, trying legacy slug field...')
      q = query(storesRef, where('slug', '==', subdomain))
      querySnapshot = await getDocs(q)
    }

    if (querySnapshot.empty) {
      console.log('❌ Store not found for subdomain:', subdomain)
      return null
    }

    // Get the first (and should be only) match
    const storeDoc = querySnapshot.docs[0]
    const storeData = {
      id: storeDoc.id,
      ...storeDoc.data()
    } as StoreData

    console.log('✅ Store found:', storeData.storeName)
    return storeData

  } catch (error) {
    console.error('Error fetching store:', error)
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