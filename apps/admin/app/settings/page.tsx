"use client"

import { useState, useEffect } from "react"
import { collection, getDocs, doc, updateDoc, addDoc, deleteDoc } from "firebase/firestore"
import { getFirebaseDb } from "../../lib/firebase"
import AdminLayout from "../../components/layout/AdminLayout"

interface PlatformConfig {
  id: string
  siteName: string
  supportEmail: string
  defaultCurrency: string
  commissionRate: number
  autoApproveStores: boolean
  maintenanceMode: boolean
  allowNewStores: boolean
}

interface AdminUser {
  id: string
  email: string
  name: string
  role: "super_admin" | "admin" | "moderator"
  createdAt: any
  lastLogin?: any
}

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"general" | "admins" | "notifications">("general")
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Platform Configuration
  const [config, setConfig] = useState<PlatformConfig>({
    id: "",
    siteName: "Shopifree",
    supportEmail: "support@shopifree.com",
    defaultCurrency: "USD",
    commissionRate: 5,
    autoApproveStores: false,
    maintenanceMode: false,
    allowNewStores: true
  })

  // Admin Users
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [showAddAdmin, setShowAddAdmin] = useState(false)
  const [newAdmin, setNewAdmin] = useState({
    email: "",
    name: "",
    role: "admin" as "super_admin" | "admin" | "moderator"
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      setLoading(true)

      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase not initialized")
        return
      }

      // Load platform configuration
      const configSnapshot = await getDocs(collection(db, "platformConfig"))
      if (!configSnapshot.empty) {
        const configDoc = configSnapshot.docs[0]
        setConfig({
          id: configDoc.id,
          ...configDoc.data() as Omit<PlatformConfig, "id">
        })
      }

      // Load admin users
      const adminsSnapshot = await getDocs(collection(db, "adminUsers"))
      const adminsData = adminsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as AdminUser[]
      setAdmins(adminsData)

    } catch (error) {
      console.error("Error loading settings:", error)
      alert("Error al cargar configuración")
    } finally {
      setLoading(false)
    }
  }

  const saveGeneralSettings = async () => {
    try {
      setSaving(true)

      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase not initialized")
        return
      }

      if (config.id) {
        await updateDoc(doc(db, "platformConfig", config.id), {
          siteName: config.siteName,
          supportEmail: config.supportEmail,
          defaultCurrency: config.defaultCurrency,
          commissionRate: config.commissionRate,
          autoApproveStores: config.autoApproveStores,
          maintenanceMode: config.maintenanceMode,
          allowNewStores: config.allowNewStores,
          updatedAt: new Date()
        })
      } else {
        const docRef = await addDoc(collection(db, "platformConfig"), {
          ...config,
          createdAt: new Date(),
          updatedAt: new Date()
        })
        setConfig({ ...config, id: docRef.id })
      }

      alert("Configuración guardada exitosamente")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error al guardar configuración")
    } finally {
      setSaving(false)
    }
  }

  const addAdmin = async () => {
    if (!newAdmin.email || !newAdmin.name) {
      alert("Por favor completa todos los campos")
      return
    }

    try {
      setSaving(true)

      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase not initialized")
        return
      }

      const docRef = await addDoc(collection(db, "adminUsers"), {
        email: newAdmin.email,
        name: newAdmin.name,
        role: newAdmin.role,
        createdAt: new Date()
      })

      setAdmins([...admins, {
        id: docRef.id,
        ...newAdmin,
        createdAt: new Date()
      }])

      setNewAdmin({ email: "", name: "", role: "admin" })
      setShowAddAdmin(false)
      alert("Administrador agregado exitosamente")
    } catch (error) {
      console.error("Error adding admin:", error)
      alert("Error al agregar administrador")
    } finally {
      setSaving(false)
    }
  }

  const deleteAdmin = async (adminId: string) => {
    if (!confirm("¿Estás seguro de eliminar este administrador?")) return

    try {
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase not initialized")
        return
      }

      await deleteDoc(doc(db, "adminUsers", adminId))
      setAdmins(admins.filter(a => a.id !== adminId))
      alert("Administrador eliminado")
    } catch (error) {
      console.error("Error deleting admin:", error)
      alert("Error al eliminar administrador")
    }
  }

  const updateAdminRole = async (adminId: string, newRole: "super_admin" | "admin" | "moderator") => {
    try {
      const db = getFirebaseDb()
      if (!db) {
        console.error("Firebase not initialized")
        return
      }

      await updateDoc(doc(db, "adminUsers", adminId), { role: newRole })
      setAdmins(admins.map(a => a.id === adminId ? { ...a, role: newRole } : a))
      alert("Rol actualizado")
    } catch (error) {
      console.error("Error updating role:", error)
      alert("Error al actualizar rol")
    }
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "super_admin":
        return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "admin":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "moderator":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      default:
        return "bg-slate-600/10 text-slate-400 border-slate-600/20"
    }
  }

  const formatDate = (timestamp: any) => {
    if (!timestamp) return "−"

    try {
      if (timestamp && typeof timestamp.toDate === 'function') {
        return timestamp.toDate().toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      }
      if (timestamp && timestamp.seconds) {
        const date = new Date(timestamp.seconds * 1000)
        return date.toLocaleDateString("es-ES", {
          year: "numeric",
          month: "short",
          day: "numeric"
        })
      }
      return "−"
    } catch (error) {
      return "−"
    }
  }

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-screen">
          <div className="text-slate-400">Cargando configuración...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
        <p className="text-slate-400">Administra la configuración de la plataforma</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-slate-700">
        <button
          onClick={() => setActiveTab("general")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "general"
              ? "text-emerald-500 border-b-2 border-emerald-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          General
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "admins"
              ? "text-emerald-500 border-b-2 border-emerald-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Administradores
        </button>
        <button
          onClick={() => setActiveTab("notifications")}
          className={`px-4 py-2 font-medium transition-colors ${
            activeTab === "notifications"
              ? "text-emerald-500 border-b-2 border-emerald-500"
              : "text-slate-400 hover:text-white"
          }`}
        >
          Notificaciones
        </button>
      </div>

      {/* General Settings */}
      {activeTab === "general" && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Configuración General</h2>

          <div className="space-y-6">
            {/* Site Name */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre de la Plataforma
              </label>
              <input
                type="text"
                value={config.siteName}
                onChange={(e) => setConfig({ ...config, siteName: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Support Email */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email de Soporte
              </label>
              <input
                type="email"
                value={config.supportEmail}
                onChange={(e) => setConfig({ ...config, supportEmail: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Default Currency */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Moneda por Defecto
              </label>
              <select
                value={config.defaultCurrency}
                onChange={(e) => setConfig({ ...config, defaultCurrency: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="USD">USD - Dólar Estadounidense</option>
                <option value="EUR">EUR - Euro</option>
                <option value="GBP">GBP - Libra Esterlina</option>
                <option value="MXN">MXN - Peso Mexicano</option>
                <option value="ARS">ARS - Peso Argentino</option>
                <option value="COP">COP - Peso Colombiano</option>
                <option value="CLP">CLP - Peso Chileno</option>
              </select>
            </div>

            {/* Commission Rate */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Tasa de Comisión (%)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={config.commissionRate}
                onChange={(e) => setConfig({ ...config, commissionRate: parseFloat(e.target.value) })}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
              <p className="text-xs text-slate-500 mt-1">
                Comisión aplicada a cada venta en la plataforma
              </p>
            </div>

            {/* Toggles */}
            <div className="space-y-4 pt-4 border-t border-slate-700">
              {/* Auto Approve Stores */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Aprobar Tiendas Automáticamente</p>
                  <p className="text-xs text-slate-500">Las nuevas tiendas se activan sin revisión manual</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, autoApproveStores: !config.autoApproveStores })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.autoApproveStores ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.autoApproveStores ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Allow New Stores */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Permitir Nuevas Tiendas</p>
                  <p className="text-xs text-slate-500">Los usuarios pueden crear nuevas tiendas</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, allowNewStores: !config.allowNewStores })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.allowNewStores ? "bg-emerald-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.allowNewStores ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>

              {/* Maintenance Mode */}
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-300">Modo Mantenimiento</p>
                  <p className="text-xs text-slate-500">Desactiva todas las tiendas temporalmente</p>
                </div>
                <button
                  onClick={() => setConfig({ ...config, maintenanceMode: !config.maintenanceMode })}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    config.maintenanceMode ? "bg-red-500" : "bg-slate-700"
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      config.maintenanceMode ? "translate-x-6" : "translate-x-1"
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* Save Button */}
            <div className="pt-6">
              <button
                onClick={saveGeneralSettings}
                disabled={saving}
                className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Users */}
      {activeTab === "admins" && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-white">Administradores</h2>
            <button
              onClick={() => setShowAddAdmin(!showAddAdmin)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + Agregar Administrador
            </button>
          </div>

          {/* Add Admin Form */}
          {showAddAdmin && (
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 mb-6">
              <h3 className="text-white font-medium mb-4">Nuevo Administrador</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                  <input
                    type="email"
                    value={newAdmin.email}
                    onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="admin@shopifree.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Nombre</label>
                  <input
                    type="text"
                    value={newAdmin.name}
                    onChange={(e) => setNewAdmin({ ...newAdmin, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    placeholder="Juan Pérez"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Rol</label>
                  <select
                    value={newAdmin.role}
                    onChange={(e) => setNewAdmin({ ...newAdmin, role: e.target.value as any })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="moderator">Moderador</option>
                    <option value="admin">Admin</option>
                    <option value="super_admin">Super Admin</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={addAdmin}
                    disabled={saving}
                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50"
                  >
                    {saving ? "Agregando..." : "Agregar"}
                  </button>
                  <button
                    onClick={() => setShowAddAdmin(false)}
                    className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-medium transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Admins List */}
          <div className="space-y-3">
            {admins.length === 0 ? (
              <p className="text-slate-400 text-center py-8">No hay administradores configurados</p>
            ) : (
              admins.map((admin) => (
                <div
                  key={admin.id}
                  className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-white font-medium">{admin.name}</h3>
                      <span className={`text-xs px-2 py-1 rounded-full border ${getRoleBadgeColor(admin.role)}`}>
                        {admin.role.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">{admin.email}</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Creado: {formatDate(admin.createdAt)}
                      {admin.lastLogin && ` • Último acceso: ${formatDate(admin.lastLogin)}`}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={admin.role}
                      onChange={(e) => updateAdminRole(admin.id, e.target.value as any)}
                      className="bg-slate-800 border border-slate-700 rounded px-3 py-1 text-sm text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="moderator">Moderador</option>
                      <option value="admin">Admin</option>
                      <option value="super_admin">Super Admin</option>
                    </select>
                    <button
                      onClick={() => deleteAdmin(admin.id)}
                      className="text-red-400 hover:text-red-300 p-2 transition-colors"
                      title="Eliminar"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Notifications */}
      {activeTab === "notifications" && (
        <div className="bg-slate-800 rounded-lg border border-slate-700 p-6">
          <h2 className="text-xl font-semibold text-white mb-6">Configuración de Notificaciones</h2>

          <div className="space-y-6">
            <p className="text-slate-400">Próximamente: Configuración de notificaciones por email, SMS y push notifications.</p>

            <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Funcionalidades Planificadas</h3>
              <ul className="text-sm text-slate-400 space-y-2">
                <li>• Notificaciones de nuevas órdenes</li>
                <li>• Alertas de nuevas tiendas</li>
                <li>• Reportes diarios/semanales/mensuales</li>
                <li>• Notificaciones de productos agotados</li>
                <li>• Alertas de actividad sospechosa</li>
              </ul>
            </div>
          </div>
        </div>
      )}
      </div>
    </AdminLayout>
  )
}
