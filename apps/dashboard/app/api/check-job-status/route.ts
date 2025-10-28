import { NextRequest, NextResponse } from 'next/server'
import { doc, getDoc } from 'firebase/firestore'
import { getFirebaseServerDb, verifyIdToken } from '../../../lib/firebase-server'

/**
 * API Route para verificar el estado de un job de mejora de imagen
 */
export async function GET(request: NextRequest) {
  try {
    // Obtener el token de autorización
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, error: 'No authorization token provided' },
        { status: 401 }
      )
    }

    // Verificar el token
    const idToken = authHeader.split('Bearer ')[1]

    try {
      await verifyIdToken(idToken)
    } catch (error) {
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Obtener jobId de query params
    const { searchParams } = new URL(request.url)
    const jobId = searchParams.get('jobId')

    if (!jobId) {
      return NextResponse.json(
        { success: false, error: 'Missing jobId parameter' },
        { status: 400 }
      )
    }

    // Obtener el job de Firestore
    const db = getFirebaseServerDb()
    const jobDocRef = doc(db, 'imageJobs', jobId)
    const jobDoc = await getDoc(jobDocRef)

    if (!jobDoc.exists()) {
      return NextResponse.json(
        { success: false, error: 'Job not found' },
        { status: 404 }
      )
    }

    const jobData = jobDoc.data()

    // Retornar el estado del job
    return NextResponse.json({
      success: true,
      job: {
        id: jobDoc.id,
        status: jobData?.status,
        enhancedImageUrl: jobData?.enhancedImageUrl,
        enhancedPublicId: jobData?.enhancedPublicId,
        error: jobData?.error,
        createdAt: jobData?.createdAt,
        updatedAt: jobData?.updatedAt,
      }
    })

  } catch (error: any) {
    console.error('❌ Error checking job status:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to check job status',
        details: error.message
      },
      { status: 500 }
    )
  }
}
