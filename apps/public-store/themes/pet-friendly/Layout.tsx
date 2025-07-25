'use client'

import './styles.css'
import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ThemeLayoutProps } from "../theme-component"
import Image from 'next/image'
import { searchProducts, getSearchSuggestions, PublicProduct } from '../../lib/products'
import { useStore } from '../../lib/store-context'
import { useCart } from '../../lib/cart-context'
import { getCurrencySymbol } from '../../lib/store'
import Cart from '../../components/cart/Cart'

// Iconos específicos para tema pet-friendly
const PetIcons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
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
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Paw: () => (
    <svg className="w-full h-full" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM7 8.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm10 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM12 24c-2.7 0-4.9-2.2-4.9-4.9 0-1.6.8-3.1 2.2-4 .2-.1.5-.2.7-.2s.5.1.7.2c1.4.9 2.2 2.4 2.2 4 0 2.7-2.2 4.9-4.9 4.9z"/>
    </svg>
  ),
  Phone: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
    </svg>
  ),
  Mail: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  ),
  MapPin: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7-7 7" />
    </svg>
  ),
  Facebook: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 00-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"/>
    </svg>
  ),
  Instagram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
    </svg>
  ),
  TikTok: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 00-1-.08A6.34 6.34 0 003 15.66a6.34 6.34 0 0010.86 4.44l.13-.19v-8.8a8.16 8.16 0 005.69 2.24l.01-3.46a4.85 4.85 0 01-1.33-.466c.086.057.168.118.247.182z"/>
    </svg>
  ),
}

export default function PetFriendlyLayout({ tienda, categorias = [], children }: ThemeLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { state: cartState, toggleCart } = useCart()
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

  // Separar categorías padre de subcategorías
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

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Cerrar menú móvil cuando cambie la ruta
  useEffect(() => {
    setMobileMenuOpen(false)
    setMobileSearchOpen(false)
  }, [pathname])

  // Click outside para cerrar búsqueda
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Funciones de búsqueda
  const handleSearchChange = async (value: string) => {
    setSearchQuery(value)
    
    if (value.length === 0) {
      setSearchResults([])
      setShowSuggestions(false)
      setIsSearching(false)
      return
    }
    
    if (value.length < 2) {
      setShowSuggestions(false)
      return
    }

    setIsSearching(true)
    setShowSuggestions(true)

    // Debounce
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const results = await searchProducts(tienda?.id || '', value, 5)
        setSearchResults(results)
      } catch (error) {
        console.error('Error searching products:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }, 300)
  }

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      nextRouter.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
      setSearchOpen(false)
      setMobileSearchOpen(false)
      setShowSuggestions(false)
    }
  }

  const handleProductNavigation = (productSlug: string) => {
    setSearchOpen(false)
    setShowSuggestions(false)
    nextRouter.push(`/${productSlug}`)
  }

  const handleMobileProductNavigation = (productSlug: string) => {
    setMobileSearchOpen(false)
    nextRouter.push(`/${productSlug}`)
  }

  return (
    <div className="pet-theme-layout min-h-screen bg-gray-50">
      {/* Header */}
      <header className={`pet-header fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/98 backdrop-blur-lg shadow-lg border-b border-orange-100' 
          : 'bg-white/95 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3 hover:scale-105 transition-transform duration-200">
                {/* Logo desktop con fondo */}
                <div className="hidden md:flex w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl items-center justify-center shadow-lg">
                  {tienda?.logoUrl ? (
                    <img 
                      src={tienda.logoUrl} 
                      alt={tienda.storeName}
                      className="w-8 h-8 object-contain"
                    />
                  ) : (
                    <PetIcons.Paw />
                  )}
                </div>
                {/* Versión móvil del logo sin fondo */}
                <div className="flex md:hidden w-10 h-10 items-center justify-center">
                  {tienda?.logoUrl ? (
                    <img 
                      src={tienda.logoUrl} 
                      alt={tienda.storeName}
                      className="w-10 h-10 object-contain rounded-xl"
                    />
                  ) : (
                    <div className="w-8 h-8 text-orange-500">
                      <PetIcons.Paw />
                    </div>
                  )}
                </div>
                {/* Nombre de la tienda */}
                <div className="flex flex-col">
                  <span className="text-lg font-bold text-gray-900 tracking-tight">
                    {tienda?.storeName || 'Pet Store'}
                  </span>
                  <div className="hidden sm:block text-xs text-orange-600 font-medium">
                    Todo para tu mascota 🐾
                  </div>
                </div>
              </Link>
            </div>

            {/* Navegación principal - Desktop */}
            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className={`pet-nav-link font-semibold text-sm transition-colors duration-200 ${
                  pathname === '/' 
                    ? 'text-orange-600 border-b-2 border-orange-600' 
                    : 'text-gray-700 hover:text-orange-600'
                }`}
              >
                Inicio
              </Link>
              
              {categories.slice(0, 4).map((category) => (
                <div 
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => category.hasSubcategories && setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <Link
                    href={category.href}
                    className="pet-nav-link font-semibold text-sm text-gray-700 hover:text-orange-600 transition-colors duration-200 flex items-center"
                  >
                    {category.name}
                    {category.hasSubcategories && (
                      <PetIcons.ChevronDown />
                    )}
                  </Link>
                  
                  {/* Dropdown de subcategorías */}
                  {category.hasSubcategories && hoveredCategory === category.id && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
                      {subcategoriesByParent[category.id]?.map((subcategory) => (
                        <Link
                          key={subcategory.id}
                          href={`/categoria/${subcategory.slug}`}
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          {subcategory.name}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Acciones del header */}
            <div className="flex items-center space-x-4">
              {/* Búsqueda - Desktop */}
              <div className="hidden md:block relative" ref={searchRef}>
                <button
                  onClick={() => setSearchOpen(!searchOpen)}
                  className="pet-icon-btn p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
                >
                  <PetIcons.Search />
                </button>
                
                {/* Dropdown de búsqueda */}
                {searchOpen && (
                  <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 z-50">
                    <form onSubmit={handleSearchSubmit} className="p-4">
                      <div className="relative">
                        <input
                          ref={searchInputRef}
                          type="text"
                          placeholder="Buscar productos..."
                          value={searchQuery}
                          onChange={(e) => handleSearchChange(e.target.value)}
                          className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          autoFocus
                        />
                        <button
                          type="submit"
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600"
                        >
                          <PetIcons.Search />
                        </button>
                      </div>
                    </form>
                    
                    {/* Resultados de búsqueda */}
                    {showSuggestions && (
                      <div className="border-t border-gray-100 max-h-64 overflow-y-auto">
                        {isSearching ? (
                          <div className="p-4 text-center text-gray-500">
                            Buscando productos...
                          </div>
                        ) : searchResults.length > 0 ? (
                          <div className="p-2 space-y-1">
                            {searchResults.map((product) => (
                              <button
                                key={product.id}
                                onClick={() => handleProductNavigation(product.slug || `producto-${product.id}`)}
                                className="w-full flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors text-left"
                              >
                                <div className="w-12 h-12 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                                  <img 
                                    src={product.image}
                                    alt={product.name} 
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-1 min-w-0">
                                  <h4 className="text-sm font-medium text-gray-900 truncate">{product.name}</h4>
                                  <p className="text-sm text-orange-600 font-semibold">
                                    {getCurrencySymbol(tienda?.currency || 'USD')}{product.price}
                                  </p>
                                </div>
                              </button>
                            ))}
                          </div>
                        ) : searchQuery.length >= 2 ? (
                          <div className="p-4 text-center text-gray-500">
                            No se encontraron productos
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Favoritos */}
              <Link
                href="/favoritos"
                className="hidden md:flex pet-icon-btn p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
              >
                <PetIcons.Heart />
              </Link>

              {/* Carrito */}
              <button
                onClick={toggleCart}
                className="pet-cart-btn relative p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
              >
                <PetIcons.ShoppingBag />
                {cartState.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-orange-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                    {cartState.totalItems}
                  </span>
                )}
              </button>

              {/* Cuenta */}
              <Link
                href="/mi-cuenta"
                className="hidden md:flex pet-icon-btn p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
              >
                <PetIcons.User />
              </Link>

              {/* Menú móvil toggle */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden pet-icon-btn p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
              >
                {mobileMenuOpen ? <PetIcons.Close /> : <PetIcons.Menu />}
              </button>
            </div>
          </div>
        </div>

        {/* Búsqueda móvil */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-gray-100 bg-white p-4">
            <form onSubmit={handleSearchSubmit}>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-orange-500"
                  autoFocus
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                >
                  <PetIcons.Search />
                </button>
              </div>
            </form>
            
            {/* Resultados móviles */}
            {showSuggestions && searchResults.length > 0 && (
              <div className="mt-4 space-y-2">
                {searchResults.map((product) => (
                  <button
                    key={product.id}
                    onClick={() => handleMobileProductNavigation(product.slug || `producto-${product.id}`)}
                    className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl text-left"
                  >
                    <div className="w-16 h-16 bg-gray-200 rounded-lg overflow-hidden">
                      <img 
                        src={product.image}
                        alt={product.name} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{product.name}</h4>
                      <p className="text-lg font-semibold text-orange-600">
                        {getCurrencySymbol(tienda?.currency || 'USD')}{product.price}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </header>

      {/* Overlay para menú móvil */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Modal de Búsqueda Móvil - Pantalla Completa */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-[9999] md:hidden">
          {/* Overlay con transición de opacidad */}
          <div 
            className={`fixed inset-0 bg-black/20 backdrop-blur-sm transition-all duration-300 ease-out ${
              mobileSearchOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setMobileSearchOpen(false)}
          />
          
          {/* Modal con transición de deslizamiento */}
          <div className={`fixed inset-0 bg-white transform transition-all duration-300 ease-out ${
            mobileSearchOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-full'
          }`}>
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white">
              <h2 className="text-lg font-bold text-gray-900">Buscar</h2>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-xl transition-all duration-200"
              >
                <PetIcons.Close />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="p-4 h-full overflow-y-auto pb-20">
              {/* Barra de búsqueda */}
              <div className="relative mb-6">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar productos para tu mascota..."
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearchSubmit(e)}
                  className="w-full pl-10 pr-10 py-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-lg"
                  autoFocus
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  <PetIcons.Search />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('')
                      setSearchResults([])
                      setShowSuggestions(false)
                    }}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-orange-600 transition-colors"
                  >
                    <PetIcons.Close />
                  </button>
                )}
              </div>

              {/* Contenido cuando no hay búsqueda */}
              {!searchQuery && (
                <div className="space-y-6">
                  {/* Historial de búsqueda */}
                  {searchHistory.length > 0 && (
                    <div className="animate-fade-in">
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🕒</span>
                        <span>Búsquedas recientes</span>
                      </h3>
                      <div className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(item)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-xl text-gray-700 transition-colors flex items-center justify-between"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <span>{item}</span>
                            <span className="text-gray-400">↗</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Sugerencias populares */}
                  {searchSuggestions.length > 0 && (
                    <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
                      <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                        <span className="mr-2">🔥</span>
                        <span>Búsquedas populares</span>
                      </h3>
                      <div className="space-y-2">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => setSearchQuery(suggestion)}
                            className="w-full text-left px-4 py-3 hover:bg-orange-50 rounded-xl text-gray-700 transition-colors flex items-center justify-between"
                            style={{ animationDelay: `${(index + 3) * 50}ms` }}
                          >
                            <span>{suggestion}</span>
                            <span className="text-gray-400">↗</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categorías rápidas */}
                  <div className="animate-fade-in" style={{ animationDelay: '200ms' }}>
                    <h3 className="text-sm font-bold text-gray-900 mb-3 flex items-center">
                      <span className="mr-2">🐾</span>
                      <span>Categorías</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {categories.slice(0, 6).map((category, index) => (
                        <button
                          key={category.id}
                          onClick={() => {
                            setMobileSearchOpen(false)
                            nextRouter.push(category.href)
                          }}
                          className="p-4 bg-gradient-to-br from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl text-gray-800 text-sm font-medium transition-all duration-200 text-center transform hover:scale-105"
                          style={{ animationDelay: `${(index + 6) * 50}ms` }}
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Resultados de búsqueda */}
              {showSuggestions && (
                <div className="animate-fade-in">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      <span className="ml-3 text-gray-600">Buscando productos...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <h3 className="text-sm font-bold text-gray-900 mb-4">
                        Resultados ({searchResults.length})
                      </h3>
                      <div className="space-y-3">
                        {searchResults.map((product, index) => (
                          <button
                            key={product.id}
                            onClick={() => handleMobileProductNavigation(product.slug || `producto-${product.id}`)}
                            className="w-full flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-xl hover:border-orange-200 hover:bg-orange-50 transition-all duration-200 text-left transform hover:scale-[1.02]"
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                            <div className="w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                              <img 
                                src={product.image}
                                alt={product.name} 
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-gray-900 truncate mb-1">{product.name}</h4>
                              <p className="text-lg font-bold text-orange-600">
                                {getCurrencySymbol(tienda?.currency || 'USD')}{product.price}
                              </p>
                            </div>
                            <div className="text-orange-500">
                              <PetIcons.ArrowRight />
                            </div>
                          </button>
                        ))}
                      </div>

                      <button 
                        onClick={() => {
                          setMobileSearchOpen(false)
                          nextRouter.push(`/buscar?q=${encodeURIComponent(searchQuery.trim())}`)
                        }}
                        className="mt-6 w-full py-4 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-bold text-lg transform hover:scale-105"
                      >
                        Ver todos los resultados
                      </button>
                    </>
                  ) : searchQuery.length >= 2 && !isSearching ? (
                    <div className="text-center py-12 animate-fade-in">
                      <div className="text-6xl mb-4">🐾</div>
                      <p className="text-gray-500 text-lg">No se encontraron productos para "{searchQuery}"</p>
                      <p className="text-gray-400 text-sm mt-2">Intenta con otro término de búsqueda</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menú móvil */}
      <div className={`pet-mobile-menu fixed right-0 top-0 h-full w-80 max-w-sm bg-white shadow-2xl transform transition-transform duration-300 ease-out z-50 md:hidden ${
        mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-orange-500 to-orange-600">
          <span className="text-lg font-bold text-white">Menú</span>
          <button
            onClick={() => setMobileMenuOpen(false)}
            className="p-2 text-white hover:bg-white/20 rounded-lg transition-colors"
          >
            <PetIcons.Close />
          </button>
        </div>
        
        <div className="p-4">
          {/* Búsqueda móvil */}
          <button
            onClick={() => {
              setMobileSearchOpen(true)
              setMobileMenuOpen(false)
            }}
            className="w-full flex items-center space-x-3 p-3 bg-gray-50 rounded-xl mb-4 text-left hover:bg-gray-100 transition-colors"
          >
            <PetIcons.Search />
            <span className="text-gray-600">Buscar productos...</span>
          </button>
          
          {/* Navegación */}
          <nav className="space-y-2">
            <Link
              href="/"
              className="block py-3 px-4 text-gray-900 font-medium rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              🏠 Inicio
            </Link>
            
            {categories.map((category) => (
              <Link
                key={category.id}
                href={category.href}
                className="block py-3 px-4 text-gray-900 font-medium rounded-lg hover:bg-orange-50 hover:text-orange-600 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
            ))}
          </nav>
          
          {/* Enlaces adicionales */}
          <div className="pt-6 mt-6 border-t border-gray-100 space-y-2">
            <Link 
              href="/favoritos" 
              className="flex items-center space-x-3 py-3 px-4 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PetIcons.Heart />
              <span>Mis Favoritos</span>
            </Link>
            <Link 
              href="/mi-cuenta" 
              className="flex items-center space-x-3 py-3 px-4 text-gray-600 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              <PetIcons.User />
              <span>Mi Cuenta</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="pet-main-content bg-gray-50">
        {children}
      </main>

      {/* Carrito */}
      <Cart />

      {/* Footer */}
      <footer className="pet-footer bg-gradient-to-br from-gray-900 to-gray-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          
          {/* Contenido principal del footer */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            
            {/* Información de la tienda */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-400 to-orange-600 rounded-xl flex items-center justify-center">
                  <PetIcons.Paw />
                </div>
                <span className="text-xl font-bold">
                  {tienda?.storeName || 'Pet Store'}
                </span>
              </div>
              <p className="text-gray-300 leading-relaxed">
                {tienda?.description || 'Todo lo que tu mascota necesita en un solo lugar. Calidad, amor y cuidado garantizado.'}
              </p>
              
              {/* Información de contacto */}
              <div className="space-y-2">
                {tienda?.phone && (
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <PetIcons.Phone />
                    <span>{tienda.phone}</span>
                  </div>
                )}
                {tienda?.emailStore && (
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <PetIcons.Mail />
                    <span>{tienda.emailStore}</span>
                  </div>
                )}
                {tienda?.address && (
                  <div className="flex items-center space-x-2 text-sm text-gray-300">
                    <PetIcons.MapPin />
                    <span>{tienda.address}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Navegación rápida */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-orange-400">Navegación</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/" className="text-gray-300 hover:text-orange-400 transition-colors">
                    Inicio
                  </Link>
                </li>
                {categories.slice(0, 5).map((category) => (
                  <li key={category.id}>
                    <Link href={category.href} className="text-gray-300 hover:text-orange-400 transition-colors">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Atención al cliente */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-orange-400">Ayuda</h3>
              <ul className="space-y-2">
                <li>
                  <Link href="/mi-cuenta" className="text-gray-300 hover:text-orange-400 transition-colors">
                    Mi Cuenta
                  </Link>
                </li>
                <li>
                  <Link href="/favoritos" className="text-gray-300 hover:text-orange-400 transition-colors">
                    Favoritos
                  </Link>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                    Envíos y Devoluciones
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                    Preguntas Frecuentes
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-300 hover:text-orange-400 transition-colors">
                    Contacto
                  </a>
                </li>
              </ul>
            </div>

            {/* Newsletter y redes sociales */}
            <div>
              <h3 className="text-lg font-bold mb-4 text-orange-400">Mantente conectado</h3>
              <p className="text-gray-300 text-sm mb-4">
                Recibe ofertas especiales y consejos para el cuidado de tu mascota
              </p>
              
              {/* Newsletter */}
              <div className="space-y-3">
                <div className="flex">
                  <input
                    type="email"
                    placeholder="tu@email.com"
                    className="flex-1 px-3 py-2 bg-gray-800 border border-gray-600 rounded-l-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                  />
                  <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 rounded-r-lg transition-colors">
                    ✓
                  </button>
                </div>
                
                {/* Redes sociales */}
                <div className="flex space-x-3 pt-4">
                  {tienda?.socialMedia?.instagram && (
                    <a
                      href={tienda.socialMedia.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-700 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <PetIcons.Instagram />
                    </a>
                  )}
                  {tienda?.socialMedia?.facebook && (
                    <a
                      href={tienda.socialMedia.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-700 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <PetIcons.Facebook />
                    </a>
                  )}
                  {tienda?.socialMedia?.whatsapp && (
                    <a
                      href={`https://wa.me/${tienda.socialMedia.whatsapp}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-700 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <PetIcons.WhatsApp />
                    </a>
                  )}
                  {tienda?.socialMedia?.tiktok && (
                    <a
                      href={tienda.socialMedia.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 bg-gray-700 hover:bg-orange-500 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-110"
                    >
                      <PetIcons.TikTok />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Línea divisoria y copyright */}
          <div className="border-t border-gray-700 pt-8 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 {tienda?.storeName || 'Pet Store'}. Hecho con ❤️ para las mascotas.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                Privacidad
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                Términos
              </a>
              <a href="#" className="text-gray-400 hover:text-orange-400 transition-colors text-sm">
                Cookies
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 