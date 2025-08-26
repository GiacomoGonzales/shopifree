'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../../../../lib/simple-auth-context'
import { getUserStore, updateStore, StoreWithId } from '../../../../lib/store'
import DashboardLayout from '../../../../components/DashboardLayout'
import SEOConfiguration from '../../../../components/settings/SEOConfiguration'

export default function SEOPage() {
  const { user } = useAuth()
  const [store, setStore] = useState<StoreWithId | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  // Cargar datos de la tienda
  useEffect(() => {
    const loadStore = async () => {
      if (!user?.uid) return
      
      try {
        const userStore = await getUserStore(user.uid)
        setStore(userStore)
      } catch (error) {
        console.error('Error loading store:', error)
      } finally {
        setLoading(false)
      }
    }

    loadStore()
  }, [user?.uid])

  // Función para actualizar la tienda
  const handleUpdateStore = async (data: Partial<StoreWithId>) => {
    if (!store?.id) return false
    
    setSaving(true)
    try {
      // Preservar datos existentes de advanced al igual que en SalesSection
      const updateData = {
        ...data,
        advanced: data.advanced ? {
          ...store?.advanced, // Preservar todos los datos existentes de advanced
          ...data.advanced    // Solo sobrescribir los datos específicos que se están actualizando
        } : store?.advanced
      }
      
      await updateStore(store.id, updateData)
      setStore(prev => prev ? { ...prev, ...updateData } : null)
      return true
    } catch (error) {
      console.error('Error updating store:', error)
      return false
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3 mb-8"></div>
              
              {/* Skeleton para el header con score */}
              <div className="bg-white shadow rounded-lg p-6 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="text-right">
                    <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2"></div>
                </div>
              </div>

              {/* Skeleton para tabs */}
              <div className="mb-6">
                <div className="flex space-x-8 border-b border-gray-200">
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 bg-gray-200 rounded w-28"></div>
                </div>
              </div>

              {/* Skeleton para contenido */}
              <div className="bg-white shadow rounded-lg p-6">
                <div className="space-y-6">
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-28 mb-2"></div>
                    <div className="h-10 bg-gray-200 rounded"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!store) {
    return (
      <DashboardLayout>
        <div className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Error al cargar la información
                  </h3>
                  <p className="text-sm text-red-700 mt-1">
                    No se pudo cargar la información de tu tienda. Por favor, intenta recargar la página.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SEOConfiguration
            store={store}
            onUpdate={handleUpdateStore}
            saving={saving}
          />
        </div>
      </div>
    </DashboardLayout>
  )
} 