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

export type ThemeComponent = ComponentType<ThemeComponentProps>
export type ThemeLayoutComponent = ComponentType<ThemeLayoutProps> 