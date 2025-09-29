import sgMail from '@sendgrid/mail';
import { OrderData } from './orders';
import { formatPrice } from './currency';

// Configurar SendGrid con la API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('[Email] SENDGRID_API_KEY not configured');
}

export interface EmailConfig {
  from: string;
  storeOwnerEmail?: string; // Ahora opcional, se pasa como parámetro
}

export interface EmailTemplateData {
  storeName: string;
  orderId: string;
  orderData: OrderData;
  storeUrl?: string;
  dashboardUrl?: string;
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
  let from = baseDomain;
  if (storeName) {
    // Convertir nombre de tienda a formato slug (minúsculas, sin espacios, solo letras/números)
    const storeSlug = storeName
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')  // Reemplazar caracteres especiales con -
      .replace(/-+/g, '-')         // Múltiples - consecutivos a uno solo
      .replace(/^-|-$/g, '');      // Remover - al inicio y final

    from = `${storeSlug}-noreply@${domain}`;
    console.log(`[Email] 📧 Email personalizado generado: ${from} (tienda: ${storeName})`);
  }

  return { from, storeOwnerEmail };
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
    const { orderData, orderId, storeName } = templateData;

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
      subject: `Confirmación de pedido #${orderId.slice(-6).toUpperCase()} - ${storeName}`,
      text: `
        Hola ${orderData.customer.fullName},

        Gracias por tu pedido en ${storeName}.

        PEDIDO #${orderId.slice(-6).toUpperCase()}

        PRODUCTOS:
        ${orderData.items.map(item =>
          `- ${item.name}${item.variant ? ` (${item.variant.name})` : ''} x${item.quantity} = ${formatPrice((item.variant?.price || item.price) * item.quantity, orderData.currency)}`
        ).join('\n')}

        RESUMEN:
        Subtotal: ${formatPrice(orderData.totals.subtotal, orderData.currency)}
        Envío: ${formatPrice(orderData.totals.shipping, orderData.currency)}
        Total: ${formatPrice(orderData.totals.total, orderData.currency)}

        INFORMACIÓN DE ENTREGA:
        ${orderData.customer.fullName}
        ${orderData.customer.email}
        ${orderData.customer.phone}
        ${orderData.shipping.address || 'Recojo en tienda'}

        MÉTODO DE PAGO: ${orderData.payment.method}

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
              <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 24px; margin-bottom: 32px;">
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
                  #${orderId.slice(-6).toUpperCase()}
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
                        ${item.variant ? `<p style="margin: 0; font-size: 13px; color: #6c757d;">${item.variant.name}</p>` : ''}
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
                <div style="border-bottom: 1px solid #f1f3f4; padding-bottom: 16px; margin-bottom: 16px;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 14px; color: #6c757d;">Subtotal</span>
                    <span style="font-size: 14px; color: #212529;">${formatPrice(orderData.totals.subtotal, orderData.currency)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 14px; color: #6c757d;">Envío</span>
                    <span style="font-size: 14px; color: #212529;">${formatPrice(orderData.totals.shipping, orderData.currency)}</span>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 16px; font-weight: 600; color: #212529;">Total</span>
                  <span style="font-size: 16px; font-weight: 600; color: #212529;">${formatPrice(orderData.totals.total, orderData.currency)}</span>
                </div>
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
                  <p style="margin: 4px 0 0 0; font-size: 14px; color: #212529;">${orderData.payment.method}</p>
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
    const { orderData, orderId, storeName } = templateData;

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
      subject: `Nuevo pedido #${orderId.slice(-6).toUpperCase()} - ${storeName}`,
      text: `
        NUEVO PEDIDO RECIBIDO

        Pedido #${orderId.slice(-6).toUpperCase()}
        Método: ${orderData.checkoutMethod}

        CLIENTE:
        Nombre: ${orderData.customer.fullName}
        Email: ${orderData.customer.email}
        Teléfono: ${orderData.customer.phone}

        PRODUCTOS:
        ${orderData.items.map(item =>
          `- ${item.name}${item.variant ? ` (${item.variant.name})` : ''} x${item.quantity} = ${formatPrice((item.variant?.price || item.price) * item.quantity, orderData.currency)}`
        ).join('\n')}

        ENTREGA:
        Método: ${orderData.shipping.method}
        Dirección: ${orderData.shipping.address || 'Recojo en tienda'}

        PAGO:
        Método: ${orderData.payment.method}
        ${orderData.payment.notes ? `Notas: ${orderData.payment.notes}` : ''}

        TOTALES:
        Subtotal: ${formatPrice(orderData.totals.subtotal, orderData.currency)}
        Envío: ${formatPrice(orderData.totals.shipping, orderData.currency)}
        TOTAL: ${formatPrice(orderData.totals.total, orderData.currency)}

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
              <div style="border-bottom: 1px solid #e9ecef; padding-bottom: 24px; margin-bottom: 32px;">
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
                  Pedido #${orderId.slice(-6).toUpperCase()}
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
                        ${item.variant ? `<p style="margin: 0; font-size: 13px; color: #6c757d;">${item.variant.name}</p>` : ''}
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
              <div style="display: flex; gap: 16px; margin-bottom: 16px;">
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #212529;">
                    Entrega
                  </h4>
                  <div style="background-color: #f8f9fa; padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6c757d;">Método</p>
                    <p style="margin: 0 0 12px 0; font-size: 14px; color: #212529;">${orderData.shipping.method}</p>
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6c757d;">Dirección</p>
                    <p style="margin: 0; font-size: 14px; color: #212529;">${orderData.shipping.address || 'Recojo en tienda'}</p>
                  </div>
                </div>
                <div style="flex: 1;">
                  <h4 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #212529;">
                    Pago
                  </h4>
                  <div style="background-color: #f8f9fa; padding: 16px;">
                    <p style="margin: 0 0 8px 0; font-size: 13px; color: #6c757d;">Método</p>
                    <p style="margin: 0; font-size: 14px; color: #212529;">${orderData.payment.method}</p>
                    ${orderData.payment.notes ? `
                      <p style="margin: 12px 0 8px 0; font-size: 13px; color: #6c757d;">Notas</p>
                      <p style="margin: 0; font-size: 14px; color: #212529;">${orderData.payment.notes}</p>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>

            <!-- Order Summary -->
            <div style="padding: 0 32px; margin-bottom: 32px;">
              <div style="border: 1px solid #e9ecef; padding: 24px; background-color: #212529; color: #ffffff;">
                <div style="margin-bottom: 16px; padding-bottom: 16px; border-bottom: 1px solid #495057;">
                  <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
                    <span style="font-size: 14px; opacity: 0.8;">Subtotal</span>
                    <span style="font-size: 14px;">${formatPrice(orderData.totals.subtotal, orderData.currency)}</span>
                  </div>
                  <div style="display: flex; justify-content: space-between;">
                    <span style="font-size: 14px; opacity: 0.8;">Envío</span>
                    <span style="font-size: 14px;">${formatPrice(orderData.totals.shipping, orderData.currency)}</span>
                  </div>
                </div>
                <div style="display: flex; justify-content: space-between;">
                  <span style="font-size: 18px; font-weight: 600;">Total</span>
                  <span style="font-size: 18px; font-weight: 600;">${formatPrice(orderData.totals.total, orderData.currency)}</span>
                </div>
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
  dashboardUrl?: string
): Promise<{ customerSent: boolean; adminSent: boolean }> {

  const templateData: EmailTemplateData = {
    storeName,
    orderId,
    orderData,
    storeUrl,
    dashboardUrl
  };

  // Enviar emails en paralelo
  const [customerSent, adminSent] = await Promise.all([
    sendCustomerOrderConfirmation(orderData.customer.email, templateData),
    sendAdminOrderNotification(storeOwnerEmail, templateData)
  ]);

  console.log(`[Email] Order confirmation emails - Customer: ${customerSent ? '✅' : '❌'}, Admin: ${adminSent ? '✅' : '❌'}`);

  return { customerSent, adminSent };
}