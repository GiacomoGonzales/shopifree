'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import DashboardLayout from '../../../../../components/DashboardLayout'
import { useAuth } from '../../../../../lib/simple-auth-context'
import { getUserStore } from '../../../../../lib/store'
import {
  getLoyaltyProgram,
  saveLoyaltyProgram,
  toggleLoyaltyProgram,
  getAllCustomersWithPoints,
  type LoyaltyProgram,
  type CustomerPoints,
  calculatePointsValue
} from '../../../../../lib/loyalty'

export default function LoyaltyProgramPage() {
  const t = useTranslations('marketing')
  const router = useRouter()
  const { user } = useAuth()

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [storeId, setStoreId] = useState<string | null>(null)
  const [program, setProgram] = useState<LoyaltyProgram | null>(null)
  const [customers, setCustomers] = useState<CustomerPoints[]>([])

  // Form state
  const [active, setActive] = useState(false)
  const [pointsPerCurrency, setPointsPerCurrency] = useState(1)
  const [minPurchaseAmount, setMinPurchaseAmount] = useState(0)
  const [pointsValue, setPointsValue] = useState(0.1)
  const [minPointsToRedeem, setMinPointsToRedeem] = useState(100)
  const [sendEmailOnEarn, setSendEmailOnEarn] = useState(true)
  const [sendEmailOnRedeem, setSendEmailOnRedeem] = useState(true)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    if (!user?.uid) return

    try {
      const store = await getUserStore(user.uid)
      if (store) {
        setStoreId(store.id)

        // Cargar programa existente
        const existingProgram = await getLoyaltyProgram(store.id)
        if (existingProgram) {
          setProgram(existingProgram)
          setActive(existingProgram.active)
          setPointsPerCurrency(existingProgram.pointsPerCurrency)
          setMinPurchaseAmount(existingProgram.minPurchaseAmount)
          setPointsValue(existingProgram.pointsValue)
          setMinPointsToRedeem(existingProgram.minPointsToRedeem)
          setSendEmailOnEarn(existingProgram.sendEmailOnEarn)
          setSendEmailOnRedeem(existingProgram.sendEmailOnRedeem)
        }

        // Cargar clientes con puntos
        const customersData = await getAllCustomersWithPoints(store.id)
        setCustomers(customersData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!storeId) return

    setSaving(true)
    try {
      const programData = {
        pointsPerCurrency,
        minPurchaseAmount,
        pointsValue,
        minPointsToRedeem,
        sendEmailOnEarn,
        sendEmailOnRedeem
      }

      const success = await saveLoyaltyProgram(storeId, programData, active)
      if (success) {
        alert('Programa de lealtad guardado exitosamente')
        await loadData() // Recargar datos
      } else {
        alert('Error al guardar el programa de lealtad')
      }
    } catch (error) {
      console.error('Error saving program:', error)
      alert('Error al guardar el programa de lealtad')
    } finally {
      setSaving(false)
    }
  }

  const handleToggle = async () => {
    if (!storeId || !program) {
      // Si no hay programa, hay que crearlo primero
      alert('Por favor configura el programa antes de activarlo')
      return
    }

    const newActive = !active
    const success = await toggleLoyaltyProgram(storeId, newActive)
    if (success) {
      setActive(newActive)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-gray-500">Cargando...</div>
        </div>
      </DashboardLayout>
    )
  }

  // Calcular ejemplo de valor
  const examplePoints = 100
  const exampleValue = examplePoints * pointsValue

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex items-center mb-2">
              <Link href="/marketing" className="text-sm text-gray-500 hover:text-gray-700 mr-2">
                Marketing
              </Link>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <Link href="/marketing/maintain" className="text-sm text-gray-500 hover:text-gray-700 mx-2">
                Mantener Clientes
              </Link>
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
              <span className="text-sm text-gray-700 ml-2">Programa de Lealtad</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-light text-gray-900">Programa de Lealtad</h1>
                <p className="mt-1 text-sm text-gray-600">Recompensa a tus clientes con puntos canjeables</p>
              </div>
              <div className="flex items-center gap-3">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                  {active ? '✓ Activo' : 'Inactivo'}
                </span>
                <button
                  onClick={handleToggle}
                  disabled={!program}
                  className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                    !program
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      : active
                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        : 'bg-gray-900 text-white hover:bg-gray-800'
                  }`}
                  title={!program ? 'Configura el programa antes de activarlo' : ''}
                >
                  {active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-6 lg:px-8 pb-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Configuración */}
              <div className="lg:col-span-2 space-y-6">
                {/* Cómo ganar puntos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Cómo ganar puntos</h2>
                    <p className="mt-1 text-sm text-gray-500">Configura cuántos puntos ganan los clientes por sus compras</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puntos por cada $ gastado
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        value={pointsPerCurrency}
                        onChange={(e) => setPointsPerCurrency(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-base"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Ejemplo: Si es 1, el cliente gana 1 punto por cada $1 que gaste
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Compra mínima para ganar puntos ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={minPurchaseAmount}
                        onChange={(e) => setMinPurchaseAmount(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-base"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Las compras menores a este monto no generarán puntos
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                      <p className="text-sm text-gray-600">
                        Un cliente que compre $100 ganará <span className="font-semibold text-gray-900">{Math.floor(100 * pointsPerCurrency)} puntos</span>
                        {minPurchaseAmount > 0 && <span> (si la compra es mayor a ${minPurchaseAmount})</span>}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Cómo canjear puntos */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Cómo canjear puntos</h2>
                    <p className="mt-1 text-sm text-gray-500">Define el valor de los puntos acumulados</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Valor de cada punto ($)
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={pointsValue}
                        onChange={(e) => setPointsValue(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-base"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        Ejemplo: Si es 0.1, entonces 100 puntos = $10 de descuento
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Puntos mínimos para canjear
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={minPointsToRedeem}
                        onChange={(e) => setMinPointsToRedeem(Number(e.target.value))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-300 text-base"
                      />
                      <p className="mt-1 text-xs text-gray-500">
                        El cliente debe acumular al menos esta cantidad para poder canjear
                      </p>
                    </div>

                    {/* Preview */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <p className="text-sm font-medium text-gray-700 mb-2">Vista previa:</p>
                      <p className="text-sm text-gray-600">
                        {minPointsToRedeem} puntos = <span className="font-semibold text-gray-900">${(minPointsToRedeem * pointsValue).toFixed(2)} de descuento</span>
                      </p>
                      <p className="text-sm text-gray-600 mt-1">
                        {examplePoints} puntos = <span className="font-semibold text-gray-900">${exampleValue.toFixed(2)} de descuento</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Notificaciones por email */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Notificaciones por email</h2>
                    <p className="mt-1 text-sm text-gray-500">Mantén informados a tus clientes sobre sus puntos</p>
                  </div>
                  <div className="p-6 space-y-4">
                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendEmailOnEarn}
                        onChange={(e) => setSendEmailOnEarn(e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Notificar cuando ganan puntos</p>
                        <p className="text-xs text-gray-500">Enviar email cada vez que un cliente gane puntos por una compra</p>
                      </div>
                    </label>

                    <label className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={sendEmailOnRedeem}
                        onChange={(e) => setSendEmailOnRedeem(e.target.checked)}
                        className="mt-1"
                      />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Notificar cuando canjean puntos</p>
                        <p className="text-xs text-gray-500">Enviar email de confirmación cuando canjean puntos por descuentos</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Botón guardar */}
                <div className="flex justify-end">
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-6 py-2.5 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                  >
                    {saving ? 'Guardando...' : 'Guardar configuración'}
                  </button>
                </div>
              </div>

              {/* Sidebar - Clientes con puntos */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 sticky top-6">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-medium text-gray-900">Clientes con puntos</h2>
                    <p className="mt-1 text-sm text-gray-500">Top clientes por puntos acumulados</p>
                  </div>
                  <div className="p-6">
                    {customers.length === 0 ? (
                      <div className="text-center py-8">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">Aún no hay clientes con puntos</p>
                        <p className="mt-1 text-xs text-gray-400">Los puntos se acumulan automáticamente con las compras</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {customers.slice(0, 10).map((customer) => (
                          <div key={customer.id} className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {customer.customerName || customer.customerEmail}
                              </p>
                              <p className="text-xs text-gray-500 truncate">{customer.customerEmail}</p>
                            </div>
                            <div className="ml-3 text-right">
                              <p className="text-sm font-semibold text-gray-900">{customer.currentPoints} pts</p>
                              {program && (
                                <p className="text-xs text-gray-500">
                                  ${calculatePointsValue(customer.currentPoints, program).toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        ))}
                        {customers.length > 10 && (
                          <p className="text-xs text-gray-500 text-center pt-2 border-t border-gray-200">
                            Y {customers.length - 10} clientes más...
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
