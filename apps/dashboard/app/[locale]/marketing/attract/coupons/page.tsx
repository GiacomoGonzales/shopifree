'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import DashboardLayout from '../../../../../components/DashboardLayout'
import { getCoupons, Coupon, createCoupon, generateCouponCode, updateCouponStatus, deleteCoupon, updateCoupon, calculateCouponStatus, getCouponUsageCount } from '../../../../../lib/coupons'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore } from '../../../../../lib/store'

// Mapeo de códigos de moneda a símbolos
const currencySymbols: Record<string, string> = {
  'USD': '$', 'EUR': '€', 'MXN': '$', 'COP': '$', 'ARS': '$', 'CLP': '$',
  'PEN': 'S/', 'BRL': 'R$', 'UYU': '$', 'PYG': '₲', 'BOB': 'Bs', 'VES': 'Bs',
  'GTQ': 'Q', 'CRC': '₡', 'NIO': 'C$', 'PAB': 'B/.', 'DOP': 'RD$', 'HNL': 'L',
  'SVC': '$', 'GBP': '£', 'CAD': 'C$', 'CHF': 'CHF', 'JPY': '¥', 'CNY': '¥', 'AUD': 'A$'
}

export default function CouponsPage() {
  const t = useTranslations('marketing')
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [storeData, setStoreData] = useState<{ id: string; storeName: string; currency?: string } | null>(null)
  const [storeCurrency, setStoreCurrency] = useState('USD')
  const [couponUsageCounts, setCouponUsageCounts] = useState<Record<string, number>>({})
  const [dropdownOpen, setDropdownOpen] = useState<string | null>(null)
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [searchFilter, setSearchFilter] = useState<string>('')
  const [activeTab, setActiveTab] = useState<'normal' | 'recovery'>('normal')
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_shipping',
    value: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUses: 100,
    usesPerCustomer: 1,
    noExpiration: false
  })

  useEffect(() => {
    async function loadStoreAndCoupons() {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Obtener datos de la tienda
        const store = await getUserStore(user.uid)
        if (!store) {
          console.error('No store found for user')
          setLoading(false)
          return
        }

        setStoreData({
          id: store.id,
          storeName: store.storeName,
          currency: store.currency
        })
        setStoreCurrency(store.currency || 'USD')

        // Cargar cupones
        const fetchedCoupons = await getCoupons(store.id)

        // 🆕 Cargar conteos dinámicos de uso de cupones primero
        const counts: Record<string, number> = {}
        if (fetchedCoupons.length > 0) {
          for (const coupon of fetchedCoupons) {
            const count = await getCouponUsageCount(store.id, coupon.id)
            counts[coupon.id] = count
          }
          setCouponUsageCounts(counts)
        }

        // Actualizar estados automáticamente basándose en fechas y usos
        const updatedCoupons = fetchedCoupons.map(coupon => {
          const usageCount = counts[coupon.id] || 0
          const autoStatus = calculateCouponStatus(
            coupon.startDate,
            coupon.endDate,
            coupon.status,
            coupon.noExpiration,
            usageCount,
            coupon.maxUses
          )
          if (autoStatus !== coupon.status && coupon.status !== 'paused') {
            // Solo actualizar si no está pausado manualmente
            updateCouponStatus(store.id, coupon.id, autoStatus)
            return { ...coupon, status: autoStatus }
          }
          return coupon
        })

        setCoupons(updatedCoupons)
      } catch (error) {
        console.error('Error loading store and coupons:', error)
      }

      setLoading(false)
    }

    loadStoreAndCoupons()
  }, [user?.uid])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownOpen) {
        setDropdownOpen(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [dropdownOpen])

  const handleCreateCoupon = async () => {
    if (!storeData?.id || creating) return

    setCreating(true)

    let success: boolean

    // Preparar datos del cupón
    const couponData = {
      ...formData,
      // Si no expira, usar una fecha muy lejana o null
      endDate: formData.noExpiration ? '2099-12-31' : formData.endDate
    }

    if (editingCoupon) {
      // Actualizar cupón existente
      success = await updateCoupon(storeData.id, editingCoupon.id, couponData)
    } else {
      // Crear nuevo cupón
      success = await createCoupon(storeData.id, couponData)
    }

    if (success) {
      // Recargar cupones
      const updatedCoupons = await getCoupons(storeData.id)
      setCoupons(updatedCoupons)

      // Resetear formulario
      setFormData({
        name: '',
        code: '',
        type: 'percentage',
        value: 0,
        startDate: new Date().toISOString().split('T')[0],
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        maxUses: 100,
        usesPerCustomer: 1,
        noExpiration: false
      })

      setShowCreateModal(false)
      setEditingCoupon(null)
    }

    setCreating(false)
  }

  const generateRandomCode = () => {
    const code = generateCouponCode(formData.name)
    setFormData(prev => ({ ...prev, code }))
  }

  const handlePauseCoupon = async (couponId: string) => {
    if (!storeData?.id) return

    const coupon = coupons.find(c => c.id === couponId)
    if (!coupon) return

    let newStatus: 'active' | 'paused' | 'expired' | 'scheduled'

    if (coupon.status === 'paused') {
      // Si está pausado, reactivar (pero verificar si no ha expirado por fecha)
      newStatus = calculateCouponStatus(coupon.startDate, coupon.endDate, undefined, coupon.noExpiration)
    } else {
      // Si está activo, programado o expirado, pausar
      newStatus = 'paused'
    }

    const success = await updateCouponStatus(storeData.id, couponId, newStatus)

    if (success) {
      // Actualizar la lista local
      setCoupons(prevCoupons =>
        prevCoupons.map(c =>
          c.id === couponId ? { ...c, status: newStatus } : c
        )
      )
    }

    setDropdownOpen(null)
  }

  const handleEditCoupon = (couponId: string) => {
    const coupon = coupons.find(c => c.id === couponId)
    if (!coupon) return

    setEditingCoupon(coupon)
    setFormData({
      name: coupon.name,
      code: coupon.code,
      type: coupon.type,
      value: coupon.value,
      startDate: coupon.startDate,
      endDate: coupon.endDate,
      maxUses: coupon.maxUses,
      usesPerCustomer: coupon.usesPerCustomer,
      noExpiration: coupon.noExpiration || false
    })
    setShowCreateModal(true)
    setDropdownOpen(null)
  }

  const handleDeleteCoupon = (couponId: string) => {
    setShowDeleteConfirm(couponId)
    setDropdownOpen(null)
  }

  const confirmDeleteCoupon = async () => {
    if (!storeData?.id || !showDeleteConfirm) return

    const success = await deleteCoupon(storeData.id, showDeleteConfirm)

    if (success) {
      // Remover de la lista local
      setCoupons(prevCoupons =>
        prevCoupons.filter(c => c.id !== showDeleteConfirm)
      )
    }

    setShowDeleteConfirm(null)
  }

  const toggleDropdown = (couponId: string, event: React.MouseEvent) => {
    event.stopPropagation()
    setDropdownOpen(dropdownOpen === couponId ? null : couponId)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'paused': return 'Pausado'
      case 'expired': return 'Expirado'
      case 'scheduled': return 'Programado'
      default: return 'Desconocido'
    }
  }

  const getDiscountText = (type: string, value: number) => {
    const symbol = currencySymbols[storeCurrency] || '$'
    switch (type) {
      case 'percentage': return `${value}%`
      case 'fixed_amount': return `${symbol} ${value}`
      case 'free_shipping': return 'Envío gratis'
      default: return '-'
    }
  }

  const formatDate = (dateString: string) => {
    // Si la fecha viene en formato ISO completo (2025-10-01T03:06:50.026Z), extraer solo la fecha
    if (dateString.includes('T')) {
      return dateString.split('T')[0]
    }
    return dateString
  }

  // Función para filtrar cupones
  const filteredCoupons = coupons.filter(coupon => {
    // Filtro por tipo de cupón (normal vs recuperación)
    const isRecoveryCoupon = (coupon as any).isRecoveryCoupon === true
    const matchesTab = activeTab === 'recovery' ? isRecoveryCoupon : !isRecoveryCoupon

    // Filtro por estado
    const matchesStatus = statusFilter === '' || coupon.status === statusFilter

    // Filtro por búsqueda (nombre o código)
    const matchesSearch = searchFilter === '' ||
      coupon.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      coupon.code.toLowerCase().includes(searchFilter.toLowerCase())

    return matchesTab && matchesStatus && matchesSearch
  })

  // Contadores por pestaña
  const normalCouponsCount = coupons.filter(c => !(c as any).isRecoveryCoupon).length
  const recoveryCouponsCount = coupons.filter(c => (c as any).isRecoveryCoupon).length

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center mb-2 flex-wrap gap-1">
                  <Link href="/marketing" className="text-sm text-gray-500 hover:text-gray-700">
                    Marketing
                  </Link>
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <Link href="/marketing/attract" className="text-sm text-gray-500 hover:text-gray-700">
                    {t('sections.attract.title')}
                  </Link>
                  <svg className="h-4 w-4 text-gray-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm text-gray-700">{t('coupons.title')}</span>
                </div>
                <h1 className="text-2xl font-light text-gray-900">{t('coupons.title')}</h1>
                <p className="mt-1 text-sm text-gray-600">{t('coupons.description')}</p>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            {/* Pestañas para separar cupones normales y de recuperación */}
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0 mb-4">
                <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setActiveTab('normal')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'normal'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cupones principales
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200">
                      {normalCouponsCount}
                    </span>
                  </button>
                  <button
                    onClick={() => setActiveTab('recovery')}
                    className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                      activeTab === 'recovery'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Cupones de recuperación
                    <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200">
                      {recoveryCouponsCount}
                    </span>
                  </button>
                </div>

                {/* Botón crear cupón */}
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 w-full sm:w-auto"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  {t('coupons.create')}
                </button>
              </div>
            </div>
            {/* Filtros y controles */}
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
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-base placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                      placeholder="Buscar cupones..."
                    />
                  </div>

                  {/* Filtro por estado */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="block py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                  >
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="paused">Pausados</option>
                    <option value="expired">Expirados</option>
                    <option value="scheduled">Programados</option>
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
                      Mostrando {filteredCoupons.length} de {activeTab === 'normal' ? normalCouponsCount : recoveryCouponsCount} cupones
                      {(statusFilter || searchFilter) && (
                        <span className="ml-2 text-gray-500">
                          (filtrados)
                        </span>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Tabla de cupones */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-visible relative">
              <div className="overflow-x-auto overflow-y-visible">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cupón
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Código
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
                        Usos
                      </th>
                      <th className="relative px-6 py-3">
                        <span className="sr-only">Acciones</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                          Cargando cupones...
                        </td>
                      </tr>
                    ) : filteredCoupons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                          {activeTab === 'normal' && normalCouponsCount === 0
                            ? "No tienes cupones creados. ¡Crea tu primer cupón!"
                            : activeTab === 'recovery' && recoveryCouponsCount === 0
                            ? "Aún no hay cupones de recuperación. Se generan automáticamente cuando envías emails de carritos abandonados."
                            : "No se encontraron cupones que coincidan con los filtros seleccionados."
                          }
                        </td>
                      </tr>
                    ) : (
                      filteredCoupons.map((coupon) => (
                      <tr key={coupon.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{coupon.name}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <code className="bg-gray-100 px-2 py-1 rounded text-xs font-mono">
                            {coupon.code}
                          </code>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {getDiscountText(coupon.type, coupon.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(coupon.status)}`}>
                            {getStatusText(coupon.status)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div>{formatDate(coupon.startDate)}</div>
                          <div>
                            {coupon.noExpiration ? (
                              <span className="text-gray-700 font-medium">Sin expiración</span>
                            ) : (
                              formatDate(coupon.endDate)
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center gap-2">
                            <span>
                              {couponUsageCounts[coupon.id] !== undefined ? couponUsageCounts[coupon.id] : (coupon.totalUses || 0)} / {coupon.maxUses}
                            </span>
                            {couponUsageCounts[coupon.id] >= coupon.maxUses && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                Agotado
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="relative">
                            <button
                              onClick={(e) => toggleDropdown(coupon.id, e)}
                              className="text-gray-400 hover:text-gray-600 transition-colors p-1"
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                              </svg>
                            </button>

                            {/* Dropdown */}
                            {dropdownOpen === coupon.id && (
                              <div className="absolute right-0 top-full mt-1 w-40 bg-white border border-gray-200 rounded-md shadow-lg z-10">
                                <div className="py-1">
                                  <button
                                    onClick={() => handlePauseCoupon(coupon.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    {coupon.status === 'paused' ? 'Activar' : 'Pausar'}
                                  </button>
                                  <button
                                    onClick={() => handleEditCoupon(coupon.id)}
                                    className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                    </svg>
                                    Editar
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCoupon(coupon.id)}
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
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Modal básico de creación */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto overflow-x-hidden h-full w-full z-50">
            <div className="relative top-0 md:top-20 mx-auto min-h-full md:min-h-0 md:h-auto p-4 md:p-5 border-0 md:border w-full md:w-3/4 lg:w-1/2 md:max-w-2xl shadow-lg rounded-none md:rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  {editingCoupon ? 'Editar cupón' : 'Crear nuevo cupón'}
                </h3>
                <button
                  onClick={() => {
                    setShowCreateModal(false)
                    setEditingCoupon(null)
                    setFormData({
                      name: '',
                      code: '',
                      type: 'percentage',
                      value: 0,
                      startDate: new Date().toISOString().split('T')[0],
                      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                      maxUses: 100,
                      usesPerCustomer: 1,
                      noExpiration: false
                    })
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form className="space-y-4 overflow-x-hidden">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del cupón</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                    placeholder="Ej: Black Friday 2024"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Código del cupón</label>
                  <div className="mt-1 flex">
                    <input
                      type="text"
                      value={formData.code}
                      onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                      className="block w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                      placeholder="BLACKFRIDAY2024"
                    />
                    <button
                      type="button"
                      onClick={generateRandomCode}
                      className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md bg-gray-50 text-sm text-gray-600 hover:bg-gray-100"
                    >
                      Generar
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Tipo de descuento</label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value as any }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                  >
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed_amount">Monto fijo</option>
                    <option value="free_shipping">Envío gratis</option>
                  </select>
                </div>

                {formData.type !== 'free_shipping' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.type === 'percentage' ? 'Porcentaje (%)' : `Monto fijo (${currencySymbols[storeCurrency] || '$'})`}
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                      onFocus={(e) => e.target.select()}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                      placeholder={formData.type === 'percentage' ? '25' : '50'}
                      min="0"
                      max={formData.type === 'percentage' ? '100' : undefined}
                    />
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                      disabled={formData.noExpiration}
                    />
                  </div>
                </div>

                <div>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.noExpiration}
                      onChange={(e) => setFormData(prev => ({ ...prev, noExpiration: e.target.checked }))}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-300 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">
                      Sin fecha de expiración (cupón permanente)
                    </span>
                  </label>
                  <p className="mt-1 text-xs text-gray-500">
                    Si activas esta opción, el cupón no expirará automáticamente
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usos máximos</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                      onFocus={(e) => e.target.select()}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usos por cliente</label>
                    <input
                      type="number"
                      value={formData.usesPerCustomer}
                      onChange={(e) => setFormData(prev => ({ ...prev, usesPerCustomer: Number(e.target.value) }))}
                      onFocus={(e) => e.target.select()}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-gray-300 focus:border-gray-400"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowCreateModal(false)
                      setEditingCoupon(null)
                      setFormData({
                        name: '',
                        code: '',
                        type: 'percentage',
                        value: 0,
                        startDate: new Date().toISOString().split('T')[0],
                        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                        maxUses: 100,
                        usesPerCustomer: 1,
                        noExpiration: false
                      })
                    }}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 w-full sm:w-auto"
                    disabled={creating}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCoupon}
                    disabled={creating || !formData.name || !formData.code}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
                  >
                    {creating ? (editingCoupon ? 'Actualizando...' : 'Creando...') : (editingCoupon ? 'Actualizar cupón' : 'Crear cupón')}
                  </button>
                </div>
              </form>
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
                <h3 className="text-lg font-medium text-gray-900 mb-2">Eliminar cupón</h3>
                <p className="text-sm text-gray-500 mb-6">
                  ¿Estás seguro de que quieres eliminar este cupón? Esta acción no se puede deshacer.
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowDeleteConfirm(null)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={confirmDeleteCoupon}
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
    </DashboardLayout>
  )
}