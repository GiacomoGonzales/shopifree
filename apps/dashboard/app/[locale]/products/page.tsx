'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../components/DashboardLayout'
import { useStore } from '../../../lib/hooks/useStore'
import { 
  getFilteredProducts, 
  deleteProduct, 
  type ProductWithId, 
  type ProductFilters,
  type SortOption 
} from '../../../lib/products'
import { getBrands, type BrandWithId } from '../../../lib/brands'
import { getParentCategories, getSubcategories, type CategoryWithId } from '../../../lib/categories'

export default function ProductsPage() {
  const router = useRouter()
  const { store, loading: storeLoading } = useStore()
  const t = useTranslations('products')
  
  const [paginatedProducts, setPaginatedProducts] = useState<ProductWithId[]>([])
  const [brands, setBrands] = useState<BrandWithId[]>([])
  const [categories, setCategories] = useState<CategoryWithId[]>([])
  const [subcategories, setSubcategories] = useState<CategoryWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  // Estados para filtros y paginación
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<SortOption>('created-desc')
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'draft' | 'archived'>('all')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  const [previewMessage, setPreviewMessage] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const itemsPerPage = 8

  // Crear objeto de filtros
  const filters: ProductFilters = useMemo(() => ({
    searchQuery: searchQuery.trim() || undefined,
    sortBy,
    status: statusFilter
  }), [searchQuery, sortBy, statusFilter])

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
    if (previewMessage) {
      const timer = setTimeout(() => {
        setPreviewMessage(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [previewMessage])

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

  // Función para editar producto
  const handleEdit = (productId: string) => {
    router.push(`/products/${productId}/edit`)
  }

  // Función para vista previa del producto en la tienda
  const handlePreview = (product: ProductWithId) => {
    if (!store?.subdomain) {
      console.error('No subdomain available for preview')
      setPreviewMessage({ message: t('messages.storeError'), type: 'error' })
      return
    }

    // Solo productos activos pueden ser previsualizados
    if (product.status !== 'active') {
      setPreviewMessage({ message: t('messages.previewError'), type: 'error' })
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
    setPreviewMessage({ message: t('messages.previewSuccess'), type: 'success' })
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
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4 rounded-lg">
      <div className="flex flex-1 justify-between sm:hidden">
        <button
          onClick={() => setCurrentPage(currentPage - 1)}
          disabled={currentPage === 1}
          className="relative inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('pagination.previous')}
        </button>
        <button
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="relative ml-3 inline-flex items-center rounded-lg px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t('pagination.next')}
        </button>
      </div>
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
              onClick={() => setCurrentPage(currentPage - 1)}
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
                onClick={() => setCurrentPage(page)}
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
              onClick={() => setCurrentPage(currentPage + 1)}
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
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">{t('loading')}</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
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
                        className="block w-full sm:w-64 pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                        placeholder={t('searchPlaceholder')}
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3">
                      {/* Filtros */}
                      <button className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all min-h-[44px] sm:min-h-auto">
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.586V4z" />
                        </svg>
                        {t('filter')}
                      </button>

                      {/* Ordenar */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as SortOption)}
                        className="block w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[44px] sm:min-h-auto"
                      >
                        <option value="created-desc">{t('sort')}</option>
                        <option value="created-desc">{t('sortOptions.newest')}</option>
                        <option value="created-asc">{t('sortOptions.oldest')}</option>
                        <option value="name-asc">{t('sortOptions.nameAsc')}</option>
                        <option value="name-desc">{t('sortOptions.nameDesc')}</option>
                        <option value="price-asc">{t('sortOptions.priceAsc')}</option>
                        <option value="price-desc">{t('sortOptions.priceDesc')}</option>
                      </select>
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
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                  <p className="mt-2 text-sm text-gray-600">{t('loading')}</p>
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
                  <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
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
                                      S/ {product.price.toFixed(2)}
                                      {product.comparePrice && (
                                        <span className="ml-2 line-through text-gray-400">
                                          S/ {product.comparePrice.toFixed(2)}
                                        </span>
                                      )}
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
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button 
                                    onClick={() => handlePreview(product)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    title={t('actions.preview')}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleEdit(product.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
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
                                    className={`transition-colors ${
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
                          <div key={product.id} className="p-4 hover:bg-gray-50">
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
                              </div>

                              {/* Product Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="text-sm font-medium text-gray-900 truncate">
                                      {product.name}
                                    </h3>
                                    <div className="mt-1 flex items-center space-x-2">
                                      <p className="text-sm font-semibold text-gray-900">
                                        S/ {product.price.toFixed(2)}
                                      </p>
                                      {product.comparePrice && (
                                        <p className="text-sm line-through text-gray-400">
                                          S/ {product.comparePrice.toFixed(2)}
                                        </p>
                                      )}
                                    </div>
                                  </div>
                                  
                                  {/* Status Badge */}
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

                                {/* Categories and Brand */}
                                <div className="mt-2 space-y-1">
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
                                </div>

                                {/* Actions */}
                                <div className="mt-3 flex items-center space-x-2">
                                  <button 
                                    onClick={() => handlePreview(product)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
                                    title={t('actions.preview')}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => handleEdit(product.id)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors p-2"
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
                                    className={`transition-colors p-2 ${
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

      {/* Toast para mensajes de vista previa */}
      {previewMessage && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
          previewMessage.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          <div className="flex items-center">
            <div className="flex-shrink-0">
              {previewMessage.type === 'success' ? (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{previewMessage.message}</p>
            </div>
            <div className="ml-auto pl-3">
              <button
                onClick={() => setPreviewMessage(null)}
                className="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
} 