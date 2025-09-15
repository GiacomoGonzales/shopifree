'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import DashboardLayout from '../../../../../components/DashboardLayout'
import { getPromotions, Promotion, createPromotion, CreatePromotionData, updatePromotionStatus, deletePromotion, updatePromotion } from '../../../../../lib/promotions'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore } from '../../../../../lib/store'
import { getProducts } from '../../../../../lib/products'

// Mapeo de códigos de moneda a símbolos
const currencySymbols: Record<string, string> = {
  'USD': '$', 'EUR': '€', 'MXN': '$', 'COP': '$', 'ARS': '$', 'CLP': '$',
  'PEN': 'S/', 'BRL': 'R$', 'UYU': '$', 'PYG': '₲', 'BOB': 'Bs', 'VES': 'Bs',
  'GTQ': 'Q', 'CRC': '₡', 'NIO': 'C$', 'PAB': 'B/.', 'DOP': 'RD$', 'HNL': 'L',
  'SVC': '$', 'GBP': '£', 'CAD': 'C$', 'CHF': 'CHF', 'JPY': '¥', 'CNY': '¥', 'AUD': 'A$'
}

export default function PromotionsPage() {
  const t = useTranslations('marketing')
  const { user } = useAuth()

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [promotions, setPromotions] = useState<Promotion[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [storeData, setStoreData] = useState<{ id: string; storeName: string; currency?: string } | null>(null)
  const [availableProducts, setAvailableProducts] = useState<any[]>([])
  const [storeCurrency, setStoreCurrency] = useState('USD')
  const [productSearch, setProductSearch] = useState('')
  const [displayedProductsCount, setDisplayedProductsCount] = useState(20)

  // Estados para filtros y dropdown
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; right: number } | null>(null)
  const [editingPromotion, setEditingPromotion] = useState<Promotion | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [formData, setFormData] = useState<CreatePromotionData>({
    name: '',
    description: '',
    type: 'percentage',
    discountValue: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    noExpiration: false,
    targetType: 'all_products',
    targetIds: [],
    priority: 1,
    showBadge: true
  })

  // Función helper para formatear precios con la moneda de la tienda
  const formatPrice = (price: number) => {
    const symbol = currencySymbols[storeCurrency] || '$'
    return `${symbol}${price}`
  }

  // Filtrar productos basado en búsqueda
  const filteredProducts = availableProducts.filter(product =>
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.description?.toLowerCase().includes(productSearch.toLowerCase())
  )

  // Productos a mostrar (con límite para rendimiento)
  const productsToShow = filteredProducts.slice(0, displayedProductsCount)

  // Función para filtrar promociones
  const filteredPromotions = promotions.filter(promotion => {
    // Filtro por estado
    const matchesStatus = statusFilter === '' || promotion.status === statusFilter

    // Filtro por búsqueda (nombre o descripción)
    const matchesSearch = searchFilter === '' ||
      promotion.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (promotion.description && promotion.description.toLowerCase().includes(searchFilter.toLowerCase()))

    return matchesStatus && matchesSearch
  })

  // Función para cargar más productos
  const loadMoreProducts = () => {
    setDisplayedProductsCount(prev => prev + 20)
  }

  // Resetear búsqueda cuando se cambia el tipo de objetivo
  const handleTargetTypeChange = (newType: any) => {
    setFormData({ ...formData, targetType: newType, targetIds: [] })
    setProductSearch('')
    setDisplayedProductsCount(20)
  }

  useEffect(() => {
    loadStoreAndPromotions()
  }, [user])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        setDropdownOpen(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

  const loadStoreAndPromotions = async () => {
    if (!user?.uid) return

    try {
      const store = await getUserStore(user.uid)
      if (store) {
        setStoreData({
          id: store.id,
          storeName: store.storeName,
          currency: store.currency
        })
        setStoreCurrency(store.currency || 'USD')

        const storePromotions = await getPromotions(store.id)
        setPromotions(storePromotions)

        // Cargar productos para el selector
        const products = await getProducts(store.id)
        setAvailableProducts(products)
      }
    } catch (error) {
      console.error('Error loading promotions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreatePromotion = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!storeData || creating) return

    setCreating(true)
    try {
      // Preparar datos de la promoción
      const promotionData = {
        ...formData,
        // Si no expira, usar una fecha muy lejana
        endDate: formData.noExpiration ? '2099-12-31' : formData.endDate
      }

      if (editingPromotion) {
        // Actualizar promoción existente
        await updatePromotion(storeData.id, editingPromotion.id, promotionData)
      } else {
        // Crear nueva promoción
        await createPromotion(storeData.id, promotionData)
      }

      await loadStoreAndPromotions() // Recargar lista
      setShowCreateModal(false)
      setEditingPromotion(null)

      // Reset form
      setFormData({
        name: '',
        description: '',
        type: 'percentage',
        discountValue: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        noExpiration: false,
        targetType: 'all_products',
        targetIds: [],
        priority: 1,
        showBadge: true
      })
    } catch (error) {
      console.error('Error creating/updating promotion:', error)
      alert(`Error al ${editingPromotion ? 'actualizar' : 'crear'} la promoción. Por favor intenta de nuevo.`)
    } finally {
      setCreating(false)
    }
  }

  const toggleDropdown = (promotionId: string, event: React.MouseEvent) => {
    if (dropdownOpen === promotionId) {
      setDropdownOpen(null)
      setDropdownPosition(null)
    } else {
      const rect = event.currentTarget.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 2,
        right: window.innerWidth - rect.right + window.scrollX - 4
      })
      setDropdownOpen(promotionId)
    }
  }

  const handlePausePromotion = async (promotionId: string) => {
    if (!storeData?.id) return

    const promotion = promotions.find(p => p.id === promotionId)
    if (!promotion) return

    const newStatus = promotion.status === 'paused' ? 'active' : 'paused'

    try {
      await updatePromotionStatus(storeData.id, promotionId, newStatus)

      // Actualizar la lista local
      setPromotions(prevPromotions =>
        prevPromotions.map(p =>
          p.id === promotionId ? { ...p, status: newStatus } : p
        )
      )
    } catch (error) {
      console.error('Error updating promotion status:', error)
      alert('Error al actualizar el estado de la promoción.')
    }

    setDropdownOpen(null)
  }

  const handleEditPromotion = (promotionId: string) => {
    const promotion = promotions.find(p => p.id === promotionId)
    if (!promotion) return

    setEditingPromotion(promotion)
    setFormData({
      name: promotion.name,
      description: promotion.description || '',
      type: promotion.type,
      discountValue: promotion.discountValue,
      startDate: promotion.startDate,
      endDate: promotion.endDate,
      noExpiration: promotion.noExpiration || false,
      targetType: promotion.targetType,
      targetIds: promotion.targetIds,
      priority: promotion.priority,
      showBadge: promotion.showBadge
    })
    setShowCreateModal(true)
    setDropdownOpen(null)
  }

  const handleDeletePromotion = (promotionId: string) => {
    setShowDeleteConfirm(promotionId)
    setDropdownOpen(null)
  }

  const confirmDeletePromotion = async () => {
    if (!storeData?.id || !showDeleteConfirm) return

    try {
      await deletePromotion(storeData.id, showDeleteConfirm)

      // Remover de la lista local
      setPromotions(prevPromotions =>
        prevPromotions.filter(p => p.id !== showDeleteConfirm)
      )
    } catch (error) {
      console.error('Error deleting promotion:', error)
      alert('Error al eliminar la promoción.')
    }

    setShowDeleteConfirm(null)
  }

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs rounded-full font-medium"
    switch (status) {
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'scheduled':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'expired':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'paused':
        return `${baseClasses} bg-yellow-100 text-yellow-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activa'
      case 'scheduled': return 'Programada'
      case 'expired': return 'Expirada'
      case 'paused': return 'Pausada'
      default: return status
    }
  }

  const formatDiscount = (type: string, value: number) => {
    switch (type) {
      case 'percentage':
        return `${value}% descuento`
      case 'price_discount':
        return `${currencySymbols[storeCurrency] || '$'}${value} de descuento`
      default:
        return `${value}`
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-gray-600">Cargando promociones...</div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2">
                  <Link href="/marketing" className="text-sm text-gray-500 hover:text-gray-700 mr-2">
                    Marketing
                  </Link>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link href="/marketing/attract" className="text-sm text-gray-500 hover:text-gray-700 mx-2">
                    {t('sections.attract.title')}
                  </Link>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm text-gray-700 ml-2">Promociones</span>
                </div>
                <h1 className="text-2xl font-light text-gray-900">Promociones y Descuentos</h1>
                <p className="mt-1 text-sm text-gray-600">Aplica descuentos directos a productos sin necesidad de cupones</p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            {/* Botón crear promoción */}
            <div className="mb-6 flex justify-end">
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nueva promoción
              </button>
            </div>

            {/* Filtros y controles */}
            {promotions.length > 0 && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
                <div className="px-4 sm:px-6 py-4">
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                    {/* Barra de búsqueda */}
                    <div className="relative flex-1">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        value={searchFilter}
                        onChange={(e) => setSearchFilter(e.target.value)}
                        className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Buscar promociones..."
                      />
                    </div>

                    {/* Filtro por estado */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="block py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Todos los estados</option>
                      <option value="active">Activas</option>
                      <option value="paused">Pausadas</option>
                      <option value="expired">Expiradas</option>
                      <option value="scheduled">Programadas</option>
                    </select>

                    {/* Botón limpiar filtros */}
                    {(statusFilter || searchFilter) && (
                      <button
                        onClick={() => {
                          setStatusFilter('')
                          setSearchFilter('')
                        }}
                        className="px-3 py-2 text-sm text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg border border-gray-300"
                      >
                        Limpiar filtros
                      </button>
                    )}
                  </div>

                  {/* Contador de resultados */}
                  <div className="mt-3 text-sm text-gray-600">
                    {loading ? (
                      "Cargando..."
                    ) : (
                      <>
                        Mostrando {filteredPromotions.length} de {promotions.length} promociones
                        {(statusFilter || searchFilter) && (
                          <span className="ml-2 text-gray-500">
                            (filtradas)
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Lista de promociones */}
            {promotions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No tienes promociones</h3>
                  <p className="mt-1 text-sm text-gray-500">Comienza creando tu primera promoción para aumentar las ventas</p>
                  <div className="mt-6">
                    <button
                      onClick={() => setShowCreateModal(true)}
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gray-900 hover:bg-gray-800"
                    >
                      <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                      Crear mi primera promoción
                    </button>
                  </div>
                </div>
              </div>
            ) : filteredPromotions.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
                <div className="text-center">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">Sin resultados</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    No se encontraron promociones que coincidan con los filtros seleccionados.
                  </p>
                </div>
              </div>
            ) : (
              <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden relative">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Promoción
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Descuento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Estado
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Vigencia
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Aplicable a
                        </th>
                        <th className="relative px-6 py-3">
                          <span className="sr-only">Acciones</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPromotions.map((promotion) => (
                      <tr key={promotion.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {promotion.name}
                            </div>
                            {promotion.description && (
                              <div className="text-sm text-gray-500">
                                {promotion.description}
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {formatDiscount(promotion.type, promotion.discountValue)}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={getStatusBadge(promotion.status)}>
                            {getStatusText(promotion.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div>
                            <div>Desde: {new Date(promotion.startDate).toLocaleDateString()}</div>
                            <div>
                              {promotion.noExpiration ? (
                                <span className="text-blue-600 font-medium">Sin expiración</span>
                              ) : (
                                `Hasta: ${new Date(promotion.endDate).toLocaleDateString()}`
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {promotion.targetType === 'all_products' ? 'Todos los productos' :
                           promotion.targetType === 'specific_products' ? `${promotion.targetIds.length} productos` :
                           promotion.targetType}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(promotion.id, e)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Dropdown menu */}
        {dropdownOpen && dropdownPosition && (
          <div
            className="fixed w-40 bg-white border border-gray-200 rounded-md shadow-lg z-50"
            style={{
              top: dropdownPosition.top,
              right: dropdownPosition.right
            }}
          >
            <div className="py-1">
              <button
                onClick={() => handlePausePromotion(dropdownOpen)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {promotions.find(p => p.id === dropdownOpen)?.status === 'paused' ? 'Activar' : 'Pausar'}
              </button>
              <button
                onClick={() => handleEditPromotion(dropdownOpen)}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Editar
              </button>
              <button
                onClick={() => handleDeletePromotion(dropdownOpen)}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Eliminar
              </button>
            </div>
          </div>
        )}

        {/* Modal de confirmación de eliminación */}
        {showDeleteConfirm && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
              <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                  <svg className="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Eliminar promoción</h3>
                <p className="text-sm text-gray-500 mb-6">
                  ¿Estás seguro de que quieres eliminar esta promoción? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeletePromotion}
                    className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de crear promoción */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 z-50 overflow-y-auto">
          {/* Mobile: Pantalla completa */}
          <div className="sm:hidden">
            <div className="bg-white min-h-full">
              <div className="sticky top-0 bg-white border-b border-gray-200 p-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
                  </h3>
                  <button
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingPromotion(null)
                    }}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <form onSubmit={handleCreatePromotion} className="p-6 pb-8 space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre de la promoción
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="ej: Descuento Black Friday"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tipo de descuento
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Porcentaje (%)</option>
                    <option value="price_discount">Monto fijo ({currencySymbols[storeCurrency] || '$'})</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.type === 'percentage' ? 'Porcentaje (%)' : `Monto fijo (${currencySymbols[storeCurrency] || '$'})`}
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="0.01"
                    value={formData.discountValue}
                    onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder={formData.type === 'percentage' ? '25' : '50.00'}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Aplicar a
                  </label>
                  <select
                    value={formData.targetType}
                    onChange={(e) => handleTargetTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all_products">Todos los productos</option>
                    <option value="specific_products">Productos específicos</option>
                    <option value="categories">Categorías específicas</option>
                    <option value="brands">Marcas específicas</option>
                  </select>
                </div>

                {formData.targetType === 'specific_products' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seleccionar productos ({formData.targetIds.length} seleccionados)
                    </label>

                    {/* Buscador */}
                    <div className="mb-3">
                      <input
                        type="text"
                        placeholder="Buscar productos..."
                        value={productSearch}
                        onChange={(e) => setProductSearch(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      />
                    </div>

                    <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
                      {availableProducts.length === 0 ? (
                        <div className="p-3 text-sm text-gray-600">
                          Cargando productos...
                        </div>
                      ) : productsToShow.length === 0 ? (
                        <div className="p-3 text-sm text-gray-600 text-center">
                          No se encontraron productos que coincidan con "{productSearch}"
                        </div>
                      ) : (
                        <div className="p-2 space-y-2">
                          {productsToShow.map((product) => (
                            <label
                              key={product.id}
                              className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={formData.targetIds.includes(product.id)}
                                onChange={(e) => {
                                  const updatedIds = e.target.checked
                                    ? [...formData.targetIds, product.id]
                                    : formData.targetIds.filter(id => id !== product.id);
                                  setFormData({ ...formData, targetIds: updatedIds });
                                }}
                                className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                              />
                              <div className="ml-3 flex-1">
                                <div className="text-sm font-medium text-gray-900">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {formatPrice(product.price)}
                                </div>
                              </div>
                            </label>
                          ))}
                          {filteredProducts.length > displayedProductsCount && (
                            <div className="p-2 text-center">
                              <button
                                type="button"
                                onClick={loadMoreProducts}
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium"
                              >
                                Cargar más productos ({filteredProducts.length - displayedProductsCount} restantes)
                              </button>
                            </div>
                          )}
                          {filteredProducts.length > 0 && (
                            <div className="p-2 text-xs text-gray-500 text-center">
                              Mostrando {productsToShow.length} de {filteredProducts.length} productos
                              {productSearch && ` (filtrados de ${availableProducts.length} totales)`}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {formData.targetType === 'categories' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seleccionar categorías
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                      <p className="text-sm text-gray-600">
                        📝 Próximamente: Selector de categorías
                      </p>
                    </div>
                  </div>
                )}

                {formData.targetType === 'brands' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Seleccionar marcas
                    </label>
                    <div className="border border-gray-300 rounded-lg p-3 bg-gray-50">
                      <p className="text-sm text-gray-600">
                        📝 Próximamente: Selector de marcas
                      </p>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de inicio
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.startDate}
                      onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de fin
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.endDate}
                      onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      disabled={formData.noExpiration}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.noExpiration}
                      onChange={(e) => setFormData({ ...formData, noExpiration: e.target.checked })}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Sin fecha de expiración (promoción permanente)
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Si activas esta opción, la promoción no expirará automáticamente
                  </p>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="showBadge"
                    checked={formData.showBadge}
                    onChange={(e) => setFormData({ ...formData, showBadge: e.target.checked })}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="showBadge" className="ml-2 text-sm text-gray-700">
                    Mostrar badge "Oferta" en la tienda
                  </label>
                </div>

                <div className="flex space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingPromotion(null)
                    }}
                    className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={creating}
                    className="flex-1 px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? (editingPromotion ? 'Actualizando...' : 'Creando...') : (editingPromotion ? 'Actualizar Promoción' : 'Crear Promoción')}
                  </button>
                </div>
              </form>
            </div>
          </div>

          {/* Desktop: Modal grande centrado */}
          <div className="hidden sm:flex min-h-screen items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
              <div className="flex flex-col max-h-[90vh]">
                {/* Header fijo */}
                <div className="flex-shrink-0 px-8 py-4 border-b border-gray-200 bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900">
                        {editingPromotion ? 'Editar Promoción' : 'Nueva Promoción'}
                      </h3>
                      <p className="text-sm text-gray-600 mt-1">Configura descuentos para productos específicos o toda la tienda</p>
                    </div>
                    <button
                      onClick={() => {
                      setShowCreateModal(false)
                      setEditingPromotion(null)
                    }}
                      className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Contenido scrolleable */}
                <div className="flex-1 overflow-y-auto">
                  <form id="promotion-form" onSubmit={handleCreatePromotion} className="p-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                      {/* Columna izquierda: Información básica */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nombre de la promoción
                          </label>
                          <input
                            type="text"
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="ej: Descuento Black Friday"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Descripción (opcional)
                          </label>
                          <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe brevemente esta promoción"
                            rows={3}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Tipo de descuento
                            </label>
                            <select
                              value={formData.type}
                              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                              <option value="percentage">Porcentaje (%)</option>
                              <option value="price_discount">Monto fijo ({currencySymbols[storeCurrency] || '$'})</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {formData.type === 'percentage' ? 'Porcentaje (%)' : `Monto fijo (${currencySymbols[storeCurrency] || '$'})`}
                            </label>
                            <input
                              type="number"
                              required
                              min="0"
                              step="0.01"
                              value={formData.discountValue}
                              onChange={(e) => setFormData({ ...formData, discountValue: parseFloat(e.target.value) || 0 })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder={formData.type === 'percentage' ? '25' : '50.00'}
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de inicio
                            </label>
                            <input
                              type="date"
                              required
                              value={formData.startDate}
                              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Fecha de fin
                            </label>
                            <input
                              type="date"
                              required
                              value={formData.endDate}
                              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              disabled={formData.noExpiration}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={formData.noExpiration}
                              onChange={(e) => setFormData({ ...formData, noExpiration: e.target.checked })}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-3 text-sm text-gray-700">
                              Sin fecha de expiración (promoción permanente)
                            </span>
                          </label>
                          <p className="mt-1 text-xs text-gray-500">
                            Si activas esta opción, la promoción no expirará automáticamente
                          </p>
                        </div>

                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="showBadgeDesktop"
                            checked={formData.showBadge}
                            onChange={(e) => setFormData({ ...formData, showBadge: e.target.checked })}
                            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                          />
                          <label htmlFor="showBadgeDesktop" className="ml-3 text-sm text-gray-700">
                            Mostrar badge "Oferta" en la tienda
                          </label>
                        </div>
                      </div>

                      {/* Columna derecha: Selección de productos */}
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Aplicar a
                          </label>
                          <select
                            value={formData.targetType}
                            onChange={(e) => handleTargetTypeChange(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          >
                            <option value="all_products">Todos los productos</option>
                            <option value="specific_products">Productos específicos</option>
                            <option value="categories">Categorías específicas</option>
                            <option value="brands">Marcas específicas</option>
                          </select>
                        </div>

                        {formData.targetType === 'specific_products' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seleccionar productos ({formData.targetIds.length} seleccionados)
                            </label>

                            {/* Buscador Desktop */}
                            <div className="mb-3">
                              <div className="relative">
                                <input
                                  type="text"
                                  placeholder="Buscar productos por nombre..."
                                  value={productSearch}
                                  onChange={(e) => setProductSearch(e.target.value)}
                                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <svg className="absolute left-3 top-3.5 h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                              </div>
                            </div>

                            <div className="border border-gray-300 rounded-lg h-60 overflow-y-auto">
                              {availableProducts.length === 0 ? (
                                <div className="p-6 text-center text-gray-600">
                                  <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                                  </svg>
                                  Cargando productos...
                                </div>
                              ) : productsToShow.length === 0 ? (
                                <div className="p-6 text-center text-gray-600">
                                  <svg className="mx-auto h-8 w-8 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                  </svg>
                                  <p className="text-sm font-medium">Sin resultados</p>
                                  <p className="text-xs mt-1">No encontramos productos que coincidan con "{productSearch}"</p>
                                </div>
                              ) : (
                                <div className="p-4">
                                  <div className="space-y-3">
                                    {productsToShow.map((product) => (
                                      <label
                                        key={product.id}
                                        className="flex items-start p-3 hover:bg-blue-50 rounded-lg cursor-pointer border border-transparent hover:border-blue-200 transition-colors"
                                      >
                                        <input
                                          type="checkbox"
                                          checked={formData.targetIds.includes(product.id)}
                                          onChange={(e) => {
                                            const updatedIds = e.target.checked
                                              ? [...formData.targetIds, product.id]
                                              : formData.targetIds.filter(id => id !== product.id);
                                            setFormData({ ...formData, targetIds: updatedIds });
                                          }}
                                          className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                        />
                                        <div className="ml-3 flex-1 min-w-0">
                                          <div className="text-sm font-medium text-gray-900 truncate">
                                            {product.name}
                                          </div>
                                          <div className="text-sm text-gray-500">
                                            {formatPrice(product.price)}
                                          </div>
                                        </div>
                                      </label>
                                    ))}
                                  </div>

                                  {/* Botón cargar más */}
                                  {filteredProducts.length > displayedProductsCount && (
                                    <div className="mt-4 p-4 text-center border-t border-gray-200">
                                      <button
                                        type="button"
                                        onClick={loadMoreProducts}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                                      >
                                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                        </svg>
                                        Cargar más productos ({filteredProducts.length - displayedProductsCount} restantes)
                                      </button>
                                    </div>
                                  )}

                                  {/* Info de productos mostrados */}
                                  {filteredProducts.length > 0 && (
                                    <div className="mt-2 p-3 bg-gray-50 rounded-lg text-center">
                                      <p className="text-sm text-gray-600">
                                        Mostrando {productsToShow.length} de {filteredProducts.length} productos
                                        {productSearch && ` (filtrados de ${availableProducts.length} totales)`}
                                      </p>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        )}

                        {formData.targetType === 'categories' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seleccionar categorías
                            </label>
                            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                              </svg>
                              <p className="text-sm text-gray-600 font-medium">Próximamente</p>
                              <p className="text-xs text-gray-500 mt-1">Selector de categorías en desarrollo</p>
                            </div>
                          </div>
                        )}

                        {formData.targetType === 'brands' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Seleccionar marcas
                            </label>
                            <div className="border border-gray-300 rounded-lg p-6 bg-gray-50 text-center">
                              <svg className="mx-auto h-12 w-12 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                              </svg>
                              <p className="text-sm text-gray-600 font-medium">Próximamente</p>
                              <p className="text-xs text-gray-500 mt-1">Selector de marcas en desarrollo</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                  </form>
                </div>

                {/* Footer fijo con botones */}
                <div className="flex-shrink-0 px-4 py-3 bg-gray-50 border-t border-gray-200">
                  <div className="flex justify-end space-x-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false)
                        setEditingPromotion(null)
                      }}
                      className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      form="promotion-form"
                      disabled={creating}
                      className="px-8 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      {creating ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Creando...
                        </span>
                      ) : (
                        editingPromotion ? 'Actualizar Promoción' : 'Crear Promoción'
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  )
}