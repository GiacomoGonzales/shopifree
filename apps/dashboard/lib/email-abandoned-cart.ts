import sgMail from '@sendgrid/mail';

// Configurar SendGrid con la API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
  console.warn('[Email] SENDGRID_API_KEY not configured');
}

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

// Función para obtener configuración de email desde variables de entorno
function getEmailConfig(storeName?: string) {
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
    }
  };
}

function formatPrice(amount: number, currency: string): string {
  const symbol = currency === 'USD' ? '$' : currency === 'PEN' ? 'S/' : currency;
  return `${symbol}${amount.toFixed(2)}`;
}

// Función para enviar email de carrito abandonado
export async function sendAbandonedCartEmail(
  data: AbandonedCartEmailData
): Promise<boolean> {
  try {
    const config = getEmailConfig(data.storeName);

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
