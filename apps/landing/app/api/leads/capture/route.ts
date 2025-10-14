import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp, query, where, getDocs } from 'firebase/firestore'
import { getFirebaseDb } from '../../../../lib/firebase'

/**
 * API Route para capturar leads del landing page
 * Guarda emails para email marketing antes del registro
 */
export async function POST(request: NextRequest) {
  try {
    console.log('📧 Capturing lead from landing page...')

    // 1. Obtener datos del request
    const body = await request.json()
    const { email, locale = 'es', source = 'landing-hero' } = body

    // Validar email
    if (!email || !email.includes('@')) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      )
    }

    console.log('📝 Lead data:', { email, locale, source })

    // 2. Obtener Firestore
    const db = getFirebaseDb()
    if (!db) {
      return NextResponse.json(
        { success: false, error: 'Firebase not available' },
        { status: 500 }
      )
    }

    // 3. Verificar si el email ya existe
    const leadsCollection = collection(db, 'leads')
    const q = query(leadsCollection, where('email', '==', email.toLowerCase().trim()))
    const existingLeads = await getDocs(q)

    if (!existingLeads.empty) {
      // Email ya existe, solo actualizar fecha
      console.log('✅ Lead already exists, skipping duplicate')
      return NextResponse.json({
        success: true,
        message: 'Lead already captured',
        isNew: false
      })
    }

    // 4. Guardar nuevo lead en Firestore
    const leadData = {
      email: email.toLowerCase().trim(),
      locale,
      source,
      status: 'new', // new, contacted, registered, converted
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      convertedToUser: false,
      userId: null, // Se llenará cuando se registre
      registeredAt: null,
      // Metadata adicional
      userAgent: request.headers.get('user-agent') || '',
      referer: request.headers.get('referer') || '',
    }

    const docRef = await addDoc(leadsCollection, leadData)

    console.log('✅ Lead captured successfully:', docRef.id)

    // 5. Responder con éxito
    return NextResponse.json({
      success: true,
      message: 'Lead captured successfully',
      leadId: docRef.id,
      isNew: true
    })

  } catch (error) {
    console.error('❌ Error capturing lead:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to capture lead',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
