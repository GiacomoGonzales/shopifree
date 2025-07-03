'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import DashboardLayout from '../../../../../components/DashboardLayout'
import { RichTextEditor } from '../../../../../components/RichTextEditor'
import { useStore } from '../../../../../lib/hooks/useStore'
import { getBrands, type BrandWithId } from '../../../../../lib/brands'
import { getParentCategories, getSubcategories, type CategoryWithId } from '../../../../../lib/categories'
import { getProduct, updateProduct, generateSlug, validateProduct, type ProductWithId } from '../../../../../lib/products'
import { uploadImageToCloudinary } from '../../../../../lib/cloudinary'
import { Card } from '../../../../../../../packages/ui/src/components/Card'
import { Button } from '../../../../../../../packages/ui/src/components/Button'
import { Input } from '../../../../../../../packages/ui/src/components/Input'
import { Product } from '@/lib/products'
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
}

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.productId as string
  const { store, loading: storeLoading, currency, currencySymbol, currencyName, formatPrice } = useStore()
  
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  
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
  const [selectedCategory, setSelectedCategory] = useState('')
  const [metaFieldValues, setMetaFieldValues] = useState<Record<string, string | string[]>>({})
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [seoTitle, setSeoTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [urlSlug, setUrlSlug] = useState('')
  const [countryOrigin, setCountryOrigin] = useState('')
  const [harmonizedCode, setHarmonizedCode] = useState('')
  const [status, setStatus] = useState<'draft' | 'active' | 'archived'>('draft')

  // Ref para el input de archivos
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Cargar producto
  useEffect(() => {
    const loadProduct = async () => {
      if (!store?.id || !productId) return
      
      try {
        setLoading(true)
        const productData = await getProduct(store.id, productId)
        
        if (!productData) {
          setError('Producto no encontrado')
          return
        }

        // Product data loaded successfully
        
        // Prellenar todos los campos del formulario
        setProductName(productData.name)
        setDescription(productData.description)
        setSelectedBrandId(productData.selectedBrandId || '')
        setPrice(productData.price.toString())
        setComparePrice(productData.comparePrice?.toString() || '')
        setCost(productData.cost?.toString() || '')
        setChargeTaxes(productData.chargeTaxes)
        setRequiresShipping(productData.requiresShipping)
        setWeight(productData.weight?.toString() || '')
        setHasVariants(productData.hasVariants)
        setVariants(productData.variants || [])
        setSelectedCategory(productData.selectedCategory || '')
        setSelectedParentCategoryIds(productData.selectedParentCategoryIds || [])
        setSelectedSubcategoryIds(productData.selectedSubcategoryIds || [])
        setMetaFieldValues(productData.metaFieldValues || {})
        setSeoTitle(productData.seoTitle || '')
        setMetaDescription(productData.metaDescription || '')
        setUrlSlug(productData.urlSlug || '')
        setCountryOrigin(productData.countryOrigin || '')
        setHarmonizedCode(productData.harmonizedCode || '')
        setStatus(productData.status)
        
        // Convertir mediaFiles
        const convertedMediaFiles: MediaFile[] = productData.mediaFiles.map(file => ({
          id: file.id,
          url: file.url,
          cloudinaryPublicId: file.cloudinaryPublicId || undefined,
          uploading: false
        }))
        setMediaFiles(convertedMediaFiles)
        
      } catch (err) {
        console.error('Error cargando producto:', err)
        setError('Error al cargar el producto')
      } finally {
        setLoading(false)
      }
    }

    if (!storeLoading && store?.id) {
      loadProduct()
    }
  }, [store?.id, productId, storeLoading])

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
      if (file.type.startsWith('image/')) {
        const fileId = Math.random().toString(36).substr(2, 9)
        const tempUrl = URL.createObjectURL(file)
        
        // Agregar archivo con URL temporal
        const newFile: MediaFile = {
          id: fileId,
          url: tempUrl,
          file,
          uploading: true
        }
        setMediaFiles(prev => [...prev, newFile])
        
        try {
          // Subir a Cloudinary
          const result = await uploadImageToCloudinary(file, {
            folder: 'products',
            storeId: store?.id
          })
          
          // Actualizar archivo con URL de Cloudinary
          setMediaFiles(prev => prev.map(f => 
            f.id === fileId ? {
              id: fileId,
              url: result.secure_url,
              cloudinaryPublicId: result.public_id,
              uploading: false
            } : f
          ))
          
        } catch (error) {
          console.error('Error uploading image:', error)
          // Remover archivo si falla la subida
          setMediaFiles(prev => prev.filter(f => f.id !== fileId))
        }
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

  const handleSave = async () => {
    if (!store?.id || !productId) {
      setError('No se pudo obtener la información de la tienda')
      return
    }

    setSaving(true)
    setError(null)

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
          cloudinaryPublicId: file.cloudinaryPublicId || null
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
        status: status
      }

      // Validar datos del producto
      const validation = validateProduct(productData)
      if (!validation.isValid) {
        setError(`Errores de validación: ${validation.errors.join(', ')}`)
        return
      }

      // Actualizar producto en Firebase
      await updateProduct(store.id, productId, productData)
      
      console.log('Producto actualizado exitosamente')
      
      // Redirigir a la página de productos
      router.push('/products')
      
    } catch (err) {
      console.error('Error al actualizar producto:', err)
      setError(err instanceof Error ? err.message : 'Error desconocido al actualizar el producto')
    } finally {
      setSaving(false)
    }
  }

  if (storeLoading || loading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
                <p className="mt-2 text-sm text-gray-600">Cargando producto...</p>
              </div>
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (error) {
    return (
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="text-red-500 text-lg font-medium">{error}</div>
                <Button 
                  onClick={() => router.push('/products')}
                  variant="secondary"
                  className="mt-4"
                >
                  Volver a productos
                </Button>
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
              ← Volver a productos
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Editar producto</h1>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Columna principal */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* 1. Nombre y descripción */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Información del producto</h2>
                <div className="space-y-4">
                  <Input
                    label="Nombre del producto"
                    placeholder="Camiseta de manga corta"
                    value={productName}
                    onChange={(e) => setProductName(e.target.value)}
                    required
                  />
                  <RichTextEditor
                    label="Descripción"
                    value={description}
                    onChange={setDescription}
                    placeholder="Describe tu producto con formato de texto enriquecido..."
                    required={false}
                  />
                </div>
              </Card>

              {/* 2. Multimedia */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Multimedia</h2>
                
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
                        <span className="font-medium">Haz clic para subir</span> o arrastra y suelta
                      </p>
                      <p className="text-xs text-gray-500">PNG, JPG hasta 10MB</p>
                    </div>
                  </div>
                ) : (
                  // Vista con imágenes tipo Shopify
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                    <div className="flex gap-4">
                      {/* Imagen principal */}
                      <div className="relative group flex-shrink-0">
                        <img
                          src={mediaFiles[0].url}
                          alt="Imagen principal"
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                        />
                        {mediaFiles[0].uploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                            <span className="text-white text-xs">Procesando...</span>
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
                            <img
                              src={file.url}
                              alt="Imagen adicional"
                              className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                            />
                            {file.uploading && (
                              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
                                <span className="text-white text-[10px]">...</span>
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
                        
                        {/* Botón para agregar más imágenes */}
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
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
                />
              </Card>

              {/* 3. Precios */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Precios</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Precio ({currencyName})
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
                      Precio de comparación ({currencyName})
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
                    <span className="ml-2 text-sm text-gray-700">Cobrar impuestos sobre este producto</span>
                  </label>
                </div>

                <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Coste por artículo ({currencyName})
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Beneficio</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                      {formatPrice(profit)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Margen</label>
                    <div className="px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-sm text-gray-900">
                      {margin}%
                    </div>
                  </div>
                </div>
              </Card>

              {/* 4. Variantes */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Variantes</h2>
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={hasVariants}
                      onChange={(e) => setHasVariants(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-700">Este producto tiene variantes</span>
                  </label>
                </div>

                {hasVariants && (
                  <div className="space-y-4">
                    <Button onClick={addVariant} variant="secondary" size="sm">
                      + Agregar otra opción
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

              {/* 5. SEO */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Optimización para motores de búsqueda</h2>
                
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
                    label="Título de la página"
                    placeholder="Título que aparecerá en Google"
                    value={seoTitle}
                    onChange={(e) => setSeoTitle(e.target.value)}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meta descripción
                    </label>
                    <textarea
                      rows={3}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      placeholder="Descripción que aparecerá en los resultados de búsqueda..."
                      value={metaDescription}
                      onChange={(e) => setMetaDescription(e.target.value)}
                    />
                  </div>
                  <Input
                    label="Identificador de URL"
                    placeholder="producto-123"
                    value={urlSlug}
                    onChange={(e) => setUrlSlug(e.target.value)}
                  />
                </div>
              </Card>
            </div>

            {/* Barra lateral */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Estado</h3>
                <select 
                  value={status}
                  onChange={(e) => setStatus(e.target.value as 'draft' | 'active' | 'archived')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                >
                  <option value="draft">Borrador</option>
                  <option value="active">Activo</option>
                  <option value="archived">Archivado</option>
                </select>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Organización del producto</h3>
                <div className="space-y-4">
                  {/* Categorías principales - Selección múltiple */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Categorías ({selectedParentCategoryIds.length} seleccionadas)
                    </label>
                    {loadingCategories ? (
                      <p className="text-sm text-gray-500">Cargando categorías...</p>
                    ) : (
                      <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                        {dynamicParentCategories.length === 0 ? (
                          <p className="text-sm text-gray-500 text-center py-2">No hay categorías disponibles</p>
                        ) : (
                          dynamicParentCategories.map(category => (
                            <label key={category.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                              <input
                                type="checkbox"
                                checked={selectedParentCategoryIds.includes(category.id)}
                                onChange={() => handleParentCategoryToggle(category.id)}
                                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{category.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subcategorías - Solo si hay categorías seleccionadas */}
                  {selectedParentCategoryIds.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategorías ({selectedSubcategoryIds.length} seleccionadas)
                      </label>
                      {loadingSubcategories ? (
                        <p className="text-sm text-gray-500">Cargando subcategorías...</p>
                      ) : (
                        <div className="space-y-2 max-h-40 overflow-y-auto border border-gray-300 rounded-md p-2">
                          {dynamicSubcategories.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-2">
                              {selectedParentCategoryIds.length === 0 
                                ? 'Selecciona una categoría primero' 
                                : 'Las categorías seleccionadas no tienen subcategorías'
                              }
                            </p>
                          ) : (
                            dynamicSubcategories.map(subcategory => (
                              <label key={subcategory.id} className="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-1 rounded">
                                <input
                                  type="checkbox"
                                  checked={selectedSubcategoryIds.includes(subcategory.id)}
                                  onChange={() => handleSubcategoryToggle(subcategory.id)}
                                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="text-sm text-gray-700">{subcategory.name}</span>
                              </label>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                    <select
                      value={selectedBrandId}
                      onChange={(e) => setSelectedBrandId(e.target.value)}
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                      disabled={loadingBrands}
                    >
                      <option value="">Seleccionar marca</option>
                      {brands.map(brand => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                    {loadingBrands && (
                      <p className="mt-1 text-sm text-gray-500">Cargando marcas...</p>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>

          {/* Botón de guardar fijo */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 mt-8">
            {/* Mostrar errores de guardado */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
                Cancelar
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Guardando...
                  </>
                ) : (
                  'Guardar cambios'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
} 