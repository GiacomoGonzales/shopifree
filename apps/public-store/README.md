# Public Store - Shopifree

Frontend público de las tiendas en Shopifree. Cada tienda se accede desde su subdominio correspondiente.

## 🚀 Funcionalidades

- **Detección automática de subdominio**: Detecta automáticamente el subdominio de la URL
- **Búsqueda en Firestore**: Busca la tienda correspondiente en la base de datos
- **Renderizado dinámico**: Aplica colores, logo y información de la tienda
- **Responsive**: Diseño que se adapta a móvil y desktop
- **WhatsApp Integration**: Enlaces directos a WhatsApp para contacto

## 🏗️ Estructura

```
apps/public-store/
├── app/
│   ├── page.tsx          # Página principal que detecta subdominios
│   ├── layout.tsx        # Layout base
│   ├── loading.tsx       # Página de carga
│   ├── error.tsx         # Página de error
│   └── globals.css       # Estilos globales
├── lib/
│   ├── firebase.ts       # Configuración de Firebase
│   └── store.ts          # Funciones para buscar tiendas
└── next.config.js        # Configuración de Next.js
```

## 🔧 Cómo funciona

1. **Detección de subdominio**: 
   - Extrae el subdominio de `headers().get('host')`
   - Ej: `mitienda.shopifree.app` → `mitienda`

2. **Búsqueda en Firestore**:
   - Consulta la colección `stores` donde `slug === subdomain`
   - Obtiene toda la información de la tienda

3. **Renderizado**:
   - Si encuentra la tienda: Renderiza la página con colores y datos personalizados
   - Si no la encuentra: Muestra mensaje de "Tienda no encontrada"

## 🧪 Para probar en desarrollo

1. **Con localhost**:
   - La función `extractSubdomain` retorna `'demo'` para localhost
   - Asegúrate de tener una tienda con `slug: 'demo'` en Firestore

2. **Con subdominios reales**:
   - Configura tu `/etc/hosts` (Linux/Mac) o `C:\Windows\System32\drivers\etc\hosts` (Windows):
   ```
   127.0.0.1 mitienda.localhost
   127.0.0.1 demo.localhost
   ```
   - Luego accede a `http://mitienda.localhost:3000`

## 📋 Variables de entorno requeridas

```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
```

## 🎨 Personalización

Cada tienda puede personalizar:
- **Colores**: `primaryColor` y `secondaryColor`
- **Logo**: `logoUrl` (soporta URLs externas)
- **Información**: Nombre, slogan, descripción, dirección, teléfono
- **Moneda**: Moneda de la tienda

## 🚀 Próximas funcionalidades

- [ ] Catálogo de productos
- [ ] Carrito de compras
- [ ] Proceso de checkout
- [ ] Múltiples métodos de pago
- [ ] SEO optimizado por tienda
- [ ] Analytics por tienda 