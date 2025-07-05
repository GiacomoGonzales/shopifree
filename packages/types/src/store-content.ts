import { Timestamp } from 'firebase/firestore'

// Tipos de plantillas disponibles
export const PAGE_TEMPLATES = {
  ABOUT: {
    title: {
      es: 'Quiénes somos',
      en: 'About Us'
    },
    slug: '/about-us',
    content: '',
  },
  CONTACT: {
    title: {
      es: 'Contacto',
      en: 'Contact'
    },
    slug: '/contact',
    content: '',
  },
  LOCATION: {
    title: {
      es: 'Ubícanos',
      en: 'Find Us'
    },
    slug: '/location',
    content: '',
  },
  CLAIMS: {
    title: {
      es: 'Libro de reclamaciones',
      en: 'Claims Book'
    },
    slug: '/claims',
    content: '',
  },
  SERVICES: {
    title: {
      es: 'Servicios',
      en: 'Services'
    },
    slug: '/services',
    content: '',
  }
} as const

export type PageTemplate = typeof PAGE_TEMPLATES[keyof typeof PAGE_TEMPLATES]

// 1. Tipos para content/pages
export interface StorePage {
  id: string
  slug: string
  title: string
  content: string | ContentBlock[] // Preparado para futura estructura de bloques
  enabled: boolean
  status: 'published' | 'draft'
  fixed: boolean // Para páginas que no se pueden eliminar
  visible: boolean // Para controlar visibilidad en el frontend
  order?: number
  seoTitle: string
  seoDescription: string
  image?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'html' | string // Extensible para futuros tipos
  content: any // Específico según el tipo
  settings?: Record<string, any> // Configuraciones adicionales
}

// 2. Tipos para design/elements
export interface DesignElement {
  type: DesignElementType
  enabled: boolean
  data: DesignElementData
  designId: string
  order?: number
}

export type DesignElementType = 
  | 'header' 
  | 'footer' 
  | 'carousel' 
  | 'search' 
  | 'banner' 
  | 'navigation' 
  | 'social' 
  | string // Extensible para futuros tipos

export type DesignElementData = {
  [key: string]: any // Específico según el tipo
}

// Ejemplos de datos específicos por tipo
export interface CarouselData extends DesignElementData {
  images: string[]
  speed?: number
  autoplay?: boolean
  showDots?: boolean
  showArrows?: boolean
}

export interface SearchData extends DesignElementData {
  placeholder?: string
  showInHeader?: boolean
  style?: 'minimal' | 'expanded'
}

// 3. Tipos para design/config
export interface DesignConfig {
  theme: string
  logoUrl?: string
  secondaryLogoUrl?: string
  mainColor: string
  secondaryColor: string
  layout?: string
  font?: string
  showCart: boolean
  showHeader: boolean
  showFooter: boolean
  showSearchBar: boolean
  showCategoryBar: boolean
  socialLinks?: {
    facebook?: string
    instagram?: string
    tiktok?: string
    twitter?: string
    youtube?: string
    pinterest?: string
    [key: string]: string | undefined // Extensible para futuras redes
  }
  topBannerText?: string
  showTopBanner: boolean
  customCss?: string // Para futura personalización avanzada
  customJs?: string // Para futura personalización avanzada
} 