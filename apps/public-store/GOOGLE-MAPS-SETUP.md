# Configuración de Google Maps API para Direcciones de Clientes

## Descripción
La tienda pública incluye funcionalidad de autocompletado de direcciones en el perfil del cliente usando Google Places API. Esto permite que los usuarios ingresen direcciones exactas con coordenadas (latitud y longitud) que se guardan en Firestore.

## Requisitos
1. Cuenta de Google Cloud Platform
2. Proyecto con facturación habilitada
3. APIs habilitadas: Places API y Maps JavaScript API

## Configuración

### 1. Obtener API Key
1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - **Places API**
   - **Maps JavaScript API**
4. Ve a "Credenciales" y crea una API Key
5. Configura restricciones para tu dominio

### 2. Configurar Variables de Entorno
Agrega la siguiente variable a tu archivo `.env.local` en `apps/public-store/`:

```bash
NEXT_PUBLIC_MAPS_API_KEY=tu_api_key_de_google_maps
```

### 3. Funcionalidades Implementadas

#### En Mi Cuenta > Mi Perfil
- Autocompletado de direcciones en el campo "Dirección"
- Guardado automático de coordenadas (lat, lng) en Firestore
- Indicadores visuales de estado (cargando, coordenadas guardadas)
- Fallback a textarea normal si no hay API key configurada

### 4. Estructura de Datos en Firestore

```typescript
interface StoreCustomerData {
  // ... otros campos
  address?: string // Dirección legacy (para compatibilidad)
  location?: {
    address: string // Dirección completa
    lat: number     // Latitud
    lng: number     // Longitud
  }
}
```

Los datos se guardan en:
```
/stores/{storeId}/customers/{customerId}
```

### 5. Compatibilidad
- La funcionalidad es totalmente compatible con direcciones existentes
- Si no hay API key configurada, funciona como input de texto normal
- Las coordenadas se guardan automáticamente al seleccionar una dirección del autocompletado
- Se mantiene el campo `address` para compatibilidad con versiones anteriores

### 6. Países Soportados
El autocompletado está configurado para los siguientes países:
- México (MX)
- Argentina (AR) 
- Colombia (CO)
- Perú (PE)
- Chile (CL)
- Venezuela (VE)
- Ecuador (EC)
- Bolivia (BO)
- Paraguay (PY)
- Uruguay (UY)
- Brasil (BR)
- España (ES)
- Estados Unidos (US)

### 7. Costos
Revisa la [documentación de precios de Google Maps](https://developers.google.com/maps/documentation/places/web-service/usage-and-billing) para Places API.

### 8. Troubleshooting

#### La API no funciona
- Verifica que la API key esté correctamente configurada en `.env.local`
- Asegúrate de que Places API esté habilitada
- Revisa las restricciones de dominio
- Verifica que el proyecto tenga facturación habilitada

#### No aparecen sugerencias
- Verifica la configuración de países soportados
- Revisa la consola del navegador para errores
- Asegúrate de que el input tenga al menos 3 caracteres

#### Fallback sin API Key
Si no hay API key configurada, el componente automáticamente renderiza un textarea normal, manteniendo la funcionalidad básica.

## Implementación Técnica

### Componente Principal
- `apps/public-store/components/AddressAutocomplete.tsx` - Componente reutilizable

### Integración
- `apps/public-store/app/[storeSubdomain]/mi-cuenta/MiCuentaClient.tsx` - Página Mi Perfil

### Datos
Las coordenadas se guardan en la estructura `location` del documento del cliente en Firestore:

```javascript
{
  // ... otros campos del cliente
  location: {
    address: "Calle Ejemplo 123, Ciudad, País",
    lat: -34.6118,
    lng: -58.3960
  }
}
```

### Funcionalidades del Componente
1. **Carga dinámica del script de Google Maps**
2. **Autocompletado con restricciones geográficas**
3. **Indicadores visuales de estado**
4. **Fallback automático sin API key**
5. **Guardado de coordenadas automático**
6. **Compatibilidad con direcciones existentes** 