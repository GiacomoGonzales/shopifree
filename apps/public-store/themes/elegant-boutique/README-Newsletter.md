# Sistema de Newsletter - Elegant Boutique

Sistema completo de suscripción a newsletter integrado con Firestore para el tema elegant-boutique.

## 🗂️ Estructura en Firestore

```
stores/{storeId}/newsletter/{autoId}
```

### Campos de cada suscripción:
```typescript
{
  id: string              // Auto-generado por Firestore
  email: string           // Email normalizado (lowercase, trimmed)
  storeId: string         // ID de la tienda
  subscribedAt: timestamp // Fecha de suscripción
  status: 'active' | 'unsubscribed'  // Estado de la suscripción
  source: 'footer' | 'home' | 'popup' | 'checkout' | 'account'  // Origen
  ipAddress?: string      // IP del usuario (opcional)
  userAgent?: string      // User Agent del navegador (opcional)
}
```

## 🧩 Componentes

### `NewsletterForm`
Componente reutilizable con tres variantes:

- **`default`**: Para footers y secciones estándar
- **`compact`**: Para espacios reducidos
- **`hero`**: Para secciones principales con más impacto

### Uso:
```tsx
<NewsletterForm 
  storeId={tienda.id} 
  source="footer"     // 'footer' | 'home' | 'popup' | 'checkout' | 'account'
  variant="default"   // 'default' | 'compact' | 'hero'
/>
```

## 🔧 Funcionalidades

### ✅ Validación
- **Email válido**: Regex pattern completo
- **Duplicados**: Previene suscripciones duplicadas
- **Estado de carga**: UI reactiva durante el proceso

### 🎯 Integración Automática
- **Footer principal**: Variant `compact`
- **Página de inicio**: Variant `hero` en sección newsletter
- **Footer expandido**: Variant `default`

### 📱 UX/UI Elegante
- **Estados visuales**: Loading, success, error
- **Auto-limpieza**: Mensajes se ocultan después de 5 segundos
- **Responsive**: Adaptable a todos los tamaños
- **Accesibilidad**: Form submission con Enter key

### 🔒 Seguridad
- **Sanitización**: Email normalizado antes de guardar
- **Validación**: Cliente y servidor
- **Rate limiting**: Prevención de spam por design

## 📊 Tracking

### Fuentes de Suscripción:
- `footer`: Footer principal
- `home`: Sección hero de la página principal  
- `popup`: Modal de newsletter (futuro)
- `checkout`: Durante el proceso de compra (futuro)
- `account`: Desde la cuenta del usuario (futuro)

### Datos Opcionales:
- **IP Address**: Para análisis geográfico
- **User Agent**: Para análisis de dispositivos

## 🚀 API

### `subscribeToNewsletter(storeId, email, source)`
```typescript
const result = await subscribeToNewsletter(
  'store123',
  'user@example.com',
  'footer'
)

// Resultado:
{
  success: boolean
  message: string
  alreadySubscribed?: boolean
}
```

### Hook `useNewsletter(storeId)`
```typescript
const {
  email,           // Estado del email
  setEmail,        // Setter del email
  isSubmitting,    // Estado de carga
  result,          // Resultado de la operación
  subscribe,       // Función para suscribir
  reset           // Función para limpiar estado
} = useNewsletter(storeId)
```

## 📈 Analytics Futuras

El sistema está preparado para:
- **Tasas de conversión** por fuente
- **Análisis geográfico** por IP
- **Segmentación** por dispositivo
- **A/B Testing** de formularios
- **Email marketing** integration

## 🎨 Estilos

Integración completa con el sistema de diseño:
- Variables CSS del tema
- Botones y inputs consistentes
- Animaciones elegantes
- Estados hover y focus

Los estilos específicos están en `styles.css` bajo la sección `/* === NEWSLETTER ESPECÍFICO === */`. 