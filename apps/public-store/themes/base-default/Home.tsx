'use client'

import './styles.css'
import { useState, useEffect, useMemo, useRef } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tienda } from '../../lib/types'
import { Category } from '../../lib/categories'
import { getProductCollections, PublicCollection } from '../../lib/collections'
import { PublicProduct, generatePriceRangeOptions, applyDynamicFilters, PriceRangeOption } from '../../lib/products'
import { getStoreConfiguredFilters, extractConfiguredFilters, extractDynamicFilters, DynamicFilter } from '../../lib/store-filters'
import { useCart } from '../../lib/cart-context'
import NewsletterSection from '../../components/NewsletterSection'
import { getCurrencySymbol } from '../../lib/store'
import { getStoreBrands, PublicBrand } from '../../lib/brands'
import VideoPlayer from '../../components/VideoPlayer'
import HeartIcon from '../../components/HeartIcon'
import DynamicFilters from './DynamicFilters'

import { Grid2X2, Grid, List, ArrowRight, Star, ArrowUpDown as Sort } from 'lucide-react';

const Icons = {
  GridExpanded: Grid2X2,
  GridCompact: Grid,
  ListView: List,
  ArrowRight,
  Star,
  Sort,
};

interface HomeProps {
  tienda: Tienda
  productos?: PublicProduct[]
  categorias?: Category[]
}

// Tipos para el selector de vista
type ProductViewMode = 'expanded' | 'compact' | 'list'

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
  
  // Estado para manejar la transición de vista
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  // Estado para las marcas
  const [brands, setBrands] = useState<PublicBrand[]>([])
  const [brandsLoading, setBrandsLoading] = useState(true)
  const [isUserScrolling, setIsUserScrolling] = useState(false)
  const carouselRef = useRef<HTMLDivElement>(null)
  
  // Estado para las colecciones de productos
  const [productCollections, setProductCollections] = useState<Record<string, PublicCollection[]>>({})
  
  // Función para cambiar el modo de vista
  const handleViewModeChange = (mode: ProductViewMode) => {
    if (mode !== viewMode) {
      setIsTransitioning(true)
      
      // Pequeño delay para permitir que se vea la animación de salida
      setTimeout(() => {
        setViewMode(mode)
        if (typeof window !== 'undefined') {
          localStorage.setItem('productViewMode', mode)
        }
        
        // Reset transition state after animation completes
        setTimeout(() => {
          setIsTransitioning(false)
        }, 300)
      }, 150)
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

  // Cargar marcas
  useEffect(() => {
    const loadBrands = async () => {
      setBrandsLoading(true)
      try {
        const storeBrands = await getStoreBrands(tienda.id)
        setBrands(storeBrands)
      } catch (error) {
        console.error('Error loading brands:', error)
      } finally {
        setBrandsLoading(false)
      }
    }

    loadBrands()
  }, [tienda.id])

  // Control táctil del carrusel de marcas
  useEffect(() => {
    const carousel = carouselRef.current
    if (!carousel) return

    let touchStartX = 0
    let scrollTimeout: NodeJS.Timeout

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.touches[0].clientX
      setIsUserScrolling(true)
      clearTimeout(scrollTimeout)
    }

    const handleTouchMove = (e: TouchEvent) => {
      if (!touchStartX) return
      
      const touchCurrentX = e.touches[0].clientX
      const diffX = touchStartX - touchCurrentX
      
      // Scroll manual
      carousel.scrollLeft += diffX * 0.5 // Factor de sensibilidad
      touchStartX = touchCurrentX
    }

    const handleTouchEnd = () => {
      touchStartX = 0
      // Reanudar animación automática después de 3 segundos
      scrollTimeout = setTimeout(() => {
        setIsUserScrolling(false)
      }, 3000)
    }

    // Solo en móvil
    const isMobile = window.innerWidth < 768
    if (isMobile) {
      carousel.addEventListener('touchstart', handleTouchStart, { passive: true })
      carousel.addEventListener('touchmove', handleTouchMove, { passive: true })
      carousel.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    return () => {
      if (isMobile && carousel) {
        carousel.removeEventListener('touchstart', handleTouchStart)
        carousel.removeEventListener('touchmove', handleTouchMove)
        carousel.removeEventListener('touchend', handleTouchEnd)
      }
      clearTimeout(scrollTimeout)
    }
  }, [brands.length])

  // Cargar colecciones de productos
  useEffect(() => {
    const loadProductCollections = async () => {
      const collectionsMap: Record<string, PublicCollection[]> = {}
      
      for (const producto of productosAMostrar) {
        try {
          const collections = await getProductCollections(tienda.id, producto.id)
          collectionsMap[producto.id] = collections
        } catch (error) {
          console.error(`Error loading collections for product ${producto.id}:`, error)
          collectionsMap[producto.id] = []
        }
      }
      
      setProductCollections(collectionsMap)
    }

    if (productosAMostrar.length > 0) {
      loadProductCollections()
    }
  }, [productosAMostrar, tienda.id])

  // Función para obtener el nombre de la colección de un producto
  const getProductCollectionName = (productId: string): string | null => {
    const collections = productCollections[productId]
    if (collections && collections.length > 0) {
      return collections[0].title // Mostrar la primera colección
    }
    return null
  }

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
      <section className="relative min-h-[75vh] bg-gradient-to-b from-neutral-50 to-white pt-24 lg:pt-32 pb-8">
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
              <div className="absolute -bottom-2 -right-2 w-full h-full bg-gradient-to-br from-neutral-900/10 to-transparent rounded-2xl -z-10"></div>
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
          <div className={`grid ${getGridClasses(viewMode)} transition-all duration-300 ease-in-out ${
            isTransitioning ? 'opacity-50 scale-98' : 'opacity-100 scale-100'
          }`}>
            {productosAMostrar.map((producto, index) => (
              <Link 
                key={`${producto.id}-${viewMode}`}
                href={`/${producto.slug}`}
                className={`bg-white text-neutral-900 rounded-lg border border-neutral-200 shadow-sm md:hover:shadow-md transition-all duration-300 ease-in-out md:hover-lift group cursor-pointer block ${
                  viewMode === 'list' ? 'flex flex-row items-center gap-4 p-4' : 'flex flex-col'
                } ${
                  isTransitioning ? 'opacity-0 transform translate-y-2' : 'opacity-100 transform translate-y-0 animate-fade-in'
                }`}
                style={{ 
                  animationDelay: isTransitioning ? '0ms' : `${index * 50}ms`,
                  transitionDelay: '0ms'
                }}
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
                {/* Mostrar nombre de la colección - Oculto en vista lista */}
                {viewMode !== 'list' && getProductCollectionName(producto.id) && (
                  <span className={`absolute bg-neutral-900 text-white font-medium rounded-full ${
                    viewMode === 'compact' 
                      ? 'top-2 left-2 px-1.5 py-0.5 text-xs' 
                      : 'top-3 left-3 px-2 py-1 text-xs'
                  }`} style={{ fontSize: viewMode === 'compact' ? '0.625rem' : '0.75rem' }}>
                    {getProductCollectionName(producto.id)}
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

      {/* Newsletter Section */}
      <NewsletterSection storeId={tienda.id} className="mt-16" />

      {/* Brands Carousel Section */}
      {!brandsLoading && brands.length > 0 && (
        <section className="py-16 bg-white">
          <div className="text-center mb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-light text-neutral-900">Nuestras Marcas</h2>
          </div>
          
          <div className="relative overflow-x-auto md:overflow-x-hidden py-8 brands-carousel md:max-w-7xl md:mx-auto md:px-4 md:sm:px-6 md:lg:px-8">
            <div 
              ref={carouselRef}
              className={`flex gap-8 md:gap-12 px-4 md:px-0 ${!isUserScrolling ? 'animate-slow-scroll' : ''}`}
              style={{
                width: `${(brands.length + brands.length) * 180}px`,
                animation: !isUserScrolling ? 'slowScroll 60s linear infinite' : 'none'
              }}
            >
              {/* Duplicamos las marcas para crear el efecto de carrusel infinito */}
              {[...brands, ...brands].map((brand, index) => (
                <img
                  key={`${brand.id}-${index}`}
                  src={brand.image}
                  alt={brand.name}
                  className="flex-shrink-0 w-24 md:w-32 h-24 md:h-32 object-contain rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 bg-white filter grayscale hover:grayscale-0"
                  style={{ maxWidth: '128px', maxHeight: '128px' }}
                />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
} 