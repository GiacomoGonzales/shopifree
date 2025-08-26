import { brandColors } from '@shopifree/ui'
import { Theme } from './theme-types'

export const availableThemes: Theme[] = [
  {
    id: 'new-base-default',
    translationKey: 'baseDefault',
    preview: '/themes/new-base-default/preview.svg',
    category: 'modern',
    recommended: true,
    colors: {
      primary: '#171717', // Modern dark
      secondary: '#737373'  // Modern gray
    }
  }
  // TODO: Agregar más temas aquí conforme se vayan creando
  // {
  //   id: 'otro-tema',
  //   translationKey: 'otroTema',
  //   preview: '/themes/otro-tema/preview.svg',
  //   category: 'categoria',
  //   recommended: false,
  //   colors: {
  //     primary: '#000000',
  //     secondary: '#ffffff'
  //   }
  // }
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
export const DEFAULT_THEME_ID = 'new-base-default' 