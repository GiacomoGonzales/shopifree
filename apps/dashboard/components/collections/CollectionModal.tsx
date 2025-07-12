'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { CollectionWithId } from '../../lib/collections'
import { ProductWithId } from '../../lib/products'
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../lib/cloudinary'

interface CollectionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (collectionData: any) => void
  collection?: CollectionWithId | null
  storeId: string
  products: ProductWithId[]
}

export default function CollectionModal({
  isOpen,
  onClose,
  onSave,
  collection,
  storeId,
  products
}: CollectionModalProps) {
  const t = useTranslations('pages.collections')
  
  // Form state
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [image, setImage] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([])
  
  // UI state
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDraggingOver, setIsDraggingOver] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Reset form when modal opens/closes or collection changes
  useEffect(() => {
    if (isOpen) {
      if (collection) {
        // Editing existing collection
        setTitle(collection.title)
        setDescription(collection.description || '')
        setImage(collection.image || '')
        setSelectedProductIds(collection.productIds || [])
      } else {
        // Creating new collection
        setTitle('')
        setDescription('')
        setImage('')
        setSelectedProductIds([])
      }
      setImageFile(null)
      setErrors({})
    }
  }, [isOpen, collection])

  const validateForm = () => {
    const newErrors: Record<string, string> = {}
    
    if (!title.trim()) {
      newErrors.title = t('messages.titleRequired')
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      
      // Delete previous image if exists
      if (image && collection?.image) {
        try {
          await deleteImageFromCloudinary(collection.image)
        } catch (error) {
          console.warn('Error deleting previous image:', error)
        }
      }
      
      const uploadResult = await uploadImageToCloudinary(file, {
        folder: 'collections',
        storeId: storeId
      })
      setImage(uploadResult.secure_url)
      setImageFile(null)
    } catch (error) {
      console.error('Error uploading image:', error)
      setErrors({ ...errors, image: t('messages.imageUploadError') })
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageRemove = async () => {
    if (image) {
      try {
        await deleteImageFromCloudinary(image)
      } catch (error) {
        console.warn('Error deleting image:', error)
      }
    }
    setImage('')
    setImageFile(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    console.log('🔥 Modal handleSubmit llamado con:', {
      title: title.trim(),
      description: description.trim(),
      image,
      selectedProductIds
    })
    
    if (!validateForm()) {
      console.error('❌ Validación de formulario falló')
      return
    }

    try {
      setIsSaving(true)
      
      // Upload image if there's a new file
      let finalImageUrl = image
      if (imageFile) {
        console.log('📸 Subiendo imagen nueva...')
        const uploadResult = await uploadImageToCloudinary(imageFile, {
          folder: 'collections',
          storeId: storeId
        })
        finalImageUrl = uploadResult.secure_url
        console.log('✅ Imagen subida:', finalImageUrl)
      }

      const collectionData = {
        title: title.trim(),
        description: description.trim(),
        image: finalImageUrl,
        productIds: selectedProductIds
      }

      console.log('📝 Datos finales a enviar:', collectionData)
      await onSave(collectionData)
      onClose()
    } catch (error) {
      console.error('❌ Error saving collection in modal:', error)
      setErrors({ ...errors, general: t('messages.error') })
    } finally {
      setIsSaving(false)
    }
  }

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds(prev => 
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    )
  }

  // Filter products based on search query
  const filteredProducts = products.filter(product => {
    if (!searchQuery.trim()) return true
    const query = searchQuery.toLowerCase().trim()
    return product.name.toLowerCase().includes(query) ||
           product.description?.toLowerCase().includes(query)
  })

  // Handlers para drag & drop
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDraggingOver(false)
    
    const files = e.dataTransfer.files
    if (files && files[0]) {
      setImageFile(files[0])
      handleImageUpload(files[0])
    }
  }

  if (!isOpen) return null

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id))

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-40">
        <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">
              {collection ? t('editCollection') : t('addCollection')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-4 space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.title')} *
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={t('form.titlePlaceholder')}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600 ${
                  errors.title ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.description')}
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder={t('form.descriptionPlaceholder')}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
              />
            </div>

            {/* Image Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('form.image')}
              </label>
              <p className="text-sm text-gray-500 mb-3">{t('form.imageHint')}</p>
              
              <div className="relative">
                {image ? (
                  /* Vista previa de la imagen */
                  <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                    <img
                      src={image}
                      alt="Preview"
                      className="w-full h-40 object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex space-x-2">
                        <label className="px-3 py-1 bg-white text-gray-700 text-xs rounded shadow hover:bg-gray-50 transition-colors cursor-pointer">
                          {t('imageUpload.change')}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => {
                              const file = e.target.files?.[0]
                              if (file) {
                                setImageFile(file)
                                handleImageUpload(file)
                              }
                            }}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleImageRemove}
                          className="px-3 py-1 bg-red-500 text-white text-xs rounded shadow hover:bg-red-600 transition-colors"
                        >
                          {t('imageUpload.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Área de subida */
                  <div 
                    className={`border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer group ${
                      isDraggingOver 
                        ? 'border-gray-400 bg-gray-100 scale-105 shadow-lg' 
                        : 'border-gray-300 bg-gray-50 hover:border-gray-400 hover:bg-gray-100'
                    }`}
                    onDragEnter={handleDragEnter}
                    onDragLeave={handleDragLeave}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      disabled={isUploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) {
                          setImageFile(file)
                          handleImageUpload(file)
                        }
                      }}
                    />
                    {isUploading ? (
                      <div className="space-y-3">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-lg bg-gray-100">
                          <svg className="animate-spin h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                        </div>
                        <p className="text-sm font-medium text-gray-600">
                          {t('imageUpload.uploading')}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className={`mx-auto flex items-center justify-center h-12 w-12 rounded-lg transition-colors ${
                          isDraggingOver 
                            ? 'bg-gray-200' 
                            : 'bg-gray-200 group-hover:bg-gray-300'
                        }`}>
                          {isDraggingOver ? (
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                            </svg>
                          ) : (
                            <svg className="h-6 w-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 002 2z" />
                            </svg>
                          )}
                        </div>
                        <div>
                          <p className={`text-sm font-medium transition-colors ${
                            isDraggingOver 
                              ? 'text-gray-700' 
                              : 'text-gray-700 group-hover:text-gray-800'
                          }`}>
                            {isDraggingOver ? '¡Suelta aquí tu imagen!' : t('imageUpload.dropZone')}
                          </p>
                          <p className={`text-xs mt-1 transition-colors ${
                            isDraggingOver 
                              ? 'text-gray-500' 
                              : 'text-gray-500'
                          }`}>
                            {t('imageUpload.formats')}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
              {errors.image && (
                <p className="mt-2 text-sm text-red-600">{errors.image}</p>
              )}
            </div>

            {/* Products */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('form.products')}
              </label>
              <p className="text-sm text-gray-500 mb-3">{t('form.productsHint')}</p>
              
              {products.length === 0 ? (
                <div className="text-center py-8 border border-gray-200 rounded-md bg-gray-50">
                  <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No hay productos disponibles</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Crea algunos productos primero para poder agregarlos a la colección.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Search products */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                    />
                  </div>

                  {/* Selected products count */}
                  {selectedProductIds.length > 0 && (
                    <div className="text-sm text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
                      {selectedProductIds.length} {selectedProductIds.length === 1 ? 'producto seleccionado' : 'productos seleccionados'}
                    </div>
                  )}

                  {/* Products list */}
                  <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                    {filteredProducts.map((product) => {
                      const isSelected = selectedProductIds.includes(product.id)
                      return (
                        <div
                          key={product.id}
                          className={`flex items-center space-x-3 p-3 border-b border-gray-100 last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                            isSelected ? 'bg-blue-50' : ''
                          }`}
                          onClick={() => handleProductToggle(product.id)}
                        >
                          <div className="flex-shrink-0">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={(e) => {
                                e.stopPropagation()
                                handleProductToggle(product.id)
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="h-4 w-4 text-gray-600 focus:ring-gray-600 border-gray-300 rounded"
                            />
                          </div>
                          
                          {product.mediaFiles && product.mediaFiles.length > 0 ? (
                            (() => {
                              const mediaUrl = product.mediaFiles[0].url
                              const isVideo = mediaUrl.includes('/video/') || 
                                             mediaUrl.match(/\.(mp4|webm|ogg|avi|mov)$/i)
                              
                              if (isVideo) {
                                // Generar thumbnail para videos de Cloudinary
                                let thumbnailUrl = mediaUrl
                                if (mediaUrl.includes('cloudinary.com')) {
                                  // Transformar URL de video a thumbnail
                                  thumbnailUrl = mediaUrl.replace('/video/upload/', '/video/upload/so_0,w_200,h_200,c_fill,f_jpg/')
                                }
                                
                                return (
                                  <div className="relative w-10 h-10 rounded-lg overflow-hidden">
                                    <img
                                      src={thumbnailUrl}
                                      alt={product.name}
                                      className="w-full h-full object-cover"
                                      onError={(e) => {
                                        // Si falla el thumbnail, mostrar icono de video
                                        e.currentTarget.style.display = 'none'
                                        e.currentTarget.nextElementSibling?.classList.remove('hidden')
                                      }}
                                    />
                                    <div className="hidden absolute inset-0 bg-gray-100 flex items-center justify-center">
                                      <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                    {/* Indicador de video */}
                                    <div className="absolute bottom-0 right-0 bg-black bg-opacity-60 text-white p-0.5 rounded-tl">
                                      <svg className="w-2 h-2" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z"/>
                                      </svg>
                                    </div>
                                  </div>
                                )
                              } else {
                                return (
                                  <img
                                    src={mediaUrl}
                                    alt={product.name}
                                    className="w-10 h-10 rounded-lg object-cover"
                                  />
                                )
                              }
                            })()
                          ) : (
                            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                              </svg>
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{product.name}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="text-sm font-medium text-gray-900">${product.price.toFixed(2)}</span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                product.status === 'active' 
                                  ? 'bg-green-100 text-green-800'
                                  : product.status === 'draft'
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-gray-100 text-gray-800'
                              }`}>
                                {product.status}
                              </span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>



            {/* General Error */}
            {errors.general && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-sm text-red-600">{errors.general}</p>
              </div>
            )}
          </form>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors duration-200"
            >
              {t('actions.cancel')}
            </button>
            <button
              type="submit"
              onClick={handleSubmit}
              disabled={isSaving || isUploading}
              className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-colors duration-200"
            >
              {isSaving 
                ? t('actions.saving')
                : collection 
                  ? t('actions.update') 
                  : t('actions.create')
              }
            </button>
          </div>
        </div>
      </div>


    </>
  )
} 