'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { ThemeLayoutProps } from "../theme-component"
import Image from 'next/image'
import { searchProducts, getSearchSuggestions, PublicProduct } from '../../lib/products'
import { useStore } from '../../lib/store-context'
import { useCart } from '../../lib/cart-context'
import { getCurrencySymbol } from '../../lib/store'
import Cart from '../../components/cart/Cart'

// Iconos modernos para el header
const Icons = {
  Search: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  ),
  ShoppingBag: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  ),
  User: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  ),
  Menu: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
    </svg>
  ),
  Close: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  TrendingUp: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
    </svg>
  ),
  Tag: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
}

export default function BaseDefaultLayout({ tienda, categorias = [], children }: ThemeLayoutProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { state: cartState, toggleCart } = useCart()
  
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
        href: `#${cat.slug}`,
        hasSubcategories: subcategoriesByParent[cat.id]?.length > 0
      }))
    : []

  // Efecto para detectar scroll y cambiar estilo del header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
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
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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
      
      // Ejecutar búsqueda
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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-white/95 backdrop-blur-md shadow-sm' 
          : 'bg-white/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-3 hover-scale">
                <div className="w-8 h-8 bg-neutral-900 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-sm">
                    {tienda?.storeName?.charAt(0) || 'S'}
                  </span>
                </div>
                <span className="text-xl font-light text-neutral-900 tracking-tight">
                  {tienda?.storeName || 'Mi Tienda'}
                </span>
              </Link>
            </div>

            {/* Navegación principal - Desktop */}
            <nav className="hidden md:flex items-center space-x-8 relative">
              {categories.map((category) => (
                <div 
                  key={category.id}
                  className="relative"
                  onMouseEnter={() => category.hasSubcategories && setHoveredCategory(category.id)}
                  onMouseLeave={() => setHoveredCategory(null)}
                >
                  <a
                    href={category.href}
                    className="text-sm font-light text-neutral-600 hover:text-neutral-900 transition-colors duration-200 relative group flex items-center"
                  >
                    {category.name}
                    {category.hasSubcategories && (
                      <span className="ml-1">
                        <Icons.ChevronDown />
                      </span>
                    )}
                    <span className="absolute -bottom-1 left-0 w-0 h-px bg-neutral-900 transition-all duration-200 group-hover:w-full"></span>
                  </a>
                  
                  {/* Dropdown de subcategorías */}
                  {category.hasSubcategories && hoveredCategory === category.id && (
                    <div className="absolute top-full left-0 pt-2 w-64 z-50">
                      <div className="bg-white border border-neutral-200 rounded-lg shadow-lg">
                        <div className="py-2">
                          {subcategoriesByParent[category.id]?.map((subcategory) => (
                            <a
                              key={subcategory.id}
                              href={`#${subcategory.slug}`}
                              className="block px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors duration-200"
                            >
                              {subcategory.name}
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </nav>

            {/* Acciones del header */}
            <div className="flex items-center space-x-3">
              {/* Búsqueda */}
              <button 
                onClick={() => window.innerWidth >= 768 ? openDesktopSearch() : openMobileSearch()}
                className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale"
              >
                <Icons.Search />
              </button>

              {/* Favoritos */}
              <Link href="/favoritos" className="hidden sm:flex p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale">
                <Icons.Heart />
              </Link>

              {/* Usuario */}
              <Link href="/mi-cuenta" className="hidden sm:flex p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale">
                <Icons.User />
              </Link>

              {/* Carrito */}
              <button 
                onClick={toggleCart}
                className="relative p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 hover-scale"
              >
                <Icons.ShoppingBag />
                {cartState.totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-neutral-900 text-white text-xs rounded-full flex items-center justify-center font-medium">
                    {cartState.totalItems}
                  </span>
                )}
              </button>

              {/* Menú móvil */}
              <button
                className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Icons.Menu />
              </button>
            </div>
          </div>
        </div>

        {/* Búsqueda Desktop Dropdown */}
        <div ref={searchRef} className={`hidden md:block absolute top-full left-0 right-0 bg-white/95 backdrop-blur-md border-t border-neutral-200 shadow-lg transition-all duration-300 ease-out ${
          searchOpen 
            ? 'opacity-100 transform translate-y-0' 
            : 'opacity-0 transform -translate-y-4 pointer-events-none'
        }`}>
            <div className="max-w-2xl mx-auto px-4 py-6">
              {/* Barra de búsqueda */}
              <div className="relative">
                <div className="relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Buscar productos, categorías, marcas..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                    className="w-full pl-10 pr-10 py-3 bg-white border border-neutral-300 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent font-light"
                  />
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                    <Icons.Search />
                  </div>
                  {searchQuery && (
                    <button
                      onClick={clearSearch}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                    >
                      <Icons.X />
                    </button>
                  )}
                </div>
              </div>

              {/* Contenido de búsqueda */}
              {!searchQuery && (
                <div className="mt-6 space-y-4">
                  {/* Historial de búsqueda */}
                  {searchHistory.length > 0 && (
                    <div>
                      <h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
                        <Icons.Clock />
                        <span className="ml-2">Búsquedas recientes</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => executeSearch(item)}
                            className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-sm transition-colors"
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
                      <h3 className="text-sm font-medium text-neutral-700 mb-2 flex items-center">
                        <Icons.TrendingUp />
                        <span className="ml-2">Sugerencias</span>
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => executeSearch(suggestion)}
                            className="px-3 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-700 rounded-full text-sm transition-colors"
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
                <div className="mt-6">
                  {isSearching ? (
                    <div className="flex items-center justify-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-neutral-900"></div>
                      <span className="ml-2 text-sm text-neutral-600">Buscando...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <h3 className="text-sm font-medium text-neutral-700 mb-3">Resultados ({searchResults.length})</h3>
                      <div className="space-y-2">
                        {searchResults.map((product) => (
                          <Link 
                            key={product.id} 
                            href={`/${product.slug}`}
                            className="flex items-center space-x-3 p-2 hover:bg-neutral-50 rounded-lg cursor-pointer transition-colors"
                          >
                            <div className="w-12 h-12 bg-neutral-200 rounded-lg overflow-hidden">
                              <img 
                                src={product.image.includes('.mp4') || product.image.includes('.webm') || product.image.includes('.mov') 
                                  ? product.image.replace(/\.(mp4|webm|mov)$/, '.jpg') // Cloudinary auto-generates thumbnails
                                  : product.image}
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback si no existe el thumbnail
                                  const target = e.target as HTMLImageElement;
                                  if (target.src.includes('.jpg') && product.image.includes('.mp4')) {
                                    target.src = product.image.replace('.mp4', '.png'); // Try PNG thumbnail
                                  } else if (target.src.includes('.png') && product.image.includes('.mp4')) {
                                    target.src = '/api/placeholder/48/48'; // Final fallback
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-neutral-900">{product.name}</h4>
                            </div>
                            <div className="text-sm font-medium text-neutral-900">
                              {getCurrencySymbol(tienda?.currency || 'USD')}{product.price}
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button 
                        onClick={() => executeSearch(searchQuery)}
                        className="mt-3 w-full py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                      >
                        Ver todos los resultados
                      </button>
                    </>
                  ) : searchQuery.length >= 2 && !isSearching ? (
                    <div className="text-center py-4">
                      <p className="text-sm text-neutral-500">No se encontraron productos para "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
      </header>

      {/* Búsqueda Mobile Modal */}
      {mobileSearchOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="fixed inset-0 bg-white">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200">
              <h2 className="text-lg font-light text-neutral-900">Buscar</h2>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
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
                  className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent font-light"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                  <Icons.Search />
                </div>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
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
                      <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                        <Icons.Clock />
                        <span className="ml-2">Búsquedas recientes</span>
                      </h3>
                      <div className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => executeSearch(item)}
                            className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg text-neutral-700 transition-colors"
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
                      <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                        <Icons.TrendingUp />
                        <span className="ml-2">Sugerencias</span>
                      </h3>
                      <div className="space-y-2">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => executeSearch(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg text-neutral-700 transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categorías rápidas */}
                  <div>
                    <h3 className="text-sm font-medium text-neutral-700 mb-3 flex items-center">
                      <Icons.Tag />
                      <span className="ml-2">Categorías</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.slice(0, 6).map((category) => (
                        <button
                          key={category.name}
                          className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-700 text-sm transition-colors"
                        >
                          {category.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Resultados de búsqueda móvil */}
              {showSuggestions && (
                <div>
                  {isSearching ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-neutral-900"></div>
                      <span className="ml-3 text-neutral-600">Buscando...</span>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <h3 className="text-sm font-medium text-neutral-700 mb-3">Resultados ({searchResults.length})</h3>
                      <div className="grid grid-cols-1 gap-3">
                        {searchResults.map((product) => (
                          <a 
                            key={product.id} 
                            href={`/${product.slug}`}
                            className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                          >
                            <div className="w-16 h-16 bg-neutral-200 rounded-lg overflow-hidden">
                              <img 
                                src={product.image.includes('.mp4') || product.image.includes('.webm') || product.image.includes('.mov') 
                                  ? product.image.replace(/\.(mp4|webm|mov)$/, '.jpg') // Cloudinary auto-generates thumbnails
                                  : product.image}
                                alt={product.name} 
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                  // Fallback si no existe el thumbnail
                                  const target = e.target as HTMLImageElement;
                                  if (target.src.includes('.jpg') && product.image.includes('.mp4')) {
                                    target.src = product.image.replace('.mp4', '.png'); // Try PNG thumbnail
                                  } else if (target.src.includes('.png') && product.image.includes('.mp4')) {
                                    target.src = '/api/placeholder/64/64'; // Final fallback
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium text-neutral-900">{product.name}</h4>
                              <p className="text-lg font-medium text-neutral-900">{getCurrencySymbol(tienda?.currency || 'USD')}{product.price}</p>
                            </div>
                          </a>
                        ))}
                      </div>
                      <button 
                        onClick={() => executeSearch(searchQuery)}
                        className="mt-4 w-full py-3 bg-neutral-900 text-white rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        Ver todos los resultados
                      </button>
                    </>
                  ) : searchQuery.length >= 2 && !isSearching ? (
                    <div className="text-center py-8">
                      <p className="text-neutral-500">No se encontraron productos para "{searchQuery}"</p>
                    </div>
                  ) : null}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Menú móvil */}
      <div className={`fixed inset-0 z-50 md:hidden ${mobileMenuOpen ? 'pointer-events-auto' : 'pointer-events-none'}`}>
        {/* Overlay */}
        <div 
          className={`fixed inset-0 bg-black transition-opacity duration-300 ${
            mobileMenuOpen ? 'opacity-25' : 'opacity-0'
          }`}
          onClick={() => setMobileMenuOpen(false)}
        />
        
        {/* Panel del menú */}
        <div className={`fixed right-0 top-0 h-full w-80 max-w-sm bg-white shadow-soft-lg transform transition-transform duration-300 ease-out ${
          mobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="flex items-center justify-between p-4 border-b border-neutral-200">
            <span className="text-lg font-light text-neutral-900">Menú</span>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200"
            >
              <Icons.Close />
            </button>
          </div>
          
          <nav className="px-4 py-6 space-y-4">
            {categories.map((category) => (
              <a
                key={category.name}
                href={category.href}
                className="block py-3 text-neutral-900 font-light border-b border-neutral-100 hover:text-neutral-600 transition-colors duration-200"
              >
                {category.name}
              </a>
            ))}
          </nav>
          
          <div className="px-4 py-6 border-t border-neutral-200 space-y-4">
            <Link href="/mi-cuenta" className="flex items-center space-x-3 py-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200">
              <Icons.User />
              <span className="font-light">Mi cuenta</span>
            </Link>
            <Link href="/favoritos" className="flex items-center space-x-3 py-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200">
              <Icons.Heart />
              <span className="font-light">Favoritos</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <main className="animate-fade-in bg-white">
        {children}
      </main>

      {/* Carrito */}
      <Cart />

      {/* Footer */}
      <footer className="bg-neutral-50 border-t border-neutral-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* Información de la tienda */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-neutral-900 rounded-sm flex items-center justify-center">
                  <span className="text-white font-bold text-xs">
                    {tienda?.storeName?.charAt(0) || 'S'}
                  </span>
                </div>
                <span className="text-lg font-light text-neutral-900">
                  {tienda?.storeName || 'Mi Tienda'}
                </span>
              </div>
              <p className="text-neutral-600 font-light leading-relaxed">
                {tienda?.description || 'Descubre nuestra colección única de productos cuidadosamente seleccionados para ti.'}
              </p>
            </div>

            {/* Enlaces rápidos */}
            <div>
              <h3 className="text-neutral-900 font-medium mb-4">Navegación</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.name}>
                    <a href={category.href} className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">
                      {category.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Atención al cliente */}
            <div>
              <h3 className="text-neutral-900 font-medium mb-4">Ayuda</h3>
              <ul className="space-y-2">
                <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">Contacto</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">Envíos</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">Devoluciones</a></li>
                <li><a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">FAQ</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-neutral-900 font-medium mb-4">Newsletter</h3>
              <p className="text-neutral-600 font-light mb-4">
                Suscríbete para recibir ofertas exclusivas
              </p>
              <div className="flex">
                <input
                  type="email"
                  placeholder="tu@email.com"
                  className="flex-1 px-3 py-2 bg-white border border-neutral-300 rounded-l-md text-sm font-light focus:outline-none focus:ring-1 focus:ring-neutral-400 focus:border-neutral-400"
                />
                <button className="px-4 py-2 bg-neutral-900 text-white rounded-r-md hover:bg-neutral-800 transition-colors duration-200 font-medium text-sm">
                  Enviar
                </button>
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-neutral-600 font-light text-sm">
              © 2024 {tienda?.storeName || 'Mi Tienda'}. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 sm:mt-0">
              <a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 text-sm font-light">
                Privacidad
              </a>
              <a href="#" className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 text-sm font-light">
                Términos
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
} 