export interface Theme {
  id: string
  nombre: string
  descripcion: string
  preview: string
  features?: string[] // Características especiales del tema (opcional)
  colors?: {
    primary: string
    secondary: string
  }
  category?: 'minimal' | 'modern' | 'classic' | 'bold' // Categoría del tema (opcional)
  recommended?: boolean // Si es un tema recomendado (opcional)
} 