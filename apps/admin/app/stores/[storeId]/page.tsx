"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, collection, query, getDocs, updateDoc, Timestamp } from "firebase/firestore"
import { getFirebaseDb } from "../../../lib/firebase"
import AdminLayout from "../../../components/layout/AdminLayout"
import Link from "next/link"

interface Store {
  id: string
  storeName: string
  subdomain: string
  description: string
  slogan?: string
  ownerId: string
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  emailStore?: string
  logoUrl?: string
  storefrontImageUrl?: string
  status?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  businessType?: string
  address?: string
  socialMedia?: {
    facebook?: string
    instagram?: string
    whatsapp?: string
    tiktok?: string
  }
}

interface Product {
  id: string
  name: string
  price: number
  status: string
}

interface Order {
  id: string
  total: number
  status: string
  createdAt: Timestamp
}

interface User {
  uid: string
  email: string | null
  displayName: string | null
}

export default function StoreDetailPage() {
  const params = useParams()
  const storeId = params?.storeId as string

  const [store, setStore] = useState<Store | null>(null)
  const [owner, setOwner] = useState<User | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  const loadStoreData = useCallback(async () => {
    try {
      setLoading(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase DB not available")
        return
      }

      // Cargar datos de la tienda
      const storeDoc = await getDoc(doc(db, "stores", storeId))
      if (storeDoc.exists()) {
        const storeData = { id: storeDoc.id, ...storeDoc.data() } as Store
        setStore(storeData)

        // Cargar datos del dueño
        if (storeData.ownerId) {
          const ownerDoc = await getDoc(doc(db, "users", storeData.ownerId))
          if (ownerDoc.exists()) {
            setOwner({ uid: ownerDoc.id, ...ownerDoc.data() } as User)
          }
        }
      }

      // Cargar productos
      const productsQuery = query(collection(db, "stores", storeId, "products"))
      const productsSnapshot = await getDocs(productsQuery)
      const productsData = productsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Product[]
      setProducts(productsData)

      // Cargar órdenes
      const ordersQuery = query(collection(db, "stores", storeId, "orders"))
      const ordersSnapshot = await getDocs(ordersQuery)
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Order[]
      setOrders(ordersData)

    } catch (error) {
      console.error("Error loading store data:", error)
    } finally {
      setLoading(false)
    }
  }, [storeId])

  useEffect(() => {
    if (storeId) {
      loadStoreData()
    }
  }, [storeId, loadStoreData])

  const toggleStoreStatus = async () => {
    if (!store) return

    try {
      setUpdating(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase DB not available")
        return
      }

      const currentStatus = store.status || "active"
      const newStatus = currentStatus === "active" ? "inactive" : "active"

      await updateDoc(doc(db, "stores", storeId), {
        status: newStatus,
        updatedAt: Timestamp.now()
      })

      setStore({ ...store, status: newStatus })
    } catch (error) {
      console.error("Error updating store status:", error)
      alert("Failed to update store status. Please try again.")
    } finally {
      setUpdating(false)
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    return timestamp?.toDate().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency || "USD"
    }).format(amount)
  }

  if (loading) {
    return (
      <AdminLayout>
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
            <p className="text-slate-400">Loading store data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!store) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <p className="text-slate-400 text-lg font-medium mb-4">Store not found</p>
          <Link
            href="/stores"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Back to Stores
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const activeProducts = products.filter(p => p.status === "active").length
  const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0)

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/stores"
              className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
            >
              <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </Link>
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-white">Store Details</h1>
              <p className="text-sm sm:text-base text-slate-400 mt-1">View and manage store information</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className={`px-4 py-2 rounded-lg text-sm font-semibold ${
              (store.status || "active") === "active"
                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                : "bg-slate-600/10 text-slate-400 border border-slate-600/20"
            }`}>
              {(store.status || "active") === "active" ? "Active" : "Inactive"}
            </span>
          </div>
        </div>

        {/* Store Profile Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500/10 to-purple-500/10 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                {store.logoUrl ? (
                  <img
                    className="h-16 w-16 sm:h-24 sm:w-24 rounded-lg object-cover border-4 border-slate-800 flex-shrink-0"
                    src={store.logoUrl}
                    alt={store.storeName}
                  />
                ) : (
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-lg bg-emerald-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-slate-800 flex-shrink-0">
                    {store.storeName[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate">
                    {store.storeName}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 mb-2">{store.slogan || store.description}</p>
                  <a
                    href={`https://${store.subdomain}.shopifree.app`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors inline-flex items-center gap-1"
                  >
                    {store.subdomain}.shopifree.app
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Store Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">Store ID</p>
              <p className="text-white font-mono text-sm">{store.id}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Currency</p>
              <p className="text-white">{store.currency}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Phone</p>
              <p className="text-white">{store.phone || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Email</p>
              <p className="text-white">{store.emailStore || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Business Type</p>
              <p className="text-white">{store.businessType || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Address</p>
              <p className="text-white">{store.address || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Created</p>
              <p className="text-white">{store.createdAt ? formatDate(store.createdAt) : "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Last Updated</p>
              <p className="text-white">{store.updatedAt ? formatDate(store.updatedAt) : "Unknown"}</p>
            </div>
          </div>
        </div>

        {/* Owner Info */}
        {owner && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
            <h3 className="text-lg font-bold text-white mb-4">Store Owner</h3>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white font-medium">{owner.displayName || "No name"}</p>
                <p className="text-slate-400 text-sm">{owner.email}</p>
              </div>
              <Link
                href={`/users/${owner.uid}`}
                className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-sm rounded-lg transition-colors"
              >
                View Profile
              </Link>
            </div>
          </div>
        )}

        {/* Moderation Actions */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 sm:p-6">
          <h3 className="text-lg font-bold text-white mb-4">Moderation Actions</h3>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 bg-slate-900 rounded-lg border border-slate-700">
              <div>
                <p className="text-white font-medium mb-1">Store Status</p>
                <p className="text-slate-400 text-sm">
                  {(store.status || "active") === "active"
                    ? "This store is currently active and visible to customers"
                    : "This store is currently inactive and not visible to customers"}
                </p>
              </div>
              <button
                onClick={toggleStoreStatus}
                disabled={updating}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors whitespace-nowrap ${
                  (store.status || "active") === "active"
                    ? "bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20"
                } ${updating ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {updating ? "Updating..." : (store.status || "active") === "active" ? "Deactivate Store" : "Activate Store"}
              </button>
            </div>

            <div className="flex items-start gap-3 p-4 bg-amber-500/5 rounded-lg border border-amber-500/20">
              <svg className="w-5 h-5 text-amber-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <p className="text-amber-400 font-medium text-sm mb-1">Important Notice</p>
                <p className="text-slate-300 text-sm">
                  Deactivating a store will make it inaccessible to customers. The store owner will be notified about this action.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Products</p>
                <p className="text-3xl font-bold text-white">{products.length}</p>
                <p className="text-xs text-slate-500 mt-1">{activeProducts} active</p>
              </div>
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Orders</p>
                <p className="text-3xl font-bold text-white">{orders.length}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
                <p className="text-3xl font-bold text-white">{formatCurrency(totalRevenue, store.currency)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Products */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Recent Products</h3>
          {products.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">This store has no products yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {products.slice(0, 5).map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div>
                    <p className="text-white font-medium">{product.name}</p>
                    <p className="text-slate-400 text-sm">{formatCurrency(product.price, store.currency)}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                    product.status === "active"
                      ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                      : "bg-slate-600/10 text-slate-400 border border-slate-600/20"
                  }`}>
                    {product.status}
                  </span>
                </div>
              ))}
              {products.length > 5 && (
                <p className="text-center text-sm text-slate-400 pt-2">
                  And {products.length - 5} more products...
                </p>
              )}
            </div>
          )}
        </div>

        {/* Social Media */}
        {store.socialMedia && Object.keys(store.socialMedia).length > 0 && (
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Social Media</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {store.socialMedia.facebook && (
                <a
                  href={store.socialMedia.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <span className="text-slate-300 text-sm">Facebook</span>
                </a>
              )}
              {store.socialMedia.instagram && (
                <a
                  href={store.socialMedia.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <span className="text-slate-300 text-sm">Instagram</span>
                </a>
              )}
              {store.socialMedia.whatsapp && (
                <a
                  href={`https://wa.me/${store.socialMedia.whatsapp}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <span className="text-slate-300 text-sm">WhatsApp</span>
                </a>
              )}
              {store.socialMedia.tiktok && (
                <a
                  href={store.socialMedia.tiktok}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 p-3 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors"
                >
                  <span className="text-slate-300 text-sm">TikTok</span>
                </a>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
