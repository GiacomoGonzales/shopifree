'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tienda } from '../../lib/types'
import { Category } from '../../lib/categories'
import { PublicProduct, generatePriceRangeOptions, applyDynamicFilters, PriceRangeOption } from '../../lib/products'
import { getStoreConfiguredFilters, extractConfiguredFilters, extractDynamicFilters, DynamicFilter } from '../../lib/store-filters'
import { useCart } from '../../lib/cart-context'
import { getCurrencySymbol } from '../../lib/store'
import VideoPlayer from '../../components/VideoPlayer'
import HeartIcon from '../../components/HeartIcon'
import DynamicFilters from './DynamicFilters'

interface HomeProps {
  tienda: Tienda
  productos?: PublicProduct[]
  categorias?: Category[]
}

// Tipos para el selector de vista
type ProductViewMode = 'expanded' | 'compact' | 'list'

const Icons = {
  Star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
    </svg>
  ),
  Sort: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  ),
  // Iconos para el selector de vista
  GridExpanded: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75h16.5v16.5H3.75V3.75zM3.75 8.25h16.5M8.25 3.75v16.5" />
    </svg>
  ),
  GridCompact: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
    </svg>
  ),
  ListView: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 6.75h12M8.25 12h12m-12 5.25h12M3.75 6.75h.007v.008H3.75V6.75zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 12h.007v.008H3.75V12zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zM3.75 17.25h.007v.008H3.75v-.008zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    </svg>
  ),
}

export default function Home({ tienda, productos, categorias = [] }: HomeProps) {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [productsToShow, setProductsToShow] = useState(8) // Initial number of products to show
  const { addItem, openCart } = useCart()
  
  // Estados para filtros dinámicos
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([])
  const [priceRangeOptions, setPriceRangeOptions] = useState<PriceRangeOption[]>([])
  
  // Estados para ordenamiento
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('newest')
  const [showSort, setShowSort] = useState(false)
  
  // Estado para el selector de vista (solo móvil)
  const [viewMode, setViewMode] = useState<ProductViewMode>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('productViewMode') as ProductViewMode) || 'expanded'
    }
    return 'expanded'
  })
  
  // Función para cambiar el modo de vista
  const handleViewModeChange = (mode: ProductViewMode) => {
    setViewMode(mode)
    if (typeof window !== 'undefined') {
      localStorage.setItem('productViewMode', mode)
    }
  }
  
  // Función para cambiar vista de forma cíclica
  const handleViewModeToggle = () => {
    const modes: ProductViewMode[] = ['expanded', 'compact', 'list']
    const currentIndex = modes.indexOf(viewMode)
    const nextIndex = (currentIndex + 1) % modes.length
    handleViewModeChange(modes[nextIndex])
  }
  
  // Función para obtener el icono actual según la vista
  const getCurrentViewIcon = () => {
    switch (viewMode) {
      case 'expanded':
        return <Icons.GridExpanded />
      case 'compact':
        return <Icons.GridCompact />
      case 'list':
        return <Icons.ListView />
      default:
        return <Icons.GridExpanded />
    }
  }
  
  // Función para obtener el título según la vista
  const getCurrentViewTitle = () => {
    switch (viewMode) {
      case 'expanded':
        return 'Vista expandida'
      case 'compact':
        return 'Vista compacta'
      case 'list':
        return 'Vista lista'
      default:
        return 'Cambiar vista'
    }
  }
  
  // Función para obtener las clases de la grilla según el modo de vista
  const getGridClasses = (mode: ProductViewMode) => {
    switch (mode) {
      case 'expanded':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
      case 'compact':
        return 'grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4'
      case 'list':
        return 'grid-cols-1 gap-4'
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
    }
  }
  
  // Usar solo productos reales
  const allProducts = productos || []

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

  // Determinar qué categorías mostrar
  const categoriesToShow = selectedParentCategory 
    ? subcategoriesByParent[selectedParentCategory] || []
    : parentCategories

  // Crear la lista de categorías para mostrar en las pastillas
  const categories = ['todos', ...categoriesToShow.map(cat => cat.slug)]
  
  const categoryNames: Record<string, string> = { 
    'todos': selectedParentCategory ? 'Todas las subcategorías' : 'Todos',
    ...Object.fromEntries(categoriesToShow.map(cat => [cat.slug, cat.name]))
  }

  // Función para manejar click en categoría padre
  const handleParentCategoryClick = (parentCategoryId: string) => {
    setSelectedParentCategory(parentCategoryId)
    setActiveCategory('todos')
    setShowAllProducts(false)
    setProductsToShow(8)
  }

  // Función para volver a categorías padre
  const handleBackToParentCategories = () => {
    setSelectedParentCategory(null)
    setActiveCategory('todos')
    setShowAllProducts(false)
    setProductsToShow(8)
  }
  
  // Filtrar productos por categoría
  const categoryFilteredProducts = useMemo(() => {
    if (activeCategory === 'todos') {
      if (selectedParentCategory) {
        // Mostrar productos de todas las subcategorías del padre seleccionado
        const subcategoryIds = subcategoriesByParent[selectedParentCategory]?.map(sub => sub.id) || []
        return allProducts.filter(producto => 
          producto.selectedParentCategoryIds?.some(catId => 
            catId === selectedParentCategory || subcategoryIds.includes(catId)
          )
        )
      } else {
        // Mostrar todos los productos
        return allProducts
      }
    }
    
    // Buscar la categoría seleccionada por slug
    const categoriaSeleccionada = categorias.find(cat => cat.slug === activeCategory)
    
    // Filtrar productos que contengan el ID de la categoría en selectedParentCategoryIds
    return allProducts.filter(producto => {
      if (producto.selectedParentCategoryIds && Array.isArray(producto.selectedParentCategoryIds)) {
        if (categoriaSeleccionada) {
          return producto.selectedParentCategoryIds.includes(categoriaSeleccionada.id)
        }
      }
      return false
    })
  }, [activeCategory, allProducts, categorias, selectedParentCategory, subcategoriesByParent])

  // Aplicar filtros dinámicos y ordenamiento a los productos filtrados por categoría
  const filteredProducts = useMemo(() => {
    const filtered = applyDynamicFilters(categoryFilteredProducts, dynamicFilters, priceRangeOptions)
    
    // Aplicar ordenamiento
    switch (sortBy) {
      case 'name':
        filtered.sort((a, b) => a.name.localeCompare(b.name))
        break
      case 'price-low':
        filtered.sort((a, b) => a.price - b.price)
        break
      case 'price-high':
        filtered.sort((a, b) => b.price - a.price)
        break
      case 'newest':
      default:
        // Mantener orden original (más nuevos primero)
        break
    }
    
    return filtered
  }, [categoryFilteredProducts, dynamicFilters, priceRangeOptions, sortBy])

  // Actualizar filtros dinámicos cuando cambian los productos filtrados por categoría
  useEffect(() => {
    const loadFilters = async () => {
      try {
        // Get store filter configuration
        const storeFiltersConfig = await getStoreConfiguredFilters(tienda.id)
        
        // Use configured filters if available, otherwise fallback to automatic extraction
        const newFilters = storeFiltersConfig.length > 0
          ? extractConfiguredFilters(categoryFilteredProducts, storeFiltersConfig)
          : extractDynamicFilters(categoryFilteredProducts)
        
        setDynamicFilters(newFilters)
        
        const newPriceRangeOptions = generatePriceRangeOptions(categoryFilteredProducts)
        setPriceRangeOptions(newPriceRangeOptions)
      } catch (error) {
        console.error('Error loading filters:', error)
        // Fallback to automatic extraction
        const newFilters = extractDynamicFilters(categoryFilteredProducts)
        setDynamicFilters(newFilters)
        
        const newPriceRangeOptions = generatePriceRangeOptions(categoryFilteredProducts)
        setPriceRangeOptions(newPriceRangeOptions)
      }
    }
    
    loadFilters()
  }, [categoryFilteredProducts, tienda.id])

  // Productos a mostrar con paginación
  const productosAMostrar = useMemo(() => {
    if (showAllProducts) {
      return filteredProducts
    }
    return filteredProducts.slice(0, productsToShow)
  }, [filteredProducts, showAllProducts, productsToShow])

  // Reset pagination when category changes
  useEffect(() => {
    setShowAllProducts(false)
    setProductsToShow(8)
  }, [activeCategory, selectedParentCategory])

  // Función para cargar más productos
  const handleLoadMore = () => {
    const newProductsToShow = productsToShow + 8
    if (newProductsToShow >= filteredProducts.length) {
      setShowAllProducts(true)
    } else {
      setProductsToShow(newProductsToShow)
    }
  }

  // Función para mostrar todos los productos
  const handleShowAllProducts = () => {
    setShowAllProducts(true)
  }

  // Funciones para manejar filtros dinámicos
  const handleFiltersChange = (newFilters: DynamicFilter[]) => {
    setDynamicFilters(newFilters)
    setShowAllProducts(false)
    setProductsToShow(8)
  }

  const handlePriceRangeChange = (newOptions: PriceRangeOption[]) => {
    setPriceRangeOptions(newOptions)
    setShowAllProducts(false)
    setProductsToShow(8)
  }

  const handleClearFilters = () => {
    const clearedFilters = dynamicFilters.map(filter => ({
      ...filter,
      selectedOptions: []
    }))
    setDynamicFilters(clearedFilters)
    
    const clearedPriceRanges = priceRangeOptions.map(range => ({
      ...range,
      selected: false
    }))
    setPriceRangeOptions(clearedPriceRanges)
    setShowAllProducts(false)
    setProductsToShow(8)
  }

  // Remover el scroll automático ya que se maneja en ClientPage
  // useEffect(() => {
  //   setTimeout(() => {
  //     window.scrollTo({ top: 0, behavior: 'smooth' })
  //   }, 100)
  // }, [tienda.id])
  
  // Debug logs removidos para evitar logs infinitos en producción

  const features = [
    {
      icon: Icons.ShieldCheck,
      title: 'Compra Segura',
      description: 'Transacciones 100% seguras con protección garantizada'
    },
    {
      icon: Icons.Truck,
      title: 'Envío Rápido',
      description: 'Entrega express en 24-48 horas a toda la ciudad'
    },
    {
      icon: Icons.Refresh,
      title: 'Devoluciones',
      description: '30 días para devoluciones sin preguntas'
    }
  ]

  const handleAddToCart = async (producto: PublicProduct, event: React.MouseEvent) => {
    event.preventDefault() // Prevenir navegación del Link
    event.stopPropagation()
    
    setAddingToCart(producto.id)
    
    try {
      const cartItem = {
        id: producto.id,
        productId: producto.id,
        name: producto.name,
        price: producto.price,
        currency: tienda.currency,
        image: producto.image,
        slug: producto.slug || `producto-${producto.id}`
      }

      addItem(cartItem, 1)
      
      // Pequeña pausa para mostrar el feedback visual
      setTimeout(() => {
        setAddingToCart(null)
        openCart() // Abrir el carrito después de agregar
      }, 800)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setAddingToCart(null)
    }
  }

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative min-h-[75vh] overflow-hidden bg-gradient-to-b from-neutral-50 to-white pt-24 lg:pt-32">
        {/* Content Container */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center min-h-[55vh]">
            
            {/* Left Column - Text Content */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-6 animate-slide-up">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-extralight text-neutral-900 tracking-tight leading-tight">
                  {tienda?.storeName || 'Estilo Minimalista'}
                </h1>
                <p className="text-lg md:text-xl lg:text-2xl text-neutral-600 font-light leading-relaxed max-w-xl mx-auto lg:mx-0">
                  {tienda?.description || 'Descubre nuestra colección única de productos cuidadosamente seleccionados para tu estilo de vida moderno'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fade-in">
                <Link 
                  href="/colecciones"
                  className="bg-neutral-900 text-white hover:bg-neutral-800 px-6 py-3 rounded-md font-medium transition-all duration-200 ease-in-out border-0 hover-lift inline-flex items-center space-x-2"
                >
                  <span>Explorar Colección</span>
                  <Icons.ArrowRight />
                </Link>
                <button className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 hover:text-neutral-900 px-6 py-3 rounded-md font-medium transition-all duration-200 ease-in-out bg-transparent hover-scale">
                  Ver Ofertas
                </button>
              </div>
            </div>

            {/* Right Column - Hero Image */}
            <div className="relative lg:h-[60vh] h-[50vh] order-first lg:order-last">
              <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-2xl">
                {tienda?.heroImageUrl ? (
                  <img 
                    src={tienda.heroImageUrl} 
                    alt={`${tienda.storeName} - Imagen principal`}
                    className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-neutral-100 to-neutral-200 flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-24 h-24 mx-auto bg-neutral-300 rounded-full flex items-center justify-center">
                        <svg className="w-12 h-12 text-neutral-500" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <p className="text-neutral-500 font-light">Imagen de héroe</p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Decorative accent */}
              <div className="absolute -bottom-4 -right-4 w-full h-full bg-gradient-to-br from-neutral-900/10 to-transparent rounded-2xl -z-10"></div>
            </div>
          </div>
        </div>

        {/* Decorative elements más sutiles */}
        <div className="absolute top-20 right-20 w-1 h-1 bg-neutral-400 rounded-full opacity-40 animate-pulse hidden lg:block"></div>
        <div className="absolute bottom-32 left-16 w-0.5 h-0.5 bg-neutral-400 rounded-full opacity-60 animate-pulse hidden lg:block"></div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white pt-12">
        <div className="text-center space-y-4 mb-12">
          <h2 className="text-3xl md:text-4xl font-light text-neutral-900">Explora por Categoría</h2>
          <p className="text-neutral-600 font-light">Encuentra exactamente lo que buscas</p>
        </div>

        {/* Breadcrumb navigation */}
        {selectedParentCategory && (
          <div className="flex items-center justify-center gap-2 mb-6">
            <button
              onClick={handleBackToParentCategories}
              className="text-sm text-neutral-500 hover:text-neutral-900 transition-colors"
            >
              Categorías
            </button>
            <span className="text-neutral-300">›</span>
            <span className="text-sm text-neutral-900 font-medium">
              {parentCategories.find(cat => cat.id === selectedParentCategory)?.name}
            </span>
          </div>
        )}

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {categories.map((category) => {
            const isParentCategory = !selectedParentCategory && parentCategories.find(cat => cat.slug === category)
            const hasSubcategories = isParentCategory && subcategoriesByParent[parentCategories.find(cat => cat.slug === category)?.id || '']?.length > 0
            
            return (
              <button
                key={category}
                onClick={() => {
                  if (hasSubcategories && category !== 'todos') {
                    const parentCat = parentCategories.find(cat => cat.slug === category)
                    if (parentCat) {
                      handleParentCategoryClick(parentCat.id)
                    }
                  } else {
                    setActiveCategory(category)
                  }
                }}
                className={`px-6 py-2 rounded-full text-sm font-light transition-all duration-200 flex items-center ${
                  activeCategory === category
                    ? 'bg-neutral-900 text-white'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200 hover:text-neutral-900'
                }`}
              >
                {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                {hasSubcategories && (
                  <span className="ml-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 bg-white pt-12">
        {/* Filtros y contador de productos */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-center sm:text-left">
            <p className="text-neutral-600 font-light">
              {productosAMostrar.length === 0 
                ? `No hay productos en la categoría "${categoryNames[activeCategory] || activeCategory}"`
                : showAllProducts || filteredProducts.length <= 8
                  ? `Mostrando ${productosAMostrar.length} ${productosAMostrar.length === 1 ? 'producto' : 'productos'} ${activeCategory !== 'todos' ? `en "${categoryNames[activeCategory] || activeCategory}"` : ''}`
                  : `Mostrando ${productosAMostrar.length} de ${filteredProducts.length} productos ${activeCategory !== 'todos' ? `en "${categoryNames[activeCategory] || activeCategory}"` : ''}`
              }
            </p>
          </div>
          
          {/* Filtros dinámicos y ordenamiento */}
          <div className="flex items-center gap-4">
            {/* Desktop: Filtros y ordenamiento normales */}
            <div className="hidden md:flex items-center gap-4">
              <DynamicFilters
                filters={dynamicFilters}
                priceRangeOptions={priceRangeOptions}
                onFiltersChange={handleFiltersChange}
                onPriceRangeChange={handlePriceRangeChange}
                onClearFilters={handleClearFilters}
                primaryColor={tienda.primaryColor}
              />
              
              {/* Ordenamiento - Desktop */}
              <div className="relative">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-light border border-neutral-200 rounded-md hover:bg-neutral-50 transition-all duration-200 text-neutral-700 hover:text-neutral-900"
                >
                  <Icons.Sort />
                  <span className="font-light">Ordenar</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSort && (
                  <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-100 rounded-lg shadow-sm z-50 animate-fade-in">
                    <div className="p-3">
                      {[
                        { value: 'newest', label: 'Más recientes' },
                        { value: 'name', label: 'Nombre A-Z' },
                        { value: 'price-low', label: 'Precio: menor a mayor' },
                        { value: 'price-high', label: 'Precio: mayor a menor' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as 'name' | 'price-low' | 'price-high' | 'newest')
                            setShowSort(false)
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors duration-200 rounded-md text-sm font-light ${
                            sortBy === option.value 
                              ? 'bg-neutral-100 font-medium' 
                              : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Mobile: Tres botones alineados */}
            <div className="md:hidden flex items-center justify-between w-full gap-3">
              {/* Filtros - Izquierda */}
              <div className="flex-1">
                <DynamicFilters
                  filters={dynamicFilters}
                  priceRangeOptions={priceRangeOptions}
                  onFiltersChange={handleFiltersChange}
                  onPriceRangeChange={handlePriceRangeChange}
                  onClearFilters={handleClearFilters}
                  primaryColor={tienda.primaryColor}
                />
              </div>
              
              {/* Ordenamiento - Centro */}
              <div className="relative flex-1">
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-light border border-neutral-200 rounded-md hover:bg-neutral-50 transition-all duration-200 text-neutral-700 hover:text-neutral-900 w-full"
                >
                  <Icons.Sort />
                  <span className="font-light">Ordenar</span>
                  <svg className={`w-3 h-3 transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {showSort && (
                  <div className="absolute top-full left-0 mt-2 w-full bg-white border border-neutral-100 rounded-lg shadow-sm z-50 animate-fade-in">
                    <div className="p-3">
                      {[
                        { value: 'newest', label: 'Más recientes' },
                        { value: 'name', label: 'Nombre A-Z' },
                        { value: 'price-low', label: 'Precio: menor a mayor' },
                        { value: 'price-high', label: 'Precio: mayor a menor' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as 'name' | 'price-low' | 'price-high' | 'newest')
                            setShowSort(false)
                          }}
                          className={`w-full text-left px-3 py-2 hover:bg-neutral-50 transition-colors duration-200 rounded-md text-sm font-light ${
                            sortBy === option.value 
                              ? 'bg-neutral-100 font-medium' 
                              : ''
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              {/* Selector de vista - Derecha */}
              <div className="flex-1">
                <button
                  onClick={handleViewModeToggle}
                  className="flex items-center justify-center gap-2 px-3 py-2 text-sm font-light border border-neutral-200 rounded-md hover:bg-neutral-50 transition-all duration-200 text-neutral-700 hover:text-neutral-900 w-full"
                  title={getCurrentViewTitle()}
                >
                  {getCurrentViewIcon()}
                  <span className="hidden sm:inline font-light">Vista</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {productosAMostrar.length === 0 ? (
          /* Sin productos en la categoría */
          <div className="col-span-full flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">
              No hay productos en esta categoría
            </h3>
            <p className="text-neutral-500 mb-6">
              Prueba seleccionando una categoría diferente o explora todos los productos.
            </p>
            <button 
              onClick={() => setActiveCategory('todos')}
              className="bg-neutral-900 text-white px-6 py-3 rounded-md font-medium hover:bg-neutral-800 transition-colors"
            >
              Ver todos los productos
            </button>
          </div>
        ) : (
          <div className={`grid ${getGridClasses(viewMode)}`}>
            {productosAMostrar.map((producto, index) => (
              <Link 
                key={producto.id} 
                href={`/${producto.slug}`}
                className={`bg-white text-neutral-900 rounded-lg border border-neutral-200 shadow-sm md:hover:shadow-md transition-shadow duration-200 md:hover-lift animate-fade-in group cursor-pointer block ${
                  viewMode === 'list' ? 'flex flex-row items-center gap-4 p-4' : 'flex flex-col'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
              {/* Product Image */}
              <div className={`relative overflow-hidden bg-neutral-100 ${
                viewMode === 'list' 
                  ? 'w-20 h-20 rounded-lg flex-shrink-0' 
                  : 'aspect-square rounded-t-lg'
              }`}>
                {producto.mediaFiles && producto.mediaFiles.length > 0 && producto.mediaFiles[0].type === 'video' ? (
                  <VideoPlayer
                    src={producto.mediaFiles[0].url}
                    alt={producto.name}
                    className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
                    showControls={false}
                    autoPlay={true}
                    loop={true}
                    muted={true}
                    playsInline={true}
                    preload="metadata"
                    poster={producto.mediaFiles[0].url.replace(/\.(mp4|webm|mov)$/, '.jpg')}
                  />
                ) : (
                  <Image
                    src={producto.image}
                    alt={producto.name}
                    fill
                    className="object-cover transition-transform duration-300 md:group-hover:scale-105"
                  />
                )}
                {/* Mostrar "Nuevo" para productos recientes - Oculto en vista lista */}
                {viewMode !== 'list' && (
                  <span className={`absolute bg-neutral-900 text-white font-medium rounded-full ${
                    viewMode === 'compact' 
                      ? 'top-2 left-2 px-1.5 py-0.5 text-xs' 
                      : 'top-3 left-3 px-2 py-1 text-xs'
                  }`} style={{ fontSize: viewMode === 'compact' ? '0.625rem' : '0.75rem' }}>
                    Nuevo
                  </span>
                )}
                {/* Botón de favorito - Oculto en vista lista */}
                {viewMode !== 'list' && (
                  <div className="absolute top-3 right-3 z-10">
                    <HeartIcon product={producto} size="md" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 md:group-hover:bg-black/5 transition-colors duration-300"></div>
              </div>

              {/* Product Info */}
              <div className={`bg-white ${
                viewMode === 'list' 
                  ? 'flex-1 space-y-2' 
                  : 'p-6 pt-0 space-y-3'
              }`}>
                <h3 className={`font-light text-neutral-900 md:group-hover:text-neutral-600 transition-colors duration-200 ${
                  viewMode === 'list' ? 'text-base' : 'text-lg pt-6'
                } ${
                  viewMode === 'compact' ? 'text-sm' : ''
                }`}>
                  {producto.name}
                </h3>
                
                {/* Rating - Oculto en vista compacta */}
                {viewMode !== 'compact' && (
                  <div className="flex items-center space-x-2">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, i) => (
                      <div key={i} className={`w-3 h-3 ${i < Math.floor(producto.rating || 0) ? 'text-yellow-400' : 'text-neutral-300'}`}>
                        <Icons.Star />
                      </div>
                    ))}
                  </div>
                    <span className="text-sm text-neutral-500 font-light">
                      {producto.rating || 0} ({producto.reviews || 0})
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className={`${viewMode === 'compact' ? 'space-y-2' : 'flex items-center justify-between'}`}>
                  <div className={`${viewMode === 'compact' ? 'flex items-center justify-between' : 'flex items-center space-x-2'}`}>
                    <span className={`font-medium text-neutral-900 ${
                      viewMode === 'compact' ? 'text-sm' : 'text-xl'
                    }`}>
                      {getCurrencySymbol(tienda.currency)} {producto.price}
                    </span>
                    {viewMode === 'compact' && (
                      <button 
                        onClick={(e) => handleAddToCart(producto, e)}
                        disabled={addingToCart === producto.id}
                        className={`w-6 h-6 rounded-full transition-all duration-200 text-xs flex items-center justify-center ${
                          addingToCart === producto.id
                            ? 'bg-green-600 text-white opacity-100'
                            : 'bg-neutral-900 text-white opacity-100 hover:bg-neutral-800'
                        }`}
                      >
                        {addingToCart === producto.id ? '✓' : '+'}
                      </button>
                    )}
                  </div>
                  {producto.comparePrice && producto.comparePrice > producto.price && viewMode === 'compact' && (
                    <span className="text-xs text-neutral-500 line-through font-light">
                      {getCurrencySymbol(tienda.currency)} {producto.comparePrice}
                    </span>
                  )}
                  {producto.comparePrice && producto.comparePrice > producto.price && viewMode !== 'compact' && (
                    <span className="text-sm text-neutral-500 line-through font-light">
                      {getCurrencySymbol(tienda.currency)} {producto.comparePrice}
                    </span>
                  )}
                  {viewMode !== 'compact' && (
                    <button 
                      onClick={(e) => handleAddToCart(producto, e)}
                      disabled={addingToCart === producto.id}
                      className={`text-sm px-4 py-2 rounded-md transition-all duration-200 ${
                        addingToCart === producto.id
                          ? 'bg-green-600 text-white opacity-100'
                          : 'bg-neutral-900 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-neutral-800'
                      }`}
                    >
                      {addingToCart === producto.id ? '✓' : 'Añadir'}
                    </button>
                  )}
                </div>
              </div>
            </Link>
          ))}
          </div>
        )}

        {productosAMostrar.length > 0 && filteredProducts.length > 8 && (
          <div className="text-center mt-12">
            {!showAllProducts ? (
              <div className="space-y-3">
                <p className="text-sm text-neutral-500">
                  Mostrando {productosAMostrar.length} de {filteredProducts.length} productos
                </p>
                <div className="flex justify-center gap-3">
                  <button 
                    onClick={handleLoadMore}
                    className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 hover:text-neutral-900 px-6 py-3 rounded-md font-medium transition-all duration-200 ease-in-out bg-transparent hover-scale"
                  >
                    Ver más productos
                  </button>
                  <button 
                    onClick={handleShowAllProducts}
                    className="bg-neutral-900 text-white hover:bg-neutral-800 px-6 py-3 rounded-md font-medium transition-all duration-200 ease-in-out hover-lift"
                  >
                    Ver todos ({filteredProducts.length})
                  </button>
                </div>
              </div>
            ) : (
              <button 
                onClick={() => {
                  setShowAllProducts(false)
                  setProductsToShow(8)
                }}
                className="border border-neutral-300 text-neutral-900 hover:bg-neutral-50 hover:text-neutral-900 px-6 py-3 rounded-md font-medium transition-all duration-200 ease-in-out bg-transparent hover-scale"
              >
                Ver menos productos
              </button>
            )}
          </div>
        )}
      </section>

      {/* Features Section */}
      <section className="bg-neutral-50 border-y border-neutral-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900">¿Por qué elegirnos?</h2>
            <p className="text-neutral-600 font-light">Comprometidos con tu satisfacción</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center space-y-4 animate-slide-up"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full shadow-neutral border border-neutral-200">
                  <div className="text-neutral-700">
                    <feature.icon />
                  </div>
                </div>
                <h3 className="text-xl font-light text-neutral-900">{feature.title}</h3>
                <p className="text-neutral-600 font-light leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8 bg-white pt-20 pb-20">
        <div className="space-y-4">
          <h2 className="text-3xl md:text-4xl font-light text-neutral-900">Mantente al día</h2>
          <p className="text-neutral-600 font-light">
            Suscríbete a nuestro newsletter y recibe las últimas novedades y ofertas exclusivas
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <div className="flex shadow-neutral rounded-lg overflow-hidden border border-neutral-200">
            <input
              type="email"
              placeholder="tu@email.com"
              className="flex-1 px-4 py-3 bg-white border-0 text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-0 font-light"
            />
            <button className="px-6 py-3 bg-neutral-900 text-white hover:bg-neutral-800 transition-colors duration-200 font-medium">
              Suscribirse
            </button>
          </div>
          <p className="text-xs text-neutral-500 mt-3 font-light">
            No spam. Solo contenido de calidad y ofertas especiales.
          </p>
        </div>
      </section>
    </div>
  )
} 