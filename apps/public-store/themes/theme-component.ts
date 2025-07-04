import { Tienda } from '../lib/types'
import { ComponentType } from 'react'

export interface ThemeComponentProps {
  tienda: Tienda
}

export interface ThemeLayoutProps extends ThemeComponentProps {
  children: React.ReactNode
}

export type ThemeComponent = ComponentType<ThemeComponentProps>
export type ThemeLayoutComponent = ComponentType<ThemeLayoutProps> 