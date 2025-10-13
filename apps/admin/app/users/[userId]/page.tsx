'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, Timestamp } from 'firebase/firestore'
import { getFirebaseDb } from '../../../lib/firebase'
import AdminLayout from '../../../components/layout/AdminLayout'
import Link from 'next/link'

interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: 'user' | 'admin' | 'superadmin'
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  phoneNumber?: string
  bio?: string
}

interface Store {
  id: string
  storeName: string
  description: string
  subdomain: string
  ownerId: string
  createdAt: Timestamp
  updatedAt: Timestamp
}

export default function UserDetailPage() {
  const params = useParams()
  const router = useRouter()
  const userId = params?.userId as string

  const [user, setUser] = useState<User | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [productsCount, setProductsCount] = useState(0)
  const [ordersCount, setOrdersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editRole, setEditRole] = useState<'user' | 'admin' | 'superadmin'>('user')

  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId])

  const loadUserData = async () => {
    try {
      setLoading(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error('Firebase DB not available')
        return
      }

      // Cargar datos del usuario
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (userDoc.exists()) {
        setUser({ uid: userDoc.id, ...userDoc.data() } as User)
        setEditRole((userDoc.data().role || 'user') as 'user' | 'admin' | 'superadmin')
      }

      // Cargar tiendas del usuario
      const storesQuery = query(
        collection(db, 'stores'),
        where('ownerId', '==', userId)
      )
      const storesSnapshot = await getDocs(storesQuery)
      const storesData = storesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Store[]
      setStores(storesData)

      // Contar productos y órdenes de todas las tiendas del usuario
      let totalProducts = 0
      let totalOrders = 0
      for (const store of storesData) {
        // Contar productos
        const productsQuery = query(collection(db, 'stores', store.id, 'products'))
        const productsSnapshot = await getDocs(productsQuery)
        totalProducts += productsSnapshot.size

        // Contar órdenes
        const ordersQuery = query(collection(db, 'stores', store.id, 'orders'))
        const ordersSnapshot = await getDocs(ordersQuery)
        totalOrders += ordersSnapshot.size
      }
      setProductsCount(totalProducts)
      setOrdersCount(totalOrders)

    } catch (error) {
      console.error('Error loading user data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!user) return

    try {
      const db = getFirebaseDb()
      if (!db) return

      const newStatus = !user.isActive
      await updateDoc(doc(db, 'users', userId), {
        isActive: newStatus,
        updatedAt: Timestamp.now()
      })

      setUser({ ...user, isActive: newStatus })
    } catch (error) {
      console.error('Error updating user status:', error)
      alert('Error updating user status')
    }
  }

  const handleUpdateRole = async () => {
    if (!user) return

    try {
      const db = getFirebaseDb()
      if (!db) return

      await updateDoc(doc(db, 'users', userId), {
        role: editRole,
        updatedAt: Timestamp.now()
      })

      setUser({ ...user, role: editRole })
      setShowEditModal(false)
    } catch (error) {
      console.error('Error updating user role:', error)
      alert('Error updating user role')
    }
  }

  const formatDate = (timestamp: Timestamp) => {
    return timestamp?.toDate().toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'superadmin':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
      case 'admin':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
      default:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    }
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
            <p className="text-slate-400">Loading user data...</p>
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (!user) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center py-12">
          <svg className="w-16 h-16 text-slate-600 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
          <p className="text-slate-400 text-lg font-medium mb-4">User not found</p>
          <Link
            href="/users"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
          >
            Back to Users
          </Link>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 sm:gap-4">
          <Link
            href="/users"
            className="text-slate-400 hover:text-white transition-colors flex-shrink-0"
          >
            <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl font-bold text-white">User Details</h1>
            <p className="text-sm sm:text-base text-slate-400 mt-1">View and manage user information</p>
          </div>
        </div>

        {/* User Profile Card */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-500/10 to-blue-500/10 px-4 sm:px-6 py-6 sm:py-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-start justify-between gap-4">
              <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto">
                {user.photoURL ? (
                  <img
                    className="h-16 w-16 sm:h-24 sm:w-24 rounded-full border-4 border-slate-800 flex-shrink-0"
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                  />
                ) : (
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-slate-800 flex-shrink-0">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate">
                    {user.displayName || 'No name'}
                  </h2>
                  <p className="text-sm sm:text-base text-slate-300 mb-3 truncate">{user.email}</p>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getRoleBadgeColor(user.role)}`}>
                      {user.role}
                    </span>
                    {user.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full"></span>
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">
                        <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                        Inactive
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
                <button
                  onClick={() => setShowEditModal(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit Role
                </button>
                <button
                  onClick={handleToggleStatus}
                  className={`px-4 py-2 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm ${
                    user.isActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-emerald-500 hover:bg-emerald-600 text-white'
                  }`}
                >
                  {user.isActive ? (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                      Deactivate
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Activate
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* User Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 p-4 sm:p-6">
            <div>
              <p className="text-sm text-slate-400 mb-1">User ID</p>
              <p className="text-white font-mono text-sm">{user.uid}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Phone Number</p>
              <p className="text-white">{user.phoneNumber || 'Not provided'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Registered</p>
              <p className="text-white">{user.createdAt ? formatDate(user.createdAt) : 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Last Updated</p>
              <p className="text-white">{user.updatedAt ? formatDate(user.updatedAt) : 'Unknown'}</p>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Stores</p>
                <p className="text-3xl font-bold text-white">{stores.length}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-400 text-sm mb-1">Products</p>
                <p className="text-3xl font-bold text-white">{productsCount}</p>
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
                <p className="text-3xl font-bold text-white">{ordersCount}</p>
              </div>
              <div className="w-12 h-12 bg-orange-500/10 rounded-lg flex items-center justify-center text-orange-500">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* User Stores */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
          <h3 className="text-xl font-bold text-white mb-4">Stores</h3>
          {stores.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-slate-400">This user has no stores yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className="flex items-center justify-between p-4 bg-slate-900 rounded-lg border border-slate-700"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-emerald-500/10 rounded-lg flex items-center justify-center text-emerald-500">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium">{store.storeName}</p>
                      <p className="text-slate-400 text-sm">{store.subdomain}.shopifree.com</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://${store.subdomain}.shopifree.com`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-emerald-400 hover:text-emerald-300 transition-colors"
                      title="Visit store"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Role Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-white mb-4">Edit User Role</h3>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Role
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as 'user' | 'admin' | 'superadmin')}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400">
                  ⚠️ Changing a user's role will affect their permissions and access to the platform.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateRole}
                className="flex-1 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
