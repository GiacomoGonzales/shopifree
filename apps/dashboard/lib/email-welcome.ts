import sgMail from '@sendgrid/mail';

// Configurar SendGrid con la API key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[Email] ✅ SendGrid configured');
} else {
  console.log('[Email] ℹ️ SendGrid not configured - email features disabled');
}

export interface WelcomeEmailData {
  userName: string;
  userEmail: string;
  storeName: string;
  storeSubdomain: string;
  dashboardUrl: string;
}

// Función para obtener configuración de email desde variables de entorno
function getEmailConfig() {
  const fromEmail = process.env.SENDGRID_FROM_EMAIL || 'noreply@shopifree.app';

  return {
    from: {
      name: 'Shopifree',
      email: fromEmail
    }
  };
}

// Función para enviar email de bienvenida
export async function sendWelcomeEmail(
  data: WelcomeEmailData
): Promise<boolean> {
  // Validar si SendGrid está configurado
  if (!process.env.SENDGRID_API_KEY) {
    console.log('[Email] ℹ️ SendGrid not configured - skipping welcome email');
    return false;
  }

  try {
    const config = getEmailConfig();

    // Construir URL de la tienda
    const isLocalhost = data.storeSubdomain.includes('localhost');
    const storeUrl = isLocalhost
      ? `http://localhost:3001/${data.storeSubdomain.split('/')[0]}`
      : `https://${data.storeSubdomain}.shopifree.app`;

    const message = {
      to: data.userEmail,
      from: config.from,
      subject: `¡Bienvenido a Shopifree, ${data.userName}! 🎉`,
      text: `
        ¡Hola ${data.userName}!

        ¡Felicitaciones! Tu tienda "${data.storeName}" está lista y funcionando.

        TU TIENDA:
        ${storeUrl}

        PRÓXIMOS PASOS:
        1. Agrega tus primeros productos
        2. Personaliza el diseño de tu tienda
        3. Configura métodos de pago y envío
        4. Comparte tu link con tus clientes

        ACCEDE A TU DASHBOARD:
        ${data.dashboardUrl}

        ¿Necesitas ayuda? Estamos aquí para ti. Visita nuestra documentación o contáctanos.

        ¡Mucho éxito con tu tienda!

        Equipo Shopifree
      `,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Bienvenido a Shopifree</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #f8f9fa; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">

          <div style="max-width: 600px; margin: 40px auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);">

            <!-- Header -->
            <div style="padding: 40px 32px; text-align: center; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
              <div style="background-color: white; width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 16px; display: flex; align-items: center; justify-content: center;">
                <span style="font-size: 32px;">🎉</span>
              </div>
              <h1 style="margin: 0 0 8px 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.5px;">
                ¡Bienvenido a Shopifree!
              </h1>
              <p style="margin: 0; font-size: 16px; color: rgba(255,255,255,0.95);">
                Tu tienda está lista para despegar 🚀
              </p>
            </div>

            <!-- Content -->
            <div style="padding: 40px 32px;">
              <!-- Greeting -->
              <div style="margin-bottom: 32px;">
                <p style="margin: 0 0 16px 0; font-size: 18px; color: #212529; font-weight: 600;">
                  ¡Hola ${data.userName}! 👋
                </p>
                <p style="margin: 0; font-size: 16px; color: #495057; line-height: 1.6;">
                  ¡Felicitaciones! Tu tienda <strong style="color: #212529;">"${data.storeName}"</strong> ha sido creada exitosamente y está lista para recibir clientes.
                </p>
              </div>

              <!-- Store Link -->
              <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 24px; border-radius: 12px; margin-bottom: 32px; text-align: center;">
                <p style="margin: 0 0 12px 0; font-size: 14px; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px; font-weight: 600;">
                  Tu Tienda Online
                </p>
                <p style="margin: 0 0 16px 0; font-size: 16px; color: #ffffff; word-break: break-all;">
                  ${storeUrl}
                </p>
                <a href="${storeUrl}" style="display: inline-block; background-color: #ffffff; color: #667eea; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                  Ver mi tienda
                </a>
              </div>

              <!-- Next Steps -->
              <div style="margin-bottom: 32px;">
                <h2 style="margin: 0 0 20px 0; font-size: 20px; font-weight: 600; color: #212529;">
                  Próximos pasos 🎯
                </h2>

                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px 20px; margin-bottom: 12px; border-radius: 4px;">
                  <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #212529;">
                    1. Agrega tus productos
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                    Sube fotos, establece precios y crea tu catálogo
                  </p>
                </div>

                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px 20px; margin-bottom: 12px; border-radius: 4px;">
                  <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #212529;">
                    2. Personaliza tu tienda
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                    Elige colores, agrega tu logo y selecciona un tema
                  </p>
                </div>

                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px 20px; margin-bottom: 12px; border-radius: 4px;">
                  <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #212529;">
                    3. Configura pagos y envíos
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                    Define métodos de pago y zonas de envío
                  </p>
                </div>

                <div style="background-color: #f8f9fa; border-left: 4px solid #667eea; padding: 16px 20px; border-radius: 4px;">
                  <p style="margin: 0 0 4px 0; font-size: 16px; font-weight: 600; color: #212529;">
                    4. ¡Comparte y vende! 📢
                  </p>
                  <p style="margin: 0; font-size: 14px; color: #6c757d; line-height: 1.5;">
                    Comparte tu link en redes sociales y empieza a vender
                  </p>
                </div>
              </div>

              <!-- Dashboard CTA -->
              <div style="text-align: center; margin-bottom: 32px;">
                <a href="${data.dashboardUrl}" style="display: inline-block; background-color: #212529; color: #ffffff; padding: 16px 48px; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);">
                  Ir al Dashboard
                </a>
              </div>

              <!-- Help Section -->
              <div style="background-color: #fff3cd; border: 1px solid #ffc107; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                <p style="margin: 0 0 8px 0; font-size: 16px; font-weight: 600; color: #856404;">
                  💡 ¿Necesitas ayuda?
                </p>
                <p style="margin: 0; font-size: 14px; color: #856404; line-height: 1.5;">
                  Estamos aquí para ayudarte. Si tienes alguna pregunta o necesitas asistencia, no dudes en contactarnos.
                </p>
              </div>

              <!-- Success Message -->
              <div style="text-align: center; padding: 20px 0;">
                <p style="margin: 0; font-size: 15px; color: #6c757d; line-height: 1.6;">
                  ¡Mucho éxito con <strong style="color: #212529;">${data.storeName}</strong>!<br>
                  Estamos emocionados de ser parte de tu viaje.
                </p>
              </div>
            </div>

            <!-- Footer -->
            <div style="padding: 32px; border-top: 1px solid #e9ecef; background-color: #f8f9fa; text-align: center;">
              <p style="margin: 0 0 8px 0; font-size: 14px; color: #212529; font-weight: 600;">
                Shopifree
              </p>
              <p style="margin: 0 0 16px 0; font-size: 13px; color: #6c757d;">
                La plataforma para crear tu tienda online en minutos
              </p>
              <p style="margin: 0; font-size: 12px; color: #adb5bd;">
                © ${new Date().getFullYear()} Shopifree. Todos los derechos reservados.
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
    console.log(`[Email] ✅ Welcome email sent to: ${data.userEmail}`);
    return true;

  } catch (error) {
    console.error('[Email] ❌ Failed to send welcome email:', error);
    return false;
  }
}
