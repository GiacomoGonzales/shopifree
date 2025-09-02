# Corrección de Cálculo de Costos de Envío

## Problema Identificado
El sistema mostraba un costo de envío fijo de S/ 8.00 en lugar de:
1. Usar el precio real de las zonas de entrega configuradas en Firestore
2. Mostrar S/ 0.00 cuando no hay zonas configuradas (tienda sin configurar)
3. Mostrar S/ 0.00 cuando las coordenadas están fuera de las zonas configuradas

## Cambios Realizados

### 1. ✅ Eliminación del Fallback Hardcodeado
**Archivo**: `apps/public-store-v2/lib/delivery-zones.ts`

**Antes** (líneas 170-178):
```typescript
// FALLBACK: Usar precio base para Lima (coordenadas válidas de Perú)
const isInLima = coordinates.lat >= -12.5 && coordinates.lat <= -11.5 && 
                 coordinates.lng >= -77.5 && coordinates.lng <= -76.5;

if (isInLima) {
    return shippingMethod === 'express' ? 15 : 8;  // ← S/ 8.00 hardcodeado
} else {
    return shippingMethod === 'express' ? 25 : 15;
}
```

**Después**:
```typescript
// Si no hay zonas configuradas, costo es 0 (tienda sin configurar)
console.log('🚚 [calculateShippingCost] ❌ No hay zonas configuradas - costo: 0');
return 0;
```

### 2. ✅ Lógica Mejorada de Cálculo
La nueva lógica funciona así:

1. **Pickup**: Siempre S/ 0.00 ✅
2. **Sin coordenadas**: S/ 0.00 ✅
3. **Con zonas configuradas**:
   - Dentro de zona → Precio de la zona ✅
   - Fuera de zona → S/ 0.00 ✅
4. **Sin zonas configuradas**: S/ 0.00 ✅

### 3. ✅ Logging Detallado
Se agregó logging completo para debugging:

```typescript
console.log('🚚 [calculateShippingCost] Iniciando cálculo:', {
    coordinates,
    zonesCount: zones.length,
    shippingMethod
});
```

### 4. ✅ Función de Debug
Se agregó una función global para testing desde la consola:

```javascript
// En la consola del navegador:
debugShippingCalculation('storeId', { lat: -12.075, lng: -77.021 }, 'standard')
```

## Comportamiento Esperado

### Caso 1: Tienda sin zonas configuradas
- **Input**: Cualquier coordenada
- **Output**: S/ 0.00
- **Log**: "❌ No hay zonas configuradas - costo: 0"

### Caso 2: Coordenadas dentro de zona
- **Input**: Coordenadas dentro de polígono de zona
- **Output**: Precio configurado en la zona (ej: S/ 10.00)
- **Log**: "✅ Zona encontrada: [nombre]"

### Caso 3: Coordenadas fuera de zonas
- **Input**: Coordenadas fuera de todas las zonas
- **Output**: S/ 0.00
- **Log**: "❌ Coordenadas fuera de zonas configuradas - costo: 0"

## Cómo Probar

### 1. Desde el dashboard
1. Ir a Dashboard > Configuración > Envío > Zonas Locales
2. Verificar que las zonas estén configuradas con precios
3. Simular un pedido desde la tienda pública

### 2. Desde la consola del navegador
```javascript
// Probar con coordenadas específicas
debugShippingCalculation('FXclN6WhqoJnKstbQaHj', { lat: -12.075008, lng: -77.021184 }, 'standard')
```

### 3. Revisar logs en consola
Filtrar por estas etiquetas:
- `🚚 [calculateShippingCost]` - Cálculo de costo
- `🔍 [findDeliveryZoneForCoordinates]` - Detección de zona
- `[delivery-zones]` - Carga de zonas

## Archivos Modificados
- ✅ `apps/public-store-v2/lib/delivery-zones.ts` - Lógica principal
- ✅ `SHIPPING-COST-FIX.md` - Este documento

## Resultado Final
✅ **No más S/ 8.00 hardcodeado**
✅ **Costo real de zonas configuradas**
✅ **S/ 0.00 para tiendas sin configurar**
✅ **Logging completo para debugging**
