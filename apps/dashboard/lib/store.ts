import { 
  doc, 
  setDoc, 
  query, 
  collection, 
  where, 
  getDocs,
  serverTimestamp,
  updateDoc,
  getDoc,
  writeBatch
} from 'firebase/firestore'
import { getFirebaseDb } from './firebase'

// Definición local del tipo InfoPage
interface InfoPage {
  slug: string
  type: string
  fixed: boolean
  visible: boolean
  status: 'published' | 'draft'
  title: {
    es: string
    en: string
  }
  seoTitle: {
    es: string
    en: string
  }
  seoDescription: {
    es: string
    en: string
  }
  content: {
    es: string
    en: string
  }
}

// Definición local de páginas informativas
const INFO_PAGES: InfoPage[] = [
  {
    slug: 'about-us',
    type: 'about',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Quiénes somos',
      en: 'About Us'
    },
    seoTitle: {
      es: 'Sobre nosotros',
      en: 'About Us'
    },
    seoDescription: {
      es: 'Conoce más sobre nuestra empresa',
      en: 'Learn more about our company'
    },
    content: {
      es: '<p>Información sobre nuestra empresa.</p>',
      en: '<p>Information about our company.</p>'
    }
  },
  {
    slug: 'contact',
    type: 'contact',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Contáctanos',
      en: 'Contact Us'
    },
    seoTitle: {
      es: 'Contacto',
      en: 'Contact'
    },
    seoDescription: {
      es: 'Ponte en contacto con nosotros',
      en: 'Get in touch with us'
    },
    content: {
      es: '<p>Formulario de contacto y medios de comunicación.</p>',
      en: '<p>Contact form and communication channels.</p>'
    }
  },
  {
    slug: 'terms',
    type: 'terms',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Términos y condiciones',
      en: 'Terms and Conditions'
    },
    seoTitle: {
      es: 'Términos legales',
      en: 'Legal Terms'
    },
    seoDescription: {
      es: 'Términos y condiciones de uso',
      en: 'Terms and conditions of use'
    },
    content: {
      es: '<p>Términos y condiciones legales de uso de la tienda.</p>',
      en: '<p>Legal terms and conditions for using our store.</p>'
    }
  },
  {
    slug: 'privacy',
    type: 'privacy',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Política de privacidad',
      en: 'Privacy Policy'
    },
    seoTitle: {
      es: 'Privacidad',
      en: 'Privacy'
    },
    seoDescription: {
      es: 'Nuestra política de privacidad',
      en: 'Our privacy policy'
    },
    content: {
      es: '<p>Información sobre el manejo de datos personales.</p>',
      en: '<p>Information about personal data handling.</p>'
    }
  },
  {
    slug: 'shipping',
    type: 'shipping',
    fixed: true,
    visible: true,
    status: 'published',
    title: {
      es: 'Envíos',
      en: 'Shipping'
    },
    seoTitle: {
      es: 'Política de envíos',
      en: 'Shipping Policy'
    },
    seoDescription: {
      es: 'Información sobre envíos y entregas',
      en: 'Information about shipping and delivery'
    },
    content: {
      es: '<p>Detalles sobre nuestras políticas de envío y entrega.</p>',
      en: '<p>Details about our shipping and delivery policies.</p>'
    }
  }
]

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
  logo?: string // Legacy field - deprecated
  storePhoto?: string // Legacy field - deprecated
  logoUrl?: string // New Cloudinary URL for logo
  storefrontImageUrl?: string // New Cloudinary URL for storefront image
  logoPublicId?: string // Cloudinary public_id for logo deletion
  storefrontImagePublicId?: string // Cloudinary public_id for storefront image deletion
  theme?: string // ID del tema visual seleccionado
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
  advanced: {
    language: 'es' | 'en'
    customDomain?: {
      domain?: string
      verified?: boolean
    }
    checkout: {
      method: 'whatsapp' | 'traditional'
      whatsappMessage?: string
    }
    payments?: {
      provider?: 'culqi' | 'mercadopago' | null
      publicKey?: string
      secretKey?: string
      connected?: boolean
    }
    shipping?: {
      enabled?: boolean
      type?: 'free' | 'fixed' | 'minimum'
      cost?: number
      minimumOrderAmount?: number
      checkoutText?: string
      estimatedTime?: string
    }
    notifications?: {
      email?: boolean
      whatsapp?: boolean
      alternativeEmail?: string
    }
    seo?: {
      title?: string
      metaDescription?: string
      ogImage?: string
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

export type StoreWithId = StoreConfig & { id: string }

// Check if user has a store
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
    
    console.log('Creating store with data:', storeData)
    
    // Generate store ID
    const storeRef = doc(collection(db, 'stores'))
    const storeId = storeRef.id
    console.log('Generated store ID:', storeId)
    
    const newStore: StoreConfig = {
      ...storeData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }
    
    // Crear la tienda
    await setDoc(storeRef, newStore)
    console.log('Store document created successfully')

    try {
      // Crear la colección pages directamente
      const pagesCollectionRef = collection(db, 'stores', storeId, 'pages')

      // Usar batch para crear todas las páginas
      const batch = writeBatch(db)

      // Crear la página principal (única página fija)
      const homePageRef = doc(pagesCollectionRef)
      batch.set(homePageRef, {
        title: {
          es: 'Página principal',
          en: 'Home'
        },
        slug: '/',
        type: 'home',
        content: {
          es: '<h1>Bienvenido a tu tienda</h1><p>Aquí puedes personalizar tu página principal.</p>',
          en: '<h1>Welcome to your store</h1><p>Here you can customize your home page.</p>'
        },
        seoTitle: {
          es: 'Inicio',
          en: 'Home'
        },
        seoDescription: {
          es: 'Bienvenido a nuestra tienda online',
          en: 'Welcome to our online store'
        },
        fixed: true, // Solo la página principal es fija
        visible: true,
        status: 'published',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      })

      // Crear las páginas informativas desde INFO_PAGES
      for (const page of INFO_PAGES) {
        const pageRef = doc(pagesCollectionRef)
        batch.set(pageRef, {
          title: {
            es: page.title.es,
            en: page.title.en
          },
          slug: page.slug,
          type: page.type,
          content: {
            es: page.content.es,
            en: page.content.en
          },
          seoTitle: {
            es: page.seoTitle.es,
            en: page.seoTitle.en
          },
          seoDescription: {
            es: page.seoDescription.es,
            en: page.seoDescription.en
          },
          fixed: false, // Ninguna página informativa es fija
          visible: true,
          status: page.status,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        })
      }

      // Ejecutar el batch
      await batch.commit()
      console.log('All pages created successfully')

    } catch (error) {
      console.error('Error creating pages:', error)
      throw error
    }
    
    return { id: storeId, ...newStore }
  } catch (error) {
    console.error('Error in createStore:', error)
    throw error
  }
} 