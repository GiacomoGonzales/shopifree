'use client'

import { useState } from 'react'

interface MediaFile {
  id: string
  url: string
  file?: File
  cloudinaryPublicId?: string
  uploading: boolean
  type: 'image' | 'video'
  isEnhanced?: boolean
  enhancing?: boolean
  resourceType?: 'image' | 'video' | 'raw'
}

interface MediaGalleryWithAIProps {
  mediaFiles: MediaFile[]
  onMediaFilesChange: (files: MediaFile[]) => void
  onFileUpload: (files: FileList) => void
  productName?: string
  productDescription?: string
}

export function MediaGalleryWithAI({
  mediaFiles,
  onMediaFilesChange,
  onFileUpload,
  productName,
  productDescription
}: MediaGalleryWithAIProps) {
  const [enhancingId, setEnhancingId] = useState<string | null>(null)

  const handleEnhanceImage = async (fileId: string, imageUrl: string) => {
    setEnhancingId(fileId)

    // Marcar como "mejorando"
    onMediaFilesChange(
      mediaFiles.map(f => f.id === fileId ? { ...f, enhancing: true } : f)
    )

    try {
      console.log('🎨 Enhancing image:', fileId)

      // 1. Convertir imagen URL a Base64
      const response = await fetch(imageUrl)
      const blob = await response.blob()

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      // 2. Enviar a API para mejorar (con contexto del producto)
      const apiResponse = await fetch('/api/ai/enhance-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          productName: productName || '',
          productDescription: productDescription || ''
        })
      })

      if (!apiResponse.ok) {
        throw new Error('Failed to enhance image')
      }

      const result = await apiResponse.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }

      // 3. Construir Data URI temporal
      const enhancedDataUrl = `data:${result.mimeType};base64,${result.enhancedImageBase64}`

      console.log('📤 Uploading enhanced image to Cloudinary...')

      // 4. Convertir Base64 a File para subir a Cloudinary
      const byteString = atob(result.enhancedImageBase64)
      const ab = new ArrayBuffer(byteString.length)
      const ia = new Uint8Array(ab)
      for (let i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i)
      }
      const enhancedBlob = new Blob([ab], { type: result.mimeType })
      const enhancedFile = new File([enhancedBlob], `enhanced_${Date.now()}.${result.mimeType.split('/')[1]}`, {
        type: result.mimeType
      })

      // 5. Subir a Cloudinary usando la función existente
      const { uploadMediaToCloudinary } = await import('../../lib/cloudinary')

      // Encontrar el storeId del archivo actual
      const currentFile = mediaFiles.find(f => f.id === fileId)
      if (!currentFile) {
        throw new Error('File not found')
      }

      // Extraer storeId de la URL de Cloudinary original
      const urlMatch = currentFile.url.match(/products\/([^/]+)/)
      const storeId = urlMatch ? urlMatch[1] : 'default'

      const uploadResult = await uploadMediaToCloudinary(enhancedFile, {
        folder: 'products',
        storeId: storeId
      })

      console.log('✅ Enhanced image uploaded to Cloudinary:', uploadResult.secure_url)

      // 6. REEMPLAZAR la imagen original con la URL de Cloudinary
      onMediaFilesChange(
        mediaFiles.map(f =>
          f.id === fileId
            ? {
                ...f,
                url: uploadResult.secure_url,
                cloudinaryPublicId: uploadResult.public_id,
                isEnhanced: true,
                enhancing: false
              }
            : f
        )
      )

      console.log('✅ Image enhanced and uploaded successfully')

    } catch (error) {
      console.error('❌ Error enhancing image:', error)
      alert('Error al mejorar la imagen. Por favor intenta de nuevo.')

      // Quitar estado de "mejorando"
      onMediaFilesChange(
        mediaFiles.map(f => f.id === fileId ? { ...f, enhancing: false } : f)
      )
    } finally {
      setEnhancingId(null)
    }
  }

  const handleRemoveFile = (fileId: string) => {
    onMediaFilesChange(mediaFiles.filter(f => f.id !== fileId))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files)
      e.target.value = '' // Reset input
    }
  }

  return (
    <div className="space-y-4">
      {/* Título */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imágenes y Videos del Producto
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Sube imágenes de tu producto. Puedes mejorarlas con IA para obtener mejores resultados.
        </p>
      </div>

      {/* Galería de imágenes */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaFiles.map((file, index) => (
            <div key={file.id} className="space-y-3">
              {/* Contenedor de la imagen - completamente separado */}
              <div className="relative group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Badge de posición */}
                <div className="absolute top-3 left-3 bg-gray-900 bg-opacity-80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 z-10">
                  {index === 0 && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {index === 0 ? 'Principal' : `#${index + 1}`}
                </div>

                {/* Badge sutil de "mejorada" en esquina superior derecha */}
                {file.isEnhanced && (
                  <div className="absolute top-3 right-3 bg-white bg-opacity-90 backdrop-blur-sm text-gray-700 text-[10px] px-2 py-1 rounded-full flex items-center gap-1 z-10 shadow-sm">
                    <svg className="h-3 w-3 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="font-medium">IA</span>
                  </div>
                )}

                {/* Botón eliminar (X) - solo visible sin mejorada badge */}
                {!file.isEnhanced && (
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={file.uploading || file.enhancing}
                    className="absolute top-3 right-3 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    title="Eliminar"
                  >
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Si está mejorada, botón eliminar abajo a la derecha del badge */}
                {file.isEnhanced && (
                  <button
                    onClick={() => handleRemoveFile(file.id)}
                    disabled={file.uploading || file.enhancing}
                    className="absolute top-3 right-12 bg-red-500 hover:bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                    title="Eliminar"
                  >
                    <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}

                {/* Imagen/Video - sin botones dentro */}
                <div className="aspect-square bg-gray-100 relative">
                  {file.type === 'video' ? (
                    <video
                      src={file.url}
                      className="w-full h-full object-cover"
                      controls
                      muted
                      preload="metadata"
                    />
                  ) : (
                    <img
                      src={file.url}
                      alt={`Imagen ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  )}

                  {/* Overlay de carga */}
                  {(file.uploading || file.enhancing) && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-[2px] flex flex-col items-center justify-center z-[5]">
                      <svg className="animate-spin h-10 w-10 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-white text-sm font-medium drop-shadow-lg">
                        {file.uploading ? 'Subiendo...' : 'Mejorando con IA...'}
                      </span>
                      {file.enhancing && (
                        <span className="text-white text-xs mt-1 opacity-90 drop-shadow">
                          30-70 segundos
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Botón "Mejorar con IA" - COMPLETAMENTE FUERA de la tarjeta de imagen */}
              {file.type === 'image' && !file.uploading && !file.isEnhanced && (
                <button
                  onClick={() => handleEnhanceImage(file.id, file.url)}
                  disabled={file.enhancing || enhancingId !== null}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 hover:scale-[1.02] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  {file.enhancing ? 'Mejorando...' : 'Mejorar con IA'}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Botón para agregar más imágenes */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group">
        <label className="cursor-pointer flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors duration-200">
            <svg className="h-7 w-7 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 mb-1">
            {mediaFiles.length === 0 ? 'Subir imágenes o videos' : 'Agregar más imágenes'}
          </span>
          <span className="text-xs text-gray-500">
            PNG, JPG, WebP o MP4 (máx. 5MB para imágenes, 50MB para videos)
          </span>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/webp,video/mp4,video/webm,video/ogg"
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>
    </div>
  )
}
