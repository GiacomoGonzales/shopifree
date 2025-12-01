"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams } from "next/navigation"
import { doc, getDoc, collection, query, where, getDocs, updateDoc, Timestamp } from "firebase/firestore"
import { getFirebaseDb } from "../../../lib/firebase"
import AdminLayout from "../../../components/layout/AdminLayout"
import Link from "next/link"

interface User {
  uid: string
  email: string | null
  displayName: string | null
  photoURL: string | null
  role: "user" | "admin" | "superadmin"
  isActive: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  phoneNumber?: string
  bio?: string
  // Subscription fields
  subscriptionStatus?: "trial" | "active" | "cancelled" | "expired" | "free"
  subscriptionPlan?: "free" | "premium" | "pro"
  trialStartDate?: Timestamp
  trialEndDate?: Timestamp
  subscriptionStartDate?: Timestamp
  subscriptionEndDate?: Timestamp
  features?: {
    maxProducts: number
    hasCustomDomain: boolean
    hasIntegratedPayments: boolean
    hasTraditionalCheckout: boolean
    hasCartRecovery: boolean
    hasAutoEmails: boolean
    hasGoogleAnalytics: boolean
    hasMetaPixel: boolean
    hasCompleteReports: boolean
    hasUnlimitedProducts: boolean
    hasInternationalSales: boolean
    hasMultipleLanguages: boolean
    hasCustomerSegmentation: boolean
    hasAdvancedMarketing: boolean
    hasExclusiveThemes: boolean
    hasPrioritySupport: boolean
    hasAIImageEnhancement: boolean
    aiEnhancementsPerMonth: number
  }
}

// Plan features matching dashboard/lib/subscription-utils.ts
const PLAN_FEATURES = {
  free: {
    name: "Free",
    maxProducts: 12,
    hasCustomDomain: false,
    hasIntegratedPayments: false,
    hasTraditionalCheckout: false,
    hasCartRecovery: false,
    hasAutoEmails: false,
    hasGoogleAnalytics: false,
    hasMetaPixel: false,
    hasCompleteReports: false,
    hasUnlimitedProducts: false,
    hasInternationalSales: false,
    hasMultipleLanguages: false,
    hasCustomerSegmentation: false,
    hasAdvancedMarketing: false,
    hasExclusiveThemes: false,
    hasPrioritySupport: false,
    hasAIImageEnhancement: false,
    aiEnhancementsPerMonth: 0
  },
  premium: {
    name: "Premium",
    maxProducts: 50,
    hasCustomDomain: true,
    hasIntegratedPayments: true,
    hasTraditionalCheckout: true,
    hasCartRecovery: true,
    hasAutoEmails: true,
    hasGoogleAnalytics: true,
    hasMetaPixel: true,
    hasCompleteReports: true,
    hasUnlimitedProducts: false,
    hasInternationalSales: false,
    hasMultipleLanguages: false,
    hasCustomerSegmentation: false,
    hasAdvancedMarketing: false,
    hasExclusiveThemes: false,
    hasPrioritySupport: false,
    hasAIImageEnhancement: true,
    aiEnhancementsPerMonth: 5
  },
  pro: {
    name: "Pro",
    maxProducts: -1,
    hasCustomDomain: true,
    hasIntegratedPayments: true,
    hasTraditionalCheckout: true,
    hasCartRecovery: true,
    hasAutoEmails: true,
    hasGoogleAnalytics: true,
    hasMetaPixel: true,
    hasCompleteReports: true,
    hasUnlimitedProducts: true,
    hasInternationalSales: true,
    hasMultipleLanguages: true,
    hasCustomerSegmentation: true,
    hasAdvancedMarketing: true,
    hasExclusiveThemes: true,
    hasPrioritySupport: true,
    hasAIImageEnhancement: true,
    aiEnhancementsPerMonth: 15
  }
} as const

type PlanType = keyof typeof PLAN_FEATURES
type SubscriptionStatus = "trial" | "active" | "cancelled" | "expired" | "free"

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
  const userId = params?.userId as string

  const [user, setUser] = useState<User | null>(null)
  const [stores, setStores] = useState<Store[]>([])
  const [productsCount, setProductsCount] = useState(0)
  const [ordersCount, setOrdersCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editRole, setEditRole] = useState<"user" | "admin" | "superadmin">("user")
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState<PlanType>("free")
  const [selectedStatus, setSelectedStatus] = useState<SubscriptionStatus>("free")
  const [subscriptionDuration, setSubscriptionDuration] = useState<number>(30) // days
  const [updatingSubscription, setUpdatingSubscription] = useState(false)

  const loadUserData = useCallback(async () => {
    try {
      setLoading(true)
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase DB not available")
        return
      }

      // Cargar datos del usuario
      const userDoc = await getDoc(doc(db, "users", userId))
      if (userDoc.exists()) {
        setUser({ uid: userDoc.id, ...userDoc.data() } as User)
        setEditRole((userDoc.data().role || "user") as "user" | "admin" | "superadmin")
      }

      // Cargar tiendas del usuario
      const storesQuery = query(
        collection(db, "stores"),
        where("ownerId", "==", userId)
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
        const productsQuery = query(collection(db, "stores", store.id, "products"))
        const productsSnapshot = await getDocs(productsQuery)
        totalProducts += productsSnapshot.size

        // Contar órdenes
        const ordersQuery = query(collection(db, "stores", store.id, "orders"))
        const ordersSnapshot = await getDocs(ordersQuery)
        totalOrders += ordersSnapshot.size
      }
      setProductsCount(totalProducts)
      setOrdersCount(totalOrders)

    } catch (error) {
      console.error("Error loading user data:", error)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      loadUserData()
    }
  }, [userId, loadUserData])

  const handleToggleStatus = async () => {
    if (!user) return

    try {
      const db = getFirebaseDb()
      if (!db) return

      const newStatus = !user.isActive
      await updateDoc(doc(db, "users", userId), {
        isActive: newStatus,
        updatedAt: Timestamp.now()
      })

      setUser({ ...user, isActive: newStatus })
    } catch (error) {
      console.error("Error updating user status:", error)
      alert("Error updating user status")
    }
  }

  const handleUpdateRole = async () => {
    if (!user) return

    try {
      const db = getFirebaseDb()
      if (!db) return

      await updateDoc(doc(db, "users", userId), {
        role: editRole,
        updatedAt: Timestamp.now()
      })

      setUser({ ...user, role: editRole })
      setShowEditModal(false)
    } catch (error) {
      console.error("Error updating user role:", error)
      alert("Error updating user role")
    }
  }

  const openSubscriptionModal = () => {
    if (user) {
      setSelectedPlan(user.subscriptionPlan || "free")
      setSelectedStatus(user.subscriptionStatus || "free")
      setSubscriptionDuration(30)
    }
    setShowSubscriptionModal(true)
  }

  const handleUpdateSubscription = async () => {
    if (!user) return

    try {
      setUpdatingSubscription(true)
      const db = getFirebaseDb()
      if (!db) return

      const now = Timestamp.now()
      const planFeatures = PLAN_FEATURES[selectedPlan]

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const updateData: any = {
        subscriptionPlan: selectedPlan,
        subscriptionStatus: selectedStatus,
        features: planFeatures,
        updatedAt: now
      }

      // Set dates based on status
      if (selectedStatus === "active") {
        updateData.subscriptionStartDate = now
        if (subscriptionDuration > 0) {
          updateData.subscriptionEndDate = Timestamp.fromMillis(
            now.toMillis() + (subscriptionDuration * 24 * 60 * 60 * 1000)
          )
        } else {
          // Permanent/lifetime subscription
          updateData.subscriptionEndDate = null
        }
        // Clear trial dates
        updateData.trialStartDate = null
        updateData.trialEndDate = null
      } else if (selectedStatus === "trial") {
        updateData.trialStartDate = now
        updateData.trialEndDate = Timestamp.fromMillis(
          now.toMillis() + (subscriptionDuration * 24 * 60 * 60 * 1000)
        )
        // Clear subscription dates
        updateData.subscriptionStartDate = null
        updateData.subscriptionEndDate = null
      } else if (selectedStatus === "free") {
        // Reset to free plan
        updateData.subscriptionPlan = "free"
        updateData.features = PLAN_FEATURES.free
        updateData.trialStartDate = null
        updateData.trialEndDate = null
        updateData.subscriptionStartDate = null
        updateData.subscriptionEndDate = null
      }

      await updateDoc(doc(db, "users", userId), updateData)

      // Update local state
      setUser({
        ...user,
        subscriptionPlan: updateData.subscriptionPlan,
        subscriptionStatus: updateData.subscriptionStatus,
        features: updateData.features,
        trialStartDate: updateData.trialStartDate,
        trialEndDate: updateData.trialEndDate,
        subscriptionStartDate: updateData.subscriptionStartDate,
        subscriptionEndDate: updateData.subscriptionEndDate
      })

      setShowSubscriptionModal(false)
      alert(`Subscription updated successfully to ${PLAN_FEATURES[selectedPlan].name} (${selectedStatus})`)
    } catch (error) {
      console.error("Error updating subscription:", error)
      alert("Error updating subscription")
    } finally {
      setUpdatingSubscription(false)
    }
  }

  const getSubscriptionBadgeColor = (status?: string) => {
    switch (status) {
      case "active":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "trial":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "cancelled":
        return "bg-orange-500/10 text-orange-400 border-orange-500/20"
      case "expired":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const getPlanBadgeColor = (plan?: string) => {
    switch (plan) {
      case "pro":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "premium":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      default:
        return "bg-slate-500/10 text-slate-400 border-slate-500/20"
    }
  }

  const getTrialDaysRemaining = () => {
    if (user?.subscriptionStatus !== "trial" || !user?.trialEndDate) return null
    const now = Date.now()
    const trialEnd = user.trialEndDate.toMillis()
    const diffTime = trialEnd - now
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return daysRemaining > 0 ? daysRemaining : 0
  }

  const getSubscriptionDaysRemaining = () => {
    if (user?.subscriptionStatus !== "active" || !user?.subscriptionEndDate) return null
    const now = Date.now()
    const subEnd = user.subscriptionEndDate.toMillis()
    const diffTime = subEnd - now
    const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return daysRemaining > 0 ? daysRemaining : 0
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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "superadmin":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "admin":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      default:
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
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
                    alt={user.displayName || "User"}
                  />
                ) : (
                  <div className="h-16 w-16 sm:h-24 sm:w-24 rounded-full bg-emerald-500 flex items-center justify-center text-white text-2xl sm:text-3xl font-bold border-4 border-slate-800 flex-shrink-0">
                    {(user.displayName || user.email || "U")[0].toUpperCase()}
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 truncate">
                    {user.displayName || "No name"}
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
                      ? "bg-red-500 hover:bg-red-600 text-white"
                      : "bg-emerald-500 hover:bg-emerald-600 text-white"
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
              <p className="text-white">{user.phoneNumber || "Not provided"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Registered</p>
              <p className="text-white">{user.createdAt ? formatDate(user.createdAt) : "Unknown"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-400 mb-1">Last Updated</p>
              <p className="text-white">{user.updatedAt ? formatDate(user.updatedAt) : "Unknown"}</p>
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

        {/* Subscription Management */}
        <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-white">Subscription</h3>
            </div>
            <button
              onClick={openSubscriptionModal}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Manage Subscription
            </button>
          </div>

          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {/* Current Plan */}
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Current Plan</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${getPlanBadgeColor(user.subscriptionPlan)}`}>
                    {PLAN_FEATURES[user.subscriptionPlan || "free"].name}
                  </span>
                </div>
              </div>

              {/* Status */}
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Status</p>
                <div className="flex items-center gap-2">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border capitalize ${getSubscriptionBadgeColor(user.subscriptionStatus)}`}>
                    {user.subscriptionStatus || "free"}
                  </span>
                </div>
              </div>

              {/* Days Remaining */}
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Days Remaining</p>
                <p className="text-2xl font-bold text-white">
                  {user.subscriptionStatus === "trial"
                    ? (getTrialDaysRemaining() ?? "N/A")
                    : user.subscriptionStatus === "active" && user.subscriptionEndDate
                    ? (getSubscriptionDaysRemaining() ?? "Lifetime")
                    : "N/A"
                  }
                </p>
              </div>

              {/* Max Products */}
              <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                <p className="text-sm text-slate-400 mb-2">Product Limit</p>
                <p className="text-2xl font-bold text-white">
                  {user.features?.maxProducts === -1
                    ? "Unlimited"
                    : user.features?.maxProducts || PLAN_FEATURES.free.maxProducts}
                </p>
              </div>
            </div>

            {/* Features Grid */}
            <div className="border-t border-slate-700 pt-6">
              <p className="text-sm text-slate-400 mb-4">Plan Features</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {[
                  { key: "hasCustomDomain", label: "Custom Domain" },
                  { key: "hasIntegratedPayments", label: "Integrated Payments" },
                  { key: "hasTraditionalCheckout", label: "Traditional Checkout" },
                  { key: "hasCartRecovery", label: "Cart Recovery" },
                  { key: "hasAutoEmails", label: "Auto Emails" },
                  { key: "hasGoogleAnalytics", label: "Google Analytics" },
                  { key: "hasMetaPixel", label: "Meta Pixel" },
                  { key: "hasCompleteReports", label: "Complete Reports" },
                  { key: "hasAIImageEnhancement", label: "AI Image Enhancement" },
                  { key: "hasPrioritySupport", label: "Priority Support" },
                  { key: "hasInternationalSales", label: "International Sales" },
                  { key: "hasMultipleLanguages", label: "Multiple Languages" },
                ].map(({ key, label }) => {
                  const features = user.features || PLAN_FEATURES.free
                  const hasFeature = features[key as keyof typeof features]
                  return (
                    <div
                      key={key}
                      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm ${
                        hasFeature
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-slate-800 text-slate-500"
                      }`}
                    >
                      {hasFeature ? (
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                      <span className="truncate">{label}</span>
                    </div>
                  )
                })}
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
                      <p className="text-slate-400 text-sm">{store.subdomain}.shopifree.app</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <a
                      href={`https://${store.subdomain}.shopifree.app`}
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
                  onChange={(e) => setEditRole(e.target.value as "user" | "admin" | "superadmin")}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>

              <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <p className="text-xs text-yellow-400">
                  ⚠️ Changing a user&apos;s role will affect their permissions and access to the platform.
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

      {/* Subscription Management Modal */}
      {showSubscriptionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-lg max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-amber-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Manage Subscription</h3>
                <p className="text-sm text-slate-400">Update plan and status for {user?.displayName || user?.email}</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Plan Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Select Plan
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {(["free", "premium", "pro"] as const).map((plan) => (
                    <button
                      key={plan}
                      onClick={() => setSelectedPlan(plan)}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        selectedPlan === plan
                          ? "border-amber-500 bg-amber-500/10"
                          : "border-slate-600 bg-slate-900 hover:border-slate-500"
                      }`}
                    >
                      <p className={`font-bold text-lg ${
                        selectedPlan === plan ? "text-amber-400" : "text-white"
                      }`}>
                        {PLAN_FEATURES[plan].name}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">
                        {PLAN_FEATURES[plan].maxProducts === -1
                          ? "Unlimited products"
                          : `${PLAN_FEATURES[plan].maxProducts} products`}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Status Selection */}
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Subscription Status
                </label>
                <select
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value as SubscriptionStatus)}
                  className="w-full px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="free">Free (No subscription)</option>
                  <option value="trial">Trial (Limited time)</option>
                  <option value="active">Active (Paid subscription)</option>
                  <option value="cancelled">Cancelled</option>
                  <option value="expired">Expired</option>
                </select>
              </div>

              {/* Duration (only for trial and active) */}
              {(selectedStatus === "trial" || selectedStatus === "active") && (
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">
                    Duration (days)
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="number"
                      value={subscriptionDuration}
                      onChange={(e) => setSubscriptionDuration(parseInt(e.target.value) || 0)}
                      min="0"
                      className="flex-1 px-4 py-3 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="30"
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={() => setSubscriptionDuration(30)}
                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                      >
                        30d
                      </button>
                      <button
                        onClick={() => setSubscriptionDuration(90)}
                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                      >
                        90d
                      </button>
                      <button
                        onClick={() => setSubscriptionDuration(365)}
                        className="px-3 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-sm"
                      >
                        1y
                      </button>
                      {selectedStatus === "active" && (
                        <button
                          onClick={() => setSubscriptionDuration(0)}
                          className="px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm"
                          title="Lifetime subscription (no expiration)"
                        >
                          Lifetime
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">
                    {subscriptionDuration === 0
                      ? "Lifetime subscription - no expiration date"
                      : `Subscription will expire in ${subscriptionDuration} days from now`}
                  </p>
                </div>
              )}

              {/* Plan Features Preview */}
              <div className="p-4 bg-slate-900 border border-slate-700 rounded-lg">
                <p className="text-sm font-medium text-slate-300 mb-3">
                  {PLAN_FEATURES[selectedPlan].name} Plan Features:
                </p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-400">
                    <span className="text-emerald-400">✓</span>
                    {PLAN_FEATURES[selectedPlan].maxProducts === -1
                      ? "Unlimited products"
                      : `${PLAN_FEATURES[selectedPlan].maxProducts} products`}
                  </div>
                  {PLAN_FEATURES[selectedPlan].hasCustomDomain && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-emerald-400">✓</span>
                      Custom domain
                    </div>
                  )}
                  {PLAN_FEATURES[selectedPlan].hasIntegratedPayments && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-emerald-400">✓</span>
                      Integrated payments
                    </div>
                  )}
                  {PLAN_FEATURES[selectedPlan].hasAIImageEnhancement && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-emerald-400">✓</span>
                      AI Enhancement ({PLAN_FEATURES[selectedPlan].aiEnhancementsPerMonth}/mo)
                    </div>
                  )}
                  {PLAN_FEATURES[selectedPlan].hasPrioritySupport && (
                    <div className="flex items-center gap-2 text-slate-400">
                      <span className="text-emerald-400">✓</span>
                      Priority support
                    </div>
                  )}
                </div>
              </div>

              {/* Warning */}
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                <p className="text-xs text-amber-400">
                  ⚠️ This will immediately update the user&apos;s subscription. They will have access to the new plan features right away.
                </p>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowSubscriptionModal(false)}
                disabled={updatingSubscription}
                className="flex-1 px-4 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateSubscription}
                disabled={updatingSubscription}
                className="flex-1 px-4 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {updatingSubscription ? (
                  <>
                    <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </>
                ) : (
                  "Update Subscription"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  )
}
