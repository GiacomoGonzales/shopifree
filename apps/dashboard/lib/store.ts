import { 
  doc, 
  setDoc, 
  query, 
  collection, 
  where, 
  getDocs,
  getDoc,
  serverTimestamp,
  updateDoc
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

export interface StoreConfig {
  storeName: string
  subdomain: string // Campo principal para el subdominio
  slogan: string
  description: string
  hasPhysicalLocation: boolean
  address?: string
  location?: {
    address: string
    lat: number
    lng: number
  }
  businessType?: string // Cambiado de tipoComercio
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  emailStore?: string // Nuevo campo para correo electrónico de la tienda
  language?: 'es' | 'en' | 'pt' // Idioma principal de la tienda
  logo?: string // Legacy field - deprecated
  storePhoto?: string // Legacy field - deprecated
  logoUrl?: string // New Cloudinary URL for logo
  storefrontImageUrl?: string // New Cloudinary URL for storefront image
  headerLogoUrl?: string // New Cloudinary URL for header logo
  logoPublicId?: string // Cloudinary public_id for logo deletion
  storefrontImagePublicId?: string // Cloudinary public_id for storefront image deletion
  headerLogoPublicId?: string // Cloudinary public_id for header logo deletion
  heroImageUrl?: string // URL de la imagen hero de Cloudinary
  heroImagePublicId?: string // Public ID de la imagen hero para eliminación
  carouselImages?: Array<{
    url: string
    publicId: string
    order: number
  }> // Imágenes del carrusel principal
  theme?: string // ID del tema visual seleccionado
  backgroundTexture?: string // ID de la textura de fondo seleccionada
  socialMedia?: { // Cambiado de redes
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
  // Configuración avanzada
  advanced?: {
    language?: 'es' | 'en' | 'pt' // Idioma de la tienda pública
    customDomain?: {
      domain?: string
      verified?: boolean
    }
    checkout?: {
      method: 'whatsapp' | 'traditional'
      whatsappMessage?: string
    }
    payments?: {
      provider?: 'culqi' | 'mercadopago' | 'stripe' | 'paypal' | null
      publicKey?: string
      secretKey?: string
      webhookEndpoint?: string
      connected?: boolean
    }
    shipping?: {
      enabled?: boolean
      // Tipos de envío disponibles
      modes?: {
        storePickup?: boolean
        localDelivery?: boolean
        nationalShipping?: boolean
        internationalShipping?: boolean
      }
      
      // Configuración recojo en tienda
      storePickup?: {
        enabled?: boolean
        address?: string
        schedules?: Array<{
          day: string
          openTime: string
          closeTime: string
        }>
        preparationTime?: string
      }
      
      // Configuración envío local
      localDelivery?: {
        enabled?: boolean
        zones?: Array<{
          id: string
          name: string
          type: 'polygon' | 'radius'
          coordinates?: Array<{ lat: number; lng: number }>
          center?: { lat: number; lng: number }
          radius?: number
          price: number
          estimatedTime?: string
        }>
        allowGPS?: boolean
        noCoverageMessage?: string
      }
      
      // Configuración envío nacional
      nationalShipping?: {
        enabled?: boolean
        type?: 'fixed' | 'by_weight' | 'by_region'
        fixedPrice?: number
        regions?: Array<{
          name: string
          price: number
          estimatedTime?: string
        }>
        weightRanges?: Array<{
          minWeight: number
          maxWeight: number
          price: number
        }>
        carrier?: {
          name?: string
          trackingEnabled?: boolean
          trackingUrl?: string
        }
        automaticRates?: {
          enabled?: boolean
          apiKey?: string
        }
      }
      
      // Configuración envío internacional
      internationalShipping?: {
        enabled?: boolean
        countries?: string[]
        basePrice?: number
        weightRate?: number
        volumeRate?: number
        customMessage?: string
        customsInfo?: {
          restrictedCategories?: string[]
          additionalInfo?: string
        }
      }
      
      // Reglas generales
      freeShipping?: {
        enabled?: boolean
        minimumAmount?: number
        applicableProducts?: string[]
      }
      preparationTime?: string
      notifications?: {
        email?: boolean
        whatsapp?: boolean
      }
      
      // Información para el cliente
      displayInfo?: {
        showEstimatedTimes?: boolean
        showPricesInCheckout?: boolean
        policyText?: string
        policyUrl?: string
      }
    }
    notifications?: {
      email?: boolean
      whatsapp?: boolean
      alternativeEmail?: string
    }
    seo?: {
      title?: string
      metaDescription?: string
      keywords?: string[]
      ogTitle?: string
      ogDescription?: string
      ogImage?: string
      ogImagePublicId?: string
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
  ownerId: string
  createdAt: Date | unknown
  updatedAt: Date | unknown
}

export interface StoreWithId {
  id: string
  storeName: string
  subdomain: string
  slogan: string
  description: string
  hasPhysicalLocation: boolean
  address?: string
  location?: {
    address: string
    lat: number
    lng: number
  }
  businessType?: string
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  emailStore?: string
  language?: 'es' | 'en' | 'pt' // Idioma principal de la tienda
  logo?: string
  storePhoto?: string
  logoUrl?: string
  storefrontImageUrl?: string
  headerLogoUrl?: string
  logoPublicId?: string
  storefrontImagePublicId?: string
  headerLogoPublicId?: string
  heroImageUrl?: string
  heroImagePublicId?: string
  carouselImages?: Array<{
    url: string
    publicId: string
    order: number
  }>
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
    seo?: {
      title?: string
      metaDescription?: string
      keywords?: string[]
      ogTitle?: string
      ogDescription?: string
      ogImage?: string
      ogImagePublicId?: string
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
  payments?: {
    provider?: string
    settings?: {
      culqi?: {
        publicKey?: string
        privateKey?: string
      }
      mercadopago?: {
        accessToken?: string
        publicKey?: string
      }
    }
  }
  ownerId: string
  createdAt: Date | unknown
  updatedAt: Date | unknown
}

// Check if user has a store
// Get store by ID
export const getStore = async (storeId: string): Promise<StoreWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return null
    }
    
    const storeRef = doc(db, 'stores', storeId)
    const storeDoc = await getDoc(storeRef)
    
    if (storeDoc.exists()) {
      return { id: storeDoc.id, ...storeDoc.data() } as StoreWithId
    }
    
    return null
  } catch (error) {
    console.error('Error getting store:', error)
    return null
  }
}

export const getUserStore = async (userId: string): Promise<StoreWithId | null> => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return null
    }
    
    const q = query(collection(db, 'stores'), where('ownerId', '==', userId))
    const querySnapshot = await getDocs(q)
    
    if (!querySnapshot.empty) {
      const storeDoc = querySnapshot.docs[0]
      return { id: storeDoc.id, ...storeDoc.data() } as StoreWithId
    }
    
    return null
  } catch (error) {
    console.error('Error getting user store:', error)
    return null
  }
}

// Update store data
export const updateStore = async (storeId: string, data: Partial<StoreConfig>) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }
    
    const storeRef = doc(db, 'stores', storeId)
    await updateDoc(storeRef, {
      ...data,
      updatedAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Error updating store:', error)
    throw error
  }
}

// Update specific store field
export const updateStoreField = async (storeId: string, field: string, value: unknown) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }
    
    const storeRef = doc(db, 'stores', storeId)
    await updateDoc(storeRef, {
      [field]: value,
      updatedAt: serverTimestamp()
    })
    
    return true
  } catch (error) {
    console.error('Error updating store field:', error)
    throw error
  }
}

// Validate subdomain format
export const validateSubdomain = (subdomain: string): { isValid: boolean; error?: string } => {
  if (!subdomain || subdomain.length < 3) {
    return { isValid: false, error: 'El subdominio debe tener al menos 3 caracteres' }
  }
  
  if (subdomain.length > 50) {
    return { isValid: false, error: 'El subdominio no puede tener más de 50 caracteres' }
  }
  
  // Solo letras minúsculas, números y guiones
  const validPattern = /^[a-z0-9-]+$/
  if (!validPattern.test(subdomain)) {
    return { isValid: false, error: 'Solo se permiten letras minúsculas, números y guiones' }
  }
  
  // No puede empezar o terminar con guión
  if (subdomain.startsWith('-') || subdomain.endsWith('-')) {
    return { isValid: false, error: 'No puede empezar o terminar con guión' }
  }
  
  // No puede tener guiones consecutivos
  if (subdomain.includes('--')) {
    return { isValid: false, error: 'No puede tener guiones consecutivos' }
  }
  
  // Lista de subdominios reservados
  const reservedSubdomains = [
    'www', 'api', 'admin', 'app', 'mail', 'ftp', 'localhost', 'dashboard',
    'support', 'help', 'blog', 'store', 'shop', 'cdn', 'assets', 'static'
  ]
  
  if (reservedSubdomains.includes(subdomain)) {
    return { isValid: false, error: 'Este subdominio está reservado' }
  }
  
  return { isValid: true }
}

// Check if subdomain is available
export const checkSubdomainAvailability = async (subdomain: string) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      console.warn('Firebase db not available')
      return false
    }
    
    // Validar formato primero
    const validation = validateSubdomain(subdomain)
    if (!validation.isValid) {
      return false
    }
    
    const q = query(collection(db, 'stores'), where('subdomain', '==', subdomain))
    const querySnapshot = await getDocs(q)
    return querySnapshot.empty
  } catch (error) {
    console.error('Error checking subdomain availability:', error)
    return false
  }
}

// Legacy function for backward compatibility
export const checkSlugAvailability = checkSubdomainAvailability

// Create new store
export const createStore = async (storeData: Omit<StoreConfig, 'createdAt' | 'updatedAt'>) => {
  try {
    const db = getFirebaseDb()
    if (!db) {
      throw new Error('Firebase db not available')
    }
    
    // Generate store ID
    const storeRef = doc(collection(db, 'stores'))
    
    const newStore: StoreConfig = {
      ...storeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    await setDoc(storeRef, newStore)
    
    return { id: storeRef.id, ...newStore }
  } catch (error) {
    console.error('Error creating store:', error)
    throw error
  }
} 