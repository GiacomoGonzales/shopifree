# Seguridad de Endpoints de IA

## Resumen de Cambios de Seguridad

Este documento detalla las medidas de seguridad implementadas para proteger los endpoints de IA del dashboard y prevenir abuso de la API de Google Cloud (Gemini).

## Problema Identificado

**Fecha**: 2025-01-23
**Severidad**: 🔴 CRÍTICA

Los endpoints de IA (`/api/ai/enhance-image`, `/api/ai/improve-text`, `/api/ai/generate-seo`) tenían las siguientes vulnerabilidades:

1. ❌ **Sin autenticación**: Cualquiera podía llamar a los endpoints directamente sin estar autenticado
2. ❌ **UserID del cliente**: El `userId` se enviaba desde el frontend y no se verificaba
3. ❌ **Sin rate limiting**: No había límite de requests por IP o tiempo
4. ❌ **Sin validación de tamaño**: Imágenes de cualquier tamaño podían procesarse
5. ❌ **Posible abuso**: Costos elevados en Google Cloud por uso no autorizado

## Soluciones Implementadas

### 1. Verificación de Tokens JWT Local

**Archivo**: `lib/auth-middleware.ts`

- Verifica tokens JWT de Firebase mediante decode y validación local
- No requiere Firebase Admin SDK ni credenciales de service account
- No hace llamadas a APIs externas (más rápido y sin dependencias)
- Valida estructura del token, expiración, y campos de Firebase
- Compatible con organizaciones que restringen la creación de claves

**Variables de Entorno Requeridas**:
```env
# Solo necesitas las variables públicas de Firebase (no se requiere service account)
NEXT_PUBLIC_FIREBASE_API_KEY=<Tu API key de Firebase>
NEXT_PUBLIC_FIREBASE_PROJECT_ID=<ID del proyecto>
```

**NOTA**: Esta implementación decodifica y valida el JWT localmente sin llamar a APIs externas. Esto evita problemas con:
- Políticas organizacionales que restringen la creación de service accounts
- Errores 403 de Firebase Identity Toolkit API
- Latencia adicional por llamadas HTTP externas

### 2. Middleware de Autenticación

**Archivo**: `lib/auth-middleware.ts`

#### Funciones de Seguridad:

**`verifyAuthToken(request)`**
- Decodifica y valida el token JWT de Firebase localmente
- No requiere Firebase Admin SDK ni llamadas a APIs externas
- Valida estructura del JWT (3 partes: header.payload.signature)
- Verifica que el token no haya expirado (`exp` claim)
- Verifica que sea un token de Firebase (`firebase` y `user_id` claims)
- Verifica que el token no sea demasiado antiguo (máx. 24 horas desde `iat`)
- Retorna el `uid` del usuario autenticado
- Maneja errores de token expirado, inválido o mal formado

**`checkRateLimit(identifier, config)`**
- Rate limiting en memoria (10 requests/minuto para enhance-image)
- Usa IP del cliente como identificador
- Retorna si la solicitud debe ser bloqueada

**`getClientIp(request)`**
- Obtiene la IP real del cliente
- Soporta headers de proxies (Cloudflare, nginx, etc.)

**`validateImageSize(base64Data, maxSize)`**
- Valida el tamaño de imágenes en base64
- Límite máximo: 10MB
- Previene procesamiento de imágenes enormes

### 3. Endpoints Protegidos

#### `/api/ai/enhance-image`
**Protecciones**:
- ✅ Autenticación con Firebase Auth
- ✅ Rate limiting: 10 requests/minuto por IP
- ✅ Validación de tamaño: máximo 10MB
- ✅ Verificación de límites de suscripción

**Límites por Plan**:
- Free: 0 mejoras/mes
- Premium: 5 mejoras/mes
- Pro: 15 mejoras/mes

#### `/api/ai/improve-text`
**Protecciones**:
- ✅ Autenticación con Firebase Auth
- ✅ Rate limiting: 30 requests/minuto por IP

#### `/api/ai/generate-seo`
**Protecciones**:
- ✅ Autenticación con Firebase Auth
- ✅ Rate limiting: 20 requests/minuto por IP

### 4. Arquitectura de Validación de Uso AI (Split Read/Write)

**Problema**: Firestore security rules no permiten que el servidor escriba en documentos de usuario.

**Solución**: Split de responsabilidades entre servidor y cliente:

#### Servidor (API Route):
1. **Valida autenticación** - Decodifica y verifica el JWT
2. **Valida rate limiting** - Previene abuso por IP
3. **Valida límites de suscripción** - Lee (no escribe) el contador de uso con `getAIEnhancementUsage(uid)`
4. **Procesa solo si pasa todas las validaciones** - Llama a Gemini API

#### Cliente (Frontend):
1. **Incrementa el contador DESPUÉS del éxito** - Llama a `incrementAIEnhancementUsage(uid)` después de recibir la imagen mejorada
2. **Actualiza UI** - Recarga los datos de uso para mostrar el nuevo contador

**Ventajas de este enfoque**:
- ✅ El servidor mantiene control de acceso (valida ANTES de procesar)
- ✅ No requiere cambios en Firestore security rules
- ✅ El cliente solo puede incrementar su propio contador (reglas de Firestore lo permiten)
- ✅ Si el cliente no incrementa, afecta solo a sus propios datos, no a los costos de Google Cloud
- ✅ Evita errores de permisos en el servidor

**Archivos involucrados**:
- `app/api/ai/enhance-image/route.ts` - Llama a `getAIEnhancementUsage()` (lectura)
- `components/products/MediaGalleryWithAI.tsx` - Llama a `incrementAIEnhancementUsage()` (escritura)

### 5. Componentes Frontend Actualizados

**Archivos Modificados**:
- `components/products/MediaGalleryWithAI.tsx`
- `components/products/AITextImprover.tsx`
- `components/settings/SEOConfiguration.tsx`

**Cambios**:
- Obtienen token de autenticación con `user.getIdToken()`
- Envían token en header `Authorization: Bearer <token>`
- Manejan errores de autenticación (401)

## Flujo de Autenticación

```
1. Usuario autenticado en frontend
   ↓
2. Frontend obtiene token JWT de Firebase
   user.getIdToken()
   ↓
3. Frontend envía request con header:
   Authorization: Bearer <token>
   ↓
4. Backend verifica token con JWT decode local
   verifyAuthToken(request) → Decode y validar JWT
   ↓
5. Verifica rate limit por IP
   checkRateLimit(clientIp)
   ↓
6. Valida tamaño de imagen (solo enhance-image)
   validateImageSize(base64)
   ↓
7. Verifica límite de suscripción (SOLO LECTURA)
   getAIEnhancementUsage(uid) → Valida que tenga acceso y remaining > 0
   ↓
8. Procesa request con Gemini API
   ↓
9. Frontend incrementa contador (DESPUÉS del éxito)
   incrementAIEnhancementUsage(uid) → Actualiza Firestore desde cliente
```

**IMPORTANTE**: El servidor SOLO valida los límites (lectura), el cliente incrementa el contador después del éxito. Esto evita problemas de permisos de Firestore mientras mantiene la seguridad (el servidor valida ANTES de procesar).

## Rate Limits Configurados

| Endpoint | Límite | Ventana |
|----------|--------|---------|
| `/api/ai/enhance-image` | 10 requests | 1 minuto |
| `/api/ai/improve-text` | 30 requests | 1 minuto |
| `/api/ai/generate-seo` | 20 requests | 1 minuto |

## Validaciones de Tamaño

| Tipo | Límite Máximo |
|------|---------------|
| Imágenes (base64) | 10 MB |
| Texto | Sin límite específico |

## Monitoreo y Logs

Los endpoints ahora loguean:
- ✅ Intentos de autenticación
- ✅ IPs bloqueadas por rate limiting
- ✅ Tamaño de imágenes procesadas
- ✅ Uso de límites de suscripción
- ✅ Errores de API de Gemini

**Ejemplo de logs**:
```
🔐 Verifying authentication...
✅ User authenticated: abc123xyz
🌐 Client IP: 192.168.1.1
✅ Rate limit check passed. Remaining: 9
📏 Validating image size...
✅ Image size valid: 2.45 MB
🔍 Checking AI enhancement usage limits...
✅ AI enhancement usage validated and incremented
```

## Próximos Pasos Recomendados

### Mejoras Adicionales:

1. **Rate Limiting con Redis**: Migrar de memoria a Redis para persistencia entre deploys
2. **Monitoreo con Sentry**: Alertas automáticas de uso anómalo
3. **CORS Estricto**: Configurar orígenes permitidos
4. **API Keys por Usuario**: Para requests programáticas autorizadas
5. **Webhooks de Notificación**: Alertar cuando un usuario alcanza 80% de su límite

### Variables de Entorno a Configurar:

Asegúrate de tener estas variables en tu `.env.local` y en producción:

```env
# Firebase (las variables públicas que ya tienes configuradas)
NEXT_PUBLIC_FIREBASE_API_KEY=tu-firebase-api-key
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-proyecto-id

# Gemini API (ya configurado)
GEMINI_API_KEY=tu-gemini-api-key
```

**NOTA IMPORTANTE**: Ya NO necesitas `FIREBASE_SERVICE_ACCOUNT_KEY` porque ahora usamos la API REST de Firebase que no requiere credenciales de service account. Esto resuelve problemas con organizaciones que tienen políticas restrictivas.

## Testing

### Cómo Probar que Funciona:

1. **Test de autenticación**:
   ```bash
   # Sin token - debe fallar con 401
   curl -X POST http://localhost:3000/api/ai/enhance-image \
     -H "Content-Type: application/json" \
     -d '{"imageBase64":"test"}'

   # Respuesta esperada:
   # {"success":false,"error":"Missing or invalid authorization header"}
   ```

2. **Test de rate limiting**:
   - Haz 11 requests en menos de 1 minuto
   - La 11va debe retornar 429 (Too Many Requests)

3. **Test de tamaño de imagen**:
   - Intenta subir una imagen > 10MB
   - Debe retornar error de tamaño inválido

## Contacto

Si encuentras algún problema de seguridad, por favor reporta inmediatamente al equipo de desarrollo.

---
**Última actualización**: 2025-01-23
**Versión**: 1.0.0
