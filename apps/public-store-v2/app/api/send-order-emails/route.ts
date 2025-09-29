import { NextRequest, NextResponse } from 'next/server';
import { sendOrderConfirmationEmails } from '../../../lib/email';
import { OrderData } from '../../../lib/orders';
import { getStoreBasicInfo } from '../../../lib/store';
import { getUserEmail } from '../../../lib/user';

export async function POST(request: NextRequest) {
  try {
    console.log('[API] 📧 Recibida solicitud de envío de emails');

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
    const { orderId, orderData, storeId, storeUrl, dashboardUrl } = body;

    // Validar datos requeridos
    if (!orderId || !orderData || !storeId) {
      console.error('[API] ❌ Datos requeridos faltantes (orderId, orderData, storeId)');
      return NextResponse.json(
        { success: false, error: 'Missing required data: orderId, orderData, storeId' },
        { status: 400 }
      );
    }

    // 🆕 OBTENER INFORMACIÓN REAL DE LA TIENDA DESDE FIRESTORE
    console.log('[API] 🏪 Obteniendo información de la tienda:', storeId);
    const storeInfo = await getStoreBasicInfo(storeId);

    if (!storeInfo) {
      console.error('[API] ❌ No se pudo obtener información de la tienda:', storeId);
      return NextResponse.json(
        { success: false, error: 'Store not found' },
        { status: 404 }
      );
    }

    // 🆕 OBTENER EMAIL DEL USUARIO DUEÑO DE LA TIENDA
    if (!storeInfo.ownerId) {
      console.error('[API] ❌ La tienda no tiene ownerId configurado:', storeId);
      return NextResponse.json(
        { success: false, error: 'Store owner not found' },
        { status: 400 }
      );
    }

    console.log('[API] 👤 Obteniendo email del dueño de la tienda:', storeInfo.ownerId);
    const storeOwnerEmail = await getUserEmail(storeInfo.ownerId);

    if (!storeOwnerEmail) {
      console.error('[API] ❌ No se pudo obtener el email del dueño de la tienda:', storeInfo.ownerId);
      return NextResponse.json(
        { success: false, error: 'Store owner email not found' },
        { status: 400 }
      );
    }

    const storeName = storeInfo.storeName || 'Tienda';

    console.log('[API] 📧 Enviando emails para pedido:', orderId);
    console.log('[API] 📧 Cliente:', orderData.customer.email);
    console.log('[API] 📧 Dueño de tienda:', storeOwnerEmail);
    console.log('[API] 🏪 Tienda:', storeName);

    // Enviar emails usando el servicio
    const emailResults = await sendOrderConfirmationEmails(
      orderId,
      orderData as OrderData,
      storeName,
      storeOwnerEmail,
      storeUrl,
      dashboardUrl
    );

    console.log('[API] 📧 Resultado - Cliente:', emailResults.customerSent ? '✅' : '❌');
    console.log('[API] 📧 Resultado - Admin:', emailResults.adminSent ? '✅' : '❌');

    // Responder con los resultados
    return NextResponse.json({
      success: true,
      results: emailResults,
      message: `Emails enviados - Cliente: ${emailResults.customerSent ? 'Sí' : 'No'}, Admin: ${emailResults.adminSent ? 'Sí' : 'No'}`
    });

  } catch (error) {
    console.error('[API] ❌ Error enviando emails:', error);

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