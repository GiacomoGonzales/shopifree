# Corrección del Campo de Precio en Zona de Entrega

## Problema Identificado
El campo de precio en el modal "Configurar zona de entrega" tenía los siguientes problemas:
1. ❌ El primer "0" no se podía borrar
2. ❌ No se podía escribir directamente, solo funcionaba con las flechitas
3. ❌ El formato numérico era confuso para el usuario
4. ❌ No se guardaba correctamente en algunos casos

## Cambios Realizados

### ✅ 1. Cambio de Tipo de Dato
**Archivo**: `apps/dashboard/components/settings/DeliveryZoneMap.tsx`

**Antes**:
```typescript
interface ZoneModalData {
  nombre: string
  precio: number  // ← Número directo
  estimatedTime: string
  color: string
}

// Estado inicial
precio: 0  // ← Siempre iniciaba en 0
```

**Después**:
```typescript
interface ZoneModalData {
  nombre: string
  precio: string  // ← Ahora es string
  estimatedTime: string
  color: string
}

// Estado inicial
precio: ''  // ← Inicia vacío
```

### ✅ 2. Mejora del Input
**Antes**:
```typescript
<input
  type="number"
  step="0.50"
  value={modalData.precio}  // ← Valor numérico fijo
  onChange={(e) => setModalData(prev => ({ ...prev, precio: Number(e.target.value) }))}
/>
```

**Después**:
```typescript
<input
  type="number"
  step="0.50"
  min="0"
  value={modalData.precio}  // ← Ahora es string
  onChange={(e) => setModalData(prev => ({ ...prev, precio: e.target.value }))}
  placeholder="0.00"  // ← Placeholder para guiar al usuario
/>
```

### ✅ 3. Validación de Precio
Se agregó validación antes de guardar:

```typescript
// Validar precio
const precio = parseFloat(modalData.precio);
if (isNaN(precio) || precio < 0) {
  alert('Por favor, ingresa un precio válido (mayor o igual a 0)');
  return;
}
```

### ✅ 4. Compatibilidad de Campos
Se agregaron campos adicionales para compatibilidad con el sistema de cálculo:

```typescript
let zoneData: any = {
  nombre: modalData.nombre.trim(),
  name: modalData.nombre.trim(), // Compatibilidad con formato inglés
  precio: precio,
  priceStandard: precio, // Campo esperado por el sistema de cálculo
  color: modalData.color,
  createdAt: new Date().toISOString(),
  isActive: true, // Por defecto activa
  // ... otros campos
}
```

### ✅ 5. Formato de Coordenadas
Se aseguró compatibilidad dual para coordenadas:

```typescript
zoneData.coordenadas = coordinates  // Formato dashboard
zoneData.coordinates = coordinates  // Formato sistema de cálculo
```

### ✅ 6. Reseteo Correcto
Se corrigieron todos los resets del modal:

```typescript
// Antes
setModalData({ nombre: '', precio: 0, estimatedTime: '', color: '#2563eb' })

// Después  
setModalData({ nombre: '', precio: '', estimatedTime: '', color: '#2563eb' })
```

## Comportamiento Actual

### ✅ Campo de Precio Mejorado
1. **Campo vacío al inicio**: No muestra "0" hardcodeado
2. **Edición libre**: Se puede escribir directamente cualquier número
3. **Validación**: Valida que sea un número válido >= 0
4. **Placeholder**: Muestra "0.00" como guía visual
5. **Compatibilidad**: Funciona tanto escribiendo como con flechitas

### ✅ Guardado en Firestore
```json
{
  "nombre": "Lima Sur",
  "name": "Lima Sur",
  "precio": 12,
  "priceStandard": 12,
  "coordinates": [...],
  "coordenadas": [...],
  "isActive": true,
  "color": "#2563eb",
  "createdAt": "2025-01-02T..."
}
```

## Cómo Probar

### 1. Crear Nueva Zona
1. Ve a Dashboard > Configuración > Envío > Entrega Local
2. Dibuja una zona en el mapa
3. En el modal "Configurar zona de entrega":
   - ✅ El campo precio debe estar vacío (no "0")
   - ✅ Debe permitir escribir directamente (ej: "12.5")
   - ✅ Debe permitir borrar todo el contenido
   - ✅ Debe validar valores negativos

### 2. Verificar en Firestore
1. Ve a Firebase Console > Firestore
2. Busca: `stores/[tu-store-id]/deliveryZones`
3. Verifica que el documento tenga:
   - ✅ `precio`: 12.5
   - ✅ `priceStandard`: 12.5
   - ✅ `coordinates`: [array de coordenadas]

### 3. Probar Cálculo de Envío
1. Simula un pedido en tu tienda
2. Usa las coordenadas dentro de la zona creada
3. Verifica que muestre el precio correcto (no S/ 8.00)

## Archivos Modificados
- ✅ `apps/dashboard/components/settings/DeliveryZoneMap.tsx` - Campo de precio
- ✅ `PRICE-INPUT-FIX.md` - Este documento

## Resultado Final
✅ **Campo de precio funcional y fácil de usar**
✅ **Validación de entrada mejorada**  
✅ **Compatibilidad total con sistema de cálculo**
✅ **Guardado correcto en Firestore**
