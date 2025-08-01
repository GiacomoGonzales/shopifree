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
import StoreLocationMap from './StoreLocationMap'
import LogoSpinner from './components/LogoSpinner'

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
  // Iconos de redes sociales
  Instagram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
    </svg>
  ),
  Facebook: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
    </svg>
  ),
  WhatsApp: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.885 3.488"/>
    </svg>
  ),
  TikTok: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
    </svg>
  ),
  X: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"/>
    </svg>
  ),
  Close: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  ),
  YouTube: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  ),
  LinkedIn: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  ),
  Telegram: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>
  ),
  Pinterest: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.174-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.402.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.357-.629-2.758-1.378l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.624 0 11.99-5.367 11.99-11.99C24.007 5.367 18.641.001 12.017.001z"/>
    </svg>
  ),
  Snapchat: () => (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12.166 3C7.985 3 4.595 6.32 4.595 10.4c0 2.174 1.183 4.092 2.956 5.199-.017-.317-.096-.674-.19-1.075-.4-1.69-1.005-4.237-1.005-6.224 0-2.962 2.438-5.4 5.4-5.4s5.4 2.438 5.4 5.4c0 1.987-.605 4.534-1.005 6.224-.094.401-.173.758-.19 1.075 1.773-1.107 2.956-3.025 2.956-5.199C19.737 6.32 16.347 3 12.166 3zm0 8.4c-.663 0-1.2-.537-1.2-1.2s.537-1.2 1.2-1.2 1.2.537 1.2 1.2-.537 1.2-1.2 1.2z"/>
    </svg>
  ),
}

export default function BaseDefaultLayout({ tienda, categorias = [], children }: ThemeLayoutProps) {
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
      // No hacer nada si el modal móvil está abierto
      if (mobileSearchOpen) return
      
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setSearchOpen(false)
        setShowSuggestions(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [mobileSearchOpen])

  // Efecto para prevenir scroll del body cuando el modal móvil está abierto
  useEffect(() => {
    if (mobileSearchOpen) {
      // Prevenir scroll del body
      document.body.style.overflow = 'hidden'
      // Prevenir scroll en iOS Safari
      document.body.style.position = 'fixed'
      document.body.style.width = '100%'
    } else {
      // Restaurar scroll del body
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }

    // Cleanup al desmontar
    return () => {
      document.body.style.overflow = ''
      document.body.style.position = ''
      document.body.style.width = ''
    }
  }, [mobileSearchOpen])

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

  // Función para navegar desde el buscador móvil
  const handleMobileProductNavigation = (productSlug: string) => {
    setMobileSearchOpen(false)
    nextRouter.push(`/${productSlug}`)
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
                {(tienda?.logoUrl || tienda?.headerLogoUrl) ? (
                  <div className="w-8 h-8 rounded-sm overflow-hidden flex items-center justify-center">
                    <img
                      src={tienda.logoUrl || tienda.headerLogoUrl}
                      alt={`${tienda.storeName} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback al logo de letra si la imagen falla
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-8 h-8 bg-neutral-900 rounded-sm flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-white font-bold text-sm">
                        {tienda?.storeName?.charAt(0) || 'S'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-8 h-8 bg-neutral-900 rounded-sm flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {tienda?.storeName?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
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
                  <Link
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
                  </Link>
                  
                  {/* Dropdown de subcategorías */}
                  {category.hasSubcategories && hoveredCategory === category.id && (
                    <div className="absolute top-full left-0 pt-2 w-64 z-50">
                      <div className="bg-white border border-neutral-200 rounded-lg shadow-lg">
                        <div className="py-2">
                          {subcategoriesByParent[category.id]?.map((subcategory) => (
                            <Link
                              key={subcategory.id}
                              href={`/categoria/${subcategory.slug}`}
                              className="block px-4 py-2 text-sm text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50 transition-colors duration-200"
                            >
                              {subcategory.name}
                            </Link>
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
                      <Icons.Close />
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
                    <div className="py-4">
                      <LogoSpinner 
                        tienda={tienda} 
                        size="sm" 
                        message="Buscando..."
                      />
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
        <div className="fixed inset-0 z-[9999] md:hidden">
          <div className="fixed inset-0 bg-white flex flex-col">
            {/* Header del modal */}
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 flex-shrink-0">
              <h2 className="text-base font-light text-neutral-900">Buscar</h2>
              <button
                onClick={() => setMobileSearchOpen(false)}
                className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors"
              >
                <Icons.Close />
              </button>
            </div>

            {/* Contenido del modal */}
            <div className="flex-1 overflow-y-auto p-4">

              {/* Barra de búsqueda */}
              <div className="relative mb-6">
                <input
                  ref={searchInputRef}
                  type="text"
                  placeholder="Buscar productos..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && executeSearch(searchQuery)}
                  className="w-full pl-10 pr-10 py-3 bg-neutral-50 border border-neutral-200 rounded-lg text-sm text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-neutral-400 focus:border-transparent font-light"
                />
                <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400">
                  <Icons.Search />
                </div>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-neutral-400 hover:text-neutral-600 transition-colors"
                  >
                    <Icons.Close />
                  </button>
                )}
              </div>

              {/* Contenido de búsqueda móvil */}
              {!searchQuery && (
                <div className="space-y-6">
                  {/* Historial de búsqueda */}
                  {searchHistory.length > 0 && (
                    <div>
                      <h3 className="text-xs font-medium text-neutral-700 mb-3 flex items-center">
                        <Icons.Clock />
                        <span className="ml-2">Búsquedas recientes</span>
                      </h3>
                      <div className="space-y-2">
                        {searchHistory.map((item, index) => (
                          <button
                            key={index}
                            onClick={() => executeSearch(item)}
                            className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg text-neutral-700 text-sm transition-colors"
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
                      <h3 className="text-xs font-medium text-neutral-700 mb-3 flex items-center">
                        <Icons.TrendingUp />
                        <span className="ml-2">Sugerencias</span>
                      </h3>
                      <div className="space-y-2">
                        {searchSuggestions.map((suggestion, index) => (
                          <button
                            key={index}
                            onClick={() => executeSearch(suggestion)}
                            className="w-full text-left px-3 py-2 hover:bg-neutral-50 rounded-lg text-neutral-700 text-sm transition-colors"
                          >
                            {suggestion}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Categorías rápidas */}
                  <div>
                    <h3 className="text-xs font-medium text-neutral-700 mb-3 flex items-center">
                      <Icons.Tag />
                      <span className="ml-2">Categorías</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-2">
                      {categories.slice(0, 6).map((category) => (
                        <button
                          key={category.name}
                          className="p-3 bg-neutral-50 hover:bg-neutral-100 rounded-lg text-neutral-700 text-xs transition-colors"
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
                    <div className="py-8">
                      <LogoSpinner 
                        tienda={tienda} 
                        size="md" 
                        message="Buscando..."
                      />
                    </div>
                  ) : searchResults.length > 0 ? (
                    <>
                      <h3 className="text-xs font-medium text-neutral-700 mb-3">Resultados ({searchResults.length})</h3>
                      <div className="space-y-3">
                        {searchResults.map((product) => (
                          <Link 
                            key={product.id} 
                            href={`/${product.slug}`}
                            className="flex items-center space-x-3 p-3 bg-neutral-50 rounded-lg hover:bg-neutral-100 transition-colors"
                            onClick={() => setMobileSearchOpen(false)}
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
                                    target.src = '/api/placeholder/48/48'; // Final fallback
                                  }
                                }}
                              />
                            </div>
                            <div className="flex-1">
                              <h4 className="text-sm font-medium text-neutral-900">{product.name}</h4>
                              <p className="text-sm font-medium text-neutral-900">{getCurrencySymbol(tienda?.currency || 'USD')}{product.price}</p>
                            </div>
                          </Link>
                        ))}
                      </div>
                      <button 
                        onClick={() => executeSearch(searchQuery)}
                        className="mt-4 w-full py-3 bg-neutral-900 text-white text-sm rounded-lg hover:bg-neutral-800 transition-colors"
                      >
                        Ver todos los resultados
                      </button>
                    </>
                  ) : searchQuery.length >= 2 && !isSearching ? (
                    <div className="text-center py-8">
                      <p className="text-sm text-neutral-500">No se encontraron productos para "{searchQuery}"</p>
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
              <Link
                key={category.name}
                href={category.href}
                className="block py-3 text-neutral-900 font-light border-b border-neutral-100 hover:text-neutral-600 transition-colors duration-200"
                onClick={() => setMobileMenuOpen(false)}
              >
                {category.name}
              </Link>
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
                {(tienda?.logoUrl || tienda?.headerLogoUrl) ? (
                  <div className="w-6 h-6 rounded-sm overflow-hidden flex items-center justify-center">
                    <img
                      src={tienda.logoUrl || tienda.headerLogoUrl}
                      alt={`${tienda.storeName} logo`}
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        // Fallback al logo de letra si la imagen falla
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                    <div className="w-6 h-6 bg-neutral-900 rounded-sm flex items-center justify-center" style={{ display: 'none' }}>
                      <span className="text-white font-bold text-xs">
                        {tienda?.storeName?.charAt(0) || 'S'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="w-6 h-6 bg-neutral-900 rounded-sm flex items-center justify-center">
                    <span className="text-white font-bold text-xs">
                      {tienda?.storeName?.charAt(0) || 'S'}
                    </span>
                  </div>
                )}
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
                    <Link href={category.href} className="text-neutral-600 hover:text-neutral-900 transition-colors duration-200 font-light">
                      {category.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Redes sociales */}
            <div>
              <h3 className="text-neutral-900 font-medium mb-4">Síguenos</h3>
              
              {/* Verificar si hay redes sociales configuradas */}
              {tienda?.socialMedia && Object.values(tienda.socialMedia).some(url => url && url.trim() !== '') ? (
                <>
                  <p className="text-neutral-600 font-light mb-4">
                    Conéctate con nosotros
                  </p>
                  
                  <div className="flex flex-wrap gap-3">
                    {tienda?.socialMedia?.instagram && (
                      <a
                        href={tienda.socialMedia.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Síguenos en Instagram"
                      >
                        <Icons.Instagram />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.facebook && (
                      <a
                        href={tienda.socialMedia.facebook}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Síguenos en Facebook"
                      >
                        <Icons.Facebook />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.whatsapp && (
                      <a
                        href={`https://wa.me/${tienda.socialMedia.whatsapp.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Chatea con nosotros en WhatsApp"
                      >
                        <Icons.WhatsApp />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.tiktok && (
                      <a
                        href={tienda.socialMedia.tiktok}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Síguenos en TikTok"
                      >
                        <Icons.TikTok />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.x && (
                      <a
                        href={tienda.socialMedia.x}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Síguenos en X (Twitter)"
                      >
                        <Icons.X />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.youtube && (
                      <a
                        href={tienda.socialMedia.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Suscríbete a nuestro canal de YouTube"
                      >
                        <Icons.YouTube />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.linkedin && (
                      <a
                        href={tienda.socialMedia.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Conéctate con nosotros en LinkedIn"
                      >
                        <Icons.LinkedIn />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.telegram && (
                      <a
                        href={tienda.socialMedia.telegram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Únete a nuestro canal de Telegram"
                      >
                        <Icons.Telegram />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.pinterest && (
                      <a
                        href={tienda.socialMedia.pinterest}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Síguenos en Pinterest"
                      >
                        <Icons.Pinterest />
                      </a>
                    )}
                    
                    {tienda?.socialMedia?.snapchat && (
                      <a
                        href={tienda.socialMedia.snapchat}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 text-neutral-600 hover:text-neutral-900 transition-colors duration-200 bg-neutral-100 hover:bg-neutral-200 rounded-lg"
                        title="Síguenos en Snapchat"
                      >
                        <Icons.Snapchat />
                      </a>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <p className="text-neutral-600 font-light mb-4">
                    Próximamente en redes sociales
                  </p>
                  <div className="bg-neutral-100 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">📱</div>
                    <p className="text-sm text-neutral-600 font-light">
                      Estamos preparando nuestras redes sociales
                    </p>
                  </div>
                </>
              )}
            </div>

            {/* Ubicación */}
            <div>
              <h3 className="text-neutral-900 font-medium mb-4">Ubícanos</h3>
              
              {tienda?.hasPhysicalLocation && (tienda?.address || tienda?.location?.address) ? (
                <>
                  <p className="text-neutral-600 font-light mb-4">
                    Encuéntranos fácilmente
                  </p>
                  
                  {/* Mapa interactivo */}
                  <StoreLocationMap
                    address={tienda?.location?.address || tienda?.address || 'Ubicación de la tienda'}
                    lat={tienda?.location?.lat}
                    lng={tienda?.location?.lng}
                    storeName={tienda?.storeName}
                    tienda={tienda}
                  />
                  
                  {/* Dirección */}
                  <div className="space-y-2">
                    <div className="flex items-start space-x-2">
                      <span className="text-sm mt-0.5 text-neutral-900">📍</span>
                      <p className="text-sm text-neutral-600 font-light leading-relaxed">
                        {tienda?.location?.address || tienda?.address}
                      </p>
                    </div>
                    
                    {/* Enlace para abrir en Google Maps */}
                    <div className="mt-2">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(tienda?.location?.address || tienda?.address || '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-neutral-700 hover:text-neutral-900 transition-colors duration-200 font-light"
                      >
                        Abrir en Google Maps →
                      </a>
                    </div>
                  </div>
                </>
              ) : (
                <>
                  <p className="text-neutral-600 font-light mb-4">
                    Tienda online
                  </p>
                  <div className="bg-neutral-100 rounded-lg p-4 text-center">
                    <div className="text-2xl mb-2">🌐</div>
                    <p className="text-sm text-neutral-600 font-light">
                      Disponible solo en línea
                    </p>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-neutral-200 flex flex-col sm:flex-row justify-between items-center">
            <p className="text-neutral-600 font-light text-sm">
              © 2025 {tienda?.storeName || 'Mi Tienda'}. Todos los derechos reservados.
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