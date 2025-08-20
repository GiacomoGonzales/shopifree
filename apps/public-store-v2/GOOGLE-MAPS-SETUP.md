# 🗺️ Configuración de Google Maps API para Autocompletado de Direcciones

## 📋 Pasos para configurar Google Maps API

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Maps JavaScript API**
   - **Places API** (necesaria para autocompletado)
   - **Geocoding API** (opcional, para validación de direcciones)

4. Ve a "Credenciales" > "Crear credenciales" > "Clave de API"
5. Copia la clave API generada

### 2. Configurar variables de entorno

Agrega la siguiente variable a tu archivo `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_api_aqui
```

### 3. Configurar restricciones de seguridad ⚠️ IMPORTANTE

En Google Cloud Console, configura restricciones para tu API Key:

#### **Restricciones de aplicación:**
- Selecciona "Referentes HTTP (sitios web)"
- Agrega los dominios permitidos:
  - `localhost:3004/*` (para desarrollo local)
  - `*.shopifree.app/*` (para producción)
  - `tu-dominio-personalizado.com/*` (si tienes dominio personalizado)

#### **Restricciones de API:**
- Limita a las APIs necesarias:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### 4. Verificar configuración

#### ✅ Si está configurado correctamente:
- El campo de dirección mostrará "Empieza a escribir para ver sugerencias..."
- Al escribir aparecerán sugerencias de direcciones
- Se autocompletarán los campos de dirección y ciudad

#### ❌ Si NO está configurado:
- El campo mostrará "Escribe tu dirección completa..."
- Aparecerá el mensaje "💡 Configura Google Maps API para habilitar autocompletado"
- El campo funcionará como input normal (sin autocompletado)

### 5. Errores comunes y soluciones

#### Error: "ReferrerNotAllowedMapError"
**Causa:** El dominio actual no está autorizado en las restricciones de API
**Solución:** Agregar el dominio (`localhost:3004` para desarrollo) a las restricciones

#### Error: "This API project is not authorized"
**Causa:** La API Key no tiene permisos para Places API
**Solución:** Habilitar Places API en Google Cloud Console

#### Error: "google.maps.places.Autocomplete is not a constructor"
**Causa:** Places API no está cargada
**Solución:** Verificar que el script incluya `&libraries=places`

### 6. Funcionalidades disponibles con Google Maps

Con la configuración correcta, el autocompletado de direcciones permite:

- ✅ **Sugerencias en tiempo real** mientras escribes
- ✅ **Autocompletado inteligente** de direcciones válidas
- ✅ **Relleno automático** de campos de ciudad
- ✅ **Restricción geográfica** a países específicos
- ✅ **Validación de direcciones** reales

### 7. Sin Google Maps API

Si no configuras Google Maps API, el checkout seguirá funcionando:

- ✅ **Campos manuales** para dirección y ciudad
- ✅ **Validación básica** de campos requeridos
- ✅ **Checkout completo** sin problemas
- ❌ **Sin autocompletado** de direcciones

---

## 🔧 Para desarrolladores

El autocompletado se implementa en `/themes/new-base-default/CheckoutModal.tsx` y:

- Detecta automáticamente si Google Maps API está disponible
- Se activa solo en el paso 2 (Envío) cuando se selecciona envío a domicilio
- Tiene fallbacks para cuando la API no está configurada
- No bloquea el funcionamiento del checkout si falla
