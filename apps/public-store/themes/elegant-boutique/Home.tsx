'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Tienda } from '../../lib/types'
import { Category } from '../../lib/categories'
import { PublicProduct, generatePriceRangeOptions, applyDynamicFilters, PriceRangeOption } from '../../lib/products'
import { getStoreConfiguredFilters, extractConfiguredFilters, extractDynamicFilters, DynamicFilter } from '../../lib/store-filters'
import { PublicCollection, getStoreCollections } from '../../lib/collections'
import { useCart } from '../../lib/cart-context'
import { getCurrencySymbol } from '../../lib/store'
import { subscribeToNewsletter } from '../../lib/newsletter'
import VideoPlayer from '../../components/VideoPlayer'
import HeartIcon from '../../components/HeartIcon'
import ProductSortFilter from './ProductSortFilter'
import './styles.css'

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
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
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
  Sort: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 7.5L7.5 3m0 0L12 7.5M7.5 3v13.5m13.5 0L16.5 21m0 0L12 16.5m4.5 4.5V7.5" />
    </svg>
  ),
  ShieldCheck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  ),
  Truck: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 01-1.125-1.125V14.25m15.75 4.5a1.5 1.5 0 01-3 0m3 0a1.5 1.5 0 00-3 0m3 0h1.125A1.125 1.125 0 0021 18.75v-3.375m0 0V14.25m0 0H9.75M21 14.25v2.25" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
    </svg>
  ),
  Sparkles: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
    </svg>
  ),
  Crown: () => (
    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 12.75l-2.5-5L12 9.75l3.25-2L18 12.75m-9.75 0L5.5 21.5h13l-2.75-8.75m-9.75 0h9.75" />
    </svg>
  ),
}

export default function ElegantBoutiqueHome({ tienda, productos, categorias = [] }: HomeProps) {
  const [activeCategory, setActiveCategory] = useState('todos')
  const [addingToCart, setAddingToCart] = useState<string | null>(null)
  const [selectedParentCategory, setSelectedParentCategory] = useState<string | null>(null)
  const [showAllProducts, setShowAllProducts] = useState(false)
  const [productsToShow, setProductsToShow] = useState(8)
  const { addItem, openCart } = useCart()
  
  // Estados para filtros dinámicos
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([])
  const [priceRangeOptions, setPriceRangeOptions] = useState<PriceRangeOption[]>([])
  
  // Estados para ordenamiento
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('newest')
  const [showSort, setShowSort] = useState(false)
  
  // Estado para colecciones
  const [collections, setCollections] = useState<PublicCollection[]>([])
  const [productCollections, setProductCollections] = useState<Record<string, PublicCollection[]>>({})
  
  // Estado para detectar si estamos en móvil
  const [isMobile, setIsMobile] = useState(() => {
    if (typeof window !== 'undefined') {
      return window.innerWidth < 1024
    }
    return false
  })

  // Estados para newsletter
  const [newsletterEmail, setNewsletterEmail] = useState('')
  const [newsletterSubmitting, setNewsletterSubmitting] = useState(false)
  const [newsletterMessage, setNewsletterMessage] = useState('')
  
  // Estado para el selector de vista (solo móvil)
  const [viewMode, setViewMode] = useState<ProductViewMode>(() => {
    if (typeof window !== 'undefined') {
      // En móvil usar localStorage, en escritorio siempre 'compact'
      const mobile = window.innerWidth < 1024
      if (mobile) {
        return (localStorage.getItem('productViewMode') as ProductViewMode) || 'expanded'
      } else {
        return 'compact' // Siempre compact en escritorio
      }
    }
    return 'expanded'
  })
  
  // Función para cambiar el modo de vista (solo móvil)
  const handleViewModeChange = (mode: ProductViewMode) => {
    if (isMobile) {
      setViewMode(mode)
      if (typeof window !== 'undefined') {
        localStorage.setItem('productViewMode', mode)
      }
    }
    // En escritorio no hacer nada, mantener 'compact'
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
        return 'grid-boutique-products' // Clase existente (1 columna en móvil)
      case 'compact':
        return 'grid-boutique-products-compact' // Nueva clase (2 columnas en móvil)
      case 'list':
        return 'grid-boutique-products-list' // Nueva clase (lista)
      default:
        return 'grid-boutique-products'
    }
  }
  
  const allProducts = productos || []

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

  // Determinar qué categorías mostrar
  const categoriesToShow = selectedParentCategory 
    ? subcategoriesByParent[selectedParentCategory] || []
    : parentCategories

  // Crear la lista de categorías para mostrar en las pastillas
  const categories = ['todos', ...categoriesToShow.map(cat => cat.slug)]
  
  const categoryNames: Record<string, string> = { 
    'todos': selectedParentCategory ? 'Toda la colección' : 'Toda la colección',
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

  // Cargar colecciones
  useEffect(() => {
    const loadCollections = async () => {
      try {
        const storeCollections = await getStoreCollections(tienda.id)
        setCollections(storeCollections)
        
        // Crear un mapa de productos a sus colecciones
        const productCollectionsMap: Record<string, PublicCollection[]> = {}
        
        allProducts.forEach(product => {
          const productColls = storeCollections.filter(collection => 
            collection.productIds.includes(product.id)
          )
          if (productColls.length > 0) {
            productCollectionsMap[product.id] = productColls
          }
        })
        
        setProductCollections(productCollectionsMap)
      } catch (error) {
        console.error('Error loading collections:', error)
      }
    }
    
    if (tienda.id && allProducts.length > 0) {
      loadCollections()
    }
  }, [tienda.id, allProducts])

  // Asegurar que en escritorio siempre se use 'compact' y actualizar isMobile
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined') {
        const mobile = window.innerWidth < 1024
        setIsMobile(mobile)
        
        if (!mobile && viewMode !== 'compact') {
          setViewMode('compact')
        }
      }
    }

    // Verificar al montar y al cambiar tamaño de ventana
    handleResize()
    window.addEventListener('resize', handleResize)
    
    return () => window.removeEventListener('resize', handleResize)
  }, [viewMode])

  // Funciones para cargar más productos
  const handleLoadMore = () => {
    const newProductsToShow = productsToShow + 8
    if (newProductsToShow >= filteredProducts.length) {
      setShowAllProducts(true)
    } else {
      setProductsToShow(newProductsToShow)
    }
  }

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

  // Función para manejar suscripción a newsletter
  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newsletterEmail.trim()) {
      setNewsletterMessage('Por favor, introduce tu email')
      return
    }

    if (!tienda?.id) {
      setNewsletterMessage('Error: Tienda no disponible')
      return
    }

    setNewsletterSubmitting(true)
    setNewsletterMessage('')

    try {
      const result = await subscribeToNewsletter(tienda.id, newsletterEmail, 'home')
      setNewsletterMessage(result.message)
      
      if (result.success) {
        setNewsletterEmail('')
        // Limpiar mensaje después de 5 segundos
        setTimeout(() => setNewsletterMessage(''), 5000)
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error)
      setNewsletterMessage('Hubo un error inesperado. Por favor, inténtalo de nuevo.')
    } finally {
      setNewsletterSubmitting(false)
    }
  }

  // Función para obtener la etiqueta dinámica de un producto
  const getProductBadge = (producto: PublicProduct) => {
    const productColls = productCollections[producto.id] || []
    
    if (productColls.length > 0) {
      // Priorizar ciertas colecciones por orden de importancia
      const priorityOrder = ['ofertas', 'descuentos', 'novedades', 'nuevo', 'destacado', 'popular']
      
      // Buscar si tiene alguna colección prioritaria
      for (const priority of priorityOrder) {
        const priorityCollection = productColls.find(coll => 
          coll.title.toLowerCase().includes(priority) || 
          coll.slug.toLowerCase().includes(priority)
        )
        if (priorityCollection) {
          return {
            text: priorityCollection.title.toUpperCase(),
            type: priority
          }
        }
      }
      
      // Si no tiene colecciones prioritarias, usar la primera disponible
      return {
        text: productColls[0].title.toUpperCase(),
        type: 'default'
      }
    }
    
    // Si no pertenece a ninguna colección, no mostrar etiqueta
    return null
  }

  const features = [
    {
      icon: Icons.ShieldCheck,
      title: 'Autenticidad Garantizada',
      description: 'Cada producto es verificado y garantizamos su autenticidad'
    },
    {
      icon: Icons.Truck,
      title: 'Envío Premium',
      description: 'Entrega express con empaque elegante y cuidado especial'
    },
    {
      icon: Icons.Crown,
      title: 'Servicio Exclusivo',
      description: 'Atención personalizada y experiencia de lujo garantizada'
    }
  ]

  const handleAddToCart = async (producto: PublicProduct, event: React.MouseEvent) => {
    event.preventDefault()
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
      
      setTimeout(() => {
        setAddingToCart(null)
        openCart()
      }, 800)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setAddingToCart(null)
    }
  }

  return (
    <div style={{ backgroundColor: 'rgb(var(--theme-neutral-light))' }}>
      {/* Hero Section */}
      <section className="relative overflow-hidden" style={{ 
        minHeight: '85vh',
        background: `linear-gradient(135deg, rgb(var(--theme-secondary)) 0%, rgb(var(--theme-neutral-light)) 100%)`
      }}>
        {/* Contenido */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-6 md:pt-16 lg:pt-20">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center min-h-[65vh]">
            
            {/* Columna izquierda - Contenido de texto */}
            <div className="space-y-8 text-center lg:text-left">
              <div className="space-y-6 animate-fadeInUp">
                <h1 
                  className="text-4xl md:text-6xl lg:text-7xl font-light text-serif tracking-tight leading-tight"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  {tienda?.storeName || 'Elegancia Atemporal'}
                </h1>
                <p 
                  className="text-lg md:text-xl lg:text-2xl font-light leading-relaxed max-w-xl mx-auto lg:mx-0 text-sans"
                  style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                >
                  {tienda?.description || 'Descubre nuestra exclusiva colección de productos premium, cuidadosamente seleccionados para quienes aprecian la verdadera elegancia'}
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start items-center animate-fadeInUp" style={{ animationDelay: '0.3s' }}>
                <button 
                  className="btn-boutique-primary inline-flex items-center space-x-2"
                  onClick={() => {
                    const productsSection = document.getElementById('productos-section')
                    if (productsSection) {
                      productsSection.scrollIntoView({ behavior: 'smooth' })
                    }
                  }}
                >
                  <Icons.Sparkles />
                  <span>Explorar Colección</span>
                  <Icons.ArrowRight />
                </button>
                <button className="btn-boutique-outline">
                  Ver Ofertas Exclusivas
                </button>
              </div>
            </div>

            {/* Columna derecha - Imagen hero */}
            <div className="relative lg:h-[70vh] h-[50vh] order-first lg:order-last">
              <div className="relative w-full h-full rounded-sm overflow-hidden" style={{ boxShadow: 'var(--theme-shadow-lg)' }}>
                {tienda?.heroImageUrl ? (
                  <div className="product-image-boutique w-full h-full">
                    <img 
                      src={tienda.heroImageUrl} 
                      alt={`${tienda.storeName} - Imagen principal`}
                      className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
                    />
                  </div>
                ) : (
                  <div 
                    className="w-full h-full flex items-center justify-center"
                    style={{ 
                      background: `linear-gradient(45deg, rgb(var(--theme-secondary)), rgb(var(--theme-neutral-50)))`
                    }}
                  >
                    <div className="text-center space-y-4">
                      <div 
                        className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                        style={{ backgroundColor: 'rgb(var(--theme-accent) / 0.1)' }}
                      >
                        <Icons.Crown />
                      </div>
                      <p className="font-light text-serif" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                        Imagen de colección
                      </p>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Elemento decorativo */}
              <div 
                className="absolute -bottom-6 -right-6 w-full h-full rounded-sm -z-10"
                style={{ 
                  background: `linear-gradient(135deg, rgb(var(--theme-accent) / 0.1) 0%, transparent 50%)`
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Elementos decorativos */}
        <div className="absolute top-20 right-20 w-2 h-2 rounded-full animate-pulse hidden lg:block" style={{ backgroundColor: 'rgb(var(--theme-accent) / 0.4)' }}></div>
        <div className="absolute bottom-32 left-16 w-1 h-1 rounded-full animate-pulse hidden lg:block" style={{ backgroundColor: 'rgb(var(--theme-accent) / 0.6)' }}></div>
      </section>

      {/* Separador elegante */}
      <div className="separator-elegant"></div>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '2rem 1rem' }}>
        <div className="text-center space-y-6 mb-8">
          <h2 
            className="text-3xl md:text-4xl font-light text-serif"
            style={{ color: 'rgb(var(--theme-neutral-dark))' }}
          >
            Explorar por Categoría
          </h2>
          <p 
            className="font-light text-sans"
            style={{ color: 'rgb(var(--theme-neutral-medium))' }}
          >
            Encuentra la pieza perfecta para tu estilo
          </p>
        </div>

        {/* Breadcrumb navigation */}
        {selectedParentCategory && (
          <div className="flex items-center justify-center gap-3 mb-8">
            <button
              onClick={handleBackToParentCategories}
              className="text-sm hover-elegant transition-colors text-sans"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              Categorías
            </button>
            <span style={{ color: 'rgb(var(--theme-accent))' }}>›</span>
            <span className="text-sm font-medium text-sans" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              {parentCategories.find(cat => cat.id === selectedParentCategory)?.name}
            </span>
          </div>
        )}

        {/* Category pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-6">
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
                className={`px-6 py-3 rounded-sm font-medium transition-all duration-300 flex items-center text-sans ${
                  activeCategory === category
                    ? 'text-primary'
                    : 'text-secondary'
                }`}
                style={{
                  backgroundColor: activeCategory === category 
                    ? 'rgb(var(--theme-primary))' 
                    : 'rgb(var(--theme-secondary))',
                  color: activeCategory === category 
                    ? 'rgb(var(--theme-neutral-light))' 
                    : 'rgb(var(--theme-neutral-medium))',
                  border: activeCategory === category 
                    ? 'none' 
                    : '1px solid rgb(var(--theme-primary) / 0.2)'
                }}
              >
                {categoryNames[category] || category.charAt(0).toUpperCase() + category.slice(1)}
                {hasSubcategories && (
                  <span className="ml-2">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </section>

      {/* Products Grid */}
      <section id="productos-section" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8" style={{ padding: '1rem 1rem' }}>
        {/* Filtros y contador */}
        <div className="mb-8 flex flex-col sm:flex-row justify-between items-center gap-6">
          <div className="text-center sm:text-left">
            <p className="font-light text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
              {productosAMostrar.length === 0 
                ? `No hay productos en "${categoryNames[activeCategory] || activeCategory}"`
                : showAllProducts || filteredProducts.length <= 8
                  ? `${productosAMostrar.length} ${productosAMostrar.length === 1 ? 'pieza elegante' : 'piezas elegantes'} ${activeCategory !== 'todos' ? `en "${categoryNames[activeCategory] || activeCategory}"` : ''}`
                  : `${productosAMostrar.length} de ${filteredProducts.length} piezas ${activeCategory !== 'todos' ? `en "${categoryNames[activeCategory] || activeCategory}"` : ''}`
              }
            </p>
          </div>
          
          {/* Filtros dinámicos y ordenamiento */}
          <div className="flex items-center gap-6">
            <ProductSortFilter
              filters={dynamicFilters}
              priceRangeOptions={priceRangeOptions}
              onFiltersChange={handleFiltersChange}
              onPriceRangeChange={handlePriceRangeChange}
              onClearFilters={handleClearFilters}
              sortBy={sortBy}
              onSortChange={setSortBy}
              showViewSelector={isMobile}
              viewMode={viewMode}
              onViewModeChange={handleViewModeChange}
            />
          </div>
        </div>

        {productosAMostrar.length === 0 ? (
          /* Sin productos */
          <div className="col-span-full flex flex-col items-center justify-center text-center" style={{ padding: 'var(--theme-section-padding) 0' }}>
            <div 
              className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
              style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}
            >
              <Icons.Sparkles />
            </div>
            <h3 className="text-xl font-medium mb-3 text-serif" style={{ color: 'rgb(var(--theme-neutral-dark))' }}>
              No hay productos en esta categoría
            </h3>
            <p className="mb-8 text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
              Explora otras categorías o descubre toda nuestra colección.
            </p>
            <button 
              onClick={() => setActiveCategory('todos')}
              className="btn-boutique-primary"
            >
              Ver toda la colección
            </button>
          </div>
        ) : (
          <div className={`grid-boutique ${getGridClasses(viewMode)}`}>
            {productosAMostrar.map((producto, index) => (
              <Link 
                key={producto.id} 
                href={`/${producto.slug}`}
                className={`card-boutique group cursor-pointer block animate-fadeInUp ${
                  viewMode === 'compact' ? 'product-card-compact' : 
                  viewMode === 'list' ? 'product-card-list' : ''
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Product Image */}
                <div className={`relative overflow-hidden rounded-sm product-image ${
                  viewMode === 'list' ? 'w-20 h-20' : 'aspect-square mb-6'
                }`} style={{ backgroundColor: 'rgb(var(--theme-secondary))' }}>
                  {producto.mediaFiles && producto.mediaFiles.length > 0 && producto.mediaFiles[0].type === 'video' ? (
                    <VideoPlayer
                      src={producto.mediaFiles[0].url}
                      alt={producto.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      showControls={false}
                      autoPlay={true}
                      loop={true}
                      muted={true}
                      playsInline={true}
                      preload="metadata"
                      poster={producto.mediaFiles[0].url.replace(/\.(mp4|webm|mov)$/, '.jpg')}
                    />
                  ) : (
                    <div className="product-image-boutique w-full h-full">
                      <Image
                        src={producto.image}
                        alt={producto.name}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  )}
                  {/* Badge dinámico - Oculto en vista lista */}
                  {viewMode !== 'list' && (() => {
                    const badge = getProductBadge(producto)
                    return badge ? (
                      <span className={`product-badge-boutique badge-${badge.type}`}>
                        {badge.text}
                      </span>
                    ) : null
                  })()}
                  {/* Botón de favorito - Oculto en vista compacta y lista */}
                  {viewMode !== 'compact' && viewMode !== 'list' && (
                    <div className="absolute top-3 right-3 z-10">
                      <HeartIcon product={producto} size="md" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-500"></div>
                </div>

                {/* Product Info */}
                <div className={`product-info ${
                  viewMode === 'list' ? 'flex-1' : 'space-y-4'
                }`}>
                  <h3 
                    className={`font-medium group-hover:color-accent transition-colors duration-300 text-serif product-title ${
                      viewMode === 'compact' ? 'text-sm' : viewMode === 'list' ? 'text-base' : 'text-lg'
                    }`}
                    style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                  >
                    {producto.name}
                  </h3>
                  
                  {/* Rating - Oculto en vista compacta */}
                  {viewMode !== 'compact' && (
                    <div className="flex items-center space-x-2">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <div 
                            key={i} 
                            className="w-3 h-3"
                            style={{ 
                              color: i < Math.floor(producto.rating || 0) 
                                ? 'rgb(var(--theme-accent))' 
                                : 'rgb(var(--theme-neutral-medium) / 0.3)' 
                            }}
                          >
                            <Icons.Star />
                          </div>
                        ))}
                      </div>
                      <span className="text-sm font-light text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                        {producto.rating || 0} ({producto.reviews || 0})
                      </span>
                    </div>
                  )}

                  {/* Price */}
                  <div className={`${viewMode === 'list' ? 'product-price-section' : viewMode === 'compact' ? 'space-y-2' : 'flex items-center justify-between'}`}>
                    <div className={`${viewMode === 'compact' ? 'flex items-center justify-between' : 'flex items-center space-x-2'}`}>
                      <span className={`font-medium text-serif product-price ${
                        viewMode === 'compact' ? 'text-sm' : 'text-xl'
                      }`} style={{ color: 'rgb(var(--theme-accent))' }}>
                        {getCurrencySymbol(tienda.currency)} {producto.price}
                      </span>
                      {viewMode === 'compact' && (
                        <button 
                          onClick={(e) => handleAddToCart(producto, e)}
                          disabled={addingToCart === producto.id}
                          className="w-6 h-6 rounded-full transition-all duration-300 text-xs flex items-center justify-center opacity-100"
                          style={{
                            backgroundColor: addingToCart === producto.id 
                              ? 'rgb(var(--theme-success))' 
                              : 'rgb(var(--theme-primary))',
                            color: 'rgb(var(--theme-neutral-light))'
                          }}
                        >
                          {addingToCart === producto.id ? '✓' : '+'}
                        </button>
                      )}
                    </div>
                    {producto.comparePrice && producto.comparePrice > producto.price && viewMode === 'compact' && (
                      <span className="text-xs line-through font-light text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                        {getCurrencySymbol(tienda.currency)} {producto.comparePrice}
                      </span>
                    )}
                    {producto.comparePrice && producto.comparePrice > producto.price && viewMode !== 'compact' && (
                      <span className="text-sm line-through font-light text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                        {getCurrencySymbol(tienda.currency)} {producto.comparePrice}
                      </span>
                    )}
                    {viewMode !== 'compact' && (
                      <button 
                        onClick={(e) => handleAddToCart(producto, e)}
                        disabled={addingToCart === producto.id}
                        className={`rounded-sm transition-all duration-300 text-sans product-button ${
                          viewMode === 'list' ? 'text-sm px-4 py-2' : 'text-sm px-4 py-2'
                        } ${
                          addingToCart === producto.id
                            ? 'bg-success text-white opacity-100'
                            : viewMode === 'list' ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: addingToCart === producto.id 
                            ? 'rgb(var(--theme-success))' 
                            : 'rgb(var(--theme-primary))',
                          color: 'rgb(var(--theme-neutral-light))'
                        }}
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
          <div className="text-center mt-16">
            {!showAllProducts ? (
              <div className="space-y-4">
                <p className="text-sm text-sans" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
                  Mostrando {productosAMostrar.length} de {filteredProducts.length} productos
                </p>
                <div className="flex justify-center gap-4">
                  <button 
                    onClick={handleLoadMore}
                    className="btn-boutique-secondary"
                  >
                    Ver más productos
                  </button>
                  <button 
                    onClick={handleShowAllProducts}
                    className="btn-boutique-primary"
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
                className="btn-boutique-secondary"
              >
                Ver menos productos
              </button>
            )}
          </div>
        )}
      </section>

      {/* Separador elegante */}
      <div className="separator-elegant"></div>

      {/* Features Section */}
      <section style={{ 
        backgroundColor: 'rgb(var(--theme-secondary))',
        padding: 'var(--theme-section-padding) 0'
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center space-y-6 mb-20">
            <h2 
              className="text-3xl md:text-4xl font-light text-serif"
              style={{ color: 'rgb(var(--theme-neutral-dark))' }}
            >
              La Experiencia Boutique
            </h2>
            <p 
              className="font-light text-sans"
              style={{ color: 'rgb(var(--theme-neutral-medium))' }}
            >
              Comprometidos con la excelencia en cada detalle
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center space-y-6 animate-fadeInUp"
                style={{ animationDelay: `${index * 200}ms` }}
              >
                <div 
                  className="inline-flex items-center justify-center w-20 h-20 rounded-full"
                  style={{ 
                    backgroundColor: 'rgb(var(--theme-neutral-light))',
                    boxShadow: 'var(--theme-shadow-sm)'
                  }}
                >
                  <div style={{ color: 'rgb(var(--theme-accent))' }}>
                    <feature.icon />
                  </div>
                </div>
                <h3 
                  className="text-xl font-medium text-serif"
                  style={{ color: 'rgb(var(--theme-neutral-dark))' }}
                >
                  {feature.title}
                </h3>
                <p 
                  className="font-light leading-relaxed text-sans"
                  style={{ color: 'rgb(var(--theme-neutral-medium))' }}
                >
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center" style={{ padding: 'var(--theme-section-padding) 1rem' }}>
        <div className="space-y-6">
          <h2 
            className="text-3xl md:text-4xl font-light text-serif"
            style={{ color: 'rgb(var(--theme-neutral-dark))' }}
          >
            Únete a Nuestra Comunidad Exclusiva
          </h2>
          <p 
            className="font-light text-sans"
            style={{ color: 'rgb(var(--theme-neutral-medium))' }}
          >
            Suscríbete para recibir acceso anticipado a nuevas colecciones y ofertas exclusivas
          </p>
        </div>

        <div className="max-w-md mx-auto mt-8">
          <form onSubmit={handleNewsletterSubmit} className="space-y-4">
            <input
              type="email"
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="tu@email.com"
              className="input-boutique"
              disabled={newsletterSubmitting}
              required
            />
            <button 
              type="submit"
              disabled={newsletterSubmitting || !newsletterEmail.trim()}
              className="w-full btn-boutique-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {newsletterSubmitting ? 'Suscribiendo...' : 'Suscribirse a la Newsletter'}
            </button>
          </form>
          
          {newsletterMessage && (
            <p 
              className={`text-sm mt-3 text-center ${
                newsletterMessage.includes('Gracias') || newsletterMessage.includes('Ya estás') 
                  ? 'text-green-600' 
                  : 'text-red-600'
              }`}
            >
              {newsletterMessage}
            </p>
          )}
          
          {!newsletterMessage && (
            <p className="text-xs mt-4 font-light text-sans text-center" style={{ color: 'rgb(var(--theme-neutral-medium))' }}>
              Contenido exclusivo, sin spam. Solo elegancia y calidad.
            </p>
          )}
        </div>
      </section>
    </div>
  )
} 