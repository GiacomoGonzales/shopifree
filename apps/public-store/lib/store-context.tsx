'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { StoreData } from './store'

interface StoreContextType {
  store: StoreData | null
  loading: boolean
  error: string | null
  setStore: (store: StoreData | null) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export const useStore = () => {
  const context = useContext(StoreContext)
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider')
  }
  return context
}

interface StoreProviderProps {
  children: React.ReactNode
  initialStore?: StoreData | null
}

export const StoreProvider: React.FC<StoreProviderProps> = ({ 
  children, 
  initialStore = null 
}) => {
  const [store, setStore] = useState<StoreData | null>(initialStore)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

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