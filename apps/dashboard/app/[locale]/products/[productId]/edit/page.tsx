'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import DashboardLayout from '../../../../../components/DashboardLayout'
import { RichTextEditor } from '../../../../../components/RichTextEditor'
import { useStore } from '../../../../../lib/hooks/useStore'
import { getBrands, type BrandWithId } from '../../../../../lib/brands'
import { getParentCategories, getSubcategories, type CategoryWithId } from '../../../../../lib/categories'
import { getProduct, updateProduct, generateSlug, validateProduct } from '../../../../../lib/products'
import { uploadMediaToCloudinary, getFileType } from '../../../../../lib/cloudinary'
import { Card } from '../../../../../../../packages/ui/src/components/Card'
import { Button } from '../../../../../../../packages/ui/src/components/Button'
import { Input } from '../../../../../../../packages/ui/src/components/Input'
// Interfaces
interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
  // Nuevos campos para variantes avanzadas
  attributes?: Record<string, string>  // ej: { color: "Rojo", talla: "S" }
  available?: boolean                   // si esta combinación está disponible
  sku?: string                         // SKU opcional para esta variante
}

interface MediaFile {
  id: string
  url: string
  file?: File
  cloudinaryPublicId?: string
  uploading: boolean
  type: 'image' | 'video'
}

export default function EditProductPage() {
  const t = useTranslations('pages.categories')
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
  const [cost, setCost] = useState('')
  const [chargeTaxes, setChargeTaxes] = useState(false)
  
  // Estados para manejo de stock
  const [trackStock, setTrackStock] = useState(false)
  const [stockQuantity, setStockQuantity] = useState('')
  const [requiresShipping, setRequiresShipping] = useState(true)
  const [weight, setWeight] = useState('')
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  
  // Estados para configurador RedireDi
  const [variationType1, setVariationType1] = useState('')
  const [variationType1Custom, setVariationType1Custom] = useState('')
  const [variationType1Options, setVariationType1Options] = useState<string[]>([])
  const [hasSecondVariation, setHasSecondVariation] = useState(false)
  const [variationType2, setVariationType2] = useState('')
  const [variationType2Custom, setVariationType2Custom] = useState('')
  const [variationType2Options, setVariationType2Options] = useState<string[]>([])
  const inputRefs1 = useRef<(HTMLInputElement | null)[]>([])
  const inputRefs2 = useRef<(HTMLInputElement | null)[]>([])
  
  // Estados para variantes avanzadas (atributos) - DEPRECATED
  const [useAdvancedVariants, setUseAdvancedVariants] = useState(false)
  const [variantAttributes, setVariantAttributes] = useState<Array<{ name: string; values: string[] }>>([])
  const [showAttributeInput, setShowAttributeInput] = useState(false)
  const [newAttributeName, setNewAttributeName] = useState('')
  const [attributeInputValues, setAttributeInputValues] = useState<Record<number, string>>({})
  
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
        setCost(productData.cost?.toString() || '')
        setChargeTaxes(productData.chargeTaxes)
        
        // Inicializar campos de stock
        setTrackStock(productData.trackStock || false)
        setStockQuantity(productData.stockQuantity?.toString() || '')
        setRequiresShipping(productData.requiresShipping)
        setWeight(productData.weight?.toString() || '')
        setHasVariants(productData.hasVariants)
        setVariants(productData.variants || [])
        
        // Cargar campos de variantes avanzadas si existen
        setUseAdvancedVariants(productData.useAdvancedVariants || false)
        setVariantAttributes(productData.variantAttributes || [])
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
        
        // Inicializar variationType1Options si no existe
        if (variationType1Options.length === 0) {
          setVariationType1Options(['', ''])
        }
        
        // Convertir mediaFiles
        const convertedMediaFiles: MediaFile[] = productData.mediaFiles.map(file => ({
          id: file.id,
          url: file.url,
          cloudinaryPublicId: file.cloudinaryPublicId || undefined,
          uploading: false,
          type: file.url.includes('.mp4') || file.url.includes('.webm') || file.url.includes('.mov') ? 'video' : 'image'
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
          type: fileType
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
              uploading: false
            } : f
          ))
          
        } catch (error) {
          console.error('Error uploading media:', error)
          // Remover archivo si falla la subida
          setMediaFiles(prev => prev.filter(f => f.id !== fileId))
        }
      } else {
        // Mostrar error para tipos de archivo no soportados
        console.error('Tipo de archivo no soportado:', file.type)
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

  const updateVariant = (id: string, field: keyof ProductVariant, value: string | number | boolean) => {
    setVariants(prev => prev.map(v => 
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  // Función para alternar disponibilidad de una variante
  const toggleVariantAvailability = (id: string) => {
    setVariants(prev => prev.map(v => 
      v.id === id ? { ...v, available: !v.available } : v
    ))
  }

  const removeVariant = (id: string) => {
    setVariants(prev => prev.filter(v => v.id !== id))
  }

  // Función para generar matriz de combinaciones estilo RedireDi
  const generateVariantMatrix = () => {
    // Guardar la posición actual del scroll
    const currentScrollY = window.scrollY
    
    // Filtrar opciones que tienen contenido
    const validOptions1 = variationType1Options.filter(opt => opt.trim() !== '')
    const validOptions2 = hasSecondVariation ? variationType2Options.filter(opt => opt.trim() !== '') : []
    
    if (validOptions1.length === 0) return

    // Limpiar variantes existentes
    setVariants([])
    
    const newVariants: ProductVariant[] = []
    
    if (hasSecondVariation && validOptions2.length > 0) {
      // Generar combinaciones de dos tipos
      validOptions1.forEach((option1, index1) => {
        validOptions2.forEach((option2, index2) => {
          const variantId = `variant-${Date.now()}-${index1}-${index2}`
          const type1Name = variationType1 === 'otro' ? variationType1Custom : variationType1
          const type2Name = variationType2 === 'otro' ? variationType2Custom : variationType2
          
          newVariants.push({
            id: variantId,
            name: `${option1} - ${option2}`,
            attributes: {
              [type1Name]: option1,
              [type2Name]: option2
            },
            price: parseFloat(price) || 0, // Precio base del producto
            stock: 0,
            available: true,
            sku: `${option1.slice(0, 3).toUpperCase()}-${option2.slice(0, 3).toUpperCase()}`
          })
        })
      })
    } else {
      // Generar variantes de un solo tipo
      validOptions1.forEach((option1, index1) => {
        const variantId = `variant-${Date.now()}-${index1}`
        const type1Name = variationType1 === 'otro' ? variationType1Custom : variationType1
        
        newVariants.push({
          id: variantId,
          name: option1,
          attributes: {
            [type1Name]: option1
          },
          price: parseFloat(price) || 0, // Precio base del producto
          stock: 0,
          available: true,
          sku: option1.slice(0, 6).toUpperCase().replace(/[^A-Z0-9]/g, '')
        })
      })
    }
    
    console.log('✅ Matriz generada:', newVariants.length, 'variantes')
    setVariants(newVariants)
    
    // Restaurar la posición del scroll después de que se rendericen las variantes
    setTimeout(() => {
      window.scrollTo(0, currentScrollY)
    }, 10)
  }

  // Funciones para manejar atributos de variantes
  const addVariantAttribute = () => {
    if (newAttributeName.trim()) {
      const newAttribute = {
        name: newAttributeName.trim(),
        values: []
      }
      const newIndex = variantAttributes.length
      setVariantAttributes(prev => [...prev, newAttribute])
      
      // Inicializar el estado del input para este nuevo atributo
      setAttributeInputValues(prev => ({
        ...prev,
        [newIndex]: ''
      }))
      
      setNewAttributeName('')
      setShowAttributeInput(false)
    }
  }

  const updateAttributeValues = (attributeIndex: number, values: string[]) => {
    setVariantAttributes(prev => prev.map((attr, index) => 
      index === attributeIndex ? { ...attr, values } : attr
    ))
  }

  const updateAttributeInputValue = (attributeIndex: number, inputValue: string) => {
    setAttributeInputValues(prev => ({
      ...prev,
      [attributeIndex]: inputValue
    }))
    
    // Procesar los valores si contiene comas
    const values = inputValue.split(',').map(v => v.trim()).filter(v => v !== '')
    updateAttributeValues(attributeIndex, values)
  }

  const removeVariantAttribute = (attributeIndex: number) => {
    setVariantAttributes(prev => prev.filter((_, index) => index !== attributeIndex))
    // Limpiar el estado del input también
    setAttributeInputValues(prev => {
      const newValues = { ...prev }
      delete newValues[attributeIndex]
      return newValues
    })
  }

  // Función para obtener metadatos disponibles que pueden usarse como atributos de variantes
  const getAvailableMetadataForVariants = () => {
    const variantCompatibleFields = ['color', 'size_clothing', 'size_shoes', 'size', 'material', 'style']
    const availableMetadata: Array<{ id: string; name: string; values: string[] }> = []

    // Revisar metaFieldValues actuales
    Object.entries(metaFieldValues).forEach(([fieldId, fieldValue]) => {
      if (variantCompatibleFields.includes(fieldId) && fieldValue) {
        const values = Array.isArray(fieldValue) ? fieldValue : [fieldValue]
        if (values.length > 1) { // Solo si hay múltiples opciones para hacer variantes
          // Necesitamos obtener el nombre del field, por ahora usaremos el ID
          availableMetadata.push({
            id: fieldId,
            name: fieldId.charAt(0).toUpperCase() + fieldId.slice(1).replace('_', ' '), // Capitalize
            values: values.filter(v => v.trim() !== '')
          })
        }
      }
    })

    return availableMetadata
  }

  // Función para importar metadatos como atributos de variantes
  const importMetadataAsAttribute = (metadataId: string) => {
    const metadata = getAvailableMetadataForVariants().find(m => m.id === metadataId)
    if (metadata) {
      // Verificar que no existe ya este atributo
      const existingAttribute = variantAttributes.find(attr => 
        attr.name.toLowerCase() === metadata.name.toLowerCase()
      )
      
      if (!existingAttribute) {
        const newAttribute = {
          name: metadata.name,
          values: metadata.values
        }
        const newIndex = variantAttributes.length
        setVariantAttributes(prev => [...prev, newAttribute])
        
        // Inicializar el estado del input para este atributo
        setAttributeInputValues(prev => ({
          ...prev,
          [newIndex]: metadata.values.join(', ')
        }))
      }
    }
  }

  // Función para importar todos los metadatos disponibles
  const importAllAvailableMetadata = () => {
    const availableMetadata = getAvailableMetadataForVariants()
    availableMetadata.forEach(metadata => {
      importMetadataAsAttribute(metadata.id)
    })
  }

  // Función para generar todas las combinaciones posibles de atributos
  const generateVariantCombinations = () => {
    if (variantAttributes.length === 0) return []

    // Función recursiva para generar producto cartesiano
    const cartesianProduct = (arrays: string[][]): string[][] => {
      return arrays.reduce((acc, curr) => 
        acc.flatMap(x => curr.map(y => [...x, y])),
        [[]] as string[][]
      )
    }

    // Obtener solo arrays de valores
    const attributeValues = variantAttributes.map(attr => attr.values)
    const combinations = cartesianProduct(attributeValues)

    // Convertir combinaciones a variantes
    return combinations.map((combination, index) => {
      // Crear objeto de atributos
      const attributes: Record<string, string> = {}
      combination.forEach((value, attrIndex) => {
        const attributeName = variantAttributes[attrIndex].name.toLowerCase()
        attributes[attributeName] = value
      })

      // Crear nombre descriptivo
      const displayName = combination.join(' - ')

      // Generar SKU automático
      const skuSuffix = combination.map(val => 
        val.slice(0, 3).toUpperCase().replace(/[^A-Z0-9]/g, '')
      ).join('-')

      return {
        id: `generated-${index}`,
        name: displayName,
        attributes: attributes,
        price: parseFloat(price) || 0, // Usar precio base del producto
        stock: 0,
        available: true, // Por defecto disponible
        sku: skuSuffix
      }
    })
  }

  // Función para aplicar las combinaciones generadas a las variantes
  const generateVariantsFromAttributes = () => {
    const generatedVariants = generateVariantCombinations()
    setVariants(generatedVariants)
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
        cost: cost ? parseFloat(cost) : null,
        chargeTaxes,
        
        // Stock
        trackStock,
        stockQuantity: trackStock ? parseInt(stockQuantity) || 0 : null,
        
        // Organización
        selectedBrandId: selectedBrandId || null,
        selectedCategory: selectedCategory || null,
        selectedParentCategoryIds: selectedParentCategoryIds || [],
        selectedSubcategoryIds: selectedSubcategoryIds || [],
        metaFieldValues: metaFieldValues || {},
        
        // Variantes
        hasVariants,
        variants: hasVariants ? variants.filter(v => v.available !== false) : [], // Solo guardar variantes disponibles
        
        // Nuevos campos para variantes avanzadas
        useAdvancedVariants: hasVariants ? useAdvancedVariants : false,
        variantAttributes: hasVariants && useAdvancedVariants ? variantAttributes : [],
        
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
                      <p className="text-xs text-gray-500">PNG, JPG hasta 10MB • MP4, WebM hasta 50MB</p>
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
                </div>
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={chargeTaxes}
                      onChange={(e) => setChargeTaxes(e.target.checked)}
                      className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
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

              {/* 4. Inventario y variaciones */}
              <Card className="p-6">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-2">Inventario y variaciones</h2>
                  <p className="text-sm text-gray-500">
                    Configura el stock y las variaciones de tu producto
                  </p>
                </div>

                {/* Primera pregunta: Rastrear inventario */}
                <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={trackStock}
                      onChange={(e) => setTrackStock(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">Rastrear inventario de este producto</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">Si no está activado, el producto siempre aparecerá como disponible</p>
                </div>

                {/* Pregunta principal tipo RedireDi */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">¿Este producto tiene variaciones?</h3>
                  <div className="space-y-3">
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="hasVariations"
                        value="no"
                        checked={!hasVariants}
                        onChange={() => setHasVariants(false)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">No, es un producto simple</span>
                        <p className="text-sm text-gray-500">Solo necesita precio y stock general</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="hasVariations"
                        value="yes"
                        checked={hasVariants}
                        onChange={() => setHasVariants(true)}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">Sí, tiene variaciones</span>
                        <p className="text-sm text-gray-500">Diferentes colores, tallas, pesos, etc.</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Bifurcación: Stock simple vs Configurador de variantes */}
                {!hasVariants ? (
                  /* STOCK SIMPLE - Producto sin variaciones */
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">Existencias del producto</h4>
                    {!trackStock && (
                      <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          ⚠️ El rastreo de inventario está desactivado. El producto siempre aparecerá como disponible.
                        </p>
                      </div>
                    )}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Stock disponible</label>
                        <input
                          type="number"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                          className={`block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 ${!trackStock ? 'bg-gray-100 text-gray-400' : ''}`}
                          placeholder="0"
                          disabled={!trackStock}
                        />
                      </div>
                    </div>
                  </div>
                ) : variants.length > 0 ? (
                  /* Mensaje simple cuando ya se generó la matriz */
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-green-800">
                        ✅ Matriz generada. Configura precios y stock abajo.
                      </span>
                      <Button
                        onClick={() => {
                          setVariants([])
                          setVariationType1('')
                          setVariationType1Options([])
                          setVariationType2('')
                          setVariationType2Options([])
                          setHasSecondVariation(false)
                        }}
                        variant="secondary"
                        size="sm"
                        className="text-green-700 border-green-300"
                      >
                        Reconfigurar
                      </Button>
                    </div>
                  </div>
                ) : hasVariants ? (
                  /* CONFIGURADOR DE VARIANTES estilo RedireDi */
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 space-y-6">
                    <h4 className="text-md font-medium text-blue-900">Configurador de variaciones</h4>
                    {!trackStock && (
                      <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800">
                          ⚠️ El rastreo de inventario está desactivado. Los campos de stock estarán bloqueados.
                        </p>
                      </div>
                    )}
                    
                    {/* Paso 1: Tipo principal de variación */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        Paso 1: Selecciona el tipo principal de variación
                      </label>
                      <div className="flex flex-wrap gap-3">
                        {/* Pastilla Color */}
                        <button
                          type="button"
                          onClick={() => {
                            setVariationType1('color')
                            setVariationType1Custom('')
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            variationType1 === 'color'
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Color
                        </button>
                        
                        {/* Pastilla Talla */}
                        <button
                          type="button"
                          onClick={() => {
                            setVariationType1('talla')
                            setVariationType1Custom('')
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            variationType1 === 'talla'
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Talla
                        </button>
                        
                        {/* Pastilla Otro */}
                        <button
                          type="button"
                          onClick={() => {
                            if (variationType1 !== 'otro') {
                              setVariationType1('otro')
                              setVariationType1Custom('')
                            }
                          }}
                          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                            variationType1 === 'otro'
                              ? 'bg-blue-500 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          Otro
                        </button>
                      </div>
                      
                      {/* Input para tipo personalizado */}
                      {variationType1 === 'otro' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={variationType1Custom}
                            onChange={(e) => setVariationType1Custom(e.target.value)}
                            placeholder="Escribe el nombre del tipo (ej: Peso, Material, Capacidad)"
                            className="block w-full px-3 py-2 border border-blue-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 bg-blue-50"
                          />
                        </div>
                      )}
                    </div>

                    {/* Paso 2: Opciones del tipo principal */}
                    {((variationType1 && variationType1 !== 'otro') || (variationType1 === 'otro' && variationType1Custom.trim())) && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          Paso 2: Define las opciones de {variationType1 === 'otro' ? variationType1Custom : variationType1}
                        </label>
                        <div className="space-y-2">
                          {variationType1Options.map((option, index) => (
                            <div key={index} className="flex gap-2 items-center">
                              <input
                                ref={(el) => inputRefs1.current[index] = el}
                                type="text"
                                value={option}
                                onChange={(e) => {
                                  const newOptions = [...variationType1Options]
                                  newOptions[index] = e.target.value
                                  setVariationType1Options(newOptions)
                                  // Mantener el foco después del cambio
                                  setTimeout(() => {
                                    inputRefs1.current[index]?.focus()
                                  }, 0)
                                }}
                                placeholder="Ej: Rojo"
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                              />
                              {variationType1Options.length > 1 && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    const newOptions = variationType1Options.filter((_, i) => i !== index)
                                    setVariationType1Options(newOptions)
                                  }}
                                  className="px-2 py-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-md transition-colors"
                                  title="Eliminar opción"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                  </svg>
                                </button>
                              )}
                            </div>
                          ))}
                          
                          {/* Botón para agregar más opciones */}
                          <button
                            type="button"
                            onClick={() => setVariationType1Options([...variationType1Options, ''])}
                            className="w-full px-3 py-2 border border-dashed border-gray-300 rounded-md text-sm text-gray-500 hover:border-gray-400 hover:text-gray-700 transition-colors"
                          >
                            + Agregar opción
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Botón generar matriz */}
                    {variationType1Options.filter(opt => opt.trim() !== '').length > 0 && 
                     (!hasSecondVariation || 
                      (((variationType2 && variationType2 !== 'otro') || (variationType2 === 'otro' && variationType2Custom.trim())) && 
                       variationType2Options.filter(opt => opt.trim() !== '').length > 0)) && (
                      <div className="pt-4 border-t border-gray-200">
                        <Button 
                          onClick={generateVariantMatrix}
                          className="w-full"
                        >
                          Generar matriz de variaciones 
                          ({hasSecondVariation ? 
                            variationType1Options.filter(opt => opt.trim() !== '').length * variationType2Options.filter(opt => opt.trim() !== '').length : 
                            variationType1Options.filter(opt => opt.trim() !== '').length} combinaciones)
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}
                
                {/* Tabla de variantes existente (ahora solo se muestra si hay variantes) */}
                {hasVariants && variants.length > 0 && (
                  <div className="space-y-4">
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-900">
                        Variantes ({variants.length})
                      </h4>
                      {!trackStock && (
                        <div className="mt-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                          <p className="text-sm text-yellow-800">
                            ⚠️ El rastreo de inventario está desactivado. Los campos de stock están bloqueados.
                          </p>
                        </div>
                      )}
                    </div>
                    
                    {/* Tabla de variantes */}
                    {variants.length > 0 && (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Variante
                              </th>
                              <th className="w-32 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Precio ({currencyName})
                              </th>
                              <th className="w-24 px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Stock
                              </th>
                              <th className="w-16 px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                <span className="sr-only">Acciones</span>
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {variants.map(variant => (
                              <tr key={variant.id} className={variant.available === false ? 'bg-gray-50 opacity-60' : ''}>
                                {/* Nombre de variante */}
                                <td className="px-4 py-3">
                                  {variant.attributes ? (
                                    <div>
                                      <div className="text-sm font-medium text-gray-900 mb-1">{variant.name}</div>
                                      <div className="flex flex-wrap gap-1">
                                        {Object.entries(variant.attributes).map(([key, value]) => (
                                          <span key={key} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-medium">
                                            {value}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  ) : (
                                    <input
                                      type="text"
                                      value={variant.name}
                                      onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                      className="block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                                      placeholder="Ej: Talla S, Color Rojo, 20kg"
                                    />
                                  )}
                                </td>
                                
                                {/* Precio */}
                                <td className="px-4 py-3">
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-xs">{currencySymbol}</span>
                                    </div>
                                    <input
                                      type="number"
                                      value={variant.price === 0 ? '' : variant.price}
                                      onChange={(e) => {
                                        const value = e.target.value === '' ? 0 : parseFloat(e.target.value) || 0
                                        updateVariant(variant.id, 'price', value)
                                      }}
                                      onFocus={(e) => {
                                        if (e.target.value === '0') {
                                          e.target.select()
                                        }
                                      }}
                                      className="block w-full pl-8 pr-2 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500"
                                      min="0"
                                      step="0.01"
                                      disabled={variant.available === false}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </td>
                                
                                {/* Stock */}
                                <td className="px-4 py-3">
                                  <input
                                    type="number"
                                    value={variant.stock === 0 ? '' : variant.stock}
                                    onChange={(e) => {
                                      const value = e.target.value === '' ? 0 : parseInt(e.target.value) || 0
                                      updateVariant(variant.id, 'stock', value)
                                    }}
                                    onFocus={(e) => {
                                      if (e.target.value === '0') {
                                        e.target.select()
                                      }
                                    }}
                                    className={`block w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-primary-500 focus:border-primary-500 ${(!trackStock || variant.available === false) ? 'bg-gray-100 text-gray-400' : ''}`}
                                    min="0"
                                    disabled={!trackStock || variant.available === false}
                                    placeholder="0"
                                  />
                                </td>
                                
                                {/* Acciones */}
                                <td className="px-3 py-3 text-center">
                                  <button
                                    onClick={() => removeVariant(variant.id)}
                                    className="inline-flex items-center justify-center w-8 h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                    title="Eliminar variante"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
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
                      https://{store?.subdomain || 'mi-tienda'}.shopifree.app/producto/{urlSlug || 'producto-123'}
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
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
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
                      <p className="text-sm text-gray-500">{t('loadingCategories')}</p>
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
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                              />
                              <span className="text-sm text-gray-700">{category.name}</span>
                            </label>
                          ))
                        )}
                      </div>
                    )}
                  </div>

                  {/* Subcategorías - Solo mostrar si hay categorías padre seleccionadas */}
                  {selectedParentCategoryIds.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subcategorías ({selectedSubcategoryIds.length} seleccionadas)
                      </label>
                      {loadingSubcategories ? (
                        <p className="text-sm text-gray-500">Cargando subcategorías...</p>
                      ) : dynamicSubcategories.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-2 border border-gray-200 rounded-md">
                          No hay subcategorías disponibles para las categorías seleccionadas
                        </p>
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
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
                              />
                              <span className="ml-2 text-sm text-gray-900">{subcategory.name}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      {/* Mostrar subcategorías seleccionadas */}
                      {selectedSubcategoryIds.length > 0 && (
                        <div className="mt-2">
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

                  {/* Marcas */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marca</label>
                    {loadingBrands ? (
                      <p className="text-sm text-gray-500">Cargando marcas...</p>
                    ) : (
                      <select
                        value={selectedBrandId}
                        onChange={(e) => setSelectedBrandId(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
                      >
                        <option value="">Sin marca</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.id}>{brand.name}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>
              </Card>
            </div>
          </div>
          
          {/* Botón de guardar */}
          <div className="mt-8 flex justify-end">
            {error && (
              <div className="mr-4 text-sm text-red-600">
                {error}
              </div>
            )}
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
    </DashboardLayout>
  )
}
