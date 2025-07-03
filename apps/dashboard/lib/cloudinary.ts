interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  format: string
  bytes: number
}

interface UploadOptions {
  folder: 'logos' | 'store_photos' | 'categories' | 'brands' | 'products' | 'banners'
  maxSizeBytes?: number
  storeId?: string // Para crear carpetas específicas por tienda
}

// Type alias para asegurar compatibilidad
export type CloudinaryFolder = 'logos' | 'store_photos' | 'categories' | 'brands' | 'products' | 'banners'



// Configuración de Cloudinary
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_UPLOAD_PRESET = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

// Validar archivo antes de subir
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

// Eliminar imagen de Cloudinary usando API de administración
export const deleteImageFromCloudinary = async (publicId: string): Promise<void> => {
  try {
    // Validar configuración
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary credentials not configured for deletion')
      return
    }

    // Preparar autenticación Basic Auth
    const auth = btoa(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`)
    
    // Realizar eliminación usando la API de administración
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/image/upload`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          public_ids: [publicId]
        }),
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Error deleting from Cloudinary:', errorData)
      // No lanzamos error para no interrumpir el flujo de subida
      return
    }

    const result = await response.json()
    console.log('Successfully deleted from Cloudinary:', publicId, result)

  } catch (error) {
    console.error('Error deleting from Cloudinary:', error)
    // No lanzamos error para no interrumpir el flujo de subida
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