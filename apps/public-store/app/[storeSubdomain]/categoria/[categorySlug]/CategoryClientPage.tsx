'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { NextIntlClientProvider } from 'next-intl'
import { useStore } from '../../../../lib/store-context'
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
import { Tienda } from '../../../../lib/types'
import { StoreDataClient } from '../../../../lib/store'
import DynamicFilters from '../../../../components/DynamicFilters'

// Layout por defecto en caso de error
const DefaultLayout: ThemeLayoutComponent = ({ children }) => (
  <main className="min-h-screen bg-gray-50">{children}</main>
)

// Función para convertir Store a Tienda
const convertStoreToTienda = (store: StoreDataClient): Tienda => ({
  id: store.id,
  storeName: store.storeName,
  subdomain: store.subdomain,
  slug: store.slug,
  slogan: store.slogan,
  description: store.description,
  theme: store.theme || 'base-default',
  hasPhysicalLocation: store.hasPhysicalLocation,
  address: store.address,
  logoUrl: store.logoUrl,
  heroImageUrl: store.heroImageUrl,
  headerLogoUrl: store.headerLogoUrl,
  carouselImages: store.carouselImages,
  primaryColor: store.primaryColor,
  secondaryColor: store.secondaryColor,
  currency: store.currency,
  phone: store.phone,
  ownerId: store.ownerId,
  advanced: store.advanced,
  socialMedia: store.socialMedia,
  createdAt: store.createdAt,
  updatedAt: store.updatedAt
})

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
}

const CategoryClientPage = ({ categorySlug }: CategoryClientPageProps) => {
  const { store } = useStore()
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
  
  // Paginación
  const [currentPage, setCurrentPage] = useState(1)
  const [productsPerPage] = useState(12)

  // Cargar datos necesarios
  useEffect(() => {
    const loadData = async () => {
      if (!store?.id) return
      
      try {
        setLoading(true)
        const [messagesModule, categoriesData, productsData] = await Promise.all([
          import('../../../../messages/common/es.json').catch(() => ({ default: {} })),
          getStoreCategories(store.id).catch(() => []),
          getStoreProducts(store.id).catch(() => [])
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
  }, [store?.id])

  useEffect(() => {
    setMounted(true)
  }, [])

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
      if (!store?.id) return
      
      try {
        // Get store filter configuration
        const storeFiltersConfig = await getStoreConfiguredFilters(store.id)
        
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
  }, [categoryProducts, store?.id])

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
    if (!store?.theme) return DefaultLayout
    
    return dynamic<ThemeLayoutProps>(
      () => import(`../../../../themes/${store.theme}/Layout`).then(mod => mod.default).catch(() => {
        console.error(`Theme Layout ${store.theme} not found, using default layout`)
        return DefaultLayout
      }),
      { 
        ssr: false,
        loading: () => null
      }
    )
  }, [store?.theme])

  if (!mounted || loading || !messages || !store) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-neutral-300 border-t-neutral-900"></div>
      </div>
    )
  }

  const CategoryContent = () => {
    if (!currentCategory) {
      return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Breadcrumbs */}
        <div className="mb-8">
          <Breadcrumbs items={breadcrumbs} />
        </div>

        {/* Header con estilos elegant boutique */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
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
            {/* Filtros dinámicos */}
                         <DynamicFilters
                filters={dynamicFilters}
                priceRangeOptions={priceRangeOptions}
                onFiltersChange={handleFiltersChange}
                onPriceRangeChange={handlePriceRangeChange}
                onClearFilters={handleClearFilters}
              />

            {/* Ordenamiento con estilos boutique */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-3 py-2 text-sm font-light border rounded-sm transition-all duration-200"
                style={{
                  borderColor: `rgb(var(--theme-primary) / 0.2)`,
                  backgroundColor: showSort ? `rgb(var(--theme-secondary))` : 'transparent',
                  color: `rgb(var(--theme-neutral-medium))`,
                  fontFamily: `var(--theme-font-body)`,
                  transition: `var(--theme-transition)`
                }}
                onMouseEnter={(e) => {
                  if (!showSort) {
                    e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                    e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.3)`
                  }
                }}
                onMouseLeave={(e) => {
                  if (!showSort) {
                    e.currentTarget.style.backgroundColor = 'transparent'
                    e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
                  }
                }}
              >
                <Icons.Sort />
                <span className="font-light">Ordenar</span>
                <svg className={`w-3 h-3 transition-transform duration-200 ${showSort ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              
              {showSort && (
                <div 
                  className="absolute top-full right-0 mt-2 w-48 border rounded-sm z-50 animate-fade-in"
                  style={{
                    backgroundColor: `rgb(var(--theme-neutral-light))`,
                    borderColor: `rgb(var(--theme-primary) / 0.1)`,
                    boxShadow: `var(--theme-shadow-sm)`
                  }}
                >
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
                        className="w-full text-left px-3 py-2 transition-colors duration-200 rounded-sm text-sm font-light"
                        style={{
                          backgroundColor: sortBy === option.value ? `rgb(var(--theme-secondary))` : 'transparent',
                          color: sortBy === option.value ? `rgb(var(--theme-neutral-dark))` : `rgb(var(--theme-neutral-medium))`,
                          fontFamily: `var(--theme-font-body)`,
                          transition: `var(--theme-transition)`
                        }}
                        onMouseEnter={(e) => {
                          if (sortBy !== option.value) {
                            e.currentTarget.style.backgroundColor = `rgb(var(--theme-secondary))`
                            e.currentTarget.style.color = `rgb(var(--theme-neutral-dark))`
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (sortBy !== option.value) {
                            e.currentTarget.style.backgroundColor = 'transparent'
                            e.currentTarget.style.color = `rgb(var(--theme-neutral-medium))`
                          }
                        }}
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
              {paginatedProducts.map((producto, index) => (
                <ProductCard key={producto.id} producto={producto} index={index} tienda={convertStoreToTienda(store)} />
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
    <NextIntlClientProvider locale="es" messages={messages as Record<string, string>}>
      <CartProvider>
        <ThemeLayout tienda={convertStoreToTienda(store)} categorias={categories || []}>
          <CategoryContent />
        </ThemeLayout>
      </CartProvider>
    </NextIntlClientProvider>
  )
}

// Componente de tarjeta de producto
const ProductCard = ({ producto, index, tienda }: { producto: PublicProduct, index: number, tienda: Tienda }) => {
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
      className="card-boutique group cursor-pointer block relative transition-all duration-300 animate-fade-in"
      style={{ 
        animationDelay: `${index * 100}ms`,
        backgroundColor: `rgb(var(--theme-neutral-light))`,
        border: `1px solid rgb(var(--theme-primary) / 0.1)`,
        borderRadius: `var(--theme-border-radius)`,
        boxShadow: `var(--theme-shadow-sm)`,
        color: `rgb(var(--theme-neutral-dark))`,
        transition: `var(--theme-transition)`,
        padding: `var(--theme-card-padding)`
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = `var(--theme-shadow-md)`
        e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.2)`
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = `var(--theme-shadow-sm)`
        e.currentTarget.style.borderColor = `rgb(var(--theme-primary) / 0.1)`
      }}
    >
      {/* Botón de favorito */}
      <div className="absolute top-3 right-3 z-10">
        <HeartIcon product={producto} size="md" />
      </div>

      {/* Imagen del producto */}
      <div 
        className="relative aspect-square overflow-hidden flex-shrink-0"
        style={{
          backgroundColor: `rgb(var(--theme-secondary))`,
          borderRadius: `var(--theme-border-radius)`,
          marginBottom: '1rem'
        }}
      >
        {producto.mediaFiles && producto.mediaFiles.length > 0 && producto.mediaFiles[0].type === 'video' ? (
          <VideoPlayer
            src={producto.mediaFiles[0].url}
            alt={producto.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            showControls={false}
            autoPlay={true}
            loop={true}
            muted={true}
          />
        ) : (
          <img
            src={producto.image}
            alt={producto.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = '/api/placeholder/300/400';
            }}
          />
        )}
        
        {/* Badge de nuevo con estilo boutique */}
        <span 
          className="product-badge-boutique absolute top-3 left-3 text-xs font-medium px-3 py-1"
          style={{
            backgroundColor: `rgb(var(--theme-accent))`,
            color: `rgb(var(--theme-neutral-light))`,
            borderRadius: `var(--theme-border-radius)`,
            fontFamily: `var(--theme-font-body)`,
            letterSpacing: '0.05em',
            textTransform: 'uppercase',
            boxShadow: `var(--theme-shadow-sm)`
          }}
        >
          Nuevo
        </span>
      </div>

      {/* Información del producto */}
      <div className="space-y-3">
        <h3 
          className="text-lg font-light group-hover:opacity-80 transition-all duration-200"
          style={{
            color: `rgb(var(--theme-neutral-dark))`,
            fontFamily: `var(--theme-font-heading)`,
            fontWeight: '300'
          }}
        >
          {producto.name}
        </h3>
        
        {/* Rating con estilos boutique */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className="w-4 h-4"
                style={{
                  color: i < Math.floor(producto.rating || 0) ? `rgb(var(--theme-accent))` : `rgb(var(--theme-neutral-medium) / 0.3)`
                }}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span 
            className="text-sm"
            style={{
              color: `rgb(var(--theme-neutral-medium))`,
              fontFamily: `var(--theme-font-body)`
            }}
          >
            ({producto.reviews || 0})
          </span>
        </div>

        {/* Precio y botón de agregar con estilos boutique */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span 
              className="text-xl font-medium"
              style={{
                color: `rgb(var(--theme-neutral-dark))`,
                fontFamily: `var(--theme-font-body)`,
                fontWeight: '500'
              }}
            >
              {getCurrencySymbol(tienda.currency)} {producto.price}
            </span>
            {producto.comparePrice && producto.comparePrice > producto.price && (
              <span 
                className="text-sm line-through font-light"
                style={{
                  color: `rgb(var(--theme-neutral-medium))`,
                  fontFamily: `var(--theme-font-body)`
                }}
              >
                {getCurrencySymbol(tienda.currency)} {producto.comparePrice}
              </span>
            )}
          </div>
          <button 
            onClick={handleAddToCart}
            disabled={addingToCart}
            className={`btn-boutique-primary text-sm px-4 py-2 transition-all duration-200 ${
              addingToCart ? 'opacity-100' : 'opacity-100 md:opacity-0 md:group-hover:opacity-100'
            }`}
            style={{
              backgroundColor: addingToCart 
                ? `rgb(var(--theme-success))` 
                : `rgb(var(--theme-primary))`,
              color: `rgb(var(--theme-neutral-light))`,
              borderRadius: `var(--theme-border-radius)`,
              fontFamily: `var(--theme-font-body)`,
              letterSpacing: '0.025em',
              boxShadow: `var(--theme-shadow-sm)`,
              border: 'none',
              cursor: addingToCart ? 'not-allowed' : 'pointer'
            }}
            onMouseEnter={(e) => {
              if (!addingToCart) {
                e.currentTarget.style.backgroundColor = `rgb(var(--theme-neutral-dark))`
                e.currentTarget.style.transform = 'translateY(-1px)'
                e.currentTarget.style.boxShadow = `var(--theme-shadow-md)`
              }
            }}
            onMouseLeave={(e) => {
              if (!addingToCart) {
                e.currentTarget.style.backgroundColor = `rgb(var(--theme-primary))`
                e.currentTarget.style.transform = 'translateY(0)'
                e.currentTarget.style.boxShadow = `var(--theme-shadow-sm)`
              }
            }}
          >
            {addingToCart ? '✓' : 'Añadir'}
          </button>
        </div>
      </div>
    </Link>
  )
}

export default CategoryClientPage 