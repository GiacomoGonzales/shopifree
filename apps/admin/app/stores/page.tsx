"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, Timestamp } from "firebase/firestore"
import { getFirebaseDb } from "../../lib/firebase"
import AdminLayout from "../../components/layout/AdminLayout"
import Link from "next/link"

interface Store {
  id: string
  storeName: string
  subdomain: string
  description: string
  ownerId: string
  primaryColor: string
  secondaryColor: string
  currency: string
  phone: string
  logoUrl?: string
  status?: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export default function StoresPage() {
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const loadStores = useCallback(async () => {
    try {
      setLoading(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase DB not available")
        return
      }

      const storesSnapshot = await getDocs(collection(db, "stores"))
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[]

      // Ordenar por fecha de creación (más recientes primero)
      storesData.sort((a, b) => {
        const aTime = a.createdAt?.toMillis() || 0
        const bTime = b.createdAt?.toMillis() || 0
        return bTime - aTime
      })

      setStores(storesData)
    } catch (error) {
      console.error("Error loading stores:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadStores()
  }, [loadStores])

  const filteredStores = stores.filter(store => {
    if (!searchTerm) return true
    const search = searchTerm.toLowerCase()
    return (
      store.storeName?.toLowerCase().includes(search) ||
      store.subdomain?.toLowerCase().includes(search) ||
      store.description?.toLowerCase().includes(search)
    )
  })

  const formatDate = (timestamp: Timestamp) => {
    return timestamp?.toDate().toLocaleDateString("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric"
    })
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Stores Management</h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">Manage all stores on the platform</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 sm:px-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-slate-300 text-xs sm:text-sm">
              Total: <span className="font-bold text-white">{stores.length}</span>
            </span>
          </div>
        </div>

        {/* Search */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 sm:p-4">
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="flex-1">
              <div className="relative">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search by store name, subdomain or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>
            <button
              onClick={loadStores}
              className="px-4 py-2 bg-slate-700 hover:bg-slate-600 border border-slate-600 rounded-lg text-white transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Table - Desktop / Cards - Mobile */}
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
                <p className="text-slate-400">Loading stores...</p>
              </div>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-slate-400 text-lg font-medium mb-1">No stores found</p>
              <p className="text-slate-500 text-sm">Try adjusting your search term</p>
            </div>
          ) : (
            <>
              {/* Vista de tabla para desktop */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-900 border-b border-slate-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Store</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Subdomain</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Currency</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Created</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-700">
                    {filteredStores.map((store) => (
                      <tr key={store.id} className="hover:bg-slate-700/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {store.logoUrl ? (
                                <img
                                  className="h-10 w-10 rounded-lg object-cover"
                                  src={store.logoUrl}
                                  alt={store.storeName}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-semibold">
                                  {store.storeName[0].toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-white">
                                {store.storeName}
                              </div>
                              <div className="text-xs text-slate-400">
                                {store.description?.substring(0, 40)}...
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <a
                            href={`https://${store.subdomain}.shopifree.app`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-emerald-400 hover:text-emerald-300 transition-colors"
                          >
                            {store.subdomain}.shopifree.app
                          </a>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            (store.status || "active") === "active"
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                              : "bg-slate-600/10 text-slate-400 border border-slate-600/20"
                          }`}>
                            {(store.status || "active") === "active" ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm text-slate-300">{store.currency}</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                          {store.createdAt ? formatDate(store.createdAt) : "Unknown"}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/stores/${store.id}`}
                              className="text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                            </Link>
                            <a
                              href={`https://${store.subdomain}.shopifree.app`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-400 hover:text-blue-300 transition-colors"
                              title="Visit store"
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

              {/* Vista de tarjetas para móvil */}
              <div className="md:hidden divide-y divide-slate-700">
                {filteredStores.map((store) => (
                  <div key={store.id} className="p-4 hover:bg-slate-700/50 transition-colors">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        {store.logoUrl ? (
                          <img
                            className="h-12 w-12 rounded-lg object-cover flex-shrink-0"
                            src={store.logoUrl}
                            alt={store.storeName}
                          />
                        ) : (
                          <div className="h-12 w-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-500 font-semibold flex-shrink-0">
                            {store.storeName[0].toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-white truncate">
                            {store.storeName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{store.subdomain}.shopifree.app</p>
                        </div>
                      </div>
                      <Link
                        href={`/stores/${store.id}`}
                        className="text-emerald-400 hover:text-emerald-300 transition-colors flex-shrink-0 ml-2"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </Link>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-xs">
                      <span className={`px-2 py-1 rounded-full font-semibold ${
                        (store.status || "active") === "active"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : "bg-slate-600/10 text-slate-400 border border-slate-600/20"
                      }`}>
                        {(store.status || "active") === "active" ? "Active" : "Inactive"}
                      </span>
                      <span className="text-slate-400">{store.currency}</span>
                      <span className="text-slate-400">•</span>
                      <span className="text-slate-400">{store.createdAt ? formatDate(store.createdAt) : "Unknown"}</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Pagination Info */}
        {filteredStores.length > 0 && (
          <div className="flex items-center justify-between text-sm text-slate-400">
            <span>
              Showing <span className="font-semibold text-white">{filteredStores.length}</span> of{" "}
              <span className="font-semibold text-white">{stores.length}</span> stores
            </span>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
