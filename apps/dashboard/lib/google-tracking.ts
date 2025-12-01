/**
 * Google Analytics & Google Ads Tracking Utilities
 *
 * Este archivo contiene funciones para trackear eventos en Google Analytics 4
 * y conversiones en Google Ads.
 *
 * INSTRUCCIONES DE USO:
 * 1. Reemplaza 'YOUR_GA_ID' con tu ID de Google Analytics (formato: G-XXXXXXXXXX)
 * 2. Reemplaza 'YOUR_AW_ID' con tu ID de Google Ads (formato: AW-XXXXXXXXX)
 * 3. Reemplaza 'YOUR_CONVERSION_LABEL' con la etiqueta de conversion de Google Ads
 */

// ============================================================================
// CONFIGURACION - REEMPLAZA ESTOS VALORES CON TUS IDs REALES
// ============================================================================

/**
 * PASO 1: Coloca aqui tu ID de Google Analytics
 * Lo encuentras en: Google Analytics > Admin > Data Streams > Web > Measurement ID
 * Formato: G-XXXXXXXXXX
 */
export const GA_MEASUREMENT_ID = 'YOUR_GA_ID'; //  REEMPLAZA ESTO

/**
 * PASO 2: Coloca aqui tu ID de Google Ads
 * Lo encuentras en: Google Ads > Tools & Settings > Conversions
 * Formato: AW-XXXXXXXXX
 */
export const GOOGLE_ADS_ID = 'YOUR_AW_ID'; //  REEMPLAZA ESTO

/**
 * PASO 3: Coloca aqui la etiqueta de conversion de registro
 * Lo encuentras en: Google Ads > Tools & Settings > Conversions > [Tu conversion de registro]
 * Formato: AbCdEfGhIjK
 */
export const REGISTRATION_CONVERSION_LABEL = 'YOUR_CONVERSION_LABEL'; //  REEMPLAZA ESTO

// ============================================================================
// CODIGO DE TRACKING - NO MODIFICAR A MENOS QUE SEPAS LO QUE HACES
// ============================================================================

// Declaracion de tipos para gtag (Google Tag Manager)
declare global {
  interface Window {
    gtag?: (
      command: 'config' | 'event' | 'js' | 'set',
      targetId: string | Date,
      config?: Record<string, any>
    ) => void;
    dataLayer?: any[];
  }
}

/**
 * Verifica si gtag esta disponible en el navegador
 */
export const isGtagAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
};

/**
 * Trackea un evento de conversion de Google Ads
 *
 * @param conversionLabel - La etiqueta de conversion (opcional, usa el default si no se especifica)
 * @param value - El valor monetario de la conversion (opcional)
 * @param currency - La moneda (por defecto: 'USD')
 *
 * Ejemplo de uso:
 * trackGoogleAdsConversion()
 * trackGoogleAdsConversion('CustomLabel', 9.99, 'USD')
 */
export const trackGoogleAdsConversion = (
  conversionLabel?: string,
  value?: number,
  currency: string = 'USD'
): void => {
  try {
    if (!isGtagAvailable()) {
      console.warn(
        'Google Tag (gtag) no esta disponible. ' +
        'Asegurate de que el script de Google Analytics/Ads este cargado en el <head>.'
      );
      return;
    }

    // Validar que los IDs esten configurados
    if (GOOGLE_ADS_ID === 'YOUR_AW_ID') {
      console.error(
        'Error: GOOGLE_ADS_ID no esta configurado. ' +
        'Por favor edita apps/dashboard/lib/google-tracking.ts y configura tus IDs.'
      );
      return;
    }

    const label = conversionLabel || REGISTRATION_CONVERSION_LABEL;

    if (label === 'YOUR_CONVERSION_LABEL') {
      console.error(
        'Error: REGISTRATION_CONVERSION_LABEL no esta configurado. ' +
        'Por favor edita apps/dashboard/lib/google-tracking.ts y configura tu etiqueta de conversion.'
      );
      return;
    }

    const config: Record<string, any> = {
      send_to: `${GOOGLE_ADS_ID}/${label}`,
    };

    if (value !== undefined) {
      config.value = value;
      config.currency = currency;
    }

    window.gtag!('event', 'conversion', config);

    console.log('Google Ads conversion tracked:', {
      conversion_id: `${GOOGLE_ADS_ID}/${label}`,
      value,
      currency,
    });
  } catch (error) {
    console.error('Error tracking Google Ads conversion:', error);
  }
};

/**
 * Trackea un evento de registro (sign_up) en Google Analytics 4
 *
 * @param method - El metodo de registro usado ('email', 'google', etc.)
 * @param userId - El ID del usuario (opcional pero recomendado)
 *
 * Ejemplo de uso:
 * trackSignUpEvent('email', 'user-123')
 */
export const trackSignUpEvent = (
  method: 'email' | 'google' | string,
  userId?: string
): void => {
  try {
    if (!isGtagAvailable()) {
      console.warn(
        'Google Tag (gtag) no esta disponible. ' +
        'Asegurate de que el script de Google Analytics este cargado.'
      );
      return;
    }

    // Validar que el GA_MEASUREMENT_ID este configurado
    if (GA_MEASUREMENT_ID === 'YOUR_GA_ID') {
      console.error(
        'Error: GA_MEASUREMENT_ID no esta configurado. ' +
        'Por favor edita apps/dashboard/lib/google-tracking.ts y configura tu ID de Google Analytics.'
      );
      return;
    }

    const eventParams: Record<string, any> = {
      method,
    };

    if (userId) {
      eventParams.user_id = userId;
    }

    window.gtag!('event', 'sign_up', eventParams);

    console.log('Sign up event tracked:', { method, userId });
  } catch (error) {
    console.error('Error tracking sign up event:', error);
  }
};

/**
 * Trackea el registro exitoso completo
 * Dispara tanto el evento de conversion de Google Ads como el evento sign_up de GA4
 *
 * ESTA ES LA FUNCION PRINCIPAL QUE DEBES LLAMAR DESPUES DE UN REGISTRO EXITOSO
 *
 * @param options - Opciones de tracking
 * @param options.method - Metodo de registro ('email' o 'google')
 * @param options.userId - ID del usuario registrado
 * @param options.email - Email del usuario (opcional, solo para logging)
 * @param options.conversionValue - Valor de la conversion (opcional)
 *
 * Ejemplo de uso:
 * trackRegistrationConversion({
 *   method: 'email',
 *   userId: 'user-123',
 *   email: 'user@example.com'
 * })
 */
export const trackRegistrationConversion = (options: {
  method: 'email' | 'google';
  userId: string;
  email?: string;
  conversionValue?: number;
}): void => {
  try {
    const { method, userId, email, conversionValue } = options;

    console.log('Iniciando tracking de conversion de registro...');

    // 1. Trackear evento de sign_up en Google Analytics 4
    trackSignUpEvent(method, userId);

    // 2. Trackear conversion en Google Ads
    trackGoogleAdsConversion(undefined, conversionValue);

    // 3. Log para debugging (ocultar email por privacidad)
    console.log('Registration conversion tracked successfully:', {
      method,
      userId,
      email: email ? email.replace(/(.{2})(.*)(@.*)/, '$1***$3') : undefined,
      conversionValue,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error tracking registration conversion:', error);
  }
};

/**
 * Trackea un evento personalizado en Google Analytics 4
 *
 * @param eventName - Nombre del evento
 * @param eventParams - Parametros adicionales del evento
 *
 * Ejemplo de uso:
 * trackCustomEvent('button_click', { button_name: 'Start Trial' })
 */
export const trackCustomEvent = (
  eventName: string,
  eventParams?: Record<string, any>
): void => {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Tag (gtag) no esta disponible.');
      return;
    }

    window.gtag!('event', eventName, eventParams || {});

    console.log(`Custom event tracked: ${eventName}`, eventParams);
  } catch (error) {
    console.error(`Error tracking custom event ${eventName}:`, error);
  }
};

/**
 * Configura el User ID en Google Analytics
 * Util para trackear usuarios entre sesiones
 *
 * @param userId - ID del usuario
 */
export const setUserId = (userId: string): void => {
  try {
    if (!isGtagAvailable()) {
      console.warn('Google Tag (gtag) no esta disponible.');
      return;
    }

    if (GA_MEASUREMENT_ID === 'YOUR_GA_ID') {
      console.error(
        'Error: GA_MEASUREMENT_ID no esta configurado.'
      );
      return;
    }

    window.gtag!('config', GA_MEASUREMENT_ID, {
      user_id: userId,
    });

    console.log('User ID set:', userId);
  } catch (error) {
    console.error('Error setting user ID:', error);
  }
};

/**
 * Inicializa el tracking de Google Analytics y Google Ads
 * Esta funcion debe ser llamada una vez cuando se carga la app
 */
export const initializeGoogleTracking = (): void => {
  try {
    if (!isGtagAvailable()) {
      console.warn(
        'Google Tag (gtag) no esta disponible al inicializar. ' +
        'El tracking se habilitara cuando los scripts se carguen.'
      );
      return;
    }

    console.log('Google Tracking inicializado correctamente');
    console.log('GA_MEASUREMENT_ID:', GA_MEASUREMENT_ID);
    console.log('GOOGLE_ADS_ID:', GOOGLE_ADS_ID);
  } catch (error) {
    console.error('Error inicializando Google Tracking:', error);
  }
};
