import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '../../lib/hooks/useStore'
import { uploadImageToCloudinary, deleteImageFromCloudinary } from '../../lib/cloudinary'
import { doc, updateDoc } from 'firebase/firestore'
import { getFirebaseDb } from '../../lib/firebase'

export default function HeroImageUpload() {
  const t = useTranslations('storeDesign.sections.hero')
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
      setError(err instanceof Error ? err.message : t('uploadError'))
      console.error('Error uploading hero image:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleImageDelete = async () => {
    if (!store?.heroImagePublicId) return

    try {
      setIsUploading(true)
      setError(null)

      // Eliminar imagen de Cloudinary
      await deleteImageFromCloudinary(store.heroImagePublicId)

      // Actualizar en Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          heroImageUrl: undefined,
          heroImagePublicId: undefined
        })

        // Actualizar el estado local
        mutate({
          ...store,
          heroImageUrl: undefined,
          heroImagePublicId: undefined
        })
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('deleteError'))
      console.error('Error deleting hero image:', err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t('title')}</h4>
        <p className="text-sm text-gray-500 mb-4">{t('description')}</p>

        {store?.heroImageUrl ? (
          <div className="relative">
            <img
              src={store.heroImageUrl}
              alt="Hero"
              className="w-full h-48 object-cover rounded-lg"
            />
            <div className="absolute top-2 right-2 flex space-x-2">
              <label
                className="cursor-pointer bg-white text-gray-700 px-3 py-1 rounded-md text-sm font-medium shadow hover:bg-gray-50"
              >
                {t('change')}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                  disabled={isUploading}
                />
              </label>
              <button
                onClick={handleImageDelete}
                disabled={isUploading}
                className="bg-white text-red-600 px-3 py-1 rounded-md text-sm font-medium shadow hover:bg-gray-50"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <label className="cursor-pointer">
              <div className="space-y-1">
                <div className="text-gray-600">{t('upload')}</div>
                <div className="text-sm text-gray-500">{t('dragAndDrop')}</div>
                <div className="text-xs text-gray-400">{t('fileTypes')}</div>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                disabled={isUploading}
              />
            </label>
          </div>
        )}

        {isUploading && (
          <div className="mt-2 text-sm text-gray-500">{t('uploading')}</div>
        )}

        {error && (
          <div className="mt-2 text-sm text-red-600">{error}</div>
        )}
      </div>
    </div>
  )
} 