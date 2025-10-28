# Diagnóstico: Imágenes no visibles en móvil

## Problema
- Productos nuevos: imágenes NO se ven en móvil
- Productos antiguos: imágenes SÍ se ven en móvil
- En PC: todas las imágenes se ven correctamente

## Pasos para diagnosticar

### 1. Verificar la URL de la imagen en Firestore
Abre Firestore Console y verifica un producto nuevo:
```
stores/{storeId}/products/{productId}
```

Revisa el campo `image` o `mediaFiles[0].url` y anota:
- ¿Es HTTP o HTTPS? (debe ser HTTPS)
- ¿Tiene transformaciones de Cloudinary? (debe tener `/upload/c_fill,w_...`)
- ¿Qué tan larga es la URL?

### 2. Probar la URL directamente en el móvil
Copia la URL de la imagen desde Firestore y ábrela directamente en el navegador móvil:
- Si se ve: el problema está en el código de la tienda
- Si NO se ve: el problema está en Cloudinary o la URL

### 3. Probar sin transformaciones de Cloudinary
Si la URL tiene transformaciones como:
```
https://res.cloudinary.com/.../upload/c_fill,g_auto,f_auto,q_auto:good,w_800,h_800.../imagen.jpg
```

Prueba la URL SIN transformaciones (elimina la parte entre `/upload/` y el nombre del archivo):
```
https://res.cloudinary.com/.../upload/imagen.jpg
```

### 4. Limpiar caché del navegador móvil
En el navegador móvil:
- Chrome: Menú → Configuración → Privacidad → Borrar datos de navegación
- Safari: Ajustes → Safari → Borrar historial y datos

### 5. Comparar URL antigua vs nueva
Compara la URL de un producto que SÍ funciona vs uno que NO funciona:
```
PRODUCTO ANTIGUO (funciona):
image: "https://res.cloudinary.com/..."

PRODUCTO NUEVO (no funciona):
image: "https://res.cloudinary.com/..."
```

¿Hay diferencias en el formato o estructura?

### 6. Verificar errores en la consola del navegador móvil
En Chrome móvil:
1. Conecta el móvil al PC vía USB
2. En Chrome PC: chrome://inspect
3. Inspecciona la página móvil
4. Ve a la pestaña Console
5. ¿Hay errores relacionados con las imágenes?

### 7. Verificar si es un problema de CORS
En la consola del navegador móvil, busca errores como:
```
Access to fetch at 'https://res.cloudinary.com/...' from origin '...' has been blocked by CORS policy
```

## Soluciones rápidas

### Solución 1: Forzar recarga sin caché
En el móvil, mantén presionado el botón de recargar y selecciona "Recarga forzada"

### Solución 2: Desactivar temporalmente las transformaciones
Si quieres probar sin transformaciones de Cloudinary, puedo modificar temporalmente el código.

### Solución 3: Revertir al commit anterior
Si quieres volver al estado anterior a la limpieza de logs:
```bash
git revert 0195d23
```

## Información adicional necesaria

Para ayudarte mejor, necesito que me proporciones:
1. Una URL completa de una imagen que NO funciona en móvil
2. Una URL completa de una imagen que SÍ funciona en móvil
3. ¿Qué navegador móvil estás usando? (Chrome, Safari, Firefox, etc.)
4. ¿Es Android o iOS?
5. Captura de pantalla de la consola del navegador móvil mostrando errores (si los hay)
