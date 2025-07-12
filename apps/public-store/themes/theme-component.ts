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