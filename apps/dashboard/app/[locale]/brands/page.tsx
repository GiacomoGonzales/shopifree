'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../components/DashboardLayout'
import BrandModal from '../../../components/brands/BrandModal'
import BrandsList from '../../../components/brands/BrandsList'
import { BrandWithId, getBrands, createBrand, updateBrand, deleteBrand, updateBrandsOrder } from '../../../lib/brands'
import { deleteImageFromCloudinary } from '../../../lib/cloudinary'
import { useAuth } from '../../../lib/simple-auth-context'
import { getUserStore } from '../../../lib/store'

// Toast notification component
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, 5000)
    return () => clearTimeout(timer)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg border ${
      type === 'success' 
        ? 'bg-gray-50 text-gray-800 border-gray-200' 
        : 'bg-red-50 text-red-800 border-red-200'
    }`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          {type === 'success' ? (
            <svg className="w-5 h-5 text-gray-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          )}
          <span>{message}</span>
        </div>
        <button 
          onClick={onClose}
          className={`ml-4 ${type === 'success' ? 'text-gray-400 hover:text-gray-600' : 'text-red-400 hover:text-red-600'}`}
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function BrandsPage() {
  const t = useTranslations('pages.brands')
  const { user } = useAuth()
  
  const [brands, setBrands] = useState<BrandWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedBrand, setSelectedBrand] = useState<BrandWithId | null>(null)
  const [storeId, setStoreId] = useState<string>('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type })
  }

  const closeToast = () => {
    setToast(null)
  }

  // Cargar datos iniciales
  useEffect(() => {
    const loadData = async () => {
      if (!user) return

      try {
        setLoading(true)
        
        // Obtener la tienda del usuario
        const store = await getUserStore(user.uid)
        if (!store) {
          console.warn('No se encontró la tienda del usuario')
          return
        }
        
        setStoreId(store.id)
        
        // Cargar marcas
        console.log('Cargando marcas iniciales para store:', store.id)
        const allBrands = await getBrands(store.id)
        
        console.log('Marcas iniciales cargadas:', allBrands)
        setBrands(allBrands)
      } catch (error) {
        console.error('Error loading data:', error)
        showToast(t('messages.error'), 'error')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, t])

  const handleAddBrand = () => {
    setSelectedBrand(null)
    setIsModalOpen(true)
  }

  const handleEditBrand = (brand: BrandWithId) => {
    setSelectedBrand(brand)
    setIsModalOpen(true)
  }

  const handleSaveBrand = async (brandData: { name: string; description: string; image: string }) => {
    try {
      if (selectedBrand) {
        // Actualizar marca existente
        await updateBrand(storeId, selectedBrand.id, brandData)
        showToast(t('messages.updated'), 'success')
      } else {
        // Crear nueva marca
        await createBrand(storeId, brandData)
        showToast(t('messages.created'), 'success')
      }

      // Esperar un momento para asegurar que Firestore se haya actualizado
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Recargar datos
      console.log('Recargando datos después de guardar marca...')
      const allBrands = await getBrands(storeId)
      
      console.log('Todas las marcas cargadas:', allBrands)
      setBrands(allBrands)
    } catch (error) {
      console.error('Error saving brand:', error)
      const errorMessage = error instanceof Error ? error.message : t('messages.error')
      showToast(errorMessage, 'error')
      throw error // Re-lanzar para que el modal pueda manejar el error
    }
  }

  const handleDeleteBrand = async (brandId: string) => {
    try {
      // Buscar la marca a eliminar
      const brandToDelete = brands.find(brand => brand.id === brandId)
      
      await deleteBrand(storeId, brandId)
      
      // Si la marca tenía imagen, intentar eliminarla de Cloudinary
      if (brandToDelete?.image && brandToDelete.image.includes('cloudinary')) {
        try {
          const urlParts = brandToDelete.image.split('/')
          const lastPart = urlParts[urlParts.length - 1]
          const publicId = lastPart.split('.')[0]
          await deleteImageFromCloudinary(`brands/${publicId}`)
        } catch (deleteError) {
          console.warn('Error deleting image from Cloudinary:', deleteError)
          // No bloquear el proceso si no se puede eliminar la imagen
        }
      }
      
      showToast(t('messages.deleted'), 'success')

      // Recargar datos
      const allBrands = await getBrands(storeId)
      setBrands(allBrands)
    } catch (error) {
      console.error('Error deleting brand:', error)
      const errorMessage = error instanceof Error ? error.message : t('messages.error')
      showToast(errorMessage, 'error')
    }
  }

  const handleReorderBrands = (reorderedBrands: { id: string; order: number }[]) => {
    // Guardar el estado actual para poder revertir en caso de error
    const previousBrands = [...brands]
    
    // **ACTUALIZACIÓN OPTIMISTA** - Actualizar UI inmediatamente
    const updatedBrands = brands.map(brand => {
      const reorderData = reorderedBrands.find(item => item.id === brand.id)
      if (reorderData) {
        return { ...brand, order: reorderData.order }
      }
      return brand
    })
    
    // Ordenar las marcas actualizadas
    updatedBrands.sort((a, b) => (a.order || 0) - (b.order || 0))
    
    // Actualizar el estado inmediatamente para una UX fluida
    setBrands(updatedBrands)
    
    // Ejecutar la actualización en Firebase en segundo plano sin bloquear la UI
    const updateInBackground = async () => {
      try {
        await updateBrandsOrder(storeId, reorderedBrands)
        
        // Si todo sale bien, mostrar mensaje de éxito
        const successMessage = t('messages.orderUpdated') || 'Orden actualizado correctamente'
        showToast(successMessage, 'success')
      } catch (error) {
        console.error('Error updating brands order:', error)
        
        // **REVERTIR** en caso de error - volver al estado anterior
        setBrands(previousBrands)
        
        const errorMessage = error instanceof Error ? error.message : t('messages.error')
        showToast(errorMessage, 'error')
      }
    }
    
    // Ejecutar en segundo plano
    updateInBackground()
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Botón de acción */}
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={handleAddBrand}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('addBrand')}
            </button>
          </div>

          {/* Lista de marcas */}
          <div>
            <BrandsList
              brands={brands}
              onEdit={handleEditBrand}
              onDelete={handleDeleteBrand}
              onReorder={handleReorderBrands}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Modal para crear/editar marcas */}
      <BrandModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedBrand(null)
        }}
        onSave={handleSaveBrand}
        brand={selectedBrand}
        storeId={storeId}
      />

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={closeToast}
        />
      )}
    </DashboardLayout>
  )
} 