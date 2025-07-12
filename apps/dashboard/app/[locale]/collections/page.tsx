'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../components/DashboardLayout'
import CollectionModal from '../../../components/collections/CollectionModal'
import CollectionsList from '../../../components/collections/CollectionsList'
import { CollectionWithId, getCollections, createCollection, updateCollection, deleteCollection, updateCollectionsOrder } from '../../../lib/collections'
import { ProductWithId, getProducts } from '../../../lib/products'
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
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-md shadow-lg ${
      type === 'success' 
        ? 'bg-green-50 border border-green-200 text-green-800' 
        : 'bg-red-50 border border-red-200 text-red-800'
    }`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          {type === 'success' ? (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <div className="-mx-1.5 -my-1.5">
            <button
              onClick={onClose}
              className="inline-flex rounded-md p-1.5 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function CollectionsPage() {
  const t = useTranslations('pages.collections')
  const { user } = useAuth()
  
  const [collections, setCollections] = useState<CollectionWithId[]>([])
  const [products, setProducts] = useState<ProductWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCollection, setSelectedCollection] = useState<CollectionWithId | null>(null)
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
        
        // Cargar colecciones y productos en paralelo
        console.log('Cargando colecciones y productos para store:', store.id)
        const [allCollections, allProducts] = await Promise.all([
          getCollections(store.id),
          getProducts(store.id)
        ])
        
        console.log('Colecciones cargadas:', allCollections)
        console.log('Productos cargados:', allProducts.length)
        
        setCollections(allCollections)
        setProducts(allProducts)
      } catch (error) {
        console.error('Error loading data:', error)
        showToast(t('messages.error'), 'error')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, t])

  const handleAddCollection = () => {
    setSelectedCollection(null)
    setIsModalOpen(true)
  }

  const handleEditCollection = (collection: CollectionWithId) => {
    setSelectedCollection(collection)
    setIsModalOpen(true)
  }

  const handleDeleteCollection = async (collectionId: string) => {
    if (!storeId) return

    try {
      // Obtener la colección antes de eliminarla para poder eliminar la imagen
      const collectionToDelete = collections.find(c => c.id === collectionId)
      
      await deleteCollection(storeId, collectionId)
      
      // Eliminar imagen de Cloudinary si existe
      if (collectionToDelete?.image) {
        try {
          await deleteImageFromCloudinary(collectionToDelete.image)
        } catch (error) {
          console.warn('Error deleting image from Cloudinary:', error)
        }
      }
      
      // Actualizar lista local
      setCollections(prev => prev.filter(c => c.id !== collectionId))
      showToast(t('messages.deleted'), 'success')
    } catch (error) {
      console.error('Error deleting collection:', error)
      showToast(t('messages.error'), 'error')
    }
  }

  const handleSaveCollection = async (collectionData: any) => {
    console.log('🔥 handleSaveCollection llamado con:', { storeId, collectionData, selectedCollection })
    
    if (!storeId) {
      console.error('❌ No hay storeId disponible')
      showToast('Error: No se pudo identificar la tienda', 'error')
      return
    }

    try {
      if (selectedCollection) {
        // Actualizar colección existente
        console.log('📝 Actualizando colección existente:', selectedCollection.id)
        await updateCollection(storeId, selectedCollection.id, collectionData)
        
        // Actualizar lista local
        setCollections(prev => prev.map(c => 
          c.id === selectedCollection.id 
            ? { ...c, ...collectionData, updatedAt: new Date() }
            : c
        ))
        
        showToast(t('messages.updated'), 'success')
      } else {
        // Crear nueva colección
        console.log('✨ Creando nueva colección')
        const newCollection = await createCollection(storeId, collectionData)
        console.log('✅ Colección creada:', newCollection)
        
        // Actualizar lista local
        setCollections(prev => [...prev, newCollection])
        
        showToast(t('messages.created'), 'success')
      }
    } catch (error) {
      console.error('❌ Error saving collection:', error)
      const errorMessage = error instanceof Error ? error.message : t('messages.error')
      
      if (errorMessage.includes('título') || errorMessage.includes('title')) {
        showToast(t('messages.duplicateTitle'), 'error')
      } else if (errorMessage.includes('slug')) {
        showToast(t('messages.duplicateSlug'), 'error')
      } else {
        showToast(errorMessage, 'error')
      }
      throw error // Re-throw para que el modal maneje el error
    }
  }

  const handleToggleVisibility = async (collectionId: string, visible: boolean) => {
    if (!storeId) return

    // Actualizar inmediatamente la UI (optimistic update)
    const originalCollection = collections.find(c => c.id === collectionId)
    setCollections(prev => prev.map(c => 
      c.id === collectionId ? { ...c, visible } : c
    ))

    try {
      await updateCollection(storeId, collectionId, { visible })
      showToast(visible ? t('messages.collectionShown') : t('messages.collectionHidden'), 'success')
    } catch (error) {
      console.error('Error updating collection visibility:', error)
      
      // Rollback: restaurar el estado original
      if (originalCollection) {
        setCollections(prev => prev.map(c => 
          c.id === collectionId ? { ...c, visible: originalCollection.visible } : c
        ))
      }
      showToast(t('messages.error'), 'error')
    }
  }

  const handleReorderCollections = async (collectionsOrder: { id: string; order: number }[], originalCollections: CollectionWithId[]) => {
    if (!storeId) return

    // Actualizar inmediatamente la UI (optimistic update)
    setCollections(prev => {
      const updated = [...prev]
      collectionsOrder.forEach(({ id, order }) => {
        const index = updated.findIndex(c => c.id === id)
        if (index !== -1) {
          updated[index] = { ...updated[index], order }
        }
      })
      return updated.sort((a, b) => a.order - b.order)
    })

    try {
      await updateCollectionsOrder(storeId, collectionsOrder)
      showToast(t('messages.orderUpdated'), 'success')
    } catch (error) {
      console.error('Error updating collections order:', error)
      
      // Rollback: restaurar el orden original
      setCollections(originalCollections)
      showToast(t('messages.error'), 'error')
    }
  }

  return (
    <DashboardLayout>
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Botón de acción */}
          <div className="flex justify-end mb-6">
            <button
              type="button"
              onClick={handleAddCollection}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('addCollection')}
            </button>
          </div>

          {/* Lista de colecciones */}
          <div>
            <CollectionsList
              collections={collections}
              onEdit={handleEditCollection}
              onDelete={handleDeleteCollection}
              onToggleVisibility={handleToggleVisibility}
              onReorder={handleReorderCollections}
              loading={loading}
            />
          </div>
        </div>
      </div>

      {/* Modal para crear/editar colecciones */}
      <CollectionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedCollection(null)
        }}
        onSave={handleSaveCollection}
        collection={selectedCollection}
        storeId={storeId}
        products={products}
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