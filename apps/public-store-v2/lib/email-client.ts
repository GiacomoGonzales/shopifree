import { OrderData } from './orders';

export interface SendEmailsRequest {
  orderId: string;
  orderData: OrderData;
  storeId: string;
  storeUrl?: string;
  dashboardUrl?: string;
  orderNumber?: number; // 🆕 Número de orden secuencial
}

export interface SendEmailsResponse {
  success: boolean;
  results?: {
    customerSent: boolean;
    adminSent: boolean;
  };
  message?: string;
  error?: string;
  code?: string;
}

/**
 * Envía emails de confirmación de pedido usando la API route de Next.js
 * Esta función se ejecuta desde el cliente y llama al servidor
 */
export async function sendOrderEmailsViaAPI(request: SendEmailsRequest): Promise<SendEmailsResponse> {
  try {
    console.log('[EmailClient] 📧 Enviando solicitud de emails para pedido:', request.orderId);

    const response = await fetch('/api/send-order-emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request)
    });

    const result: SendEmailsResponse = await response.json();

    if (!response.ok) {
      console.error('[EmailClient] ❌ Error de API:', result.error);
      return {
        success: false,
        error: result.error || `HTTP ${response.status}`,
        code: result.code || 'API_ERROR'
      };
    }

    console.log('[EmailClient] ✅ Respuesta de API recibida:', result.message);
    return result;

  } catch (error) {
    console.error('[EmailClient] ❌ Error llamando API de emails:', error);

    return {
      success: false,
      error: error instanceof Error ? error.message : 'Network error',
      code: 'NETWORK_ERROR'
    };
  }
}

/**
 * Función helper para usar en lugar de sendOrderConfirmationEmails
 * Mantiene la misma interfaz pero usa la API route
 */
export async function sendOrderConfirmationEmailsClient(
  orderId: string,
  orderData: OrderData,
  storeId: string,
  storeUrl?: string,
  dashboardUrl?: string,
  orderNumber?: number // 🆕 Número de orden secuencial
): Promise<{ customerSent: boolean; adminSent: boolean }> {

  const result = await sendOrderEmailsViaAPI({
    orderId,
    orderData,
    storeId,
    storeUrl,
    dashboardUrl,
    orderNumber // 🆕 Pasar número de orden
  });

  if (result.success && result.results) {
    return result.results;
  }

  // Si falló, log del error pero retornar false para ambos
  console.error('[EmailClient] ⚠️ Falló envío de emails:', result.error);
  return { customerSent: false, adminSent: false };
}