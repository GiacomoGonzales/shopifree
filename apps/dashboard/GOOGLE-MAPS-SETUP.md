# Configuración de Google Maps API para Autocompletado de Direcciones

## Descripción
El dashboard incluye funcionalidad de autocompletado de direcciones usando Google Places API. Esto permite que los usuarios escriban direcciones que se autocompletan automáticamente y se guardan las coordenadas (latitud y longitud) en Firestore.

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
Agrega la siguiente variable a tu archivo `.env.local`:

```bash
NEXT_PUBLIC_MAPS_API_KEY=tu_api_key_de_google_maps
```

### 3. Funcionalidades Implementadas

#### En Settings General (`/settings/general`)
- Autocompletado de direcciones cuando "¿Tiene local físico?" está marcado
- Guardado automático de coordenadas (lat, lng) en Firestore
- Indicadores visuales de estado (cargando, coordenadas guardadas)

#### En Onboarding de Tienda
- La misma funcionalidad está disponible durante la configuración inicial

### 4. Estructura de Datos en Firestore

```typescript
interface StoreConfig {
  // ... otros campos
  address?: string // Dirección legacy
  location?: {
    address: string // Dirección completa
    lat: number     // Latitud
    lng: number     // Longitud
  }
}
```

### 5. Compatibilidad
- La funcionalidad es totalmente compatible con direcciones existentes
- Si no hay API key configurada, funciona como input de texto normal
- Las coordenadas se guardan automáticamente al seleccionar una dirección del autocompletado

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
- Verifica que la API key esté correctamente configurada
- Asegúrate de que Places API esté habilitada
- Revisa las restricciones de dominio
- Verifica que el proyecto tenga facturación habilitada

#### No aparecen sugerencias
- Verifica la configuración de países soportados
- Revisa la consola del navegador para errores
- Asegúrate de que el input tenga al menos 3 caracteres

## Implementación Técnica

La funcionalidad está implementada directamente en:
- `apps/dashboard/app/[locale]/settings/general/page.tsx`
- También disponible en el onboarding de la tienda

Las coordenadas se guardan en la estructura `location` del documento de la tienda en Firestore, manteniendo compatibilidad con el campo `address` existente. 