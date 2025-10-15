'use client'

import { useState, useRef, useEffect } from 'react'

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

type EnhancementPreset = 'auto' | 'white-bg' | 'lifestyle-bg' | 'with-model' | 'lighting' | 'sharpness' | 'custom'

interface PresetOption {
  id: EnhancementPreset
  label: string
  description: string
  icon: React.ReactNode
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
  const [dropdownOpenFor, setDropdownOpenFor] = useState<string | null>(null)
  const [selectedPreset, setSelectedPreset] = useState<EnhancementPreset>('auto')
  const [showCustomModal, setShowCustomModal] = useState(false)
  const [customPrompt, setCustomPrompt] = useState('')
  const [customFileId, setCustomFileId] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Preset options
  const presetOptions: PresetOption[] = [
    {
      id: 'auto',
      label: 'Automático',
      description: 'Mejora completa: fondo, iluminación y nitidez',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
        </svg>
      )
    },
    {
      id: 'white-bg',
      label: 'Fondo blanco',
      description: 'Fondo limpio y profesional para catálogo',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      )
    },
    {
      id: 'lifestyle-bg',
      label: 'Fondo lifestyle',
      description: 'Ambiente natural y contextual',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
        </svg>
      )
    },
    {
      id: 'with-model',
      label: 'Agregar modelo',
      description: 'Persona usando/mostrando el producto',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    },
    {
      id: 'lighting',
      label: 'Mejorar iluminación',
      description: 'Solo ajusta luz y contraste',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      )
    },
    {
      id: 'sharpness',
      label: 'Mejorar nitidez',
      description: 'Aumenta claridad y detalles',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      )
    },
    {
      id: 'custom',
      label: 'Personalizado...',
      description: 'Define tu propia mejora',
      icon: (
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      )
    }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpenFor(null)
      }
    }

    if (dropdownOpenFor) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [dropdownOpenFor])

  const handlePresetSelect = (fileId: string, preset: EnhancementPreset) => {
    setDropdownOpenFor(null)

    if (preset === 'custom') {
      setCustomFileId(fileId)
      setShowCustomModal(true)
      setCustomPrompt('')
      return
    }

    setSelectedPreset(preset)
    handleEnhanceImage(fileId, mediaFiles.find(f => f.id === fileId)?.url || '', preset)
  }

  const handleCustomSubmit = () => {
    if (!customFileId || !customPrompt.trim()) return

    const fileUrl = mediaFiles.find(f => f.id === customFileId)?.url || ''
    setShowCustomModal(false)
    handleEnhanceImage(customFileId, fileUrl, 'custom')
  }

  const handleCloseCustomModal = () => {
    setShowCustomModal(false)
    setCustomPrompt('')
    setCustomFileId(null)
  }

  const toggleDropdown = (fileId: string) => {
    setDropdownOpenFor(dropdownOpenFor === fileId ? null : fileId)
  }

  const handleEnhanceImage = async (fileId: string, imageUrl: string, preset: EnhancementPreset = 'auto') => {
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

      // 2. Enviar a API para mejorar (con contexto del producto y preset)
      const apiResponse = await fetch('/api/ai/enhance-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64,
          productName: productName || '',
          productDescription: productDescription || '',
          preset: preset,
          customPrompt: preset === 'custom' ? customPrompt : undefined
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

              {/* Split button "Mejorar con IA" con dropdown de presets */}
              {file.type === 'image' && !file.uploading && !file.isEnhanced && (
                <div className="relative" ref={dropdownOpenFor === file.id ? dropdownRef : null}>
                  <div className="flex gap-0.5">
                    {/* Main action button */}
                    <button
                      onClick={() => handleEnhanceImage(file.id, file.url, 'auto')}
                      disabled={file.enhancing || enhancingId !== null}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-l-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg"
                    >
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      {file.enhancing ? 'Mejorando...' : 'Mejorar con IA'}
                    </button>

                    {/* Dropdown trigger button */}
                    <button
                      onClick={() => toggleDropdown(file.id)}
                      disabled={file.enhancing || enhancingId !== null}
                      className="px-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-r-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 shadow-md hover:shadow-lg border-l border-white/20"
                      title="Ver opciones"
                    >
                      <svg
                        className={`h-4 w-4 transition-transform duration-200 ${dropdownOpenFor === file.id ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>

                  {/* Dropdown menu */}
                  {dropdownOpenFor === file.id && (
                    <div className={`absolute z-50 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-200 ${
                      index % 2 === 1 ? 'right-0' : 'left-0'
                    }`}>
                      <div className="px-3 py-2 border-b border-gray-100">
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                          Opciones de mejora
                        </p>
                      </div>

                      {presetOptions.map((option) => (
                        <button
                          key={option.id}
                          onClick={() => handlePresetSelect(file.id, option.id)}
                          className="w-full flex items-start gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors duration-150 text-left group"
                        >
                          <div className="flex-shrink-0 mt-0.5 text-purple-600 group-hover:text-purple-700">
                            {option.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 group-hover:text-purple-700">
                              {option.label}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {option.description}
                            </p>
                          </div>
                          {option.id === 'auto' && (
                            <div className="flex-shrink-0">
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium bg-purple-100 text-purple-700">
                                Por defecto
                              </span>
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
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

      {/* Modal de mejora personalizada */}
      {showCustomModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
          {/* Overlay */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={handleCloseCustomModal}
          />

          {/* Modal content */}
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <svg className="h-5 w-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-white">Mejora personalizada</h3>
                    <p className="text-sm text-purple-100 mt-0.5">Define cómo mejorar tu imagen</p>
                  </div>
                </div>
                <button
                  onClick={handleCloseCustomModal}
                  className="text-white/80 hover:text-white hover:bg-white/10 p-2 rounded-lg transition-colors"
                >
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="p-6 space-y-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              {/* Guidelines */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 mb-1">Guías de uso</h4>
                    <ul className="text-xs text-blue-800 space-y-1">
                      <li>• Describe mejoras enfocadas en la imagen del producto</li>
                      <li>• Ejemplos: "mejorar iluminación y brillo", "centrar producto y fondo minimalista"</li>
                      <li>• Evita solicitudes que cambien completamente el producto</li>
                      <li>• Mantén el foco en calidad de catálogo ecommerce</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Examples */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ejemplos de mejoras personalizadas:
                </label>
                <div className="space-y-2">
                  {[
                    'Agregar sombras suaves y mejorar iluminación',
                    'Fondo degradado claro y centrar el producto',
                    'Aumentar saturación de colores y nitidez',
                    'Remover imperfecciones y mejorar textura'
                  ].map((example, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCustomPrompt(example)}
                      className="w-full text-left px-4 py-2.5 bg-gray-50 hover:bg-purple-50 border border-gray-200 hover:border-purple-300 rounded-lg text-sm text-gray-700 hover:text-purple-700 transition-colors"
                    >
                      <svg className="h-3.5 w-3.5 inline mr-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                      {example}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom input */}
              <div>
                <label htmlFor="custom-prompt" className="block text-sm font-medium text-gray-900 mb-2">
                  Tu mejora personalizada
                </label>
                <textarea
                  id="custom-prompt"
                  rows={4}
                  value={customPrompt}
                  onChange={(e) => setCustomPrompt(e.target.value)}
                  placeholder="Ejemplo: Mejorar iluminación, agregar fondo blanco limpio y centrar el producto en la imagen..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-sm placeholder:text-gray-400"
                  maxLength={300}
                />
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-gray-500">
                    Sé específico pero conciso con tus instrucciones
                  </p>
                  <p className="text-xs text-gray-400">
                    {customPrompt.length}/300
                  </p>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h4 className="text-sm font-semibold text-amber-900 mb-1">Importante</h4>
                    <p className="text-xs text-amber-800">
                      La IA procesará tu imagen manteniendo el contexto de catálogo ecommerce.
                      Los resultados pueden variar según la calidad de la imagen original.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200">
              <button
                onClick={handleCloseCustomModal}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleCustomSubmit}
                disabled={!customPrompt.trim()}
                className="px-6 py-2.5 text-sm font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg shadow-md hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-md flex items-center gap-2"
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                </svg>
                Aplicar mejora
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
