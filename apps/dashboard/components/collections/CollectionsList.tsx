'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { CollectionWithId } from '../../lib/collections'

interface CollectionsListProps {
  collections: CollectionWithId[]
  onEdit: (collection: CollectionWithId) => void
  onDelete: (collectionId: string) => void
  onToggleVisibility: (collectionId: string, visible: boolean) => void
  onReorder: (collectionsOrder: { id: string; order: number }[], originalCollections: CollectionWithId[]) => void
  loading?: boolean
}

interface SortableItemProps {
  collection: CollectionWithId
  onEdit: (collection: CollectionWithId) => void
  onDelete: (collectionId: string) => void
  onToggleVisibility: (collectionId: string, visible: boolean) => void
}

function SortableItem({ collection, onEdit, onDelete, onToggleVisibility }: SortableItemProps) {
  const t = useTranslations('pages.collections')
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: collection.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const handleDelete = () => {
    onDelete(collection.id)
    setShowDeleteConfirm(false)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1 hover:bg-gray-100 rounded"
              title={t('dragToReorder')}
            >
              <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
              </svg>
            </div>

            {/* Collection image */}
            <div className="flex-shrink-0">
              {collection.image ? (
                <img
                  src={collection.image}
                  alt={collection.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
              ) : (
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
              )}
            </div>

            {/* Collection info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-2">
                <h3 className="text-sm font-medium text-gray-900 truncate">
                  {collection.title}
                </h3>
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  collection.visible 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  {collection.visible ? t('table.visible') : t('table.hidden')}
                </span>
              </div>
              
              {collection.description && (
                <p className="text-sm text-gray-500 truncate mt-1">
                  {collection.description}
                </p>
              )}
              
              <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                <span>
                  {collection.productIds?.length || 0} {t('table.productsCount')}
                </span>
                <span>
                  {t('table.order')}: {collection.order}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onToggleVisibility(collection.id, !collection.visible)}
              className={`p-2 rounded-lg transition-colors duration-200 ${
                collection.visible
                  ? 'text-green-600 hover:text-green-700 hover:bg-green-50'
                  : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
              }`}
              title={collection.visible ? t('table.hide') : t('table.show')}
            >
              {collection.visible ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              )}
            </button>
            
            <button
              onClick={() => onEdit(collection)}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              title={t('table.edit')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
              title={t('table.delete')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {t('actions.confirmDelete')}
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              {collection.title}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
              >
                {t('actions.no')}
              </button>
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors duration-200"
              >
                {t('actions.yes')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function CollectionsList({
  collections,
  onEdit,
  onDelete,
  onToggleVisibility,
  onReorder,
  loading = false
}: CollectionsListProps) {
  const t = useTranslations('pages.collections')
  const [localCollections, setLocalCollections] = useState<CollectionWithId[]>(collections)
  const [isDragging, setIsDragging] = useState(false)
  
  // Sincronizar con props cuando no estamos arrastrando
  useEffect(() => {
    if (!isDragging) {
      setLocalCollections(collections)
    }
  }, [collections, isDragging])
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = () => {
    setIsDragging(true)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    setIsDragging(false)

    if (active.id !== over?.id) {
      const oldIndex = localCollections.findIndex(item => item.id === active.id)
      const newIndex = localCollections.findIndex(item => item.id === over?.id)
      
      // Actualizar inmediatamente la UI local
      const newOrder = arrayMove(localCollections, oldIndex, newIndex)
      setLocalCollections(newOrder)
      
      // Preparar datos para el servidor
      const reorderedCollections = newOrder.map((collection, index) => ({
        id: collection.id,
        order: index + 1
      }))
      
      // Enviar al servidor con los datos originales para rollback
      onReorder(reorderedCollections, collections)
    }
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
            <div className="animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-4 h-4 bg-gray-200 rounded"></div>
                <div className="w-12 h-12 bg-gray-200 rounded-lg"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                </div>
                <div className="flex space-x-2">
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                  <div className="w-8 h-8 bg-gray-200 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (collections.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noCollections')}</h3>
        <p className="mt-1 text-sm text-gray-500">
          {t('noCollectionsMessage')}
        </p>
      </div>
    )
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={localCollections.map(c => c.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-4">
          {localCollections.map((collection) => (
            <SortableItem
              key={collection.id}
              collection={collection}
              onEdit={onEdit}
              onDelete={onDelete}
              onToggleVisibility={onToggleVisibility}
            />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
} 