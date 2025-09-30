'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import { useTranslations } from 'next-intl'
import { Timestamp } from 'firebase/firestore'
import DashboardLayout from '../../../components/DashboardLayout'
import CustomerModal from '../../../components/customers/CustomerModal'
import { useStore } from '../../../lib/hooks/useStore'
import { Toast } from '../../../components/shared/Toast'
import { useToast } from '../../../lib/hooks/useToast'
import {
  getCustomers,
  deleteCustomer,
  exportCustomersToCSV,
  getCustomerTags,
  type CustomerWithId,
  type CustomerFilters,
  type CustomerSortOption
} from '../../../lib/customers'

// Mapeo de códigos de moneda a símbolos
const currencySymbols: Record<string, string> = {
  'USD': '$', 'EUR': '€', 'MXN': '$', 'COP': '$', 'ARS': '$', 'CLP': '$',
  'PEN': 'S/', 'BRL': 'R$', 'UYU': '$', 'PYG': '₲', 'BOB': 'Bs', 'VES': 'Bs',
  'GTQ': 'Q', 'CRC': '₡', 'NIO': 'C$', 'PAB': 'B/.', 'DOP': 'RD$', 'HNL': 'L',
  'SVC': '$', 'GBP': '£', 'CAD': 'C$', 'CHF': 'CHF', 'JPY': '¥', 'CNY': '¥', 'AUD': 'A$'
}

// Componente CustomerCard para la vista móvil
interface CustomerCardProps {
  customer: CustomerWithId
  onViewDetails: (customer: CustomerWithId) => void
  onDelete: (customerId: string) => void
  deleting: string | null
  formatCurrency: (amount: number) => string
  t: (key: string) => string
}

// Helper function to safely get customer initials
function getCustomerInitials(customer: CustomerWithId): string {
  const name = customer.displayName || extractNameFromEmail(customer.email) || 'U'
  return name.charAt(0).toUpperCase()
}

// Helper function to extract name from email
function extractNameFromEmail(email: string): string {
  if (!email) return 'Cliente'
  const name = email.split('@')[0]
  return name.charAt(0).toUpperCase() + name.slice(1)
}

function CustomerCard({ customer, onViewDetails, onDelete, deleting, formatCurrency, t }: CustomerCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])


  return (
    <div className="p-4 hover:bg-gray-50 relative">
      <div className="flex items-start space-x-4">
        {/* Checkbox */}
        <div className="flex-shrink-0 pt-1">
          <input
            type="checkbox"
            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
          />
        </div>
        
        {/* Customer Avatar */}
        <div className="flex-shrink-0">
          <div className="h-12 w-12 rounded-full bg-gray-300 flex items-center justify-center">
            <span className="text-lg font-medium text-gray-700">
              {getCustomerInitials(customer)}
            </span>
          </div>
        </div>

        {/* Customer Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-medium text-gray-900 truncate">
                {customer.displayName || extractNameFromEmail(customer.email) || 'Cliente sin nombre'}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {customer.email}
              </p>
              {customer.phone && (
                <p className="text-sm text-gray-500">
                  {customer.phone}
                </p>
              )}
            </div>

                         {/* Actions Menu */}
             <div className="flex items-center ml-2 relative" ref={menuRef}>
               <button
                 onClick={() => setShowMenu(!showMenu)}
                 className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                 title="Opciones"
               >
                 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                 </svg>
               </button>

               {/* Dropdown Menu */}
               {showMenu && (
                 <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                   <div className="py-1">
                     <button
                       onClick={() => {
                         onViewDetails(customer)
                         setShowMenu(false)
                       }}
                       className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                     >
                       <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                       </svg>
                       Ver detalles
                     </button>
                     
                     <button
                       onClick={() => {
                         if (window.confirm(t('actions.confirmDelete'))) {
                           onDelete(customer.id)
                         }
                         setShowMenu(false)
                       }}
                       disabled={deleting === customer.id}
                       className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                       {deleting === customer.id ? (
                         <svg className="animate-spin w-4 h-4 mr-3" fill="none" viewBox="0 0 24 24">
                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                         </svg>
                       ) : (
                         <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                         </svg>
                       )}
                       {t('actions.delete')}
                     </button>
                   </div>
                 </div>
               )}
             </div>
          </div>

          {/* Stats */}
          <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
            <div>
              <span className="font-medium text-gray-900">{formatCurrency(customer.totalSpent || 0)}</span>
              <span className="ml-1">{t('table.totalSpent').toLowerCase()}</span>
            </div>
            <div>
              <span className="font-medium text-gray-900">{customer.orderCount || 0}</span>
              <span className="ml-1">{t('table.orders').toLowerCase()}</span>
            </div>
          </div>

          {/* Tags */}
          {customer.tags && customer.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {customer.tags.map((tag, index) => (
                <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function CustomersPage() {
  const { store, loading: storeLoading } = useStore()
  const t = useTranslations('customers')
  const { toast, showToast, hideToast } = useToast()
  
  const [customers, setCustomers] = useState<CustomerWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerWithId | null>(null)
  const [showCustomerModal, setShowCustomerModal] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showFiltersModal, setShowFiltersModal] = useState(false)
  
  // Estados para filtros y paginación
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState<CustomerSortOption>('created-desc')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(0)
  const [totalItems, setTotalItems] = useState(0)
  
  const itemsPerPage = 10

  // Crear objeto de filtros
  const filters: CustomerFilters = useMemo(() => ({
    searchQuery: searchQuery.trim() || undefined,
    sortBy
  }), [searchQuery, sortBy])

  // Cargar etiquetas disponibles
  useEffect(() => {
    const loadTags = async () => {
      if (!store?.id) return
      
      try {
        await getCustomerTags(store.id)
        // Tags loaded successfully
      } catch (error) {
        console.error('Error loading tags:', error)
      }
    }

    if (!storeLoading && store?.id) {
      loadTags()
    }
  }, [store?.id, storeLoading, store])

  // Cargar clientes
  useEffect(() => {
    const loadCustomers = async () => {
      console.log('🔍 Loading customers - Store ID:', store?.id)
      console.log('🔍 Store loading:', storeLoading)
      console.log('🔍 Store object:', store)
      
      if (!store?.id) {
        console.log('❌ No store ID available')
        return
      }
      
      try {
        setLoading(true)
        console.log('📡 Calling getCustomers with:', { storeId: store.id, filters, currentPage, itemsPerPage })
        
        const result = await getCustomers(store.id, filters, currentPage, itemsPerPage)
        
        console.log('✅ getCustomers result:', result)
        
        setCustomers(result.customers)
        setTotalPages(result.totalPages)
        setCurrentPage(result.currentPage)
        setTotalItems(result.totalItems)
        
      } catch (err) {
        console.error('❌ Error loading customers:', err)
        setError(t('messages.loadError'))
      } finally {
        setLoading(false)
      }
    }

    if (!storeLoading && store?.id) {
      loadCustomers()
    }
  }, [store?.id, storeLoading, filters, currentPage, t])

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortBy])


  // Función para ver detalles del cliente
  const handleViewDetails = (customer: CustomerWithId) => {
    setSelectedCustomer(customer)
    setShowCustomerModal(true)
  }

  // Función para actualizar cliente
  const handleCustomerUpdated = (updatedCustomer: CustomerWithId) => {
    setCustomers(customers.map(customer => 
      customer.id === updatedCustomer.id ? updatedCustomer : customer
    ))
    setSelectedCustomer(updatedCustomer)
  }

  // Función para eliminar cliente
  const handleDelete = async (customerId: string) => {
    if (!store?.id) return
    
    try {
      setDeleting(customerId)
      await deleteCustomer(store.id, customerId)
      
      // Recargar clientes después de eliminar
      const result = await getCustomers(store.id, filters, currentPage, itemsPerPage)
      setCustomers(result.customers)
      setTotalPages(result.totalPages)
      setTotalItems(result.totalItems)
      
      // Si la página actual queda vacía, ir a la página anterior
      if (result.customers.length === 0 && currentPage > 1) {
        setCurrentPage(currentPage - 1)
      }
      
      showToast(t('messages.deleted'), 'success')
      
    } catch (err) {
      console.error('Error deleting customer:', err)
      setError(t('messages.deleteError'))
    } finally {
      setDeleting(null)
    }
  }

  // Función para exportar clientes
  const handleExport = async () => {
    if (!store?.id) return
    
    try {
      const csvData = await exportCustomersToCSV(store.id)
      
      // Crear y descargar archivo CSV
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' })
      const link = document.createElement('a')
      const url = URL.createObjectURL(blob)
      link.setAttribute('href', url)
      link.setAttribute('download', `clientes-${store.subdomain}-${new Date().toISOString().split('T')[0]}.csv`)
      link.style.visibility = 'hidden'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      
      showToast(t('messages.exported'), 'success')
      
    } catch (err) {
      console.error('Error exporting customers:', err)
      showToast(t('messages.error'), 'error')
    }
  }

  // Función para aplicar filtros
  const applyFilters = () => {
    setShowFiltersModal(false)
    // Los filtros se aplicarán automáticamente por el useEffect
  }

  // Función para formatear fecha
  const formatDate = (timestamp: Timestamp | Date | string | null | undefined) => {
    if (!timestamp) return t('table.never')
    
    try {
      const date = (timestamp as Timestamp).toDate ? (timestamp as Timestamp).toDate() : new Date(timestamp as string | Date)
      return date.toLocaleDateString()
          } catch {
        return t('table.never')
      }
  }

  // Función para formatear moneda
  const formatCurrency = (amount: number) => {
    const currency = store?.currency || 'USD'
    const symbol = currencySymbols[currency] || '$'
    const formattedAmount = new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
    return `${symbol}${formattedAmount}`
  }

  // Componente de paginación
  const PaginationComponent = () => {
    if (totalPages <= 1) return null

    const getPageNumbers = () => {
      const delta = 2
      const pages = []
      const start = Math.max(1, currentPage - delta)
      const end = Math.min(totalPages, currentPage + delta)

      for (let i = start; i <= end; i++) {
        pages.push(i)
      }

      return pages
    }

    return (
      <div className="border-t border-gray-200 bg-white px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Mobile pagination controls */}
          <div className="flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(currentPage - 1)}
              disabled={currentPage === 1}
              className="relative inline-flex items-center justify-center px-4 py-3 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[100px]"
            >
              <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              {t('pagination.previous')}
            </button>
            <div className="flex items-center px-4">
              <span className="text-sm text-gray-700">
                {currentPage} / {totalPages}
              </span>
            </div>
            <button
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="relative inline-flex items-center justify-center px-4 py-3 border border-gray-300 bg-white text-sm font-medium rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px] min-w-[100px]"
            >
              {t('pagination.next')}
              <svg className="h-4 w-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Desktop pagination info and controls */}
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                {t('pagination.showing')} <span className="font-medium">{((currentPage - 1) * itemsPerPage) + 1}</span> {t('pagination.to')}{' '}
                <span className="font-medium">
                  {Math.min(currentPage * itemsPerPage, totalItems)}
                </span>{' '}
                {t('pagination.of')} <span className="font-medium">{totalItems}</span> {t('pagination.customers')}
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center rounded-l-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="sr-only">{t('pagination.previous')}</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M12.79 5.23a.75.75 0 01-.02 1.06L8.832 10l3.938 3.71a.75.75 0 11-1.04 1.08l-4.5-4.25a.75.75 0 010-1.08l4.5-4.25a.75.75 0 011.06.02z" clipRule="evenodd" />
                  </svg>
                </button>
                {getPageNumbers().map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 ${
                      page === currentPage
                        ? 'z-10 bg-gray-900 text-white'
                        : 'text-gray-900'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center rounded-r-md px-3 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>
    )
  }

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
                onClick={handleExport}
                className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
                title={t('export')}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </button>
              <button 
                className="p-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200 opacity-50 cursor-not-allowed"
                title={t('import')}
                disabled
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                </svg>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 sm:flex-none inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
              >
                <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                {t('addCustomer')}
              </button>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            {/* Controles de búsqueda y filtros */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-4">
              <div className="px-4 sm:px-6 py-4">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  {/* Información de totales */}
                  <div className="flex items-center text-sm text-gray-500">
                    <span className="font-medium text-gray-900">{totalItems}</span>
                    <span className="ml-1">
                      {totalItems === 1 ? t('totalCustomer') : t('totalCustomers')}
                    </span>
                  </div>

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
                      <button 
                        onClick={() => setShowFiltersModal(true)}
                        className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-all min-h-[44px] sm:min-h-auto"
                      >
                        <svg className="h-4 w-4 mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.414A1 1 0 013 6.586V4z" />
                        </svg>
                        {t('filter')}
                      </button>

                      {/* Ordenar */}
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as CustomerSortOption)}
                        className="block w-full sm:w-auto py-2 pl-3 pr-8 border border-gray-300 bg-white rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all min-h-[44px] sm:min-h-auto"
                      >
                        <option value="created-desc">{t('sort')}</option>
                        <option value="created-desc">{t('sortOptions.createdDesc')}</option>
                        <option value="created-asc">{t('sortOptions.createdAsc')}</option>
                        <option value="name-asc">{t('sortOptions.nameAsc')}</option>
                        <option value="name-desc">{t('sortOptions.nameDesc')}</option>
                        <option value="email-asc">{t('sortOptions.emailAsc')}</option>
                        <option value="email-desc">{t('sortOptions.emailDesc')}</option>
                        <option value="totalSpent-desc">{t('sortOptions.totalSpentDesc')}</option>
                        <option value="totalSpent-asc">{t('sortOptions.totalSpentAsc')}</option>
                        <option value="orderCount-desc">{t('sortOptions.orderCountDesc')}</option>
                        <option value="orderCount-asc">{t('sortOptions.orderCountAsc')}</option>
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
                  <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-gray-200">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">
                      {searchQuery ? t('noCustomers') : t('noCustomersEmpty')}
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchQuery 
                        ? t('noCustomersMessage')
                        : t('noCustomersEmptyMessage')
                      }
                    </p>
                    {!searchQuery && (
                      <div className="mt-6">
                        <button
                          type="button"
                          onClick={() => setShowCreateModal(true)}
                          className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-gray-900 hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-900"
                        >
                          {t('addCustomer')}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-x-auto">
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
                              {t('table.name')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.email')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.phone')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.lastOrder')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.totalSpent')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.orders')}
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {t('table.tags')}
                            </th>
                            <th scope="col" className="relative px-6 py-3">
                              <span className="sr-only">{t('table.actions')}</span>
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {customers.map((customer) => (
                            <tr key={customer.id} className="hover:bg-gray-50">
                              <td className="w-4 px-6 py-4">
                                <input
                                  type="checkbox"
                                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                />
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                                      <span className="text-sm font-medium text-gray-700">
                                        {getCustomerInitials(customer)}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {customer.displayName || extractNameFromEmail(customer.email) || 'Cliente sin nombre'}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{customer.email}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{customer.phone || '—'}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{formatDate(customer.lastOrderAt || customer.lastActivity)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm font-medium text-gray-900">{formatCurrency(customer.totalSpent || 0)}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{customer.orderCount || 0}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex flex-wrap gap-1">
                                  {customer.tags && customer.tags.map((tag, index) => (
                                    <span key={index} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                      {tag}
                                    </span>
                                  ))}
                                  {(!customer.tags || customer.tags.length === 0) && (
                                    <span className="text-sm text-gray-400">—</span>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                <div className="flex items-center justify-end space-x-2">
                                  <button 
                                    onClick={() => handleViewDetails(customer)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                    title={t('actions.viewDetails')}
                                  >
                                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                    </svg>
                                  </button>
                                  <button 
                                    onClick={() => {
                                      if (window.confirm(t('actions.confirmDelete'))) {
                                        handleDelete(customer.id)
                                      }
                                    }}
                                    disabled={deleting === customer.id}
                                    className={`transition-colors ${
                                      deleting === customer.id 
                                        ? 'text-gray-400 cursor-not-allowed'
                                        : 'text-gray-400 hover:text-red-600'
                                    }`}
                                    title={t('actions.delete')}
                                  >
                                    {deleting === customer.id ? (
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
                        {customers.map((customer) => (
                          <CustomerCard
                            key={customer.id}
                            customer={customer}
                            onViewDetails={handleViewDetails}
                            onDelete={handleDelete}
                            deleting={deleting}
                            formatCurrency={formatCurrency}
                            t={t}
                          />
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

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}

      {/* Modal de filtros - placeholder */}
      {showFiltersModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowFiltersModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('filters.title')}</h3>
                <div className="space-y-4">
                  {/* Filtros placeholder */}
                  <p className="text-sm text-gray-500">Filtros avanzados - próximamente</p>
                </div>
              </div>
              <div className="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
                <button
                  type="button"
                  onClick={applyFilters}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:col-start-2 sm:text-sm"
                >
                  {t('filters.apply')}
                </button>
                <button
                  type="button"
                  onClick={() => setShowFiltersModal(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:col-start-1 sm:text-sm"
                >
                  {t('form.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de crear cliente - placeholder */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowCreateModal(false)}></div>
            <div className="inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-4">{t('addCustomer')}</h3>
                <p className="text-sm text-gray-500">Formulario de creación de cliente - próximamente</p>
              </div>
              <div className="mt-5 sm:mt-6">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:text-sm"
                >
                  {t('form.cancel')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de detalles del cliente */}
      {showCustomerModal && selectedCustomer && store?.id && (
        <CustomerModal
          customer={selectedCustomer}
          storeId={store.id}
          isOpen={showCustomerModal}
          onClose={() => setShowCustomerModal(false)}
          onCustomerUpdated={handleCustomerUpdated}
        />
      )}
    </DashboardLayout>
  )
} 