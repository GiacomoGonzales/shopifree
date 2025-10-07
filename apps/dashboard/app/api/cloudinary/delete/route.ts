import { NextRequest, NextResponse } from 'next/server'

// Configuración de Cloudinary desde variables de entorno del servidor
const CLOUDINARY_CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET

export async function POST(request: NextRequest) {
  try {
    // Validar credenciales
    if (!CLOUDINARY_CLOUD_NAME || !CLOUDINARY_API_KEY || !CLOUDINARY_API_SECRET) {
      return NextResponse.json(
        { error: 'Cloudinary credentials not configured' },
        { status: 500 }
      )
    }

    // Obtener datos del body
    const body = await request.json()
    const { publicId, resourceType = 'image' } = body

    if (!publicId) {
      return NextResponse.json(
        { error: 'publicId is required' },
        { status: 400 }
      )
    }

    // Validar resourceType
    if (!['image', 'video', 'raw'].includes(resourceType)) {
      return NextResponse.json(
        { error: 'Invalid resourceType. Must be image, video, or raw' },
        { status: 400 }
      )
    }

    console.log(`[Cloudinary Delete] Attempting to delete ${resourceType}:`, publicId)

    // Preparar autenticación Basic Auth
    const auth = Buffer.from(`${CLOUDINARY_API_KEY}:${CLOUDINARY_API_SECRET}`).toString('base64')

    // Realizar eliminación usando la API de administración de Cloudinary
    const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/resources/${resourceType}/upload`

    const response = await fetch(cloudinaryUrl, {
      method: 'DELETE',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        public_ids: [publicId],
        invalidate: true // Invalidar CDN cache
      }),
    })

    // Parsear respuesta
    const result = await response.json()

    if (!response.ok) {
      console.error('[Cloudinary Delete] Error response:', result)
      return NextResponse.json(
        {
          error: 'Failed to delete from Cloudinary',
          details: result
        },
        { status: response.status }
      )
    }

    console.log('[Cloudinary Delete] Success:', result)

    return NextResponse.json({
      success: true,
      message: 'Resource deleted successfully',
      data: result
    })

  } catch (error) {
    console.error('[Cloudinary Delete] Exception:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
