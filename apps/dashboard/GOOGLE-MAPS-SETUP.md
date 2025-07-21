# Configuración de Google Maps API

Este proyecto utiliza Google Maps API para la funcionalidad de zonas de entrega en el dashboard.

## Configuración requerida

### 1. Obtener API Key de Google Maps

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Habilita las siguientes APIs:
   - Maps JavaScript API
   - Places API
   - Geocoding API (opcional, para autocompletado de direcciones)

4. Ve a "Credenciales" > "Crear credenciales" > "Clave de API"
5. Copia la clave API generada

### 2. Configurar variables de entorno

Agrega la siguiente variable a tu archivo `.env.local`:

```bash
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_api_aqui
```

### 3. Restricciones de seguridad (Recomendado)

En Google Cloud Console, configura restricciones para tu API Key:

**Restricciones de aplicación:**
- Selecciona "Referentes HTTP (sitios web)"
- Agrega los dominios permitidos:
  - `localhost:3001/*` (para desarrollo)
  - `*.shopifree.app/*` (para producción)
  - Tu dominio personalizado si aplica

**Restricciones de API:**
- Limita a las APIs necesarias:
  - Maps JavaScript API
  - Places API
  - Geocoding API

### 4. Funcionalidades disponibles

Con esta configuración, el mapa de zonas de entrega te permitirá:

- ✅ Dibujar polígonos personalizados para zonas de entrega
- ✅ Crear zonas circulares con radio específico
- ✅ Configurar precios y tiempos de entrega por zona
- ✅ Guardar zonas en Firestore automáticamente
- ✅ Visualizar todas las zonas existentes en el mapa
- ✅ Eliminar zonas directamente desde el mapa

### 5. Estructura en Firestore

Las zonas se guardan en la siguiente estructura:

```
stores/{storeId}/deliveryZones/{zoneId}
{
  nombre: "Zona Lima Norte",
  tipo: "poligono", // o "circulo"
  precio: 6.5,
  coordenadas: [...], // array de lat/lng o centro+radio
  estimatedTime: "30-60 minutos" // opcional
}
```

### 6. Troubleshooting

**Error: "Google Maps JavaScript API error: RefererNotAllowedMapError"**
- Verifica que tu dominio esté incluido en las restricciones de la API Key

**Error: "La clave API de Google Maps no está configurada"**
- Asegúrate de tener `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` en tu `.env.local`
- Reinicia el servidor de desarrollo después de agregar la variable

**Error: "This page can't load Google Maps correctly"**
- Verifica que las APIs necesarias estén habilitadas en Google Cloud Console
- Revisa que la API Key tenga permisos para las APIs requeridas

### 7. Costos

Google Maps ofrece $200 USD de crédito gratuito mensual, lo cual generalmente cubre el uso de aplicaciones pequeñas a medianas. Para más información sobre precios, consulta [Google Maps Platform Pricing](https://developers.google.com/maps/pricing). 