'use client'

import { useState } from 'react'

interface ImageEnhancementPreviewProps {
  originalImageUrl: string
  onImageSelected: (imageUrl: string, isEnhanced: boolean) => void
  className?: string
}

/**
 * Componente para mejorar imágenes durante la CREACIÓN de productos
 * Muestra imagen original y mejorada lado a lado, permite elegir
 */
export function ImageEnhancementPreview({
  originalImageUrl,
  onImageSelected,
  className = ''
}: ImageEnhancementPreviewProps) {
  const [enhancing, setEnhancing] = useState(false)
  const [enhancedImageUrl, setEnhancedImageUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<'original' | 'enhanced' | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null)
  const [modalImageType, setModalImageType] = useState<'original' | 'enhanced' | null>(null)

  const handleEnhance = async () => {
    setEnhancing(true)
    setError(null)

    try {
      console.log('🎨 Starting image enhancement...')

      // 1. Convertir imagen URL a Base64
      const response = await fetch(originalImageUrl)
      const blob = await response.blob()

      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onloadend = () => {
          const result = reader.result as string
          // Remover el prefijo "data:image/...;base64,"
          const base64Data = result.split(',')[1]
          resolve(base64Data)
        }
        reader.onerror = reject
        reader.readAsDataURL(blob)
      })

      console.log('✅ Image converted to Base64')

      // 2. Enviar a API para mejorar
      console.log('🤖 Sending to AI for enhancement...')
      const apiResponse = await fetch('/api/ai/enhance-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64
        })
      })

      if (!apiResponse.ok) {
        const errorData = await apiResponse.json()
        throw new Error(errorData.error || 'Failed to enhance image')
      }

      const result = await apiResponse.json()

      if (!result.success) {
        throw new Error(result.error || 'Unknown error')
      }

      console.log('✅ Image enhanced successfully')

      // 3. Construir Data URL con la imagen mejorada
      const enhancedDataUrl = `data:${result.mimeType};base64,${result.enhancedImageBase64}`
      setEnhancedImageUrl(enhancedDataUrl)

    } catch (err: any) {
      console.error('❌ Error enhancing image:', err)
      setError(err.message || 'Error al mejorar la imagen')
    } finally {
      setEnhancing(false)
    }
  }

  const handleSelectImage = (type: 'original' | 'enhanced') => {
    setSelectedImage(type)
    const imageUrl = type === 'original' ? originalImageUrl : enhancedImageUrl!
    onImageSelected(imageUrl, type === 'enhanced')
  }

  const openModal = (imageUrl: string, type: 'original' | 'enhanced') => {
    setModalImageUrl(imageUrl)
    setModalImageType(type)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalImageUrl(null)
    setModalImageType(null)
  }

  const downloadImage = async () => {
    if (!modalImageUrl) return

    try {
      // Convertir data URL a blob
      const response = await fetch(modalImageUrl)
      const blob = await response.blob()

      // Crear enlace de descarga
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `producto-${modalImageType === 'enhanced' ? 'mejorada' : 'original'}-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Botón de mejora (si aún no hay imagen mejorada) */}
      {!enhancedImageUrl && !enhancing && (
        <button
          onClick={handleEnhance}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
          </svg>
          Mejorar imagen con IA
        </button>
      )}

      {/* Estado de procesamiento */}
      {enhancing && (
        <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <svg className="animate-spin h-5 w-5 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <div>
            <p className="text-sm font-medium text-blue-900">Mejorando imagen con IA...</p>
            <p className="text-xs text-blue-700">Esto puede tomar 20-60 segundos</p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
          <button
            onClick={handleEnhance}
            className="mt-2 text-xs text-red-600 hover:text-red-700 font-medium"
          >
            Intentar de nuevo
          </button>
        </div>
      )}

      {/* Comparación de imágenes */}
      {enhancedImageUrl && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-gray-700">Elige la imagen que deseas usar:</p>

          <div className="grid grid-cols-2 gap-4">
            {/* Imagen Original */}
            <div
              className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                selectedImage === 'original'
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div
                className="cursor-pointer"
                onClick={() => openModal(originalImageUrl, 'original')}
              >
                <img
                  src={originalImageUrl}
                  alt="Original"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                Original
              </div>
              {selectedImage === 'original' && (
                <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <button
                onClick={() => handleSelectImage('original')}
                className={`w-full py-2 text-sm font-medium transition-colors ${
                  selectedImage === 'original'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedImage === 'original' ? 'Seleccionada' : 'Usar esta'}
              </button>
            </div>

            {/* Imagen Mejorada */}
            <div
              className={`relative border-2 rounded-lg overflow-hidden transition-all ${
                selectedImage === 'enhanced'
                  ? 'border-purple-500 ring-2 ring-purple-200'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <div
                className="cursor-pointer"
                onClick={() => openModal(enhancedImageUrl, 'enhanced')}
              >
                <img
                  src={enhancedImageUrl}
                  alt="Mejorada con IA"
                  className="w-full h-48 object-cover"
                />
              </div>
              <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
                <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Mejorada con IA
              </div>
              {selectedImage === 'enhanced' && (
                <div className="absolute top-2 right-2 bg-purple-500 text-white rounded-full p-1">
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
              <button
                onClick={() => handleSelectImage('enhanced')}
                className={`w-full py-2 text-sm font-medium transition-colors ${
                  selectedImage === 'enhanced'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedImage === 'enhanced' ? 'Seleccionada' : 'Usar esta'}
              </button>
            </div>
          </div>

          {/* Botón para volver a mejorar */}
          <button
            onClick={handleEnhance}
            className="text-sm text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Mejorar de nuevo
          </button>
        </div>
      )}

      {/* Modal de vista ampliada */}
      {modalOpen && modalImageUrl && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-7xl max-h-screen w-full h-full flex items-center justify-center">
            {/* Botones superiores */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              {/* Botón de descarga */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  downloadImage()
                }}
                className="bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                title="Descargar imagen"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </button>

              {/* Botón de cerrar */}
              <button
                onClick={closeModal}
                className="bg-white hover:bg-gray-100 text-gray-800 p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-110"
                title="Cerrar"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Etiqueta del tipo de imagen */}
            <div className="absolute top-4 left-4 z-10">
              {modalImageType === 'enhanced' ? (
                <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm px-3 py-2 rounded-lg shadow-lg flex items-center gap-2">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                  </svg>
                  Mejorada con IA
                </div>
              ) : (
                <div className="bg-gray-800 text-white text-sm px-3 py-2 rounded-lg shadow-lg">
                  Original
                </div>
              )}
            </div>

            {/* Imagen ampliada */}
            <img
              src={modalImageUrl}
              alt={modalImageType === 'enhanced' ? 'Imagen mejorada con IA' : 'Imagen original'}
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}
    </div>
  )
}
