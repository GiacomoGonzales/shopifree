# Integración de Cálculo Automático de Envío

Este documento explica cómo funciona el sistema de cálculo automático de envío en el checkout de la tienda pública.

## Funcionalidades Implementadas

### ✅ Cálculo Automático de Envío
- **Detección de ubicación**: Obtiene coordenadas desde direcciones usando Google Maps Geocoding API
- **Verificación de zonas**: Compara la ubicación del cliente con las zonas de entrega configuradas en el dashboard
- **Cálculo en tiempo real**: Actualiza automáticamente el costo de envío cuando el cliente ingresa su dirección

### ✅ Geolocalización del Cliente (Nuevo)
- **Botón "📍 Usar mi ubicación actual"**: Permite obtener la ubicación GPS del dispositivo
- **Conversión automática**: Convierte coordenadas GPS a dirección usando Google Geocoding API
- **Cálculo inmediato**: Ejecuta verificación de zona automáticamente al obtener la ubicación
- **Configuración por tienda**: Solo aparece si `allowGPS` está activado en configuración avanzada
- **Manejo de errores**: Mensajes específicos para diferentes tipos de errores de geolocalización

### ✅ Algoritmos de Verificación
- **Polígonos**: Usa el algoritmo Ray Casting para verificar si un punto está dentro de un polígono
- **Círculos**: Calcula la distancia usando la fórmula de Haversine y compara con el radio

### ✅ Integración con Checkout
- **UI actualizada**: Muestra costo de envío, zona detectada y tiempo estimado
- **Total automático**: Incluye automáticamente el envío en el total final
- **Mensaje WhatsApp**: Incluye información completa de envío en el pedido
- **Cálculo onBlur**: Solo calcula cuando el usuario termina de escribir y quita el foco
- **Detección de autocompletado**: Calcula inmediatamente al seleccionar del autocompletado

## Archivos Principales

### `lib/delivery-zones.ts`
Contiene las utilidades principales:
- `checkDeliveryLocation()`: Función principal para verificar ubicación
- `geocodeAddress()`: Convierte direcciones a coordenadas
- `getDeliveryZones()`: Carga zonas desde Firestore

### `lib/hooks/useShippingCalculator.ts`
Hook React para manejar el cálculo de envío:
- Estado de carga automático
- Cache para evitar recálculos innecesarios
- Manejo de errores robusto

### `components/checkout/CheckoutModal.tsx`
Componente de checkout actualizado:
- Integración con Google Maps autocompletado
- **Botón de geolocalización**: Función `handleUseMyLocation()`
- **Conversión GPS a dirección**: Usando `google.maps.Geocoder`
- Cálculo automático de envío
- UI mejorada con información de zona

## Formas de Ingresar Dirección

### 1. 📝 Campo de Autocompletado (Google Places)
```
┌─ Dirección * ──────────────────────────────────────┐
│ 🗺️ [Empieza a escribir tu dirección...]           │
│ ▼ Av. Javier Prado Este 123, San Isidro, Lima     │
│ ▼ Av. Javier Prado Este 456, Surco, Lima          │
└────────────────────────────────────────────────────┘
✓ Autocompletado de direcciones habilitado
```
- **Comportamiento**: Cálculo inmediato al seleccionar
- **Coordenadas**: Automáticas desde Google Places
- **Precisión**: Alta (coordenadas exactas)

### 2. 📍 Botón "Usar mi ubicación actual"
```
┌────────────────────────────────────────────────────┐
│              📍 Usar mi ubicación actual           │
└────────────────────────────────────────────────────┘
```
- **Disponible**: Siempre (cuando Google Maps está cargado)
- **Proceso**: GPS → Coordenadas → Geocoding reverso → Dirección
- **Comportamiento**: Cálculo inmediato tras obtener dirección
- **Precisión**: Muy alta (GPS del dispositivo)

### 3. ⌨️ Escritura Manual
```
┌─ Dirección * ──────────────────────────────────────┐
│ 🗺️ [Av. Lima 123...]                              │
└────────────────────────────────────────────────────┘
```
- **Comportamiento**: Cálculo onBlur (al quitar foco)
- **Coordenadas**: Via geocoding de la dirección escrita
- **Precisión**: Variable (depende de la exactitud del texto)

## Flujo de Funcionamiento

### Flujo con Autocompletado
1. **Cliente escribe dirección**: Aparecen sugerencias de Google Places
2. **Selecciona opción**: Se obtienen coordenadas automáticamente
3. **Cálculo inmediato**: Se verifican zonas y muestra costo
4. **Total actualizado**: Incluye envío automáticamente

### Flujo con Geolocalización (Nuevo)
1. **Cliente presiona botón GPS**: "📍 Usar mi ubicación actual"
2. **Solicitud de permiso**: Navigator pide autorización
3. **Obtención de coordenadas**: GPS del dispositivo
4. **Geocoding reverso**: Coordenadas → Dirección legible
5. **Rellenado automático**: Campo de dirección se completa
6. **Cálculo inmediato**: Se verifica zona y muestra costo
7. **Total actualizado**: Incluye envío automáticamente

### Flujo Manual
1. **Cliente escribe dirección**: Texto libre
2. **Pierde foco del campo**: Evento onBlur se activa
3. **Geocoding**: Dirección → Coordenadas (si es posible)
4. **Verificación de zonas**: Se comparan coordenadas
5. **Actualización de UI**: Se muestra resultado

## Configuración Requerida

### Variables de Entorno
```bash
# Google Maps API Key (misma que dashboard)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=tu_clave_api_aqui

# Firebase Configuration (misma que dashboard)
NEXT_PUBLIC_FIREBASE_API_KEY=tu_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu_proyecto.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu_proyecto_id
# ... resto de configuración Firebase
```

### APIs Requeridas en Google Cloud
- **Maps JavaScript API**: Para autocompletado de direcciones
- **Geocoding API**: Para convertir direcciones a coordenadas y viceversa
- **Places API**: Para autocompletado mejorado

### Configuración en Dashboard
El botón de geolocalización aparece automáticamente cuando Google Maps está cargado. No requiere configuración adicional en el dashboard.

## Estados de Envío

### ✅ Dentro de Zona de Cobertura
```
✓ Zona: Centro de Lima • 30-60 minutos
Envío: S/ 10.00
Total: S/ 119.00 (Subtotal: S/ 109.00 + Envío: S/ 10.00)
```

### ℹ️ Fuera de Zona de Cobertura
```
ℹ️ Estás fuera de la zona de cobertura, pero aún así puedes continuar con el pedido y coordinar la entrega vía WhatsApp
Envío: A coordinar
Total: S/ 109.00
```

### 🔄 Calculando
```
Envío: Calculando... [spinner]
```

### 📍 Obteniendo Ubicación (Nuevo)
```
Botón: [🔄] Obteniendo ubicación...
```

### 💭 Escribiendo
```
ℹ️ Selecciona del autocompletado o termina de escribir tu dirección
Envío: A coordinar
```

### ❌ Errores de Geolocalización (Nuevos)
```
❌ Permiso denegado: "Permiso de ubicación denegado. Por favor escribe tu dirección manualmente."
❌ Ubicación no disponible: "Tu ubicación no está disponible. Por favor escribe tu dirección manualmente."
❌ Timeout: "Tiempo de espera agotado. Por favor escribe tu dirección manualmente."
❌ Google Maps no disponible: "Google Maps no está disponible. Por favor escribe tu dirección manualmente."
```

### ❌ Error de Geocoding
```
No se pudo encontrar la ubicación de la dirección proporcionada
Envío: A coordinar
```

### ℹ️ Fuera de Cobertura (Mensaje Positivo)
```
Estás fuera de la zona de cobertura, pero aún así puedes continuar con el pedido y coordinar la entrega vía WhatsApp
Envío: A coordinar
```

## Estructura en Firestore

Las zonas de entrega se almacenan en:
```
stores/{storeId}/deliveryZones/{zoneId}
{
  nombre: "Centro de Lima",
  tipo: "poligono", // o "circulo"
  precio: 10.00,
  coordenadas: [...], // array de lat/lng o centro+radio
  estimatedTime: "30-60 minutos", // opcional
  createdAt: "2024-01-01T00:00:00.000Z"
}
```

## Comportamiento de Cálculo

### 🎯 Cuándo se Calcula el Envío

#### **Inmediatamente:**
- Al seleccionar una dirección del autocompletado de Google Maps
- **Al usar geolocalización**: Después de obtener coordenadas GPS y convertir a dirección
- El usuario obtiene coordenadas exactas → cálculo instantáneo

#### **Al finalizar escritura:**
- Cuando el usuario termina de escribir y quita el foco del campo (evento onBlur)
- Requiere mínimo 10 caracteres para activar el cálculo
- Sin distracciones durante la escritura

#### **Nunca:**
- Mientras el usuario está escribiendo activamente
- Con direcciones muy cortas (< 10 caracteres)
- Sin mensajes de error que cambien constantemente

## Funcionalidad de Geolocalización

### 🌍 Configuración del GPS
```javascript
navigator.geolocation.getCurrentPosition(
  // Success callback
  // Error callback
  {
    enableHighAccuracy: true,  // GPS de alta precisión
    timeout: 10000,           // 10 segundos máximo
    maximumAge: 300000        // Cache por 5 minutos
  }
)
```

### 🔄 Proceso de Conversión
1. **GPS**: `{ latitude: -12.0464, longitude: -77.0428 }`
2. **Geocoder**: `new google.maps.Geocoder()`
3. **Reverse Geocoding**: Coordenadas → Dirección
4. **Resultado**: `"Av. Javier Prado Este 123, San Isidro, Lima, Perú"`

### ⚙️ Ventajas de la Geolocalización
- **Precisión máxima**: Coordenadas exactas del GPS
- **Experiencia rápida**: Un clic y listo
- **Menos errores**: No depende de que el usuario escriba correctamente
- **Accesibilidad**: Ideal para usuarios en móviles

### 🔒 Consideraciones de Privacidad
- **Permiso explícito**: El usuario debe autorizar el acceso
- **Uso temporal**: Solo durante el checkout
- **No almacenamiento**: No se guarda la ubicación GPS (solo la dirección final)
- **Fallback disponible**: Siempre pueden escribir manualmente

## Beneficios

### Para los Clientes
- **Transparencia**: Conocen el costo exacto antes de confirmar
- **Rapidez**: No necesitan esperar confirmación del comerciante
- **Precisión**: Verificación automática de cobertura
- **Conveniencia**: Opción de GPS para móviles
- **UX sin distracciones**: Pueden escribir libremente sin mensajes cambiantes
- **Interfaz suave**: Focus neutro y no agresivo en los campos del formulario

### Para los Comerciantes
- **Automatización**: Menos coordinación manual de envíos
- **Eficiencia**: Pedidos más completos desde el inicio
- **Control**: Zonas configuradas exactamente según su capacidad
- **Datos precisos**: Direcciones más exactas con GPS

## Estilos de Interfaz

### 🎨 Focus States Suaves
Todos los campos del formulario utilizan un estilo de focus suave y neutral:

```css
/* Estilo anterior (agresivo) */
focus:ring-2 focus:ring-gray-900 focus:border-gray-900

/* Estilo actual (suave) */
focus:outline-none focus:ring-1 focus:ring-gray-400 focus:border-gray-400
```

**Características:**
- **Ring más delgado**: `ring-1` en lugar de `ring-2`
- **Color neutro**: `gray-400` en lugar de `gray-900`
- **Menos contraste**: Más suave para los ojos
- **Outline eliminado**: `outline-none` para control total del estilo

**Campos afectados:**
- ✅ Nombre completo
- ✅ Teléfono  
- ✅ Email
- ✅ Dirección
- ✅ Referencia
- ✅ Notas adicionales
- ✅ Botón de geolocalización

## Troubleshooting

### Error: "No se pudo encontrar la ubicación"
- Verificar que Google Maps API Key esté configurada
- Asegurar que Geocoding API esté habilitada
- Verificar límites de API en Google Cloud Console

### Error: "Esta dirección está fuera de nuestras zonas"
- Verificar que las zonas estén configuradas en el dashboard
- Revisar que las coordenadas de las zonas sean correctas
- Confirmar que el storeId sea el correcto

### El cálculo no se actualiza automáticamente
- Verificar que el hook useShippingCalculator esté implementado
- Confirmar que las dependencias del useEffect estén correctas
- Revisar console.log para errores de conexión

## Próximas Mejoras

- [ ] Cache local de zonas para mejor rendimiento
- [ ] Soporte para múltiples métodos de envío por zona
- [ ] Integración con APIs de empresas de mensajería
- [ ] Notificaciones en tiempo real de cambios de zona
- [ ] Estimación de tiempo más precisa basada en tráfico 