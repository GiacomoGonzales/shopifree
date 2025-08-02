import { NextRequest, NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import { join } from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: { method: string } }
) {
  try {
    const method = params.method
    
    // Validar que el método sea uno de los permitidos
    const allowedMethods = ['cash', 'card', 'yape']
    if (!allowedMethods.includes(method)) {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Construir la ruta del archivo
    const filePath = join(process.cwd(), 'public', 'images', 'payment', `${method}.png`)
    
    // Leer el archivo
    const fileBuffer = await readFile(filePath)
    
    // Retornar la imagen con los headers correctos
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=86400', // Cache por 24 horas
      },
    })
  } catch (error) {
    console.error('Error serving payment icon:', error)
    return new NextResponse('Not Found', { status: 404 })
  }
}