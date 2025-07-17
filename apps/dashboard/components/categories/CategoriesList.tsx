'use client'

import { useState } from 'react'
import { CategoryWithId } from '../../lib/categories'
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

interface CategoriesListProps {
  categories: CategoryWithId[]
  onEdit: (category: CategoryWithId) => void
  onDelete: (categoryId: string, parentCategoryId?: string) => void
  onReorder: (reorderedCategories: { id: string; order: number; parentCategoryId?: string }[]) => void
  loading?: boolean
}

interface SortableItemProps {
  category: CategoryWithId
  onEdit: (category: CategoryWithId) => void
  onDelete: (categoryId: string, parentCategoryId?: string) => void
  isSubcategory?: boolean
  hasSubcategories?: boolean
  isExpanded?: boolean
  onToggleExpand?: () => void
}

function SortableItem({ 
  category, 
  onEdit, 
  onDelete, 
  isSubcategory = false,
  hasSubcategories = false,
  isExpanded = false,
  onToggleExpand
}: SortableItemProps) {
  const t = useTranslations('categories')
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: category.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        isSubcategory ? 'ml-8 border-l-4 border-l-blue-200' : ''
      }`}
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
              {category.imageUrl ? (
                <img 
                  src={category.imageUrl} 
                  alt={category.name}
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
                  {category.name}
                </h3>
                {/* Indicador de subcategorías y botón expandir/contraer */}
                {hasSubcategories && (
                  <button
                    onClick={onToggleExpand}
                    className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 transition-colors"
                    title={isExpanded ? "Contraer subcategorías" : "Expandir subcategorías"}
                  >
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : 'rotate-0'}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              {category.description && (
                <div className="max-w-2xl">
                  <p className="text-sm text-gray-500 mt-1 line-clamp-2 pr-8">
                    {category.description}
                  </p>
                </div>
              )}
              <p className="text-xs text-gray-400 mt-1">
                {isSubcategory ? t('subcategory') : t('parentCategory')} • 
                <span className="ml-1">{t('slug')}: {category.slug}</span>
              </p>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => onEdit(category)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded"
              title={t('actions.edit')}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => onDelete(category.id, category.parentCategoryId || undefined)}
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

export default function CategoriesList({
  categories,
  onEdit,
  onDelete,
  onReorder,
  loading = false
}: CategoriesListProps) {
  const t = useTranslations('categories')
  
  // Estado para controlar qué categorías están expandidas
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Separar categorías padre y subcategorías
  const parentCategories = categories.filter(cat => !cat.parentCategoryId)
  const subcategories = categories.filter(cat => cat.parentCategoryId)

  // Función para toggle expand/collapse
  const toggleExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId)
    } else {
      newExpanded.add(categoryId)
    }
    setExpandedCategories(newExpanded)
  }

  const handleDragEnd = (event: DragEndEvent, isSubcategoryContext: boolean = false) => {
    const { active, over } = event

    if (!over || active.id === over.id) {
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    if (isSubcategoryContext) {
      // Reordenar subcategorías
      const activeCategory = subcategories.find(cat => cat.id === activeId)
      const overCategory = subcategories.find(cat => cat.id === overId)
      
      if (!activeCategory || !overCategory || activeCategory.parentCategoryId !== overCategory.parentCategoryId) {
        return
      }

      const parentId = activeCategory.parentCategoryId
      const parentSubcategories = subcategories.filter(cat => cat.parentCategoryId === parentId)
      
      const oldIndex = parentSubcategories.findIndex(cat => cat.id === activeId)
      const newIndex = parentSubcategories.findIndex(cat => cat.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedSubcategories = arrayMove(parentSubcategories, oldIndex, newIndex)
        
        const updatedOrder = reorderedSubcategories.map((cat, index) => ({
          id: cat.id,
          order: index + 1,
          parentCategoryId: parentId || undefined
        }))

        onReorder(updatedOrder)
      }
    } else {
      // Reordenar categorías padre
      const oldIndex = parentCategories.findIndex(cat => cat.id === activeId)
      const newIndex = parentCategories.findIndex(cat => cat.id === overId)

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedCategories = arrayMove(parentCategories, oldIndex, newIndex)
        
        const updatedOrder = reorderedCategories.map((cat, index) => ({
          id: cat.id,
          order: index + 1
        }))

        onReorder(updatedOrder)
      }
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
        <p className="mt-2 text-sm text-gray-500">Cargando categorías...</p>
      </div>
    )
  }

  // Mostrar mensaje cuando no hay categorías (y no está cargando)
  if (categories.length === 0) {
    return (
      <div className="text-center py-8">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900">{t('noCategories')}</h3>
        <p className="mt-1 text-sm text-gray-500">{t('noCategoriesMessage')}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Categorías padre */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(event) => handleDragEnd(event, false)}
      >
        <SortableContext items={parentCategories.map(cat => cat.id)} strategy={verticalListSortingStrategy}>
          {parentCategories.map((parentCategory) => {
            const categorySubcategories = subcategories.filter(sub => sub.parentCategoryId === parentCategory.id)
            const hasSubcategories = categorySubcategories.length > 0
            const isExpanded = expandedCategories.has(parentCategory.id)

            return (
              <div key={parentCategory.id} className="space-y-2">
                <SortableItem
                  category={parentCategory}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  hasSubcategories={hasSubcategories}
                  isExpanded={isExpanded}
                  onToggleExpand={() => toggleExpanded(parentCategory.id)}
                />
                
                {/* Subcategorías con animación de expansión/contracción */}
                {hasSubcategories && (
                  <div 
                    className={`overflow-hidden transition-all duration-300 ease-in-out ${
                      isExpanded 
                        ? 'max-h-[2000px] opacity-100' 
                        : 'max-h-0 opacity-0'
                    }`}
                  >
                    <DndContext
                      sensors={sensors}
                      collisionDetection={closestCenter}
                      onDragEnd={(event) => handleDragEnd(event, true)}
                    >
                      <SortableContext 
                        items={categorySubcategories.map(cat => cat.id)} 
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-2 pt-2">
                          {categorySubcategories.map((subcategory) => (
                            <SortableItem
                              key={subcategory.id}
                              category={subcategory}
                onEdit={onEdit}
                              onDelete={onDelete}
                              isSubcategory={true}
              />
            ))}
                        </div>
                      </SortableContext>
                    </DndContext>
      </div>
                )}
              </div>
            )
          })}
        </SortableContext>
      </DndContext>

      {/* Subcategorías huérfanas (sin categoría padre) */}
      {subcategories.filter(sub => !parentCategories.find(parent => parent.id === sub.parentCategoryId)).length > 0 && (
        <div className="border-t pt-4">
          <h4 className="text-sm font-medium text-gray-500 mb-2">{t('orphanedSubcategories')}</h4>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={(event) => handleDragEnd(event, true)}
          >
            <SortableContext 
              items={subcategories
                .filter(sub => !parentCategories.find(parent => parent.id === sub.parentCategoryId))
                .map(cat => cat.id)
              } 
              strategy={verticalListSortingStrategy}
            >
              {subcategories
                .filter(sub => !parentCategories.find(parent => parent.id === sub.parentCategoryId))
                .map((subcategory) => (
                  <SortableItem
                    key={subcategory.id}
                    category={subcategory}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    isSubcategory={true}
                  />
                ))}
            </SortableContext>
          </DndContext>
        </div>
      )}
    </div>
  )
} 