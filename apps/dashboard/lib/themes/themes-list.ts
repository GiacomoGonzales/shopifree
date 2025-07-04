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
      primary: '#2D3748',
      secondary: '#4A5568'
    }
  },
  {
    id: 'minimal-sushi',
    nombre: 'Minimal Sushi',
    descripcion: 'Diseño minimalista con énfasis en la tipografía y el espacio en blanco. Ideal para tiendas de moda y lifestyle.',
    preview: '/themes/minimal-sushi/preview.jpg',
    category: 'minimal',
    features: [
      'Estilo minimalista',
      'Tipografía elegante',
      'Animaciones sutiles',
      'Galería moderna'
    ],
    colors: {
      primary: '#1A202C',
      secondary: '#718096'
    }
  },
  {
    id: 'pet-friendly',
    nombre: 'Pet Friendly',
    descripcion: 'Tema alegre y colorido perfecto para tiendas de mascotas y productos relacionados con animales.',
    preview: '/themes/pet-friendly/preview.jpg',
    category: 'bold',
    features: [
      'Colores vibrantes',
      'Iconos personalizados',
      'Diseño amigable',
      'Secciones especiales para productos destacados'
    ],
    colors: {
      primary: '#4C1D95',
      secondary: '#6D28D9'
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