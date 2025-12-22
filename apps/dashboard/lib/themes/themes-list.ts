import { brandColors } from '@shopifree/ui'
import { Theme } from './theme-types'

// Tipos de tema: catalog (gratis) o premium (de pago)
export type ThemeType = 'catalog' | 'premium'

export interface CatalogTheme extends Theme {
  type: ThemeType
  description?: string
}

// Temas de CATÁLOGO (gratis) - ultra ligeros, solo WhatsApp
export const catalogThemes: CatalogTheme[] = [
  {
    id: 'minimal',
    translationKey: 'minimal',
    preview: '/themes/minimal/preview.svg',
    category: 'minimal',
    recommended: true,
    type: 'catalog',
    description: 'Limpio y minimalista. Perfecto para cualquier negocio.',
    colors: {
      primary: '#1a1a1a',
      secondary: '#666666'
    }
  },
  {
    id: 'boutique',
    translationKey: 'boutique',
    preview: '/themes/boutique/preview.svg',
    category: 'elegant',
    recommended: false,
    type: 'catalog',
    description: 'Elegante y sofisticado. Ideal para moda y accesorios.',
    colors: {
      primary: '#1c1917',
      secondary: '#a8a29e'
    }
  },
  {
    id: 'bold',
    translationKey: 'bold',
    preview: '/themes/bold/preview.svg',
    category: 'modern',
    recommended: false,
    type: 'catalog',
    description: 'Moderno y atrevido. Para marcas con personalidad.',
    colors: {
      primary: '#000000',
      secondary: '#FBBF24'
    }
  },
  {
    id: 'fresh',
    translationKey: 'fresh',
    preview: '/themes/fresh/preview.svg',
    category: 'friendly',
    recommended: false,
    type: 'catalog',
    description: 'Fresco y amigable. Perfecto para comida y productos naturales.',
    colors: {
      primary: '#10B981',
      secondary: '#34D399'
    }
  },
  {
    id: 'neon',
    translationKey: 'neon',
    preview: '/themes/neon/preview.svg',
    category: 'modern',
    recommended: false,
    type: 'catalog',
    description: 'Cyberpunk y futurista. Para marcas tech y gaming.',
    colors: {
      primary: '#00ff88',
      secondary: '#ff00ff'
    }
  },
  {
    id: 'luxe',
    translationKey: 'luxe',
    preview: '/themes/luxe/preview.svg',
    category: 'elegant',
    recommended: false,
    type: 'catalog',
    description: 'Ultra premium con acentos dorados. Para productos de lujo.',
    colors: {
      primary: '#C9A962',
      secondary: '#0C0C0C'
    }
  },
  {
    id: 'craft',
    translationKey: 'craft',
    preview: '/themes/craft/preview.svg',
    category: 'friendly',
    recommended: false,
    type: 'catalog',
    description: 'Artesanal y hecho a mano. Para productos handmade.',
    colors: {
      primary: '#B45309',
      secondary: '#E8DDD4'
    }
  },
  {
    id: 'pop',
    translationKey: 'pop',
    preview: '/themes/pop/preview.svg',
    category: 'friendly',
    recommended: false,
    type: 'catalog',
    description: 'Colorido y divertido. Para marcas juveniles y alegres.',
    colors: {
      primary: '#FF6B9D',
      secondary: '#A855F7'
    }
  }
]

// Temas PREMIUM - tienda completa con checkout
export const premiumThemes: CatalogTheme[] = [
  {
    id: 'new-base-default',
    translationKey: 'baseDefault',
    preview: '/themes/new-base-default/preview.png',
    category: 'modern',
    recommended: true,
    type: 'premium',
    description: 'Tienda completa con checkout, pagos y envíos.',
    colors: {
      primary: '#171717',
      secondary: '#737373'
    }
  },
  {
    id: 'restaurant',
    translationKey: 'restaurant',
    preview: '/themes/restaurant/preview.svg',
    category: 'modern',
    recommended: false,
    type: 'premium',
    description: 'Optimizado para restaurantes y delivery.',
    colors: {
      primary: '#dc2626',
      secondary: '#ea580c'
    }
  }
]

// Todos los temas (para compatibilidad)
export const availableThemes: Theme[] = [...catalogThemes, ...premiumThemes]

// Función helper para obtener un tema por ID
export const getThemeById = (themeId: string): Theme | undefined => {
  return availableThemes.find(theme => theme.id === themeId)
}

// Función helper para validar si un ID de tema es válido
export const isValidTheme = (themeId: string): boolean => {
  return availableThemes.some(theme => theme.id === themeId)
}

// Función helper para verificar si un tema es de catálogo
export const isCatalogTheme = (themeId: string): boolean => {
  return catalogThemes.some(theme => theme.id === themeId)
}

// Tema por defecto para catálogo
export const DEFAULT_CATALOG_THEME_ID = 'minimal'

// Tema por defecto para tienda premium
export const DEFAULT_PREMIUM_THEME_ID = 'new-base-default'

// Tema por defecto (catálogo por defecto ahora)
export const DEFAULT_THEME_ID = 'minimal' 