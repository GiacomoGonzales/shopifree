'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { useParams } from 'next/navigation'
import DashboardLayout from '../../../components/DashboardLayout'
import CategoryModal from '../../../components/categories/CategoryModal'
import CategoriesList from '../../../components/categories/CategoriesList'
import { CategoryWithId, getCategories, createCategory, updateCategory, deleteCategory, getParentCategories, updateCategoriesOrder } from '../../../lib/categories'
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

export default function CategoriesPage() {
  const t = useTranslations('pages.categories')
  const { user } = useAuth()
  const params = useParams()
  const locale = params.locale as string
  
  const [categories, setCategories] = useState<CategoryWithId[]>([])
  const [parentCategories, setParentCategories] = useState<CategoryWithId[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<CategoryWithId | null>(null)
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
        
        // Cargar categorías
        console.log('Cargando categorías iniciales para store:', store.id)
        const [allCategories, parentCats] = await Promise.all([
          getCategories(store.id),
          getParentCategories(store.id)
        ])
        
        console.log('Categorías iniciales cargadas:', allCategories)
        console.log('Categorías padre iniciales:', parentCats)
        
        setCategories(allCategories)
        setParentCategories(parentCats)
      } catch (error) {
        console.error('Error loading data:', error)
        showToast(t('messages.error'), 'error')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [user, t])

  const handleAddCategory = () => {
    setEditingCategory(null)
    setIsModalOpen(true)
  }

  const handleEditCategory = (category: CategoryWithId) => {
    setEditingCategory(category)
    setIsModalOpen(true)
  }

  const handleSaveCategory = async (categoryData: any) => {
    try {
      if (editingCategory) {
        // Actualizar categoría existente
        await updateCategory(storeId, editingCategory.id, categoryData)
        showToast(t('messages.updated'), 'success')
      } else {
        // Crear nueva categoría
        await createCategory(storeId, categoryData)
        showToast(t('messages.created'), 'success')
      }

      // Esperar un momento para asegurar que Firestore se haya actualizado
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Recargar datos
      console.log('Recargando datos después de guardar categoría...')
      const [allCategories, parentCats] = await Promise.all([
        getCategories(storeId),
        getParentCategories(storeId)
      ])
      
      console.log('Todas las categorías cargadas:', allCategories)
      console.log('Categorías padre cargadas:', parentCats)
      
      setCategories(allCategories)
      setParentCategories(parentCats)
    } catch (error) {
      console.error('Error saving category:', error)
      const errorMessage = error instanceof Error ? error.message : t('messages.error')
      showToast(errorMessage, 'error')
      throw error // Re-lanzar para que el modal pueda manejar el error
    }
  }

  const handleDeleteCategory = async (categoryId: string) => {
    try {
      // Buscar la categoría a eliminar
      const categoryToDelete = categories.find(cat => cat.id === categoryId)
      
      await deleteCategory(storeId, categoryId)
      
      // Si la categoría tenía imagen, eliminarla de Cloudinary
      if (categoryToDelete?.imagePublicId) {
        await deleteImageFromCloudinary(categoryToDelete.imagePublicId)
      }
      
      showToast(t('messages.deleted'), 'success')

      // Recargar datos
      const [allCategories, parentCats] = await Promise.all([
        getCategories(storeId),
        getParentCategories(storeId)
      ])
      
      setCategories(allCategories)
      setParentCategories(parentCats)
    } catch (error) {
      console.error('Error deleting category:', error)
      const errorMessage = error instanceof Error ? error.message : t('messages.error')
      showToast(errorMessage, 'error')
    }
  }

  const handleReorderCategories = async (reorderedCategories: CategoryWithId[]) => {
    try {
      // Actualizar estado local inmediatamente para UI responsiva
      setCategories(reorderedCategories)
      
      // Separar categorías padre y subcategorías
      const parentCategoriesOnly = reorderedCategories.filter(cat => !cat.parentCategoryId)
      const subcategoriesOnly = reorderedCategories.filter(cat => cat.parentCategoryId)
      
      // Preparar datos para actualizar orden de categorías padre
      const parentCategoriesOrder = parentCategoriesOnly.map((category, index) => ({
        id: category.id,
        order: index + 1
      }))

      // Preparar datos para actualizar orden de subcategorías (agrupadas por categoría padre)
      const subcategoriesOrder: { id: string; order: number }[] = []
      
      // Agrupar subcategorías por categoría padre y asignar orden
      const subcategoriesByParent = subcategoriesOnly.reduce((acc, subcat) => {
        if (!acc[subcat.parentCategoryId!]) {
          acc[subcat.parentCategoryId!] = []
        }
        acc[subcat.parentCategoryId!].push(subcat)
        return acc
      }, {} as Record<string, CategoryWithId[]>)

      // Asignar orden dentro de cada categoría padre
      Object.values(subcategoriesByParent).forEach(subcats => {
        subcats.forEach((subcat, index) => {
          subcategoriesOrder.push({
            id: subcat.id,
            order: index + 1
          })
        })
      })

      // Combinar todos los órdenes para una sola llamada a la base de datos
      const allCategoriesOrder = [...parentCategoriesOrder, ...subcategoriesOrder]

      // Actualizar orden en la base de datos
      await updateCategoriesOrder(storeId, allCategoriesOrder)
      
      // NO RECARGAR datos después de un reordenamiento exitoso
      // El estado local ya está actualizado correctamente
      
      showToast(t('messages.orderUpdated') || 'Orden actualizado correctamente', 'success')
    } catch (error) {
      console.error('Error updating categories order:', error)
      const errorMessage = error instanceof Error ? error.message : t('messages.error')
      showToast(errorMessage, 'error')
      
      // Solo recargar datos en caso de error para restaurar el estado correcto
      try {
        const allCategories = await getCategories(storeId)
        setCategories(allCategories)
      } catch (reloadError) {
        console.error('Error reloading categories:', reloadError)
      }
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
              onClick={handleAddCategory}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600"
            >
              <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              {t('addCategory')}
            </button>
          </div>

          {/* Lista de categorías */}
          <div>
            <CategoriesList
              categories={categories}
              onEdit={handleEditCategory}
              onDelete={handleDeleteCategory}
              onReorder={handleReorderCategories}
              loading={loading}
              locale={locale}
            />
          </div>
        </div>
      </div>

      {/* Modal para crear/editar categorías */}
      <CategoryModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveCategory}
        category={editingCategory}
        parentCategories={parentCategories}
        storeId={storeId}
        locale={locale}
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