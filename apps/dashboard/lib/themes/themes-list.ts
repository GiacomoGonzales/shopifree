import { brandColors } from '@shopifree/ui'
import { Theme } from './theme-types'

export const availableThemes: Theme[] = [
  {
    id: 'base-default',
    translationKey: 'baseDefault',
    preview: '/themes/base-default/preview.jpg',
    category: 'classic',
    recommended: true,
    colors: {
      primary: brandColors.neutral[800],
      secondary: brandColors.neutral[600]
    }
  },
  {
    id: 'mobile-modern',
    translationKey: 'mobilemodern',
    preview: '/themes/mobile-modern/preview.svg',
    category: 'modern',
    recommended: true,
    colors: {
      primary: brandColors.blue[500],
      secondary: brandColors.success
    }
  },
  {
    id: 'minimal-sushi',
    translationKey: 'minimalSushi',
    preview: '/themes/minimal-sushi/preview.svg',
    category: 'minimal',
    colors: {
      primary: brandColors.neutral[900],
      secondary: brandColors.neutral[500]
    }
  },
  {
    id: 'pet-friendly',
    translationKey: 'petFriendly',
    preview: '/themes/pet-friendly/preview.svg',
    category: 'bold',
    colors: {
      primary: brandColors.indigo[700],
      secondary: brandColors.indigo[500]
    }
  },
  {
    id: 'minimal-clean',
    translationKey: 'minimalClean',
    preview: '/themes/minimal-clean/preview.svg',
    category: 'minimal',
    colors: {
      primary: brandColors.neutral[900],
      secondary: brandColors.neutral[400]
    }
  },
  {
    id: 'elegant-boutique',
    translationKey: 'elegantBoutique',
    preview: '/themes/elegant-boutique/preview.jpg',
    category: 'classic',
    recommended: true,
    colors: {
      primary: '#8B7D6B', // Warm taupe
      secondary: '#B8860B'  // Elegant gold
    }
  }
]

// Función helper para obtener un tema por ID
export const getThemeById = (themeId: string): Theme | undefined => {
  return availableThemes.find(theme => theme.id === themeId)
}

// Función helper para validar si un ID de tema es válido
export const isValidTheme = (themeId: string): boolean => {
  return availableThemes.some(theme => theme.id === themeId)
}

// Tema por defecto
export const DEFAULT_THEME_ID = 'base-default' 