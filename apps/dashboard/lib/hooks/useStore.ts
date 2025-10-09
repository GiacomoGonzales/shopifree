import { useState, useEffect } from 'react'
import { useAuth } from '../simple-auth-context'
import { getUserStore, StoreWithId } from '../store'

// Mapeo de códigos de moneda a símbolos
const currencySymbols: Record<string, string> = {
  'USD': '$',
  'EUR': '€',
  'MXN': '$',
  'COP': '$',
  'ARS': '$',
  'CLP': '$',
  'PEN': 'S/',
  'BRL': 'R$',
  'UYU': '$',
  'PYG': '₲',
  'BOB': 'Bs',
  'VES': 'Bs',
  'GTQ': 'Q',
  'CRC': '₡',
  'NIO': 'C$',
  'PAB': 'B/.',
  'DOP': 'RD$',
  'HNL': 'L',
  'SVC': '$',
  'GBP': '£',
  'CAD': 'C$',
  'CHF': 'CHF',
  'JPY': '¥',
  'CNY': '¥',
  'AUD': 'A$'
}

// Mapeo de códigos de moneda a nombres amigables
const currencyNames: Record<string, string> = {
  'USD': 'Dólares',
  'EUR': 'Euros',
  'MXN': 'Pesos Mexicanos',
  'COP': 'Pesos Colombianos',
  'ARS': 'Pesos Argentinos',
  'CLP': 'Pesos Chilenos',
  'PEN': 'Nuevo Sol',
  'BRL': 'Reales',
  'UYU': 'Pesos Uruguayos',
  'PYG': 'Guaraníes',
  'BOB': 'Bolivianos',
  'VES': 'Bolívares',
  'GTQ': 'Quetzales',
  'CRC': 'Colones',
  'NIO': 'Córdobas',
  'PAB': 'Balboas',
  'DOP': 'Pesos Dominicanos',
  'HNL': 'Lempiras',
  'SVC': 'Colones',
  'GBP': 'Libras',
  'CAD': 'Dólares Canadienses',
  'CHF': 'Francos Suizos',
  'JPY': 'Yenes',
  'CNY': 'Yuanes',
  'AUD': 'Dólares Australianos'
}

export interface UseStoreReturn {
  store: StoreWithId | null
  loading: boolean
  error: string | null
  currency: string
  currencySymbol: string
  currencyName: string
  formatPrice: (amount: number | string) => string
  mutate: (newStore: StoreWithId) => void
}

export const useStore = (): UseStoreReturn => {
  const { user } = useAuth()
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) {
        setLoading(false)
        return
      }

      try {
        setLoading(true)
        setError(null)
        const userStore = await getUserStore(user.uid)

        // 🚫 Verificar si la tienda está marcada como eliminada
        if (userStore && (userStore as any).deleted === true) {
          console.warn('🚫 Store is marked for deletion')
          setStore(null)
          setError('Tu tienda ha sido marcada para eliminación. Tienes 30 días para recuperarla.')
        } else {
          setStore(userStore)
        }
      } catch (err) {
        console.error('Error loading store:', err)
        setError('Error al cargar la configuración de la tienda')
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [user?.uid])

  // Obtener la moneda configurada (por defecto USD)
  const currency = store?.currency || 'USD'
  const currencySymbol = currencySymbols[currency] || '$'
  const currencyName = currencyNames[currency] || 'Dólares'

  // Función para formatear precios
  const formatPrice = (amount: number | string): string => {
    const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numericAmount)) return `${currencySymbol} 0.00`
    
    return `${currencySymbol} ${numericAmount.toFixed(2)}`
  }

  // Función para actualizar el estado de la tienda
  const mutate = (newStore: StoreWithId) => {
    setStore(newStore)
  }

  return {
    store,
    loading,
    error,
    currency,
    currencySymbol,
    currencyName,
    formatPrice,
    mutate
  }
} 