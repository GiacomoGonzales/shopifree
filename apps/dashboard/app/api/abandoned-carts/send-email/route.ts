import { NextRequest, NextResponse } from 'next/server';
import { sendAbandonedCartEmail, type AbandonedCartEmailData } from '../../../../lib/email-abandoned-cart';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] 🛒 Recibida solicitud de envío de email de carrito abandonado');

    // Verificar que las variables de entorno estén configuradas
    if (!process.env.SENDGRID_API_KEY) {
      console.error('[API] ❌ SENDGRID_API_KEY no configurada');
      return NextResponse.json(
        { success: false, error: 'SendGrid not configured' },
        { status: 500 }
      );
    }

    if (!process.env.SENDGRID_FROM_EMAIL) {
      console.error('[API] ❌ SENDGRID_FROM_EMAIL not configured');
      return NextResponse.json(
        { success: false, error: 'SENDGRID_FROM_EMAIL not configured' },
        { status: 500 }
      );
    }

    // Parsear el body de la request
    const body = await request.json();

    // Si se proporciona emailData directamente, enviarlo
    if (body.emailData) {
      const emailData: AbandonedCartEmailData = body.emailData;

      console.log('[API] 📧 Enviando email a:', emailData.customerEmail);
      const sent = await sendAbandonedCartEmail(emailData);

      if (sent) {
        console.log('[API] ✅ Email enviado exitosamente');
        return NextResponse.json({
          success: true,
          message: 'Abandoned cart email sent successfully'
        });
      } else {
        console.error('[API] ❌ Error al enviar email');
        return NextResponse.json(
          { success: false, error: 'Failed to send email' },
          { status: 500 }
        );
      }
    }

    // Si no se proporciona emailData, error
    console.error('[API] ❌ emailData no proporcionado');
    return NextResponse.json(
      { success: false, error: 'emailData is required' },
      { status: 400 }
    );

  } catch (error) {
    console.error('[API] ❌ Error enviando email de carrito abandonado:', error);

    // Obtener detalles del error
    let errorMessage = 'Error desconocido';
    let errorCode = 'UNKNOWN_ERROR';

    if (error instanceof Error) {
      errorMessage = error.message;
      errorCode = error.name;
    }

    // Si es error de SendGrid, obtener más detalles
    if (error && typeof error === 'object' && 'response' in error) {
      const sgError = error as any;
      errorMessage = `SendGrid Error: ${sgError.message || 'Unknown'}`;
      errorCode = `SENDGRID_${sgError.code || 'ERROR'}`;

      if (sgError.response && sgError.response.body) {
        console.error('[API] 📧 SendGrid error details:', sgError.response.body);
      }
    }

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        code: errorCode
      },
      { status: 500 }
    );
  }
}

// Método OPTIONS para CORS (si es necesario)
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
