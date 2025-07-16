export interface Theme {
  id: string
  translationKey: string
  preview: string
  colors?: {
    primary: string
    secondary: string
  }
  category?: 'minimal' | 'modern' | 'classic' | 'bold' // Categoría del tema (opcional)
  recommended?: boolean // Si es un tema recomendado (opcional)
} 