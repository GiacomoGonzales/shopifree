import React, { useState } from 'react'
import { useStore } from '../../lib/hooks/useStore'
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../lib/cloudinary'
import { doc, updateDoc } from 'firebase/firestore'
import { getFirebaseDb } from '../../lib/firebase'

export default function HeroImageUpload() {
  const { store, mutate } = useStore()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setError(null)

      // Si ya existe una imagen hero y tenemos su public_id, eliminarla
      if (store?.heroImagePublicId) {
        await deleteImageFromCloudinary(store.heroImagePublicId)
      }

      // Subir nueva imagen
      const result = await uploadImageToCloudinary(file, {
        folder: 'hero',
        storeId: store?.id
      })

      // Actualizar en Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          heroImageUrl: result.secure_url,
          heroImagePublicId: result.public_id
        })

        // Actualizar el estado local
        mutate({
          ...store,
          heroImageUrl: result.secure_url,
          heroImagePublicId: result.public_id
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir imagen')
      console.error('Error uploading hero image:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageDelete = async () => {
    try {
      setIsUploading(true)
      setError(null)

      // Eliminar imagen de Cloudinary
      if (store?.heroImagePublicId) {
        await deleteImageFromCloudinary(store.heroImagePublicId)
      }

      // Actualizar Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          heroImageUrl: undefined,
          heroImagePublicId: undefined
        })

        // Actualizar estado local
        mutate({
          ...store,
          heroImageUrl: undefined,
          heroImagePublicId: undefined
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar imagen')
      console.error('Error deleting hero image:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">Imagen Hero</h4>
        <p className="text-sm text-gray-500 mb-4">
          Esta imagen se mostrará al inicio de tu tienda como portada. Usa una imagen horizontal de alta calidad para destacar tu marca.
        </p>

        {/* Vista previa de la imagen */}
        {store?.heroImageUrl && (
          <div className="mb-4 relative group">
            <img
              src={store.heroImageUrl}
              alt="Hero preview"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
              <div className="flex space-x-2">
                <label className="px-3 py-1 bg-white text-gray-700 text-xs rounded shadow hover:bg-gray-50 transition-colors cursor-pointer">
                  Cambiar
                  <input
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleImageUpload(file)
                    }}
                  />
                </label>
                <button
                  onClick={handleImageDelete}
                  className="px-3 py-1 bg-red-500 text-white text-xs rounded shadow hover:bg-red-600 transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Área de subida */}
        {!store?.heroImageUrl && (
          <div
            className={`
              border-2 border-dashed border-gray-300 rounded-lg p-8
              flex flex-col items-center justify-center
              ${isUploading ? 'bg-gray-50' : 'hover:bg-gray-50'}
              transition-colors duration-200
            `}
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
                    Sube una imagen
                  </span>
                  <p className="pl-1">o arrastra y suelta</p>
                </div>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG hasta 5MB</p>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/jpeg,image/png"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) handleImageUpload(file)
                }}
              />
            </label>
          </div>
        )}

        {/* Estado de carga y errores */}
        {isUploading && (
          <div className="mt-4 text-sm text-gray-500">
            Subiendo imagen...
          </div>
        )}
        {error && (
          <div className="mt-4 text-sm text-red-600">
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 