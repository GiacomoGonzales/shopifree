import { Tienda } from '../lib/types'
import { Category } from '../lib/categories'
import { PublicProduct } from '../lib/products'
import { ComponentType } from 'react'

export interface ThemeComponentProps {
  tienda: Tienda
  categorias?: Category[]
  productos?: PublicProduct[]
}

export interface ThemeLayoutProps extends ThemeComponentProps {
  children: React.ReactNode
}

export interface ThemeProductProps {
  tienda: Tienda
  product: PublicProduct
  categorias?: Category[]
}

export type ThemeComponent = ComponentType<ThemeComponentProps>
export type ThemeLayoutComponent = ComponentType<ThemeLayoutProps>
export type ThemeProductComponent = ComponentType<ThemeProductProps>

// Función para obtener el componente de tema correcto
export function getThemeComponent(themeName: string, componentType: 'Layout' | 'Home' | 'Product'): any {
  try {
    switch (themeName) {
      case 'base-default':
        switch (componentType) {
          case 'Layout':
            return require('./base-default/Layout').default
          case 'Home':
            return require('./base-default/Home').default
          case 'Product':
            return require('./base-default/Product').default
          default:
            return require('./base-default/Layout').default
        }
      case 'elegant-boutique':
        switch (componentType) {
          case 'Layout':
            return require('./elegant-boutique/Layout').default
          case 'Home':
            return require('./elegant-boutique/Home').default
          case 'Product':
            return require('./elegant-boutique/Product').default
          default:
            return require('./elegant-boutique/Layout').default
        }
      case 'mobile-modern':
        switch (componentType) {
          case 'Layout':
            return require('./mobile-modern/Layout').default
          case 'Home':
            return require('./mobile-modern/Home').default
          case 'Product':
            return require('./mobile-modern/Product').default
          default:
            return require('./mobile-modern/Layout').default
        }
      case 'pet-friendly':
        switch (componentType) {
          case 'Layout':
            return require('./pet-friendly/Layout').default
          case 'Home':
            return require('./pet-friendly/Home').default
          case 'Product':
            return require('./pet-friendly/Product').default
          default:
            return require('./pet-friendly/Layout').default
        }
      default:
        // Fallback al tema base-default
        switch (componentType) {
          case 'Layout':
            return require('./base-default/Layout').default
          case 'Home':
            return require('./base-default/Home').default
          case 'Product':
            return require('./base-default/Product').default
          default:
            return require('./base-default/Layout').default
        }
    }
  } catch (error) {
    console.error(`Error loading theme component ${themeName}/${componentType}:`, error)
    // Fallback al tema base-default
    return require('./base-default/Layout').default
  }
} 