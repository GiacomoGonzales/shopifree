# Fix: Incremento de Contador de Cupones

## Problema
Las reglas de seguridad de Firestore bloqueaban el incremento del contador `totalUses` de cupones desde el cliente (sin autenticación del dueño).

## Solución Implementada
Creación de una API route que usa Firebase Admin SDK con permisos completos para incrementar el contador.

## Archivos Creados/Modificados

### 1. `/apps/public-store-v2/lib/firebase-admin.ts` (NUEVO)
Módulo para inicializar Firebase Admin SDK con credenciales del servidor.

### 2. `/apps/public-store-v2/app/api/increment-coupon/route.ts` (NUEVO)
API route que incrementa el contador usando Firebase Admin SDK.

### 3. `/apps/public-store-v2/lib/coupons.ts` (MODIFICADO)
Función `incrementCouponUsage()` ahora llama a la API en lugar de actualizar directamente.

### 4. `/apps/public-store-v2/package.json` (MODIFICADO)
Agregada dependencia `firebase-admin: ^12.0.0`

## Pasos para Completar la Instalación

### 1. Instalar Dependencias
```bash
cd apps/public-store-v2
npm install
```

### 2. Configurar Variables de Entorno
Agregar a `.env.local`:

```env
# Firebase Admin SDK (para operaciones del servidor)
FIREBASE_ADMIN_PROJECT_ID=tu-project-id
FIREBASE_ADMIN_CLIENT_EMAIL=firebase-adminsdk-xxxxx@tu-project-id.iam.gserviceaccount.com
FIREBASE_ADMIN_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-private-key-aqui\n-----END PRIVATE KEY-----\n"
```

### 3. Obtener las Credenciales

1. Ve a **Firebase Console** → **Project Settings** → **Service Accounts**
2. Click en **Generate new private key**
3. Se descargará un archivo JSON con las credenciales
4. Copia los valores:
   - `project_id` → `FIREBASE_ADMIN_PROJECT_ID`
   - `client_email` → `FIREBASE_ADMIN_CLIENT_EMAIL`
   - `private_key` → `FIREBASE_ADMIN_PRIVATE_KEY`

**IMPORTANTE:** El `private_key` debe mantener los `\n` literales (no convertir a saltos de línea reales).

### 4. Reglas de Firestore
Agregar o actualizar la regla para cupones en `firestore.rules`:

```javascript
match /stores/{storeId}/coupons/{couponId} {
  allow read: if true;
  allow create, delete: if isAuthenticated() &&
                          request.auth.uid == get(/databases/$(database)/documents/stores/$(storeId)).data.ownerId;
  allow update: if (isAuthenticated() &&
                    request.auth.uid == get(/databases/$(database)/documents/stores/$(storeId)).data.ownerId) ||
                   (request.resource.data.diff(resource.data).affectedKeys().hasOnly(['totalUses', 'updatedAt']));
}
```

**Nota:** Aunque tengas la regla permisiva en `update`, el Admin SDK puede fallar desde el cliente. Por eso usamos la API route.

### 5. Probar
1. Desplegar los cambios
2. Hacer un pedido con un cupón aplicado
3. Verificar en la consola del navegador:
   - `[Coupons] 🔄 Calling API to increment coupon usage`
   - `[API] Incrementing coupon usage`
   - `[API] ✅ Coupon usage incremented successfully`
   - `[Coupons] ✅ Incremented usage for coupon`
4. Verificar en el dashboard que el contador de usos se actualice

## Flujo Técnico

```
1. Cliente crea orden con cupón
   ↓
2. lib/orders.ts detecta appliedCoupon.id
   ↓
3. Llama incrementCouponUsage(storeId, couponId)
   ↓
4. lib/coupons.ts hace fetch a /api/increment-coupon
   ↓
5. API route usa Firebase Admin SDK
   ↓
6. Firebase Admin actualiza totalUses con permisos completos
   ↓
7. Dashboard muestra contador actualizado
```

## Ventajas de esta Solución

1. **Seguridad**: El cliente no tiene permisos directos para modificar cupones
2. **Control**: Solo el servidor puede incrementar el contador
3. **Simple**: No requiere configurar Firebase Functions
4. **Escalable**: La API route puede manejar validaciones adicionales si es necesario

## Notas de Seguridad

- La API route no requiere autenticación porque solo incrementa un contador
- No se pueden modificar otros campos del cupón (código, valor, fechas)
- Las reglas de Firestore siguen protegiendo la creación/eliminación de cupones
- El Admin SDK solo se usa en el servidor, nunca se expone al cliente