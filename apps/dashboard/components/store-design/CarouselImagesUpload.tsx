import React, { useState } from 'react'
import { useStore } from '../../lib/hooks/useStore'
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../lib/cloudinary'
import { doc, updateDoc } from 'firebase/firestore'
import { getFirebaseDb } from '../../lib/firebase'

export default function CarouselImagesUpload() {
  const { store, mutate } = useStore()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null)

  const carouselImages = store?.carouselImages || []
  const maxImages = 5

  const handleImageUpload = async (files: FileList) => {
    try {
      setIsUploading(true)
      setError(null)

      const remainingSlots = maxImages - carouselImages.length
      const filesToUpload = Array.from(files).slice(0, remainingSlots)

      if (filesToUpload.length === 0) {
        setError(`Ya tienes el máximo de ${maxImages} imágenes`)
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
          order: carouselImages.length + index
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
      setError(err instanceof Error ? err.message : 'Error al subir imágenes')
      console.error('Error uploading carousel images:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageDelete = async (index: number) => {
    try {
      setIsUploading(true)
      setError(null)

      const imageToDelete = carouselImages[index]
      
      // Eliminar imagen de Cloudinary
      if (imageToDelete.publicId) {
        await deleteImageFromCloudinary(imageToDelete.publicId)
      }

      // Actualizar array eliminando la imagen y reordenando
      const newCarouselImages = carouselImages
        .filter((_, i) => i !== index)
        .map((img, i) => ({ ...img, order: i }))

      // Actualizar Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          carouselImages: newCarouselImages
        })

        // Actualizar estado local
        mutate({
          ...store,
          carouselImages: newCarouselImages
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar imagen')
      console.error('Error deleting carousel image:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleDragStart = (index: number) => {
    setDraggedIndex(index)
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault()
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null)
      return
    }

    try {
      setIsUploading(true)
      
      const newCarouselImages = [...carouselImages]
      const draggedImage = newCarouselImages[draggedIndex]
      
      // Remover imagen de posición original
      newCarouselImages.splice(draggedIndex, 1)
      
      // Insertar en nueva posición
      newCarouselImages.splice(dropIndex, 0, draggedImage)
      
      // Actualizar orden
      const reorderedImages = newCarouselImages.map((img, i) => ({ ...img, order: i }))

      // Actualizar Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          carouselImages: reorderedImages
        })

        // Actualizar estado local
        mutate({
          ...store,
          carouselImages: reorderedImages
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reordenar imágenes')
      console.error('Error reordering carousel images:', err)
    } finally {
      setIsUploading(false)
      setDraggedIndex(null)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
  }

  const handleDragAndDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const files = e.dataTransfer.files
    if (files && files.length > 0) {
      handleImageUpload(files)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Imágenes del Carrusel</h4>
        <p className="text-sm text-gray-500 mb-4">
          Sube hasta {maxImages} imágenes para el carrusel principal de tu tienda. 
          Recomendamos imágenes horizontales de 1920x600px para mejor visualización.
        </p>

        {/* Grid de imágenes existentes */}
        {carouselImages.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {carouselImages.map((image, index) => (
              <div
                key={image.publicId}
                className="relative group cursor-move"
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, index)}
              >
                <img
                  src={image.url}
                  alt={`Carousel image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 rounded-lg">
                  <div className="flex space-x-2">
                    <span className="px-2 py-1 bg-white text-gray-700 text-xs rounded shadow">
                      {index + 1}
                    </span>
                    <button
                      onClick={() => handleImageDelete(index)}
                      className="px-2 py-1 bg-red-500 text-white text-xs rounded shadow hover:bg-red-600 transition-colors"
                      disabled={isUploading}
                    >
                      Eliminar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Área de subida */}
        {carouselImages.length < maxImages && (
          <div
            className={`
              border-2 border-dashed border-gray-300 rounded-lg p-8
              flex flex-col items-center justify-center
              ${isUploading ? 'bg-gray-50' : 'hover:bg-gray-50'}
              transition-colors duration-200
            `}
            onDragOver={handleDragOver}
            onDrop={handleDragAndDrop}
          >
            <label className="cursor-pointer w-full">
              <div className="text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  stroke="currentColor"
                  fill="none"
                  viewBox="0 0 48 48"
                  aria-hidden="true"
                >
                  <path
                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                <div className="mt-4 flex text-sm text-gray-600">
                  <span className="relative rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500">
                    Sube imágenes
                  </span>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  PNG, JPG hasta 5MB cada una
                </p>
                <p className="text-xs text-gray-500">
                  {carouselImages.length}/{maxImages} imágenes subidas
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>
        )}

        {/* Botón adicional para agregar más imágenes */}
        {carouselImages.length > 0 && carouselImages.length < maxImages && (
          <div className="mt-4 flex justify-center">
            <label className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer">
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              Agregar más imágenes
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                multiple
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>
        )}

        {/* Estados de carga y errores */}
        {isUploading && (
          <div className="mt-4 text-sm text-gray-500 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Procesando imágenes...
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600 bg-red-50 p-3 rounded-md">
            {error}
          </div>
        )}

        {/* Información adicional */}
        <div className="mt-6 text-xs text-gray-500">
          <p className="mb-1">• Puedes arrastrar las imágenes para reordenarlas</p>
          <p className="mb-1">• Tamaño recomendado: 1920x600px (proporción 16:5)</p>
          <p>• Formatos soportados: JPG, PNG</p>
        </div>
      </div>
    </div>
  )
} 