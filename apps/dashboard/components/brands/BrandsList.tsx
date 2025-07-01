'use client'

import { useState } from 'react'
import { BrandWithId } from '../../lib/brands'
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors,
  DragEndEvent
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy
} from '@dnd-kit/sortable'
import {
  useSortable
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { useTranslations } from 'next-intl'

interface BrandsListProps {
  brands: BrandWithId[]
  onEdit: (brand: BrandWithId) => void
  onDelete: (brandId: string) => void
  onReorder: (reorderedBrands: { id: string; order: number }[]) => void
  loading?: boolean
}

interface SortableItemProps {
  brand: BrandWithId
  onEdit: (brand: BrandWithId) => void
  onDelete: (brandId: string) => void
}

function SortableItem({ 
  brand, 
  onEdit, 
  onDelete
}: SortableItemProps) {
  const t = useTranslations('pages.brands')
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: brand.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  const handleDelete = () => {
    if (window.confirm(t('actions.confirmDelete'))) {
      onDelete(brand.id)
    }
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 flex-1">
            {/* Drag handle */}
            <div
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
              title={t('dragToReorder')}
            >
              <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
                <circle cx="2" cy="2" r="1"/>
                <circle cx="6" cy="2" r="1"/>
                <circle cx="2" cy="6" r="1"/>
                <circle cx="6" cy="6" r="1"/>
                <circle cx="2" cy="10" r="1"/>
                <circle cx="6" cy="10" r="1"/>
              </svg>
            </div>

            {/* Imagen */}
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {brand.image ? (
                <img 
                  src={brand.image} 
                  alt={brand.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2V6a2 2 0 002 2v12a2 2 0 002 2z" />
                </svg>
              )}
            </div>

            {/* Información */}
            <div className="flex-1 mr-4">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-medium text-gray-900">
                  {brand.name}
                </h3>
              </div>
              {brand.description && (
                <div className="max-w-2xl">
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 pr-8">
                    {brand.description}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {t('brand')} • <span className="ml-1">{t('order')}: {brand.order}</span>
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(brand)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title={t('actions.edit')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"
              title={t('actions.delete')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BrandsList({
  brands,
  onEdit,
  onDelete,
  onReorder,
  loading = false
}: BrandsListProps) {
  const t = useTranslations('pages.brands')
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    const oldIndex = brands.findIndex(brand => brand.id === activeId)
    const newIndex = brands.findIndex(brand => brand.id === overId)

    if (oldIndex !== -1 && newIndex !== -1) {
      const reorderedBrands = arrayMove(brands, oldIndex, newIndex)
      
      const updatedOrder = reorderedBrands.map((brand, index) => ({
        id: brand.id,
        order: index + 1
      }))

      onReorder(updatedOrder)
    }
  }

  // Mostrar spinner durante la carga
  if (loading) {
    return (
      <div className="text-center py-8">
        <svg className="animate-spin h-8 w-8 text-gray-400 mx-auto" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <p className="mt-2 text-sm text-gray-500">Cargando marcas...</p>
      </div>
    )
  }

  // Mostrar mensaje cuando no hay marcas (y no está cargando)
  if (brands.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noBrands')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('noBrandsMessage')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={brands.map(brand => brand.id)} strategy={verticalListSortingStrategy}>
          {brands.map((brand) => (
            <SortableItem
              key={brand.id}
              brand={brand}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      </DndContext>
    </div>
  )
} 