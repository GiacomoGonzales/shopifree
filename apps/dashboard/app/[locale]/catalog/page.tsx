'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../components/DashboardLayout'
import { useAuth } from '../../../lib/simple-auth-context'
import { useStore } from '../../../lib/hooks/useStore'
import { getFilteredProducts, ProductWithId } from '../../../lib/products'
import { CATALOG_MODE_FEATURES } from '../../../lib/subscription-utils'

export default function CatalogHomePage() {
  const router = useRouter()
  const { userData } = useAuth()
  const { store, loading: storeLoading, formatPrice } = useStore()

  const [products, setProducts] = useState<ProductWithId[]>([])
  const [productCount, setProductCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)

  const catalogUrl = store?.subdomain
    ? `${store.subdomain}.shopifree.app`
    : ''

  useEffect(() => {
    const loadProducts = async () => {
      if (!store?.id) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        const result = await getFilteredProducts(store.id, { status: 'active' }, 1, 4)
        setProducts(result.paginatedProducts)
        setProductCount(result.totalItems)
      } catch (error) {
        console.error('Error loading products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [store?.id])

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`https://${catalogUrl}`)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const handleShareWhatsApp = () => {
    const message = encodeURIComponent(`Mira mi catalogo: https://${catalogUrl}`)
    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  if (storeLoading || loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      </DashboardLayout>
    )
  }

  const maxProducts = CATALOG_MODE_FEATURES.maxProducts
  const progressPercent = Math.min((productCount / maxProducts) * 100, 100)

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 sm:px-6 lg:px-8 py-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-light text-gray-900">
              Hola, {String(userData?.displayName || store?.storeName || 'emprendedor')}
            </h1>
            <p className="text-gray-500 mt-1">
              Bienvenido a tu panel de control
            </p>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Columna principal - Link y preview */}
            <div className="lg:col-span-2 space-y-6">
              {/* Link del catálogo - Destacado */}
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-6 text-white">
                <div className="flex items-start justify-between flex-wrap gap-4">
                  <div className="flex-1">
                    <p className="text-emerald-100 text-sm mb-1">Tu catálogo está listo en:</p>
                    <p className="text-xl font-medium mb-4">{catalogUrl}</p>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={handleCopyLink}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
                      >
                        {copied ? (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Copiado!
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                            Copiar link
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleShareWhatsApp}
                        className="px-4 py-2 bg-white text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors flex items-center gap-2 font-medium"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                        </svg>
                        Compartir
                      </button>
                      <a
                        href={`https://${catalogUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors flex items-center gap-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                        Ver catálogo
                      </a>
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview de productos */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-medium text-gray-900">Vista previa</h2>
                  <button
                    onClick={() => router.push('/products')}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Ver todos ({productCount})
                  </button>
                </div>

                {products.length === 0 ? (
                  <div className="text-center py-8">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                    <p className="text-gray-500 mb-4">Aún no tienes productos</p>
                    <button
                      onClick={() => router.push('/products/create-simple')}
                      className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                    >
                      Agregar tu primer producto
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {products.map((product) => (
                      <div key={product.id} className="group">
                        <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-2">
                          {product.mediaFiles?.[0]?.url ? (
                            <img
                              src={product.mediaFiles[0].url}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <p className="text-sm text-gray-900 truncate">{product.name}</p>
                        <p className="text-sm text-gray-500">{formatPrice(product.price)}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Columna lateral - Acciones rápidas */}
            <div className="space-y-6">
              {/* Resumen de productos */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">TUS PRODUCTOS</h3>
                <div className="flex items-end justify-between mb-3">
                  <span className="text-4xl font-light text-gray-900">{productCount}</span>
                  <span className="text-gray-500 text-sm">de {maxProducts}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 mb-4">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all"
                    style={{ width: `${progressPercent}%` }}
                  ></div>
                </div>
                <button
                  onClick={() => router.push('/products')}
                  className="w-full py-2 text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors text-sm font-medium"
                >
                  Gestionar productos
                </button>
              </div>

              {/* Acciones rápidas */}
              <div className="bg-white rounded-2xl border border-gray-200 p-6">
                <h3 className="text-sm font-medium text-gray-500 mb-4">ACCIONES RÁPIDAS</h3>
                <div className="space-y-2">
                  <button
                    onClick={() => router.push('/products/create-simple')}
                    className="w-full py-3 px-4 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Agregar producto
                  </button>
                  <button
                    onClick={() => router.push('/products/import')}
                    className="w-full py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                    Importar Excel
                  </button>
                  <button
                    onClick={() => router.push('/appearance')}
                    className="w-full py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
                    </svg>
                    Cambiar plantilla
                  </button>
                  <button
                    onClick={() => router.push('/catalog/settings')}
                    className="w-full py-3 px-4 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors flex items-center gap-3"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    Configuración
                  </button>
                </div>
              </div>

              {/* Upgrade CTA */}
              <div className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
                <div className="flex items-center gap-2 mb-2">
                  <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  <span className="text-sm font-medium">Quieres más?</span>
                </div>
                <p className="text-gray-300 text-sm mb-4">
                  Productos ilimitados, dominio propio, pagos online y más.
                </p>
                <button
                  onClick={() => router.push('/pricing')}
                  className="w-full py-2 bg-white text-gray-900 rounded-lg font-medium hover:bg-gray-100 transition-colors text-sm"
                >
                  Ver planes desde $1/mes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
