'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
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
import PetFriendlyDynamicFilters from './DynamicFilters'

interface HomeProps {
  tienda: Tienda
  productos?: PublicProduct[]
  categorias?: Category[]
}

// Iconos específicos para tema de mascotas
const PetIcons = {
  ArrowRight: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
    </svg>
  ),
  Heart: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  Star: () => (
    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  Paw: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M8.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm7 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM7 8.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm10 0c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM12 24c-2.7 0-4.9-2.2-4.9-4.9 0-1.6.8-3.1 2.2-4 .2-.1.5-.2.7-.2s.5.1.7.2c1.4.9 2.2 2.4 2.2 4 0 2.7-2.2 4.9-4.9 4.9z"/>
    </svg>
  ),
  Bowl: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M22 12c0-5.52-4.48-10-10-10S2 6.48 2 12c0 2.21.72 4.26 1.94 5.92L12 24l8.06-6.08C21.28 16.26 22 14.21 22 12zM12 4c4.41 0 8 3.59 8 8s-3.59 8-8 8-8-3.59-8-8 3.59-8 8-8z"/>
    </svg>
  ),
  Bone: () => (
    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
      <path d="M5.5 3C3.57 3 2 4.57 2 6.5 2 8.43 3.57 10 5.5 10c.34 0 .67-.06.98-.15L12 14.38l5.52-4.53c.31.09.64.15.98.15 1.93 0 3.5-1.57 3.5-3.5S20.43 3 18.5 3 15 4.57 15 6.5c0 .34.06.67.15.98L12 11.62 8.85 7.48c.09-.31.15-.64.15-.98C9 4.57 7.43 3 5.5 3z"/>
    </svg>
  ),
  Truck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Shield: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Clock: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
  Filter: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
    </svg>
  ),
  Sort: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
    </svg>
  )
}

// Carrusel publicitario con banners promocionales para mascotas
const defaultBanners = [
  {
    id: 1,
    title: "Comida Premium para Perros",
    titleEmoji: "🦴",
    subtitle: "Nutrición completa y balanceada",
    description: "Los mejores ingredientes naturales para la salud de tu mascota",
    buttonText: "Ver Productos",
    image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    backgroundColor: "from-orange-400 to-orange-600",
    textColor: "text-white"
  },
  {
    id: 2,
    title: "Alimento para Gatos",
    titleEmoji: "🐱",
    subtitle: "Sabor irresistible y saludable",
    description: "Fórmulas especiales adaptadas a cada etapa de vida",
    buttonText: "Explorar",
    image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    backgroundColor: "from-purple-400 to-purple-600",
    textColor: "text-white"
  },
  {
    id: 3,
    title: "Juguetes y Accesorios",
    titleEmoji: "🎾",
    subtitle: "Diversión garantizada",
    description: "Todo lo que necesitas para mantener feliz a tu mascota",
    buttonText: "Descubrir",
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    backgroundColor: "from-green-400 to-green-600",
    textColor: "text-white"
  },
  {
    id: 4,
    title: "Cuidado Veterinario",
    titleEmoji: "🏥",
    subtitle: "Salud y bienestar",
    description: "Productos para el cuidado y la higiene de tu compañero fiel",
    buttonText: "Ver Cuidados",
    image: "https://images.unsplash.com/photo-1587300003388-59208cc962cb?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
    backgroundColor: "from-blue-400 to-blue-600",
    textColor: "text-white"
  }
]

// Características del servicio específicas para mascotas
const petFeatures = [
  {
    icon: PetIcons.Truck,
    title: "Envío Express",
    description: "Entrega en 24-48 horas para que tu mascota no se quede sin comida"
  },
  {
    icon: PetIcons.Shield,
    title: "Productos Certificados",
    description: "Solo marcas de confianza con certificaciones veterinarias"
  },
  {
    icon: PetIcons.Clock,
    title: "Suscripción Automática",
    description: "Recibe la comida de tu mascota automáticamente cada mes"
  }
]

export default function PetFriendlyHome({ tienda, productos, categorias = [] }: HomeProps) {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [productsToShow, setProductsToShow] = useState(8)
  const [currentBanner, setCurrentBanner] = useState(0)
  const [touchStart, setTouchStart] = useState<number | null>(null)
  const [touchEnd, setTouchEnd] = useState<number | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState(0)
  const { addItem, openCart } = useCart()
  
  // Estados para filtros dinámicos
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([])
  const [priceRangeOptions, setPriceRangeOptions] = useState<PriceRangeOption[]>([])
  
  // Estados para ordenamiento
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('newest')
  const [showSort, setShowSort] = useState(false)
  
  // Ref para el dropdown de ordenamiento
  const sortRef = useRef<HTMLDivElement>(null)
  
  // Usar solo productos reales
  const allProducts = productos || []

  // Usar las imágenes del carrusel configuradas o las por defecto
  const featuredBanners = useMemo(() => {
    if (tienda?.carouselImages && tienda.carouselImages.length > 0) {
      return tienda.carouselImages
        .sort((a, b) => a.order - b.order)
        .map((image, index) => ({
          id: index + 1,
          title: defaultBanners[index % defaultBanners.length].title,
          titleEmoji: defaultBanners[index % defaultBanners.length].titleEmoji,
          subtitle: defaultBanners[index % defaultBanners.length].subtitle,
          description: defaultBanners[index % defaultBanners.length].description,
          buttonText: defaultBanners[index % defaultBanners.length].buttonText,
          image: image.url,
          backgroundColor: defaultBanners[index % defaultBanners.length].backgroundColor,
          textColor: defaultBanners[index % defaultBanners.length].textColor
        }))
    }
    return defaultBanners
  }, [tienda?.carouselImages])

  // Carrusel automático con transición más suave
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % featuredBanners.length)
    }, 6000) // Cambiado a 6 segundos para dar más tiempo a ver cada imagen
    return () => clearInterval(interval)
  }, [])

  // Manejar click outside para el dropdown de ordenamiento
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      
      // No cerrar si el clic fue dentro del sortRef
      if (sortRef.current && sortRef.current.contains(target)) {
        return
      }
      
      // No cerrar si el clic fue en algún elemento del filtro
      if (target.closest('[class*="DynamicFilters"]') || 
          target.closest('button[class*="border-neutral-200"]') ||
          target.closest('div[class*="border-neutral-100"]') ||
          target.closest('div[class*="fixed"][class*="inset-0"]')) {
        return
      }
      
      // Solo cerrar el dropdown de ordenamiento si el clic fue realmente fuera
      if (showSort) {
        setShowSort(false)
      }
    }

    if (showSort) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showSort])

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
        const subcategoryIds = subcategoriesByParent[selectedParentCategory]?.map(sub => sub.id) || []
        return allProducts.filter(producto => 
          producto.selectedParentCategoryIds?.some(catId => 
            catId === selectedParentCategory || subcategoryIds.includes(catId)
          )
        )
      } else {
        return allProducts
      }
    }
    
    const categoriaSeleccionada = categorias.find(cat => cat.slug === activeCategory)
    
    return allProducts.filter(producto => {
      if (producto.selectedParentCategoryIds && Array.isArray(producto.selectedParentCategoryIds)) {
        if (categoriaSeleccionada) {
          return producto.selectedParentCategoryIds.includes(categoriaSeleccionada.id)
        }
      }
      return false
    })
  }, [activeCategory, allProducts, categorias, selectedParentCategory, subcategoriesByParent])

  // Aplicar filtros dinámicos y ordenamiento
  const filteredProducts = useMemo(() => {
    const filtered = applyDynamicFilters(categoryFilteredProducts, dynamicFilters, priceRangeOptions)
    
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
        break
    }
    
    return filtered
  }, [categoryFilteredProducts, dynamicFilters, priceRangeOptions, sortBy])

  // Actualizar filtros dinámicos
  useEffect(() => {
    const loadFilters = async () => {
      try {
        const storeFiltersConfig = await getStoreConfiguredFilters(tienda.id)
        
        const newFilters = storeFiltersConfig.length > 0
          ? extractConfiguredFilters(categoryFilteredProducts, storeFiltersConfig)
          : extractDynamicFilters(categoryFilteredProducts)
        
        setDynamicFilters(newFilters)
        
        const newPriceRangeOptions = generatePriceRangeOptions(categoryFilteredProducts)
        setPriceRangeOptions(newPriceRangeOptions)
      } catch (error) {
        console.error('Error loading filters:', error)
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

    // Función para agregar al carrito
  const handleAddToCart = async (producto: PublicProduct) => {
    setAddingToCart(producto.id)
    
    try {
      addItem({
        id: producto.id,
        productId: producto.id,
        name: producto.name,
        price: producto.price,
        currency: tienda.currency,
        image: producto.image,
        slug: producto.slug || `producto-${producto.id}`
      }, 1)
      
      setTimeout(() => {
        openCart()
      }, 500)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setTimeout(() => {
        setAddingToCart(null)
      }, 1000)
    }
  }

  // Mínima distancia requerida para el swipe
  const minSwipeDistance = 50

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null)
    setTouchStart(e.targetTouches[0].clientX)
    setIsDragging(true)
    setDragOffset(0)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return
    
    const currentTouch = e.targetTouches[0].clientX
    const diff = touchStart - currentTouch
    
    // Limitar el arrastre al ancho de la imagen
    const maxDrag = window.innerWidth
    const boundedDiff = Math.max(Math.min(diff, maxDrag), -maxDrag)
    
    setDragOffset(boundedDiff)
    setTouchEnd(currentTouch)
  }

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd || !isDragging) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > minSwipeDistance
    const isRightSwipe = distance < -minSwipeDistance

    if (isLeftSwipe) {
      setCurrentBanner((prev) => (prev + 1) % featuredBanners.length)
    } else if (isRightSwipe) {
      setCurrentBanner((prev) => prev === 0 ? featuredBanners.length - 1 : prev - 1)
    }

    setIsDragging(false)
    setDragOffset(0)
  }

  return (
    <div className="pet-theme-home">
      {/* Carrusel Móvil - Solo visible en móvil */}
      <section className="lg:hidden relative bg-gray-50 pt-20 sm:pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div 
            className="relative h-64 sm:h-72 rounded-2xl overflow-hidden shadow-lg"
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Carrusel de imágenes */}
            <div className="relative w-full h-full">
              {featuredBanners.map((banner, index) => {
                // Calcular la posición relativa de cada imagen
                const position = index - currentBanner
                let translateX = position * 100 // Posición base en porcentaje
                
                // Ajustar la posición basada en el arrastre
                if (isDragging) {
                  const dragPercent = (dragOffset / window.innerWidth) * 100
                  translateX -= dragPercent
                }

                return (
                  <div
                    key={banner.id}
                    className="absolute inset-0 w-full h-full transition-transform duration-300"
                    style={{
                      transform: `translateX(${translateX}%)`,
                      transition: isDragging ? 'none' : 'transform 300ms ease-out'
                    }}
                  >
                    <Image
                      src={banner.image}
                      alt={banner.title}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                    {/* Overlay gradiente */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  </div>
                )
              })}
            </div>

            {/* Indicadores del carrusel */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
              {featuredBanners.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentBanner(index)}
                  className={`w-2 h-2 rounded-full transition-all duration-200 ${
                    index === currentBanner 
                      ? 'bg-white scale-125' 
                      : 'bg-white/50 hover:bg-white/75'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Hero Section */}
      <section className="relative overflow-hidden lg:pt-20">
        {/* Carrusel de fondo - Solo visible en desktop */}
        <div className="absolute inset-0 hidden lg:block">
          {featuredBanners.map((banner, index) => (
            <div
              key={banner.id}
              className={`absolute inset-0 bg-gradient-to-br ${banner.backgroundColor} transition-opacity duration-1000 ${
                index === currentBanner ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0 bg-black/20" />
            </div>
          ))}
        </div>

        {/* Contenido del Hero */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="w-full grid lg:grid-cols-2 gap-8 lg:gap-12 items-center py-8 lg:py-20">
            {/* Texto Principal */}
            <div className="space-y-6 text-center lg:text-left">
              <div className="space-y-4">
                <div className="hidden lg:flex items-center justify-center lg:justify-start space-x-2 text-white/90">
                  <PetIcons.Paw />
                  <span className="text-sm font-medium tracking-wide uppercase">
                    {tienda?.storeName || 'Pet Store'}
                  </span>
                </div>
                
                <h1 className={`text-4xl md:text-5xl lg:text-6xl font-bold leading-tight ${!selectedParentCategory ? 'text-gray-900 lg:text-white' : 'text-white'}`}>
                  {featuredBanners[currentBanner].title}
                  <span className="hidden lg:inline">{featuredBanners[currentBanner].titleEmoji} </span>
                </h1>
                
                <p className={`text-xl md:text-2xl font-medium ${!selectedParentCategory ? 'text-gray-700 lg:text-white/90' : 'text-white/90'}`}>
                  {featuredBanners[currentBanner].subtitle}
                </p>
                
                <p className={`text-lg leading-relaxed max-w-lg mx-auto lg:mx-0 ${!selectedParentCategory ? 'text-gray-600 lg:text-white/80' : 'text-white/80'}`}>
                  {featuredBanners[currentBanner].description}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button className="pet-btn-primary inline-flex items-center space-x-2 px-8 py-4 bg-orange-500 lg:bg-white text-white lg:text-orange-600 rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  <span>{featuredBanners[currentBanner].buttonText}</span>
                  <PetIcons.ArrowRight />
                </button>
                
                <button className={`pet-btn-secondary px-8 py-4 border-2 rounded-2xl font-bold text-lg transition-all duration-200 ${
                  !selectedParentCategory 
                    ? 'border-orange-500 text-orange-600 hover:bg-orange-50 lg:border-white lg:text-white lg:hover:bg-white lg:hover:text-orange-600' 
                    : 'border-white text-white hover:bg-white hover:text-orange-600'
                }`}>
                  Ver Catálogo
                </button>
              </div>
            </div>

            {/* Carrusel de Imágenes Publicitarias - Solo visible en desktop */}
            <div className="hidden lg:block relative">
              <div className="relative h-72 lg:h-96 w-full rounded-3xl overflow-hidden bg-white/10 backdrop-blur-sm shadow-2xl">
                {/* Carrusel de imágenes */}
                <div className="relative w-full h-full">
                  {featuredBanners.map((banner, index) => (
                    <div
                      key={banner.id}
                      className={`pet-carousel-item absolute inset-0 ${
                        index === currentBanner ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                      }`}
                    >
                      <Image
                        src={banner.image}
                        alt={banner.title}
                        fill
                        className="object-cover"
                        priority={index === 0}
                      />
                      {/* Overlay gradiente */}
                      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/40" />
                    </div>
                  ))}
                </div>

                {/* Controles de navegación */}
                <div className="absolute inset-y-0 left-0 flex items-center">
                  <button
                    onClick={() => setCurrentBanner((prev) => prev === 0 ? featuredBanners.length - 1 : prev - 1)}
                    className="pet-carousel-control ml-4 p-2 rounded-full bg-white/20 text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center">
                  <button
                    onClick={() => setCurrentBanner((prev) => (prev + 1) % featuredBanners.length)}
                    className="pet-carousel-control mr-4 p-2 rounded-full bg-white/20 text-white"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>

                {/* Indicadores de posición del carrusel de imágenes */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  {featuredBanners.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentBanner(index)}
                      className={`pet-carousel-indicator w-2 h-2 rounded-full ${
                        index === currentBanner 
                          ? 'bg-white scale-125' 
                          : 'bg-white/50 hover:bg-white/75'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Indicadores del carrusel - Solo visible en desktop */}
        <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20 hidden lg:flex">
          {featuredBanners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentBanner(index)}
              className={`w-3 h-3 rounded-full transition-all duration-200 ${
                index === currentBanner 
                  ? 'bg-white scale-125' 
                  : 'bg-white/50 hover:bg-white/75'
              }`}
            />
          ))}
        </div>
      </section>

      {/* Características del Servicio */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {petFeatures.map((feature, index) => (
              <div 
                key={index}
                className="pet-feature-card bg-white rounded-2xl p-6 text-center shadow-sm hover:shadow-md transition-shadow duration-200"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 text-orange-600 rounded-xl mb-4">
                  <feature.icon />
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Categorías de Productos */}
      <section className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-4 mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              <span className="hidden lg:inline">🐾 </span>Categorías para tu Mascota
            </h2>
            <p className="text-gray-600 text-lg">Encuentra todo lo que necesitas organizadamente</p>
          </div>

          {/* Breadcrumb navigation */}
          {selectedParentCategory && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <button
                onClick={handleBackToParentCategories}
                className="text-sm text-gray-500 hover:text-orange-600 transition-colors"
              >
                Categorías
              </button>
              <span className="text-gray-300">›</span>
              <span className="text-sm text-gray-900 font-medium">
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
                  className={`pet-category-pill px-6 py-3 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center ${
                    activeCategory === category
                      ? 'bg-orange-500 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-orange-100 hover:text-orange-700'
                  }`}
                >
                  {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                  {hasSubcategories && (
                    <span className="ml-1">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* Grilla de Productos */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Filtros y contador de productos */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div>
              <p className="text-gray-600 font-medium">
                {productosAMostrar.length === 0 
                  ? `No hay productos en la categoría "${categoryNames[activeCategory] || activeCategory}"`
                  : showAllProducts || filteredProducts.length <= 8
                    ? `Mostrando ${productosAMostrar.length} ${productosAMostrar.length === 1 ? 'producto' : 'productos'} ${activeCategory !== 'todos' ? `en "${categoryNames[activeCategory] || activeCategory}"` : ''}`
                    : `Mostrando ${productosAMostrar.length} de ${filteredProducts.length} productos ${activeCategory !== 'todos' ? `en "${categoryNames[activeCategory] || activeCategory}"` : ''}`
                }
              </p>
            </div>
            
            {/* Filtros y ordenamiento */}
            <div className="flex items-center gap-3">
                             {/* Filtros dinámicos */}
               {dynamicFilters.length > 0 && (
                 <PetFriendlyDynamicFilters
                   filters={dynamicFilters}
                   priceRangeOptions={priceRangeOptions}
                   onFiltersChange={handleFiltersChange}
                   onPriceRangeChange={handlePriceRangeChange}
                   onClearFilters={handleClearFilters}
                 />
               )}

              {/* Ordenamiento */}
              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setShowSort(!showSort)}
                  className="flex items-center space-x-2 px-4 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <PetIcons.Sort />
                  <span className="text-sm font-medium">Ordenar</span>
                </button>
                
                {showSort && (
                  <div 
                    className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-200 z-40"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <div className="p-2 space-y-1">
                      {[
                        { value: 'newest', label: 'Más recientes' },
                        { value: 'name', label: 'Nombre A-Z' },
                        { value: 'price-low', label: 'Precio: menor a mayor' },
                        { value: 'price-high', label: 'Precio: mayor a menor' }
                      ].map((option) => (
                        <button
                          key={option.value}
                          onClick={() => {
                            setSortBy(option.value as any)
                            setShowSort(false)
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            sortBy === option.value 
                              ? 'bg-orange-50 text-orange-700 font-medium' 
                              : 'text-gray-700 hover:bg-gray-50'
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
          </div>

          {/* Grid de productos */}
          {productosAMostrar.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
              {productosAMostrar.map((producto, index) => (
                <div 
                  key={producto.id}
                  className="pet-product-card bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 group overflow-hidden"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Link href={`/${producto.slug}`} className="block">
                    {/* Imagen del producto */}
                    <div className="relative aspect-square overflow-hidden rounded-t-2xl bg-gray-100">
                      {producto.mediaFiles && producto.mediaFiles.length > 0 && producto.mediaFiles[0].type === 'video' ? (
                        <VideoPlayer
                          src={producto.mediaFiles[0].url}
                          alt={producto.name}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          showControls={false}
                          autoPlay={true}
                          loop={true}
                          muted={true}
                          playsInline={true}
                          preload="metadata"
                        />
                      ) : (
                        <Image
                          src={producto.image}
                          alt={producto.name}
                          fill
                          className="object-cover transition-transform duration-300 group-hover:scale-110"
                        />
                      )}
                      
                      {/* Badge nuevo */}
                      <span className="absolute top-3 left-3 bg-orange-500 text-white text-xs font-bold px-2 py-1 rounded-lg">
                        Nuevo
                      </span>
                      
                                             {/* Botón de favorito */}
                       <div className="absolute top-3 right-3">
                         <HeartIcon 
                           product={producto}
                           className="w-8 h-8 p-1.5 bg-white/90 hover:bg-white rounded-full shadow-sm transition-all duration-200"
                         />
                       </div>
                    </div>
                  </Link>

                  {/* Información del producto */}
                  <div className="p-4 space-y-3">
                    <Link href={`/${producto.slug}`}>
                      <h3 className="font-bold text-gray-900 text-sm md:text-base line-clamp-2 group-hover:text-orange-600 transition-colors">
                        {producto.name}
                      </h3>
                    </Link>

                    {/* Rating */}
                    <div className="flex items-center space-x-1">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className={`w-3 h-3 ${i < Math.floor(producto.rating || 4.5) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          <PetIcons.Star />
                        </div>
                      ))}
                      <span className="text-xs text-gray-500 ml-1">
                        ({producto.reviews || 24})
                      </span>
                    </div>

                    {/* Precio */}
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <span className="text-lg md:text-xl font-bold text-orange-600">
                          {getCurrencySymbol(tienda.currency)}{producto.price}
                        </span>
                        {producto.comparePrice && producto.comparePrice > producto.price && (
                          <span className="text-sm text-gray-500 line-through">
                            {getCurrencySymbol(tienda.currency)}{producto.comparePrice}
                          </span>
                        )}
                      </div>
                      
                      {/* Botón agregar al carrito */}
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          handleAddToCart(producto)
                        }}
                        disabled={addingToCart === producto.id}
                        className="pet-add-to-cart-btn bg-orange-500 hover:bg-orange-600 text-white p-2 rounded-xl transition-all duration-200 disabled:opacity-50"
                      >
                        {addingToCart === producto.id ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🐾</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">No hay productos disponibles</h3>
              <p className="text-gray-600">Intenta cambiar los filtros o explora otras categorías</p>
            </div>
          )}

          {/* Botones de cargar más */}
          {!showAllProducts && filteredProducts.length > productosAMostrar.length && (
            <div className="text-center mt-12 space-y-4">
              <button
                onClick={handleLoadMore}
                className="pet-btn-secondary px-8 py-3 border-2 border-orange-500 text-orange-600 rounded-xl font-bold hover:bg-orange-50 transition-all duration-200"
              >
                Cargar más productos
              </button>
              
              {filteredProducts.length > 16 && (
                <button
                  onClick={handleShowAllProducts}
                  className="block mx-auto text-sm text-gray-600 hover:text-orange-600 transition-colors"
                >
                  Ver todos los {filteredProducts.length} productos
                </button>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-gradient-to-br from-orange-500 to-orange-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <div className="space-y-6">
            <div className="hidden lg:block text-4xl">📧</div>
            <h2 className="text-3xl md:text-4xl font-bold">
              ¡Mantente al día con las mejores ofertas!
            </h2>
            <p className="text-xl text-orange-100">
              Suscríbete y recibe descuentos exclusivos, nuevos productos y consejos para el cuidado de tu mascota
            </p>
          </div>

          <div className="max-w-md mx-auto mt-8">
            <div className="flex gap-3">
              <input
                type="email"
                placeholder="tu@email.com"
                className="flex-1 px-4 py-3 rounded-xl border-0 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white text-lg"
              />
              <button className="px-6 py-3 bg-white text-orange-600 rounded-xl font-bold hover:bg-gray-50 transition-colors shadow-lg">
                Suscribirse
              </button>
            </div>
            <p className="text-xs text-orange-100 mt-3">
              Sin spam. Solo contenido de calidad y ofertas especiales. 🐾
            </p>
          </div>
        </div>
      </section>
    </div>
  )
} 