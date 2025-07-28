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
  heroImageUrl?: string
  headerLogoUrl?: string;
  carouselImages?: Array<{
    url: string
    publicId: string
    order: number
  }>
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  address?: string
  location?: {
    address: string
    lat: number
    lng: number
  }
  hasPhysicalLocation: boolean
  ownerId: string
  theme?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    whatsapp?: string
    tiktok?: string
    x?: string
    snapchat?: string
    linkedin?: string
    telegram?: string
    youtube?: string
    pinterest?: string
  }
  advanced?: {
    language?: string
    checkout?: {
      method: 'whatsapp' | 'traditional'
    }
    payments?: {
      provider?: string
      publicKey?: string
      connected?: boolean
    }
    shipping?: {
      enabled?: boolean
      cost?: number
      modes?: {
        storePickup?: boolean
        localDelivery?: boolean
        nationalShipping?: boolean
        internationalShipping?: boolean
      }
      localDelivery?: {
        enabled?: boolean
      }
    }
    seo?: {
      title?: string
      metaDescription?: string
      keywords?: string[]
      ogTitle?: string
      ogDescription?: string
      ogImage?: string
      ogImagePublicId?: string
      whatsappImage?: string
      whatsappImagePublicId?: string
      favicon?: string
      faviconPublicId?: string
      robots?: 'index,follow' | 'index,nofollow' | 'noindex,follow' | 'noindex,nofollow'
      canonicalUrl?: string
      structuredDataEnabled?: boolean
      googleSearchConsole?: string
      tiktokPixel?: string
      customSlug?: string
    }
    integrations?: {
      googleAnalytics?: string
      metaPixel?: string
    }
  }
  createdAt?: Timestamp | Date | string
  updatedAt?: Timestamp | Date | string
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
  heroImageUrl?: string
  headerLogoUrl?: string;
  carouselImages?: Array<{
    url: string
    publicId: string
    order: number
  }>
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  address?: string
  location?: {
    address: string
    lat: number
    lng: number
  }
  hasPhysicalLocation: boolean
  ownerId: string
  theme?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    whatsapp?: string
    tiktok?: string
    x?: string
    snapchat?: string
    linkedin?: string
    telegram?: string
    youtube?: string
    pinterest?: string
  }
  advanced?: {
    language?: string
    checkout?: {
      method: 'whatsapp' | 'traditional'
    }
    payments?: {
      provider?: string
      publicKey?: string
      connected?: boolean
    }
    shipping?: {
      enabled?: boolean
      cost?: number
      modes?: {
        storePickup?: boolean
        localDelivery?: boolean
        nationalShipping?: boolean
        internationalShipping?: boolean
      }
      localDelivery?: {
        enabled?: boolean
      }
    }
    seo?: {
      title?: string
      metaDescription?: string
      keywords?: string[]
      ogTitle?: string
      ogDescription?: string
      ogImage?: string
      ogImagePublicId?: string
      whatsappImage?: string
      whatsappImagePublicId?: string
      favicon?: string
      faviconPublicId?: string
      robots?: 'index,follow' | 'index,nofollow' | 'noindex,follow' | 'noindex,nofollow'
      canonicalUrl?: string
      structuredDataEnabled?: boolean
      googleSearchConsole?: string
      tiktokPixel?: string
      customSlug?: string
    }
    integrations?: {
      googleAnalytics?: string
      metaPixel?: string
    }
  }
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
    const convertTimestamp = (timestamp: unknown): string | undefined => {
      if (!timestamp) return undefined
      
      // Firestore Timestamp
      if (timestamp && typeof (timestamp as Timestamp).toDate === 'function') {
        return (timestamp as Timestamp).toDate().toISOString()
      }
      
      // JavaScript Date
      if (timestamp instanceof Date) {
        return timestamp.toISOString()
      }
      
      // Firestore seconds format
      if (timestamp && typeof (timestamp as { seconds: number }).seconds === 'number') {
        return new Date((timestamp as { seconds: number }).seconds * 1000).toISOString()
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
      heroImageUrl: serverStore.heroImageUrl,
      headerLogoUrl: serverStore.headerLogoUrl,
      carouselImages: serverStore.carouselImages,
      primaryColor: serverStore.primaryColor,
      secondaryColor: serverStore.secondaryColor,
      currency: serverStore.currency,
      phone: serverStore.phone,
      address: serverStore.address,
      location: serverStore.location,
      hasPhysicalLocation: serverStore.hasPhysicalLocation,
      ownerId: serverStore.ownerId,
      theme: serverStore.theme,
      socialMedia: serverStore.socialMedia,
      advanced: serverStore.advanced,
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
      heroImageUrl: rawData.heroImageUrl,
      headerLogoUrl: rawData.headerLogoUrl,
      carouselImages: rawData.carouselImages,
      primaryColor: rawData.primaryColor || '#3B82F6',
      secondaryColor: rawData.secondaryColor || '#EF4444',
      currency: rawData.currency || 'USD',
      phone: rawData.phone || '',
      address: rawData.address,
      location: rawData.location,
      hasPhysicalLocation: rawData.hasPhysicalLocation || false,
      ownerId: rawData.ownerId || '',
      theme: rawData.theme || 'base-default',
      socialMedia: rawData.socialMedia,
      advanced: {
        ...rawData.advanced,
        language: rawData.advanced?.language || 'es',
        seo: rawData.advanced?.seo,
        integrations: rawData.advanced?.integrations
      },
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
    return 'lunara' // Para desarrollo local
  }
  
  // Handle production domains
  if (cleanHost.endsWith('.shopifree.app')) {
    const subdomain = cleanHost.replace('.shopifree.app', '')
    // Ignore reserved subdomains
    if (['www', 'app', 'api', 'admin', 'dashboard'].includes(subdomain)) {
      return null
    }
    return subdomain
  }
  
  // Handle preview domains (Vercel)
  if (cleanHost.endsWith('.vercel.app')) {
    return 'lunara' // Para previews de Vercel
  }
  
  return null
}

/**
 * Obtiene el símbolo de moneda basado en el código de moneda de la tienda
 */
export const getCurrencySymbol = (currencyCode: string): string => {
  const currencySymbols: Record<string, string> = {
    'USD': '$',
    'EUR': '€',
    'GBP': '£',
    'PEN': 'S/',
    'COP': '$',
    'MXN': '$',
    'ARS': '$',
    'CLP': '$',
    'BRL': 'R$',
    'JPY': '¥',
    'CNY': '¥',
    'KRW': '₩',
    'INR': '₹',
    'CAD': 'C$',
    'AUD': 'A$',
    'CHF': 'CHF',
    'SEK': 'kr',
    'NOK': 'kr',
    'DKK': 'kr',
    'PLN': 'zł',
    'CZK': 'Kč',
    'HUF': 'Ft',
    'RUB': '₽',
    'TRY': '₺',
    'ZAR': 'R',
    'SGD': 'S$',
    'HKD': 'HK$',
    'NZD': 'NZ$',
    'THB': '฿',
    'MYR': 'RM',
    'IDR': 'Rp',
    'PHP': '₱',
    'VND': '₫'
  }
  
  return currencySymbols[currencyCode] || currencyCode
} 