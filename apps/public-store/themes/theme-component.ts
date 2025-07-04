import { Tienda } from '../lib/types'
import { ComponentType, PropsWithChildren } from 'react'

export interface ThemeProps {
  tienda: Tienda
}

export interface ThemeLayoutProps extends ThemeProps {
  children: React.ReactNode
}

export type ThemeComponent = ComponentType<ThemeProps>
export type ThemeLayoutComponent = ComponentType<ThemeLayoutProps> 