"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, query } from "firebase/firestore"
import { getFirebaseDb } from "../lib/firebase"
import AdminLayout from "../components/layout/AdminLayout"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts"
import Link from "next/link"

type Period = 7 | 30 | 90

interface DailyStats {
  date: string
  users: number
  stores: number
  orders: number
}

interface TopStore {
  id: string
  name: string
  subdomain: string
  ordersCount: number
  revenue: number
  productsCount: number
  currency: string
}

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [period, setPeriod] = useState<Period>(30)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    activeStores: 0
  })
  const [growthData, setGrowthData] = useState<DailyStats[]>([])
  const [topStores, setTopStores] = useState<TopStore[]>([])

  useEffect(() => {
    loadDashboardStats()
  }, [period])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase DB not available")
        return
      }

      // Contar usuarios
      const usersSnapshot = await getDocs(collection(db, "users"))
      const totalUsers = usersSnapshot.size

      // Contar tiendas
      const storesSnapshot = await getDocs(collection(db, "stores"))
      const storesData = storesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Array<{ id: string; status?: string; [key: string]: unknown }>
      const totalStores = storesData.length
      const activeStores = storesData.filter(s => (s.status || "active") === "active").length

      // Contar productos, órdenes y revenue
      let totalProducts = 0
      let totalOrders = 0
      let totalRevenue = 0
      const storesStats: { [key: string]: TopStore } = {}

      for (const storeDoc of storesSnapshot.docs) {
        const storeData = storeDoc.data()
        const storeId = storeDoc.id

        // Inicializar stats de la tienda
        storesStats[storeId] = {
          id: storeId,
          name: storeData.storeName || "Unknown",
          subdomain: storeData.subdomain || "",
          ordersCount: 0,
          revenue: 0,
          productsCount: 0,
          currency: storeData.currency || "USD"
        }

        // Contar productos
        const productsQuery = query(collection(db, "stores", storeId, "products"))
        const productsSnapshot = await getDocs(productsQuery)
        totalProducts += productsSnapshot.size
        storesStats[storeId].productsCount = productsSnapshot.size

        // Contar órdenes y revenue
        const ordersQuery = query(collection(db, "stores", storeId, "orders"))
        const ordersSnapshot = await getDocs(ordersQuery)

        ordersSnapshot.docs.forEach(orderDoc => {
          const orderData = orderDoc.data()
          totalOrders++
          storesStats[storeId].ordersCount++

          if (orderData.total) {
            totalRevenue += orderData.total
            storesStats[storeId].revenue += orderData.total
          }
        })
      }

      // Obtener top 5 tiendas por órdenes
      const topStoresList = Object.values(storesStats)
        .sort((a, b) => b.ordersCount - a.ordersCount)
        .slice(0, 5)

      // Generar datos de crecimiento (simplificado - en producción deberías obtener datos históricos reales)
      const growthDataTemp: DailyStats[] = []
      for (let i = period - 1; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        growthDataTemp.push({
          date: date.toLocaleDateString("es-ES", { month: "short", day: "numeric" }),
          users: Math.floor(totalUsers * (1 - i / period * 0.3)),
          stores: Math.floor(totalStores * (1 - i / period * 0.4)),
          orders: Math.floor(totalOrders * (1 - i / period * 0.5))
        })
      }

      setStats({
        totalUsers,
        totalStores,
        totalProducts,
        totalOrders,
        totalRevenue,
        activeStores
      })
      setGrowthData(growthDataTemp)
      setTopStores(topStoresList)
    } catch (error) {
      console.error("Error loading dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("es-ES", {
      style: "currency",
      currency: currency
    }).format(amount)
  }

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat("es-ES").format(amount)
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header with Period Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
            <p className="text-sm sm:text-base text-slate-400">Platform insights and metrics</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800 border border-slate-700 rounded-lg p-1">
            {([7, 30, 90] as Period[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  period === p
                    ? "bg-emerald-500 text-white"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                {p} days
              </button>
            ))}
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {/* Total Revenue */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Revenue</p>
            {loading ? (
              <div className="h-9 bg-slate-700 animate-pulse rounded"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-white">{formatNumber(stats.totalRevenue)}</p>
                <p className="text-xs text-slate-500 mt-1">multiple currencies</p>
              </>
            )}
          </div>

          {/* Total Users */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Users</p>
            {loading ? (
              <div className="h-9 bg-slate-700 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats.totalUsers.toLocaleString()}</p>
            )}
          </div>

          {/* Active Stores */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Active Stores</p>
            {loading ? (
              <div className="h-9 bg-slate-700 animate-pulse rounded"></div>
            ) : (
              <>
                <p className="text-3xl font-bold text-white">{stats.activeStores.toLocaleString()}</p>
                <p className="text-xs text-slate-500 mt-1">of {stats.totalStores} total</p>
              </>
            )}
          </div>

          {/* Total Orders */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Orders</p>
            {loading ? (
              <div className="h-9 bg-slate-700 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats.totalOrders.toLocaleString()}</p>
            )}
          </div>
        </div>

        {/* Growth Chart */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-6">Growth Trends</h2>
          {loading ? (
            <div className="h-80 bg-slate-700 animate-pulse rounded"></div>
          ) : (
            <ResponsiveContainer width="100%" height={320}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis stroke="#94a3b8" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1e293b",
                    border: "1px solid #334155",
                    borderRadius: "8px"
                  }}
                />
                <Legend />
                <Line type="monotone" dataKey="users" stroke="#3b82f6" strokeWidth={2} name="Users" />
                <Line type="monotone" dataKey="stores" stroke="#8b5cf6" strokeWidth={2} name="Stores" />
                <Line type="monotone" dataKey="orders" stroke="#f97316" strokeWidth={2} name="Orders" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Top Stores */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Top Performing Stores</h2>
            <Link href="/stores" className="text-sm text-emerald-400 hover:text-emerald-300">
              View all →
            </Link>
          </div>
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-slate-700 animate-pulse rounded"></div>
              ))}
            </div>
          ) : topStores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">No stores data available yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {topStores.map((store, index) => (
                <Link
                  key={store.id}
                  href={`/stores/${store.id}`}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg hover:bg-slate-700 transition-colors border border-slate-700"
                >
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="flex-shrink-0 w-10 h-10 bg-emerald-500/10 rounded-lg flex items-center justify-center">
                      <span className="text-emerald-500 font-bold">#{index + 1}</span>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-white font-medium truncate">{store.name}</p>
                      <p className="text-slate-400 text-sm truncate">{store.subdomain}.shopifree.app</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 flex-shrink-0">
                    <div className="text-right">
                      <p className="text-white font-semibold">{store.ordersCount}</p>
                      <p className="text-slate-400 text-xs">Orders</p>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-semibold">{formatCurrency(store.revenue, store.currency)}</p>
                      <p className="text-slate-400 text-xs">Revenue</p>
                    </div>
                    <div className="text-right hidden sm:block">
                      <p className="text-white font-semibold">{store.productsCount}</p>
                      <p className="text-slate-400 text-xs">Products</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Quick Links */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <Link href="/users" className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-500/10 rounded-lg flex items-center justify-center text-blue-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Manage Users</p>
                <p className="text-slate-400 text-sm">View and manage all users</p>
              </div>
            </div>
          </Link>

          <Link href="/stores" className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Manage Stores</p>
                <p className="text-slate-400 text-sm">View and moderate stores</p>
              </div>
            </div>
          </Link>

          <button className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition-colors text-left">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div>
                <p className="text-white font-semibold">Export Report</p>
                <p className="text-slate-400 text-sm">Download analytics data</p>
              </div>
            </div>
          </button>
        </div>
      </div>
    </AdminLayout>
  )
}
