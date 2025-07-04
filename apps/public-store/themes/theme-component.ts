import { Tienda } from '../lib/types'
import { ComponentType, PropsWithChildren } from 'react'

export interface ThemeProps {
  tienda: Tienda
}

export interface ThemeLayoutProps {
  tienda: Tienda
  children: React.ReactNode
}

// Tipos para los componentes dinámicos
export type ThemeComponent = ComponentType<ThemeProps>
export type ThemeLayoutComponent = ComponentType<{
  tienda: Tienda
  children?: React.ReactNode
}> 