'use client'

import { useState, useEffect } from 'react'
import { StoreAuthProvider, useStoreAuth } from '../../../lib/store-auth-context'
import { Tienda } from '../../../lib/types'
import { CustomerOrder, getCustomerOrders, formatOrderDate, formatCurrency, getOrderStatusText, getOrderStatusColor } from '../../../lib/customer-orders'
import { Category, getStoreCategories } from '../../../lib/categories'
import AuthModal from './AuthModal'
import Footer from '../../../components/Footer'
import AddressAutocomplete from '../../../components/AddressAutocomplete'
import Link from 'next/link'

interface MiCuentaClientProps {
  tienda: Tienda
}

// Tipos para las secciones del menú
type MenuSection = 'profile' | 'orders' | 'coupons' | 'reviews' | 'settings'

// Iconos para el menú
const MenuIcons = {
  profile: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  coupons: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  reviews: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// Componente interno que usa el contexto de autenticación
function MiCuentaContent({ tienda }: MiCuentaClientProps) {
  const { user, storeCustomerData, isAuthenticated, loading, logout, updateProfile } = useStoreAuth()
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [activeSection, setActiveSection] = useState<MenuSection>('profile')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [editingProfile, setEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    displayName: '',
    phone: '',
    address: '',
    location: undefined as { address: string; lat: number; lng: number } | undefined
  })

  // Inicializar datos del perfil
  useEffect(() => {
    if (storeCustomerData) {
      setProfileData({
        displayName: storeCustomerData.displayName || '',
        phone: storeCustomerData.phone || '',
        address: storeCustomerData.location?.address || storeCustomerData.address || '',
        location: storeCustomerData.location
      })
    }
  }, [storeCustomerData])

  // Cargar categorías de la tienda
  useEffect(() => {
    const loadCategories = async () => {
      if (tienda.id) {
        try {
          const storeCategories = await getStoreCategories(tienda.id)
          setCategories(storeCategories)
        } catch (error) {
          console.error('Error loading categories:', error)
        }
      }
    }

    loadCategories()
  }, [tienda.id])

  // Cargar órdenes del cliente
  useEffect(() => {
    const loadOrders = async () => {
      if (user && tienda.id) {
        setLoadingOrders(true)
        try {
          const customerOrders = await getCustomerOrders(tienda.id, user.uid)
          setOrders(customerOrders)
        } catch (error) {
          console.error('Error loading orders:', error)
        } finally {
          setLoadingOrders(false)
        }
      }
    }

    loadOrders()
  }, [user, tienda.id])

  // Manejar guardado de perfil
  const handleSaveProfile = async () => {
    try {
      await updateProfile(profileData)
      setEditingProfile(false)
    } catch (error) {
      console.error('Error saving profile:', error)
    }
  }

  // Opciones del menú
  const menuOptions = [
    { id: 'profile' as MenuSection, label: 'Mi Perfil', icon: MenuIcons.profile },
    { id: 'orders' as MenuSection, label: 'Compras', icon: MenuIcons.orders },
    { id: 'coupons' as MenuSection, label: 'Cupones', icon: MenuIcons.coupons },
    { id: 'reviews' as MenuSection, label: 'Opiniones', icon: MenuIcons.reviews },
    { id: 'settings' as MenuSection, label: 'Configuración', icon: MenuIcons.settings }
  ]

  // Mostrar loading mientras se inicializa
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900 mx-auto mb-4"></div>
          <p className="text-neutral-600">Cargando...</p>
        </div>
      </div>
    )
  }

  // Mostrar modal de autenticación si no está logueado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-neutral-900 rounded-sm flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {tienda.storeName?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <span className="text-xl font-light text-neutral-900">
                    {tienda.storeName}
                  </span>
                </Link>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800 transition-colors"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="bg-white rounded-lg shadow-lg p-8 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h1 className="text-2xl font-light text-neutral-900 mb-2">Mi Cuenta</h1>
            <p className="text-neutral-600 mb-8">
              Inicia sesión para ver tu historial de pedidos y gestionar tu cuenta
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-neutral-900 text-white py-3 rounded-md hover:bg-neutral-800 transition-colors"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="w-full bg-white text-neutral-900 py-3 rounded-md border border-neutral-300 hover:bg-neutral-50 transition-colors"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>

        {/* Modal de autenticación */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            storeName={tienda.storeName}
          />
        )}

        {/* Footer */}
        <Footer tienda={tienda} categorias={categories} />
      </div>
    )
  }

  // Renderizar contenido de cada sección
  const renderSectionContent = () => {
    switch (activeSection) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-light text-neutral-900">Mi Perfil</h2>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                {editingProfile ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-light text-neutral-600">
                    {(storeCustomerData?.displayName || storeCustomerData?.email || 'U')?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-neutral-900">
                    {storeCustomerData?.displayName || 'Usuario'}
                  </h3>
                  <p className="text-neutral-600">{storeCustomerData?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled={!editingProfile}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={storeCustomerData?.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md bg-neutral-50 text-neutral-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editingProfile}
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
                    Dirección
                  </label>
                  <AddressAutocomplete
                    value={profileData.address}
                    onChange={(address, coordinates) => {
                      setProfileData(prev => ({ 
                        ...prev, 
                        address,
                        location: coordinates ? { address, lat: coordinates.lat, lng: coordinates.lng } : prev.location
                      }))
                    }}
                    disabled={!editingProfile}
                    placeholder="Ingresa tu dirección completa"
                    className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent disabled:bg-neutral-50 disabled:text-neutral-500"
                  />
                </div>
              </div>

              {editingProfile && (
                <div className="mt-6 flex space-x-3">
                  <button
                    onClick={handleSaveProfile}
                    className="bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800 transition-colors"
                  >
                    Guardar Cambios
                  </button>
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="bg-neutral-100 text-neutral-900 px-6 py-2 rounded-md hover:bg-neutral-200 transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-neutral-900">Mis Compras</h2>
            
            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900 mx-auto mb-4"></div>
                <p className="text-neutral-600">Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MenuIcons.orders />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Aún no tienes compras
                </h3>
                <p className="text-neutral-600 mb-6">
                  Cuando realices tu primera compra, aparecerá aquí.
                </p>
                <Link
                  href="/"
                  className="inline-block bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800 transition-colors"
                >
                  Explorar Productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-neutral-900">
                          Pedido #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <span className="text-neutral-600">
                            {item.quantity}x {item.name}
                          </span>
                          <span className="text-neutral-900">
                            {formatCurrency(item.subtotal, tienda.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4 border-t border-neutral-200">
                      <span className="font-medium text-neutral-900">
                        Total: {formatCurrency(order.total, tienda.currency)}
                      </span>
                      <button className="text-neutral-600 hover:text-neutral-900 text-sm transition-colors">
                        Ver Detalles
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )

      case 'coupons':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-neutral-900">Cupones</h2>
            
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MenuIcons.coupons />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Aún no tienes cupones
              </h3>
              <p className="text-neutral-600">
                Los cupones y descuentos que tengas disponibles aparecerán aquí.
              </p>
            </div>
          </div>
        )

      case 'reviews':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-neutral-900">Opiniones</h2>
            
            <div className="bg-white rounded-xl shadow-sm p-12 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <MenuIcons.reviews />
              </div>
              <h3 className="text-lg font-medium text-neutral-900 mb-2">
                Pronto podrás calificar tus productos
              </h3>
              <p className="text-neutral-600">
                Aquí podrás dejar reseñas y calificaciones de los productos que has comprado.
              </p>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-neutral-900">Configuración</h2>
            
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">Notificaciones</h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={storeCustomerData?.preferences?.notifications}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  />
                  <span className="ml-3 text-sm text-neutral-700">
                    Recibir notificaciones sobre el estado de mis pedidos
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={storeCustomerData?.preferences?.newsletter}
                    className="rounded border-neutral-300 text-neutral-900 focus:ring-neutral-400"
                  />
                  <span className="ml-3 text-sm text-neutral-700">
                    Suscribirse al newsletter y ofertas especiales
                  </span>
                </label>
              </div>
              
              <div className="mt-6">
                <button className="bg-neutral-900 text-white px-6 py-2 rounded-md hover:bg-neutral-800 transition-colors">
                  Guardar Preferencias
                </button>
              </div>
            </div>
          </div>
        )

      default:
        return null
    }
  }

  // Contenido para usuario autenticado
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-neutral-900 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {tienda.storeName?.charAt(0) || 'S'}
                  </span>
                </div>
                <span className="text-xl font-light text-neutral-900">
                  {tienda.storeName}
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-neutral-600">
                Hola, {storeCustomerData?.displayName || user?.email}
              </span>
              
              {/* Botón menú móvil */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <MenuIcons.menu />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          {/* Menú lateral - Desktop */}
          <div className="hidden lg:block w-64">
            <div className="bg-white rounded-xl shadow-sm p-4 sticky top-8">
              <nav className="space-y-2">
                {menuOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setActiveSection(option.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                      activeSection === option.id
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                    }`}
                  >
                    <option.icon />
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
                
                {/* Separador */}
                <div className="border-t border-neutral-200 my-4"></div>
                
                {/* Botón Cerrar Sesión */}
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span className="font-medium">Cerrar Sesión</span>
                </button>
              </nav>
            </div>
          </div>

          {/* Panel de contenido */}
          <div className="flex-1">
            {renderSectionContent()}
          </div>
        </div>
      </div>

      {/* Menú móvil */}
      <div className={`fixed inset-0 z-50 lg:hidden transition-all duration-300 ease-in-out ${
        mobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
      }`}>
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ease-in-out ${
            mobileMenuOpen ? 'bg-opacity-50' : 'bg-opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)} 
        />
        <div className={`fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <h3 className="text-lg font-medium text-neutral-900">Menú</h3>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
            >
              <MenuIcons.close />
            </button>
          </div>
            
            <nav className="p-4 space-y-2">
              {menuOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => {
                    setActiveSection(option.id)
                    setMobileMenuOpen(false)
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors ${
                    activeSection === option.id
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <option.icon />
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
              
              {/* Separador */}
              <div className="border-t border-neutral-200 my-4"></div>
              
              {/* Botón Cerrar Sesión */}
              <button
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-colors text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span className="font-medium">Cerrar Sesión</span>
              </button>
            </nav>
          </div>
        </div>

      {/* Footer */}
      <Footer tienda={tienda} categorias={categories} />
    </div>
  )
}

// Componente principal que proporciona el contexto
export default function MiCuentaClient({ tienda }: MiCuentaClientProps) {
  return (
    <StoreAuthProvider storeId={tienda.id}>
      <MiCuentaContent tienda={tienda} />
    </StoreAuthProvider>
  )
} 