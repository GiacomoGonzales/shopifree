'use client'

import { useState, useEffect, useCallback } from 'react'
import { useTranslations } from 'next-intl'
import { Product, updateProductField } from '../../lib/products'
import { BrandWithId, getBrands } from '../../lib/brands'
import { CategoryWithId, getCategories, getSubcategories } from '../../lib/categories'
import { useAuth } from '../../lib/simple-auth-context'
import { getUserStore } from '../../lib/store'

interface ProductGeneralInfoProps {
  product: Product & { id: string }
  storeId: string
  onUpdate?: (field: string, value: any) => void
}

// Hook personalizado para debouncing
const useDebounce = (value: any, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export default function ProductGeneralInfo({ product, storeId, onUpdate }: ProductGeneralInfoProps) {
  const t = useTranslations('pages.products.generalInfo')
  const tMessages = useTranslations('pages.products.messages')
  const { user } = useAuth()

  // Estados para los datos del formulario
  const [formData, setFormData] = useState({
    name: product.name || '',
    description: product.description || '',
    brandId: product.brandId || '',
    categoryId: product.categoryId || '',
    subcategoryId: product.subcategoryId || '',
    sku: product.sku || '',
    unit: product.unit || 'unit',
    condition: product.condition || 'new',
    status: product.status || 'draft'
  })

  // Estados para las opciones de selección
  const [brands, setBrands] = useState<BrandWithId[]>([])
  const [categories, setCategories] = useState<CategoryWithId[]>([])
  const [subcategories, setSubcategories] = useState<CategoryWithId[]>([])
  
  // Estados de carga y errores
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<{ [key: string]: string }>({})
  const [saveMessage, setSaveMessage] = useState('')

  // Opciones para los selectores
  const unitOptions = [
    { value: 'unit', label: t('units.unit') },
    { value: 'pair', label: t('units.pair') },
    { value: 'liter', label: t('units.liter') },
    { value: 'meter', label: t('units.meter') },
    { value: 'box', label: t('units.box') },
    { value: 'pack', label: t('units.pack') },
    { value: 'kilogram', label: t('units.kilogram') },
    { value: 'gram', label: t('units.gram') },
    { value: 'dozen', label: t('units.dozen') }
  ]

  const conditionOptions = [
    { value: 'new', label: t('conditions.new') },
    { value: 'used', label: t('conditions.used') },
    { value: 'refurbished', label: t('conditions.refurbished') }
  ]

  const statusOptions = [
    { value: 'visible', label: t('statuses.visible') },
    { value: 'draft', label: t('statuses.draft') },
    { value: 'outOfStock', label: t('statuses.outOfStock') }
  ]

  // Valores con debounce para guardado automático
  const debouncedName = useDebounce(formData.name, 1000)
  const debouncedDescription = useDebounce(formData.description, 1500)
  const debouncedSku = useDebounce(formData.sku, 1000)

  // Cargar datos iniciales
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true)
        
        // Cargar marcas y categorías
        const [brandsData, categoriesData] = await Promise.all([
          getBrands(storeId),
          getCategories(storeId)
        ])
        
        setBrands(brandsData)
        
        // Filtrar solo categorías padre
        const parentCategories = categoriesData.filter(cat => !cat.parentCategoryId)
        setCategories(parentCategories)
        
        // Si el producto ya tiene una categoría seleccionada, cargar subcategorías
        if (product.categoryId) {
          const subcategoriesData = await getSubcategories(storeId, product.categoryId)
          setSubcategories(subcategoriesData)
        }
      } catch (error) {
        console.error('Error loading initial data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadInitialData()
  }, [storeId, product.categoryId])

  // Manejar cambio de categoría para cargar subcategorías
  const handleCategoryChange = async (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      categoryId,
      subcategoryId: '' // Reset subcategory when category changes
    }))

    if (categoryId) {
      try {
        const subcategoriesData = await getSubcategories(storeId, categoryId)
        setSubcategories(subcategoriesData)
      } catch (error) {
        console.error('Error loading subcategories:', error)
        setSubcategories([])
      }
    } else {
      setSubcategories([])
    }

    // Guardar inmediatamente el cambio de categoría
    handleSaveField('categoryId', categoryId)
  }

  // Función para guardar un campo específico
  const handleSaveField = useCallback(async (field: string, value: any) => {
    try {
      await updateProductField(storeId, product.id, field, value)
      setSaveMessage(tMessages('saved'))
      setTimeout(() => setSaveMessage(''), 3000)
      
      if (onUpdate) {
        onUpdate(field, value)
      }
    } catch (error) {
      console.error('Error saving field:', error)
      if (error instanceof Error) {
        setErrors(prev => ({ ...prev, [field]: error.message }))
      }
    }
  }, [storeId, product.id, onUpdate, tMessages])

  // Efectos para guardado automático con debounce
  useEffect(() => {
    if (debouncedName !== product.name && debouncedName.trim() !== '') {
      setErrors(prev => ({ ...prev, name: '' }))
      handleSaveField('name', debouncedName)
    } else if (debouncedName.trim() === '') {
      setErrors(prev => ({ ...prev, name: t('form.nameRequired') }))
    }
  }, [debouncedName, product.name, handleSaveField, t])

  useEffect(() => {
    if (debouncedDescription !== product.description) {
      handleSaveField('description', debouncedDescription)
    }
  }, [debouncedDescription, product.description, handleSaveField])

  useEffect(() => {
    if (debouncedSku !== product.sku) {
      setErrors(prev => ({ ...prev, sku: '' }))
      handleSaveField('sku', debouncedSku)
    }
  }, [debouncedSku, product.sku, handleSaveField])

  // Manejar cambios en los campos del formulario
  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  // Manejar cambios en selectores (guardado inmediato)
  const handleSelectChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    handleSaveField(field, value)
  }

  // Obtener el nombre de la marca seleccionada
  const getSelectedBrandName = () => {
    if (!formData.brandId) return t('form.noBrand')
    const brand = brands.find(b => b.id === formData.brandId)
    return brand ? brand.name : t('form.noBrand')
  }

  // Obtener el nombre de la categoría seleccionada
  const getSelectedCategoryName = () => {
    if (!formData.categoryId) return t('form.noCategory')
    const category = categories.find(c => c.id === formData.categoryId)
    return category ? category.name : t('form.noCategory')
  }

  // Obtener el nombre de la subcategoría seleccionada
  const getSelectedSubcategoryName = () => {
    if (!formData.subcategoryId) return ''
    const subcategory = subcategories.find(c => c.id === formData.subcategoryId)
    return subcategory ? ` > ${subcategory.name}` : ''
  }

  if (isLoading) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-24 bg-gray-200 rounded"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-medium text-gray-900">{t('title')}</h3>
        <p className="text-sm text-gray-500 mt-1">{t('subtitle')}</p>
        
        {/* Mensaje de guardado */}
        {saveMessage && (
          <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-700">{saveMessage}</p>
          </div>
        )}
      </div>

      {/* Formulario */}
      <div className="space-y-6">
        {/* Nombre del producto */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            {t('form.name')} <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder={t('form.namePlaceholder')}
            className={`mt-1 block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.name ? 'border-red-300' : 'border-gray-300'
            }`}
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-600">{errors.name}</p>
          )}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
            {t('form.description')}
          </label>
          <textarea
            id="description"
            rows={4}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
            placeholder={t('form.descriptionPlaceholder')}
            className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Grid para campos en dos columnas */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Marca */}
          <div>
            <label htmlFor="brand" className="block text-sm font-medium text-gray-700">
              {t('form.brand')}
            </label>
            <select
              id="brand"
              value={formData.brandId}
              onChange={(e) => handleSelectChange('brandId', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('form.brandPlaceholder')}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.name}
                </option>
              ))}
            </select>
          </div>

          {/* SKU */}
          <div>
            <label htmlFor="sku" className="block text-sm font-medium text-gray-700">
              {t('form.sku')}
            </label>
            <input
              type="text"
              id="sku"
              value={formData.sku}
              onChange={(e) => handleInputChange('sku', e.target.value)}
              placeholder={t('form.skuPlaceholder')}
              className={`mt-1 block w-full border rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.sku ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            <p className="mt-1 text-xs text-gray-500">{t('form.skuHint')}</p>
            {errors.sku && (
              <p className="mt-1 text-sm text-red-600">{errors.sku}</p>
            )}
          </div>

          {/* Categoría */}
          <div>
            <label htmlFor="category" className="block text-sm font-medium text-gray-700">
              {t('form.category')}
            </label>
            <select
              id="category"
              value={formData.categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">{t('form.categoryPlaceholder')}</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Subcategoría */}
          <div>
            <label htmlFor="subcategory" className="block text-sm font-medium text-gray-700">
              {t('form.subcategory')}
            </label>
            <select
              id="subcategory"
              value={formData.subcategoryId}
              onChange={(e) => handleSelectChange('subcategoryId', e.target.value)}
              disabled={!formData.categoryId || subcategories.length === 0}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
            >
              <option value="">{t('form.subcategoryPlaceholder')}</option>
              {subcategories.map((subcategory) => (
                <option key={subcategory.id} value={subcategory.id}>
                  {subcategory.name}
                </option>
              ))}
            </select>
          </div>

          {/* Unidad de medida */}
          <div>
            <label htmlFor="unit" className="block text-sm font-medium text-gray-700">
              {t('form.unit')}
            </label>
            <select
              id="unit"
              value={formData.unit}
              onChange={(e) => handleSelectChange('unit', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {unitOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Condición */}
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700">
              {t('form.condition')}
            </label>
            <select
              id="condition"
              value={formData.condition}
              onChange={(e) => handleSelectChange('condition', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {conditionOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Estado */}
          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              {t('form.status')}
            </label>
            <select
              id="status"
              value={formData.status}
              onChange={(e) => handleSelectChange('status', e.target.value)}
              className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Vista previa */}
        {formData.name && (
          <div className="border-t pt-6">
            <h4 className="text-sm font-medium text-gray-700 mb-2">{t('preview.title')}</h4>
            <div className="bg-gray-50 rounded-md p-3">
              <p className="text-sm text-gray-600">
                <span className="font-medium">{t('preview.product')}:</span>{' '}
                {formData.name} {getSelectedBrandName() !== t('form.noBrand') && `• ${getSelectedBrandName()}`}
                {getSelectedCategoryName() !== t('form.noCategory') && ` • ${getSelectedCategoryName()}${getSelectedSubcategoryName()}`}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 