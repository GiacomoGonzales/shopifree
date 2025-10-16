import sgMail from '@sendgrid/mail';
import { OrderData, translateShippingMethod, translatePaymentMethod } from './orders';
import { formatPrice } from './currency';
import { toCloudinarySquare } from './images';

// Configurar SendGrid con la API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('[Email] SENDGRID_API_KEY not configured');
}

export interface EmailConfig {
  from: {
    name: string;
    email: string;
  };
  storeOwnerEmail?: string; // Ahora opcional, se pasa como parámetro
}

export interface EmailTemplateData {
  storeName: string;
  orderId: string;
  orderData: OrderData;
  storeUrl?: string;
  dashboardUrl?: string;
  orderNumber?: number; // 🆕 Número de orden secuencial
  logoUrl?: string; // 🆕 URL del logo de la tienda
}

// Función para obtener configuración de email desde variables de entorno
function getEmailConfig(storeOwnerEmail?: string, storeName?: string): EmailConfig {
  const baseDomain = process.env.SENDGRID_FROM_EMAIL;

  if (!baseDomain) {
    throw new Error('Email configuration missing. Please check SENDGRID_FROM_EMAIL environment variable.');
  }

  // Extraer el dominio del email base (después del @)
  const domain = baseDomain.split('@')[1];

  // Generar email personalizado por tienda si se proporciona storeName
  let fromEmail = baseDomain;
  let fromName = 'Tienda'; // Nombre por defecto

  if (storeName) {
    // Usar el nombre real de la tienda como remitente
    fromName = storeName;

    // Convertir nombre de tienda a formato slug para el email (minúsculas, sin espacios, solo letras/números)
    const storeSlug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')  // Reemplazar caracteres especiales con -
      .replace(/-+/g, '-')         // Múltiples - consecutivos a uno solo
      .replace(/^-|-$/g, '');      // Remover - al inicio y final

    fromEmail = `${storeSlug}-noreply@${domain}`;
    console.log(`[Email] 📧 Email configurado - Nombre: "${fromName}", Email: ${fromEmail}`);
  }

  return {
    from: {
      name: fromName,
      email: fromEmail
    },
    storeOwnerEmail
  };
}

// Función para probar la conexión con SendGrid
export async function testSendGridConnection(): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.error('[Email] SENDGRID_API_KEY not configured');
      return false;
    }

    const config = getEmailConfig();
    const testEmail = process.env.SENDGRID_FROM_EMAIL; // Para pruebas, enviamos a nosotros mismos

    // Enviar email de prueba simple
    const testMessage = {
      to: testEmail,
      from: config.from,
      subject: 'SendGrid Test - Shopifree Integration',
      text: 'This is a test email to verify SendGrid integration is working correctly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">SendGrid Test Email</h2>
          <p>This is a test email to verify that SendGrid integration is working correctly with your Shopifree store.</p>
          <p><strong>Test sent at:</strong> ${new Date().toLocaleString()}</p>
          <hr style="margin: 20px 0;">
          <small style="color: #666;">This email was sent automatically to test the integration.</small>
        </div>
      `
    };

    await sgMail.send(testMessage);
    console.log('[Email] ✅ SendGrid test email sent successfully');
    return true;

  } catch (error) {
    console.error('[Email] ❌ SendGrid test failed:', error);
    return false;
  }
}

// Función para enviar email de confirmación al cliente
export async function sendCustomerOrderConfirmation(
  customerEmail: string,
  templateData: EmailTemplateData
): Promise<boolean> {
  try {
    const config = getEmailConfig(undefined, templateData.storeName);
    const { orderData, orderId, storeName, orderNumber } = templateData;

    // 🆕 Usar orderNumber si está disponible, sino usar últimos 6 caracteres del ID
    const displayOrderNumber = orderNumber ? `#${orderNumber}` : `#${orderId.slice(-6).toUpperCase()}`;

    // Generar HTML del pedido
    const itemsHtml = orderData.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: left;">${item.name}${item.variant ? ` (${item.variant.name})` : ''}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">${formatPrice(item.variant?.price || item.price, orderData.currency)}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">${formatPrice((item.variant?.price || item.price) * item.quantity, orderData.currency)}</td>
      </tr>
    `).join('');

    const message = {
      to: customerEmail,
      from: config.from,
      subject: `Confirmación de pedido ${displayOrderNumber} - ${storeName}`,
      text: `
        Hola ${orderData.customer.fullName},

        Gracias por tu pedido en ${storeName}.

        PEDIDO ${displayOrderNumber}

        PRODUCTOS:
        ${orderData.items.map(item => {
          let itemText = `- ${item.name}${item.variant ? ` (${item.variant.name})` : ''}`;
          if (item.modifiers && item.modifiers.length > 0) {
            item.modifiers.forEach((group: any) => {
              itemText += `\n  ${group.groupName}: ${group.options.map((option: any) =>
                `${option.name}${option.quantity > 1 ? ` x${option.quantity}` : ''}${option.price !== 0 ? ` (${option.price > 0 ? '+' : ''}${formatPrice(option.price * option.quantity, orderData.currency)})` : ''}`
              ).join(', ')}`;
            });
          }
          itemText += ` x${item.quantity} = ${formatPrice((item.variant?.price || item.price) * item.quantity, orderData.currency)}`;
          return itemText;
        }).join('\n')}

        RESUMEN:
        Subtotal: ${formatPrice(orderData.totals.subtotal, orderData.currency)}
        Envío: ${formatPrice(orderData.totals.shipping, orderData.currency)}
        ${orderData.discount && orderData.discount > 0 ? `Descuento${orderData.appliedCoupon?.code ? ` (${orderData.appliedCoupon.code})` : ''}: -${formatPrice(orderData.discount, orderData.currency)}\n        ` : ''}${orderData.loyaltyDiscount && orderData.loyaltyDiscount > 0 ? `Descuento puntos (${orderData.loyaltyPointsRedeemed} pts): -${formatPrice(orderData.loyaltyDiscount, orderData.currency)}\n        ` : ''}Total: ${formatPrice(orderData.totals.total, orderData.currency)}

        INFORMACIÓN DE ENTREGA:
        ${orderData.customer.fullName}
        ${orderData.customer.email}
        ${orderData.customer.phone}
        ${orderData.shipping.address || 'Recojo en tienda'}

        MÉTODO DE PAGO: ${translatePaymentMethod(orderData.payment.method, 'es')}

        Te contactaremos pronto para coordinar la entrega.

        Saludos,
        Equipo ${storeName}
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Confirmación de pedido</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

          <div style="max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e9ecef;">

            <!-- Header -->
            <div style="padding: 32px 32px 0 32px;">
              <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 24px; margin-bottom: 32px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #212529; letter-spacing: -0.5px;">
                  ${storeName}
                </h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #6c757d;">
                  Confirmación de pedido
                </p>
              </div>

              <!-- Greeting -->
              <div style="margin-bottom: 32px;">
                <p style="margin: 0 0 16px 0; font-size: 16px; color: #212529;">
                  Hola ${orderData.customer.fullName},
                </p>
                <p style="margin: 0; font-size: 16px; color: #495057; line-height: 1.5;">
                  Gracias por tu pedido. Hemos recibido tu solicitud y te contactaremos pronto.
                </p>
              </div>

              <!-- Order Number -->
              <div style="background-color: #f8f9fa; padding: 16px; margin-bottom: 32px; border-left: 3px solid #212529;">
                <p style="margin: 0; font-size: 14px; color: #6c757d; text-transform: uppercase; letter-spacing: 1px;">
                  Pedido
                </p>
                <p style="margin: 4px 0 0 0; font-size: 18px; font-weight: 600; color: #212529;">
                  ${displayOrderNumber}
                </p>
              </div>
            </div>

            <!-- Products -->
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #212529;">
                Productos
              </h3>

              <div style="border: 1px solid #e9ecef;">
                ${orderData.items.map((item, index) => `
                  <div style="padding: 16px; ${index !== orderData.items.length - 1 ? 'border-bottom: 1px solid #f1f3f4;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div style="flex: 1;">
                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 500; color: #212529;">
                          ${item.name}
                        </p>
                        ${item.variant ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #6c757d;">${item.variant.name}</p>` : ''}
                        ${item.modifiers && item.modifiers.length > 0 ? `
                          <div style="margin-top: 6px;">
                            ${item.modifiers.map((group: any) => `
                              <p style="margin: 0 0 2px 0; font-size: 12px; color: #868e96;">
                                <span style="font-weight: 500;">${group.groupName}:</span>
                                ${group.options.map((option: any) => `
                                  ${option.name}${option.quantity > 1 ? ` x${option.quantity}` : ''}${option.price !== 0 ? ` (${option.price > 0 ? '+' : ''}${formatPrice(option.price * option.quantity, orderData.currency)})` : ''}
                                `).join(', ')}
                              </p>
                            `).join('')}
                          </div>
                        ` : ''}
                      </div>
                      <div style="text-align: right;">
                        <p style="margin: 0; font-size: 14px; color: #212529;">
                          ${formatPrice((item.variant?.price || item.price) * item.quantity, orderData.currency)}
                        </p>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <p style="margin: 0; font-size: 13px; color: #6c757d;">
                        Cantidad: ${item.quantity}
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #6c757d;">
                        ${formatPrice(item.variant?.price || item.price, orderData.currency)} c/u
                      </p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Order Summary -->
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <div style="border: 1px solid #e9ecef; padding: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #f1f3f4; padding-bottom: 16px; margin-bottom: 16px;">
                  <tr>
                    <td style="font-size: 14px; color: #6c757d; padding: 4px 0;">Subtotal</td>
                    <td style="font-size: 14px; color: #212529; text-align: right; padding: 4px 0;">${formatPrice(orderData.totals.subtotal, orderData.currency)}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; color: #6c757d; padding: 4px 0;">Envío</td>
                    <td style="font-size: 14px; color: #212529; text-align: right; padding: 4px 0;">${formatPrice(orderData.totals.shipping, orderData.currency)}</td>
                  </tr>
                  ${orderData.discount && orderData.discount > 0 ? `
                  <tr>
                    <td style="font-size: 14px; color: #28a745; padding: 4px 0;">Descuento${orderData.appliedCoupon?.code ? ` (${orderData.appliedCoupon.code})` : ''}</td>
                    <td style="font-size: 14px; color: #28a745; text-align: right; padding: 4px 0;">-${formatPrice(orderData.discount, orderData.currency)}</td>
                  </tr>
                  ` : ''}
                  ${orderData.loyaltyDiscount && orderData.loyaltyDiscount > 0 ? `
                  <tr>
                    <td style="font-size: 14px; color: #28a745; padding: 4px 0;">Descuento puntos (${orderData.loyaltyPointsRedeemed} pts)</td>
                    <td style="font-size: 14px; color: #28a745; text-align: right; padding: 4px 0;">-${formatPrice(orderData.loyaltyDiscount, orderData.currency)}</td>
                  </tr>
                  ` : ''}
                </table>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size: 16px; font-weight: 600; color: #212529; padding: 4px 0;">Total</td>
                    <td style="font-size: 16px; font-weight: 600; color: #212529; text-align: right; padding: 4px 0;">${formatPrice(orderData.totals.total, orderData.currency)}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- Delivery Information -->
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #212529;">
                Información de entrega
              </h3>
              <div style="background-color: #f8f9fa; padding: 20px;">
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Cliente</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${orderData.customer.fullName}</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${orderData.customer.email}</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Teléfono</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${orderData.customer.phone}</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Dirección</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${orderData.shipping.address || 'Recojo en tienda'}</p>
                </div>
                <div>
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Método de pago</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${translatePaymentMethod(orderData.payment.method, 'es')}</p>
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 32px 32px 32px; border-top: 1px solid #e9ecef; background-color: #f8f9fa;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6c757d;">
                Te contactaremos pronto para coordinar la entrega.
              </p>
              <p style="margin: 0; font-size: 13px; color: #adb5bd;">
                Equipo ${storeName}
              </p>
            </div>

          </div>

          <!-- Footer spacer -->
          <div style="height: 40px;"></div>

        </body>
        </html>
      `
    };

    await sgMail.send(message);
    console.log(`[Email] ✅ Customer confirmation sent to: ${customerEmail}`);
    return true;

  } catch (error) {
    console.error('[Email] ❌ Failed to send customer confirmation:', error);
    return false;
  }
}

// Función para enviar notificación al admin de la tienda
export async function sendAdminOrderNotification(
  storeOwnerEmail: string,
  templateData: EmailTemplateData
): Promise<boolean> {
  try {
    const config = getEmailConfig(storeOwnerEmail, templateData.storeName);
    const { orderData, orderId, storeName, orderNumber } = templateData;

    // 🆕 Usar orderNumber si está disponible, sino usar últimos 6 caracteres del ID
    const displayOrderNumber = orderNumber ? `#${orderNumber}` : `#${orderId.slice(-6).toUpperCase()}`;

    // Generar HTML del pedido para admin
    const itemsHtml = orderData.items.map(item => `
      <tr style="border-bottom: 1px solid #eee;">
        <td style="padding: 10px; text-align: left;">${item.name}${item.variant ? ` (${item.variant.name})` : ''}</td>
        <td style="padding: 10px; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; text-align: right;">${formatPrice(item.variant?.price || item.price, orderData.currency)}</td>
        <td style="padding: 10px; text-align: right; font-weight: bold;">${formatPrice((item.variant?.price || item.price) * item.quantity, orderData.currency)}</td>
      </tr>
    `).join('');

    const message = {
      to: storeOwnerEmail,
      from: config.from,
      subject: `Nuevo pedido ${displayOrderNumber} - ${storeName}`,
      text: `
        NUEVO PEDIDO RECIBIDO

        Pedido ${displayOrderNumber}
        Método: ${orderData.checkoutMethod}

        CLIENTE:
        Nombre: ${orderData.customer.fullName}
        Email: ${orderData.customer.email}
        Teléfono: ${orderData.customer.phone}

        PRODUCTOS:
        ${orderData.items.map(item => {
          let itemText = `- ${item.name}${item.variant ? ` (${item.variant.name})` : ''}`;
          if (item.modifiers && item.modifiers.length > 0) {
            item.modifiers.forEach((group: any) => {
              itemText += `\n  ${group.groupName}: ${group.options.map((option: any) =>
                `${option.name}${option.quantity > 1 ? ` x${option.quantity}` : ''}${option.price !== 0 ? ` (${option.price > 0 ? '+' : ''}${formatPrice(option.price * option.quantity, orderData.currency)})` : ''}`
              ).join(', ')}`;
            });
          }
          itemText += ` x${item.quantity} = ${formatPrice((item.variant?.price || item.price) * item.quantity, orderData.currency)}`;
          return itemText;
        }).join('\n')}

        ENTREGA:
        Método: ${translateShippingMethod(orderData.shipping.method, 'es')}
        Dirección: ${orderData.shipping.address || 'Recojo en tienda'}

        PAGO:
        Método: ${translatePaymentMethod(orderData.payment.method, 'es')}
        ${orderData.payment.notes ? `Notas: ${orderData.payment.notes}` : ''}

        TOTALES:
        Subtotal: ${formatPrice(orderData.totals.subtotal, orderData.currency)}
        Envío: ${formatPrice(orderData.totals.shipping, orderData.currency)}
        ${orderData.discount && orderData.discount > 0 ? `Descuento${orderData.appliedCoupon?.code ? ` (${orderData.appliedCoupon.code})` : ''}: -${formatPrice(orderData.discount, orderData.currency)}\n        ` : ''}${orderData.loyaltyDiscount && orderData.loyaltyDiscount > 0 ? `Descuento puntos (${orderData.loyaltyPointsRedeemed} pts): -${formatPrice(orderData.loyaltyDiscount, orderData.currency)}\n        ` : ''}TOTAL: ${formatPrice(orderData.totals.total, orderData.currency)}

        Revisa tu dashboard para gestionar este pedido.

        ${storeName}
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Nuevo pedido</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

          <div style="max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e9ecef;">

            <!-- Header -->
            <div style="padding: 32px 32px 0 32px;">
              <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 24px; margin-bottom: 32px; text-align: center;">
                <h1 style="margin: 0; font-size: 24px; font-weight: 600; color: #212529; letter-spacing: -0.5px;">
                  ${storeName}
                </h1>
                <p style="margin: 8px 0 0 0; font-size: 14px; color: #6c757d;">
                  Nuevo pedido recibido
                </p>
              </div>

              <!-- Alert -->
              <div style="background-color: #212529; color: #ffffff; padding: 16px; margin-bottom: 32px;">
                <p style="margin: 0; font-size: 16px; font-weight: 600;">
                  Pedido ${displayOrderNumber}
                </p>
                <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.8;">
                  Método: ${orderData.checkoutMethod} • ${new Date().toLocaleDateString()}
                </p>
              </div>
            </div>

            <!-- Customer Info -->
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #212529;">
                Información del cliente
              </h3>
              <div style="background-color: #f8f9fa; padding: 20px;">
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Nombre</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${orderData.customer.fullName}</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Email</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">
                    <a href="mailto:${orderData.customer.email}" style="color: #212529; text-decoration: none;">${orderData.customer.email}</a>
                  </p>
                </div>
                <div>
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Teléfono</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">
                    <a href="tel:${orderData.customer.phone}" style="color: #212529; text-decoration: none;">${orderData.customer.phone}</a>
                  </p>
                </div>
              </div>
            </div>

            <!-- Products -->
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #212529;">
                Productos pedidos
              </h3>

              <div style="border: 1px solid #e9ecef;">
                ${orderData.items.map((item, index) => `
                  <div style="padding: 16px; ${index !== orderData.items.length - 1 ? 'border-bottom: 1px solid #f1f3f4;' : ''}">
                    <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px;">
                      <div style="flex: 1;">
                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 500; color: #212529;">
                          ${item.name}
                        </p>
                        ${item.variant ? `<p style="margin: 0 0 4px 0; font-size: 13px; color: #6c757d;">${item.variant.name}</p>` : ''}
                        ${item.modifiers && item.modifiers.length > 0 ? `
                          <div style="margin-top: 6px;">
                            ${item.modifiers.map((group: any) => `
                              <p style="margin: 0 0 2px 0; font-size: 12px; color: #868e96;">
                                <span style="font-weight: 500;">${group.groupName}:</span>
                                ${group.options.map((option: any) => `
                                  ${option.name}${option.quantity > 1 ? ` x${option.quantity}` : ''}${option.price !== 0 ? ` (${option.price > 0 ? '+' : ''}${formatPrice(option.price * option.quantity, orderData.currency)})` : ''}
                                `).join(', ')}
                              </p>
                            `).join('')}
                          </div>
                        ` : ''}
                      </div>
                      <div style="text-align: right;">
                        <p style="margin: 0; font-size: 14px; color: #212529;">
                          ${formatPrice((item.variant?.price || item.price) * item.quantity, orderData.currency)}
                        </p>
                      </div>
                    </div>
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                      <p style="margin: 0; font-size: 13px; color: #6c757d;">
                        Cantidad: ${item.quantity}
                      </p>
                      <p style="margin: 0; font-size: 13px; color: #6c757d;">
                        ${formatPrice(item.variant?.price || item.price, orderData.currency)} c/u
                      </p>
                    </div>
                  </div>
                `).join('')}
              </div>
            </div>

            <!-- Shipping & Payment -->
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #212529;">
                Entrega y pago
              </h3>
              <div style="background-color: #f8f9fa; padding: 20px;">
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Método de entrega</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${translateShippingMethod(orderData.shipping.method, 'es')}</p>
                </div>
                <div style="margin-bottom: 12px;">
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Dirección</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${orderData.shipping.address || 'Recojo en tienda'}</p>
                </div>
                <div ${orderData.payment.notes ? 'style="margin-bottom: 12px;"' : ''}>
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Método de pago</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${translatePaymentMethod(orderData.payment.method, 'es')}</p>
                </div>
                ${orderData.payment.notes ? `
                <div>
                  <span style="font-size: 13px; color: #6c757d; text-transform: uppercase; letter-spacing: 0.5px;">Notas de pago</span>
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${orderData.payment.notes}</p>
                </div>
                ` : ''}
              </div>
            </div>

            <!-- Order Summary -->
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <div style="border: 1px solid #e9ecef; padding: 24px; background-color: #212529; color: #ffffff;">
                <table width="100%" cellpadding="0" cellspacing="0" style="border-bottom: 1px solid #495057; padding-bottom: 16px; margin-bottom: 16px;">
                  <tr>
                    <td style="font-size: 14px; opacity: 0.8; padding: 4px 0;">Subtotal</td>
                    <td style="font-size: 14px; text-align: right; padding: 4px 0;">${formatPrice(orderData.totals.subtotal, orderData.currency)}</td>
                  </tr>
                  <tr>
                    <td style="font-size: 14px; opacity: 0.8; padding: 4px 0;">Envío</td>
                    <td style="font-size: 14px; text-align: right; padding: 4px 0;">${formatPrice(orderData.totals.shipping, orderData.currency)}</td>
                  </tr>
                  ${orderData.discount && orderData.discount > 0 ? `
                  <tr>
                    <td style="font-size: 14px; color: #7fdb90; padding: 4px 0;">Descuento${orderData.appliedCoupon?.code ? ` (${orderData.appliedCoupon.code})` : ''}</td>
                    <td style="font-size: 14px; color: #7fdb90; text-align: right; padding: 4px 0;">-${formatPrice(orderData.discount, orderData.currency)}</td>
                  </tr>
                  ` : ''}
                  ${orderData.loyaltyDiscount && orderData.loyaltyDiscount > 0 ? `
                  <tr>
                    <td style="font-size: 14px; color: #7fdb90; padding: 4px 0;">Descuento puntos (${orderData.loyaltyPointsRedeemed} pts)</td>
                    <td style="font-size: 14px; color: #7fdb90; text-align: right; padding: 4px 0;">-${formatPrice(orderData.loyaltyDiscount, orderData.currency)}</td>
                  </tr>
                  ` : ''}
                </table>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size: 18px; font-weight: 600; padding: 4px 0;">Total</td>
                    <td style="font-size: 18px; font-weight: 600; text-align: right; padding: 4px 0;">${formatPrice(orderData.totals.total, orderData.currency)}</td>
                  </tr>
                </table>
              </div>
            </div>

            <!-- CTA -->
            ${templateData.dashboardUrl ? `
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <a href="${templateData.dashboardUrl}" style="display: block; background-color: #212529; color: #ffffff; padding: 16px; text-align: center; text-decoration: none; font-weight: 500;">
                Ver en Dashboard
              </a>
            </div>
            ` : ''}

            <!-- Footer -->
            <div style="padding: 24px 32px 32px 32px; border-top: 1px solid #e9ecef; background-color: #f8f9fa;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6c757d;">
                Revisa tu dashboard para gestionar este pedido.
              </p>
              <p style="margin: 0; font-size: 13px; color: #adb5bd;">
                ${storeName} • ID: ${orderId}
              </p>
            </div>

          </div>

          <!-- Footer spacer -->
          <div style="height: 40px;"></div>

        </body>
        </html>
      `
    };

    await sgMail.send(message);
    console.log(`[Email] ✅ Admin notification sent to: ${storeOwnerEmail}`);
    return true;

  } catch (error) {
    console.error('[Email] ❌ Failed to send admin notification:', error);
    return false;
  }
}

// Función principal para enviar ambos emails de confirmación de pedido
export async function sendOrderConfirmationEmails(
  orderId: string,
  orderData: OrderData,
  storeName: string,
  storeOwnerEmail: string,
  storeUrl?: string,
  dashboardUrl?: string,
  orderNumber?: number, // 🆕 Número de orden secuencial
  logoUrl?: string // 🆕 Logo de la tienda
): Promise<{ customerSent: boolean; adminSent: boolean }> {

  const templateData: EmailTemplateData = {
    storeName,
    orderId,
    orderData,
    storeUrl,
    dashboardUrl,
    orderNumber, // 🆕 Pasar número de orden
    logoUrl // 🆕 Pasar logo de la tienda
  };

  // Enviar emails en paralelo
  const [customerSent, adminSent] = await Promise.all([
    sendCustomerOrderConfirmation(orderData.customer.email, templateData),
    sendAdminOrderNotification(storeOwnerEmail, templateData)
  ]);

  console.log(`[Email] Order confirmation emails - Customer: ${customerSent ? '✅' : '❌'}, Admin: ${adminSent ? '✅' : '❌'}`);

  return { customerSent, adminSent };
}

// 🛒 FUNCIONALIDAD DE RECUPERACIÓN DE CARRITOS ABANDONADOS

export interface AbandonedCartEmailData {
  customerName: string;
  customerEmail: string;
  storeName: string;
  storeUrl: string;
  cartItems: Array<{
    name: string;
    image: string;
    price: number;
    quantity: number;
    currency: string;
    slug?: string;
  }>;
  subtotal: number;
  currency: string;
  couponCode?: string;
  couponDiscount?: number;
}

// Función para enviar email de carrito abandonado
export async function sendAbandonedCartEmail(
  data: AbandonedCartEmailData
): Promise<boolean> {
  try {
    const config = getEmailConfig(undefined, data.storeName);

    // Generar enlace para recuperar carrito
    const cartRecoveryUrl = `${data.storeUrl}?recover=cart`;

    // Calcular total con descuento si hay cupón
    const discount = data.couponDiscount || 0;
    const total = data.subtotal - discount;

    const message = {
      to: data.customerEmail,
      from: config.from,
      subject: `${data.customerName}, dejaste algo en tu carrito 🛒 - ${data.storeName}`,
      text: `
        Hola ${data.customerName},

        Notamos que dejaste algunos productos en tu carrito de compras.

        PRODUCTOS EN TU CARRITO:
        ${data.cartItems.map(item =>
          `- ${item.name} x${item.quantity} = ${formatPrice(item.price * item.quantity, item.currency)}`
        ).join('\n')}

        Subtotal: ${formatPrice(data.subtotal, data.currency)}
        ${data.couponCode ? `\nCUPÓN ESPECIAL: ${data.couponCode}\nDescuento: -${formatPrice(discount, data.currency)}\n` : ''}
        Total: ${formatPrice(total, data.currency)}

        ${data.couponCode ? `\n¡Tenemos un regalo para ti! Usa el cupón ${data.couponCode} para obtener un descuento exclusivo.\n` : ''}
        Completa tu compra ahora: ${cartRecoveryUrl}

        Los productos tienen disponibilidad limitada. ¡No te quedes sin los tuyos!

        Saludos,
        Equipo ${data.storeName}
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Carrito abandonado</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

          <div style="max-width: 560px; margin: 40px auto; background-color: #ffffff; border: 1px solid #e9ecef;">

            <!-- Header -->
            <div style="padding: 32px 32px 24px 32px; text-align: center; background-color: #212529;">
              <h1 style="margin: 0 0 8px 0; font-size: 24px; font-weight: 600; color: #ffffff; letter-spacing: -0.5px;">
                ${data.storeName}
              </h1>
              <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                Olvidaste algo en tu carrito 🛒
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 32px;">
              <!-- Greeting -->
              <div style="margin-bottom: 24px;">
                <p style="margin: 0 0 12px 0; font-size: 16px; color: #212529;">
                  Hola ${data.customerName},
                </p>
                <p style="margin: 0; font-size: 15px; color: #495057; line-height: 1.6;">
                  Notamos que dejaste algunos productos en tu carrito. ¡Los guardamos para ti!
                </p>
              </div>

              <!-- Cart Items -->
              <div style="margin-bottom: 24px;">
                <h3 style="margin: 0 0 16px 0; font-size: 16px; font-weight: 600; color: #212529;">
                  Productos en tu carrito
                </h3>

                <div style="border: 1px solid #e9ecef; border-radius: 8px; overflow: hidden;">
                  ${data.cartItems.map((item, index) => `
                    <div style="padding: 16px; ${index !== data.cartItems.length - 1 ? 'border-bottom: 1px solid #f1f3f4;' : ''} display: flex; align-items: center; gap: 16px;">
                      <img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 6px; border: 1px solid #e9ecef;" />
                      <div style="flex: 1;">
                        <p style="margin: 0 0 4px 0; font-size: 14px; font-weight: 500; color: #212529;">
                          ${item.name}
                        </p>
                        <p style="margin: 0; font-size: 13px; color: #6c757d;">
                          Cantidad: ${item.quantity} × ${formatPrice(item.price, item.currency)}
                        </p>
                      </div>
                      <div style="text-align: right;">
                        <p style="margin: 0; font-size: 15px; font-weight: 600; color: #212529;">
                          ${formatPrice(item.price * item.quantity, item.currency)}
                        </p>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>

              <!-- Summary -->
              <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="font-size: 14px; color: #6c757d; padding: 4px 0;">Subtotal</td>
                    <td style="font-size: 14px; color: #212529; text-align: right; padding: 4px 0; font-weight: 500;">${formatPrice(data.subtotal, data.currency)}</td>
                  </tr>
                  ${data.couponCode ? `
                  <tr>
                    <td style="font-size: 14px; color: #28a745; padding: 4px 0;">Cupón ${data.couponCode}</td>
                    <td style="font-size: 14px; color: #28a745; text-align: right; padding: 4px 0; font-weight: 500;">-${formatPrice(discount, data.currency)}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="font-size: 16px; font-weight: 600; color: #212529; padding: 12px 0 4px 0; border-top: 1px solid #dee2e6;">Total</td>
                    <td style="font-size: 16px; font-weight: 600; color: #212529; text-align: right; padding: 12px 0 4px 0; border-top: 1px solid #dee2e6;">${formatPrice(total, data.currency)}</td>
                  </tr>
                </table>
              </div>

              ${data.couponCode ? `
              <!-- Coupon Badge -->
              <div style="background-color: #212529; padding: 20px; border-radius: 8px; text-align: center; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 13px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px;">
                  🎁 Cupón Especial para Ti
                </p>
                <p style="margin: 0 0 8px 0; font-size: 24px; font-weight: 700; color: #ffffff; letter-spacing: 2px;">
                  ${data.couponCode}
                </p>
                <p style="margin: 0; font-size: 14px; color: rgba(255,255,255,0.9);">
                  Ahorra ${formatPrice(discount, data.currency)}
                </p>
              </div>
              ` : ''}

              <!-- CTA Button -->
              <div style="text-align: center; margin-bottom: 24px;">
                <a href="${cartRecoveryUrl}" style="display: inline-block; background-color: #212529; color: #ffffff; padding: 16px 40px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                  Completar mi compra
                </a>
              </div>

              <!-- Urgency Message -->
              <div style="background-color: #f8f9fa; border-left: 3px solid #6c757d; padding: 16px; border-radius: 4px;">
                <p style="margin: 0; font-size: 13px; color: #495057; line-height: 1.5;">
                  ⏰ <strong>Disponibilidad limitada:</strong> Los productos en tu carrito tienen alta demanda. ¡No te quedes sin los tuyos!
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 24px 32px; border-top: 1px solid #e9ecef; background-color: #f8f9fa; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #6c757d;">
                ¿Necesitas ayuda? Contáctanos respondiendo a este email.
              </p>
              <p style="margin: 0; font-size: 13px; color: #adb5bd;">
                Equipo ${data.storeName}
              </p>
            </div>

          </div>

          <!-- Footer spacer -->
          <div style="height: 40px;"></div>

        </body>
        </html>
      `
    };

    await sgMail.send(message);
    console.log(`[Email] ✅ Abandoned cart email sent to: ${data.customerEmail}`);
    return true;

  } catch (error) {
    console.error('[Email] ❌ Failed to send abandoned cart email:', error);
    return false;
  }
}