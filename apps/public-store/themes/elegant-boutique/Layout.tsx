'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeLayoutProps } from "../theme-component"
import Image from 'next/image'
import { searchProducts, getSearchSuggestions, PublicProduct } from '../../lib/products'
import { useStore } from '../../lib/store-context'
import { useCart } from '../../lib/cart-context'
import { getCurrencySymbol } from '../../lib/store'
import ElegantBoutiqueCart from './Cart'
import CheckoutModal from '../../components/checkout/CheckoutModal'
import NewsletterForm from './NewsletterForm'
import './styles.css'

// Iconos elegantes para el header
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 10.5V6a3.75 3.75 0 10-7.5 0v4.5m11.356-1.993l1.263 12c.07.665-.45 1.243-1.119 1.243H4.25a1.125 1.125 0 01-1.12-1.243l1.264-12A1.125 1.125 0 015.513 7.5h12.974c.576 0 1.059.435 1.119 1.007zM8.625 10.5a.375.375 0 11-.75 0 .375.375 0 01.75 0zm7.5 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 015.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 003 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 005.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 009.568 3z" />
    </svg>
  ),
  Diamond: () => (
    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
}

export default function ElegantBoutiqueLayout({ tienda, categorias = [], children }: ThemeLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { state: cartState, toggleCart, closeCheckout } = useCart()
  const pathname = usePathname()
  const nextRouter = useRouter()

  // Estados para búsqueda
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<PublicProduct[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [isSearching, setIsSearching] = useState(false)

  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([])
  const [searchHistory, setSearchHistory] = useState<string[]>([])
  
  // Estados para navegación jerárquica
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null)
  
  const searchRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const searchTimeoutRef = useRef<NodeJS.Timeout>()

  // Separar categorías padre de subcategorías (conservando orden)
  const parentCategories = categorias.filter(cat => !cat.parentCategoryId)
  const subcategoriesByParent = categorias.reduce((acc, cat) => {
    if (cat.parentCategoryId) {
      if (!acc[cat.parentCategoryId]) {
        acc[cat.parentCategoryId] = []
      }
      acc[cat.parentCategoryId].push(cat)
    }
    return acc
  }, {} as Record<string, typeof categorias>)
  
  // Ordenar subcategorías por order dentro de cada categoría padre
  Object.keys(subcategoriesByParent).forEach(parentId => {
    subcategoriesByParent[parentId].sort((a, b) => {
      const orderA = a.order ?? 999999
      const orderB = b.order ?? 999999
      return orderA - orderB
    })
  })

  // Usar solo categorías padre para la navegación principal
  const categories = parentCategories.length > 0 
    ? parentCategories.map(cat => ({ 
        id: cat.id,
        name: cat.name, 
        slug: cat.slug,
        href: `/categoria/${cat.slug}`,
        hasSubcategories: subcategoriesByParent[cat.id]?.length > 0
      }))
    : []

  // Efecto para detectar scroll y cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cargar sugerencias de búsqueda al montar el componente
  useEffect(() => {
    const loadSearchSuggestions = async () => {
      if (tienda?.id) {
        try {
          const suggestions = await getSearchSuggestions(tienda.id)
          setSearchSuggestions(suggestions)
        } catch (error) {
          console.error('Error loading search suggestions:', error)
        }
      }
    }

    loadSearchSuggestions()

    // Cargar historial de búsqueda del localStorage
    const savedHistory = localStorage.getItem('searchHistory')
    if (savedHistory) {
      try {
        setSearchHistory(JSON.parse(savedHistory))
      } catch (error) {
        console.error('Error parsing search history:', error)
      }
    }
  }, [tienda?.id])

  // Efecto para cerrar búsqueda al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (mobileSearchOpen) return
      
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileSearchOpen])

  // Efecto para cerrar búsqueda cuando cambia la ruta (navegación completada)
  useEffect(() => {
    const handleRouteChange = () => {
      setSearchOpen(false)
      setMobileSearchOpen(false)
      setShowSuggestions(false)
    }

    // Cerrar búsqueda cuando la ruta cambia
    handleRouteChange()
  }, [pathname])

  // Función para manejar la búsqueda con debounce
  const handleSearch = async (query: string) => {
    setSearchQuery(query)
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    if (query.length === 0) {
      setSearchResults([])
      setShowSuggestions(false)
      setIsSearching(false)
      return
    }

    if (query.length < 2) {
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    setShowSuggestions(true)

    // Debounce search
    searchTimeoutRef.current = setTimeout(async () => {
      if (tienda?.id) {
        try {
          const results = await searchProducts(tienda.id, query, 5)
          setSearchResults(results)
          setIsSearching(false)
        } catch (error) {
          console.error('Error searching products:', error)
          setSearchResults([])
          setIsSearching(false)
        }
      }
    }, 300)
  }

  // Función para ejecutar búsqueda y guardar en historial
  const executeSearch = (query: string) => {
    if (query.trim()) {
      // Agregar al historial
      const newHistory = [query, ...searchHistory.filter(item => item !== query)].slice(0, 5)
      setSearchHistory(newHistory)
      localStorage.setItem('searchHistory', JSON.stringify(newHistory))
      
      // Ejecutar búsqueda para mostrar productos dinámicamente
      handleSearch(query)
    }
  }

  // Función para abrir búsqueda en desktop
  const openDesktopSearch = () => {
    setSearchOpen(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // Función para abrir búsqueda en móvil
  const openMobileSearch = () => {
    setMobileSearchOpen(true)
    setTimeout(() => {
      searchInputRef.current?.focus()
    }, 100)
  }

  // Función para limpiar búsqueda
  const clearSearch = () => {
    setSearchQuery('')
    setSearchResults([])
    setShowSuggestions(false)
    setIsSearching(false)
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }
  }

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled 
          ? 'backdrop-blur-lg shadow-lg' 
          : 'backdrop-blur-sm'
      }`} style={{ 
        backgroundColor: isScrolled 
          ? 'rgba(var(--theme-neutral-light), 0.95)' 
          : 'rgba(var(--theme-neutral-light), 0.90)'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header principal más alto */}
          <div className="flex items-center h-24">
            
            {/* DESKTOP LAYOUT */}
            <div className="hidden md:flex items-center justify-between w-full">
              {/* Acciones izquierda - Desktop */}
              <div className="flex items-center space-x-6">
                <button 
                  onClick={openDesktopSearch}
                  className="p-2 hover-elegant"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  <Icons.Search />
                </button>
                <Link href="/favoritos" className="p-2 hover-elegant" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  <Icons.Heart />
                </Link>
              </div>

              {/* Logo centrado - Desktop */}
              <div className="flex-shrink-0 absolute left-1/2 transform -translate-x-1/2">
                <Link href="/" className="flex items-center space-x-3 hover-elegant">
                  {tienda?.logoUrl ? (
                    <div className="w-12 h-12 relative logo-boutique">
                      <Image
                        src={tienda.logoUrl}
                        alt={`${tienda.storeName} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-12 h-12 logo-boutique flex items-center justify-center"
                      style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                    >
                      <span 
                        className="text-xl font-bold text-serif"
                        style={{ color: 'rgb(var(--theme-neutral-light))' }}
                      >
                        {tienda?.storeName?.charAt(0) || 'S'}
                      </span>
                    </div>
                  )}
                  <span 
                    className="text-xl font-medium text-serif tracking-wide"
                    style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                  >
                    {tienda?.storeName || 'Elegant Boutique'}
                  </span>
                </Link>
              </div>

              {/* Acciones derecha - Desktop */}
              <div className="flex items-center space-x-4">
                <Link href="/mi-cuenta" className="p-2 hover-elegant" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                  <Icons.User />
                </Link>
                <button 
                  onClick={toggleCart}
                  className="relative p-2 hover-elegant"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  <Icons.ShoppingBag />
                  {cartState.totalItems > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center font-medium"
                      style={{ 
                        backgroundColor: 'rgb(var(--theme-accent))', 
                        color: 'rgb(var(--theme-neutral-light))' 
                      }}
                    >
                      {cartState.totalItems}
                    </span>
                  )}
                </button>
              </div>
            </div>

            {/* MOBILE LAYOUT - Logo, nombre, lupa, carrito, menú */}
            <div className="md:hidden flex items-center justify-between w-full">
              {/* Logo y nombre - Móvil */}
              <Link href="/" className="flex items-center space-x-2 hover-elegant flex-shrink-0">
                {tienda?.logoUrl ? (
                  <div className="w-8 h-8 relative logo-boutique">
                    <Image
                      src={tienda.logoUrl}
                      alt={`${tienda.storeName} logo`}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-8 h-8 logo-boutique flex items-center justify-center"
                    style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                  >
                    <span 
                      className="text-sm font-bold text-serif"
                      style={{ color: 'rgb(var(--theme-neutral-light))' }}
                    >
                      {tienda?.storeName?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
                <span 
                  className="text-lg font-medium text-serif tracking-wide truncate mobile-header-logo"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  {tienda?.storeName || 'Elegant Boutique'}
                </span>
              </Link>

              {/* Acciones derecha - Móvil */}
              <div className="flex items-center space-x-1 flex-shrink-0">
                {/* Búsqueda móvil */}
                <button 
                  onClick={openMobileSearch}
                  className="p-2 hover-elegant"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  <Icons.Search />
                </button>

                {/* Carrito */}
                <button 
                  onClick={toggleCart}
                  className="relative p-2 hover-elegant"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  <Icons.ShoppingBag />
                  {cartState.totalItems > 0 && (
                    <span 
                      className="absolute -top-1 -right-1 w-5 h-5 text-xs rounded-full flex items-center justify-center font-medium"
                      style={{ 
                        backgroundColor: 'rgb(var(--theme-accent))', 
                        color: 'rgb(var(--theme-neutral-light))' 
                      }}
                    >
                      {cartState.totalItems}
                    </span>
                  )}
                </button>

                {/* Menú móvil */}
                <button
                  className="p-2 hover-elegant"
                  onClick={() => setMobileMenuOpen(true)}
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  <Icons.Menu />
                </button>
              </div>
            </div>
          </div>

          {/* Navegación principal - Desktop */}
          <nav className="hidden md:block border-t border-opacity-20 py-4" style={{ borderColor: 'rgb(var(--theme-primary))' }}>
            <div className="flex items-center justify-center space-x-12">
              {categories.map((category, index) => (
                <div key={category.id} className="relative">
                  <div className="flex items-center">
                    {index > 0 && (
                      <div className="mr-12" style={{ color: 'rgb(var(--theme-accent))' }}>
                        <Icons.Diamond />
                      </div>
                    )}
                    <div 
                      className="relative"
                      onMouseEnter={() => category.hasSubcategories && setHoveredCategory(category.id)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <Link
                        href={category.href}
                        className="nav-elegant text-sm font-medium tracking-wide text-sans transition-colors duration-300 flex items-center"
                        style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                      >
                        {category.name}
                        {category.hasSubcategories && (
                          <span className="ml-1">
                            <Icons.ChevronDown />
                          </span>
                        )}
                      </Link>
                      
                      {/* Dropdown de subcategorías */}
                      {category.hasSubcategories && hoveredCategory === category.id && (
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 pt-4 w-64 z-50">
                          <div 
                            className="rounded-sm shadow-lg border"
                            style={{ 
                              backgroundColor: 'rgb(var(--theme-neutral-light))',
                              borderColor: 'rgb(var(--theme-primary) / 0.1)',
                              boxShadow: 'var(--theme-shadow-lg)'
                            }}
                          >
                            <div className="py-3">
                              {subcategoriesByParent[category.id]?.map((subcategory) => (
                                <Link
                                  key={subcategory.id}
                                  href={`/categoria/${subcategory.slug}`}
                                  className="block px-4 py-2 text-sm transition-colors duration-300 text-sans"
                                  style={{ 
                                    color: 'rgb(var(--theme-neutral-medium))',
                                  }}
                                  onMouseEnter={(e) => {
                                    e.currentTarget.style.backgroundColor = 'rgb(var(--theme-secondary))'
                                    e.currentTarget.style.color = 'rgb(var(--theme-neutral-dark))'
                                  }}
                                  onMouseLeave={(e) => {
                                    e.currentTarget.style.backgroundColor = 'transparent'
                                    e.currentTarget.style.color = 'rgb(var(--theme-neutral-medium))'
                                  }}
                                >
                                  {subcategory.name}
                                </Link>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </nav>
        </div>

        {/* Búsqueda Desktop Dropdown */}
        <div ref={searchRef} className={`hidden md:block absolute top-full left-0 right-0 border-t transition-all duration-300 ease-out ${
          searchOpen 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform -translate-y-4 pointer-events-none'
        }`} style={{ 
          backgroundColor: 'rgb(var(--theme-neutral-light))',
          borderColor: 'rgb(var(--theme-primary) / 0.1)',
          backdropFilter: 'blur(20px)',
          boxShadow: '0 8px 32px rgba(78, 70, 65, 0.15)'
        }}>
          <div className="max-w-2xl mx-auto px-4 py-8">
            {/* Barra de búsqueda */}
            <div className="relative">
              <div className="relative">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar productos elegantes..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                  className="input-boutique-search text-lg py-4"
                />
                <div className="absolute left-4 top-1/2 transform -translate-y-1/2" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  <Icons.Search />
                </div>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 hover-elegant"
                    style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                  >
                    <Icons.X />
                  </button>
                )}
              </div>
            </div>

            {/* Contenido de búsqueda */}
            {!searchQuery && (
              <div className="mt-8 space-y-6">
                {/* Historial de búsqueda */}
                {searchHistory.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      <Icons.Clock />
                      <span className="ml-2">Búsquedas recientes</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {searchHistory.map((item, index) => (
                        <button
                          key={index}
                          onClick={() => executeSearch(item)}
                          className="btn-boutique-secondary text-sm"
                        >
                          {item}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Sugerencias populares */}
                {searchSuggestions.length > 0 && (
                  <div>
                    <h3 className="text-sm font-medium mb-3 flex items-center text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      <Icons.TrendingUp />
                      <span className="ml-2">Tendencias</span>
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {searchSuggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => executeSearch(suggestion)}
                          className="btn-boutique-outline text-sm"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Resultados de búsqueda */}
            {showSuggestions && (
              <div className="mt-8">
                {isSearching ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="shimmer-elegant w-8 h-8 rounded-full"></div>
                    <span className="ml-3 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>Buscando...</span>
                  </div>
                ) : searchResults.length > 0 ? (
                  <>
                    <h3 className="text-sm font-medium mb-4 text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                      Resultados ({searchResults.length})
                    </h3>
                    <div className="space-y-3">
                      {searchResults.map((product) => (
                        <Link 
                          key={product.id} 
                          href={`/${product.slug}`}
                          className="flex items-center space-x-4 p-3 rounded-sm hover-elegant transition-colors"
                          style={{ backgroundColor: 'rgba(var(--theme-secondary), 0.5)' }}
                        >
                          <div className="w-16 h-16 rounded-sm overflow-hidden" style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
                            <img 
                              src={product.image.includes('.mp4') || product.image.includes('.webm') || product.image.includes('.mov') 
                                ? product.image.replace(/\.(mp4|webm|mov)$/, '.jpg')
                                : product.image}
                              alt={product.name} 
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>{product.name}</h4>
                          </div>
                          <div className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-accent))' }}>
                            {getCurrencySymbol(tienda?.currency || 'USD')}{product.price}
                          </div>
                        </Link>
                      ))}
                    </div>
                    <button 
                      onClick={() => {
                        // Cerrar búsqueda y navegar a home con query
                        setSearchOpen(false)
                        setMobileSearchOpen(false)
                        nextRouter.push(`/?search=${encodeURIComponent(searchQuery)}`)
                      }}
                      className="mt-4 w-full btn-boutique-primary"
                    >
                      Ver todos los resultados
                    </button>
                  </>
                ) : searchQuery.length >= 2 && !isSearching ? (
                  <div className="text-center py-8">
                    <p className="text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      No se encontraron productos para "{searchQuery}"
                    </p>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Búsqueda Mobile Modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          <div className="fixed inset-0" style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
              <h2 className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>Buscar</h2>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 hover-elegant"
                style={{ color: 'rgb(var(--theme-neutral-medium))' }}
              >
                <Icons.Close />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4">
              {/* Barra de búsqueda */}
              <div className="relative mb-6">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                  className="input-boutique-search-mobile"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  <Icons.Search />
                </div>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 hover-elegant"
                    style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                  >
                    <Icons.X />
                  </button>
                )}
              </div>

              {/* Contenido de búsqueda móvil */}
              {!searchQuery && (
                <div className="space-y-6">
                  {/* Historial de búsqueda */}
                  {searchHistory.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                        <Icons.Clock />
                        <span className="ml-2">Búsquedas recientes</span>
                      </h3>
                      <div className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => executeSearch(item)}
                            className="w-full text-left px-3 py-2 rounded-sm hover-elegant transition-colors text-sans"
                            style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                          >
                            {item}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sugerencias populares */}
                  {searchSuggestions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium mb-3 flex items-center text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
                        <Icons.TrendingUp />
                        <span className="ml-2">Sugerencias</span>
                      </h3>
                      <div className="space-y-2">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => executeSearch(suggestion)}
                            className="w-full text-left px-3 py-2 rounded-sm hover-elegant transition-colors text-sans"
                            style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Resultados de búsqueda móvil */}
              {showSuggestions && (
                <div>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="shimmer-elegant w-8 h-8 rounded-full"></div>
                      <span className="ml-3 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>Buscando...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <h3 className="text-sm font-medium mb-3 text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>Resultados ({searchResults.length})</h3>
                      <div className="space-y-3">
                        {searchResults.map((product) => (
                          <Link 
                            key={product.id} 
                            href={`/${product.slug}`}
                            className="flex items-center space-x-3 p-3 rounded-sm hover-elegant transition-colors"
                            style={{ backgroundColor: 'rgba(var(--theme-secondary), 0.5)' }}
                          >
                            <div className="w-16 h-16 rounded-sm overflow-hidden" style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
                              <img 
                                src={product.image.includes('.mp4') || product.image.includes('.webm') || product.image.includes('.mov') 
                                  ? product.image.replace(/\.(mp4|webm|mov)$/, '.jpg')
                                  : product.image}
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>{product.name}</h4>
                              <p className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-accent))' }}>{getCurrencySymbol(tienda?.currency || 'USD')}{product.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button 
                        onClick={() => {
                          // Cerrar búsqueda y navegar a home con query
                          setSearchOpen(false)
                          setMobileSearchOpen(false)
                          nextRouter.push(`/?search=${encodeURIComponent(searchQuery)}`)
                        }}
                        className="mt-4 w-full btn-boutique-primary"
                      >
                        Ver todos los resultados
                      </button>
                    </>
                  ) : searchQuery.length >= 2 && !isSearching ? (
                    <div className="text-center py-8">
                      <p className="text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>No se encontraron productos para "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menú móvil */}
      <div className={`fixed inset-0 z-[60] md:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-50' : 'opacity-0'
          }`}
          style={{ backgroundColor: 'rgb(var(--theme-neutral-dark))' }}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Panel del menú */}
        <div className={`fixed right-0 top-0 h-full w-80 max-w-sm transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`} style={{ 
          backgroundColor: 'rgb(var(--theme-neutral-light))',
          boxShadow: 'var(--theme-shadow-lg)'
        }}>
          <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
            <span className="text-lg font-medium text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>Menú</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 hover-elegant"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              <Icons.Close />
            </button>
          </div>
          
          <nav className="px-4 py-6 space-y-4">
            {categories.map((category) => (
              <Link
                key={category.name}
                href={category.href}
                className="block py-3 font-medium text-sans border-b transition-colors duration-300"
                style={{ 
                  color: 'rgb(var(--theme-neutral-dark))',
                  borderColor: 'rgb(var(--theme-primary) / 0.1)'
                }}
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
          
          <div className="px-4 py-6 border-t space-y-4" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
            <Link href="/mi-cuenta" className="flex items-center space-x-3 py-2 hover-elegant" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
              <Icons.User />
              <span className="text-sans">Mi cuenta</span>
            </Link>
            <Link href="/favoritos" className="flex items-center space-x-3 py-2 hover-elegant" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
              <Icons.Heart />
              <span className="text-sans">Favoritos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="animate-fadeInUp flex-1" style={{ paddingTop: '6rem' /* Ajustado para reducir espacio */ }}>
        {children}
      </main>

      {/* Carrito */}
      <ElegantBoutiqueCart />

      {/* Footer */}
      <footer className="border-t mt-auto" style={{ 
        backgroundColor: 'rgb(var(--theme-secondary))', 
        borderColor: 'rgb(var(--theme-primary) / 0.1)' 
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '2rem 1rem' }}>
          {/* Separador elegante */}
          <div className="separator-elegant mb-6 md:mb-12"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Información de la tienda */}
            <div className="space-y-6">
              <div className="flex flex-col items-start space-y-3">
                <div className="flex items-center space-x-3">
                  {tienda?.logoUrl ? (
                    <div className="w-8 h-8 relative logo-boutique">
                      <Image
                        src={tienda.logoUrl}
                        alt={`${tienda.storeName} logo`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  ) : (
                    <div 
                      className="w-8 h-8 logo-boutique flex items-center justify-center"
                      style={{ backgroundColor: 'rgb(var(--theme-primary))' }}
                    >
                      <span 
                        className="text-white font-bold text-sm text-serif"
                      >
                        {tienda?.storeName?.charAt(0) || 'S'}
                      </span>
                    </div>
                  )}
                  <span 
                    className="text-xl font-medium text-serif"
                    style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                  >
                    {tienda?.storeName || 'Elegant Boutique'}
                  </span>
                </div>
                <p 
                  className="leading-relaxed text-sans"
                  style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                >
                  {tienda?.description || 'Descubre nuestra colección única de productos elegantes cuidadosamente seleccionados para ti.'}
                </p>
              </div>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h3 className="font-medium mb-6 text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>Navegación</h3>
              <ul className="space-y-3">
                {categories.map((category) => (
                  <li key={category.name}>
                    <Link 
                      href={category.href} 
                      className="hover-elegant transition-colors duration-300 text-sans"
                      style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                    >
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Atención al cliente */}
            <div>
              <h3 className="font-medium mb-6 text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>Atención</h3>
              <ul className="space-y-3">
                <li><a href="#" className="hover-elegant transition-colors duration-300 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>Contacto</a></li>
                <li><a href="#" className="hover-elegant transition-colors duration-300 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>Envíos</a></li>
                <li><a href="#" className="hover-elegant transition-colors duration-300 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>Devoluciones</a></li>
                <li><a href="#" className="hover-elegant transition-colors duration-300 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>FAQ</a></li>
              </ul>
            </div>

                          {/* Ubicación */}
              <div>
                <h3 className="font-medium mb-6 text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>Ubícanos</h3>
                
                {tienda?.hasPhysicalLocation ? (
                  <>
                    <p className="mb-6 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      Encuéntranos fácilmente
                    </p>
                    
                    {/* Mapa con Google Maps Embed */}
                    <div className="w-full mb-4">
                      <div 
                        className="w-full h-[150px] rounded-lg overflow-hidden"
                        style={{ 
                          backgroundColor: 'rgb(var(--theme-primary) / 0.05)',
                          border: '1px solid rgb(var(--theme-primary) / 0.1)'
                        }}
                      >
                        <iframe
                          src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyA5ZIaH3M_qB441IarTC8FvSbG2VvIwfZ4&q=-12.1209207,-77.0290177&zoom=16`}
                          width="100%"
                          height="150"
                          style={{ border: 0, borderRadius: '8px' }}
                          allowFullScreen
                          loading="lazy"
                          referrerPolicy="no-referrer-when-downgrade"
                          title="Ubicación de la tienda"
                        />
                      </div>
                    </div>
                    
                    {/* Dirección */}
                    <div className="flex items-start space-x-2">
                      <span 
                        className="text-sm mt-0.5"
                        style={{ color: 'rgb(var(--theme-primary))' }}
                      >
                        📍
                      </span>
                      <p 
                        className="text-sm text-sans leading-relaxed"
                        style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                      >
                        Av. José Larco 345, Miraflores 15074, Perú
                      </p>
                    </div>
                    
                    {/* Enlace para abrir en Google Maps */}
                    <div className="mt-3">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=-12.1209207,-77.0290177`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-sans hover-elegant transition-colors"
                        style={{ color: 'rgb(var(--theme-accent))' }}
                      >
                        Abrir en Google Maps →
                      </a>
                    </div>
                  </>
                ) : tienda?.address ? (
                  <>
                    <p className="mb-6 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      Nuestra ubicación
                    </p>
                    
                    {/* Mapa placeholder para dirección sin coordenadas */}
                    <div className="w-full mb-4">
                      <div 
                        className="w-full h-[150px] rounded-lg overflow-hidden flex items-center justify-center relative cursor-pointer"
                        style={{ 
                          backgroundColor: 'rgb(var(--theme-primary) / 0.05)',
                          border: '1px solid rgb(var(--theme-primary) / 0.1)'
                        }}
                      >
                        <div className="text-center">
                          <div className="text-4xl mb-2">🗺️</div>
                          <p 
                            className="text-sm text-sans font-medium"
                            style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                          >
                            Ver en Google Maps
                          </p>
                        </div>
                        
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tienda.address)}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="absolute inset-0 hover:bg-black hover:bg-opacity-5 transition-colors"
                          title="Ver ubicación en Google Maps"
                        />
                      </div>
                    </div>
                    
                    {/* Dirección */}
                    <div className="flex items-start space-x-2">
                      <span 
                        className="text-sm mt-0.5"
                        style={{ color: 'rgb(var(--theme-primary))' }}
                      >
                        📍
                      </span>
                      <p 
                        className="text-sm text-sans leading-relaxed"
                        style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                      >
                        {tienda.address}
                      </p>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mb-6 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                      Tienda en línea
                    </p>
                    <div 
                      className="w-full h-[150px] rounded-lg flex items-center justify-center"
                      style={{ 
                        backgroundColor: 'rgb(var(--theme-primary) / 0.05)',
                        border: '1px solid rgb(var(--theme-primary) / 0.1)'
                      }}
                    >
                      <div className="text-center">
                        <div className="text-3xl mb-2">🌐</div>
                        <p 
                          className="text-sm text-sans"
                          style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                        >
                          Disponible en línea
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </div>
          </div>
          
          <div className="mt-12 pt-8 border-t flex flex-col sm:flex-row justify-between items-center" style={{ borderColor: 'rgb(var(--theme-primary) / 0.1)' }}>
            <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
              © 2024 {tienda?.storeName || 'Elegant Boutique'}. Todos los derechos reservados.
            </p>
            <div className="flex space-x-8 mt-4 sm:mt-0">
              <a href="#" className="text-sm hover-elegant transition-colors duration-300 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                Privacidad
              </a>
              <a href="#" className="text-sm hover-elegant transition-colors duration-300 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                Términos
              </a>
            </div>
          </div>
        </div>
      </footer>

      {/* Modal de Checkout */}
      <CheckoutModal 
        isOpen={cartState.isCheckoutOpen} 
        onClose={closeCheckout} 
      />
    </div>
  )
} 