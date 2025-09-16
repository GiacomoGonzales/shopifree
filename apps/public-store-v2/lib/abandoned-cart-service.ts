import { getAbandonedCarts, markAbandonedCartEmailSent } from './customers';
import { formatPrice } from './currency';

export interface AbandonedCartEmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

/**
 * 🆕 GENERAR TEMPLATE DE EMAIL PARA CARRITO ABANDONADO
 */
export function generateAbandonedCartEmail(
  customerName: string,
  items: any[],
  subtotal: number,
  currency: string,
  storeInfo: any,
  returnUrl: string
): AbandonedCartEmailTemplate {
  const storeName = storeInfo?.storeName || 'Nuestra Tienda';

  const subject = `${customerName}, ¡no olvides tu carrito en ${storeName}! 🛒`;

  // Generar lista de productos
  const productsList = items.map(item => {
    const itemTotal = (item.variant?.price || item.price) * item.quantity;
    return `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: left;">
          ${item.name}${item.variant ? ` (${item.variant.name})` : ''}
        </td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">${formatPrice(itemTotal, currency)}</td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Carrito Abandonado - ${storeName}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; background-color: #f4f4f4;">
      <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 20px; border-radius: 10px; margin-top: 20px;">

        <!-- Header -->
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #2c3e50; margin-bottom: 10px;">¡Hola ${customerName}! 👋</h1>
          <p style="color: #7f8c8d; font-size: 16px;">Notamos que dejaste algunos productos en tu carrito en <strong>${storeName}</strong></p>
        </div>

        <!-- Carrito abandonado -->
        <div style="background-color: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 20px; margin-bottom: 30px;">
          <h2 style="color: #856404; margin-top: 0; display: flex; align-items: center;">
            🛒 Tu carrito te está esperando
          </h2>
          <p style="color: #856404; margin-bottom: 0;">No pierdas estos productos increíbles que seleccionaste</p>
        </div>

        <!-- Productos -->
        <div style="margin-bottom: 30px;">
          <h3 style="color: #2c3e50; border-bottom: 2px solid #3498db; padding-bottom: 10px;">Productos en tu carrito:</h3>
          <table style="width: 100%; border-collapse: collapse; margin-top: 15px;">
            <thead>
              <tr style="background-color: #f8f9fa;">
                <th style="padding: 12px; text-align: left; border-bottom: 2px solid #dee2e6;">Producto</th>
                <th style="padding: 12px; text-align: center; border-bottom: 2px solid #dee2e6;">Cantidad</th>
                <th style="padding: 12px; text-align: right; border-bottom: 2px solid #dee2e6;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${productsList}
            </tbody>
          </table>

          <div style="text-align: right; margin-top: 15px; padding-top: 15px; border-top: 2px solid #3498db;">
            <p style="font-size: 18px; font-weight: bold; color: #2c3e50; margin: 0;">
              Subtotal: <span style="color: #e74c3c;">${formatPrice(subtotal, currency)}</span>
            </p>
          </div>
        </div>

        <!-- CTA Button -->
        <div style="text-align: center; margin: 30px 0;">
          <a href="${returnUrl}" style="background-color: #3498db; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 16px; display: inline-block; transition: background-color 0.3s;">
            ✨ Finalizar mi compra ahora
          </a>
        </div>

        <!-- Urgencia -->
        <div style="background-color: #fee; border: 1px solid #fcc; border-radius: 8px; padding: 15px; margin-bottom: 20px; text-align: center;">
          <p style="color: #c33; margin: 0; font-weight: bold;">⏰ ¡Tu carrito está reservado por tiempo limitado!</p>
        </div>

        <!-- Benefits -->
        <div style="background-color: #f8f9fa; border-radius: 8px; padding: 20px; margin-bottom: 20px;">
          <h4 style="color: #2c3e50; margin-top: 0;">¿Por qué comprar con nosotros?</h4>
          <ul style="color: #7f8c8d; margin: 0; padding-left: 20px;">
            <li>✅ Envío rápido y seguro</li>
            <li>✅ Productos de calidad garantizada</li>
            <li>✅ Atención al cliente 24/7</li>
            <li>✅ Devoluciones fáciles</li>
          </ul>
        </div>

        <!-- Contact info -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd;">
          <p style="color: #7f8c8d; margin: 5px 0;">¿Necesitas ayuda? Contáctanos:</p>
          ${storeInfo?.socialMedia?.whatsapp ? `
            <p style="margin: 5px 0;">
              <a href="https://wa.me/${storeInfo.socialMedia.whatsapp.replace(/[^\d+]/g, '')}" style="color: #25D366; text-decoration: none;">
                📱 WhatsApp: ${storeInfo.socialMedia.whatsapp}
              </a>
            </p>
          ` : ''}
          ${storeInfo?.email ? `
            <p style="margin: 5px 0;">
              <a href="mailto:${storeInfo.email}" style="color: #3498db; text-decoration: none;">
                📧 Email: ${storeInfo.email}
              </a>
            </p>
          ` : ''}
        </div>

        <!-- Footer -->
        <div style="text-align: center; padding-top: 20px; border-top: 1px solid #ddd; color: #95a5a6; font-size: 12px;">
          <p>Este email fue enviado porque tienes productos en tu carrito en ${storeName}</p>
          <p>${storeName} - Tu tienda online de confianza</p>
        </div>
      </div>
    </body>
    </html>
  `;

  const textContent = `
Hola ${customerName}!

Notamos que dejaste algunos productos en tu carrito en ${storeName}.

PRODUCTOS EN TU CARRITO:
${items.map(item => {
  const itemTotal = (item.variant?.price || item.price) * item.quantity;
  return `- ${item.name}${item.variant ? ` (${item.variant.name})` : ''} x${item.quantity} = ${formatPrice(itemTotal, currency)}`;
}).join('\n')}

SUBTOTAL: ${formatPrice(subtotal, currency)}

¡Finaliza tu compra ahora visitando: ${returnUrl}

¿Necesitas ayuda?
${storeInfo?.socialMedia?.whatsapp ? `WhatsApp: ${storeInfo.socialMedia.whatsapp}` : ''}
${storeInfo?.email ? `Email: ${storeInfo.email}` : ''}

${storeName} - Tu tienda online de confianza
  `;

  return {
    subject,
    htmlContent,
    textContent
  };
}

/**
 * 🆕 PROCESAR CARRITOS ABANDONADOS
 * Esta función debe llamarse desde un cron job o scheduled function
 */
export async function processAbandonedCarts(
  storeId: string,
  hoursAgo: number = 24,
  emailSender: (to: string, subject: string, html: string, text: string) => Promise<boolean>,
  storeInfo: any,
  storeUrl: string
): Promise<{ sent: number; errors: number }> {
  console.log(`[AbandonedCart] Processing abandoned carts for store ${storeId}, ${hoursAgo}h ago`);

  try {
    const abandonedCarts = await getAbandonedCarts(storeId, hoursAgo);
    console.log(`[AbandonedCart] Found ${abandonedCarts.length} abandoned carts`);

    let sent = 0;
    let errors = 0;

    for (const customer of abandonedCarts) {
      try {
        // Solo enviar si no se ha enviado email aún o si han pasado más de 7 días desde el último
        const canSendEmail = !customer.abandonedCart?.emailSent ||
          (customer.abandonedCart?.reminderCount || 0) < 3;

        if (!canSendEmail) {
          console.log(`[AbandonedCart] Skipping customer ${customer.id} - too many emails sent`);
          continue;
        }

        // Generar email
        const returnUrl = `${storeUrl}?restored_cart=${customer.id}`;
        const emailTemplate = generateAbandonedCartEmail(
          customer.fullName,
          customer.abandonedCart?.items || [],
          customer.abandonedCart?.subtotal || 0,
          customer.abandonedCart?.currency || 'PEN',
          storeInfo,
          returnUrl
        );

        // Enviar email
        const emailSent = await emailSender(
          customer.email,
          emailTemplate.subject,
          emailTemplate.htmlContent,
          emailTemplate.textContent
        );

        if (emailSent) {
          // Marcar como enviado
          await markAbandonedCartEmailSent(storeId, customer.id!);
          sent++;
          console.log(`[AbandonedCart] Email sent to ${customer.email}`);
        } else {
          errors++;
          console.error(`[AbandonedCart] Failed to send email to ${customer.email}`);
        }

      } catch (error) {
        errors++;
        console.error(`[AbandonedCart] Error processing customer ${customer.id}:`, error);
      }
    }

    console.log(`[AbandonedCart] Processing complete: ${sent} sent, ${errors} errors`);
    return { sent, errors };

  } catch (error) {
    console.error('[AbandonedCart] Error processing abandoned carts:', error);
    return { sent: 0, errors: 1 };
  }
}

/**
 * 🆕 RESTAURAR CARRITO ABANDONADO
 * Para usar cuando el usuario regresa desde el email
 */
export function restoreAbandonedCart(customerId: string) {
  // Esta función se puede implementar en el frontend para restaurar
  // los productos del carrito cuando el usuario hace clic en el email
  if (typeof window !== 'undefined') {
    const savedCart = localStorage.getItem(`abandoned_cart_${customerId}`);
    if (savedCart) {
      const cartData = JSON.parse(savedCart);
      // Aquí se puede integrar con el CartContext para restaurar los items
      return cartData;
    }
  }
  return null;
}