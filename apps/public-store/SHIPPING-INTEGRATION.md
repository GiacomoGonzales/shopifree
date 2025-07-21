# Integración de Cálculo Automático de Envío

Este documento explica cómo funciona el sistema de cálculo automático de envío en el checkout de la tienda pública.

## Funcionalidades Implementadas

### ✅ Cálculo Automático de Envío
- **Detección de ubicación**: Obtiene coordenadas desde direcciones usando Google Maps Geocoding API
- **Verificación de zonas**: Compara la ubicación del cliente con las zonas de entrega configuradas en el dashboard
- **Cálculo en tiempo real**: Actualiza automáticamente el costo de envío cuando el cliente ingresa su dirección

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
- Cálculo automático de envío
- UI mejorada con información de zona

## Flujo de Funcionamiento

1. **Cliente ingresa dirección**: Usa autocompletado de Google Maps
2. **Detección de tipo de entrada**: Distingue entre escribir manualmente vs seleccionar del autocompletado
3. **Cálculo onBlur para escritura manual**: Solo calcula cuando pierde el foco del campo (onBlur)
4. **Cálculo inmediato para autocompletado**: Cuando se selecciona del menú, calcula inmediatamente
5. **Obtención de coordenadas**: Se extraen lat/lng automáticamente o vía geocoding
6. **Verificación de zonas**: Se consultan las zonas configuradas en Firestore
7. **Cálculo de envío**: Se ejecutan algoritmos de verificación geoespacial
8. **Actualización de UI**: Se muestra costo, zona y tiempo estimado
9. **Total final**: Se suma envío al subtotal automáticamente

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
- **Geocoding API**: Para convertir direcciones a coordenadas
- **Places API**: Para autocompletado mejorado

## Estados de Envío

### ✅ Dentro de Zona de Cobertura
```
✓ Zona: Centro de Lima • 30-60 minutos
Envío: S/ 10.00
Total: S/ 119.00 (Subtotal: S/ 109.00 + Envío: S/ 10.00)
```

### ⚠️ Fuera de Zona de Cobertura
```
⚠ Esta dirección está fuera de nuestras zonas de entrega
Envío: A coordinar
Total: S/ 109.00
```

### 🔄 Calculando
```
Envío: Calculando... [spinner]
```

### 💭 Escribiendo (Nuevo)
```
ℹ️ Selecciona del autocompletado o termina de escribir tu dirección
Envío: A coordinar
```

### ❌ Error de Geocoding
```
No se pudo encontrar la ubicación de la dirección proporcionada
Envío: A coordinar
```

### ❌ Error de Cobertura (Autocompletado)
```
Esta dirección está fuera de nuestras zonas de entrega
Envío: A coordinar
```

### ❌ Error de Cobertura (Manual)
```
No encontramos esta dirección en nuestras zonas de cobertura
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
- El usuario obtiene coordenadas exactas → cálculo instantáneo

#### **Al finalizar escritura:**
- Cuando el usuario termina de escribir y quita el foco del campo (evento onBlur)
- Requiere mínimo 10 caracteres para activar el cálculo
- Sin distracciones durante la escritura

#### **Nunca:**
- Mientras el usuario está escribiendo activamente
- Con direcciones muy cortas (< 10 caracteres)
- Sin mensajes de error que cambien constantemente

## Beneficios

### Para los Clientes
- **Transparencia**: Conocen el costo exacto antes de confirmar
- **Rapidez**: No necesitan esperar confirmación del comerciante
- **Precisión**: Verificación automática de cobertura
- **UX sin distracciones**: Pueden escribir libremente sin mensajes cambiantes

### Para los Comerciantes
- **Automatización**: Menos coordinación manual de envíos
- **Eficiencia**: Pedidos más completos desde el inicio
- **Control**: Zonas configuradas exactamente según su capacidad

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