interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  format: string
  bytes: number
  resource_type: 'image' | 'video' | 'raw'
}

interface UploadOptions {
  folder: 'logos' | 'store_photos' | 'categories' | 'brands' | 'products' | 'banners' | 'hero' | 'collections' | 'seo/og-images' | 'seo/whatsapp-images' | 'seo/favicons'
  maxSizeBytes?: number
  storeId?: string // Para crear carpetas específicas por tienda
}

// Type alias para asegurar compatibilidad
export type CloudinaryFolder = 'logos' | 'store_photos' | 'categories' | 'brands' | 'products' | 'banners' | 'hero' | 'collections' | 'seo/og-images' | 'seo/whatsapp-images' | 'seo/favicons'

// Configuración de Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

// Validar archivo antes de subir (imágenes)
export const validateImageFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tipo de archivo
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Formato no permitido. Solo se aceptan JPG, PNG y WebP.' 
    }
  }

  // Validar tamaño (5MB por defecto)
  const maxSize = 5 * 1024 * 1024 // 5MB
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'La imagen excede el tamaño permitido. Máximo 5MB.' 
    }
  }

  return { isValid: true }
}

// Validar archivo de video antes de subir
export const validateVideoFile = (file: File): { isValid: boolean; error?: string } => {
  // Validar tipo de archivo
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime']
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: 'Formato de video no permitido. Solo se aceptan MP4, WebM, OGG, AVI y MOV.' 
    }
  }

  // Validar tamaño (50MB por defecto para videos)
  const maxSize = 50 * 1024 * 1024 // 50MB
  if (file.size > maxSize) {
    return { 
      isValid: false, 
      error: 'El video excede el tamaño permitido. Máximo 50MB.' 
    }
  }

  return { isValid: true }
}

// Determinar si el archivo es imagen o video
export const getFileType = (file: File): 'image' | 'video' | 'unknown' => {
  if (file.type.startsWith('image/')) return 'image'
  if (file.type.startsWith('video/')) return 'video'
  return 'unknown'
}

// Subir imagen a Cloudinary
export const uploadImageToCloudinary = async (
  file: File, 
  options: UploadOptions
): Promise<CloudinaryUploadResponse> => {
  try {
    // Validar configuración
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name no configurado')
    }

    if (!CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary upload preset no configurado')
    }

    // Validar archivo
    const validation = validateImageFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Preparar datos para subida
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    
    // Si se proporciona storeId, crear carpeta específica por tienda
    if (options.storeId) {
      formData.append('folder', `${options.folder}/${options.storeId}`)
    } else {
      formData.append('folder', options.folder)
    }
    
    // Configuraciones de optimización
    formData.append('quality', 'auto')
    formData.append('fetch_format', 'auto')
    formData.append('flags', 'progressive')

    // Realizar subida
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Error al subir imagen a Cloudinary')
    }

    const result: CloudinaryUploadResponse = await response.json()
    return result

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error)
    throw error instanceof Error ? error : new Error('Error desconocido al subir imagen')
  }
}

// Subir video a Cloudinary
export const uploadVideoToCloudinary = async (
  file: File, 
  options: UploadOptions
): Promise<CloudinaryUploadResponse> => {
  try {
    // Validar configuración
    if (!CLOUDINARY_CLOUD_NAME) {
      throw new Error('Cloudinary cloud name no configurado')
    }

    if (!CLOUDINARY_UPLOAD_PRESET) {
      throw new Error('Cloudinary upload preset no configurado')
    }

    // Validar archivo
    const validation = validateVideoFile(file)
    if (!validation.isValid) {
      throw new Error(validation.error)
    }

    // Preparar datos para subida
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET)
    
    // Si se proporciona storeId, crear carpeta específica por tienda
    if (options.storeId) {
      formData.append('folder', `${options.folder}/${options.storeId}`)
    } else {
      formData.append('folder', options.folder)
    }
    
    // Configuraciones específicas para video
    formData.append('resource_type', 'video')
    formData.append('quality', 'auto')

    // Realizar subida usando el endpoint de video
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/video/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || 'Error al subir video a Cloudinary')
    }

    const result: CloudinaryUploadResponse = await response.json()
    return result

  } catch (error) {
    console.error('Error uploading video to Cloudinary:', error)
    throw error instanceof Error ? error : new Error('Error desconocido al subir video')
  }
}

// Función unificada para subir cualquier tipo de media
export const uploadMediaToCloudinary = async (
  file: File, 
  options: UploadOptions
): Promise<CloudinaryUploadResponse> => {
  const fileType = getFileType(file)
  
  switch (fileType) {
    case 'image':
      return uploadImageToCloudinary(file, options)
    case 'video':
      return uploadVideoToCloudinary(file, options)
    default:
      throw new Error('Tipo de archivo no soportado. Solo se aceptan imágenes y videos.')
  }
}

// Eliminar imagen de Cloudinary usando API route del servidor
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    console.log('[Client] Deleting image from Cloudinary:', publicId)

    // Llamar a nuestra API route del servidor
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicId,
        resourceType: 'image'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[Client] Error deleting from Cloudinary:', errorData)
      return
    }

    const result = await response.json()
    console.log('[Client] Successfully deleted from Cloudinary:', result)

  } catch (error) {
    console.error('[Client] Error deleting from Cloudinary:', error)
    // No lanzamos error para no interrumpir el flujo de la aplicación
  }
}

// Eliminar video de Cloudinary usando API route del servidor
export const deleteVideoFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    console.log('[Client] Deleting video from Cloudinary:', publicId)

    // Llamar a nuestra API route del servidor
    const response = await fetch('/api/cloudinary/delete', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        publicId,
        resourceType: 'video'
      })
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error('[Client] Error deleting video from Cloudinary:', errorData)
      return
    }

    const result = await response.json()
    console.log('[Client] Successfully deleted video from Cloudinary:', result)

  } catch (error) {
    console.error('[Client] Error deleting video from Cloudinary:', error)
    // No lanzamos error para no interrumpir el flujo de subida
  }
}

// Eliminar media (imagen o video) de Cloudinary
export const deleteMediaFromCloudinary = async (publicId: string, resourceType: 'image' | 'video'): Promise<void> => {
  if (resourceType === 'image') {
    return deleteImageFromCloudinary(publicId)
  } else if (resourceType === 'video') {
    return deleteVideoFromCloudinary(publicId)
  }
}

// Extraer public_id de una URL de Cloudinary
export const extractPublicIdFromUrl = (url: string): string | null => {
  try {
    const match = url.match(/\/v\d+\/(.+)\.[^.]+$/)
    return match ? match[1] : null
  } catch {
    return null
  }
}

// Subir nueva imagen eliminando la anterior si existe
export const replaceImageInCloudinary = async (
  file: File,
  options: UploadOptions,
  previousPublicId?: string
): Promise<CloudinaryUploadResponse> => {
  try {
    // 1. Si existe una imagen anterior, eliminarla
    if (previousPublicId) {
      console.log('Deleting previous image:', previousPublicId)
      await deleteImageFromCloudinary(previousPublicId)
    }

    // 2. Subir la nueva imagen
    const result = await uploadImageToCloudinary(file, options)
    
    console.log('Successfully replaced image. New public_id:', result.public_id)
    return result

  } catch (error) {
    console.error('Error replacing image in Cloudinary:', error)
    throw error instanceof Error ? error : new Error('Error al reemplazar imagen')
  }
}

// Subir nueva media eliminando la anterior si existe
export const replaceMediaInCloudinary = async (
  file: File,
  options: UploadOptions,
  previousPublicId?: string,
  previousResourceType?: 'image' | 'video'
): Promise<CloudinaryUploadResponse> => {
  try {
    // 1. Si existe media anterior, eliminarla
    if (previousPublicId && previousResourceType) {
      console.log('Deleting previous media:', previousPublicId, previousResourceType)
      await deleteMediaFromCloudinary(previousPublicId, previousResourceType)
    }

    // 2. Subir la nueva media
    const result = await uploadMediaToCloudinary(file, options)
    
    console.log('Successfully replaced media. New public_id:', result.public_id)
    return result

  } catch (error) {
    console.error('Error replacing media in Cloudinary:', error)
    throw error instanceof Error ? error : new Error('Error al reemplazar media')
  }
} 