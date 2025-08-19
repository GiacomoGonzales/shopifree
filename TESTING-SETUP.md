# 🧪 Configuración para Testing Local

## 1. Variables de Entorno

Asegúrate de tener en tu `.env.local`:

```bash
# Firebase Config
NEXT_PUBLIC_FIREBASE_PROJECT_ID=tu-project-id
NEXT_PUBLIC_FIREBASE_API_KEY=tu-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=tu-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=tu-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Firebase Admin (para scripts)
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxx@tu-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\ntu-private-key\n-----END PRIVATE KEY-----\n"

# App URL (opcional)
NEXT_PUBLIC_APP_URL=http://localhost:3004
```

## 2. Setup de Tienda de Prueba

### Opción A: Script Automático
```bash
# Listar tiendas disponibles
node scripts/setup-test-store.js --list

# Configurar tienda específica
node scripts/setup-test-store.js [storeId] es
```

### Opción B: Manual en Firestore Console
1. Ve a Firebase Console → Firestore
2. Navega a `stores/{storeId}`
3. Añade/edita campos:
   ```json
   {
     "advanced": {
       "singleLocaleUrls": true,
       "language": "es"
     }
   }
   ```

## 3. Ejecutar la App

```bash
cd apps/public-store-v2
npm run dev
```

## 4. URLs para Probar

Asumiendo que tu tienda tiene `subdomain: "mitienda"`:

### 🏠 Home Page
- **Nueva URL**: `http://mitienda.localhost:3004/`
- **Debe responder**: 200 OK
- **Verificar**: HTML lang correcto, canonical sin prefijo

### 🔄 Redirects de Compatibilidad
- **URL antigua**: `http://mitienda.localhost:3004/es`
- **Debe redirigir**: 301 → `http://mitienda.localhost:3004/`

### 📄 Páginas Internas
- **Productos**: `http://mitienda.localhost:3004/producto/[slug]`
- **Categorías**: `http://mitienda.localhost:3004/categoria/[slug]`
- **Catálogo**: `http://mitienda.localhost:3004/catalogo`

### 🗺️ SEO y Sitemaps
- **Sitemap**: `http://mitienda.localhost:3004/sitemap.xml`
  - Debe contener URLs sin `/es/` o `/en/`
- **Robots**: `http://mitienda.localhost:3004/robots.txt`
  - Debe apuntar al sitemap correcto

## 5. Script de Validación Automática

Usa el script que creamos para validar todo:

```bash
# Validar tienda completa
./scripts/check-single-locale.sh http://mitienda.localhost:3004

# O con custom domain si tienes uno configurado
./scripts/check-single-locale.sh http://tu-dominio-personalizado.com
```

## 6. Debugging

### Ver logs del middleware
Los logs aparecerán en la consola de Next.js con prefijos:
- `🎯 [Single Locale]` - Procesando tienda con feature flag
- `🔄 [301 Redirect]` - Redirects de compatibilidad
- `🔄 [Rewrite]` - Rewrites internos
- `📚 [Legacy Mode]` - Tiendas sin feature flag

### Verificar metadata en DevTools
1. Abre DevTools → Elements
2. Busca en `<head>`:
   ```html
   <html lang="es">
   <link rel="canonical" href="http://mitienda.localhost:3004/">
   <meta name="google-site-verification" content="...">
   ```

### Verificar Network Tab
1. DevTools → Network
2. Navegar a URLs con `/es/`
3. Verificar que responden con 301 y Location header correcto

## 7. Rollback/Testing Legacy

Para probar que el rollback funciona:

```bash
# Desactivar feature flag
node scripts/setup-test-store.js [storeId] es --disable

# O manualmente en Firestore:
# advanced.singleLocaleUrls: false
```

Luego verificar que vuelve al comportamiento anterior con URLs `/es/`.
