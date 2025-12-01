# =Ê Guía de Configuración: Google Analytics & Google Ads Tracking

Esta guía te ayudará a configurar el tracking de conversiones de Google Ads y eventos de Google Analytics en tu aplicación Shopifree.

##  Lo que ya está instalado

El código de tracking ya está implementado y listo para usar. Solo necesitas configurar tus IDs reales.

### Archivos modificados:

1. **`lib/google-tracking.ts`** - Funciones de tracking reutilizables
2. **`app/[locale]/layout.tsx`** - Scripts de Google Analytics/Ads instalados
3. **`app/[locale]/register/page.tsx`** - Tracking integrado en el flujo de registro

## =' Configuración Paso a Paso

### PASO 1: Obtén tu ID de Google Analytics

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Selecciona tu propiedad
3. Ve a **Admin** ’ **Data Streams** ’ Selecciona tu stream web
4. Copia el **Measurement ID** (formato: `G-XXXXXXXXXX`)

### PASO 2: Obtén tu ID de Google Ads

1. Ve a [Google Ads](https://ads.google.com/)
2. Ve a **Tools & Settings** (=') ’ **Conversions**
3. Crea una nueva conversión de tipo "Website" si no tienes una
4. El ID de Google Ads está en el formato: `AW-XXXXXXXXX`

### PASO 3: Obtén la etiqueta de conversión

En la misma página de conversiones de Google Ads:
1. Haz clic en tu conversión de registro
2. Verás algo como: `AW-123456789/AbCdEfGhIjK`
3. La parte después del `/` es tu **Conversion Label** (`AbCdEfGhIjK`)

### PASO 4: Reemplaza los IDs en tu código

#### 4.1 Edita `lib/google-tracking.ts`

Abre el archivo y reemplaza:

```typescript
// Línea ~23
export const GA_MEASUREMENT_ID = 'G-TU-ID-AQUI'; //  Reemplaza con tu ID real

// Línea ~30
export const GOOGLE_ADS_ID = 'AW-TU-ID-AQUI'; //  Reemplaza con tu ID real

// Línea ~37
export const REGISTRATION_CONVERSION_LABEL = 'Tu-Label-Aqui'; //  Reemplaza con tu label real
```

**Ejemplo real:**
```typescript
export const GA_MEASUREMENT_ID = 'G-ABC123XYZ';
export const GOOGLE_ADS_ID = 'AW-987654321';
export const REGISTRATION_CONVERSION_LABEL = 'AbC-dEfGhIjK';
```

#### 4.2 Edita `app/[locale]/layout.tsx`

Busca las líneas 314 y 324-329 y reemplaza:

```tsx
// Línea ~314
src="https://www.googletagmanager.com/gtag/js?id=G-TU-ID-AQUI"

// Línea ~324
gtag('config', 'G-TU-ID-AQUI', {

// Línea ~329
gtag('config', 'AW-TU-ID-AQUI');
```

**Con tus IDs reales:**
```tsx
src="https://www.googletagmanager.com/gtag/js?id=G-ABC123XYZ"

gtag('config', 'G-ABC123XYZ', {

gtag('config', 'AW-987654321');
```

### PASO 5: ¡Listo! Ya está funcionando

No necesitas hacer nada más. El tracking se disparará automáticamente cuando un usuario se registre exitosamente.

## >ê Cómo Probar que Funciona

### Prueba en desarrollo:

1. Inicia tu aplicación: `npm run dev` o `yarn dev`
2. Abre las **DevTools del navegador** (F12)
3. Ve a la pestaña **Console**
4. Completa el flujo de registro con un email de prueba
5. Deberías ver en la consola:

```
<¯ Iniciando tracking de conversión de registro...
 Sign up event tracked: { method: 'email', userId: 'xxx' }
 Google Ads conversion tracked: { conversion_id: 'AW-XXX/YYY', ... }
 Registration conversion tracked successfully: { ... }
```

### Prueba en Google Analytics (tiempo real):

1. Ve a [Google Analytics](https://analytics.google.com/)
2. Ve a **Reports** ’ **Realtime**
3. Completa un registro
4. En 5-10 segundos deberías ver el evento `sign_up` aparecer

### Verifica en Google Ads:

1. Ve a [Google Ads](https://ads.google.com/)
2. Ve a **Tools & Settings** ’ **Conversions**
3. Haz clic en tu conversión de registro
4. Las conversiones pueden tardar **hasta 24 horas** en aparecer

**Nota:** Para testing, usa el [Google Tag Assistant](https://tagassistant.google.com/) para verificar que los tags se disparan correctamente.

## =Ë Qué se trackea automáticamente

### En Google Analytics 4:
-  Evento `sign_up` con parámetros:
  - `method`: 'email' o 'google'
  - `user_id`: ID del usuario en Firebase

### En Google Ads:
-  Conversión personalizada de registro
-  Valor de conversión (opcional)
-  ID de conversión único

## = Debugging

Si el tracking no funciona, verifica:

1. **¿Los scripts se cargan?**
   - Abre DevTools ’ Network
   - Busca `gtag/js` en los requests
   - Debe cargar desde `googletagmanager.com`

2. **¿Los IDs están correctos?**
   - Abre DevTools ’ Console
   - Busca mensajes de error en rojo (L)
   - Si ves "GOOGLE_ADS_ID no está configurado", reemplaza los IDs

3. **¿gtag está disponible?**
   - En la consola del navegador escribe: `typeof window.gtag`
   - Debe devolver `'function'`
   - Si devuelve `'undefined'`, los scripts no se cargaron

4. **¿Se disparan los eventos?**
   - Abre DevTools ’ Network
   - Filtra por "google-analytics.com" o "googleadservices.com"
   - Deberías ver requests POST al completar el registro

## <¯ Eventos adicionales disponibles

El archivo `lib/google-tracking.ts` incluye funciones para trackear otros eventos:

### Trackear evento personalizado:
```typescript
import { trackCustomEvent } from '@/lib/google-tracking'

trackCustomEvent('button_click', {
  button_name: 'Upgrade Plan',
  plan_type: 'Premium'
})
```

### Configurar User ID:
```typescript
import { setUserId } from '@/lib/google-tracking'

setUserId('user-12345')
```

### Trackear conversión de Google Ads personalizada:
```typescript
import { trackGoogleAdsConversion } from '@/lib/google-tracking'

trackGoogleAdsConversion('CustomLabel', 49.99, 'USD')
```

##   Importante

- **NO** commitees este archivo con tus IDs reales al repositorio público
- Considera usar variables de entorno para IDs sensibles en producción
- Los IDs de Google Analytics y Google Ads NO son secretos, pero es buena práctica mantenerlos privados

## =Ú Recursos

- [Google Analytics 4 Documentation](https://developers.google.com/analytics/devguides/collection/ga4)
- [Google Ads Conversion Tracking](https://support.google.com/google-ads/answer/1722022)
- [gtag.js Developer Guide](https://developers.google.com/tag-platform/gtagjs)

## <˜ ¿Necesitas Ayuda?

Si tienes problemas con la configuración:

1. Verifica que seguiste todos los pasos
2. Revisa la consola del navegador en busca de errores
3. Usa [Google Tag Assistant](https://tagassistant.google.com/)
4. Contacta al equipo de desarrollo

---

** Configuración completada por:** Claude Code
**=Å Fecha:** 2025-11-06
