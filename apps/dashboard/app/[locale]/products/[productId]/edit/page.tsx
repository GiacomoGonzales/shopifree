'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import ProductGeneralInfo from '../../../../../components/products/ProductGeneralInfo'
import { ProductWithId, getProduct } from '../../../../../lib/products'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore } from '../../../../../lib/store'

export default function ProductEditPage() {
  const params = useParams()
  const router = useRouter()
  const { user } = useAuth()
  const t = useTranslations('pages.products')
  const tMessages = useTranslations('pages.products.messages')

  const productId = params.productId as string
  const locale = params.locale as string

  // Estados
  const [product, setProduct] = useState<ProductWithId | null>(null)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        if (!user) {
          setError('Usuario no autenticado')
          return
        }

        // Obtener la tienda del usuario
        const store = await getUserStore(user.uid)
        if (!store) {
          setError('No se encontró la tienda')
          return
        }

        setStoreId(store.id)

        // Verificar si es un producto existente
        if (productId === 'new') {
          setError(tMessages('mustCreateFirst'))
          return
        }

        // Cargar el producto
        const productData = await getProduct(store.id, productId)
        if (!productData) {
          setError('Producto no encontrado')
          return
        }

        setProduct(productData)
      } catch (err) {
        console.error('Error loading product:', err)
        setError('Error al cargar el producto')
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [user, productId, tMessages])

  // Manejar actualización de producto
  const handleProductUpdate = (field: string, value: any) => {
    if (product) {
      setProduct(prev => prev ? { ...prev, [field]: value } : prev)
    }
  }

  // Navegación hacia atrás
  const handleGoBack = () => {
    router.push(`/${locale}/products`)
  }

  // Estados de carga
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="bg-white shadow rounded-lg p-6">
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                <div className="space-y-4">
                  <div className="h-10 bg-gray-200 rounded"></div>
                  <div className="h-24 bg-gray-200 rounded"></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="h-10 bg-gray-200 rounded"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Estado de error
  if (error) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header con navegación */}
            <div className="mb-8 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={handleGoBack}
                  className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
                >
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                  Volver a productos
                </button>
              </div>
            </div>

            {/* Mensaje de error */}
            <div className="bg-white shadow rounded-lg p-6">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      Error
                    </h3>
                    <div className="mt-2 text-sm text-red-700">
                      <p>{error}</p>
                    </div>
                    {error === tMessages('mustCreateFirst') && (
                      <div className="mt-4">
                        <button
                          onClick={handleGoBack}
                          className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-2 rounded-md text-sm font-medium"
                        >
                          Ir a productos
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // Renderizado principal
  if (!product || !storeId) {
    return null
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header con navegación */}
          <div className="mb-8 flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={handleGoBack}
                className="mr-4 inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver a productos
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {t('editProduct')}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {product.name || 'Producto sin nombre'}
                </p>
              </div>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="space-y-6">
            {/* Sección de Información General */}
            <ProductGeneralInfo
              product={product}
              storeId={storeId}
              onUpdate={handleProductUpdate}
            />

            {/* Placeholder para futuras secciones */}
            <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 48 48">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M34 40h10v-4a6 6 0 00-10.712-3.714M34 40H14m20 0v-4a9.971 9.971 0 00-.712-3.714M14 40H4v-4a6 6 0 0110.712-3.714M14 40v-4a9.971 9.971 0 01.712-3.714M28 20a4 4 0 11-8 0 4 4 0 018 0zm-4-8a9.971 9.971 0 00-3.714.712M24 12a9.971 9.971 0 00-3.714-.712" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">Próximamente</h3>
              <p className="mt-1 text-sm text-gray-500">
                Aquí se agregarán más secciones como precios, imágenes, SEO, etc.
              </p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 