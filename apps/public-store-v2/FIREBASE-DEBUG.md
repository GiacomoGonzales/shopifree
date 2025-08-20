# Debug de Firebase - Zonas de Entrega

## Problema Identificado

Las zonas de entrega existen en Firestore pero no se cargan en el frontend.

**Firestore muestra**: 3 documentos en `stores/J0YnmGq3CvnlogUbGBPp/deliveryZones`
**Frontend muestra**: "Zonas disponibles: 0"

## Posibles Causas

### 1. Variables de Entorno Firebase
El `public-store-v2` necesita estas variables:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

### 2. Diferencia en Nombres de Campos
- **Dashboard guarda**: `coordenadas` (español)
- **Frontend busca**: `coordinates` (inglés)

## Verificación

### Paso 1: Verificar Firebase en Consola
Ejecutar en la consola del navegador:
```javascript
// Verificar configuración Firebase
console.log('Firebase Config:', {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'Definida' : 'Ausente',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'Definida' : 'Ausente'
});
```

### Paso 2: Debug de Zonas
Los nuevos logs mostrarán:
- ✅ Firebase conectado - Proyecto: [PROJECT_ID]
- 📍 Ruta: stores/J0YnmGq3CvnlogUbGBPp/deliveryZones
- 📊 Respuesta de Firestore: X documentos encontrados
- 🔍 Verificando coordenadas para cada zona

## Solución Implementada

### ✅ Debug Mejorado
- Logs detallados de conexión Firebase
- Verificación de variables de entorno
- Support para ambos formatos: `coordenadas` y `coordinates`

### ✅ Compatibilidad de Campos
```javascript
const coordsData = data.coordinates || data.coordenadas; // Soporte dual
```

### ✅ Logs Específicos
- Estado de conexión Firebase
- Número exacto de documentos encontrados
- Contenido de cada documento procesado

## Próximo Paso

1. **Recargar la página**
2. **Abrir consola del navegador**
3. **Hacer clic en "Usar mi ubicación"**
4. **Revisar los nuevos logs para identificar el problema exacto**

Los logs ahora mostrarán exactamente:
- Si Firebase se conecta correctamente
- Si encuentra los 3 documentos esperados
- Qué contiene cada documento
- Por qué no se procesan las coordenadas

## Resultado Esperado

Si todo funciona correctamente, deberías ver:
```
[delivery-zones] ✅ Firebase conectado - Proyecto: [PROJECT_ID]
[delivery-zones] 📊 Respuesta de Firestore: 3 documentos encontrados
[delivery-zones] Procesando zona: 1PKDkj5DM1XGpvwcbGZo
[delivery-zones] ✅ Cargadas 3 zonas de entrega
```
