'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { BrandWithId } from '../../lib/brands'
import { uploadImageToCloudinary, deleteImageFromCloudinary, validateImageFile } from '../../lib/cloudinary'

interface BrandModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (brandData: any) => Promise<void>
  brand?: BrandWithId | null
  storeId: string
}

export default function BrandModal({
  isOpen,
  onClose,
  onSave,
  brand,
  storeId
}: BrandModalProps) {
  const t = useTranslations('pages.brands')
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: ''
  })
  
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isUploading, setIsUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  // Resetear formulario cuando se abre/cierra el modal o cambia la marca
  useEffect(() => {
    if (isOpen) {
      if (brand) {
        // Editar marca existente
        setFormData({
          name: brand.name || '',
          description: brand.description || '',
          image: brand.image || ''
        })
        setImagePreview(brand.image || '')
      } else {
        // Nueva marca
        setFormData({
          name: '',
          description: '',
          image: ''
        })
        setImagePreview('')
      }
      setImageFile(null)
      setErrors({})
    }
  }, [isOpen, brand])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = t('messages.nameRequired')
    }

    if (!formData.image && !imageFile) {
      newErrors.image = t('messages.imageRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const validation = validateImageFile(file)
    if (!validation.isValid) {
      setErrors({ ...errors, image: validation.error || t('messages.imageUploadError') })
      return
    }

    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
    setErrors({ ...errors, image: '' })
  }

  const handleRemoveImage = () => {
    setImageFile(null)
    setImagePreview('')
    setFormData({
      ...formData,
      image: ''
    })
  }

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
      handleImageChange({ target: { files } } as any)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsSaving(true)

    try {
      let imageUrl = formData.image

      // Si hay una nueva imagen para subir
      if (imageFile) {
        setIsUploading(true)

        // Si había una imagen anterior y tenemos el public_id, eliminarla
        if (formData.image && brand?.image) {
          try {
            // Extraer public_id de la URL de Cloudinary si es posible
            const urlParts = brand.image.split('/')
            const lastPart = urlParts[urlParts.length - 1]
            const publicId = lastPart.split('.')[0]
            if (publicId && brand.image.includes('cloudinary')) {
              await deleteImageFromCloudinary(`brands/${publicId}`)
            }
          } catch (deleteError) {
            console.warn('Error deleting previous image:', deleteError)
            // No bloquear el proceso si no se puede eliminar la imagen anterior
          }
        }

        // Subir nueva imagen
        const uploadResult = await uploadImageToCloudinary(imageFile, {
          folder: 'brands' as const,
          storeId: storeId
        })

        imageUrl = uploadResult.secure_url
        setIsUploading(false)
      }

      const brandData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        image: imageUrl
      }

      await onSave(brandData)
      onClose()
    } catch (error) {
      console.error('Error saving brand:', error)
      setErrors({ 
        general: error instanceof Error ? error.message : t('messages.error') 
      })
    } finally {
      setIsSaving(false)
      setIsUploading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              {brand ? t('editBrand') : t('addBrand')}
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {errors.general && (
            <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
              {errors.general}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Nombre */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.name')} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder={t('form.namePlaceholder')}
                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-gray-600 focus:border-gray-600 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {t('form.description')}
              </label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={t('form.descriptionPlaceholder')}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-gray-600 focus:border-gray-600"
              />
            </div>

            {/* Imagen */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                {t('form.image')} *
              </label>
              <div className="relative">
                {imagePreview ? (
                  /* Vista previa de la imagen */
                  <div className="relative border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
                    <img
                      src={imagePreview}
                      alt="Brand preview"
                      className="w-full h-32 object-contain"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 hover:opacity-100">
                      <div className="flex space-x-2">
                        <label className="px-3 py-1 bg-white text-gray-700 text-xs rounded shadow hover:bg-gray-50 transition-colors cursor-pointer">
                          {t('imageUpload.change')}
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleImageChange}
                          />
                        </label>
                        <button
                          type="button"
                          onClick={handleRemoveImage}
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
                    className={`border-2 border-dashed rounded-lg p-4 text-center transition-all duration-200 cursor-pointer group ${
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
                      onChange={handleImageChange}
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
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2v12a2 2 0 002 2z" />
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
                <p className="mt-1 text-sm text-red-600">{errors.image}</p>
              )}
              <p className="mt-2 text-xs text-gray-500">{t('form.imageHint')}</p>
            </div>

            {/* Botones */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50"
              >
                {t('actions.cancel')}
              </button>
              <button
                type="submit"
                disabled={isSaving || isUploading}
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-600 disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {isUploading ? t('imageUpload.uploading') : t('actions.saving')}
                  </>
                ) : (
                  brand ? t('actions.update') : t('actions.create')
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
} 