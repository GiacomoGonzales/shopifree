import { NextRequest, NextResponse } from 'next/server'
import { sendWelcomeEmail, WelcomeEmailData } from '../../../lib/email-welcome'

/**
 * API Route para enviar email de bienvenida
 * Se ejecuta en el servidor donde las variables de entorno están disponibles
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as WelcomeEmailData

    // Validar datos requeridos
    if (!body.userName || !body.userEmail || !body.storeName || !body.storeSubdomain) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Enviar email desde el servidor
    const emailSent = await sendWelcomeEmail(body)

    if (emailSent) {
      return NextResponse.json(
        { success: true, message: 'Welcome email sent successfully' },
        { status: 200 }
      )
    } else {
      return NextResponse.json(
        { success: false, message: 'Email service not configured or failed to send' },
        { status: 200 } // 200 porque no es un error del servidor, solo no está configurado
      )
    }
  } catch (error) {
    console.error('[API] Error sending welcome email:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
