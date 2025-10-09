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
import {
  SIMPLIFIED_CATEGORIES,
  getMetadataForCategory,
  findCategoryById
} from './simplifiedCategorization'
import {
  getModifierTemplates,
  createModifierTemplate,
  updateModifierTemplate,
  deleteModifierTemplate,
  type ModifierTemplate
} from '../../../../lib/modifier-templates'

// Usar las categorías simplificadas
const CATEGORY_OPTIONS = SIMPLIFIED_CATEGORIES

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
  resourceType?: 'image' | 'video' | 'raw'
}

interface CategoryNode {
  id: string
  name: string
  children?: CategoryNode[]
  isLeaf?: boolean
}

interface ModifierOption {
  id: string
  name: string
  priceModifier: number | string  // +$0, +$2, -$1, o string vacío en UI
  isDefault: boolean
  isActive: boolean
  order: number
}

interface ModifierGroup {
  id: string
  name: string
  required: boolean           // ¿Es obligatorio elegir?
  allowMultiple: boolean      // ¿Permite múltiples opciones?
  minSelections: number | string  // Solo si allowMultiple = true
  maxSelections: number | string  // Solo si allowMultiple = true
  order: number
  options: ModifierOption[]
}

export default function CreateProductPage() {
  const router = useRouter()
  const { store, loading: storeLoading, currency, currencySymbol, currencyName, formatPrice } = useStore()
  const t = useTranslations('pages.products.create')
  const tCategories = useTranslations('categories')
  const tMetadata = useTranslations('categories.metadata')
  
  // Debug: verificar si los hooks están funcionando
  console.log('🔧 Translation hooks loaded:')
  console.log('  - t (create):', typeof t)
  console.log('  - tCategories:', typeof tCategories)  
  console.log('  - tMetadata:', typeof tMetadata)
  console.log('  - Test tMetadata fields.color:', tMetadata('fields.color'))
  console.log('  - Test tMetadata fields.tech_brand:', tMetadata('fields.tech_brand'))
  
  // Estados del formulario
  const [productName, setProductName] = useState('')
  const [description, setDescription] = useState('')
  const [selectedBrandId, setSelectedBrandId] = useState('')
  
  // Estados para opciones personalizadas
  const [customColors, setCustomColors] = useState<string[]>([])
  const [customSizes, setCustomSizes] = useState<string[]>([])
  const [customShoeSizes, setCustomShoeSizes] = useState<string[]>([])
  const [showColorInput, setShowColorInput] = useState(false)
  const [showSizeInput, setShowSizeInput] = useState(false)
  const [showShoeSizeInput, setShowShoeSizeInput] = useState(false)
  const [newColorInput, setNewColorInput] = useState('')
  const [newSizeInput, setNewSizeInput] = useState('')
  const [newShoeSizeInput, setNewShoeSizeInput] = useState('')
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
  const [stockQuantity, setStockQuantity] = useState(0)
  const [requiresShipping, setRequiresShipping] = useState(true)
  const [weight, setWeight] = useState('')
  const [hasVariants, setHasVariants] = useState(false)
  const [variants, setVariants] = useState<ProductVariant[]>([])
  
  // Estados para el configurador de variaciones estilo RedireDi
  const [variationType1, setVariationType1] = useState('')
  const [variationType1Custom, setVariationType1Custom] = useState('')
  const [variationType1Options, setVariationType1Options] = useState<string[]>([])
  const [hasSecondVariation, setHasSecondVariation] = useState(false)
  const [variationType2, setVariationType2] = useState('')
  const [variationType2Custom, setVariationType2Custom] = useState('')
  const [variationType2Options, setVariationType2Options] = useState<string[]>([])
  const [variationInputValue1, setVariationInputValue1] = useState('')
  const [variationInputValue2, setVariationInputValue2] = useState('')
  
  // Refs para mantener el foco en los inputs
  const inputRefs1 = useRef<(HTMLInputElement | null)[]>([])
  const inputRefs2 = useRef<(HTMLInputElement | null)[]>([])
  const [categoryPath, setCategoryPath] = useState<string[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [metaFieldValues, setMetaFieldValues] = useState<Record<string, string | string[]>>({})
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [seoTitle, setSeoTitle] = useState('')
  const [metaDescription, setMetaDescription] = useState('')
  const [urlSlug, setUrlSlug] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showInventory, setShowInventory] = useState(false)
  const [showSEO, setShowSEO] = useState(false)
  const [showCategorization, setShowCategorization] = useState(false)
  const [showModifiers, setShowModifiers] = useState(false)
  const [modifierGroups, setModifierGroups] = useState<ModifierGroup[]>([])
  const [modifierTemplates, setModifierTemplates] = useState<ModifierTemplate[]>([])
  const [loadingTemplates, setLoadingTemplates] = useState(false)
  const [selectedTemplateIds, setSelectedTemplateIds] = useState<string[]>([])
  const [draggedTemplateId, setDraggedTemplateId] = useState<string | null>(null)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<ModifierGroup | null>(null)
  const [templateForm, setTemplateForm] = useState<ModifierGroup>({
    id: '',
    name: '',
    required: false,
    allowMultiple: false,
    minSelections: '',
    maxSelections: '',
    order: 0,
    options: []
  })
  const [savingTemplate, setSavingTemplate] = useState(false)
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

      // Cargar plantillas de modificadores
      setLoadingTemplates(true)
      try {
        const templatesList = await getModifierTemplates(store.id)
        setModifierTemplates(templatesList)
      } catch (error) {
        console.error('Error cargando plantillas:', error)
      } finally {
        setLoadingTemplates(false)
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

  // Efecto para actualizar la disponibilidad de metadatos cuando cambien
  useEffect(() => {
    // Este efecto se ejecuta cuando cambian los metaFieldValues
    // Solo actualiza la UI, no modifica automáticamente los atributos
    // para evitar sobrescribir cambios del usuario
  }, [metaFieldValues])

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

  // Funciones para manejar opciones personalizadas
  const addCustomColor = () => {
    if (newColorInput.trim() && !customColors.includes(newColorInput.trim())) {
      setCustomColors(prev => [...prev, newColorInput.trim()])
      setNewColorInput('')
      setShowColorInput(false)
    }
  }

  const addCustomSize = () => {
    if (newSizeInput.trim() && !customSizes.includes(newSizeInput.trim())) {
      setCustomSizes(prev => [...prev, newSizeInput.trim()])
      setNewSizeInput('')
      setShowSizeInput(false)
    }
  }

  const addCustomShoeSize = () => {
    if (newShoeSizeInput.trim() && !customShoeSizes.includes(newShoeSizeInput.trim())) {
      setCustomShoeSizes(prev => [...prev, newShoeSizeInput.trim()])
      setNewShoeSizeInput('')
      setShowShoeSizeInput(false)
    }
  }

  const removeCustomColor = (color: string) => {
    setCustomColors(prev => prev.filter(c => c !== color))
  }

  const removeCustomSize = (size: string) => {
    setCustomSizes(prev => prev.filter(s => s !== size))
  }

  const removeCustomShoeSize = (size: string) => {
    setCustomShoeSizes(prev => prev.filter(s => s !== size))
  }

  // Funciones para manejar modificadores
  const addModifierGroup = () => {
    const newGroup: ModifierGroup = {
      id: `group-${Date.now()}`,
      name: '',
      required: false,
      allowMultiple: false,
      minSelections: '',
      maxSelections: '',
      order: modifierGroups.length,
      options: []
    }
    setModifierGroups(prev => [...prev, newGroup])
  }

  const removeModifierGroup = (groupId: string) => {
    setModifierGroups(prev => prev.filter(g => g.id !== groupId))
  }

  const updateModifierGroup = (groupId: string, field: keyof ModifierGroup, value: any) => {
    setModifierGroups(prev => prev.map(g =>
      g.id === groupId ? { ...g, [field]: value } : g
    ))
  }

  const addModifierOption = (groupId: string) => {
    const newOption: ModifierOption = {
      id: `option-${Date.now()}`,
      name: '',
      priceModifier: '',
      isDefault: false,
      isActive: true,
      order: 0
    }

    setModifierGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        const order = g.options.length
        return {
          ...g,
          options: [...g.options, { ...newOption, order }]
        }
      }
      return g
    }))
  }

  const removeModifierOption = (groupId: string, optionId: string) => {
    setModifierGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          options: g.options.filter(o => o.id !== optionId)
        }
      }
      return g
    }))
  }

  const updateModifierOption = (groupId: string, optionId: string, field: keyof ModifierOption, value: any) => {
    setModifierGroups(prev => prev.map(g => {
      if (g.id === groupId) {
        return {
          ...g,
          options: g.options.map(o =>
            o.id === optionId ? { ...o, [field]: value } : o
          )
        }
      }
      return g
    }))
  }

  // Funciones para manejar plantillas en el modal
  const updateTemplateForm = (field: keyof ModifierGroup, value: any) => {
    setTemplateForm(prev => ({ ...prev, [field]: value }))
  }

  const addTemplateOption = () => {
    const newOption: ModifierOption = {
      id: `option-${Date.now()}`,
      name: '',
      priceModifier: '',
      isDefault: false,
      isActive: true,
      order: templateForm.options.length
    }
    setTemplateForm(prev => ({
      ...prev,
      options: [...prev.options, newOption]
    }))
  }

  const removeTemplateOption = (optionId: string) => {
    setTemplateForm(prev => ({
      ...prev,
      options: prev.options.filter(o => o.id !== optionId)
    }))
  }

  const updateTemplateOption = (optionId: string, field: keyof ModifierOption, value: any) => {
    setTemplateForm(prev => ({
      ...prev,
      options: prev.options.map(o =>
        o.id === optionId ? { ...o, [field]: value } : o
      )
    }))
  }

  const handleSaveTemplate = async () => {
    if (!store?.id) return
    if (!templateForm.name.trim()) {
      alert('Por favor ingresa un nombre para la plantilla')
      return
    }
    if (templateForm.options.length === 0) {
      alert('Agrega al menos una opción')
      return
    }

    setSavingTemplate(true)
    try {
      const templateData = {
        name: templateForm.name,
        required: templateForm.required,
        allowMultiple: templateForm.allowMultiple,
        minSelections: typeof templateForm.minSelections === 'string' && templateForm.minSelections === '' ? 0 : Number(templateForm.minSelections),
        maxSelections: typeof templateForm.maxSelections === 'string' && templateForm.maxSelections === '' ? 99 : Number(templateForm.maxSelections),
        options: templateForm.options.map(opt => ({
          ...opt,
          priceModifier: typeof opt.priceModifier === 'string' && opt.priceModifier === '' ? 0 : Number(opt.priceModifier)
        }))
      }

      if (editingTemplate) {
        // Editar plantilla existente
        await updateModifierTemplate(store.id, editingTemplate.id, templateData)
      } else {
        // Crear nueva plantilla
        await createModifierTemplate(store.id, templateData)
      }

      // Recargar plantillas
      const updatedTemplates = await getModifierTemplates(store.id)
      setModifierTemplates(updatedTemplates)

      // Cerrar modal y resetear formulario
      setShowTemplateModal(false)
      setTemplateForm({
        id: '',
        name: '',
        required: false,
        allowMultiple: false,
        minSelections: '',
        maxSelections: '',
        order: 0,
        options: []
      })
      setEditingTemplate(null)
    } catch (error) {
      console.error('Error guardando plantilla:', error)
      alert('Error guardando la plantilla')
    } finally {
      setSavingTemplate(false)
    }
  }

  // Funciones para drag and drop de plantillas seleccionadas
  const handleDragStart = (templateId: string) => {
    setDraggedTemplateId(templateId)
  }

  const handleDragOver = (e: React.DragEvent, targetTemplateId: string) => {
    e.preventDefault()
    if (!draggedTemplateId || draggedTemplateId === targetTemplateId) return

    const draggedIndex = selectedTemplateIds.indexOf(draggedTemplateId)
    const targetIndex = selectedTemplateIds.indexOf(targetTemplateId)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newOrder = [...selectedTemplateIds]
    newOrder.splice(draggedIndex, 1)
    newOrder.splice(targetIndex, 0, draggedTemplateId)
    setSelectedTemplateIds(newOrder)
  }

  const handleDragEnd = () => {
    setDraggedTemplateId(null)
  }

  // Función para editar plantilla
  const handleEditTemplate = (template: ModifierTemplate) => {
    // Convertir ModifierTemplate a ModifierGroup para el formulario
    setTemplateForm({
      id: template.id,
      name: template.name,
      required: template.required,
      allowMultiple: template.allowMultiple,
      minSelections: template.minSelections.toString(),
      maxSelections: template.maxSelections.toString(),
      order: 0,
      options: template.options.map(opt => ({
        ...opt,
        priceModifier: opt.priceModifier.toString()
      }))
    })
    setEditingTemplate({
      id: template.id,
      name: template.name,
      required: template.required,
      allowMultiple: template.allowMultiple,
      minSelections: template.minSelections.toString(),
      maxSelections: template.maxSelections.toString(),
      order: 0,
      options: template.options.map(opt => ({
        ...opt,
        priceModifier: opt.priceModifier.toString()
      }))
    })
    setShowTemplateModal(true)
  }

  // Función para eliminar plantilla
  const handleDeleteTemplate = async (templateId: string) => {
    if (!store?.id) return

    if (!confirm('¿Estás seguro de eliminar esta plantilla? Esta acción no se puede deshacer.')) {
      return
    }

    try {
      await deleteModifierTemplate(store.id, templateId)

      // Recargar plantillas
      const updatedTemplates = await getModifierTemplates(store.id)
      setModifierTemplates(updatedTemplates)

      // Quitar de seleccionados si estaba
      setSelectedTemplateIds(prev => prev.filter(id => id !== templateId))
    } catch (error) {
      console.error('Error eliminando plantilla:', error)
      alert('Error eliminando la plantilla')
    }
  }

  const getMetaFieldsForCategory = () => {
    const metadata = getMetadataForCategory(selectedCategory)
    console.log('🔍 Raw metadata for category:', selectedCategory, metadata)
    
    // Traducir los metadatos y agregar opciones personalizadas
    const translatedMetadata = metadata.map(field => {
      // Traducir nombre del campo con la estructura correcta
      const fieldTranslationKey = `fields.${field.id}`
      const translatedName = tMetadata(fieldTranslationKey)
      console.log(`🔍 Translating field "${field.id}":`)
      console.log(`  - Original name: "${field.name}"`)
      console.log(`  - Translation key: "${fieldTranslationKey}"`)
      console.log(`  - Translated result: "${translatedName}"`)
      console.log(`  - Final name: "${translatedName || field.name}"`)
      
      let options = field.options?.map(option => {
        // Traducir opciones usando la estructura correcta del JSON
        const translationKey = `values.${field.id}_options.${option}`
        
        try {
          const translatedOption = tMetadata(translationKey)
          console.log(`🔍 Translating "${option}" with key "${translationKey}": -> "${translatedOption}"`)
          
          // Si la traducción devuelve la misma clave, significa que no encontró la traducción
          if (translatedOption === translationKey || !translatedOption) {
            console.log(`❌ Translation not found for: ${translationKey}, using original: ${option}`)
            return option // Usar el valor original
          }
          
          return translatedOption
        } catch (error) {
          console.log(`❌ Error translating ${translationKey}:`, error)
          return option // Usar el valor original como fallback
        }
      }) || []

      // Agregar opciones personalizadas según el tipo de campo
      if (field.id === 'color') {
        options = [...options, ...customColors]
      } else if (field.id === 'size_clothing') {
        options = [...options, ...customSizes]
      } else if (field.id === 'size_shoes') {
        options = [...options, ...customShoeSizes]
      }
      
      return {
        ...field,
        name: translatedName || field.name,
        options
      }
    })
    
    console.log('🔍 Translated metadata with custom options:', translatedMetadata)
    return translatedMetadata
  }

  // Usar la función del sistema simplificado
  const findNodeById = findCategoryById

  const getCurrentCategories = (): CategoryNode[] => {
    if (categoryPath.length === 0) {
      return CATEGORY_OPTIONS.map(cat => {
        // Traducir categoria usando la estructura correcta del JSON
        const translatedName = tCategories(`categories.${cat.id}`) || cat.name
        console.log(`🔍 Translating category ${cat.id}: ${cat.name} -> ${translatedName}`)
        
        return {
          ...cat,
          name: translatedName,
          children: cat.children?.map(child => ({
            ...child,
            name: tCategories(`categories.${child.id}`) || child.name
          }))
        }
      })
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
    
    return current.map(cat => ({
      ...cat,
      name: tCategories(`categories.${cat.id}`) || cat.name
    }))
  }

  const getBreadcrumb = (): string[] => {
    const breadcrumb: string[] = []
    let current = CATEGORY_OPTIONS

    for (const pathId of categoryPath) {
      const node = current.find((n: CategoryNode) => n.id === pathId)
      if (node) {
        breadcrumb.push(tCategories(`categories.${node.id}`) || node.name)
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
        cost: cost ? parseFloat(cost) : null,
        chargeTaxes,
        
        // Stock
        trackStock,
        stockQuantity: trackStock ? stockQuantity || 0 : null,
        
        // Organización
        selectedBrandId: selectedBrandId || null,
        selectedCategory: selectedCategory || null,
        selectedParentCategoryIds: selectedParentCategoryIds || [],
        selectedSubcategoryIds: selectedSubcategoryIds || [],
        metaFieldValues: metaFieldValues || {},
        
        // Variantes
        hasVariants,
        variants: hasVariants ? variants : [], // Guardar todas las variantes creadas

        // Modificadores - resolver plantillas seleccionadas y convertir a modifierGroups
        modifierGroups: selectedTemplateIds.length > 0
          ? selectedTemplateIds.map((templateId, index) => {
              const template = modifierTemplates.find(t => t.id === templateId)
              if (!template) return null

              return {
                id: template.id,
                name: template.name,
                required: template.required,
                allowMultiple: template.allowMultiple,
                minSelections: template.minSelections,
                maxSelections: template.maxSelections,
                order: index,
                options: template.options
              }
            }).filter(Boolean)
          : modifierGroups.map(group => ({
              ...group,
              minSelections: group.minSelections === '' ? 0 : parseInt(group.minSelections as string) || 0,
              maxSelections: group.maxSelections === '' ? 999 : parseInt(group.maxSelections as string) || 999,
              options: group.options.map(option => ({
                ...option,
                priceModifier: option.priceModifier === '' ? 0 : parseFloat(option.priceModifier as string) || 0
              }))
            })),

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
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base sm:text-sm"
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
                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base sm:text-sm"
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
                <button
                  onClick={() => setShowCategorization(!showCategorization)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('categorization.title')}</h2>
                    <p className="text-sm text-gray-500">
                      {t('categorization.subtitle')}
                    </p>
                  </div>
                  <span className="text-gray-400">
                    {showCategorization ? '−' : '+'}
                  </span>
                </button>

                {showCategorization && (
                  <div className="mt-6 space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">{t('categorization.categoryLabel')}</label>
                    
                    {/* Buscador con dropdown navegable */}
                    <div className="relative">
                      <input
                        type="text"
                        value={selectedCategory ? (tCategories(`categories.${selectedCategory}`) || findNodeById(CATEGORY_OPTIONS, selectedCategory)?.name || t('categorization.chooseCategoryPlaceholder')) : t('categorization.chooseCategoryPlaceholder')}
                        readOnly
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="block w-full px-3 py-2 border-2 border-blue-500 rounded-md bg-white cursor-pointer focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-base sm:text-sm"
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
                              {tCategories(`categories.${selectedCategory}`) || findNodeById(CATEGORY_OPTIONS, selectedCategory)?.name}
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
                                      {t('categorization.select')}
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
                                {t('categorization.categorySelected')}
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
                      <h3 className="text-md font-medium text-gray-900 mb-3">Características del producto (información descriptiva)</h3>
                      <p className="text-sm text-gray-500 mb-4">
                        Estas características aparecerán como información del producto, no como opciones seleccionables.
                      </p>
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
                                  const isCustomOption = (field.id === 'color' && customColors.includes(option)) || 
                                                         (field.id === 'size_clothing' && customSizes.includes(option)) ||
                                                         (field.id === 'size_shoes' && customShoeSizes.includes(option))
                                  
                                  return (
                                    <div key={option} className="relative">
                                      <button
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
                                      {isCustomOption && (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (field.id === 'color') removeCustomColor(option)
                                            else if (field.id === 'size_clothing') removeCustomSize(option)
                                            else if (field.id === 'size_shoes') removeCustomShoeSize(option)
                                          }}
                                          className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center hover:bg-red-600"
                                          title={t('customOptions.removeCustomOption')}
                                        >
                                          ×
                                        </button>
                                      )}
                                    </div>
                                  )
                                })}
                                
                                {/* Botón + para agregar opciones personalizadas */}
                                {(field.id === 'color' || field.id === 'size_clothing' || field.id === 'size_shoes') && (
                                  <>
                                    {/* Mostrar input si está activo */}
                                    {((field.id === 'color' && showColorInput) || (field.id === 'size_clothing' && showSizeInput) || (field.id === 'size_shoes' && showShoeSizeInput)) ? (
                                      <div className="flex items-center gap-2">
                                        <input
                                          type="text"
                                          value={field.id === 'color' ? newColorInput : field.id === 'size_clothing' ? newSizeInput : newShoeSizeInput}
                                          onChange={(e) => {
                                            if (field.id === 'color') setNewColorInput(e.target.value)
                                            else if (field.id === 'size_clothing') setNewSizeInput(e.target.value)
                                            else if (field.id === 'size_shoes') setNewShoeSizeInput(e.target.value)
                                          }}
                                          onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                              if (field.id === 'color') addCustomColor()
                                              else if (field.id === 'size_clothing') addCustomSize()
                                              else if (field.id === 'size_shoes') addCustomShoeSize()
                                            }
                                          }}
                                          placeholder={field.id === 'color' ? t('customOptions.newColor') : field.id === 'size_clothing' ? t('customOptions.newSize') : t('customOptions.newSize')}
                                          className="px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                          autoFocus
                                        />
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (field.id === 'color') addCustomColor()
                                            else if (field.id === 'size_clothing') addCustomSize()
                                            else if (field.id === 'size_shoes') addCustomShoeSize()
                                          }}
                                          className="px-2 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600"
                                        >
                                          ✓
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => {
                                            if (field.id === 'color') {
                                              setShowColorInput(false)
                                              setNewColorInput('')
                                            } else if (field.id === 'size_clothing') {
                                              setShowSizeInput(false)
                                              setNewSizeInput('')
                                            } else if (field.id === 'size_shoes') {
                                              setShowShoeSizeInput(false)
                                              setNewShoeSizeInput('')
                                            }
                                          }}
                                          className="px-2 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                                        >
                                          ✕
                                        </button>
                                      </div>
                                    ) : (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          if (field.id === 'color') setShowColorInput(true)
                                          else if (field.id === 'size_clothing') setShowSizeInput(true)
                                          else if (field.id === 'size_shoes') setShowShoeSizeInput(true)
                                        }}
                                        className="px-3 py-1 text-sm border-2 border-dashed border-gray-300 text-gray-500 rounded-full hover:border-blue-300 hover:text-blue-500 transition-colors"
                                        title={field.id === 'color' ? t('customOptions.addColor') : t('customOptions.addSize')}
                                      >
                                        {field.id === 'color' ? t('customOptions.addColor') : t('customOptions.addSize')}
                                      </button>
                                    )}
                                  </>
                                )}
                              </div>
                            )}
                            {field.type === 'select' && (
                              <select 
                                value={(metaFieldValues[field.id] as string) || ''}
                                onChange={(e) => handleMetaFieldChange(field.id, e.target.value)}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 text-base sm:text-sm"
                              >
                                <option value="">{t('categorization.selectOption')}</option>
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
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 text-base sm:text-sm"
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
                )}
              </Card>

              {/* 5. Inventario y Variantes */}
              <Card className="p-6">
                <button
                  onClick={() => setShowInventory(!showInventory)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('inventory.title')}</h2>
                    <p className="text-sm text-gray-500">
                      {t('inventory.subtitle')}
                    </p>
                  </div>
                  <span className="text-gray-400">
                    {showInventory ? '−' : '+'}
                  </span>
                </button>

                {showInventory && (
                  <div className="mt-6">
                    {/* Primera pregunta: Rastrear inventario */}
                    <div className="mb-6">
                  <label className="flex items-center">
                    <input
                      type="checkbox"
                      checked={trackStock}
                      onChange={(e) => setTrackStock(e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm font-medium text-gray-900">{t('inventory.trackStock')}</span>
                  </label>
                  <p className="text-xs text-gray-500 mt-1">{t('inventory.trackStockDescription')}</p>
                </div>

                {/* Pregunta principal tipo RedireDi */}
                <div className="mb-6">
                  <h3 className="text-md font-medium text-gray-900 mb-4">{t('inventory.hasVariations')}</h3>
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
                        <span className="text-sm font-medium text-gray-900">{t('inventory.noVariations')}</span>
                        <p className="text-sm text-gray-500">{t('inventory.noVariationsDescription')}</p>
                      </div>
                    </label>
                    
                    <label className="flex items-center p-4 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer">
                      <input
                        type="radio"
                        name="hasVariations"
                        value="yes"
                        checked={hasVariants}
                        onChange={() => {
                          setHasVariants(true)
                          // Seleccionar 'color' por defecto si no hay nada seleccionado
                          if (!variationType1) {
                            setVariationType1('color')
                          }
                        }}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                      />
                      <div className="ml-3">
                        <span className="text-sm font-medium text-gray-900">{t('inventory.yesVariations')}</span>
                        <p className="text-sm text-gray-500">{t('inventory.yesVariationsDescription')}</p>
                      </div>
                    </label>
                  </div>
                </div>

                {/* Bifurcación: Stock simple vs Configurador de variantes */}
                {!hasVariants ? (
                  /* STOCK SIMPLE - Producto sin variaciones */
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-900 mb-4">{t('inventory.productStock')}</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">{t('inventory.stockAvailable')}</label>
                        <input
                          type="number"
                          min="0"
                          value={stockQuantity}
                          onChange={(e) => setStockQuantity(parseInt(e.target.value) || 0)}
                          className={`block w-full px-3 py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500 ${!trackStock ? 'bg-gray-100 text-gray-400' : ''}`}
                          placeholder="0"
                          disabled={!trackStock}
                        />
                      </div>
                    </div>
                  </div>
                ) : hasVariants ? (
                  /* CONFIGURADOR DE VARIANTES estilo RedireDi */
                  <div className="space-y-6">
                    <h3 className="text-md font-medium text-gray-900">{t('inventory.variationsConfigurator')}</h3>

                    {/* Paso 1: Tipo principal de variación */}
                    <div className="space-y-3">
                      <label className="block text-sm font-medium text-gray-700">
                        {t('inventory.step1')}
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
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('inventory.color')}
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
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('inventory.size')}
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
                              ? 'bg-primary-600 text-white shadow-md'
                              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                          }`}
                        >
                          {t('inventory.other')}
                        </button>
                      </div>
                      
                      {/* Input para tipo personalizado */}
                      {variationType1 === 'otro' && (
                        <div className="mt-3">
                          <input
                            type="text"
                            value={variationType1Custom}
                            onChange={(e) => setVariationType1Custom(e.target.value)}
                            placeholder={t('inventory.customTypePlaceholder')}
                            className="block w-full px-3 py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500"
                          />
                        </div>
                      )}
                    </div>

                    {/* Paso 2: Opciones del tipo principal */}
                    {variationType1 && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          {t('inventory.step2')} {variationType1 === 'otro' ? (variationType1Custom || 'otro') : variationType1}
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
                                placeholder={t('inventory.exampleRed')}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500"
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
                          
                          {variationType1Options.length === 0 && (
                            <div className="flex gap-2 items-center">
                              <input
                                ref={(el) => inputRefs1.current[0] = el}
                                type="text"
                                value=""
                                onChange={(e) => {
                                  if (e.target.value) {
                                    setVariationType1Options([e.target.value])
                                    // Mantener el foco en el nuevo input
                                    setTimeout(() => {
                                      inputRefs1.current[0]?.focus()
                                    }, 0)
                                  }
                                }}
                                placeholder={t('inventory.exampleRed')}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>
                          )}
                          
                          <button
                            type="button"
                            onClick={() => {
                              setVariationType1Options([...variationType1Options, ''])
                            }}
                            className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                            </svg>
                            {t('inventory.addAnotherOption')}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Paso 3: Pregunta por segundo tipo */}
                    {variationType1 && variationType1Options.filter(opt => opt.trim() !== '').length > 0 && (
                      <div className="space-y-3">
                        <label className="block text-sm font-medium text-gray-700">
                          {t('inventory.step3')}
                        </label>
                        <div className="space-y-2">
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="hasSecondVariation"
                              checked={!hasSecondVariation}
                              onChange={() => {
                                setHasSecondVariation(false)
                                setVariationType2('')
                                setVariationType2Options([])
                                setVariationInputValue2('')
                              }}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">{t('inventory.step3OptionNo')} {variationType1 === 'otro' ? variationType1Custom : variationType1}</span>
                          </label>
                          <label className="flex items-center">
                            <input
                              type="radio"
                              name="hasSecondVariation"
                              checked={hasSecondVariation}
                              onChange={() => setHasSecondVariation(true)}
                              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                            />
                            <span className="ml-2 text-sm text-gray-700">{t('inventory.step3OptionYes')}</span>
                          </label>
                        </div>
                      </div>
                    )}

                    {/* Paso 4: Segundo tipo de variación */}
                    {hasSecondVariation && (
                      <div className="space-y-4">
                        <div className="space-y-3">
                          <label className="block text-sm font-medium text-gray-700">
                            {t('inventory.step4')}
                          </label>
                          <div className="flex flex-wrap gap-3">
                            {/* Pastilla Color - deshabilitada si ya está seleccionada */}
                            <button
                              type="button"
                              onClick={() => {
                                setVariationType2('color')
                                setVariationType2Custom('')
                              }}
                              disabled={variationType1 === 'color'}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                variationType1 === 'color'
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : variationType2 === 'color'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {t('inventory.color')} {variationType1 === 'color' && t('inventory.alreadySelected')}
                            </button>

                            {/* Pastilla Talla - deshabilitada si ya está seleccionada */}
                            <button
                              type="button"
                              onClick={() => {
                                setVariationType2('talla')
                                setVariationType2Custom('')
                              }}
                              disabled={variationType1 === 'talla'}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                variationType1 === 'talla'
                                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                  : variationType2 === 'talla'
                                    ? 'bg-primary-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {t('inventory.size')} {variationType1 === 'talla' && t('inventory.alreadySelected')}
                            </button>

                            {/* Pastilla Otro */}
                            <button
                              type="button"
                              onClick={() => {
                                setVariationType2('otro')
                                setVariationType2Custom('')
                              }}
                              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                                variationType2 === 'otro'
                                  ? 'bg-primary-600 text-white shadow-md'
                                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                              }`}
                            >
                              {t('inventory.other')}
                            </button>
                          </div>
                          
                          {/* Input para segundo tipo personalizado */}
                          {variationType2 === 'otro' && (
                            <div className="mt-3">
                              <input
                                type="text"
                                value={variationType2Custom}
                                onChange={(e) => setVariationType2Custom(e.target.value)}
                                placeholder={t('inventory.customSecondTypePlaceholder')}
                                className="block w-full px-3 py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500"
                              />
                            </div>
                          )}
                        </div>

                        {variationType2 && (
                          <div className="space-y-3">
                            <label className="block text-sm font-medium text-gray-700">
                              {t('inventory.defineOptionsFor')} {variationType2 === 'otro' ? (variationType2Custom || 'otro') : variationType2}
                            </label>
                            <div className="space-y-2">
                              {variationType2Options.map((option, index) => (
                                <div key={index} className="flex gap-2 items-center">
                                  <input
                                    ref={(el) => inputRefs2.current[index] = el}
                                    type="text"
                                    value={option}
                                    onChange={(e) => {
                                      const newOptions = [...variationType2Options]
                                      newOptions[index] = e.target.value
                                      setVariationType2Options(newOptions)
                                      // Mantener el foco después del cambio
                                      setTimeout(() => {
                                        inputRefs2.current[index]?.focus()
                                      }, 0)
                                    }}
                                    placeholder="Ej: S"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500"
                                  />
                                  {variationType2Options.length > 1 && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        const newOptions = variationType2Options.filter((_, i) => i !== index)
                                        setVariationType2Options(newOptions)
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
                              
                              {variationType2Options.length === 0 && (
                                <div className="flex gap-2 items-center">
                                  <input
                                    ref={(el) => inputRefs2.current[0] = el}
                                    type="text"
                                    value=""
                                    onChange={(e) => {
                                      if (e.target.value) {
                                        setVariationType2Options([e.target.value])
                                        // Mantener el foco en el nuevo input
                                        setTimeout(() => {
                                          inputRefs2.current[0]?.focus()
                                        }, 0)
                                      }
                                    }}
                                    placeholder="Ej: S"
                                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500"
                                  />
                                </div>
                              )}
                              
                              <button
                                type="button"
                                onClick={() => {
                                  setVariationType2Options([...variationType2Options, ''])
                                }}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-primary-600 hover:text-primary-800 hover:bg-primary-50 rounded-md transition-colors"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
                                </svg>
                                {t('inventory.addAnotherOption')}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botón para generar matriz */}
                    {variationType1 &&
                     variationType1Options.filter(opt => opt.trim() !== '').length > 0 &&
                     (!hasSecondVariation ||
                      (variationType2 &&
                       variationType2Options.filter(opt => opt.trim() !== '').length > 0)) && (
                      <div className="pt-4 border-t border-gray-200">
                        <Button
                          onClick={generateVariantMatrix}
                          className="w-full flex flex-col md:flex-row md:items-center md:justify-center gap-0 md:gap-1"
                        >
                          <span>{t('inventory.generateMatrix')}</span>
                          <span>
                            ({hasSecondVariation ?
                              variationType1Options.filter(opt => opt.trim() !== '').length * variationType2Options.filter(opt => opt.trim() !== '').length :
                              variationType1Options.filter(opt => opt.trim() !== '').length} {t('inventory.combinations')})
                          </span>
                        </Button>
                      </div>
                    )}
                  </div>
                ) : null}
                
                {/* Tabla de variantes existente (ahora solo se muestra si hay variantes) */}
                {hasVariants && variants.length > 0 && (
                  <div className="space-y-4">
                    {/* Tabla de variantes */}
                    {variants.length > 0 && (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pt-5">
                          <h3 className="text-md font-medium text-gray-900">
                            {t('inventory.configureVariants')} ({variants.filter(v => v.available !== false).length} {t('inventory.active')})
                          </h3>
                          <div className="hidden md:block text-xs text-gray-500">
                            {t('inventory.uncheckUnwanted')}
                          </div>
                        </div>
                        
                        {/* Vista mobile: Cards */}
                        <div className="md:hidden space-y-4">
                          {variants.map(variant => (
                            <div key={variant.id} className={`border border-gray-200 rounded-lg p-4 ${variant.available === false ? 'bg-gray-50 opacity-60' : 'bg-white'}`}>
                              <div className="space-y-4">
                                {/* Visible */}
                                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                                  <label className="text-sm font-medium text-gray-700">{t('inventory.visible')}</label>
                                  <input
                                    type="checkbox"
                                    checked={variant.available !== false}
                                    onChange={() => toggleVariantAvailability(variant.id)}
                                    className="h-5 w-5 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                  />
                                </div>

                                {/* Variante */}
                                <div className="grid grid-cols-[120px_1fr] gap-3">
                                  <label className="text-sm font-medium text-gray-700 pt-2">{t('inventory.variant')}</label>
                                  <div className="space-y-1">
                                    <input
                                      type="text"
                                      value={variant.name}
                                      onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                      className="block w-full px-3 py-2.5 border border-gray-300 rounded-md text-base focus:ring-primary-500 focus:border-primary-500"
                                      placeholder={t('inventory.variantPlaceholder')}
                                    />
                                    {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                                      <div className="flex flex-wrap gap-1 mt-1.5">
                                        {Object.entries(variant.attributes).map(([key, value]) => (
                                          <span key={key} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-medium">
                                            {key}: {value}
                                          </span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Precio */}
                                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                                  <label className="text-sm font-medium text-gray-700">{t('inventory.price')} ({currencyName})</label>
                                  <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                      <span className="text-gray-500 text-sm">{currencySymbol}</span>
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
                                      className="block w-full pl-8 pr-2 py-2.5 border border-gray-300 rounded-md text-base focus:ring-primary-500 focus:border-primary-500"
                                      min="0"
                                      step="0.01"
                                      disabled={variant.available === false}
                                      placeholder="0.00"
                                    />
                                  </div>
                                </div>

                                {/* Stock */}
                                <div className="grid grid-cols-[120px_1fr] items-center gap-3">
                                  <label className="text-sm font-medium text-gray-700">{t('inventory.stock')}</label>
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
                                    className={`block w-full px-3 py-2.5 border border-gray-300 rounded-md text-base focus:ring-primary-500 focus:border-primary-500 ${(!trackStock || variant.available === false) ? 'bg-gray-100 text-gray-400' : ''}`}
                                    min="0"
                                    disabled={!trackStock || variant.available === false}
                                    placeholder="0"
                                  />
                                </div>

                                {/* Botón eliminar */}
                                <div className="pt-2 border-t border-gray-200">
                                  <button
                                    onClick={() => removeVariant(variant.id)}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors text-sm font-medium"
                                  >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                    </svg>
                                    {t('inventory.removeVariant')}
                                  </button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        {/* Vista desktop: Tabla */}
                        <div className="hidden md:block overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                {/* Checkbox de disponibilidad simplificado */}
                                <th className="w-16 px-3 py-3 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <div className="flex items-center justify-center">
                                    <span className="sr-only">{t('inventory.activeCheckbox')}</span>
                                    ✓
                                  </div>
                                </th>
                                <th className="px-4 py-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {t('inventory.variant')}
                                </th>
                                <th className="w-32 px-4 py-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {t('inventory.price')} ({currencyName})
                                </th>
                                <th className="w-24 px-4 py-4 md:py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  {t('inventory.stock')}
                                </th>
                                <th className="w-16 px-3 py-3 md:py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                  <span className="sr-only">{t('inventory.actions')}</span>
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {variants.map(variant => (
                                <tr key={variant.id} className={variant.available === false ? 'bg-gray-50 opacity-60' : ''}>
                                  {/* Checkbox para activar/desactivar variante */}
                                  <td className="px-3 py-4 md:py-3 text-center">
                                    <input
                                      type="checkbox"
                                      checked={variant.available !== false}
                                      onChange={() => toggleVariantAvailability(variant.id)}
                                      className="h-5 w-5 md:h-4 md:w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                      title={variant.available !== false ? "Variante activa" : "Variante inactiva"}
                                    />
                                  </td>

                                  {/* Nombre de variante */}
                                  <td className="px-4 py-4 md:py-3">
                                    <div className="space-y-1">
                                      <input
                                        type="text"
                                        value={variant.name}
                                        onChange={(e) => updateVariant(variant.id, 'name', e.target.value)}
                                        className="block w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500"
                                        placeholder={t('inventory.variantPlaceholder')}
                                      />
                                      {/* Mostrar atributos de la combinación */}
                                      {variant.attributes && Object.keys(variant.attributes).length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-1.5">
                                          {Object.entries(variant.attributes).map(([key, value]) => (
                                            <span key={key} className="inline-block bg-blue-100 text-blue-700 rounded px-2 py-0.5 text-xs font-medium">
                                              {key}: {value}
                                            </span>
                                          ))}
                                        </div>
                                      )}
                                    </div>
                                  </td>

                                  {/* Precio */}
                                  <td className="px-4 py-4 md:py-3">
                                    <div className="relative">
                                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <span className="text-gray-500 text-sm md:text-xs">{currencySymbol}</span>
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
                                        className="block w-full pl-8 pr-2 py-2.5 md:py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500"
                                        min="0"
                                        step="0.01"
                                        disabled={variant.available === false}
                                        placeholder="0.00"
                                      />
                                    </div>
                                  </td>

                                  {/* Stock */}
                                  <td className="px-4 py-4 md:py-3">
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
                                      className={`block w-full px-3 py-2.5 md:py-2 border border-gray-300 rounded-md text-base md:text-sm focus:ring-primary-500 focus:border-primary-500 ${(!trackStock || variant.available === false) ? 'bg-gray-100 text-gray-400' : ''}`}
                                      min="0"
                                      disabled={!trackStock || variant.available === false}
                                      placeholder="0"
                                    />
                                  </td>

                                  {/* Acciones */}
                                  <td className="px-3 py-4 md:py-3 text-center">
                                    <button
                                      onClick={() => removeVariant(variant.id)}
                                      className="inline-flex items-center justify-center w-9 h-9 md:w-8 md:h-8 text-red-600 hover:text-red-900 hover:bg-red-50 rounded transition-colors"
                                      title="Eliminar variante"
                                    >
                                      <svg className="w-5 h-5 md:w-4 md:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                                      </svg>
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                  </div>
                )}
              </Card>

              {/* 6. Modificadores y extras */}
              <Card className="p-6">
                <button
                  onClick={() => setShowModifiers(!showModifiers)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('modifiers.title')}</h2>
                    <p className="text-sm text-gray-500">
                      {t('modifiers.subtitle')}
                    </p>
                  </div>
                  <span className="text-gray-400">
                    {showModifiers ? '−' : '+'}
                  </span>
                </button>

                {showModifiers && (
                  <div className="mt-6">
                    {/* Layout: 2 columnas - Plantillas | Selección */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Columna izquierda: Plantillas disponibles */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-semibold text-gray-900">
                            Plantillas disponibles
                          </h3>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingTemplate(null)
                              setShowTemplateModal(true)
                            }}
                            className="text-xs px-3 py-1.5 bg-primary-600 text-white rounded hover:bg-primary-700 flex items-center gap-1"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            Nueva plantilla
                          </button>
                        </div>
                        {loadingTemplates ? (
                          <p className="text-sm text-gray-500">Cargando plantillas...</p>
                        ) : modifierTemplates.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-sm mb-2">No hay plantillas creadas</p>
                            <p className="text-xs text-gray-400">Crea tu primera plantilla de modificadores</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {modifierTemplates.map((template) => {
                              const isSelected = selectedTemplateIds.includes(template.id)

                              return (
                                <div key={template.id} className="bg-white border border-gray-200 rounded-lg p-3">
                                  <div className="flex items-start justify-between mb-2">
                                    <div className="flex-1">
                                      <p className="text-sm font-medium text-gray-900">{template.name}</p>
                                      <p className="text-xs text-gray-500 mt-1">
                                        {template.options.length} opciones
                                        {template.required && ' • Obligatorio'}
                                        {template.allowMultiple && ' • Cantidad'}
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2 ml-2">
                                      {/* Botón editar */}
                                      <button
                                        type="button"
                                        onClick={() => handleEditTemplate(template)}
                                        className="text-gray-400 hover:text-gray-600"
                                        title="Editar plantilla"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>

                                      {/* Botón eliminar plantilla */}
                                      <button
                                        type="button"
                                        onClick={() => handleDeleteTemplate(template.id)}
                                        className="text-gray-400 hover:text-red-600"
                                        title="Eliminar plantilla"
                                      >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
                                      </button>

                                      {/* Botón agregar/quitar del producto */}
                                      {isSelected ? (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedTemplateIds(prev => prev.filter(id => id !== template.id))
                                          }}
                                          className="text-gray-400 hover:text-gray-600"
                                          title="Quitar del producto"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      ) : (
                                        <button
                                          type="button"
                                          onClick={() => {
                                            setSelectedTemplateIds(prev => [...prev, template.id])
                                          }}
                                          className="text-primary-600 hover:text-primary-700"
                                          title="Agregar al producto"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                          </svg>
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                {/* Mostrar opciones */}
                                <div className="text-xs text-gray-600 space-y-0.5 mt-2 pl-2 border-l-2 border-gray-200">
                                  {template.options.map((opt) => (
                                    <div key={opt.id} className="flex justify-between">
                                      <span>{opt.name}</span>
                                      {opt.priceModifier !== 0 && (
                                        <span className="text-gray-500">+{currencySymbol}{opt.priceModifier}</span>
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>
                              )
                            })}
                          </div>
                        )}
                      </div>

                      {/* Columna derecha: Modificadores seleccionados para este producto */}
                      <div>
                        <h3 className="text-sm font-semibold text-gray-900 mb-3">
                          Modificadores de este producto
                        </h3>
                        {selectedTemplateIds.length === 0 ? (
                          <div className="text-center py-8 text-gray-500">
                            <p className="text-sm">Selecciona plantillas de la columna izquierda</p>
                            <p className="text-xs text-gray-400 mt-1">Puedes arrastrarlas para ordenarlas</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {selectedTemplateIds.map((templateId, index) => {
                              const template = modifierTemplates.find(t => t.id === templateId)
                              if (!template) return null

                              return (
                                <div
                                  key={template.id}
                                  draggable
                                  onDragStart={() => handleDragStart(template.id)}
                                  onDragOver={(e) => handleDragOver(e, template.id)}
                                  onDragEnd={handleDragEnd}
                                  className={`flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-move hover:border-gray-300 ${
                                    draggedTemplateId === template.id ? 'opacity-50' : ''
                                  }`}
                                >
                                  {/* Icono de drag */}
                                  <div className="text-gray-400 mt-0.5">
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                    </svg>
                                  </div>

                                  <div className="flex-1">
                                    <div className="flex items-center justify-between">
                                      <p className="text-sm font-medium text-gray-900">{template.name}</p>
                                      <span className="text-xs text-gray-400">#{index + 1}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                      {template.options.length} opciones
                                    </p>
                                  </div>

                                  {/* Botón eliminar */}
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setSelectedTemplateIds(prev => prev.filter(id => id !== template.id))
                                    }}
                                    className="text-gray-400 hover:text-red-600 mt-0.5"
                                    title="Quitar"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>
                                </div>
                              )
                            })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </Card>

              {/* Modal para crear/editar plantilla */}
              {showTemplateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 md:p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto md:rounded-lg md:max-h-[90vh] max-md:inset-0 max-md:fixed max-md:h-full max-md:max-h-full max-md:rounded-none max-md:max-w-full">
                    <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {editingTemplate ? 'Editar plantilla' : 'Nueva plantilla'}
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowTemplateModal(false)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                    <div className="p-6 space-y-6">
                      {/* Nombre de la plantilla */}
                      <div>
                        <Input
                          label="Nombre de la plantilla"
                          placeholder="Ej: Tamaño de bebidas, Extras para hamburguesa..."
                          value={templateForm.name}
                          onChange={(e) => updateTemplateForm('name', e.target.value)}
                        />
                      </div>

                      {/* Configuración */}
                      <div className="space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <h4 className="text-sm font-medium text-gray-900">Configuración</h4>

                        {/* Obligatorio */}
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={templateForm.required}
                            onChange={(e) => updateTemplateForm('required', e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900">
                            Obligatorio (el cliente debe elegir al menos una opción)
                          </span>
                        </label>

                        {/* Permitir cantidad */}
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={templateForm.allowMultiple}
                            onChange={(e) => updateTemplateForm('allowMultiple', e.target.checked)}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm text-gray-900">
                            Permitir cantidad por opción (ej: Coca Cola x2, x3...)
                          </span>
                        </label>

                        {/* Mínimo y máximo */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cantidad mínima
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={templateForm.minSelections}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 99)) {
                                  updateTemplateForm('minSelections', value)
                                }
                              }}
                              placeholder="0"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">De 0 a 99</p>
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Cantidad máxima
                            </label>
                            <input
                              type="text"
                              inputMode="numeric"
                              value={templateForm.maxSelections}
                              onChange={(e) => {
                                const value = e.target.value
                                if (value === '' || (/^\d+$/.test(value) && parseInt(value) <= 99)) {
                                  updateTemplateForm('maxSelections', value)
                                }
                              }}
                              placeholder="99"
                              className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                            />
                            <p className="mt-1 text-xs text-gray-500">De 0 a 99</p>
                          </div>
                        </div>
                      </div>

                      {/* Opciones */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Opciones
                        </label>

                        {templateForm.options.length === 0 ? (
                          <div className="text-center py-8 border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                            <button
                              type="button"
                              onClick={addTemplateOption}
                              className="inline-flex flex-col items-center justify-center text-gray-500 hover:text-primary-600"
                            >
                              <div className="mb-2 w-12 h-12 rounded-full bg-white border-2 border-gray-300 flex items-center justify-center">
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              </div>
                              <span className="text-sm font-medium">Agregar primera opción</span>
                              <span className="text-xs text-gray-400 mt-1">Ej: Coca Cola, Pepsi, Fanta...</span>
                            </button>
                          </div>
                        ) : (
                          <>
                            <div className="space-y-2">
                              {templateForm.options.map((option) => (
                                <div key={option.id} className="relative p-3 bg-gray-50 rounded border border-gray-200 space-y-2">
                                  {/* Botón eliminar */}
                                  <button
                                    type="button"
                                    onClick={() => removeTemplateOption(option.id)}
                                    className="absolute top-2 right-2 text-gray-400 hover:text-red-600"
                                    title="Eliminar opción"
                                  >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                  </button>

                                  {/* Nombre */}
                                  <div className="pr-8">
                                    <label className="block text-xs font-medium text-gray-600 mb-1">
                                      Nombre
                                    </label>
                                    <input
                                      type="text"
                                      placeholder="Ej: Coca Cola"
                                      value={option.name}
                                      onChange={(e) => updateTemplateOption(option.id, 'name', e.target.value)}
                                      className="block w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                    />
                                  </div>

                                  {/* Precio y default */}
                                  <div className="flex items-end gap-2">
                                    <div className="flex-1">
                                      <label className="block text-xs font-medium text-gray-600 mb-1">
                                        Precio modificador
                                      </label>
                                      <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                          <span className="text-gray-500 text-sm">{currencySymbol}</span>
                                        </div>
                                        <input
                                          type="number"
                                          value={option.priceModifier}
                                          onChange={(e) => updateTemplateOption(option.id, 'priceModifier', e.target.value)}
                                          placeholder="5.00"
                                          step="0.01"
                                          className="block w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                                        />
                                      </div>
                                    </div>
                                    <label className="flex items-center cursor-pointer pb-2 whitespace-nowrap">
                                      <input
                                        type="checkbox"
                                        checked={option.isDefault}
                                        onChange={(e) => updateTemplateOption(option.id, 'isDefault', e.target.checked)}
                                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                      />
                                      <span className="ml-1 text-xs text-gray-600">Por defecto</span>
                                    </label>
                                  </div>
                                </div>
                              ))}
                            </div>

                            {/* Botón agregar más */}
                            <button
                              type="button"
                              onClick={addTemplateOption}
                              className="mt-3 w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-sm font-medium text-gray-600 hover:text-primary-600 hover:border-primary-300 hover:bg-primary-50 transition-colors flex items-center justify-center gap-2"
                            >
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Agregar opción
                            </button>
                          </>
                        )}
                      </div>
                    </div>

                    {/* Footer con botones */}
                    <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowTemplateModal(false)
                          setTemplateForm({
                            id: '',
                            name: '',
                            required: false,
                            allowMultiple: false,
                            minSelections: '',
                            maxSelections: '',
                            order: 0,
                            options: []
                          })
                          setEditingTemplate(null)
                        }}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                      >
                        Cancelar
                      </button>
                      <button
                        type="button"
                        onClick={handleSaveTemplate}
                        disabled={savingTemplate}
                        className="px-4 py-2 text-sm font-medium text-white bg-primary-600 rounded-lg hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {savingTemplate ? 'Guardando...' : (editingTemplate ? 'Actualizar' : 'Crear plantilla')}
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 7. Configuraciones avanzadas (Envío) */}
              <Card className="p-6">
                <button
                  onClick={() => setShowAdvanced(!showAdvanced)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('shipping.title')}</h2>
                    <p className="text-sm text-gray-500">
                      {t('shipping.subtitle')}
                    </p>
                  </div>
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
                        className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
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

              {/* 8. SEO */}
              <Card className="p-6">
                <button
                  onClick={() => setShowSEO(!showSEO)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-1">{t('seo.title')}</h2>
                    <p className="text-sm text-gray-500">
                      {t('seo.subtitle')}
                    </p>
                  </div>
                  <span className="text-gray-400">
                    {showSEO ? '−' : '+'}
                  </span>
                </button>

                {showSEO && (
                  <div className="mt-4">
                    {/* Vista previa de Google */}
                    <div className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50">
                  <h3 className="text-sm font-medium text-gray-700 mb-3">Vista previa de la búsqueda de Google</h3>
                  <div className="space-y-1">
                    <div className="text-blue-600 text-lg hover:underline cursor-pointer break-words">
                      {seoTitle || productName || 'Título del producto'}
                    </div>
                    <div className="text-green-700 text-sm break-all overflow-hidden">
                      https://{store?.subdomain || 'mi-tienda'}.shopifree.app/products/{urlSlug || 'producto-123'}
                    </div>
                    <div className="text-gray-600 text-sm break-words">
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
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 text-base sm:text-sm"
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
                  </div>
                )}
              </Card>
            </div>

            {/* Barra lateral */}
            <div className="space-y-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">{t('status.title')}</h3>
                <select 
                  value={productStatus}
                  onChange={(e) => setProductStatus(e.target.value as 'draft' | 'active' | 'archived')}
                  className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm"
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
                              className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
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
                                className="h-4 w-4 text-gray-600 focus:ring-gray-500 border-gray-300 rounded"
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
                      className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-gray-500 focus:border-gray-500 text-base sm:text-sm"
                    >
                      <option value="">{t('organization.brandPlaceholder')}</option>
                      {brands.map((brand) => (
                        <option key={brand.id} value={brand.id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>
                  </div>

                </div>
              </Card>
            </div>
          </div>

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

          {/* Botones de acción */}
          <div className="flex justify-end space-x-3 mt-8 mb-8">
            <Button variant="secondary" onClick={() => router.back()} disabled={saving}>
              {t('buttons.discard')}
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
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
    </DashboardLayout>
  )
}