import { brandColors } from '@shopifree/ui'
import { Theme } from './theme-types'

export const availableThemes: Theme[] = [
  {
    id: 'base-default',
    nombre: 'Tema Base',
    descripcion: 'Un diseño limpio y profesional que se adapta a todo tipo de negocios. Perfecto para comenzar tu tienda online.',
    preview: '/themes/base-default/preview.jpg',
    category: 'classic',
    recommended: true,
    features: [
      'Diseño adaptable',
      'Alto contraste',
      'Fácil navegación',
      'Optimizado para móviles'
    ],
    colors: {
      primary: brandColors.neutral[800],
      secondary: brandColors.neutral[600]
    }
  },
  {
    id: 'mobile-modern',
    nombre: 'Mobile Modern',
    descripcion: 'Diseño optimizado para móviles con colores vibrantes y una experiencia táctil moderna. Ideal para audiencias jóvenes.',
    preview: '/themes/mobile-modern/preview.svg',
    category: 'modern',
    recommended: true,
    features: [
      'Mobile-first',
      'Colores vibrantes',
      'Experiencia táctil',
      'Navegación intuitiva'
    ],
    colors: {
      primary: brandColors.blue[500],
      secondary: brandColors.success
    }
  },
  {
    id: 'minimal-sushi',
    nombre: 'Minimal Sushi',
    descripcion: 'Diseño minimalista con énfasis en la tipografía y el espacio en blanco. Ideal para tiendas de moda y lifestyle.',
    preview: '/themes/minimal-sushi/preview.svg',
    category: 'minimal',
    features: [
      'Estilo minimalista',
      'Tipografía elegante',
      'Animaciones sutiles',
      'Galería moderna'
    ],
    colors: {
      primary: brandColors.neutral[900],
      secondary: brandColors.neutral[500]
    }
  },
  {
    id: 'pet-friendly',
    nombre: 'Pet Friendly',
    descripcion: 'Tema alegre y colorido perfecto para tiendas de mascotas y productos relacionados con animales.',
    preview: '/themes/pet-friendly/preview.svg',
    category: 'bold',
    features: [
      'Colores vibrantes',
      'Iconos personalizados',
      'Diseño amigable',
      'Secciones especiales para productos destacados'
    ],
    colors: {
      primary: brandColors.indigo[700],
      secondary: brandColors.indigo[500]
    }
  },
  {
    id: 'minimal-clean',
    nombre: 'Minimal Clean',
    descripcion: 'Diseño ultraminimalista con líneas limpias y espacios amplios. Perfecto para productos premium.',
    preview: '/themes/minimal-clean/preview.svg',
    category: 'minimal',
    features: [
      'Ultra minimalista',
      'Espacios amplios',
      'Líneas limpias',
      'Productos premium'
    ],
    colors: {
      primary: brandColors.neutral[900],
      secondary: brandColors.neutral[400]
    }
  },
  {
    id: 'elegant-boutique',
    nombre: 'Elegant Boutique',
    descripcion: 'Diseño sofisticado y elegante inspirado en boutiques de lujo. Perfecto para marcas premium y productos de alta gama.',
    preview: '/themes/elegant-boutique/preview.jpg',
    category: 'classic',
    recommended: true,
    features: [
      'Estilo boutique premium',
      'Tipografía serif elegante',
      'Colores neutros cálidos',
      'Espaciado generoso',
      'Navegación sofisticada',
      'Animaciones sutiles'
    ],
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