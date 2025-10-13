'use client'

import { useState, useEffect } from 'react'
import { collection, getDocs, query } from 'firebase/firestore'
import { getFirebaseDb } from '../lib/firebase'
import AdminLayout from '../components/layout/AdminLayout'

export default function AdminPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalStores: 0,
    totalProducts: 0,
    totalOrders: 0
  })

  useEffect(() => {
    loadDashboardStats()
  }, [])

  const loadDashboardStats = async () => {
    try {
      setLoading(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error('Firebase DB not available')
        return
      }

      // Contar usuarios
      const usersSnapshot = await getDocs(collection(db, 'users'))
      const totalUsers = usersSnapshot.size

      // Contar tiendas
      const storesSnapshot = await getDocs(collection(db, 'stores'))
      const totalStores = storesSnapshot.size

      // Contar productos y órdenes de todas las tiendas
      let totalProducts = 0
      let totalOrders = 0

      for (const storeDoc of storesSnapshot.docs) {
        // Contar productos de esta tienda
        const productsQuery = query(collection(db, 'stores', storeDoc.id, 'products'))
        const productsSnapshot = await getDocs(productsQuery)
        totalProducts += productsSnapshot.size

        // Contar órdenes de esta tienda
        const ordersQuery = query(collection(db, 'stores', storeDoc.id, 'orders'))
        const ordersSnapshot = await getDocs(ordersQuery)
        totalOrders += ordersSnapshot.size
      }

      setStats({
        totalUsers,
        totalStores,
        totalProducts,
        totalOrders
      })
    } catch (error) {
      console.error('Error loading dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <AdminLayout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">Dashboard</h1>
          <p className="text-sm sm:text-base text-slate-400">Welcome to Shopifree Admin Panel</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
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

          {/* Total Stores */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Stores</p>
            {loading ? (
              <div className="h-9 bg-slate-700 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats.totalStores.toLocaleString()}</p>
            )}
          </div>

          {/* Total Products */}
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 bg-purple-500/10 rounded-lg flex items-center justify-center text-purple-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
            </div>
            <p className="text-slate-400 text-sm mb-1">Total Products</p>
            {loading ? (
              <div className="h-9 bg-slate-700 animate-pulse rounded"></div>
            ) : (
              <p className="text-3xl font-bold text-white">{stats.totalProducts.toLocaleString()}</p>
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

        {/* Recent Activity */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-blue-500/10 rounded-full flex items-center justify-center text-blue-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">New user registered</p>
                  <p className="text-slate-400 text-xs">john@example.com</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">2 minutes ago</span>
            </div>

            <div className="flex items-center justify-between py-3 border-b border-slate-700">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-full flex items-center justify-center text-emerald-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">New store created</p>
                  <p className="text-slate-400 text-xs">TechStore</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">15 minutes ago</span>
            </div>

            <div className="flex items-center justify-between py-3">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 bg-purple-500/10 rounded-full flex items-center justify-center text-purple-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <div>
                  <p className="text-white text-sm font-medium">Product published</p>
                  <p className="text-slate-400 text-xs">iPhone 15 Pro</p>
                </div>
              </div>
              <span className="text-slate-400 text-xs">1 hour ago</span>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">System Status</h2>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Firebase</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">Cloudinary</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full">
                  Operational
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 text-sm">SendGrid</span>
                <span className="px-3 py-1 bg-emerald-500/10 text-emerald-500 text-xs font-semibold rounded-full">
                  Operational
                </span>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Send Platform Announcement
              </button>
              <button className="w-full flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                System Maintenance Mode
              </button>
              <button className="w-full flex items-center px-4 py-3 bg-slate-700 hover:bg-slate-600 rounded-lg text-white text-sm transition-colors">
                <svg className="w-5 h-5 mr-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Export Analytics Report
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
} 