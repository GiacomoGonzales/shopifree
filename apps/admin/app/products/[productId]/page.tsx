"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, collection, getDocs } from "firebase/firestore"
import { getFirebaseDb } from "../../../lib/firebase"
import AdminLayout from "../../../components/layout/AdminLayout"
import Link from "next/link"
import { useParams } from "next/navigation"

type FirebaseTimestamp = {
  toDate: () => Date
  seconds: number
  nanoseconds: number
} | { seconds: number } | string | Date

interface MediaFile {
  url: string
  type?: string
}

interface Variation {
  id: string
  name: string
  price: number
  stock: number
  sku?: string
  attributes: Record<string, string>
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
  status: string
  hasVariations: boolean
  variations?: Variation[]
  categoryId?: string
  tags?: string[]
  sku?: string
  weight?: number
  dimensions?: {
    length: number
    width: number
    height: number
  }
  createdAt: FirebaseTimestamp
  updatedAt: FirebaseTimestamp
}

interface Store {
  storeName: string
  subdomain: string
  currency: string
  primaryColor: string
  logoUrl?: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const productId = params?.productId as string

  const [product, setProduct] = useState<Product | null>(null)
  const [store, setStore] = useState<Store | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    const loadProduct = async () => {
      try {
        setLoading(true)
        const db = getFirebaseDb()
        if (!db) {
          console.error("Firebase DB not available")
          return
        }

        // Los productos están en subcolecciones de stores
        // Necesitamos buscar en todas las tiendas
        const storesSnapshot = await getDocs(collection(db, "stores"))
        let foundProduct: Product | null = null
        let foundStore: Store | null = null

        for (const storeDoc of storesSnapshot.docs) {
          const productDoc = await getDoc(doc(db, "stores", storeDoc.id, "products", productId))

          if (productDoc.exists()) {
            const storeData = storeDoc.data()
            foundStore = {
              storeName: storeData.storeName,
              subdomain: storeData.subdomain,
              currency: storeData.currency,
              primaryColor: storeData.primaryColor,
              logoUrl: storeData.logoUrl
            }

            const data = productDoc.data()

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

            foundProduct = {
              id: productDoc.id,
              name: data.name,
              description: data.description,
              price: data.price,
              currency: foundStore.currency,
              stock: stockValue,
              image: data.image,
              images: data.images,
              mediaFiles: data.mediaFiles,
              storeId: storeDoc.id,
              status: data.status || "active",
              hasVariations: data.hasVariations || false,
              variations: data.variations || [],
              categoryId: data.categoryId,
              tags: data.tags || [],
              sku: data.sku,
              weight: data.weight,
              dimensions: data.dimensions,
              createdAt: data.createdAt,
              updatedAt: data.updatedAt
            }
            break
          }
        }

        if (foundProduct && foundStore) {
          setProduct(foundProduct)
          setStore(foundStore)
        } else {
          console.error("Product not found in any store")
        }
      } catch (error) {
        console.error("Error loading product:", error)
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      loadProduct()
    }
  }, [productId])

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
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }

      // Si es un objeto con seconds (formato Firestore serializado)
      if (timestamp && typeof timestamp === 'object' && 'seconds' in timestamp) {
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit"
        })
      }

      // Si es una fecha ISO string
      if (typeof timestamp === 'string') {
        const date = new Date(timestamp)
        if (!isNaN(date.getTime())) {
          return date.toLocaleDateString("es-ES", {
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit"
          })
        }
      }

      return "Sin fecha"
    } catch {
      return "Sin fecha"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center gap-3">
            <svg
              className="animate-spin h-10 w-10 text-emerald-500"
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
            <p className="text-slate-400 text-lg">Loading product details...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!product) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <svg className="w-20 h-20 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <h2 className="text-xl font-bold text-white mb-2">Product Not Found</h2>
          <p className="text-slate-400 mb-6">The product you&apos;re looking for doesn&apos;t exist</p>
          <Link
            href="/products"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors"
          >
            Back to Products
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/products"
              className="text-slate-400 hover:text-white transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </Link>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Product Details</h1>
              <p className="text-sm text-slate-400 mt-1">View complete product information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {store && (
              <a
                href={`https://${store.subdomain}.shopifree.app/producto/${product.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                View on Store
              </a>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Images */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product Images</h2>
              {(() => {
                // Construir array de todas las imágenes disponibles
                const allImages = [];
                if (product.image) allImages.push(product.image);
                if (product.images) allImages.push(...product.images);
                if (product.mediaFiles) {
                  product.mediaFiles.forEach(media => {
                    if (media.type === 'image' && media.url && !allImages.includes(media.url)) {
                      allImages.push(media.url);
                    }
                  });
                }

                return allImages.length > 0 ? (
                  <div className="space-y-4">
                    {/* Main Image */}
                    <div className="aspect-square rounded-lg overflow-hidden bg-slate-900">
                      <img
                        src={allImages[selectedImage]}
                        alt={product.name}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    {/* Thumbnails */}
                    {allImages.length > 1 && (
                      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                        {allImages.map((image, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImage(index)}
                            className={`aspect-square rounded-lg overflow-hidden border-2 transition-colors ${
                              selectedImage === index
                                ? "border-emerald-500"
                                : "border-slate-700 hover:border-slate-600"
                            }`}
                          >
                            <img
                              src={image}
                              alt={`${product.name} ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="aspect-square rounded-lg bg-slate-900 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-20 h-20 text-slate-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-slate-500">No images available</p>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Product Information */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Product Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Name</label>
                  <p className="text-white text-lg">{product.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Description</label>
                  <p className="text-slate-300 whitespace-pre-wrap">{product.description}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Price</label>
                    <p className="text-white text-xl font-bold">{formatCurrency(product.price, product.currency)}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Stock</label>
                    {product.hasVariations ? (
                      <p className="text-slate-400 text-sm">Ver en variantes abajo</p>
                    ) : (
                      <p className={`text-xl font-bold ${
                        product.stock > 10 ? "text-emerald-400" : product.stock > 0 ? "text-yellow-400" : "text-slate-500"
                      }`}>
                        {product.stock > 0 ? `${product.stock} units` : "Sin stock"}
                      </p>
                    )}
                  </div>
                </div>
                {product.sku && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">SKU</label>
                    <p className="text-white font-mono">{product.sku}</p>
                  </div>
                )}
                {product.tags && product.tags.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-slate-400 mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2">
                      {product.tags.map((tag, index) => (
                        <span key={index} className="px-3 py-1 bg-slate-700 text-slate-300 rounded-full text-sm">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Variations */}
            {product.hasVariations && product.variations && product.variations.length > 0 && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">
                  Variations ({product.variations.length})
                </h2>
                <div className="space-y-3">
                  {product.variations.map((variation, index) => (
                    <div key={variation.id || index} className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="font-medium text-white">{variation.name}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          variation.stock > 10 ? "bg-emerald-500/10 text-emerald-400" :
                          variation.stock > 0 ? "bg-yellow-500/10 text-yellow-400" :
                          "bg-red-500/10 text-red-400"
                        }`}>
                          Stock: {variation.stock}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="text-slate-400">Price:</span>
                          <span className="ml-2 text-white font-semibold">
                            {formatCurrency(variation.price, product.currency)}
                          </span>
                        </div>
                        {variation.sku && (
                          <div>
                            <span className="text-slate-400">SKU:</span>
                            <span className="ml-2 text-white font-mono text-xs">{variation.sku}</span>
                          </div>
                        )}
                      </div>
                      {variation.attributes && Object.keys(variation.attributes).length > 0 && (
                        <div className="mt-3 pt-3 border-t border-slate-700">
                          <div className="flex flex-wrap gap-2">
                            {Object.entries(variation.attributes).map(([key, value]) => (
                              <span key={key} className="px-2 py-1 bg-slate-800 text-slate-300 rounded text-xs">
                                {key}: <span className="font-medium">{value}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar - Right Side */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Status</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-2">Current Status</label>
                  <span className={`inline-flex px-4 py-2 rounded-lg text-sm font-semibold ${
                    product.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : product.status === "draft"
                      ? "bg-yellow-500/10 text-yellow-400 border border-yellow-500/20"
                      : "bg-slate-600/10 text-slate-400 border border-slate-600/20"
                  }`}>
                    {product.status.charAt(0).toUpperCase() + product.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Store Information */}
            {store && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Store</h2>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    {store.logoUrl ? (
                      <img
                        src={store.logoUrl}
                        alt={store.storeName}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <span className="text-emerald-500 font-semibold text-lg">
                          {store.storeName[0].toUpperCase()}
                        </span>
                      </div>
                    )}
                    <div>
                      <p className="font-medium text-white">{store.storeName}</p>
                      <p className="text-xs text-slate-400">{store.subdomain}.shopifree.app</p>
                    </div>
                  </div>
                  <Link
                    href={`/stores/${product.storeId}`}
                    className="block w-full text-center px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors text-sm"
                  >
                    View Store Details
                  </Link>
                </div>
              </div>
            )}

            {/* Timestamps */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-lg font-semibold text-white mb-4">Timestamps</h2>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Created</label>
                  <p className="text-white text-sm">{formatDate(product.createdAt)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-400 mb-1">Last Updated</label>
                  <p className="text-white text-sm">{formatDate(product.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Technical Details */}
            {(product.weight || product.dimensions) && (
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h2 className="text-lg font-semibold text-white mb-4">Technical Details</h2>
                <div className="space-y-3">
                  {product.weight && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Weight</label>
                      <p className="text-white">{product.weight} kg</p>
                    </div>
                  )}
                  {product.dimensions && (
                    <div>
                      <label className="block text-sm font-medium text-slate-400 mb-1">Dimensions (L x W x H)</label>
                      <p className="text-white">
                        {product.dimensions.length} x {product.dimensions.width} x {product.dimensions.height} cm
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
