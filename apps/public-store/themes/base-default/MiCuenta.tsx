'use client'

import { useState, useEffect } from 'react'
import { useStoreAuth } from '../../lib/store-auth-context'
import { Tienda } from '../../lib/types'
import { CustomerOrder, getCustomerOrders, formatOrderDate, formatCurrency, getOrderStatusText, getOrderStatusColor } from '../../lib/customer-orders'
import { Category, getStoreCategories } from '../../lib/categories'
import AddressAutocomplete from '../../components/AddressAutocomplete'
import Link from 'next/link'
import './styles.css'

interface MiCuentaProps {
  tienda: Tienda
}



// Tipos para las secciones del menú
type MenuSection = 'profile' | 'orders' | 'coupons' | 'reviews' | 'settings'

// Iconos para el menú
const Icons = {
  profile: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  coupons: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  reviews: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
    </svg>
  ),
  settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  google: () => (
    <svg className="w-5 h-5" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
    </svg>
  ),
  email: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  lock: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  )
}

// Componente de autenticación
function AuthSection({ tienda }: { tienda: Tienda }) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    displayName: ''
  })

  const handleGoogleAuth = async () => {
    setIsLoading(true)
    try {
      // Aquí implementarías la lógica de autenticación con Google
      console.log('Autenticación con Google')
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Error con Google Auth:', error)
    }
    setIsLoading(false)
  }

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      // Aquí implementarías la lógica de autenticación con email
      console.log('Autenticación con email:', formData)
      // Simular delay
      await new Promise(resolve => setTimeout(resolve, 2000))
    } catch (error) {
      console.error('Error con email Auth:', error)
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-md mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-light text-neutral-900 mb-2">
            {isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </h1>
          <p className="text-neutral-600 font-light">
            {isSignUp 
              ? 'Únete a nosotros y disfruta de beneficios exclusivos'
              : 'Accede a tu cuenta para continuar'
            }
          </p>
        </div>

        <div className="space-y-6">
          {/* Botón de Google */}
          <button
            onClick={handleGoogleAuth}
            disabled={isLoading}
            className="w-full flex items-center justify-center space-x-3 px-4 py-3 border border-neutral-300 rounded-lg text-neutral-700 hover:bg-neutral-50 transition-colors duration-200 font-light disabled:opacity-50"
          >
            <Icons.google />
            <span>{isSignUp ? 'Registrarse' : 'Continuar'} con Google</span>
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-neutral-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-white text-neutral-500 font-light">o</span>
            </div>
          </div>

          {/* Formulario de email */}
          <form onSubmit={handleEmailAuth} className="space-y-4">
            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Nombre completo
                </label>
                <input
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                  className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent font-light"
                  placeholder="Tu nombre completo"
                  required
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Correo electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Icons.email />
                </div>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent font-light"
                  placeholder="tu@email.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-neutral-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                  <Icons.lock />
                </div>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent font-light"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {isSignUp && (
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-1">
                  Confirmar contraseña
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-neutral-400">
                    <Icons.lock />
                  </div>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
                    className="w-full pl-10 pr-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent font-light"
                    placeholder="••••••••"
                    required
                  />
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-neutral-900 text-white py-3 rounded-lg hover:bg-neutral-800 transition-colors duration-200 font-medium disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  <span>Procesando...</span>
                </div>
              ) : (
                isSignUp ? 'Crear cuenta' : 'Iniciar sesión'
              )}
            </button>
          </form>

          {/* Toggle entre login y signup */}
          <div className="text-center">
            <p className="text-neutral-600 font-light">
              {isSignUp ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?'}{' '}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-neutral-900 hover:underline font-medium"
              >
                {isSignUp ? 'Iniciar sesión' : 'Crear cuenta'}
              </button>
            </p>
          </div>

          {!isSignUp && (
            <div className="text-center">
              <button className="text-neutral-600 hover:text-neutral-900 font-light text-sm">
                ¿Olvidaste tu contraseña?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Componente interno que usa el contexto de autenticación
function MiCuentaContent({ tienda }: MiCuentaProps) {
  const { user, storeCustomerData, isAuthenticated, loading, logout, updateProfile } = useStoreAuth()
  const [orders, setOrders] = useState<CustomerOrder[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loadingOrders, setLoadingOrders] = useState(false)
  const [activeSection, setActiveSection] = useState<MenuSection>('profile')
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
    { id: 'profile' as MenuSection, label: 'Mi Perfil', icon: Icons.profile },
    { id: 'orders' as MenuSection, label: 'Compras', icon: Icons.orders },
    { id: 'coupons' as MenuSection, label: 'Cupones', icon: Icons.coupons },
    { id: 'reviews' as MenuSection, label: 'Opiniones', icon: Icons.reviews },
    { id: 'settings' as MenuSection, label: 'Configuración', icon: Icons.settings }
  ]

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <AuthSection tienda={tienda} />
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
                className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light"
              >
                {editingProfile ? 'Cancelar' : 'Editar'}
              </button>
            </div>
            
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
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
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent disabled:opacity-50 disabled:bg-neutral-50"
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
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg opacity-50 bg-neutral-50"
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
                    className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent disabled:opacity-50 disabled:bg-neutral-50"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-neutral-700 mb-2">
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
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profileData.address}
                      disabled
                      className="w-full px-3 py-2 border border-neutral-300 rounded-lg opacity-50 bg-neutral-50"
                    />
                  )}
                </div>
              </div>

              {editingProfile && (
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => setEditingProfile(false)}
                    className="px-4 py-2 border border-neutral-300 text-neutral-700 rounded-lg hover:bg-neutral-50 transition-colors duration-200"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="px-4 py-2 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-200"
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
            <h2 className="text-2xl font-light text-neutral-900">Mis Compras</h2>
            
            {loadingOrders ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900 mx-auto mb-4"></div>
                <p className="text-neutral-600">Cargando pedidos...</p>
              </div>
            ) : orders.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
                <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Icons.orders />
                </div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">
                  Aún no tienes compras
                </h3>
                <p className="text-neutral-600 mb-6">
                  Cuando realices tu primera compra, aparecerá aquí.
                </p>
                <Link href="/" className="inline-block px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-200">
                  Explorar Productos
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="bg-white border border-neutral-200 rounded-lg p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-medium text-neutral-900">
                          Pedido #{order.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-neutral-600">
                          {formatOrderDate(order.createdAt)}
                        </p>
                      </div>
                      <span className={`inline-flex items-center px-3 py-1 rounded-lg text-xs font-medium ${getOrderStatusColor(order.status)}`}>
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
                      <button className="text-neutral-600 hover:text-neutral-900 text-sm transition-colors duration-200">
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
            
            <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.coupons />
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
            
            <div className="bg-white border border-neutral-200 rounded-lg p-8 text-center">
              <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icons.reviews />
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
            
            <div className="bg-white border border-neutral-200 rounded-lg p-6">
              <h3 className="text-lg font-medium text-neutral-900 mb-4">
                Notificaciones
              </h3>
              
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={storeCustomerData?.preferences?.notifications}
                    className="rounded border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:ring-opacity-20 text-neutral-900"
                  />
                  <span className="ml-3 text-sm text-neutral-700">
                    Recibir notificaciones sobre el estado de mis pedidos
                  </span>
                </label>
                
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    defaultChecked={storeCustomerData?.preferences?.newsletter}
                    className="rounded border-neutral-300 focus:ring-2 focus:ring-neutral-400 focus:ring-opacity-20 text-neutral-900"
                  />
                  <span className="ml-3 text-sm text-neutral-700">
                    Suscribirse al newsletter y ofertas especiales
                  </span>
                </label>
              </div>
              
              <div className="mt-6">
                <button className="px-6 py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors duration-200">
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

  // Dashboard de cuenta autenticada
  return (
    <div className="min-h-screen bg-white pt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Mobile header con navegación horizontal */}
        <div className="lg:hidden mb-6">
          <h1 className="text-xl font-light text-neutral-900 mb-4">Mi Cuenta</h1>
          
          {/* Navegación horizontal en móvil */}
          <div className="overflow-x-auto">
            <div className="flex space-x-2 pb-2">
              {menuOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setActiveSection(option.id)}
                  className={`flex-shrink-0 flex items-center space-x-2 px-3 py-2 rounded-lg text-sm transition-all duration-200 ${
                    activeSection === option.id
                      ? 'bg-neutral-900 text-white'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200'
                  }`}
                >
                  <option.icon />
                  <span className="whitespace-nowrap">{option.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Desktop */}
          <div className="hidden lg:block w-64">
            <div className="bg-white border border-neutral-200 rounded-lg p-4 sticky top-8">
              <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-neutral-200">
                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                  <span className="text-lg font-medium text-neutral-600">
                    {(storeCustomerData?.displayName || storeCustomerData?.email || 'U')?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-medium text-neutral-900 text-sm">
                    {storeCustomerData?.displayName || 'Usuario'}
                  </p>
                  <p className="text-xs text-neutral-600">
                    {storeCustomerData?.email}
                  </p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {menuOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setActiveSection(option.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm ${
                      activeSection === option.id
                        ? 'bg-neutral-900 text-white'
                        : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                    }`}
                  >
                    <option.icon />
                    <span>{option.label}</span>
                  </button>
                ))}
                
                <div className="my-4 border-t border-neutral-200"></div>
                
                <button
                  onClick={logout}
                  className="w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-all duration-200 text-sm text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                  </svg>
                  <span>Cerrar Sesión</span>
                </button>
              </nav>
            </div>
          </div>





          {/* Content panel */}
          <div className="flex-1">
            {renderSectionContent()}
          </div>
        </div>

        {/* Mobile logout button at bottom */}
        <div className="lg:hidden mt-8 pt-6 border-t border-neutral-200">
          <button
            onClick={logout}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
            </svg>
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </div>
  )
}

// Componente principal (solo contenido, sin Layout)
export default function MiCuenta({ tienda }: MiCuentaProps) {
  return <MiCuentaContent tienda={tienda} />
}