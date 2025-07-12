'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../components/DashboardLayout'
import CollectionModal from '../../../components/collections/CollectionModal'
import CollectionsList from '../../../components/collections/CollectionsList'
import { CollectionWithId, getCollections, createCollection, updateCollection, deleteCollection } from '../../../lib/collections'
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
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`}>
      <div className="flex items-center">
        <span className="mr-2">
          {type === 'success' ? '✓' : '✗'}
        </span>
        {message}
        <button
          onClick={onClose}
          className="ml-4 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
    </div>
  )
}

export default function CollectionsPage() {
  const t = useTranslations('pages.collections')
  const { user } = useAuth()
  
  const [collections, setCollections] = useState<CollectionWithId[]>([])
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
        
        // Cargar colecciones
        console.log('Cargando colecciones iniciales para store:', store.id)
        const allCollections = await getCollections(store.id)
        
        console.log('Colecciones iniciales cargadas:', allCollections)
        setCollections(allCollections)
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

  const handleSaveCollection = async (collectionData: Parameters<typeof createCollection>[1]) => {
    try {
      if (selectedCollection) {
        // Actualizar colección existente
        await updateCollection(storeId, selectedCollection.id, collectionData)
        
        // Actualizar en el estado local
        setCollections(prev => prev.map(collection => 
          collection.id === selectedCollection.id 
            ? { ...collection, ...collectionData }
            : collection
        ))
        
        showToast(t('messages.updated'), 'success')
      } else {
        // Crear nueva colección
        const newCollection = await createCollection(storeId, collectionData)
        
        // Agregar al estado local
        setCollections(prev => [...prev, newCollection])
        
        showToast(t('messages.created'), 'success')
      }
      
      setIsModalOpen(false)
      setSelectedCollection(null)
    } catch (error) {
      console.error('Error saving collection:', error)
      const errorMessage = error instanceof Error ? error.message : t('messages.error')
      showToast(errorMessage, 'error')
      throw error // Re-throw para que el modal pueda manejar el error
    }
  }

  const handleDeleteCollection = async (collectionId: string) => {
    try {
      await deleteCollection(storeId, collectionId)
      
      // Remover del estado local
      setCollections(prev => prev.filter(collection => collection.id !== collectionId))
      
      showToast(t('messages.deleted'), 'success')
    } catch (error) {
      console.error('Error deleting collection:', error)
      showToast(t('messages.error'), 'error')
    }
  }

  return (
    <DashboardLayout>
      <div className="p-6">
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{t('title')}</h1>
              <p className="text-gray-600 mt-2">{t('description')}</p>
            </div>
            <button
              onClick={handleAddCollection}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {t('addCollection')}
            </button>
          </div>
        </div>

        <CollectionsList
          collections={collections}
          onEdit={handleEditCollection}
          onDelete={handleDeleteCollection}
          loading={loading}
        />

        <CollectionModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSaveCollection}
          collection={selectedCollection}
          storeId={storeId}
        />

        {toast && (
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={closeToast}
          />
        )}
      </div>
    </DashboardLayout>
  )
} 