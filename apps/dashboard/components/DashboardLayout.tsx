'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import { useAuth } from '../lib/simple-auth-context'
import { getLandingUrl } from '../lib/config'

// Iconos para el menú
const MenuIcons = {
  Home: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  Orders: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  Products: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  Customers: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
    </svg>
  ),
  Marketing: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
    </svg>
  ),
  Discounts: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  Content: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  StoreDesign: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
    </svg>
  ),
  Reports: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  Settings: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  Support: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25A9.75 9.75 0 102.25 12 9.75 9.75 0 0012 2.25z" />
    </svg>
  ),
  Account: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Logout: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Globe: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  ChevronRight: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
  )
}

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [languageDropdownOpen, setLanguageDropdownOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const t = useTranslations('navigation')
  const { user, signOut } = useAuth()

  // Cerrar dropdown al hacer clic fuera
  const handleClickOutside = (event: React.MouseEvent) => {
    if (languageDropdownOpen) {
      setLanguageDropdownOpen(false)
    }
  }

  // Obtener el locale actual de la URL
  const currentLocale = pathname.split('/')[1] || 'es'
  const otherLocale = currentLocale === 'es' ? 'en' : 'es'

  // Función para obtener el título dinámico de la página actual
  const getPageTitle = () => {
    const pathSegments = pathname.split('/').filter(Boolean)
    const currentSection = pathSegments[pathSegments.length - 1] || ''
    const parentSection = pathSegments[pathSegments.length - 2] || ''
    
    // Mapeo de rutas a keys de traducción
    const routeToTranslationKey: Record<string, string> = {
      'home': 'home',
      'orders': 'orders', 
      'products': 'products',
      'customers': 'customers',
      'marketing': 'marketing',
      'discounts': 'discounts',
      'content': 'content',
      'store-design': 'storeDesign',
      'reports': 'reports',
      'settings': 'settings',
      'support': 'support',
      'account': 'account'
    }

    // Mapeo específico para subrutas de settings
    const settingsSubrouteToTranslationKey: Record<string, string> = {
      'general': 'basicSettings',
      'basic': 'basicSettings', // Backward compatibility
      'advanced': 'advancedSettings'
    }

    // Si estamos en una subruta de settings
    if (parentSection === 'settings' && settingsSubrouteToTranslationKey[currentSection]) {
      return t(settingsSubrouteToTranslationKey[currentSection])
    }

    // Si la ruta actual tiene una traducción, la usamos
    if (routeToTranslationKey[currentSection]) {
      return t(routeToTranslationKey[currentSection])
    }
    
    // Si estamos en el home o ruta base, mostramos "Dashboard"
    if (currentSection === currentLocale || currentSection === '' || pathSegments.length <= 1) {
      return 'Dashboard'
    }
    
    // Fallback por si no encontramos la traducción
    return 'Dashboard'
  }

  // Elementos del menú de navegación
  const navigationItems = [
    { key: 'home', href: `/${currentLocale}/home`, icon: MenuIcons.Home },
    { key: 'orders', href: `/${currentLocale}/orders`, icon: MenuIcons.Orders },
    { key: 'products', href: `/${currentLocale}/products`, icon: MenuIcons.Products },
    { key: 'customers', href: `/${currentLocale}/customers`, icon: MenuIcons.Customers },
    { key: 'marketing', href: `/${currentLocale}/marketing`, icon: MenuIcons.Marketing },
    { key: 'discounts', href: `/${currentLocale}/discounts`, icon: MenuIcons.Discounts },
    { key: 'content', href: `/${currentLocale}/content`, icon: MenuIcons.Content },
    { key: 'storeDesign', href: `/${currentLocale}/store-design`, icon: MenuIcons.StoreDesign },
    { key: 'reports', href: `/${currentLocale}/reports`, icon: MenuIcons.Reports },
    { key: 'support', href: `/${currentLocale}/support`, icon: MenuIcons.Support },
  ]

  // Elemento especial para Settings con subopciones
  const settingsItem = {
    key: 'settings',
    href: `/${currentLocale}/settings`,
    icon: MenuIcons.Settings,
    subitems: [
      { 
        key: 'basicSettings', 
        href: `/${currentLocale}/settings/general`, 
        label: t('basicSettings') || (currentLocale === 'es' ? 'General' : 'General')
      },
      { 
        key: 'advancedSettings', 
        href: `/${currentLocale}/settings/advanced`, 
        label: t('advancedSettings') || (currentLocale === 'es' ? 'Configuración Avanzada' : 'Advanced Settings')
      }
    ]
  }

  const handleSignOut = async () => {
    await signOut()
    router.push(`/${currentLocale}/login`)
  }

  const handleLanguageChange = (locale: string) => {
    const newPath = pathname.replace(`/${currentLocale}`, `/${locale}`)
    router.push(newPath)
    setLanguageDropdownOpen(false)
  }

  const isActiveRoute = (href: string) => {
    if (href === `/${currentLocale}/home`) {
      return pathname === href || pathname === `/${currentLocale}` || pathname === `/${currentLocale}/`
    }
    return pathname.startsWith(href)
  }

  // Función para renderizar elementos de menú normales
  const renderMenuItems = (isMobile: boolean = false) => {
    return navigationItems.map((item) => {
      const Icon = item.icon
      const isActive = isActiveRoute(item.href)
      return (
        <button
          key={item.key}
          onClick={() => {
            router.push(item.href)
            if (isMobile) setSidebarOpen(false)
          }}
          className={`w-full group flex items-center px-2 py-1.5 text-sm font-medium rounded-md ${
            isActive
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Icon />
          <span className="ml-3">{t(item.key)}</span>
        </button>
      )
    })
  }

  // Función para renderizar el elemento Settings con submenú
  const renderSettingsMenu = (isMobile: boolean = false) => {
    const Icon = settingsItem.icon
    const isSettingsActive = pathname.startsWith(settingsItem.href)
    
    return (
      <div key={settingsItem.key}>
        {/* Elemento principal de Settings */}
        <button
          onClick={() => {
            router.push(`/${currentLocale}/settings/general`)
            if (isMobile) setSidebarOpen(false)
          }}
          className={`w-full group flex items-center px-2 py-1.5 text-sm font-medium rounded-md ${
            isSettingsActive
              ? 'bg-gray-100 text-gray-900'
              : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
          }`}
        >
          <Icon />
          <span className="ml-3">{t(settingsItem.key)}</span>
        </button>
        
        {/* Submenú de Settings - siempre visible cuando estamos en settings */}
        {isSettingsActive && (
          <div className="mt-1">
            {settingsItem.subitems.map((subitem) => {
              const isSubitemActive = isActiveRoute(subitem.href)
              return (
                <button
                  key={subitem.key}
                  onClick={() => {
                    router.push(subitem.href)
                    if (isMobile) setSidebarOpen(false)
                  }}
                  className={`w-full group flex items-center py-1.5 pl-10 pr-2 text-sm ${
                    isSubitemActive
                      ? 'text-gray-900 font-medium'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {subitem.label}
                </button>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50" onClick={handleClickOutside}>
      {/* Sidebar móvil */}
      <div className={`fixed inset-0 z-40 lg:hidden ${sidebarOpen ? 'block' : 'hidden'}`}>
        <div className="fixed inset-0 bg-gray-600 bg-opacity-75" onClick={() => setSidebarOpen(false)} />
        <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
          <div className="absolute top-0 right-0 -mr-12 pt-2">
            <button
              type="button"
              className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
              onClick={() => setSidebarOpen(false)}
            >
              <MenuIcons.Close />
            </button>
          </div>
          <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
            <div className="flex-shrink-0 flex items-center px-4 justify-center">
              <button 
                onClick={() => router.push(`/${currentLocale}/home`)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-md transition-all duration-200 hover:scale-105"
              >
                <Image 
                  src="/logo-primary.svg" 
                  alt="Shopifree Logo" 
                  width={280} 
                  height={80}
                  className="h-16 w-auto object-contain"
                  priority
                />
              </button>
            </div>
            <nav className="mt-5 px-2 space-y-0.5">
              {renderMenuItems(true)}
              {renderSettingsMenu(true)}
            </nav>
          </div>
          <div className="flex-shrink-0 flex border-t border-gray-200 p-4">
            <div className="flex-shrink-0 w-full group block">
              <div className="flex items-center">
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-700">{user?.email}</p>
                  <button
                    onClick={() => {
                      router.push(`/${currentLocale}/account`)
                      setSidebarOpen(false)
                    }}
                    className="text-xs font-medium text-gray-500 hover:text-gray-700"
                  >
                    {t('account')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sidebar escritorio */}
      <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
        <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4 justify-center">
              <button 
                onClick={() => router.push(`/${currentLocale}/home`)}
                className="focus:outline-none focus:ring-2 focus:ring-gray-600 rounded-md transition-all duration-200 hover:scale-105"
              >
                <Image 
                  src="/logo-primary.svg" 
                  alt="Shopifree Logo" 
                  width={280} 
                  height={80}
                  className="h-16 w-auto object-contain"
                  priority
                />
              </button>
            </div>
            <nav className="mt-5 flex-1 px-2 bg-white space-y-0.5">
              {renderMenuItems(false)}
              {renderSettingsMenu(false)}
            </nav>
          </div>

          {/* Sección inferior con cuenta y logout */}
          <div className="flex-shrink-0 border-t border-gray-200 p-4">
            <button
              onClick={() => router.push(`/${currentLocale}/account`)}
              className="w-full group flex items-center px-2 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <MenuIcons.Account />
              <span className="ml-3">{t('account')}</span>
            </button>
            <button
              onClick={handleSignOut}
              className="w-full mt-1 group flex items-center px-2 py-1.5 text-sm font-medium rounded-md text-gray-600 hover:bg-gray-50 hover:text-gray-900"
            >
              <MenuIcons.Logout />
              <span className="ml-3">{t('logout')}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64 flex flex-col flex-1">
        {/* Header */}
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
          <button
            type="button"
            className="px-4 border-r border-gray-200 text-gray-500 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-gray-600 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <MenuIcons.Menu />
          </button>
          <div className="flex-1 px-4 flex justify-between">
            <div className="flex-1 flex">
              <div className="w-full flex md:ml-0">
                <div className="relative w-full text-gray-400 focus-within:text-gray-600">
                  <div className="absolute inset-y-0 left-0 flex items-center">
                    <h2 className="text-lg font-semibold text-gray-900">
                      {getPageTitle()}
                    </h2>
                  </div>
                </div>
              </div>
            </div>
            <div className="ml-4 flex items-center md:ml-6">
              {/* Selector de idioma */}
              <div className="relative ml-3">
                <button
                  type="button"
                  className="bg-white rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
                  onClick={(e) => {
                    e.stopPropagation()
                    setLanguageDropdownOpen(!languageDropdownOpen)
                  }}
                >
                  <MenuIcons.Globe />
                  <span className="ml-2 text-sm font-medium text-gray-700">
                    {currentLocale.toUpperCase()}
                  </span>
                </button>

                {languageDropdownOpen && (
                  <div 
                    className="origin-top-right absolute right-0 mt-2 w-32 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="py-1">
                      <button
                        onClick={() => handleLanguageChange('es')}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          currentLocale === 'es' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Español
                      </button>
                      <button
                        onClick={() => handleLanguageChange('en')}
                        className={`block w-full text-left px-4 py-2 text-sm ${
                          currentLocale === 'en' ? 'bg-gray-100 text-gray-900' : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        English
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Información del usuario */}
              <div className="ml-3 relative">
                <div className="flex items-center">
                  <span className="text-sm font-medium text-gray-700">
                    {t('hello')}, {user?.displayName || user?.email?.split('@')[0] || 'Usuario'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Contenido de la página */}
        <main className="flex-1">
          {children}
        </main>
      </div>
    </div>
  )
} 