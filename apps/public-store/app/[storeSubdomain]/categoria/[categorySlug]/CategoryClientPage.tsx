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
import { useBreadcrumbs, setNavigationContext } from '../../../../lib/hooks/useBreadcrumbs'
import { CartProvider, useCart } from '../../../../lib/cart-context'
import { ThemeLayoutComponent, ThemeLayoutProps } from '../../../../themes/theme-component'
import { getStoreCategories, Category } from '../../../../lib/categories'
import { getStoreProducts, PublicProduct } from '../../../../lib/products'
import { Tienda } from '../../../../lib/types'
import { StoreDataClient } from '../../../../lib/store'

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
interface PriceFilter {
  min: number
  max: number
}

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
  const [priceFilter, setPriceFilter] = useState<PriceFilter>({ min: 0, max: 1000 })
  const [showFilters, setShowFilters] = useState(false)
  const [showSort, setShowSort] = useState(false)
  
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

  // Generar breadcrumbs inteligentes
  const breadcrumbs = useBreadcrumbs({ categories, currentCategory })

  // Filtrar productos por categoría
  const categoryProducts = useMemo(() => {
    if (!currentCategory) return []
    
    return products.filter(product => 
      product.selectedParentCategoryIds?.includes(currentCategory.id)
    )
  }, [products, currentCategory])

  // Aplicar filtros y ordenamiento
  const filteredAndSortedProducts = useMemo(() => {
    const filtered = categoryProducts.filter(product => 
      product.price >= priceFilter.min && product.price <= priceFilter.max
    )

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
  }, [categoryProducts, priceFilter, sortBy])

  // Paginación
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * productsPerPage
    const endIndex = startIndex + productsPerPage
    return filteredAndSortedProducts.slice(startIndex, endIndex)
  }, [filteredAndSortedProducts, currentPage, productsPerPage])

  const totalPages = Math.ceil(filteredAndSortedProducts.length / productsPerPage)

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

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light text-neutral-900 mb-2">{currentCategory.name}</h1>
            <p className="text-neutral-600 font-light">
              {filteredAndSortedProducts.length} producto{filteredAndSortedProducts.length !== 1 ? 's' : ''} encontrado{filteredAndSortedProducts.length !== 1 ? 's' : ''}
            </p>
          </div>
          
          {/* Controles de filtro y ordenamiento */}
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            {/* Filtros */}
            <div className="relative">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
              >
                <Icons.Filter />
                <span>Filtros</span>
                <Icons.ChevronDown />
              </button>
              
              {showFilters && (
                <div className="absolute top-full right-0 mt-2 w-64 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                  <div className="p-4">
                    <h3 className="font-medium text-neutral-900 mb-4">Filtrar por precio</h3>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-sm text-neutral-600 mb-1">Precio mínimo</label>
                        <input
                          type="number"
                          value={priceFilter.min}
                          onChange={(e) => setPriceFilter(prev => ({ ...prev, min: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-neutral-600 mb-1">Precio máximo</label>
                        <input
                          type="number"
                          value={priceFilter.max}
                          onChange={(e) => setPriceFilter(prev => ({ ...prev, max: Number(e.target.value) }))}
                          className="w-full px-3 py-2 border border-neutral-300 rounded-md focus:outline-none focus:ring-2 focus:ring-neutral-500"
                        />
                      </div>
                      <button
                        onClick={() => setPriceFilter({ min: 0, max: 1000 })}
                        className="w-full px-3 py-2 text-sm text-neutral-600 hover:text-neutral-900 transition-colors"
                      >
                        Limpiar filtros
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Ordenamiento */}
            <div className="relative">
              <button
                onClick={() => setShowSort(!showSort)}
                className="flex items-center gap-2 px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors"
              >
                <Icons.Sort />
                <span>Ordenar</span>
                <Icons.ChevronDown />
              </button>
              
              {showSort && (
                <div className="absolute top-full right-0 mt-2 w-48 bg-white border border-neutral-200 rounded-lg shadow-lg z-10">
                  <div className="py-2">
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
                        className={`w-full text-left px-4 py-2 hover:bg-neutral-50 transition-colors ${
                          sortBy === option.value ? 'bg-neutral-50 text-neutral-900' : 'text-neutral-600'
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
              onClick={() => setPriceFilter({ min: 0, max: 1000 })}
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

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-2">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-4 py-2 border rounded-md transition-colors ${
                      currentPage === page
                        ? 'bg-neutral-900 text-white border-neutral-900'
                        : 'border-neutral-300 hover:bg-neutral-50'
                    }`}
                  >
                    {page}
                  </button>
                ))}
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 border border-neutral-300 rounded-md hover:bg-neutral-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
      className="bg-white text-neutral-900 rounded-lg border border-neutral-200 shadow-sm hover:shadow-md transition-shadow duration-200 hover-lift animate-fade-in group cursor-pointer block relative"
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Botón de favorito */}
      <div className="absolute top-3 right-3 z-10">
        <HeartIcon product={producto} size="md" />
      </div>

      {/* Imagen del producto */}
      <div className="relative aspect-square overflow-hidden rounded-t-lg bg-neutral-100">
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
        
        {/* Badge de nuevo */}
        <span className="absolute top-3 left-3 bg-neutral-900 text-white text-xs font-medium px-2 py-1 rounded-full">
          Nuevo
        </span>
      </div>

      {/* Información del producto */}
      <div className="p-6 pt-0 space-y-3 bg-white">
        <h3 className="text-lg font-light text-neutral-900 group-hover:text-neutral-600 transition-colors duration-200 pt-6">
          {producto.name}
        </h3>
        
        {/* Rating */}
        <div className="flex items-center space-x-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`w-4 h-4 ${i < Math.floor(producto.rating || 0) ? 'text-yellow-400' : 'text-neutral-300'}`}
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
            ))}
          </div>
          <span className="text-sm text-neutral-500">
            ({producto.reviews || 0})
          </span>
        </div>

        {/* Precio y botón de agregar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="text-xl font-medium text-neutral-900">
              {getCurrencySymbol(tienda.currency)} {producto.price}
            </span>
            {producto.comparePrice && producto.comparePrice > producto.price && (
              <span className="text-sm text-neutral-500 line-through font-light">
                {getCurrencySymbol(tienda.currency)} {producto.comparePrice}
              </span>
            )}
          </div>
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
        </div>
      </div>
    </Link>
  )
}

export default CategoryClientPage 