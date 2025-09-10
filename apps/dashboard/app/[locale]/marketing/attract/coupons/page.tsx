'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import DashboardLayout from '../../../../../components/DashboardLayout'
import { getCoupons, Coupon, createCoupon, generateCouponCode } from '../../../../../lib/coupons'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore } from '../../../../../lib/store'

export default function CouponsPage() {
  const t = useTranslations('marketing')
  const { user } = useAuth()
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [storeData, setStoreData] = useState<{ id: string; storeName: string } | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'percentage' as 'percentage' | 'fixed_amount' | 'free_shipping',
    value: 0,
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    maxUses: 100,
    usesPerCustomer: 1
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
        
        setStoreData(store)
        
        // Cargar cupones
        const fetchedCoupons = await getCoupons(store.id)
        setCoupons(fetchedCoupons)
      } catch (error) {
        console.error('Error loading store and coupons:', error)
      }
      
      setLoading(false)
    }

    loadStoreAndCoupons()
  }, [user?.uid])

  const handleCreateCoupon = async () => {
    if (!storeData?.id || creating) return

    setCreating(true)
    const success = await createCoupon(storeData.id, formData)
    
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
        usesPerCustomer: 1
      })
      
      setShowCreateModal(false)
    }
    
    setCreating(false)
  }

  const generateRandomCode = () => {
    const code = generateCouponCode(formData.name)
    setFormData(prev => ({ ...prev, code }))
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800'
      case 'expired': return 'bg-red-100 text-red-800'
      case 'scheduled': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active': return 'Activo'
      case 'expired': return 'Expirado'
      case 'scheduled': return 'Programado'
      default: return 'Desconocido'
    }
  }

  const getDiscountText = (type: string, value: number) => {
    switch (type) {
      case 'percentage': return `${value}%`
      case 'fixed_amount': return `S/ ${value}`
      case 'free_shipping': return 'Envío gratis'
      default: return '-'
    }
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
                  <Link href="/marketing/attract" className="text-sm text-gray-500 hover:text-gray-700 ml-2 mr-2">
                    {t('sections.attract.title')}
                  </Link>
                  <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-sm text-gray-700 ml-2">{t('coupons.title')}</span>
                </div>
                <h1 className="text-2xl font-light text-gray-900">{t('coupons.title')}</h1>
                <p className="mt-1 text-sm text-gray-600">{t('coupons.description')}</p>
              </div>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('coupons.create')}
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8">
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
                      className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-lg text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Buscar cupones..."
                    />
                  </div>

                  {/* Filtro por estado */}
                  <select className="block py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option value="">Todos los estados</option>
                    <option value="active">Activos</option>
                    <option value="expired">Expirados</option>
                    <option value="scheduled">Programados</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Tabla de cupones */}
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
              <div className="overflow-x-auto">
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
                    ) : coupons.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="px-6 py-12 text-center text-sm text-gray-500">
                          No tienes cupones creados. ¡Crea tu primer cupón!
                        </td>
                      </tr>
                    ) : (
                      coupons.map((coupon) => (
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
                          <div>{coupon.startDate}</div>
                          <div>{coupon.endDate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {coupon.totalUses} / {coupon.maxUses}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button className="text-gray-400 hover:text-gray-600 transition-colors">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button className="text-gray-400 hover:text-red-600 transition-colors">
                              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                            </button>
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

        {/* Modal básico de creación (placeholder) */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
            <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Crear nuevo cupón</h3>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <form className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nombre del cupón</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                      className="block w-full border border-gray-300 rounded-l-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="percentage">Porcentaje</option>
                    <option value="fixed_amount">Monto fijo</option>
                    <option value="free_shipping">Envío gratis</option>
                  </select>
                </div>

                {formData.type !== 'free_shipping' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      {formData.type === 'percentage' ? 'Porcentaje (%)' : 'Monto fijo (S/)'}
                    </label>
                    <input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData(prev => ({ ...prev, value: Number(e.target.value) }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder={formData.type === 'percentage' ? '25' : '50'}
                      min="0"
                      max={formData.type === 'percentage' ? '100' : undefined}
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha inicio</label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Fecha fin</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usos máximos</label>
                    <input
                      type="number"
                      value={formData.maxUses}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxUses: Number(e.target.value) }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Usos por cliente</label>
                    <input
                      type="number"
                      value={formData.usesPerCustomer}
                      onChange={(e) => setFormData(prev => ({ ...prev, usesPerCustomer: Number(e.target.value) }))}
                      className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                      min="1"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    disabled={creating}
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateCoupon}
                    disabled={creating || !formData.name || !formData.code}
                    className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {creating ? 'Creando...' : 'Crear cupón'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}