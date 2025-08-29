import React, { useState } from 'react'
import { useTranslations } from 'next-intl'
import { useStore } from '../../lib/hooks/useStore'
import { uploadMediaToCloudinary, deleteMediaFromCloudinary, getFileType } from '../../lib/cloudinary'
import { doc, updateDoc, deleteField } from 'firebase/firestore'
import { getFirebaseDb } from '../../lib/firebase'

export default function HeroImageUpload() {
  const t = useTranslations('storeDesign.sections.hero')
  const { store, mutate, loading } = useStore()
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleMediaUpload = async (file: File) => {
    try {
      setIsUploading(true)
      setError(null)

      // Determinar el tipo de archivo
      const fileType = getFileType(file)
      if (fileType === 'unknown') {
        throw new Error('Tipo de archivo no soportado. Solo se aceptan imágenes y videos.')
      }

      console.log('Uploading hero media:', { fileName: file.name, fileType, size: file.size })

      // Si ya existe media hero y tenemos su public_id, eliminarla
      if (store?.heroMediaPublicId && store?.heroMediaType) {
        console.log('Deleting previous hero media:', store.heroMediaPublicId, store.heroMediaType)
        await deleteMediaFromCloudinary(store.heroMediaPublicId, store.heroMediaType)
      }

      // Subir nueva media
      const result = await uploadMediaToCloudinary(file, {
        folder: 'hero',
        storeId: store?.id
      })

      console.log('Media uploaded successfully:', result)

      // Actualizar en Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          heroMediaUrl: result.secure_url,
          heroMediaPublicId: result.public_id,
          heroMediaType: fileType,
          // Mantener compatibilidad con campos legacy
          heroImageUrl: fileType === 'image' ? result.secure_url : deleteField(),
          heroImagePublicId: fileType === 'image' ? result.public_id : deleteField()
        })

        // Actualizar el estado local
        mutate({
          ...store,
          heroMediaUrl: result.secure_url,
          heroMediaPublicId: result.public_id,
          heroMediaType: fileType,
          // Mantener compatibilidad con campos legacy
          heroImageUrl: fileType === 'image' ? result.secure_url : undefined,
          heroImagePublicId: fileType === 'image' ? result.public_id : undefined
        })

        console.log('Hero media updated successfully')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('uploadError')
      setError(errorMessage)
      console.error('Error uploading hero media:', err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleMediaDelete = async () => {
    // Verificar si existe media para eliminar (nuevo formato o legacy)
    const hasNewMedia = store?.heroMediaPublicId && store?.heroMediaType
    const hasLegacyMedia = store?.heroImagePublicId
    
    if (!hasNewMedia && !hasLegacyMedia) {
      console.warn('No hero media found in store')
      return
    }

    try {
      setIsUploading(true)
      setError(null)

      // Eliminar media de Cloudinary
      if (hasNewMedia) {
        console.log('Deleting hero media:', store.heroMediaPublicId, store.heroMediaType)
        await deleteMediaFromCloudinary(store.heroMediaPublicId!, store.heroMediaType!)
      } else if (hasLegacyMedia) {
        console.log('Deleting legacy hero image:', store.heroImagePublicId)
        await deleteMediaFromCloudinary(store.heroImagePublicId!, 'image')
      }

      console.log('Media deleted from Cloudinary successfully')

      // Actualizar en Firestore
      const db = getFirebaseDb()
      if (store?.id && db) {
        console.log('Updating Firestore for store:', store.id)
        const storeRef = doc(db, 'stores', store.id)
        await updateDoc(storeRef, {
          // Eliminar campos nuevos
          heroMediaUrl: deleteField(),
          heroMediaPublicId: deleteField(),
          heroMediaType: deleteField(),
          // Eliminar campos legacy por compatibilidad
          heroImageUrl: deleteField(),
          heroImagePublicId: deleteField()
        })
        console.log('Firestore updated successfully')

        // Actualizar el estado local
        mutate({
          ...store,
          heroMediaUrl: undefined,
          heroMediaPublicId: undefined,
          heroMediaType: undefined,
          heroImageUrl: undefined,
          heroImagePublicId: undefined
        })
        console.log('Local state updated successfully')
      } else {
        throw new Error('Store ID or database not available')
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : t('deleteError')
      setError(errorMessage)
      console.error('Error deleting hero media:', err)
      console.error('Store data:', { 
        storeId: store?.id, 
        heroMediaPublicId: store?.heroMediaPublicId,
        heroMediaType: store?.heroMediaType,
        heroImagePublicId: store?.heroImagePublicId 
      })
    } finally {
      setIsUploading(false)
    }
  }

  // Determinar qué media mostrar (priorizar nuevo formato)
  const currentMediaUrl = store?.heroMediaUrl || store?.heroImageUrl
  const currentMediaType = store?.heroMediaType || (store?.heroImageUrl ? 'image' : null)

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
        <div className="h-96 bg-gray-200 rounded"></div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6">
        <h4 className="text-lg font-medium text-gray-900 mb-4">{t('title')}</h4>
        <p className="text-sm text-gray-500 mb-4">{t('description')}</p>

        {currentMediaUrl ? (
          <div className="inline-block max-w-md">
            <div className="relative">
              {currentMediaType === 'video' ? (
                <video
                  src={currentMediaUrl}
                  className="w-full max-h-64 object-cover rounded-lg shadow-sm"
                  autoPlay
                  loop
                  muted
                  playsInline
                />
              ) : (
                <img
                  src={currentMediaUrl}
                  alt="Hero"
                  className="w-full max-h-64 object-cover rounded-lg shadow-sm"
                />
              )}
              
              {/* Indicador de tipo de media */}
              <div className="absolute top-2 left-2">
                <span className="bg-white bg-opacity-90 text-gray-700 px-2 py-1 rounded text-xs font-medium shadow-sm">
                  {currentMediaType === 'video' ? 'Video' : 'Imagen'}
                </span>
              </div>
            </div>
            
            {/* Botones debajo del contenido multimedia */}
            <div className="flex justify-center space-x-3 mt-4">
              <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors">
                {t('change')}
                <input
                  type="file"
                  className="hidden"
                  accept="image/*,video/*"
                  onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0])}
                  disabled={isUploading}
                />
              </label>
              <button
                onClick={handleMediaDelete}
                disabled={isUploading}
                className="bg-gray-100 text-gray-600 px-4 py-2 rounded-md text-sm font-medium border border-gray-200 hover:bg-gray-200 transition-colors disabled:opacity-50"
              >
                {t('delete')}
              </button>
            </div>
          </div>
        ) : (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
            <label className="cursor-pointer">
              <div className="space-y-3">
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                    <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                </div>
                <div>
                  <div className="text-gray-900 font-medium">
                    Subir imagen o video
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    {t('dragAndDrop')}
                  </div>
                </div>
                <div className="text-xs text-gray-400 space-y-1">
                  <div>Imágenes: PNG, JPG, WebP (máx. 5MB)</div>
                  <div>Videos: MP4, WebM, MOV (máx. 50MB)</div>
                </div>
                <div className="text-xs text-gray-500">
                  Los videos se reproducirán automáticamente en bucle
                </div>
              </div>
              <input
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && handleMediaUpload(e.target.files[0])}
                disabled={isUploading}
              />
            </label>
          </div>
        )}

        {isUploading && (
          <div className="mt-3 text-sm text-gray-500 flex items-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-blue-600" fill="none" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" className="opacity-25"></circle>
              <path fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" className="opacity-75"></path>
            </svg>
Subiendo archivo...
          </div>
        )}

        {error && (
          <div className="mt-2 text-sm text-red-600 flex items-center">
            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {error}
          </div>
        )}
      </div>
    </div>
  )
} 