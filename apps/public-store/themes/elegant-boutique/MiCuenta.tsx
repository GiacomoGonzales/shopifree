'use client'

import { useState, useEffect } from 'react'
import { StoreAuthProvider, useStoreAuth } from '../../lib/store-auth-context'
import { Tienda } from '../../lib/types'
import { CustomerOrder, getCustomerOrders, formatOrderDate, formatCurrency, getOrderStatusText, getOrderStatusColor } from '../../lib/customer-orders'
import { Category, getStoreCategories } from '../../lib/categories'
import ElegantAuthModal from './AuthModal'
import ElegantFooter from './Footer'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import Link from 'next/link'

interface MiCuentaElegantProps {
  tienda: Tienda
}

type MenuSection = 'profile' | 'orders' | 'coupons' | 'reviews' | 'settings'

// Iconos elegantes para el menú
const MenuIcons = {
  profile: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  coupons: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 6v.75m0 3v.75m0 3v.75m0 3V18m-9-5.25h5.25M7.5 15h3M3.375 5.25c-.621 0-1.125.504-1.125 1.125v3.026a2.999 2.999 0 010 5.198v3.026c0 .621.504 1.125 1.125 1.125h17.25c.621 0 1.125-.504 1.125-1.125v-3.026a2.999 2.999 0 010-5.198V6.375c0-.621-.504-1.125-1.125-1.125H3.375z" />
    </svg>
  ),
  reviews: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  ),
  settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M10.343 3.94c.09-.542.56-.94 1.11-.94h1.093c.55 0 1.02.398 1.11.94l.149.894c.07.424.384.764.78.93.398.164.855.142 1.205-.108l.737-.527a1.125 1.125 0 011.45.12l.773.774c.39.389.44 1.002.12 1.45l-.527.737c-.25.35-.272.806-.107 1.204.165.397.505.71.93.78l.893.15c.543.09.94.56.94 1.109v1.094c0 .55-.397 1.02-.94 1.11l-.893.149c-.425.07-.765.383-.93.78-.165.398-.143.854.107 1.204l.527.738c.32.447.269 1.06-.12 1.45l-.774.773a1.125 1.125 0 01-1.449.12l-.738-.527c-.35-.25-.806-.272-1.203-.107-.397.165-.71.505-.781.929l-.149.894c-.09.542-.56.94-1.11.94h-1.094c-.55 0-1.019-.398-1.11-.94l-.148-.894c-.071-.424-.384-.764-.781-.93-.398-.164-.854-.142-1.204.108l-.738.527c-.447.32-1.06.269-1.45-.12l-.773-.774a1.125 1.125 0 01-.12-1.45l.527-.737c.25-.35.273-.806.108-1.204-.165-.397-.505-.71-.93-.78l-.894-.15c-.542-.09-.94-.56-.94-1.109v-1.094c0-.55.398-1.02.94-1.11l.894-.149c.424-.07.765-.383.93-.78.165-.398.143-.854-.107-1.204l-.527-.738a1.125 1.125 0 01.12-1.45l.773-.773a1.125 1.125 0 011.45-.12l.737.527c.35.25.807.272 1.204.107.397-.165.71-.505.78-.929l.15-.894z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  crown: () => (
    <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5 16L3 6l5.5 4L12 4l3.5 6L21 6l-2 10H5zm2.7-2h8.6l.9-4.4L14 12l-2-3.4L10 12l-3.2-2.4L7.7 14z"/>
    </svg>
  )
}

// Componente interno que usa el contexto de autenticación
function MiCuentaElegantContent({ tienda }: MiCuentaElegantProps) {
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
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 mx-auto mb-4" style={{ borderColor: 'rgb(var(--theme-accent))' }}></div>
          <p className="text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>Cargando...</p>
        </div>
      </div>
    )
  }

  // Mostrar modal de autenticación si no está logueado
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
        {/* Header */}
        <div className="border-b" style={{ 
          backgroundColor: 'rgb(var(--theme-secondary))', 
          borderColor: 'rgb(var(--theme-primary) / 0.1)' 
        }}>
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <Link href="/" className="flex items-center space-x-3">
                  <div 
                    className="w-8 h-8 rounded-sm flex items-center justify-center"
                    style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                  >
                    <span className="text-white font-bold text-sm text-serif">
                      {tienda.storeName?.charAt(0) || 'S'}
                    </span>
                  </div>
                  <span className="text-xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    {tienda.storeName}
                  </span>
                </Link>
              </div>
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-boutique-primary"
              >
                Iniciar Sesión
              </button>
            </div>
          </div>
        </div>

        {/* Contenido principal */}
        <div className="max-w-md mx-auto px-4 py-12">
          <div className="card-boutique text-center">
            <div 
              className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6"
              style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}
            >
              <MenuIcons.crown />
            </div>
            <h1 className="text-2xl font-light text-serif mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              Mi Cuenta
            </h1>
            <p className="text-sans mb-8" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
              Inicia sesión para acceder a tu cuenta y gestionar tus pedidos
            </p>
            <div className="space-y-3">
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-boutique-primary w-full"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setShowAuthModal(true)}
                className="btn-boutique-secondary w-full"
              >
                Crear Cuenta
              </button>
            </div>
          </div>
        </div>

        {/* Modal de autenticación */}
        {showAuthModal && (
          <ElegantAuthModal
            onClose={() => setShowAuthModal(false)}
            storeName={tienda.storeName}
          />
        )}

        {/* Footer */}
        <ElegantFooter tienda={tienda} categorias={categories} />
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
              <h2 className="text-2xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                Mi Perfil
              </h2>
              <button
                onClick={() => setEditingProfile(!editingProfile)}
                className="hover-elegant text-sans"
                style={{ color: 'rgb(var(--theme-accent))' }}
              >
                {editingProfile ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            
            <div className="card-boutique">
              <div className="flex items-center space-x-4 mb-6">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}
                >
                  <span className="text-2xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                    {(storeCustomerData?.displayName || storeCustomerData?.email || 'U')?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    {storeCustomerData?.displayName || 'Usuario'}
                  </h3>
                  <p className="text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                    {storeCustomerData?.email}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    Nombre completo
                  </label>
                  <input
                    type="text"
                    value={profileData.displayName}
                    onChange={(e) => setProfileData(prev => ({ ...prev, displayName: e.target.value }))}
                    disabled={!editingProfile}
                    className="input-boutique"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    Email
                  </label>
                  <input
                    type="email"
                    value={storeCustomerData?.email || ''}
                    disabled
                    className="input-boutique opacity-50"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!editingProfile}
                    className="input-boutique"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-sans mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    Dirección
                  </label>
                  {editingProfile ? (
                    <AddressAutocomplete
                      value={profileData.address}
                      onChange={(address, coordinates) => setProfileData(prev => ({ 
                        ...prev, 
                        address, 
                        location: coordinates ? { address, lat: coordinates.lat, lng: coordinates.lng } : prev.location 
                      }))}
                      placeholder="Ingresa tu dirección"
                      className="input-boutique"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profileData.address}
                      disabled
                      className="input-boutique opacity-50"
                    />
                  )}
                </div>
              </div>

              {editingProfile && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="btn-boutique-secondary"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="btn-boutique-primary"
                  >
                    Guardar Cambios
                  </button>
                </div>
              )}
            </div>
          </div>
        )

      case 'orders':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              Mis Compras
            </h2>
            
            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: 'rgb(var(--theme-accent))' }}></div>
                <p className="text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="card-boutique text-center">
                <div 
                  className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                  style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}
                >
                  <MenuIcons.orders />
                </div>
                <h3 className="text-lg font-medium text-serif mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  Aún no tienes compras
                </h3>
                <p className="text-sans mb-6" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  Cuando realices tu primera compra, aparecerá aquí.
                </p>
                <Link href="/" className="btn-boutique-primary inline-block">
                  Explorar Productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="card-boutique">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                          Pedido #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-sm text-xs font-medium text-sans ${getOrderStatusColor(order.status)}`}>
                        {getOrderStatusText(order.status)}
                      </span>
                    </div>
                    
                    <div className="space-y-2 mb-4">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm text-sans">
                          <span style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                            {item.quantity}x {item.name}
                          </span>
                          <span style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                            {formatCurrency(item.subtotal, tienda.currency)}
                          </span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex justify-between items-center pt-4" style={{ borderTop: '1px solid rgb(var(--theme-primary) / 0.1)' }}>
                      <span className="font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                        Total: {formatCurrency(order.total, tienda.currency)}
                      </span>
                      <button className="hover-elegant text-sm text-sans" style={{ color: 'rgb(var(--theme-accent))' }}>
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
            <h2 className="text-2xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              Cupones
            </h2>
            
            <div className="card-boutique text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}
              >
                <MenuIcons.coupons />
              </div>
              <h3 className="text-lg font-medium text-serif mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                Aún no tienes cupones
              </h3>
              <p className="text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                Los cupones y descuentos que tengas disponibles aparecerán aquí.
              </p>
            </div>
          </div>
        )

      case 'reviews':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              Opiniones
            </h2>
            
            <div className="card-boutique text-center">
              <div 
                className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}
              >
                <MenuIcons.reviews />
              </div>
              <h3 className="text-lg font-medium text-serif mb-2" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                Pronto podrás calificar tus productos
              </h3>
              <p className="text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                Aquí podrás dejar reseñas y calificaciones de los productos que has comprado.
              </p>
            </div>
          </div>
        )

      case 'settings':
        return (
          <div className="space-y-6">
            <h2 className="text-2xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              Configuración
            </h2>
            
            <div className="card-boutique">
              <h3 className="text-lg font-medium text-serif mb-4" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                Notificaciones
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={storeCustomerData?.preferences?.notifications}
                    className="rounded border-2 focus:ring-2 focus:ring-opacity-20"
                    style={{ 
                      borderColor: 'rgb(var(--theme-primary) / 0.3)',
                      color: 'rgb(var(--theme-accent))'
                    }}
                  />
                  <span className="ml-3 text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    Recibir notificaciones sobre el estado de mis pedidos
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={storeCustomerData?.preferences?.newsletter}
                    className="rounded border-2 focus:ring-2 focus:ring-opacity-20"
                    style={{ 
                      borderColor: 'rgb(var(--theme-primary) / 0.3)',
                      color: 'rgb(var(--theme-accent))'
                    }}
                  />
                  <span className="ml-3 text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                    Suscribirse al newsletter y ofertas especiales
                  </span>
                </label>
              </div>
              
              <div className="mt-6">
                <button className="btn-boutique-primary">
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
    <div className="min-h-screen" style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
      {/* Header */}
      <div className="border-b" style={{ 
        backgroundColor: 'rgb(var(--theme-secondary))', 
        borderColor: 'rgb(var(--theme-primary) / 0.1)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-3">
                <div 
                  className="w-8 h-8 rounded-sm flex items-center justify-center"
                  style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                >
                  <span className="text-white font-bold text-sm text-serif">
                    {tienda.storeName?.charAt(0) || 'S'}
                  </span>
                </div>
                <span className="text-xl font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  {tienda.storeName}
                </span>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="hidden sm:block text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                Hola, {storeCustomerData?.displayName || user?.email}
              </span>
              
              {/* Botón menú móvil */}
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden p-2 hover-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
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
            <div className="card-boutique sticky top-8">
              <nav className="space-y-2">
                {menuOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setActiveSection(option.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm text-left transition-all duration-300 text-sans ${
                      activeSection === option.id
                        ? 'text-white'
                        : 'hover-elegant'
                    }`}
                    style={{
                      backgroundColor: activeSection === option.id 
                        ? 'rgb(var(--theme-primary))' 
                        : 'transparent',
                      color: activeSection === option.id 
                        ? 'rgb(var(--theme-neutral-light))' 
                        : 'rgb(var(--theme-neutral-medium))'
                    }}
                  >
                    <option.icon />
                    <span className="font-medium">{option.label}</span>
                  </button>
                ))}
                
                {/* Separador */}
                <div className="my-4" style={{ borderTop: '1px solid rgb(var(--theme-primary) / 0.1)' }}></div>
                
                {/* Botón Cerrar Sesión */}
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-4 py-3 rounded-sm text-left transition-all duration-300 text-sans hover-elegant"
                  style={{ color: 'rgb(var(--theme-error))' }}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
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
        <div className={`fixed right-0 top-0 h-full w-80 shadow-xl transform transition-transform duration-300 ease-in-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`} style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
          <div className="flex items-center justify-between p-4" style={{ borderBottom: '1px solid rgb(var(--theme-primary) / 0.1)' }}>
            <h3 className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              Menú
            </h3>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover-elegant"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
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
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-sm text-left transition-all duration-300 text-sans ${
                  activeSection === option.id
                    ? 'text-white'
                    : 'hover-elegant'
                }`}
                style={{
                  backgroundColor: activeSection === option.id 
                    ? 'rgb(var(--theme-primary))' 
                    : 'transparent',
                  color: activeSection === option.id 
                    ? 'rgb(var(--theme-neutral-light))' 
                    : 'rgb(var(--theme-neutral-medium))'
                }}
              >
                <option.icon />
                <span className="font-medium">{option.label}</span>
              </button>
            ))}
            
            {/* Separador */}
            <div className="my-4" style={{ borderTop: '1px solid rgb(var(--theme-primary) / 0.1)' }}></div>
            
            {/* Botón Cerrar Sesión */}
            <button
              onClick={() => {
                logout()
                setMobileMenuOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-sm text-left transition-all duration-300 text-sans hover-elegant"
              style={{ color: 'rgb(var(--theme-error))' }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              <span className="font-medium">Cerrar Sesión</span>
            </button>
          </nav>
        </div>
      </div>

              {/* Footer */}
        <ElegantFooter tienda={tienda} categorias={categories} />
    </div>
  )
}

// Componente principal que proporciona el contexto
export default function MiCuentaElegant({ tienda }: MiCuentaElegantProps) {
  return (
    <StoreAuthProvider storeId={tienda.id}>
      <MiCuentaElegantContent tienda={tienda} />
    </StoreAuthProvider>
  )
} 