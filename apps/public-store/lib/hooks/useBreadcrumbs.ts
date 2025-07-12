import { useState, useEffect } from 'react'
import { Category } from '../categories'
import { PublicProduct } from '../products'

export interface BreadcrumbItem {
  label: string
  href: string
  isActive?: boolean
}

interface UseBreadcrumbsProps {
  product?: PublicProduct
  categories?: Category[]
  currentCategory?: Category
}

export const useBreadcrumbs = ({ product, categories = [], currentCategory }: UseBreadcrumbsProps) => {
  const [breadcrumbs, setBreadcrumbs] = useState<BreadcrumbItem[]>([])

  useEffect(() => {
    const generateBreadcrumbs = () => {
      const baseBreadcrumbs: BreadcrumbItem[] = [
        { label: 'Inicio', href: '/' }
      ]

      // Si estamos en una página de producto
      if (product) {
        const navigationContext = getNavigationContext()
        
        // Detectar contexto de navegación
        switch (navigationContext.type) {
          case 'category':
            // Viene de una categoría específica
            const categoryFromContext = categories.find(cat => cat.slug === navigationContext.categorySlug)
            if (categoryFromContext) {
              baseBreadcrumbs.push({
                label: categoryFromContext.name,
                href: `/categoria/${categoryFromContext.slug}`
              })
            }
            break
            
          case 'search':
            // Viene de búsqueda
            baseBreadcrumbs.push({
              label: 'Búsqueda',
              href: '/?search=' + encodeURIComponent(navigationContext.query || '')
            })
            break
            
          case 'favorites':
            // Viene de favoritos
            baseBreadcrumbs.push({
              label: 'Favoritos',
              href: '/favoritos'
            })
            break
            
          default:
            // Acceso directo - usar categoría principal del producto
            const primaryCategory = getPrimaryCategory(product, categories)
            if (primaryCategory) {
              baseBreadcrumbs.push({
                label: primaryCategory.name,
                href: `/categoria/${primaryCategory.slug}`
              })
            }
        }
        
        // Agregar el producto actual
        baseBreadcrumbs.push({
          label: product.name,
          href: `/${product.slug}`,
          isActive: true
        })
      }
      
      // Si estamos en una página de categoría
      else if (currentCategory) {
        // Verificar si es subcategoría
        const parentCategory = categories.find(cat => cat.id === currentCategory.parentCategoryId)
        
        if (parentCategory) {
          // Es subcategoría, agregar padre primero
          baseBreadcrumbs.push({
            label: parentCategory.name,
            href: `/categoria/${parentCategory.slug}`
          })
        }
        
        baseBreadcrumbs.push({
          label: currentCategory.name,
          href: `/categoria/${currentCategory.slug}`,
          isActive: true
        })
      }

      setBreadcrumbs(baseBreadcrumbs)
    }

    generateBreadcrumbs()
  }, [product, categories, currentCategory])

  return breadcrumbs
}

// Función para detectar el contexto de navegación
const getNavigationContext = () => {
  if (typeof window === 'undefined') {
    return { type: 'direct' }
  }

  // 1. Verificar sessionStorage para contexto persistente
  const storedContext = sessionStorage.getItem('navigationContext')
  if (storedContext) {
    try {
      const context = JSON.parse(storedContext)
      // Limpiar después de usar
      sessionStorage.removeItem('navigationContext')
      return context
    } catch (error) {
      console.error('Error parsing navigation context:', error)
    }
  }

  // 2. Analizar document.referrer
  const referrer = document.referrer
  if (referrer) {
    const referrerUrl = new URL(referrer)
    const pathname = referrerUrl.pathname
    
    // Viene de una categoría
    if (pathname.startsWith('/categoria/')) {
      const categorySlug = pathname.split('/categoria/')[1]
      return {
        type: 'category',
        categorySlug: categorySlug
      }
    }
    
    // Viene de favoritos
    if (pathname === '/favoritos') {
      return {
        type: 'favorites'
      }
    }
    
    // Viene de búsqueda en home
    const searchParams = referrerUrl.searchParams
    const searchQuery = searchParams.get('search') || searchParams.get('q')
    if (searchQuery) {
      return {
        type: 'search',
        query: searchQuery
      }
    }
    
    // Viene del home
    if (pathname === '/') {
      return {
        type: 'home'
      }
    }
  }

  return { type: 'direct' }
}

// Función para obtener la categoría principal de un producto
const getPrimaryCategory = (product: PublicProduct, categories: Category[]): Category | null => {
  if (!product.selectedParentCategoryIds || product.selectedParentCategoryIds.length === 0) {
    return null
  }

  // Buscar la primera categoría válida
  for (const categoryId of product.selectedParentCategoryIds) {
    const category = categories.find(cat => cat.id === categoryId)
    if (category) {
      return category
    }
  }

  return null
}

// Función para establecer contexto de navegación (llamar antes de navegar)
export const setNavigationContext = (context: { type: string; categorySlug?: string; query?: string }) => {
  if (typeof window !== 'undefined') {
    sessionStorage.setItem('navigationContext', JSON.stringify(context))
  }
} 