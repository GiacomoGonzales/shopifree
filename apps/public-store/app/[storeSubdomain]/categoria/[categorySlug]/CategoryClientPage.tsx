'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'

import { getCurrencySymbol } from '../../../../lib/store'
import HeartIcon from '../../../../components/HeartIcon'
import VideoPlayer from '../../../../components/VideoPlayer'
import Breadcrumbs from '../../../../components/Breadcrumbs'
import { setNavigationContext } from '../../../../lib/hooks/useBreadcrumbs'
import { CartProvider, useCart } from '../../../../lib/cart-context'
import { ThemeLayoutComponent, ThemeLayoutProps } from '../../../../themes/theme-component'
import { getStoreCategories, Category } from '../../../../lib/categories'
import { getStoreProducts, PublicProduct, generatePriceRangeOptions, applyDynamicFilters, PriceRangeOption } from '../../../../lib/products'
import { getStoreConfiguredFilters, extractConfiguredFilters, extractDynamicFilters, DynamicFilter } from '../../../../lib/store-filters'
import { PublicCollection, getStoreCollections } from '../../../../lib/collections'
import { Tienda } from '../../../../lib/types'

import ProductSortFilter from '../../../../themes/elegant-boutique/ProductSortFilter'

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

// Tipos para el selector de vista
type ProductViewMode = 'expanded' | 'compact' | 'list'



// Iconos para filtros
const Icons = {
  Filter: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.707A1 1 0 013 7V4z" />
    </svg>
  ),
  Sort: () => (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
    </svg>
  ),
  ChevronDown: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
    </svg>
  ),
  X: () => (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
    </svg>
  )
}

// Tipos para filtros


interface CategoryClientPageProps {
  categorySlug: string
  tienda: Tienda
  locale: 'es' | 'en'
}

const CategoryClientPage = ({ categorySlug, tienda, locale }: CategoryClientPageProps) => {
  const [mounted, setMounted] = useState(false)
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<PublicProduct[]>([])
  const [messages, setMessages] = useState<Record<string, unknown> | null>(null)
  const [loading, setLoading] = useState(true)
  
  // Estados para filtros
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'newest'>('newest')
  const [showSort, setShowSort] = useState(false)
  
  // Estados para filtros dinámicos
  const [dynamicFilters, setDynamicFilters] = useState<DynamicFilter[]>([])
  const [priceRangeOptions, setPriceRangeOptions] = useState<PriceRangeOption[]>([])
  
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
  
  // Estados para el selector de vista (solo móvil)
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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      if (!tienda?.id) return
      
      try {
        setLoading(true)
        const [messagesModule, categoriesData, productsData] = await Promise.all([
          import(`../../../../messages/common/${locale}.json`).catch(() => ({ default: {} })),
          getStoreCategories(tienda.id).catch(() => []),
          getStoreProducts(tienda.id).catch(() => [])
        ])
        
        setMessages(messagesModule.default)
        setCategories(categoriesData)
        setProducts(productsData)
      } catch (error) {
        console.error('Error loading data:', error)
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [tienda?.id, locale])

  useEffect(() => {
    setMounted(true)
  }, [])

  // Cargar colecciones
  useEffect(() => {
    const loadCollections = async () => {
      if (!tienda?.id || products.length === 0) return
      
      try {
        const storeCollections = await getStoreCollections(tienda.id)
        setCollections(storeCollections)
        
        // Crear un mapa de productos a sus colecciones
        const productCollectionsMap: Record<string, PublicCollection[]> = {}
        
        products.forEach(product => {
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
    
    loadCollections()
  }, [tienda?.id, products])

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

  // Encontrar la categoría actual
  const currentCategory = useMemo(() => {
    return categories.find(cat => cat.slug === categorySlug)
  }, [categories, categorySlug])

  // Generar breadcrumbs simples para evitar bucles infinitos
  const breadcrumbs = useMemo(() => {
    const baseBreadcrumbs: Array<{label: string, href: string, isActive?: boolean}> = [{ label: 'Inicio', href: '/' }]
    
    if (currentCategory) {
      // Verificar si es subcategoría
      const parentCategory = categories.find(cat => cat.id === currentCategory.parentCategoryId)
      
      if (parentCategory) {
        // Es subcategoría, agregar padre primero
        baseBreadcrumbs.push({
          label: parentCategory.name,
          href: `/categoria/${parentCategory.slug}`
        })
      }
      
      baseBreadcrumbs.push({
        label: currentCategory.name,
        href: `/categoria/${currentCategory.slug}`,
        isActive: true
      })
    }
    
    return baseBreadcrumbs
  }, [currentCategory, categories])

  // Filtrar productos por categoría
  const categoryProducts = useMemo(() => {
    if (!currentCategory) return []
    
    return products.filter(product => 
      product.selectedParentCategoryIds?.includes(currentCategory.id)
    )
  }, [products, currentCategory])

  // Aplicar filtros dinámicos y ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    // Aplicar filtros dinámicos
    const filtered = applyDynamicFilters(categoryProducts, dynamicFilters, priceRangeOptions)

    // Ordenar productos
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
  }, [categoryProducts, dynamicFilters, priceRangeOptions, sortBy])

  // Actualizar filtros dinámicos cuando cambian los productos de la categoría
  useEffect(() => {
    const loadFilters = async () => {
      if (!tienda?.id) return
      
      try {
        // Get store filter configuration
        const storeFiltersConfig = await getStoreConfiguredFilters(tienda.id)
        
        // Use configured filters if available, otherwise fallback to automatic extraction
        const newFilters = storeFiltersConfig.length > 0
          ? extractConfiguredFilters(categoryProducts, storeFiltersConfig)
          : extractDynamicFilters(categoryProducts)
        
        setDynamicFilters(newFilters)
        
        const newPriceRangeOptions = generatePriceRangeOptions(categoryProducts)
        setPriceRangeOptions(newPriceRangeOptions)
      } catch (error) {
        console.error('Error loading filters:', error)
        // Fallback to automatic extraction
        const newFilters = extractDynamicFilters(categoryProducts)
        setDynamicFilters(newFilters)
        
        const newPriceRangeOptions = generatePriceRangeOptions(categoryProducts)
        setPriceRangeOptions(newPriceRangeOptions)
      }
    }
    
    loadFilters()
      }, [categoryProducts, tienda?.id])

  // Paginación
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    return filteredAndSortedProducts.slice(startIndex, endIndex)
  }, [filteredAndSortedProducts, currentPage, productsPerPage])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)

  // Funciones para manejar filtros dinámicos
  const handleFiltersChange = (newFilters: DynamicFilter[]) => {
    setDynamicFilters(newFilters)
    setCurrentPage(1) // Reset pagination
  }

  const handlePriceRangeChange = (newOptions: PriceRangeOption[]) => {
    setPriceRangeOptions(newOptions)
    setCurrentPage(1) // Reset pagination
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
    setCurrentPage(1) // Reset pagination
  }

  // Importar layout del tema
  const ThemeLayout = useMemo(() => {
    if (!tienda?.theme) return DefaultLayout
    
    return dynamic<ThemeLayoutProps>(
      () => import(`../../../../themes/${tienda.theme}/Layout`).then(mod => mod.default).catch(() => {
        console.error(`Theme Layout ${tienda.theme} not found, using default layout`)
        return DefaultLayout
      }),
      { 
        ssr: false,
        loading: () => null
      }
    )
  }, [tienda?.theme])

  if (!mounted || loading || !messages || !tienda) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    )
  }

  const CategoryContent = () => {
    if (!currentCategory) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-24 pb-12">
          <div className="text-center">
            <h1 className="text-3xl font-light text-neutral-900 mb-4">Categoría no encontrada</h1>
            <p className="text-neutral-600 mb-8">La categoría que buscas no existe o ha sido eliminada.</p>
            <Link 
              href="/"
              className="bg-neutral-900 text-white px-6 py-3 rounded-md font-medium hover:bg-neutral-800 transition-colors"
            >
              Volver al inicio
            </Link>
          </div>
        </div>
      )
    }

    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 md:pt-12 pb-12 elegant-category-spacing">
        {/* Breadcrumbs */}
        <div className="mb-6">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Header con estilos elegant boutique */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
          <div>
            <h1 
              className="text-3xl font-light mb-2"
              style={{
                color: `rgb(var(--theme-neutral-dark))`,
                fontFamily: `var(--theme-font-heading)`,
                fontWeight: '300'
              }}
            >
              {currentCategory.name}
            </h1>
            <p 
              className="font-light"
              style={{
                color: `rgb(var(--theme-neutral-medium))`,
                fontFamily: `var(--theme-font-body)`
              }}
            >
              {filteredAndSortedProducts.length} producto{filteredAndSortedProducts.length !== 1 ? 's' : ''} encontrado{filteredAndSortedProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Controles de filtro y ordenamiento */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
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

        {/* Productos */}
        {paginatedProducts.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mb-4 mx-auto">
              <svg className="w-8 h-8 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-neutral-900 mb-2">No hay productos</h3>
            <p className="text-neutral-500 mb-6">
              No se encontraron productos que coincidan con tus filtros.
            </p>
            <button
              onClick={handleClearFilters}
              className="bg-neutral-900 text-white px-6 py-3 rounded-md font-medium hover:bg-neutral-800 transition-colors"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <>
            {/* Grilla de productos */}
            <div className={`grid ${getGridClasses(viewMode)} mb-12`}>
              {paginatedProducts.map((producto, index) => (
                <ProductCard key={producto.id} producto={producto} index={index} tienda={tienda} viewMode={viewMode} productCollections={productCollections} />
              ))}
            </div>

            {/* Paginación con estilos boutique */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: `rgb(var(--theme-primary) / 0.2)`,
                    backgroundColor: 'transparent',
                    color: `rgb(var(--theme-neutral-medium))`,
                    fontFamily: `var(--theme-font-body)`,
                    transition: `var(--theme-transition)`
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                      e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.3)`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== 1) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                    }
                  }}
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className="px-4 py-2 border rounded-sm transition-colors"
                    style={{
                      backgroundColor: currentPage === page 
                        ? `rgb(var(--theme-primary))` 
                        : 'transparent',
                      color: currentPage === page 
                        ? `rgb(var(--theme-neutral-light))` 
                        : `rgb(var(--theme-neutral-medium))`,
                      borderColor: currentPage === page 
                        ? `rgb(var(--theme-primary))` 
                        : `rgb(var(--theme-primary) / 0.2)`,
                      fontFamily: `var(--theme-font-body)`,
                      transition: `var(--theme-transition)`
                    }}
                    onMouseEnter={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                        e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.3)`
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (currentPage !== page) {
                        e.currentTarget.style.backgroundColor = 'transparent'
                        e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                      }
                    }}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border rounded-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    borderColor: `rgb(var(--theme-primary) / 0.2)`,
                    backgroundColor: 'transparent',
                    color: `rgb(var(--theme-neutral-medium))`,
                    fontFamily: `var(--theme-font-body)`,
                    transition: `var(--theme-transition)`
                  }}
                  onMouseEnter={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                      e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.3)`
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (currentPage !== totalPages) {
                      e.currentTarget.style.backgroundColor = 'transparent'
                      e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                    }
                  }}
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    )
  }

  return (
    <NextIntlClientProvider locale={locale} messages={messages as Record<string, string>}>
      <CartProvider>
        <ThemeLayout tienda={tienda} categorias={categories || []}>
          <CategoryContent />
        </ThemeLayout>
      </CartProvider>
    </NextIntlClientProvider>
  )
}

// Función para obtener la etiqueta dinámica de un producto
const getProductBadge = (producto: PublicProduct, productCollections: Record<string, PublicCollection[]>) => {
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

// Componente de tarjeta de producto (idéntico al de Home.tsx)
const ProductCard = ({ producto, index, tienda, viewMode, productCollections }: { 
  producto: PublicProduct, 
  index: number, 
  tienda: Tienda, 
  viewMode: ProductViewMode,
  productCollections: Record<string, PublicCollection[]>
}) => {
  const [addingToCart, setAddingToCart] = useState(false)
  const { addItem, openCart } = useCart()

  const handleAddToCart = async (event: React.MouseEvent) => {
    event.preventDefault()
    event.stopPropagation()
    
    setAddingToCart(true)
    
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
        setAddingToCart(false)
        openCart()
      }, 800)
      
    } catch (error) {
      console.error('Error adding to cart:', error)
      setAddingToCart(false)
    }
  }

  const handleProductClick = () => {
    // Establecer contexto de navegación para breadcrumbs inteligentes
    setNavigationContext({
      type: 'category',
      categorySlug: window.location.pathname.split('/categoria/')[1]
    })
  }

  return (
    <Link 
      href={`/${producto.slug}`}
      onClick={handleProductClick}
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
          <img
            src={producto.image}
            alt={producto.name}
            className="w-full h-full object-cover transition-transform duration-300 md:group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/300/400';
            }}
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
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
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
                onClick={handleAddToCart}
                disabled={addingToCart}
                className={`w-6 h-6 rounded-full transition-all duration-200 text-xs flex items-center justify-center ${
                  addingToCart
                    ? 'bg-green-600 text-white opacity-100'
                    : 'bg-neutral-900 text-white opacity-100 hover:bg-neutral-800'
                }`}
              >
                {addingToCart ? '✓' : '+'}
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
              onClick={handleAddToCart}
              disabled={addingToCart}
              className={`text-sm px-4 py-2 rounded-md transition-all duration-200 ${
                addingToCart
                  ? 'bg-green-600 text-white opacity-100'
                  : 'bg-neutral-900 text-white opacity-100 md:opacity-0 md:group-hover:opacity-100 hover:bg-neutral-800'
              }`}
            >
              {addingToCart ? '✓' : 'Añadir'}
            </button>
          )}
        </div>
      </div>
    </Link>
  )
}

export default CategoryClientPage 