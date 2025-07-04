'use client'

import * as React from 'react'
import { StoreDataClient } from './store'

interface StoreContextType {
  store: StoreDataClient | null
  loading: boolean
  error: string | null
  setStore: (store: StoreDataClient | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const StoreContext = React.createContext<StoreContextType | undefined>(undefined)

export const useStore = () => {
  const context = React.useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

interface StoreProviderProps {
  children: React.ReactNode
  initialStore?: StoreDataClient | null
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ 
  children, 
  initialStore = null 
}) => {
  const [store, setStore] = React.useState<StoreDataClient | null>(initialStore)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const value: StoreContextType = {
    store,
    loading,
    error,
    setStore,
    setLoading,
    setError
  }

  return (
    <StoreContext.Provider value={value}>
      {children}
    </StoreContext.Provider>
  )
} 