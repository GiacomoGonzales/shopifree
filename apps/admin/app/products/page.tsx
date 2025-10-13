"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, query } from "firebase/firestore"
import { getFirebaseDb } from "../../lib/firebase"
import AdminLayout from "../../components/layout/AdminLayout"
import Link from "next/link"

type FirebaseTimestamp = {
  toDate: () => Date
  toMillis: () => number
  seconds: number
  nanoseconds: number
} | { seconds: number } | string | Date

interface MediaFile {
  url: string
  type?: string
}

interface Variation {
  stock?: number
  [key: string]: unknown
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  currency: string
  stock: number
  image?: string
  images?: string[]
  mediaFiles?: MediaFile[]
  storeId: string
  storeName?: string
  storeSubdomain?: string
  status: string
  hasVariations: boolean
  variations?: Variation[]
  categoryId?: string
  createdAt: FirebaseTimestamp
  updatedAt: FirebaseTimestamp
}

interface Store {
  id: string
  storeName: string
  subdomain: string
  currency: string
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedStore, setSelectedStore] = useState<string>("all")
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 20

  const loadStores = useCallback(async () => {
    try {
      const db = getFirebaseDb()
      if (!db) return []

      const storesSnapshot = await getDocs(collection(db, "stores"))
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        storeName: doc.data().storeName,
        subdomain: doc.data().subdomain,
        currency: doc.data().currency
      })) as Store[]

      return storesData
    } catch (error) {
      console.error("Error loading stores:", error)
      return []
    }
  }, [])

  const loadProducts = useCallback(async () => {
    try {
      setLoading(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase DB not available")
        return
      }

      // Cargar tiendas primero
      const storesData = await loadStores()
      setStores(storesData)

      // Cargar productos de todas las tiendas (están en subcolecciones)
      const allProducts: Product[] = []

      for (const store of storesData) {
        const productsQuery = query(collection(db, "stores", store.id, "products"))
        const productsSnapshot = await getDocs(productsQuery)

        productsSnapshot.docs.forEach(doc => {
          const data = doc.data()

          // Determinar stock
          let stockValue = 0;
          if (data.stockQuantity !== undefined) {
            stockValue = data.stockQuantity;
          } else if (data.stock !== undefined) {
            stockValue = data.stock;
          } else if (data.hasVariations && data.variations && data.variations.length > 0) {
            // Si tiene variaciones, sumar el stock de todas
            stockValue = data.variations.reduce((total: number, v: Variation) => {
              return total + (v.stock || 0);
            }, 0);
          }

          allProducts.push({
            id: doc.id,
            name: data.name,
            description: data.description,
            price: data.price,
            currency: store.currency,
            stock: stockValue,
            image: data.image,
            images: data.images,
            mediaFiles: data.mediaFiles,
            storeId: store.id,
            storeName: store.storeName,
            storeSubdomain: store.subdomain,
            status: data.status || "active",
            hasVariations: data.hasVariations || false,
            variations: data.variations || [],
            categoryId: data.categoryId,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
          })
        })
      }

      // Ordenar por fecha de creación (más recientes primero)
      allProducts.sort((a, b) => {
        const aTime = a.createdAt && typeof a.createdAt.toMillis === 'function' ? a.createdAt.toMillis() : 0
        const bTime = b.createdAt && typeof b.createdAt.toMillis === 'function' ? b.createdAt.toMillis() : 0
        return bTime - aTime
      })

      setProducts(allProducts)
    } catch (error) {
      console.error("Error loading products:", error)
    } finally {
      setLoading(false)
    }
  }, [loadStores])

  useEffect(() => {
    loadProducts()
  }, [loadProducts])

  // Resetear página cuando cambian los filtros
  useEffect(() => {
    setCurrentPage(1)
  }, [searchTerm, selectedStore, selectedStatus])

  const filteredProducts = products.filter(product => {
    // Filtro de búsqueda
    if (searchTerm) {
      const search = searchTerm.toLowerCase()
      const matchesSearch =
        product.name?.toLowerCase().includes(search) ||
        product.description?.toLowerCase().includes(search) ||
        product.storeName?.toLowerCase().includes(search)
      if (!matchesSearch) return false
    }

    // Filtro de tienda
    if (selectedStore !== "all" && product.storeId !== selectedStore) {
      return false
    }

    // Filtro de estado
    if (selectedStatus !== "all" && product.status !== selectedStatus) {
      return false
    }

    return true
  })

  // Paginación
  const totalPages = Math.ceil(filteredProducts.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex)

  // Función para limpiar HTML de la descripción
  const stripHtml = (html: string) => {
    const tmp = document.createElement("DIV")
    tmp.innerHTML = html
    return tmp.textContent || tmp.innerText || ""
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  const formatDate = (timestamp: FirebaseTimestamp) => {
    if (!timestamp) return "Sin fecha"

    try {
      // Si es un Timestamp de Firestore
      if (timestamp && typeof timestamp === 'object' && 'toDate' in timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      }

      // Si es un objeto con seconds (formato Firestore serializado)
      if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      }

      // Si es una fecha ISO string
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        }
      }

      // Si es un Date object
      if (timestamp instanceof Date) {
        return timestamp.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      }

      return "Sin fecha"
    } catch {
      return "Sin fecha"
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Products Management</h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">Manage all products across all stores</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs sm:text-sm">
              Total: <span className="font-bold text-white">{products.length}</span>
            </span>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col gap-3 sm:gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by product name, description or store..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            {/* Filters Row */}
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Store Filter */}
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Stores</option>
                {stores.map(store => (
                  <option key={store.id} value={store.id}>{store.storeName}</option>
                ))}
              </select>

              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="draft">Draft</option>
              </select>

              {/* Refresh Button */}
              <button
                onClick={loadProducts}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span className="hidden sm:inline">Refresh</span>
              </button>
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-3">
                <svg
                  className="animate-spin h-8 w-8 text-emerald-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="text-slate-400">Loading products...</p>
              </div>
            </div>
          ) : paginatedProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              <p className="text-slate-400 text-lg font-medium mb-1">No products found</p>
              <p className="text-slate-500 text-sm">Try adjusting your filters or search term</p>
            </div>
          ) : (
            <>
              {/* Desktop Table View */}
              <div className="hidden lg:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Product</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Store</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Price</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Stock</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {paginatedProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-14 w-14">
                              {(() => {
                                // Buscar la primera imagen disponible
                                let imageUrl = product.image;

                                if (!imageUrl && product.mediaFiles && product.mediaFiles.length > 0) {
                                  // Buscar primera imagen en mediaFiles
                                  const firstImage = product.mediaFiles.find((m: MediaFile) => m.type === 'image' || !m.type);
                                  imageUrl = firstImage?.url;

                                  // Si aún no hay, intentar con el primer elemento sin importar tipo
                                  if (!imageUrl && product.mediaFiles[0]) {
                                    imageUrl = product.mediaFiles[0].url;
                                  }
                                }

                                if (!imageUrl && product.images && product.images.length > 0) {
                                  imageUrl = product.images[0];
                                }

                                return imageUrl ? (
                                  <img
                                    className="h-14 w-14 rounded-lg object-cover"
                                    src={imageUrl}
                                    alt={product.name}
                                    onError={(e) => {
                                      // Mostrar placeholder en caso de error
                                      e.currentTarget.style.display = 'none';
                                      const parent = e.currentTarget.parentElement;
                                      if (parent) {
                                        parent.innerHTML = `
                                          <div class="h-14 w-14 rounded-lg bg-slate-700 flex items-center justify-center">
                                            <svg class="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                            </svg>
                                          </div>
                                        `;
                                      }
                                    }}
                                  />
                                ) : (
                                  <div className="h-14 w-14 rounded-lg bg-slate-700 flex items-center justify-center">
                                    <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                    </svg>
                                  </div>
                                );
                              })()}
                            </div>
                            <div className="ml-4 max-w-xs">
                              <div className="text-sm font-medium text-white truncate">
                                {product.name}
                              </div>
                              <div className="text-xs text-slate-400 truncate">
                                {product.description ? stripHtml(product.description).substring(0, 60) + '...' : 'No description'}
                              </div>
                              {product.hasVariations && (
                                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20 mt-1">
                                  {product.variations?.length || 0} variants
                                </span>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-white">{product.storeName}</div>
                          <div className="text-xs text-slate-400">{product.storeSubdomain}.shopifree.app</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-semibold text-white">{formatCurrency(product.price, product.currency)}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {product.hasVariations ? (
                            <span className="text-sm text-slate-400">
                              Ver variantes
                            </span>
                          ) : (
                            <span className={`text-sm font-medium ${
                              product.stock > 10 ? "text-emerald-400" : product.stock > 0 ? "text-yellow-400" : "text-slate-500"
                            }`}>
                              {product.stock > 0 ? product.stock : "−"}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : product.status === "draft"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-slate-600/10 text-slate-400 border border-slate-600/20"
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {formatDate(product.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/products/${product.id}`}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
                              title="View details"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <a
                              href={`https://${product.storeSubdomain}.shopifree.app/producto/${product.id}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="View on store"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                              </svg>
                            </a>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet Card View */}
              <div className="lg:hidden divide-y divide-slate-700">
                {paginatedProducts.map((product) => (
                  <div key={product.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex gap-3">
                      {/* Product Image */}
                      <div className="flex-shrink-0">
                        {(() => {
                          // Buscar la primera imagen disponible
                          let imageUrl = product.image;

                          if (!imageUrl && product.mediaFiles && product.mediaFiles.length > 0) {
                            // Buscar primera imagen en mediaFiles
                            const firstImage = product.mediaFiles.find((m: MediaFile) => m.type === 'image' || !m.type);
                            imageUrl = firstImage?.url;

                            // Si aún no hay, intentar con el primer elemento sin importar tipo
                            if (!imageUrl && product.mediaFiles[0]) {
                              imageUrl = product.mediaFiles[0].url;
                            }
                          }

                          if (!imageUrl && product.images && product.images.length > 0) {
                            imageUrl = product.images[0];
                          }

                          return imageUrl ? (
                            <img
                              className="h-20 w-20 rounded-lg object-cover"
                              src={imageUrl}
                              alt={product.name}
                            />
                          ) : (
                            <div className="h-20 w-20 rounded-lg bg-slate-700 flex items-center justify-center">
                              <svg className="w-10 h-10 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          );
                        })()}
                      </div>

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">{product.name}</p>
                            <p className="text-xs text-slate-400 truncate">{product.storeName}</p>
                          </div>
                          <Link
                            href={`/products/${product.id}`}
                            className="text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>

                        <div className="flex flex-wrap items-center gap-2 text-xs mb-2">
                          <span className="font-semibold text-white">{formatCurrency(product.price, product.currency)}</span>
                          {!product.hasVariations && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className={`font-medium ${
                                product.stock > 10 ? "text-emerald-400" : product.stock > 0 ? "text-yellow-400" : "text-slate-500"
                              }`}>
                                Stock: {product.stock > 0 ? product.stock : "−"}
                              </span>
                            </>
                          )}
                          {product.hasVariations && (
                            <>
                              <span className="text-slate-400">•</span>
                              <span className="text-blue-400">{product.variations?.length || 0} variantes</span>
                            </>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                            product.status === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : product.status === "draft"
                              ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                              : "bg-slate-600/10 text-slate-400 border border-slate-600/20"
                          }`}>
                            {product.status}
                          </span>
                          <span className="text-slate-400 text-xs">{formatDate(product.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800 border border-slate-700 rounded-lg p-4">
            <div className="text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{startIndex + 1}</span> to{" "}
              <span className="font-semibold text-white">{Math.min(endIndex, filteredProducts.length)}</span> of{" "}
              <span className="font-semibold text-white">{filteredProducts.length}</span> products
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum
                  if (totalPages <= 5) {
                    pageNum = i + 1
                  } else if (currentPage <= 3) {
                    pageNum = i + 1
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i
                  } else {
                    pageNum = currentPage - 2 + i
                  }

                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`w-10 h-10 rounded-lg transition-colors ${
                        currentPage === pageNum
                          ? "bg-emerald-500 text-white"
                          : "bg-slate-700 hover:bg-slate-600 text-slate-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 bg-slate-700 hover:bg-slate-600 disabled:bg-slate-800 disabled:text-slate-600 disabled:cursor-not-allowed text-white rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Summary */}
        {filteredProducts.length > 0 && (
          <div className="text-center text-sm text-slate-400">
            Total: <span className="font-semibold text-white">{filteredProducts.length}</span> products found
            {products.length !== filteredProducts.length && (
              <span> (filtered from <span className="font-semibold text-white">{products.length}</span> total)</span>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
