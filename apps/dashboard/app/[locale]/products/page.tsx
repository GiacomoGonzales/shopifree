'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../components/DashboardLayout'
import { useStore } from '../../../lib/hooks/useStore'
import { Toast } from '../../../components/shared/Toast'
import { useToast } from '../../../lib/hooks/useToast'
import {
  getFilteredProducts,
  deleteProduct,
  updateProductStock,
  formatPrice,
  type ProductWithId,
  type ProductFilters,
  type SortOption,
  type ProductVariant
} from '../../../lib/products'
import { getBrands, type BrandWithId } from '../../../lib/brands'
import { getParentCategories, getSubcategories, type CategoryWithId } from '../../../lib/categories'
import { getActivePromotionsForProduct, type Promotion, calculateDiscountedPrice } from '../../../lib/promotions'

export default function ProductsPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const t = useTranslations('products')
  const { toast, showToast, hideToast } = useToast()
  
  const [paginatedProducts, setPaginatedProducts] = useState<ProductWithId[]>([])
  const [brands, setBrands] = useState<BrandWithId[]>([])
  const [categories, setCategories] = useState<CategoryWithId[]>([])
  const [subcategories, setSubcategories] = useState<CategoryWithId[]>([])
  const [productPromotions, setProductPromotions] = useState<Record<string, Promotion[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState<string | null>(null)
  const [stockModalOpen, setStockModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState<ProductWithId | null>(null)
  const [stockChanges, setStockChanges] = useState<{
    stockQuantity?: number
    variants?: { [variantId: string]: number }
  }>({})
  const [updating, setUpdating] = useState(false)
  const menuRefs = useRef<{[key: string]: HTMLDivElement | null}>({})
  const mobileMenuRefs = useRef<{[key: string]: HTMLDivElement | null}>({})
  
  // Estados para filtros y paginación
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('created-desc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)

  // Estados para filtros avanzados
  const [showFilters, setShowFilters] = useState(false)
  const [showSortOptions, setShowSortOptions] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState<string>('')
  const [brandFilter, setBrandFilter] = useState<string>('')
  const [priceRange, setPriceRange] = useState({ min: '', max: '' })

  const itemsPerPage = 8

  // Función para hacer scroll to top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Función para obtener el texto del ordenamiento actual
  const getSortText = () => {
    switch (sortBy) {
      case 'created-desc': return t('sortOptions.newest')
      case 'created-asc': return t('sortOptions.oldest')
      case 'name-asc': return t('sortOptions.nameAsc')
      case 'name-desc': return t('sortOptions.nameDesc')
      case 'price-asc': return t('sortOptions.priceAsc')
      case 'price-desc': return t('sortOptions.priceDesc')
      default: return t('sort')
    }
  }

  // Crear objeto de filtros
  const filters: ProductFilters = useMemo(() => ({
    searchQuery: searchQuery.trim() || undefined,
    sortBy,
    status: statusFilter,
    categoryIds: categoryFilter ? [categoryFilter] : undefined,
    brandIds: brandFilter ? [brandFilter] : undefined,
    priceRange: (priceRange.min || priceRange.max) ? {
      min: priceRange.min ? parseFloat(priceRange.min) : undefined,
      max: priceRange.max ? parseFloat(priceRange.max) : undefined
    } : undefined
  }), [searchQuery, sortBy, statusFilter, categoryFilter, brandFilter, priceRange])

  // Cargar marcas y categorías
  useEffect(() => {
    const loadData = async () => {
      if (!store?.id) return
      
      try {
        // Cargar marcas y categorías en paralelo
        const [
          brandsList,
          parentCategoriesList
        ] = await Promise.all([
          getBrands(store.id),
          getParentCategories(store.id)
        ])

        setBrands(brandsList)
        setCategories(parentCategoriesList)

        // Cargar subcategorías para todas las categorías padre
        const allSubcategoriesPromises = parentCategoriesList.map(category => 
          getSubcategories(store.id, category.id)
        )
        
        const allSubcategoriesArrays = await Promise.all(allSubcategoriesPromises)
        const allSubcategories = allSubcategoriesArrays.flat()
        
        // Eliminar duplicados si los hay
        const uniqueSubcategories = allSubcategories.filter((subcategory, index, array) => 
          array.findIndex(s => s.id === subcategory.id) === index
        )
        
        setSubcategories(uniqueSubcategories)
        
      } catch (err) {
        console.error('Error cargando datos:', err)
        setError(t('messages.error'))
      }
    }

    if (!storeLoading && store?.id) {
      loadData()
    }
  }, [store?.id, storeLoading, t])

  // Cargar productos filtrados
  useEffect(() => {
    const loadProducts = async () => {
      if (!store?.id) return
      
      try {
        setLoading(true)
        
        const result = await getFilteredProducts(store.id, filters, currentPage, itemsPerPage)

        setPaginatedProducts(result.paginatedProducts)
        setTotalPages(result.totalPages)
        setCurrentPage(result.currentPage)
        setTotalItems(result.totalItems)

        // Cargar promociones para cada producto
        const promotionsMap: Record<string, Promotion[]> = {}
        for (const product of result.paginatedProducts) {
          try {
            const promotions = await getActivePromotionsForProduct(store.id, product.id)
            promotionsMap[product.id] = promotions
          } catch (error) {
            console.error(`Error loading promotions for product ${product.id}:`, error)
            promotionsMap[product.id] = []
          }
        }
        setProductPromotions(promotionsMap)
        
      } catch (err) {
        console.error('Error cargando productos:', err)
        setError(t('messages.loadError'))
      } finally {
        setLoading(false)
      }
    }

    if (!storeLoading && store?.id) {
      loadProducts()
    }
  }, [store?.id, storeLoading, filters, currentPage, t])

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy, statusFilter])

  // Auto-cerrar toast después de 5 segundos
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        hideToast()
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast, hideToast])

  // Función para obtener el nombre de la marca
  const getBrandName = (brandId?: string | null) => {
    if (!brandId) return ''
    return brands.find(b => b.id === brandId)?.name || ''
  }

  // Función para obtener nombres de categorías
  const getCategoryNames = (categoryIds?: string[] | null) => {
    if (!categoryIds || categoryIds.length === 0) return []
    
    const names = categoryIds.map(id => {
      const category = categories.find(c => c.id === id)
      return category?.name || ''
    }).filter(Boolean)
    
    return names
  }

  // Función para obtener nombres de subcategorías
  const getSubcategoryNames = (subcategoryIds?: string[] | null) => {
    if (!subcategoryIds || subcategoryIds.length === 0) return []

    const names = subcategoryIds.map(id => {
      const subcategory = subcategories.find(s => s.id === id)
      return subcategory?.name || ''
    }).filter(Boolean)

    return names
  }

  // Función para obtener información de precio con promociones
  const getPriceInfo = (product: ProductWithId) => {
    const promotions = productPromotions[product.id] || []
    if (promotions.length === 0) {
      return {
        finalPrice: product.price,
        originalPrice: product.price,
        hasPromotion: false,
        discount: 0,
        promotionName: null
      }
    }

    const { finalPrice, discount, appliedPromotion } = calculateDiscountedPrice(product.price, promotions)
    return {
      finalPrice,
      originalPrice: product.price,
      hasPromotion: discount > 0,
      discount,
      promotionName: appliedPromotion?.name || null
    }
  }

  // Función para obtener indicador de stock
  const getStockIndicator = (product: ProductWithId) => {
    if (!product.trackStock) {
      return { text: t('stock.noTracking'), color: 'text-gray-400', icon: '⚪' }
    }

    if (product.hasVariants && product.variants.length > 0) {
      const totalStock = product.variants.reduce((sum, variant) => sum + variant.stock, 0)
      const activeVariants = product.variants.filter(variant => variant.stock > 0).length
      
      if (totalStock === 0) {
        return { text: t('stock.outOfStock'), color: 'text-red-500', icon: '🔴' }
      } else if (totalStock < 10) {
        return { text: `${activeVariants}/${product.variants.length}`, color: 'text-yellow-500', icon: '🟡' }
      } else {
        return { text: `${activeVariants}/${product.variants.length}`, color: 'text-green-500', icon: '🟢' }
      }
    } else {
      const stock = product.stockQuantity || 0
      if (stock === 0) {
        return { text: t('stock.outOfStock'), color: 'text-red-500', icon: '🔴' }
      } else if (stock < 10) {
        return { text: `${stock}`, color: 'text-yellow-500', icon: '🟡' }
      } else {
        return { text: `${stock}`, color: 'text-green-500', icon: '🟢' }
      }
    }
  }

  // Función para editar producto
  const handleEdit = (productId: string) => {
    router.push(`/products/${productId}/edit`)
  }

  // Función para abrir/cerrar menú contextual
  const toggleMenu = (productId: string) => {
    setOpenMenuId(openMenuId === productId ? null : productId)
  }

  // Funciones para filtros
  const clearFilters = () => {
    setCategoryFilter('')
    setBrandFilter('')
    setPriceRange({ min: '', max: '' })
    setStatusFilter('all')
    setSearchQuery('')
    setCurrentPage(1)
  }

  const hasActiveFilters = categoryFilter || brandFilter || priceRange.min || priceRange.max || statusFilter !== 'all' || searchQuery

  // Función para manejar actualización de stock
  const handleUpdateStock = (product: ProductWithId) => {
    setOpenMenuId(null) // Cerrar menú
    setSelectedProduct(product)

    // Inicializar los cambios de stock con los valores actuales
    if (product.hasVariants && product.variants.length > 0) {
      const variantsStock: { [variantId: string]: number } = {}
      product.variants.forEach(variant => {
        variantsStock[variant.id] = variant.stock
      })
      setStockChanges({ variants: variantsStock })
    } else {
      setStockChanges({ stockQuantity: product.stockQuantity || 0 })
    }

    setStockModalOpen(true)
  }

  // Función para actualizar stock
  const handleSaveStock = async () => {
    if (!selectedProduct || !store?.id) return

    try {
      setUpdating(true)

      if (selectedProduct.hasVariants && selectedProduct.variants.length > 0) {
        // Actualizar variantes
        const updatedVariants: ProductVariant[] = selectedProduct.variants.map(variant => ({
          ...variant,
          stock: stockChanges.variants?.[variant.id] ?? variant.stock
        }))

        await updateProductStock(store.id, selectedProduct.id, { variants: updatedVariants })
      } else {
        // Actualizar producto simple
        await updateProductStock(store.id, selectedProduct.id, {
          stockQuantity: stockChanges.stockQuantity
        })
      }

      // Recargar productos
      const result = await getFilteredProducts(store.id, filters, currentPage, itemsPerPage)
      setPaginatedProducts(result.paginatedProducts)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)

      setStockModalOpen(false)
      setStockChanges({})
      showToast(t('stock.updateSuccess'), 'success')
    } catch (error) {
      console.error('Error actualizando existencias:', error)
      showToast(t('stock.updateError'), 'error')
    } finally {
      setUpdating(false)
    }
  }

  // Cerrar menú al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Manejar dropdown desktop
      if (openMenuId && menuRefs.current[openMenuId] && !menuRefs.current[openMenuId]?.contains(event.target as Node)) {
        setOpenMenuId(null)
      }

      // Manejar dropdown móvil
      if (mobileMenuOpen && mobileMenuRefs.current[mobileMenuOpen] && !mobileMenuRefs.current[mobileMenuOpen]?.contains(event.target as Node)) {
        setMobileMenuOpen(null)
      }

      // Manejar dropdown de filtros y ordenar
      const target = event.target as Element
      const filtersContainer = document.querySelector('.filters-container')
      const sortContainer = document.querySelector('.sort-container')

      if (showFilters && filtersContainer && !filtersContainer.contains(target as Node)) {
        setShowFilters(false)
      }
      if (showSortOptions && sortContainer && !sortContainer.contains(target as Node)) {
        setShowSortOptions(false)
      }
    }

    if (openMenuId || mobileMenuOpen || showFilters || showSortOptions) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [openMenuId, mobileMenuOpen, showFilters, showSortOptions])



  // Función para vista previa del producto en la tienda
  const handlePreview = (product: ProductWithId) => {
    if (!store?.subdomain) {
      console.error('No subdomain available for preview')
      showToast(t('messages.storeError'), 'error')
      return
    }

    // Solo productos activos pueden ser previsualizados
    if (product.status !== 'active') {
      showToast(t('messages.previewError'), 'error')
      return
    }

    // Generar slug del producto si no existe
    const productSlug = product.urlSlug || 
      `${product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')}-${product.id.slice(-6)}`
    
    // Construir URL de la tienda pública
    const storeUrl = process.env.NODE_ENV === 'development' 
      ? `http://localhost:3004/${store.subdomain}/producto/${productSlug}`
      : `https://${store.subdomain}.shopifree.app/producto/${productSlug}`
    
    // Abrir en nueva pestaña
    window.open(storeUrl, '_blank', 'noopener,noreferrer')
    
    // Mostrar mensaje de éxito
    showToast(t('messages.previewSuccess'), 'success')
  }

  // Función para eliminar producto
  const handleDelete = async (productId: string) => {
    if (!store?.id) return
    
    try {
      setDeleting(productId)
      await deleteProduct(store.id, productId)
      
      // Recargar productos después de eliminar
      const result = await getFilteredProducts(store.id, filters, currentPage, itemsPerPage)
      setPaginatedProducts(result.paginatedProducts)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
      
      // Si la página actual queda vacía, ir a la página anterior
      if (result.paginatedProducts.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
      
    } catch (err) {
      console.error('Error al eliminar producto:', err)
      setError(t('messages.deleteError'))
    } finally {
      setDeleting(null)
    }
  }

  // Obtener conteos por estado
  const getStatusCounts = () => {
    // Esto es una aproximación, idealmente lo haríamos en el servidor
    return {
      all: totalItems,
      active: totalItems, // Placeholder
      draft: 0, // Placeholder
      archived: 0 // Placeholder
    }
  }

  const statusCounts = getStatusCounts()

  // Componente de paginación
  const PaginationComponent = () => (
    <div className="border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
      <div className="flex flex-col items-center space-y-4 sm:hidden">
        {/* Información de productos y página actual en móvil */}
        <div className="text-center">
          <p className="text-sm text-gray-700">
            {t('pagination.showing')} <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> {t('pagination.to')}{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            {t('pagination.of')} <span className="font-medium">{totalItems}</span> {t('pagination.products')}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {t('pagination.pageOf', { current: currentPage, total: totalPages })}
          </p>
        </div>

        {/* Botones de navegación en móvil */}
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => {
              setCurrentPage(currentPage - 1)
              scrollToTop()
            }}
            disabled={currentPage === 1}
            className="relative inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('pagination.previous')}
          </button>
          <button
            onClick={() => {
              setCurrentPage(currentPage + 1)
              scrollToTop()
            }}
            disabled={currentPage === totalPages}
            className="relative inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {t('pagination.next')}
          </button>
        </div>
      </div>

      {/* Versión desktop */}
      <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            {t('pagination.showing')} <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> {t('pagination.to')}{' '}
            <span className="font-medium">
              {Math.min(currentPage * itemsPerPage, totalItems)}
            </span>{' '}
            {t('pagination.of')} <span className="font-medium">{totalItems}</span> {t('pagination.products')}
          </p>
        </div>
        <div>
          <nav className="isolate inline-flex -space-x-px rounded-lg shadow-sm" aria-label="Pagination">
            <button
              onClick={() => {
                setCurrentPage(currentPage - 1)
                scrollToTop()
              }}
              disabled={currentPage === 1}
              className="relative inline-flex items-center rounded-l-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">{t('pagination.previous')}</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10 12.77 13.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
              </svg>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => {
                  setCurrentPage(page)
                  scrollToTop()
                }}
                disabled={currentPage === page}
                className={`relative inline-flex items-center px-4 py-2 text-sm font-medium border ${
                  currentPage === page
                    ? 'z-10 bg-gray-900 text-white border-gray-900'
                    : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
                }`}
              >
                {page}
              </button>
            ))}
            <button
              onClick={() => {
                setCurrentPage(currentPage + 1)
                scrollToTop()
              }}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center rounded-r-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span className="sr-only">{t('pagination.next')}</span>
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M7.21 14.77a.75.75 0 01.02-1.06L11.168 10 7.23 6.29a.75.75 0 111.04-1.08l4.5 4.25a.75.75 0 010 1.08l-4.5 4.25a.75.75 0 01-1.06-.02z" clipRule="evenodd" />
              </svg>
            </button>
          </nav>
        </div>
      </div>
    </div>
  )

  if (storeLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header skeleton */}
            <div className="mb-6 animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-48 mb-4"></div>
              <div className="flex gap-2">
                <div className="h-10 bg-gray-200 rounded w-32"></div>
                <div className="h-10 bg-gray-200 rounded w-32"></div>
              </div>
            </div>

            {/* Table skeleton - Desktop */}
            <div className="hidden lg:block bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden animate-pulse">
              {/* Table header */}
              <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                <div className="flex items-center space-x-6">
                  <div className="w-4 h-4 bg-gray-200 rounded"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-28"></div>
                  <div className="h-3 bg-gray-200 rounded w-24"></div>
                  <div className="h-3 bg-gray-200 rounded w-32"></div>
                </div>
              </div>
              {/* Table rows */}
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="border-b border-gray-200 px-6 py-4">
                  <div className="flex items-center space-x-6">
                    <div className="w-4 h-4 bg-gray-200 rounded"></div>
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                      </div>
                    </div>
                    <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                    <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                    <div className="flex space-x-2">
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                      <div className="w-8 h-8 bg-gray-200 rounded"></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Cards skeleton - Mobile */}
            <div className="lg:hidden space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                  <div className="flex items-start space-x-4">
                    <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                    <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                    <div className="flex-1 space-y-3">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-200 rounded w-full"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      <div className="flex gap-2">
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 pb-32">
        <div className="max-w-7xl mx-auto">
          {/* Botones de acción flotantes */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-end gap-2">
              <button 
                className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                title={t('export')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button 
                className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                title={t('import')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </button>
              <button
                onClick={() => router.push('/products/create')}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('addProduct')}
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
            {/* Tabs y controles */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="px-4 sm:px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Tabs de estado */}
                  <nav className="flex flex-wrap gap-2 lg:gap-8" aria-label="Tabs">
                    <button
                      onClick={() => setStatusFilter('all')}
                      className={`whitespace-nowrap py-2 px-3 lg:px-1 border-b-2 font-medium text-sm transition-colors rounded-t-md lg:rounded-none ${
                        statusFilter === 'all'
                          ? 'border-gray-900 text-gray-900 bg-gray-50 lg:bg-transparent'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t('tabs.all')}
                      {statusCounts.all > 0 && (
                        <span className="ml-2 py-0.5 px-2 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
                          {statusCounts.all}
                        </span>
                      )}
                    </button>
                    <button
                      onClick={() => setStatusFilter('active')}
                      className={`whitespace-nowrap py-2 px-3 lg:px-1 border-b-2 font-medium text-sm transition-colors rounded-t-md lg:rounded-none ${
                        statusFilter === 'active'
                          ? 'border-gray-900 text-gray-900 bg-gray-50 lg:bg-transparent'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t('tabs.active')}
                    </button>
                    <button
                      onClick={() => setStatusFilter('draft')}
                      className={`whitespace-nowrap py-2 px-3 lg:px-1 border-b-2 font-medium text-sm transition-colors rounded-t-md lg:rounded-none ${
                        statusFilter === 'draft'
                          ? 'border-gray-900 text-gray-900 bg-gray-50 lg:bg-transparent'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t('tabs.draft')}
                    </button>
                    <button
                      onClick={() => setStatusFilter('archived')}
                      className={`whitespace-nowrap py-2 px-3 lg:px-1 border-b-2 font-medium text-sm transition-colors rounded-t-md lg:rounded-none ${
                        statusFilter === 'archived'
                          ? 'border-gray-900 text-gray-900 bg-gray-50 lg:bg-transparent'
                          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      {t('tabs.archived')}
                    </button>
                  </nav>

                  {/* Controles de búsqueda y ordenación */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Barra de búsqueda */}
                    <div className="relative flex-1 sm:flex-none">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="block w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={t('searchPlaceholder')}
                      />
                    </div>

                    <div className="relative flex flex-row gap-3 sm:flex-row">
                      {/* Filtros */}
                      <div className="filters-container relative flex-1 sm:flex-none">
                        <button
                          onClick={() => setShowFilters(!showFilters)}
                          className={`w-full inline-flex items-center justify-center px-4 py-2 border shadow-sm text-sm leading-4 font-medium rounded-lg transition-all min-h-[44px] sm:min-h-auto ${
                            showFilters || hasActiveFilters
                              ? 'border-blue-500 text-blue-700 bg-blue-50 hover:bg-blue-100 focus:ring-blue-500'
                              : 'border-gray-300 text-gray-700 bg-white hover:bg-gray-50 focus:ring-blue-500'
                          } focus:outline-none focus:ring-2 focus:ring-offset-2`}
                        >
                          <svg className={`h-4 w-4 mr-2 ${showFilters || hasActiveFilters ? 'text-blue-500' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.586V4z" />
                          </svg>
                          {t('filter')}
                          {hasActiveFilters && (
                            <span className="ml-2 inline-flex items-center justify-center w-5 h-5 text-xs font-medium text-white bg-blue-500 rounded-full">
                              {[categoryFilter, brandFilter, priceRange.min, priceRange.max, statusFilter !== 'all' ? statusFilter : null, searchQuery].filter(Boolean).length}
                            </span>
                          )}
                        </button>

                        {/* Dropdown de filtros */}
                        {showFilters && (
                          <div className="filters-dropdown absolute left-0 -right-8 sm:right-0 sm:left-auto mt-2 w-auto sm:w-96 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="p-4">
                              <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-medium text-gray-900">{t('filters.title')}</h3>
                                <div className="flex items-center gap-2">
                                  {hasActiveFilters && (
                                    <button
                                      onClick={clearFilters}
                                      className="text-sm text-gray-500 hover:text-gray-700 transition-colors"
                                    >
                                      {t('filters.clear')}
                                    </button>
                                  )}
                                  <button
                                    onClick={() => setShowFilters(false)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                  >
                                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-4">
                                {/* Filtro por categoría */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('filters.category')}
                                  </label>
                                  <select
                                    value={categoryFilter}
                                    onChange={(e) => setCategoryFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">{t('table.noCategory')}</option>
                                    {categories.map((category) => (
                                      <option key={category.id} value={category.id}>
                                        {category.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Filtro por marca */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('filters.brand')}
                                  </label>
                                  <select
                                    value={brandFilter}
                                    onChange={(e) => setBrandFilter(e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="">{t('table.noBrand')}</option>
                                    {brands.map((brand) => (
                                      <option key={brand.id} value={brand.id}>
                                        {brand.name}
                                      </option>
                                    ))}
                                  </select>
                                </div>

                                {/* Filtro por rango de precio */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('filters.priceRange')}
                                  </label>
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="number"
                                      placeholder={t('filters.minPrice')}
                                      value={priceRange.min}
                                      onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      style={{ fontSize: '16px' }}
                                    />
                                    <input
                                      type="number"
                                      placeholder={t('filters.maxPrice')}
                                      value={priceRange.max}
                                      onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                                      className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      style={{ fontSize: '16px' }}
                                    />
                                  </div>
                                </div>

                                {/* Filtro por estado */}
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {t('filters.status')}
                                  </label>
                                  <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value as 'all' | 'active' | 'draft' | 'archived')}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                  >
                                    <option value="all">{t('tabs.all')}</option>
                                    <option value="active">{t('status.active')}</option>
                                    <option value="draft">{t('status.draft')}</option>
                                    <option value="archived">{t('status.archived')}</option>
                                  </select>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Ordenar */}
                      <div className="sort-container relative flex-1 sm:flex-none">
                        <button
                          onClick={() => setShowSortOptions(!showSortOptions)}
                          className="w-full inline-flex items-center justify-between px-4 py-2 border border-gray-300 text-gray-700 bg-white shadow-sm text-sm leading-4 font-medium rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all min-h-[44px] sm:min-h-auto"
                        >
                          <span className="flex items-center">
                            <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                            </svg>
                            {getSortText()}
                          </span>
                          <svg className="h-4 w-4 ml-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {/* Dropdown de ordenar */}
                        {showSortOptions && (
                          <div className="sort-dropdown absolute left-0 right-0 sm:right-0 sm:left-auto mt-2 w-full sm:w-56 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSortBy('created-desc')
                                  setShowSortOptions(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                  sortBy === 'created-desc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {t('sortOptions.newest')}
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('created-asc')
                                  setShowSortOptions(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                  sortBy === 'created-asc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {t('sortOptions.oldest')}
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('name-asc')
                                  setShowSortOptions(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                  sortBy === 'name-asc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {t('sortOptions.nameAsc')}
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('name-desc')
                                  setShowSortOptions(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                  sortBy === 'name-desc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {t('sortOptions.nameDesc')}
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('price-asc')
                                  setShowSortOptions(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                  sortBy === 'price-asc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {t('sortOptions.priceAsc')}
                              </button>
                              <button
                                onClick={() => {
                                  setSortBy('price-desc')
                                  setShowSortOptions(false)
                                }}
                                className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 transition-colors ${
                                  sortBy === 'price-desc' ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                                }`}
                              >
                                {t('sortOptions.priceDesc')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>


            {/* Error state */}
            {error && (
              <div className="my-4 p-4 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Loading state */}
            {loading && (
              <div>
                {/* Table skeleton - Desktop */}
                <div className="hidden lg:block bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden animate-pulse">
                  {/* Table header */}
                  <div className="bg-gray-50 border-b border-gray-200 px-6 py-3">
                    <div className="flex items-center space-x-6">
                      <div className="w-4 h-4 bg-gray-200 rounded"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-28"></div>
                      <div className="h-3 bg-gray-200 rounded w-24"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  {/* Table rows */}
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="border-b border-gray-200 px-6 py-4">
                      <div className="flex items-center space-x-6">
                        <div className="w-4 h-4 bg-gray-200 rounded"></div>
                        <div className="flex items-center space-x-4">
                          <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-200 rounded w-40"></div>
                            <div className="h-3 bg-gray-200 rounded w-32"></div>
                          </div>
                        </div>
                        <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                        <div className="h-4 bg-gray-200 rounded w-24"></div>
                        <div className="h-4 bg-gray-200 rounded w-20"></div>
                        <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                        <div className="flex space-x-2">
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                          <div className="w-8 h-8 bg-gray-200 rounded"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cards skeleton - Mobile */}
                <div className="lg:hidden bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
                  <div className="divide-y divide-gray-200">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="p-4 animate-pulse">
                        <div className="flex items-start space-x-4">
                          <div className="w-4 h-4 bg-gray-200 rounded mt-1"></div>
                          <div className="w-16 h-16 bg-gray-200 rounded-lg"></div>
                          <div className="flex-1 space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                            <div className="h-3 bg-gray-200 rounded w-full"></div>
                            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                            <div className="flex gap-2">
                              <div className="h-6 bg-gray-200 rounded-full w-20"></div>
                              <div className="h-6 bg-gray-200 rounded-full w-24"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Table */}
            {!loading && (
              <>
                {totalItems === 0 ? (
                  <div className="text-center py-12 bg-white">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchQuery || statusFilter !== 'all' ? t('noProducts') : t('noProductsEmpty')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery || statusFilter !== 'all' 
                        ? t('noProductsMessage')
                        : t('noProductsEmptyMessage')
                      }
                    </p>
                    {!searchQuery && statusFilter === 'all' && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => router.push('/products/create')}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        >
                          {t('addProduct')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-visible">
                    {/* Desktop Table View */}
                    <div className="hidden lg:block">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="w-4 px-6 py-3">
                              <input
                                type="checkbox"
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                              />
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.product')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.status')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.categories')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.brand')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('promotions.title')}
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">{t('table.actions')}</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {paginatedProducts.map((product) => (
                            <tr key={product.id} className="hover:bg-gray-50">
                              <td className="w-4 px-6 py-4">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-12 w-12">
                                    {product.mediaFiles && product.mediaFiles.length > 0 ? (
                                      <img
                                        className="h-12 w-12 rounded-lg object-cover border border-gray-200"
                                        src={product.mediaFiles[0].url.includes('.mp4') || product.mediaFiles[0].url.includes('.webm') || product.mediaFiles[0].url.includes('.mov') 
                                          ? product.mediaFiles[0].url.replace(/\.(mp4|webm|mov)$/, '.jpg') // Cloudinary auto-generates thumbnails
                                          : product.mediaFiles[0].url}
                                        alt={product.name}
                                        onError={(e) => {
                                          // Fallback si no existe el thumbnail
                                          const target = e.target as HTMLImageElement;
                                          if (target.src.includes('.jpg') && product.mediaFiles[0].url.includes('.mp4')) {
                                            target.src = product.mediaFiles[0].url.replace('.mp4', '.png'); // Try PNG thumbnail
                                          } else if (target.src.includes('.png') && product.mediaFiles[0].url.includes('.mp4')) {
                                            // Final fallback - mostrar placeholder
                                            target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDgiIGhlaWdodD0iNDgiIHZpZXdCb3g9IjAgMCA0OCA0OCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjQ4IiBoZWlnaHQ9IjQ4IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xNiAyMEwyNCAzMkwzMiAyMEgxNloiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                                          }
                                        }}
                                      />
                                    ) : (
                                      <div className="h-12 w-12 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                        <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900 truncate max-w-xs">
                                      {product.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {(() => {
                                        const priceInfo = getPriceInfo(product)
                                        const stockInfo = getStockIndicator(product)
                                        return (
                                          <>
                                            {priceInfo.hasPromotion ? (
                                              <div className="flex items-center gap-2">
                                                <span className="font-medium text-green-600">{formatPrice(priceInfo.finalPrice, store?.currency)}</span>
                                                <span className="line-through text-gray-400">{formatPrice(priceInfo.originalPrice, store?.currency)}</span>
                                                <span className="text-xs bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full">
                                                  {Math.round(((priceInfo.originalPrice - priceInfo.finalPrice) / priceInfo.originalPrice) * 100)}% OFF
                                                </span>
                                              </div>
                                            ) : (
                                              <span>{formatPrice(product.price, store?.currency)}</span>
                                            )}
                                            <span className={`ml-2 text-xs ${stockInfo.color}`} title={`Stock: ${stockInfo.text}`}>
                                              📦 {stockInfo.text}
                                            </span>
                                          </>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                  product.status === 'active' 
                                    ? 'bg-green-100 text-green-800' 
                                    : product.status === 'draft'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {product.status === 'active' && t('status.active')}
                                  {product.status === 'draft' && t('status.draft')}
                                  {product.status === 'archived' && t('status.archived')}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                <div className="flex flex-wrap gap-1">
                                  {/* Categorías principales */}
                                  {getCategoryNames(product.selectedParentCategoryIds).map((name, index) => (
                                    <span key={`cat-${index}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {name}
                                    </span>
                                  ))}
                                  {/* Subcategorías */}
                                  {getSubcategoryNames(product.selectedSubcategoryIds).map((name, index) => (
                                    <span key={`subcat-${index}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                      {name}
                                    </span>
                                  ))}
                                  {/* Mostrar mensaje si no hay categorías ni subcategorías */}
                                  {getCategoryNames(product.selectedParentCategoryIds).length === 0 && 
                                   getSubcategoryNames(product.selectedSubcategoryIds).length === 0 && (
                                    <span className="text-sm text-gray-400">{t('table.noCategory')}</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {product.selectedBrandId ? (
                                  <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                    {getBrandName(product.selectedBrandId)}
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">{t('table.noBrand')}</span>
                                )}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {(() => {
                                  const priceInfo = getPriceInfo(product)
                                  if (priceInfo.hasPromotion && priceInfo.promotionName) {
                                    return (
                                      <div className="flex flex-col gap-1">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                          {priceInfo.promotionName}
                                        </span>
                                        <span className="text-xs text-gray-500">
                                          -{Math.round(((priceInfo.originalPrice - priceInfo.finalPrice) / priceInfo.originalPrice) * 100)}% {t('promotions.discount')}
                                        </span>
                                      </div>
                                    )
                                  } else {
                                    return <span className="text-sm text-gray-400">{t('promotions.none')}</span>
                                  }
                                })()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="relative" ref={(el) => menuRefs.current[product.id] = el}>
                                  <button
                                    onClick={() => toggleMenu(product.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-md hover:bg-gray-100"
                                    title="Acciones"
                                  >
                                    <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                    </svg>
                                  </button>
                                  
                                  {openMenuId === product.id && (
                                    <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                      <div className="py-1">
                                        <button
                                          onClick={() => {
                                            handleEdit(product.id)
                                            setOpenMenuId(null)
                                          }}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                          </svg>
                                          {t('actions.edit')}
                                        </button>
                                        
                                        <button
                                          onClick={() => handleUpdateStock(product)}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                          </svg>
                                          {t('actions.updateStock')}
                                        </button>
                                        
                                        <button
                                          onClick={() => {
                                            handlePreview(product)
                                            setOpenMenuId(null)
                                          }}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                          </svg>
                                          {t('actions.preview')}
                                        </button>

                                        <button
                                          onClick={() => {
                                            router.push('/marketing/attract/promotions')
                                            setOpenMenuId(null)
                                          }}
                                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                          <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                          </svg>
                                          {t('actions.managePromotions')}
                                        </button>
                                        
                                        <hr className="my-1" />
                                        
                                        <button
                                          onClick={() => {
                                            if (window.confirm(t('actions.confirmDelete'))) {
                                              handleDelete(product.id)
                                            }
                                            setOpenMenuId(null)
                                          }}
                                          disabled={deleting === product.id}
                                          className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
                                        >
                                          {deleting === product.id ? (
                                            <svg className="animate-spin h-4 w-4 mr-3" fill="none" viewBox="0 0 24 24">
                                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                          ) : (
                                            <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                          )}
                                          {t('actions.delete')}
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="lg:hidden">
                      <div className="divide-y divide-gray-200">
                        {paginatedProducts.map((product) => (
                          <div key={product.id} className="relative p-4 hover:bg-gray-50">
                            {/* Botón de tres puntitos - Solo móvil - Esquina superior derecha */}
                            <div className="absolute top-2 right-2 lg:hidden" data-mobile-menu="true" ref={(el) => mobileMenuRefs.current[product.id] = el}>
                              <button
                                type="button"
                                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
                                title="Más acciones"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setMobileMenuOpen(mobileMenuOpen === product.id ? null : product.id)
                                }}
                              >
                                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                                  <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                                </svg>
                              </button>

                              {/* Dropdown móvil */}
                              {mobileMenuOpen === product.id && (
                                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                                  <div className="py-1">
                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handlePreview(product)
                                        setMobileMenuOpen(null)
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                    >
                                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                      </svg>
                                      {t('actions.preview')}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleEdit(product.id)
                                        setMobileMenuOpen(null)
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                    >
                                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                      </svg>
                                      {t('actions.edit')}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleUpdateStock(product)
                                        setMobileMenuOpen(null)
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                    >
                                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                      </svg>
                                      {t('actions.updateStock')}
                                    </button>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        router.push('/marketing/attract/promotions')
                                        setMobileMenuOpen(null)
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 active:bg-gray-200 transition-colors"
                                    >
                                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                                      </svg>
                                      {t('actions.managePromotions')}
                                    </button>

                                    <div className="border-t border-gray-100 my-1"></div>

                                    <button
                                      type="button"
                                      onClick={(e) => {
                                        e.preventDefault()
                                        e.stopPropagation()
                                        handleDelete(product.id)
                                        setMobileMenuOpen(null)
                                      }}
                                      className="flex items-center w-full px-4 py-2 text-sm text-red-700 hover:bg-red-50 active:bg-red-100 transition-colors"
                                    >
                                      <svg className="h-4 w-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                      {t('actions.delete')}
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex items-start space-x-4">
                              {/* Checkbox */}
                              <div className="flex-shrink-0 pt-1">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </div>
                              
                              {/* Product Image */}
                              <div className="flex-shrink-0">
                                <div className="flex flex-col items-center space-y-2">
                                  {product.mediaFiles && product.mediaFiles.length > 0 ? (
                                    <img
                                      className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                                      src={product.mediaFiles[0].url.includes('.mp4') || product.mediaFiles[0].url.includes('.webm') || product.mediaFiles[0].url.includes('.mov')
                                        ? product.mediaFiles[0].url.replace(/\.(mp4|webm|mov)$/, '.jpg') // Cloudinary auto-generates thumbnails
                                        : product.mediaFiles[0].url}
                                      alt={product.name}
                                      onError={(e) => {
                                        // Fallback si no existe el thumbnail
                                        const target = e.target as HTMLImageElement;
                                        if (target.src.includes('.jpg') && product.mediaFiles[0].url.includes('.mp4')) {
                                          target.src = product.mediaFiles[0].url.replace('.mp4', '.png'); // Try PNG thumbnail
                                        } else if (target.src.includes('.png') && product.mediaFiles[0].url.includes('.mp4')) {
                                          // Final fallback - mostrar placeholder
                                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjY0IiBoZWlnaHQ9IjY0IiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0yMCAyNkwzMiA0Mkw0NCAyNkgyMFoiIGZpbGw9IiM5Q0E0QUYiLz4KPC9zdmc+';
                                        }
                                      }}
                                    />
                                  ) : (
                                    <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                                      <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                      </svg>
                                    </div>
                                  )}

                                  {/* Status Badge - Debajo de la imagen */}
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    product.status === 'active'
                                      ? 'bg-green-100 text-green-800'
                                      : product.status === 'draft'
                                      ? 'bg-yellow-100 text-yellow-800'
                                      : 'bg-gray-100 text-gray-800'
                                  }`}>
                                    {product.status === 'active' && t('status.active')}
                                    {product.status === 'draft' && t('status.draft')}
                                    {product.status === 'archived' && t('status.archived')}
                                  </span>
                                </div>
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0 pr-12 lg:pr-0">
                                    <h3 className="text-sm font-medium text-gray-900 h-10 flex items-start leading-5 overflow-hidden line-clamp-2">
                                      {product.name}
                                    </h3>
                                    <div className="mt-1 flex items-center space-x-2">
                                      {(() => {
                                        const priceInfo = getPriceInfo(product)
                                        const stockInfo = getStockIndicator(product)
                                        return (
                                          <>
                                            {priceInfo.hasPromotion ? (
                                              <div className="flex flex-col">
                                                <div className="flex items-center gap-2">
                                                  <p className="text-sm font-semibold text-green-600">
                                                    {formatPrice(priceInfo.finalPrice, store?.currency)}
                                                  </p>
                                                  <p className="text-sm line-through text-gray-400">
                                                    {formatPrice(priceInfo.originalPrice, store?.currency)}
                                                  </p>
                                                </div>
                                                <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full w-fit">
                                                  {Math.round(((priceInfo.originalPrice - priceInfo.finalPrice) / priceInfo.originalPrice) * 100)}% OFF
                                                </span>
                                              </div>
                                            ) : (
                                              <p className="text-sm font-semibold text-gray-900">
                                                {formatPrice(product.price, store?.currency)}
                                              </p>
                                            )}
                                            <span className={`text-xs ${stockInfo.color}`} title={`Stock: ${stockInfo.text}`}>
                                              📦 {stockInfo.text}
                                            </span>
                                          </>
                                        )
                                      })()}
                                    </div>
                                  </div>
                                </div>

                                {/* Categories and Brand */}
                                <div className="mt-2 space-y-1 relative">
                                  {/* Categories */}
                                  {(getCategoryNames(product.selectedParentCategoryIds).length > 0 || 
                                    getSubcategoryNames(product.selectedSubcategoryIds).length > 0) && (
                                    <div className="flex flex-wrap gap-1">
                                      {getCategoryNames(product.selectedParentCategoryIds).map((name, index) => (
                                        <span key={`cat-${index}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                          {name}
                                        </span>
                                      ))}
                                      {getSubcategoryNames(product.selectedSubcategoryIds).map((name, index) => (
                                        <span key={`subcat-${index}`} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                                          {name}
                                        </span>
                                      ))}
                                    </div>
                                  )}

                                  {/* Brand */}
                                  {product.selectedBrandId && (
                                    <div>
                                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                        {getBrandName(product.selectedBrandId)}
                                      </span>
                                    </div>
                                  )}

                                  {/* Promociones */}
                                  {(() => {
                                    const priceInfo = getPriceInfo(product)
                                    if (priceInfo.hasPromotion && priceInfo.promotionName) {
                                      return (
                                        <div className="mt-1">
                                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                            {priceInfo.promotionName}
                                          </span>
                                        </div>
                                      )
                                    }
                                    return null
                                  })()}

                                </div>

                                {/* Actions */}
                                <div className="mt-3 flex items-center space-x-2">
                                  <button
                                    onClick={() => handlePreview(product)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hidden lg:block"
                                    title={t('actions.preview')}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button
                                    onClick={() => handleEdit(product.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2 hidden lg:block"
                                    title={t('actions.edit')}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (window.confirm(t('actions.confirmDelete'))) {
                                        handleDelete(product.id)
                                      }
                                    }}
                                    disabled={deleting === product.id}
                                    className={`transition-colors p-2 hidden lg:block ${
                                      deleting === product.id
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-red-600'
                                    }`}
                                    title={t('actions.delete')}
                                  >
                                    {deleting === product.id ? (
                                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                      </svg>
                                    ) : (
                                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    {/* Paginación */}
                    <PaginationComponent />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modal de actualización de stock */}
      {stockModalOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          {/* Overlay */}
          <div 
            className="absolute inset-0 bg-black bg-opacity-50 transition-opacity"
            onClick={() => setStockModalOpen(false)}
          />
          
          {/* Modal content - slide up from bottom */}
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-xl shadow-xl transform transition-transform duration-300 ease-out">
            <div className="max-w-4xl mx-auto max-h-[80vh] overflow-hidden flex flex-col">
              {/* Header */}
              <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {selectedProduct.hasVariants && selectedProduct.variants.length > 0 
                      ? t('actions.updateStock') + ' ' + t('stock.byVariation')
                      : t('actions.updateStock')
                    }
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">{selectedProduct.name}</p>
                </div>
                <button
                  onClick={() => setStockModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-6 py-4">
                {!selectedProduct.trackStock ? (
                  /* {t('stock.noTrackingProduct')} */
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-medium text-gray-900 mb-2">{t('stock.noTrackingTitle')}</h4>
                    <p className="text-gray-500">
                      {t('stock.noTrackingDescription')}
                    </p>
                  </div>
                ) : selectedProduct.hasVariants && selectedProduct.variants.length > 0 ? (
                  /* Tabla de variantes */
                  <div className="space-y-4">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-blue-800">
                          {t('stock.total')}: {selectedProduct.variants.reduce((sum, v) => {
                            const currentStock = stockChanges.variants?.[v.id] ?? v.stock
                            return sum + currentStock
                          }, 0)} {t('stock.units')}
                        </span>
                        <span className="text-sm text-blue-800">
                          {t('stock.active')}: {selectedProduct.variants.filter(v => {
                            const currentStock = stockChanges.variants?.[v.id] ?? v.stock
                            return currentStock > 0
                          }).length}/{selectedProduct.variants.length} {t('stock.variants')}
                        </span>
                      </div>
                    </div>

                    <div className="border border-gray-200 rounded-lg overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('stock.variant')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('stock.stock')}
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('stock.status')}
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {selectedProduct.variants.map((variant, index) => (
                            <tr key={variant.id} className="hover:bg-gray-50">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    {selectedProduct.mediaFiles && selectedProduct.mediaFiles.length > 0 ? (
                                      <img
                                        className="h-10 w-10 rounded-md object-cover border border-gray-200"
                                        src={selectedProduct.mediaFiles[0]?.url}
                                        alt={variant.name}
                                      />
                                    ) : (
                                      <div className="h-10 w-10 rounded-md bg-gray-100 border border-gray-200 flex items-center justify-center">
                                        <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                      </div>
                                    )}
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">{variant.name}</div>
                                    <div className="text-sm text-gray-500">{formatPrice(variant.price, store?.currency)}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <input
                                  type="number"
                                  min="0"
                                  value={stockChanges.variants?.[variant.id] ?? variant.stock}
                                  className="block w-24 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                  onChange={(e) => {
                                    const newStock = parseInt(e.target.value) || 0
                                    setStockChanges(prev => ({
                                      ...prev,
                                      variants: {
                                        ...prev.variants,
                                        [variant.id]: newStock
                                      }
                                    }))
                                  }}
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                {(() => {
                                  const currentStock = stockChanges.variants?.[variant.id] ?? variant.stock
                                  return (
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                      currentStock > 10
                                        ? 'bg-green-100 text-green-800'
                                        : currentStock > 0
                                        ? 'bg-yellow-100 text-yellow-800'
                                        : 'bg-red-100 text-red-800'
                                    }`}>
                                      {currentStock > 10 ? t('stock.inStock') : currentStock > 0 ? t('stock.lowStock') : t('stock.outOfStock')}
                                    </span>
                                  )
                                })()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  /* Producto simple sin variantes */
                  <div className="space-y-6">
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <div className="flex items-center mb-4">
                        <div className="flex-shrink-0 h-16 w-16">
                          {selectedProduct.mediaFiles && selectedProduct.mediaFiles.length > 0 ? (
                            <img
                              className="h-16 w-16 rounded-lg object-cover border border-gray-200"
                              src={selectedProduct.mediaFiles[0]?.url}
                              alt={selectedProduct.name}
                            />
                          ) : (
                            <div className="h-16 w-16 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center">
                              <svg className="h-8 w-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex-1">
                          <h4 className="text-lg font-medium text-gray-900">{selectedProduct.name}</h4>
                          <p className="text-gray-500">{formatPrice(selectedProduct.price, store?.currency)}</p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('stock.available')}
                          </label>
                          <input
                            type="number"
                            min="0"
                            value={stockChanges.stockQuantity ?? selectedProduct.stockQuantity ?? 0}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                            onChange={(e) => {
                              const newStock = parseInt(e.target.value) || 0
                              setStockChanges(prev => ({
                                ...prev,
                                stockQuantity: newStock
                              }))
                            }}
                          />
                        </div>
                        <div className="flex items-end">
                          <div className="w-full">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {t('stock.status')}
                            </label>
                            {(() => {
                              const currentStock = stockChanges.stockQuantity ?? selectedProduct.stockQuantity ?? 0
                              return (
                                <div className={`inline-flex px-3 py-2 text-sm font-semibold rounded-md ${
                                  currentStock > 10
                                    ? 'bg-green-100 text-green-800'
                                    : currentStock > 0
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {currentStock > 10 ? 'En stock' : currentStock > 0 ? 'Poco stock' : 'Agotado'}
                                </div>
                              )
                            })()}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Footer */}
              {selectedProduct.trackStock && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => setStockModalOpen(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    {t('stock.cancel')}
                  </button>
                  <button
                    onClick={handleSaveStock}
                    disabled={updating}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white inline" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {t('actions.updating')}
                      </>
                    ) : (
                      t('actions.updateStock')
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

    </DashboardLayout>
  )
} 