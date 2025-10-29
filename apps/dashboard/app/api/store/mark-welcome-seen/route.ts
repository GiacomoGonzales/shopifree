import { NextRequest, NextResponse } from 'next/server'
import { doc, updateDoc } from 'firebase/firestore'
import { getFirebaseServerDb } from '../../../../lib/firebase-server'

export async function POST(request: NextRequest) {
  try {
    const { storeId } = await request.json()

    if (!storeId) {
      return NextResponse.json(
        { error: 'El ID de la tienda es requerido' },
        { status: 400 }
      )
    }

    const db = getFirebaseServerDb()
    const storeRef = doc(db, 'stores', storeId)

    await updateDoc(storeRef, {
      hasSeenWelcome: true
    })

    return NextResponse.json({
      success: true,
      message: 'Mensaje de bienvenida marcado como visto'
    })

  } catch (error) {
    console.error('Error al marcar mensaje de bienvenida:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
