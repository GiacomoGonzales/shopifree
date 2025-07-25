'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../components/DashboardLayout'
import { RichTextEditor } from '../../../../components/RichTextEditor'
import { useStore } from '../../../../lib/hooks/useStore'
import { getBrands, type BrandWithId } from '../../../../lib/brands'
import { getParentCategories, getSubcategories, type CategoryWithId } from '../../../../lib/categories'
import { createProduct, generateSlug, validateProduct } from '../../../../lib/products'
import { uploadMediaToCloudinary, getFileType } from '../../../../lib/cloudinary'
import { Card } from '../../../../../../packages/ui/src/components/Card'
import { Button } from '../../../../../../packages/ui/src/components/Button'
import { Input } from '../../../../../../packages/ui/src/components/Input'
import { CATEGORY_OPTIONS, META_FIELDS_BY_CATEGORY } from './productCategorization'

// Interfaces
interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
}

interface MediaFile {
  id: string
  url: string
  file?: File
  cloudinaryPublicId?: string
  uploading: boolean
  type: 'image' | 'video'
  resourceType?: 'image' | 'video' | 'raw'
}

interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
  isLeaf?: boolean
}

export default function CreateProductPage() {
  const router = useRouter()
  const { store, loading: storeLoading, currency, currencySymbol, currencyName, formatPrice } = useStore()
  const t = useTranslations('pages.products.create')
  
  // Estados del formulario
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState('')
  const [brands, setBrands] = useState<BrandWithId[]>([])
  const [loadingBrands, setLoadingBrands] = useState(false)
  
  // Estados para categorías dinámicas (barra lateral)
  const [dynamicParentCategories, setDynamicParentCategories] = useState<CategoryWithId[]>([])
  const [dynamicSubcategories, setDynamicSubcategories] = useState<CategoryWithId[]>([])
  const [selectedParentCategoryIds, setSelectedParentCategoryIds] = useState<string[]>([])
  const [selectedSubcategoryIds, setSelectedSubcategoryIds] = useState<string[]>([])
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [loadingSubcategories, setLoadingSubcategories] = useState(false)
  const [price, setPrice] = useState('')
  const [comparePrice, setComparePrice] = useState('')
  const [cost, setCost] = useState('')
  const [chargeTaxes, setChargeTaxes] = useState(false)
  const [requiresShipping, setRequiresShipping] = useState(true)
  const [weight, setWeight] = useState('')
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  const [categoryPath, setCategoryPath] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [metaFieldValues, setMetaFieldValues] = useState<Record<string, string | string[]>>({})
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [seoTitle, setSeoTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [urlSlug, setUrlSlug] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [countryOrigin, setCountryOrigin] = useState('')
  const [harmonizedCode, setHarmonizedCode] = useState('')
  const [productStatus, setProductStatus] = useState<'draft' | 'active' | 'archived'>('draft')
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // Ref para el input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar marcas y categorías cuando se monta el componente
  useEffect(() => {
    const loadData = async () => {
      if (!store?.id) return
      
      // Cargar marcas
      setLoadingBrands(true)
      try {
        const brandsList = await getBrands(store.id)
        setBrands(brandsList)
      } catch (error) {
        console.error('Error cargando marcas:', error)
      } finally {
        setLoadingBrands(false)
      }

      // Cargar categorías padre
      setLoadingCategories(true)
      try {
        const parentCategoriesList = await getParentCategories(store.id)
        setDynamicParentCategories(parentCategoriesList)
      } catch (error) {
        console.error('Error cargando categorías:', error)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadData()
  }, [store?.id])

  // Cargar subcategorías cuando se seleccionan categorías padre
  useEffect(() => {
    const loadSubcategories = async () => {
      if (!store?.id || selectedParentCategoryIds.length === 0) {
        setDynamicSubcategories([])
        setSelectedSubcategoryIds([])
        return
      }
      
      setLoadingSubcategories(true)
      try {
        // Cargar subcategorías de todas las categorías seleccionadas
        const allSubcategoriesPromises = selectedParentCategoryIds.map(categoryId => 
          getSubcategories(store.id, categoryId)
        )
        
        const allSubcategoriesArrays = await Promise.all(allSubcategoriesPromises)
        
        // Combinar y eliminar duplicados
        const allSubcategories = allSubcategoriesArrays.flat()
        const uniqueSubcategories = allSubcategories.filter((subcategory, index, array) => 
          array.findIndex(s => s.id === subcategory.id) === index
        )
        
        setDynamicSubcategories(uniqueSubcategories)
        
        // Limpiar subcategorías seleccionadas que ya no son válidas
        setSelectedSubcategoryIds(prev => 
          prev.filter(subId => uniqueSubcategories.some(sub => sub.id === subId))
        )
      } catch (error) {
        console.error('Error cargando subcategorías:', error)
        setDynamicSubcategories([])
      } finally {
        setLoadingSubcategories(false)
      }
    }

    loadSubcategories()
  }, [store?.id, selectedParentCategoryIds])

  // Funciones para manejar selección múltiple
  const handleParentCategoryToggle = (categoryId: string) => {
    setSelectedParentCategoryIds(prev => {
      if (prev.includes(categoryId)) {
        // Remover categoría
        return prev.filter(id => id !== categoryId)
      } else {
        // Agregar categoría
        return [...prev, categoryId]
      }
    })
  }

  const handleSubcategoryToggle = (subcategoryId: string) => {
    setSelectedSubcategoryIds(prev => {
      if (prev.includes(subcategoryId)) {
        // Remover subcategoría
        return prev.filter(id => id !== subcategoryId)
      } else {
        // Agregar subcategoría
        return [...prev, subcategoryId]
      }
    })
  }

  // Funciones auxiliares
  const profit = cost && price ? parseFloat(price) - parseFloat(cost) : 0
  const margin = cost && price && parseFloat(cost) > 0 ? (((parseFloat(price) - parseFloat(cost)) / parseFloat(price)) * 100).toFixed(1) : '0'

  const handleFileUpload = async (files: FileList) => {
    Array.from(files).forEach(async (file) => {
      const fileType = getFileType(file)
      
      if (fileType === 'image' || fileType === 'video') {
        const fileId = Math.random().toString(36).substr(2, 9)
        const tempUrl = URL.createObjectURL(file)
        
        // Agregar archivo con URL temporal
        const newFile: MediaFile = {
          id: fileId,
          url: tempUrl,
          file,
          uploading: true,
          type: fileType,
          resourceType: fileType
        }
        setMediaFiles(prev => [...prev, newFile])
        
        try {
          // Subir a Cloudinary (imagen o video)
          const result = await uploadMediaToCloudinary(file, {
            folder: 'products',
            storeId: store?.id
          })
          
          // Actualizar archivo con URL de Cloudinary
          setMediaFiles(prev => prev.map(f => 
            f.id === fileId ? {
              ...f,
              url: result.secure_url,
              cloudinaryPublicId: result.public_id,
              uploading: false,
              resourceType: result.resource_type
            } : f
          ))
          
        } catch (error) {
          console.error('Error uploading media:', error)
          // Remover archivo si falla la subida
          setMediaFiles(prev => prev.filter(f => f.id !== fileId))
          // TODO: Mostrar error al usuario
        }
      } else {
        // Mostrar error para tipos de archivo no soportados
        console.error('Tipo de archivo no soportado:', file.type)
        // TODO: Mostrar error al usuario
      }
    })
  }

  const removeFile = (id: string) => {
    setMediaFiles(prev => prev.filter(f => f.id !== id))
  }

  const addVariant = () => {
    const newVariant: ProductVariant = {
      id: Math.random().toString(36).substr(2, 9),
      name: '',
      price: parseFloat(price) || 0,
      stock: 0
    }
    setVariants(prev => [...prev, newVariant])
  }

  const updateVariant = (id: string, field: keyof ProductVariant, value: string | number) => {
    setVariants(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id))
  }

  const getMetaFieldsForCategory = () => {
    return META_FIELDS_BY_CATEGORY[selectedCategory] || []
  }

  const findNodeById = (nodes: CategoryNode[], id: string): CategoryNode | null => {
    for (const node of nodes) {
      if (node.id === id) return node
      if (node.children) {
        const found = findNodeById(node.children, id)
        if (found) return found
      }
    }
    return null
  }

  const getCurrentCategories = (): CategoryNode[] => {
    if (categoryPath.length === 0) {
      return CATEGORY_OPTIONS
    }
    
    let current = CATEGORY_OPTIONS
    for (const pathId of categoryPath) {
      const node = current.find((n: CategoryNode) => n.id === pathId)
      if (node?.children) {
        current = node.children
      } else {
        return []
      }
    }
    return current
  }

  const getBreadcrumb = (): string[] => {
    const breadcrumb: string[] = []
    let current = CATEGORY_OPTIONS
    
          for (const pathId of categoryPath) {
        const node = current.find((n: CategoryNode) => n.id === pathId)
        if (node) {
          breadcrumb.push(node.name)
          if (node.children) {
            current = node.children
          }
        }
      }
      return breadcrumb
    }

    const navigateToCategory = (categoryId: string) => {
      const node = findNodeById(CATEGORY_OPTIONS, categoryId)
    if (node) {
      if (node.children && node.children.length > 0) {
        // Si tiene hijos, navegar al siguiente nivel
        setCategoryPath(prev => [...prev, categoryId])
      } else if (node.isLeaf) {
        // Si es una hoja sin hijos, seleccionarlo y cerrar dropdown
        setSelectedCategory(categoryId)
        setMetaFieldValues({})
        setDropdownOpen(false)
      }
    }
  }

  const navigateBack = () => {
    if (categoryPath.length > 0) {
      setCategoryPath(prev => prev.slice(0, -1))
      setSelectedCategory('')
      setMetaFieldValues({})
    }
  }

  const resetNavigation = () => {
    setCategoryPath([])
    setSelectedCategory('')
    setMetaFieldValues({})
    setDropdownOpen(false)
  }

  const handleMetaFieldChange = (fieldId: string, value: string | string[]) => {
    setMetaFieldValues(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  const toggleMetaFieldTag = (fieldId: string, option: string) => {
    setMetaFieldValues(prev => {
      const currentValues = (prev[fieldId] as string[]) || []
      const newValues = currentValues.includes(option)
        ? currentValues.filter(v => v !== option)
        : [...currentValues, option]
      return {
        ...prev,
        [fieldId]: newValues
      }
    })
  }

  const handleSave = async () => {
    if (!store?.id) {
      setSaveError('No se pudo obtener la información de la tienda')
      return
    }

    setSaving(true)
    setSaveError(null)

    try {
      // Generar slug automáticamente si no se proporciona
      const finalSlug = urlSlug || generateSlug(productName)

      // Preparar datos del producto
      const productData = {
        // Información básica
        name: productName.trim(),
        description: description.trim(),
        
        // Multimedia - usar URLs de Cloudinary
        mediaFiles: mediaFiles.map(file => ({
          id: file.id,
          url: file.url,
          cloudinaryPublicId: file.cloudinaryPublicId || null,
          type: file.type,
          resourceType: file.resourceType || file.type
        })),
        
        // Precios
        price: parseFloat(price) || 0,
        comparePrice: comparePrice ? parseFloat(comparePrice) : null,
        cost: cost ? parseFloat(cost) : null,
        chargeTaxes,
        
        // Organización
        selectedBrandId: selectedBrandId || null,
        selectedCategory: selectedCategory || null,
        selectedParentCategoryIds: selectedParentCategoryIds || [],
        selectedSubcategoryIds: selectedSubcategoryIds || [],
        metaFieldValues: metaFieldValues || {},
        
        // Variantes
        hasVariants,
        variants: hasVariants ? variants : [],
        
        // Envío
        requiresShipping,
        weight: weight ? parseFloat(weight) : null,
        countryOrigin: countryOrigin || null,
        harmonizedCode: harmonizedCode || null,
        
        // SEO
        seoTitle: seoTitle || null,
        metaDescription: metaDescription || null,
        urlSlug: finalSlug,
        
        // Estado
        status: productStatus
      }

      // Validar datos del producto
      const validation = validateProduct(productData)
      if (!validation.isValid) {
        setSaveError(`Errores de validación: ${validation.errors.join(', ')}`)
        return
      }

      // Guardar producto en Firebase
      const savedProduct = await createProduct(store.id, productData)
      
      console.log('Producto guardado exitosamente:', savedProduct)
      
      // Redirigir a la página de productos
      router.push('/products')
      
    } catch (error) {
      console.error('Error al guardar producto:', error)
      setSaveError(error instanceof Error ? error.message : 'Error desconocido al guardar el producto')
    } finally {
      setSaving(false)
    }
  }

  // Mostrar loading mientras se cargan los datos de la tienda
  if (storeLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando configuración...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header con botón de regreso */}
          <div className="mb-6">
            <Button
              variant="secondary"
              onClick={() => router.back()}
              className="mb-4"
            >
              {t('backToProducts')}
            </Button>
            <h1 className="text-3xl font-normal text-gray-800">{t('title')}</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Nombre y descripción */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('productInfo')}</h2>
                <div className="space-y-4">
                  <Input
                    label={t('productName')}
                    placeholder={t('productNamePlaceholder')}
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                  <RichTextEditor
                    label={t('description')}
                    value={description}
                    onChange={setDescription}
                    placeholder={t('descriptionPlaceholder')}
                    required={false}
                  />
                </div>
              </Card>

              {/* 2. Multimedia */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('multimedia')}</h2>
                
                {mediaFiles.length === 0 ? (
                  // Vista inicial sin imágenes
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault()
                      if (e.dataTransfer.files) {
                        handleFileUpload(e.dataTransfer.files)
                      }
                    }}
                  >
                    <div className="space-y-2">
                      <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48">
                        <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">{t('uploadHint')}</span>
                      </p>
                      <p className="text-xs text-gray-500">{t('uploadFormats')}</p>
                    </div>
                  </div>
                ) : (
                  // Vista con imágenes tipo Shopify
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex gap-4">
                      {/* Media principal */}
                      <div className="relative group flex-shrink-0">
                        {mediaFiles[0].type === 'video' ? (
                          <video
                            src={mediaFiles[0].url}
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                            controls
                            muted
                            preload="metadata"
                          />
                        ) : (
                          <img
                            src={mediaFiles[0].url}
                            alt="Imagen principal"
                            className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          />
                        )}
                        {mediaFiles[0].uploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">Procesando...</span>
                          </div>
                        )}
                        {/* Indicador de tipo de archivo */}
                        {mediaFiles[0].type === 'video' && (
                          <div className="absolute top-1 left-1 bg-black bg-opacity-70 text-white text-[10px] px-1 rounded">
                            VIDEO
                          </div>
                        )}
                        <button
                          onClick={() => removeFile(mediaFiles[0].id)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ×
                        </button>
                      </div>

                      {/* Miniaturas adicionales */}
                      <div className="flex gap-2 flex-wrap">
                        {mediaFiles.slice(1).map(file => (
                          <div key={file.id} className="relative group">
                            {file.type === 'video' ? (
                              <video
                                src={file.url}
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                                muted
                                preload="metadata"
                              />
                            ) : (
                              <img
                                src={file.url}
                                alt="Media adicional"
                                className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                              />
                            )}
                            {file.uploading && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <span className="text-white text-[10px]">...</span>
                              </div>
                            )}
                            {/* Indicador de tipo de archivo */}
                            {file.type === 'video' && (
                              <div className="absolute top-0 left-0 bg-black bg-opacity-70 text-white text-[8px] px-1 rounded">
                                VID
                              </div>
                            )}
                            <button
                              onClick={() => removeFile(file.id)}
                              className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              ×
                            </button>
                          </div>
                        ))}
                        
                        {/* Botón para agregar más media */}
                        <div
                          className="w-16 h-16 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center cursor-pointer hover:border-gray-400 transition-colors bg-gray-50 hover:bg-gray-100"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                          </svg>
                        </div>
                      </div>
                    </div>
                    
                    {/* Texto indicativo */}
                    <p className="text-xs text-gray-500 mt-3">
                      Acepta imágenes, videos o modelos 3D
                    </p>
                  </div>
                )}
                
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </Card>

              {/* 3. Precios */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('pricing')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('price')} ({currencyName})
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
                      </div>
                      <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder={currency === 'PEN' ? '100.00' : currency === 'USD' ? '25.00' : '100.00'}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('comparePrice')} ({currencyName})
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
                      </div>
                      <input
                        type="number"
                        value={comparePrice}
                        onChange={(e) => setComparePrice(e.target.value)}
                        placeholder={currency === 'PEN' ? '120.00' : currency === 'USD' ? '30.00' : '120.00'}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={chargeTaxes}
                      onChange={(e) => setChargeTaxes(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('chargeTaxes')}</span>
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {t('costPerItem')} ({currencyName})
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-gray-500 sm:text-sm">{currencySymbol}</span>
                      </div>
                      <input
                        type="number"
                        value={cost}
                        onChange={(e) => setCost(e.target.value)}
                        placeholder={currency === 'PEN' ? '50.00' : currency === 'USD' ? '15.00' : '50.00'}
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('profit')}</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                      {formatPrice(profit)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t('margin')}</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                      {margin}%
                    </div>
                  </div>
                </div>
              </Card>

              {/* 4. Organización del producto */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Categorizar producto</h2>
                  {selectedCategory && getMetaFieldsForCategory().length > 0 && (
                    <span className="text-sm text-gray-500">
                      {getMetaFieldsForCategory().length} metacampos
                    </span>
                  )}
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                    
                    {/* Buscador con dropdown navegable */}
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedCategory ? findNodeById(CATEGORY_OPTIONS, selectedCategory)?.name || 'Elige una categoría de producto' : 'Elige una categoría de producto'}
                        readOnly
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="block w-full px-3 py-2 border-2 border-blue-500 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-gray-400">
                          {dropdownOpen ? '▲' : '▼'}
                        </span>
                      </div>
                    </div>

                    {/* Dropdown de navegación */}
                    {dropdownOpen && (
                      <div className="mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto z-50">
                      {/* Breadcrumb si estamos navegando */}
                      {getBreadcrumb().length > 0 && (
                        <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex items-center text-sm text-gray-600">
                          <button
                            onClick={navigateBack}
                            className="flex items-center hover:text-gray-900 mr-2"
                          >
                            ← 
                          </button>
                          <span className="mr-2">{getBreadcrumb().join(' > ')}</span>
                          {selectedCategory && (
                            <span className="text-blue-600 font-medium">
                              {findNodeById(CATEGORY_OPTIONS, selectedCategory)?.name}
                            </span>
                          )}
                        </div>
                      )}

                      {/* Lista de categorías actuales */}
                      <div className="py-2">
                        {getCurrentCategories().map(category => (
                          <div key={category.id}>
                            <div className="flex items-center">
                              {/* Botón principal de navegación */}
                              <div
                                onClick={() => navigateToCategory(category.id)}
                                className={`flex-1 px-4 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${
                                  selectedCategory === category.id ? 'bg-blue-50 text-blue-700' : 'text-gray-900'
                                }`}
                              >
                                <span>{category.name}</span>
                                <div className="flex items-center space-x-2">
                                  {category.isLeaf && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        setSelectedCategory(category.id)
                                        setMetaFieldValues({})
                                        setDropdownOpen(false)
                                      }}
                                      className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200"
                                    >
                                      Seleccionar
                                    </button>
                                  )}
                                  {category.children && category.children.length > 0 && (
                                    <span className="text-gray-400">→</span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {category.isLeaf && selectedCategory === category.id && (
                              <div className="px-4 py-1 bg-green-50 text-green-700 text-sm border-l-2 border-green-200">
                                ✓ Categoría seleccionada
                              </div>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Reset button */}
                      {(categoryPath.length > 0 || selectedCategory) && (
                        <div className="border-t border-gray-200 px-4 py-2">
                          <button
                            onClick={resetNavigation}
                            className="text-sm text-red-600 hover:text-red-800"
                          >
                            ✕ Limpiar selección
                          </button>
                        </div>
                      )}
                      </div>
                    )}
                  </div>

                  {/* Metacampos dinámicos */}
                  {selectedCategory && getMetaFieldsForCategory().length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-md font-medium text-gray-900 mb-3">Características del producto</h3>
                      <div className="space-y-4">
                        {getMetaFieldsForCategory().map(field => (
                          <div key={field.id}>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              {field.name}
                            </label>
                            {field.type === 'tags' && (
                              <div className="flex flex-wrap gap-2">
                                {field.options?.map(option => {
                                  const isSelected = (metaFieldValues[field.id] as string[] || []).includes(option)
                                  return (
                                    <button
                                      key={option}
                                      type="button"
                                      onClick={() => toggleMetaFieldTag(field.id, option)}
                                      className={`px-3 py-1 text-sm border rounded-full transition-colors ${
                                        isSelected
                                          ? 'bg-blue-100 border-blue-300 text-blue-700'
                                          : 'bg-gray-100 hover:bg-gray-200 border-gray-300 text-gray-700'
                                      }`}
                                    >
                                      {option}
                                    </button>
                                  )
                                })}
                              </div>
                            )}
                            {field.type === 'select' && (
                              <select 
                                value={(metaFieldValues[field.id] as string) || ''}
                                onChange={(e) => handleMetaFieldChange(field.id, e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                              >
                                <option value="">Seleccionar</option>
                                {field.options?.map(option => (
                                  <option key={option} value={option}>{option}</option>
                                ))}
                              </select>
                            )}
                            {field.type === 'text' && (
                              <input
                                type="text"
                                value={(metaFieldValues[field.id] as string) || ''}
                                onChange={(e) => handleMetaFieldChange(field.id, e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                placeholder={`Ingrese ${field.name.toLowerCase()}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      
                      {/* Resumen de valores seleccionados */}
                      {Object.keys(metaFieldValues).length > 0 && (
                        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Características seleccionadas:</h4>
                          <div className="space-y-1">
                            {Object.entries(metaFieldValues).map(([fieldId, value]) => {
                              const field = getMetaFieldsForCategory().find(f => f.id === fieldId)
                              if (!field || !value || (Array.isArray(value) && value.length === 0)) return null
                              
                              return (
                                <div key={fieldId} className="text-sm text-gray-600">
                                  <span className="font-medium">{field.name}:</span>{' '}
                                  {Array.isArray(value) ? value.join(', ') : value}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </Card>

              {/* 5. Variantes */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">{t('variants.title')}</h2>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">{t('variants.hasVariants')}</span>
                  </label>
                </div>

                {hasVariants && (
                  <div className="space-y-4">
                    <Button onClick={addVariant} variant="secondary" size="sm">
                      {t('variants.addOption')}
                    </Button>
                    
                    {variants.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variante
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio ({currencyName})
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Disponible
                              </th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {variants.map(variant => (
                              <tr key={variant.id}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="text"
                                    value={variant.name}
                                    onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                    placeholder="Talla 38"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">{currencySymbol}</span>
                                    </div>
                                    <input
                                      type="number"
                                      value={variant.price}
                                      onChange={(e) => updateVariant(variant.id, 'price', parseFloat(e.target.value))}
                                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm"
                                    />
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <input
                                    type="number"
                                    value={variant.stock}
                                    onChange={(e) => updateVariant(variant.id, 'stock', parseInt(e.target.value))}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                                  />
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <button
                                    onClick={() => removeVariant(variant.id)}
                                    className="text-red-600 hover:text-red-900 text-sm"
                                  >
                                    Eliminar
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* 6. Configuraciones avanzadas */}
              <Card className="p-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h2 className="text-lg font-semibold text-gray-900">{t('shipping.title')}</h2>
                  <span className="text-gray-400">
                    {showAdvanced ? '−' : '+'}
                  </span>
                </button>

                {showAdvanced && (
                  <div className="mt-4 space-y-4">
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={requiresShipping}
                        onChange={(e) => setRequiresShipping(e.target.checked)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">{t('shipping.requiresShipping')}</span>
                    </label>

                    {requiresShipping && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                        <Input
                          label={t('shipping.weight')}
                          type="number"
                          placeholder={t('shipping.weightPlaceholder')}
                          value={weight}
                          onChange={(e) => setWeight(e.target.value)}
                        />
                        <Input
                          label={t('shipping.countryOrigin')}
                          placeholder={t('shipping.countryOriginPlaceholder')}
                          value={countryOrigin}
                          onChange={(e) => setCountryOrigin(e.target.value)}
                        />
                        <div className="md:col-span-2">
                          <Input
                            label={t('shipping.harmonizedCode')}
                            placeholder={t('shipping.harmonizedCodePlaceholder')}
                            value={harmonizedCode}
                            onChange={(e) => setHarmonizedCode(e.target.value)}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </Card>

              {/* 7. SEO */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">{t('seo.title')}</h2>
                
                {/* Vista previa de Google */}
                <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Vista previa de la búsqueda de Google</h3>
                  <div className="space-y-1">
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer">
                      {seoTitle || productName || 'Título del producto'}
                    </div>
                    <div className="text-green-700 text-sm">
                      https://{store?.subdomain || 'mi-tienda'}.shopifree.app/products/{urlSlug || 'producto-123'}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {metaDescription || 'Descripción del producto que aparecerá en los resultados de búsqueda...'}
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <Input
                    label={t('seo.pageTitle')}
                    placeholder={t('seo.pageTitlePlaceholder')}
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('seo.metaDescription')}
                    </label>
                    <textarea
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder={t('seo.metaDescriptionPlaceholder')}
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                  </div>
                  <Input
                    label={t('seo.urlHandle')}
                    placeholder={t('seo.urlHandlePlaceholder')}
                    value={urlSlug}
                    onChange={(e) => setUrlSlug(e.target.value)}
                  />
                </div>
              </Card>
            </div>

            {/* Barra lateral */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('status.title')}</h3>
                <select 
                  value={productStatus}
                  onChange={(e) => setProductStatus(e.target.value as 'draft' | 'active' | 'archived')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="draft">{t('status.draft')}</option>
                  <option value="active">{t('status.active')}</option>
                  <option value="archived">{t('status.archived')}</option>
                </select>
              </Card>



              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{t('organization.title')}</h3>
                <p className="text-sm text-gray-500 mb-4">{t('organization.subtitle')}</p>
                <div className="space-y-4">
                  {/* Categorías principales - Selección múltiple */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('organization.mainCategories')} ({selectedParentCategoryIds.length} {t('organization.mainCategoriesSelected')})
                    </label>
                    {loadingCategories ? (
                      <div className="animate-pulse h-10 bg-gray-100 rounded"></div>
                    ) : (
                      <div className="space-y-2 border border-gray-200 rounded-md p-2">
                        {dynamicParentCategories.map((category) => (
                          <label key={category.id} className="flex items-center">
                            <input
                              type="checkbox"
                              checked={selectedParentCategoryIds.includes(category.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedParentCategoryIds([...selectedParentCategoryIds, category.id])
                                } else {
                                  setSelectedParentCategoryIds(selectedParentCategoryIds.filter(id => id !== category.id))
                                }
                              }}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-900">{category.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subcategorías */}
                  {selectedParentCategoryIds.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('organization.subCategories')} ({selectedSubcategoryIds.length} {t('organization.subCategoriesSelected')})
                      </label>
                      {loadingSubcategories ? (
                        <div className="animate-pulse h-10 bg-gray-100 rounded"></div>
                      ) : (
                        <div className="space-y-2 border border-gray-200 rounded-md p-2">
                          {dynamicSubcategories.map((subcategory) => (
                            <label key={subcategory.id} className="flex items-center">
                              <input
                                type="checkbox"
                                checked={selectedSubcategoryIds.includes(subcategory.id)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedSubcategoryIds([...selectedSubcategoryIds, subcategory.id])
                                  } else {
                                    setSelectedSubcategoryIds(selectedSubcategoryIds.filter(id => id !== subcategory.id))
                                  }
                                }}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-900">{subcategory.name}</span>
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Resumen de categorías seleccionadas */}
                  {(selectedParentCategoryIds.length > 0 || selectedSubcategoryIds.length > 0) && (
                    <div className="bg-blue-50 p-4 rounded-md">
                      <h4 className="text-sm font-medium text-blue-900 mb-2">{t('organization.selectedCategories')}</h4>
                      {selectedParentCategoryIds.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs font-medium text-blue-800">{t('organization.mainCategoriesLabel')}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedParentCategoryIds.map(id => {
                              const category = dynamicParentCategories.find(c => c.id === id)
                              return category && (
                                <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {category.name}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                      {selectedSubcategoryIds.length > 0 && (
                        <div>
                          <p className="text-xs font-medium text-blue-800">{t('organization.subCategoriesLabel')}</p>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {selectedSubcategoryIds.map(id => {
                              const subcategory = dynamicSubcategories.find(c => c.id === id)
                              return subcategory && (
                                <span key={id} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                  {subcategory.name}
                                </span>
                              )
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t('organization.brand')}
                    </label>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                      <option value="">{t('organization.brandPlaceholder')}</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <Input label={t('organization.collections')} placeholder="" />
                  <Input label={t('organization.tags')} placeholder="" />
                </div>
              </Card>
            </div>
          </div>

          {/* Botón de guardar fijo */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-8">
            {/* Mostrar errores de guardado */}
            {saveError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{saveError}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
                {t('buttons.discard')}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {t('buttons.saving')}
                  </>
                ) : (
                  t('buttons.save')
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}