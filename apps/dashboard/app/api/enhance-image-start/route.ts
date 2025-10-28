import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { getFirebaseServerDb, verifyIdToken } from '../../../lib/firebase-server'

/**
 * API Route para iniciar un job de mejora de imagen
 * Responde inmediatamente con el Job ID para polling
 */
export async function POST(request: NextRequest) {
  console.log('🚀 Starting image enhancement job...')

  try {
    // Obtener el token de autorización
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Verificar el token de Firebase Auth
    const idToken = authHeader.split('Bearer ')[1]
    let decodedToken

    try {
      decodedToken = await verifyIdToken(idToken)
      console.log('✅ User authenticated:', decodedToken.uid)
    } catch (error) {
      console.error('❌ Invalid token:', error)
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Obtener parámetros
    const body = await request.json()
    const { storeId, productId, imageUrl, mediaFileId } = body

    if (!storeId || !productId || !imageUrl || !mediaFileId) {
      return NextResponse.json(
        { success: false, error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    console.log('📦 Creating job for:', { storeId, productId, imageUrl, mediaFileId })

    // Crear documento de job en Firestore
    const db = getFirebaseServerDb()
    const imageJobsCollection = collection(db, 'imageJobs')

    const jobRef = await addDoc(imageJobsCollection, {
      userId: decodedToken.uid,
      storeId,
      productId,
      imageUrl,
      mediaFileId,
      status: 'PENDING',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })

    console.log('✅ Job created with ID:', jobRef.id)

    // Responder inmediatamente con el Job ID
    return NextResponse.json({
      success: true,
      jobId: jobRef.id,
      status: 'PENDING',
      message: 'Image enhancement job started. Use the jobId to check status.'
    }, { status: 202 }) // 202 Accepted

  } catch (error: any) {
    console.error('❌ Error starting job:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to start image enhancement job',
        details: error.message
      },
      { status: 500 }
    )
  }
}
