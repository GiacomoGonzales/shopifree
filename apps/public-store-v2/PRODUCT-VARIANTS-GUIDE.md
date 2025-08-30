# Guía de Variantes de Productos con Precios

Esta guía explica cómo configurar productos con variantes que tienen precios específicos (como el ejemplo del alimento para perros CANBO CACHORRO RAZA PEQUEÑA con variantes de 1kg y 7kg).

## Estructura de Datos

Para que un producto use el nuevo selector de variantes con precios, debe tener en el campo `tags` del producto un campo llamado `variants` que contenga un array JSON con las variantes disponibles.

### Ejemplo de Configuración

En el dashboard de administración, en el campo de metadatos/tags del producto, agrega:

**Estructura Recomendada (completa):**
```json
{
  "variants": [
    {
      "id": "1kg",
      "name": "Peso",
      "value": "1kg",
      "price": 23,
      "stock": 10,
      "isAvailable": true
    },
    {
      "id": "7kg", 
      "name": "Peso",
      "value": "7kg",
      "price": 128,
      "stock": 5,
      "isAvailable": true
    }
  ]
}
```

**Estructura Simplificada (compatible):**
```json
{
  "variants": [
    {
      "id": "xl1oybfgv",
      "name": "1kg",
      "price": 23,
      "stock": 0
    },
    {
      "id": "t1qvbg4xh",
      "name": "7kg",
      "price": 128,
      "stock": 0
    }
  ]
}
```

### Campos de Cada Variante

- **id**: Identificador único de la variante (string) - REQUERIDO
- **name**: En estructura completa: tipo de variante (ej: "Peso", "Tamaño"). En estructura simplificada: valor de la variante (ej: "1kg", "7kg") - REQUERIDO
- **value**: Valor específico de la variante (ej: "1kg", "7kg") - Opcional (si no está presente, se usa 'name')
- **price**: Precio específico de esta variante (number) - REQUERIDO
- **stock**: Cantidad disponible en inventario (number) - Opcional (default: 0)
- **isAvailable**: Si la variante está disponible para compra (boolean) - Opcional (se calcula automáticamente basado en stock)

## Funcionamiento

1. **Detección Automática**: El sistema detecta automáticamente si un producto tiene variantes con precios específicos buscando el campo `variants` en los tags del producto.

2. **Selector Visual**: Si se encuentran variantes, se muestra un selector visual con tarjetas que muestran:
   - El valor de la variante (ej: "1kg")
   - El precio específico (ej: "S/ 23.00")
   - Estado de disponibilidad/stock

3. **Actualización de Precio**: Al seleccionar una variante, el precio principal del producto se actualiza dinámicamente.

4. **Carrito de Compras**: Las variantes seleccionadas se guardan correctamente en el carrito con:
   - Su precio específico
   - Información descriptiva de la variante
   - ID único para el tracking

## Estilos Visuales

El selector usa el tema "new-base-default" con:
- Grid responsivo que se adapta al contenido
- Efectos hover y estados de selección
- Indicadores de stock y disponibilidad
- Diseño consistente con el resto de la tienda

## Compatibilidad

- Es compatible con el selector de variantes tradicional (color, talla, etc.)
- Se muestra uno u otro según el tipo de datos disponibles
- Funciona en ambas rutas de producto: `/producto/[slug]` y `/[subdomain]/producto/[slug]`

## Ejemplo de Uso en Firestore

Al crear/editar un producto en Firestore, en el campo `metaFieldValues` (que se mapea a `tags`):

**Estructura Completa:**
```javascript
{
  name: "CANBO CACHORRO RAZA PEQUEÑA",
  price: 23, // precio base
  metaFieldValues: {
    variants: [
      {
        id: "1kg",
        name: "Peso", 
        value: "1kg",
        price: 23,
        stock: 10,
        isAvailable: true
      },
      {
        id: "7kg",
        name: "Peso",
        value: "7kg", 
        price: 128,
        stock: 5,
        isAvailable: true
      }
    ]
  }
}
```

**Estructura Simplificada (como en tu ejemplo):**
```javascript
{
  name: "CANBO CACHORRO RAZA PEQUEÑA",
  price: 23, // precio base
  metaFieldValues: {
    variants: [
      {
        id: "xl1oybfgv",
        name: "1kg",
        price: 23,
        stock: 0
      },
      {
        id: "t1qvbg4xh",
        name: "7kg",
        price: 128,
        stock: 0
      }
    ]
  }
}
```

El campo `variants` puede ser tanto un string JSON como un array directo.
