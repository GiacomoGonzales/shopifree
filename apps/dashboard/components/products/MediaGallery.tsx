'use client'

import { useState } from 'react'
import { createPortal } from 'react-dom'

interface MediaFile {
  id: string
  url: string
  file?: File
  cloudinaryPublicId?: string
  uploading: boolean
  type: 'image' | 'video'
  isEnhanced?: boolean
  resourceType?: 'image' | 'video' | 'raw'
}

interface MediaGalleryProps {
  mediaFiles: MediaFile[]
  onMediaFilesChange: (files: MediaFile[]) => void
  onFileUpload: (files: FileList) => void
}

export function MediaGallery({
  mediaFiles,
  onMediaFilesChange,
  onFileUpload
}: MediaGalleryProps) {
  // Estados para modal de vista ampliada
  const [modalOpen, setModalOpen] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState<string | null>(null)

  const handleRemoveFile = (fileId: string) => {
    onMediaFilesChange(mediaFiles.filter(f => f.id !== fileId))
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      onFileUpload(e.target.files)
      e.target.value = '' // Reset input
    }
  }

  const openModal = (imageUrl: string) => {
    setModalImageUrl(imageUrl)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setModalImageUrl(null)
  }

  const downloadImage = () => {
    if (modalImageUrl) {
      const link = document.createElement('a')
      link.href = modalImageUrl
      link.download = `producto-${Date.now()}.jpg`
      link.target = '_blank'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <div className="space-y-4">
      {/* Titulo */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Imagenes y Videos del Producto
        </label>
        <p className="text-xs text-gray-500 mb-4">
          Sube imagenes de tu producto. La primera imagen sera la imagen principal.
        </p>
      </div>

      {/* Galeria de imagenes */}
      {mediaFiles.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {mediaFiles.map((file, index) => (
            <div key={file.id} className="space-y-3">
              {/* Contenedor de la imagen */}
              <div className="relative group rounded-xl overflow-hidden bg-white shadow-sm hover:shadow-lg transition-all duration-300">
                {/* Badge de posicion */}
                <div className="absolute top-3 left-3 bg-gray-900 bg-opacity-80 backdrop-blur-sm text-white text-xs px-2.5 py-1 rounded-full flex items-center gap-1 z-10 pointer-events-none">
                  {index === 0 && (
                    <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  )}
                  {index === 0 ? 'Principal' : `#${index + 1}`}
                </div>

                {/* Boton eliminar */}
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleRemoveFile(file.id)
                  }}
                  disabled={file.uploading}
                  className="absolute top-3 right-3 bg-black/40 hover:bg-black/60 text-white rounded-full w-7 h-7 flex items-center justify-center opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 z-10 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg backdrop-blur-sm"
                  title="Eliminar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>

                {/* Imagen/Video */}
                <div
                  className="aspect-square bg-gray-100 relative cursor-pointer"
                  onClick={() => file.type === 'image' && !file.uploading && openModal(file.url)}
                  title={file.type === 'image' ? 'Click para ver en grande' : ''}
                >
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
                  {file.uploading && (
                    <div className="absolute inset-0 bg-black bg-opacity-40 backdrop-blur-[2px] flex flex-col items-center justify-center z-[5]">
                      <svg className="animate-spin h-10 w-10 text-white mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span className="text-white text-sm font-medium drop-shadow-lg">
                        Subiendo...
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Boton para agregar mas imagenes */}
      <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all duration-200 cursor-pointer group">
        <label className="cursor-pointer flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 group-hover:bg-indigo-100 flex items-center justify-center mb-3 transition-colors duration-200">
            <svg className="h-7 w-7 text-gray-400 group-hover:text-indigo-600 transition-colors duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
          </div>
          <span className="text-sm font-medium text-gray-700 mb-1">
            {mediaFiles.length === 0 ? 'Subir imagenes o videos' : 'Agregar mas imagenes'}
          </span>
          <span className="text-xs text-gray-500">
            PNG, JPG, WebP o MP4 (max. 5MB para imagenes, 50MB para videos)
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

      {/* Modal de vista ampliada de imagen */}
      {modalOpen && modalImageUrl && typeof document !== 'undefined' && createPortal(
        <div
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black bg-opacity-90 p-4"
          onClick={closeModal}
        >
          <div className="relative max-w-7xl max-h-screen w-full h-full flex items-center justify-center">
            {/* Botones superiores */}
            <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
              {/* Boton de descarga */}
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

              {/* Boton de cerrar */}
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

            {/* Imagen ampliada */}
            <img
              src={modalImageUrl}
              alt="Imagen del producto ampliada"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
