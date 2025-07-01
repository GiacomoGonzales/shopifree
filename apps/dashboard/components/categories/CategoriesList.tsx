'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { CategoryWithId } from '../../lib/categories'
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

interface CategoriesListProps {
  categories: CategoryWithId[]
  onEdit: (category: CategoryWithId) => void
  onDelete: (categoryId: string) => void
  onReorder?: (categories: CategoryWithId[]) => void
  loading?: boolean
  locale?: string
}

export default function CategoriesList({
  categories,
  onEdit,
  onDelete,
  onReorder,
  loading = false,
  locale = 'es'
}: CategoriesListProps) {
  const t = useTranslations('pages.categories')
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  const [localCategories, setLocalCategories] = useState<CategoryWithId[]>(categories)

  // Actualizar categorías locales cuando cambien las props
  useEffect(() => {
    setLocalCategories(categories)
  }, [categories])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDeleteClick = (categoryId: string) => {
    setDeleteConfirmId(categoryId)
  }

  const handleDeleteConfirm = () => {
    if (deleteConfirmId) {
      onDelete(deleteConfirmId)
      setDeleteConfirmId(null)
    }
  }

  const handleDeleteCancel = () => {
    setDeleteConfirmId(null)
  }

  // Función para manejar el reordenamiento de categorías padre
  function handleParentDragEnd(event: DragEndEvent) {
    const { active, over } = event

    if (active.id !== over?.id) {
      const parentCategories = localCategories.filter(cat => !cat.parentCategoryId)
      const oldIndex = parentCategories.findIndex((item) => item.id === active.id)
      const newIndex = parentCategories.findIndex((item) => item.id === over?.id)

      const reorderedParents = arrayMove(parentCategories, oldIndex, newIndex)
      
      // Actualizar el orden numérico de las categorías padre
      const updatedParents = reorderedParents.map((category, index) => ({
        ...category,
        order: index + 1
      }))

      // Reconstruir el array completo manteniendo las subcategorías en su lugar
      const updatedCategories = [...updatedParents]
      localCategories.filter(cat => cat.parentCategoryId).forEach(subcat => {
        updatedCategories.push(subcat)
      })

      setLocalCategories(updatedCategories)
      
      // Notificar al componente padre
      if (onReorder) {
        onReorder(updatedCategories)
      }
    }
  }

  // Función para manejar el reordenamiento de subcategorías
  function handleSubcategoryDragEnd(parentId: string) {
    return (event: DragEndEvent) => {
      const { active, over } = event

      if (active.id !== over?.id) {
        const subcategories = localCategories.filter(cat => cat.parentCategoryId === parentId)
        const oldIndex = subcategories.findIndex((item) => item.id === active.id)
        const newIndex = subcategories.findIndex((item) => item.id === over?.id)

        const reorderedSubs = arrayMove(subcategories, oldIndex, newIndex)
        
        // Actualizar el orden numérico de las subcategorías
        const updatedSubs = reorderedSubs.map((category, index) => ({
          ...category,
          order: index + 1
        }))

        // Reconstruir el array completo
        const updatedCategories = localCategories.map(cat => {
          if (cat.parentCategoryId === parentId) {
            const updatedSubcat = updatedSubs.find(sub => sub.id === cat.id)
            return updatedSubcat || cat
          }
          return cat
        })

        setLocalCategories(updatedCategories)
        
        // Notificar al componente padre
        if (onReorder) {
          onReorder(updatedCategories)
        }
      }
    }
  }

  // Separar categorías padre y subcategorías
  const parentCategories = localCategories.filter(cat => !cat.parentCategoryId)
  const getSubcategories = (parentId: string) => 
    localCategories
      .filter(cat => cat.parentCategoryId === parentId)
      .sort((a, b) => (a.order || 0) - (b.order || 0))

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="animate-pulse space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (localCategories.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6 text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            {t('noCategories')}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            {t('noCategoriesDescription')}
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-2 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-8">
                {/* Drag handle column */}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.name')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.description')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.image')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.parentCategory')}
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {t('table.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* DndContext para categorías padre */}
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleParentDragEnd}
            >
              <SortableContext
                items={parentCategories.map(cat => cat.id)}
                strategy={verticalListSortingStrategy}
              >
                {parentCategories.map((category) => (
                  <SortableCategoryRow
                    key={category.id}
                    category={category}
                    subcategories={getSubcategories(category.id)}
                    onEdit={onEdit}
                    onDelete={handleDeleteClick}
                    onSubcategoryReorder={handleSubcategoryDragEnd(category.id)}
                    deleteConfirmId={deleteConfirmId}
                    onDeleteConfirm={handleDeleteConfirm}
                    onDeleteCancel={handleDeleteCancel}
                    locale={locale}
                    t={t}
                    sensors={sensors}
                  />
                ))}
              </SortableContext>
            </DndContext>
          </tbody>
        </table>
      </div>

      {/* Modal de confirmación de eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-6 border w-96 shadow-lg rounded-lg bg-white">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-10 w-10 rounded-full bg-gray-100 mb-4">
                <svg
                  className="h-5 w-5 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1-1H7a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {t('deleteCategory')}
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                {t('actions.confirmDelete')}
              </p>
              <div className="flex justify-center space-x-3">
                <button
                  onClick={handleDeleteCancel}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {t('actions.no')}
                </button>
                <button
                  onClick={handleDeleteConfirm}
                  className="px-4 py-2 text-sm font-medium text-white bg-gray-900 border border-transparent rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-500"
                >
                  {t('actions.yes')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// Componente sortable para una fila de categoría
interface SortableCategoryRowProps {
  category: CategoryWithId
  subcategories: CategoryWithId[]
  onEdit: (category: CategoryWithId) => void
  onDelete: (categoryId: string) => void
  onSubcategoryReorder: (event: DragEndEvent) => void
  deleteConfirmId: string | null
  onDeleteConfirm: () => void
  onDeleteCancel: () => void
  locale: string
  t: any
  sensors: any
}

function SortableCategoryRow({
  category,
  subcategories,
  onEdit,
  onDelete,
  onSubcategoryReorder,
  deleteConfirmId,
  onDeleteConfirm,
  onDeleteCancel,
  locale,
  t,
  sensors
}: SortableCategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <>
      {/* Categoría padre */}
      <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 group">
        <td className="px-2 py-4 whitespace-nowrap">
          <div
            {...attributes}
            {...listeners}
            className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors"
          >
            <svg
              className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
            </svg>
          </div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="flex items-center">
            <div>
              <div className="text-sm font-medium text-gray-900">
                {category.name[locale as keyof typeof category.name] || category.name.es}
              </div>
              {category.name.es !== category.name.en && (
                <div className="text-sm text-gray-500">
                  {locale === 'es' ? category.name.en : category.name.es}
                </div>
              )}
            </div>
          </div>
        </td>
        <td className="px-6 py-4">
          <div className="text-sm text-gray-900 max-w-xs truncate">
            {category.description[locale as keyof typeof category.description] || category.description.es}
          </div>
          {category.description.es !== category.description.en && (
            <div className="text-sm text-gray-500 max-w-xs truncate">
              {locale === 'es' ? category.description.en : category.description.es}
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          {category.imageUrl ? (
            <img
              src={category.imageUrl}
              alt={category.name.es}
              className="h-10 w-10 rounded-md object-cover"
            />
          ) : (
            <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
          {t('table.noParent')}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex justify-end space-x-2">
            <button
              onClick={() => onEdit(category)}
              className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-600 hover:bg-gray-50"
            >
              {t('table.edit')}
            </button>
            <button
              onClick={() => onDelete(category.id)}
              className="text-red-600 hover:text-red-900 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
            >
              {t('table.delete')}
            </button>
          </div>
        </td>
      </tr>

      {/* Subcategorías con su propio DndContext */}
      {subcategories.length > 0 && (
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={onSubcategoryReorder}
        >
          <SortableContext
            items={subcategories.map(cat => cat.id)}
            strategy={verticalListSortingStrategy}
          >
            {subcategories.map((subcategory) => (
              <SortableSubcategoryRow
                key={subcategory.id}
                subcategory={subcategory}
                parentCategory={category}
                onEdit={onEdit}
                onDelete={onDelete}
                locale={locale}
                t={t}
              />
            ))}
          </SortableContext>
        </DndContext>
      )}
    </>
  )
}

// Componente sortable para subcategorías
interface SortableSubcategoryRowProps {
  subcategory: CategoryWithId
  parentCategory: CategoryWithId
  onEdit: (category: CategoryWithId) => void
  onDelete: (categoryId: string) => void
  locale: string
  t: any
}

function SortableSubcategoryRow({
  subcategory,
  parentCategory,
  onEdit,
  onDelete,
  locale,
  t
}: SortableSubcategoryRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: subcategory.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <tr ref={setNodeRef} style={style} className="hover:bg-gray-50 bg-gray-25 group">
      <td className="px-2 py-4 whitespace-nowrap">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 rounded hover:bg-gray-100 transition-colors ml-4"
        >
          <svg
            className="w-4 h-4 text-gray-400 group-hover:text-gray-600"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M11 18c0 1.1-.9 2-2 2s-2-.9-2-2 .9-2 2-2 2 .9 2 2zm-2-8c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0-6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm6 4c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
          </svg>
        </div>
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="ml-6">
            <div className="text-sm font-medium text-gray-900">
              ↳ {subcategory.name[locale as keyof typeof subcategory.name] || subcategory.name.es}
            </div>
            {subcategory.name.es !== subcategory.name.en && (
              <div className="text-sm text-gray-500">
                {locale === 'es' ? subcategory.name.en : subcategory.name.es}
              </div>
            )}
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <div className="text-sm text-gray-900 max-w-xs truncate">
          {subcategory.description[locale as keyof typeof subcategory.description] || subcategory.description.es}
        </div>
        {subcategory.description.es !== subcategory.description.en && (
          <div className="text-sm text-gray-500 max-w-xs truncate">
            {locale === 'es' ? subcategory.description.en : subcategory.description.es}
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap">
        {subcategory.imageUrl ? (
          <img
            src={subcategory.imageUrl}
            alt={subcategory.name.es}
            className="h-10 w-10 rounded-md object-cover"
          />
        ) : (
          <div className="h-10 w-10 rounded-md bg-gray-200 flex items-center justify-center">
            <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
        )}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {parentCategory.name[locale as keyof typeof parentCategory.name] || parentCategory.name.es}
      </td>
      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
        <div className="flex justify-end space-x-2">
          <button
            onClick={() => onEdit(subcategory)}
            className="text-gray-600 hover:text-gray-900 px-3 py-1 rounded border border-gray-600 hover:bg-gray-50"
          >
            {t('table.edit')}
          </button>
          <button
            onClick={() => onDelete(subcategory.id)}
            className="text-red-600 hover:text-red-900 px-3 py-1 rounded border border-red-600 hover:bg-red-50"
          >
            {t('table.delete')}
          </button>
        </div>
      </td>
    </tr>
  )
} 