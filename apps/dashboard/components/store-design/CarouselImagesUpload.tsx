import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '../../lib/hooks/useStore'
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../lib/cloudinary'
import { doc, updateDoc } from 'firebase/firestore'
import { getFirebaseDb } from '../../lib/firebase'
import { useToast } from '../../lib/hooks/useToast'
import { Toast } from '../shared/Toast'

export default function CarouselImagesUpload() {
  const t = useTranslations('storeDesign.sections.carousel')
  const tActions = useTranslations('storeDesign.actions')
  const { store, mutate, loading } = useStore()
  const { toast, showToast, hideToast } = useToast()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)
  const [linkInputs, setLinkInputs] = useState<{[key: string]: string}>({})

  const carouselImages = store?.carouselImages || []
  const maxImages = 5

  const handleImageUpload = async (files: FileList) => {
    try {
      setIsUploading(true)
      setError(null)

      const remainingSlots = maxImages - carouselImages.length
      const filesToUpload = Array.from(files).slice(0, remainingSlots)

      if (filesToUpload.length === 0) {
        setError(t('maxImagesError', { max: maxImages }))
        return
      }

      const uploadPromises = filesToUpload.map(async (file, index) => {
        const result = await uploadImageToCloudinary(file, {
          folder: 'banners',
          storeId: store?.id
        })

        return {
          url: result.secure_url,
          publicId: result.public_id,
          order: carouselImages.length + index,
          link: null
        }
      })

      const uploadedImages = await Promise.all(uploadPromises)
      const newCarouselImages = [...carouselImages, ...uploadedImages]

      // Actualizar en Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          carouselImages: newCarouselImages
        })

        // Actualizar el estado local
        mutate({
          ...store,
          carouselImages: newCarouselImages
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('uploadError'))
      console.error('Error uploading carousel images:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageDelete = async (publicId: string) => {
    try {
      setIsUploading(true)
      setError(null)

      // Eliminar imagen de Cloudinary
      await deleteImageFromCloudinary(publicId)

      // Filtrar y reordenar las imágenes restantes
      const updatedImages = carouselImages
        .filter(img => img.publicId !== publicId)
        .map((img, index) => ({ ...img, order: index }))

      // Actualizar en Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          carouselImages: updatedImages
        })

        // Actualizar el estado local
        mutate({
          ...store,
          carouselImages: updatedImages
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteError'))
      console.error('Error deleting carousel image:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault()
    if (draggedIndex === null || draggedIndex === index) return

    const newImages = [...carouselImages]
    const draggedImage = newImages[draggedIndex]
    newImages.splice(draggedIndex, 1)
    newImages.splice(index, 0, draggedImage)

    // Actualizar órdenes
    const updatedImages = newImages.map((img, idx) => ({
      ...img,
      order: idx
    }))

    // Actualizar en Firestore
    const db = getFirebaseDb()
    if (store?.id && db) {
      const storeRef = doc(db, 'stores', store.id)
      updateDoc(storeRef, {
        carouselImages: updatedImages
      })

      // Actualizar el estado local
      mutate({
        ...store,
        carouselImages: updatedImages
      })
    }

    setDraggedIndex(index)
  }

  const handleDragEnd = () => {
    setDraggedIndex(null)
  }

  const handleSaveAllLinks = async () => {
    try {
      setIsUploading(true)
      setError(null)

      // Crear imágenes actualizadas con los enlaces de los inputs
      const updatedImages = carouselImages.map(img => {
        const newLink = linkInputs[img.publicId] ?? img.link ?? ''
        const linkToSave = newLink.trim() === '' ? null : newLink.trim()
        return { ...img, link: linkToSave }
      })

      // Actualizar en Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          carouselImages: updatedImages
        })

        // Actualizar el estado local
        mutate({
          ...store,
          carouselImages: updatedImages
        })

        // Limpiar todos los inputs locales después de guardar
        setLinkInputs({})

        // Mostrar toast de éxito
        showToast(tActions('saved'), 'success')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error updating links')
      showToast(tActions('error'), 'error')
      console.error('Error updating carousel image links:', err)
    } finally {
      setIsUploading(false)
    }
  }





  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t('title')}</h4>
        <p className="text-sm text-gray-500 mb-4">
          {t('description', { maxImages })}
        </p>

        {/* Tips */}
        <div className="mb-4 text-sm text-gray-500">
          <p>{t('tips.drag')}</p>
          <p>{t('tips.size')}</p>
          <p>{t('tips.formats')}</p>
        </div>

        {/* Vista previa de imágenes */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
          {carouselImages
            .sort((a, b) => a.order - b.order)
            .map((image, index) => (
              <div
                key={image.publicId}
                className="space-y-2"
              >
                <div
                  draggable
                  onDragStart={() => handleDragStart(index)}
                  onDragOver={(e) => handleDragOver(e, index)}
                  onDragEnd={handleDragEnd}
                  className="relative group cursor-move"
                >
                  <img
                    src={image.url}
                    alt={`Carousel ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg"
                  />
                  <div className="absolute top-2 right-2">
                    <button
                      onClick={() => handleImageDelete(image.publicId)}
                      disabled={isUploading}
                      className="bg-white text-red-600 px-2 py-1 rounded text-sm shadow hover:bg-gray-50"
                    >
                      {t('delete')}
                    </button>
                  </div>
                </div>

                {/* Input de enlace */}
                <div className="space-y-1">
                  <label className="text-xs text-gray-600">{t('link')}</label>
                  <input
                    type="url"
                    placeholder={t('linkPlaceholder')}
                    value={linkInputs[image.publicId] ?? image.link ?? ''}
                    onChange={(e) => setLinkInputs(prev => ({
                      ...prev,
                      [image.publicId]: e.target.value
                    }))}
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
                  />
                </div>
              </div>
            ))}

          {carouselImages.length < maxImages && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
              <label className="cursor-pointer">
                <div className="space-y-1">
                  <div className="text-gray-600">{t('upload')}</div>
                  <div className="text-sm text-gray-500">{t('dragAndDrop')}</div>
                  <div className="text-xs text-gray-400">{t('fileTypes')}</div>
                </div>
                <input
                  type="file"
                  multiple
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files && handleImageUpload(e.target.files)}
                  disabled={isUploading}
                />
              </label>
            </div>
          )}
        </div>

        {/* Botón para guardar enlaces */}
        {carouselImages.length > 0 && (
          <div className="flex justify-end">
            <button
              onClick={handleSaveAllLinks}
              disabled={isUploading}
              className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 rounded-md font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isUploading ? tActions('saving') : tActions('save')}
            </button>
          </div>
        )}

        {/* Contador de imágenes */}
        <div className="text-sm text-gray-500">
          {t('imagesUploaded', {
            current: carouselImages.length,
            max: maxImages
          })}
        </div>

        {isUploading && (
          <div className="mt-2 text-sm text-gray-500">{t('processing')}</div>
        )}

        {error && (
          <div className="mt-2 text-sm text-red-600">{error}</div>
        )}
      </div>

      {/* Toast notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </div>
  )
} 