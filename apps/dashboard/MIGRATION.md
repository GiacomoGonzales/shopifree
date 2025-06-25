# Migración: Campo `slug` → `subdomain`

## 🎯 Objetivo

Migrar todas las tiendas existentes para usar el campo `subdomain` en lugar de `slug` para mayor claridad y consistencia.

## 📋 Cambios realizados

### 1. **Interface actualizada**
```typescript
export interface StoreConfig {
  // Antes
  slug: string

  // Ahora
  subdomain: string // Campo principal
  slug?: string     // Campo legacy (opcional)
}
```

### 2. **Validaciones mejoradas**
- ✅ Solo letras minúsculas, números y guiones
- ✅ No puede empezar o terminar con guión
- ✅ No puede tener guiones consecutivos
- ✅ Lista de subdominios reservados
- ✅ Longitud: 3-50 caracteres

### 3. **Subdominios reservados**
```typescript
const reservedSubdomains = [
  'www', 'api', 'admin', 'app', 'mail', 'ftp', 'localhost', 
  'dashboard', 'support', 'help', 'blog', 'store', 'shop', 
  'cdn', 'assets', 'static'
]
```

## 🚀 Proceso de migración

### Para desarrolladores

1. **Ejecutar migración automática** (recomendado):
```typescript
import { migrateStoresToSubdomain } from './lib/migrate-stores'

// En una función async
const result = await migrateStoresToSubdomain()
console.log(result)
```

2. **Verificar duplicados**:
```typescript
import { checkSubdomainDuplicates } from './lib/migrate-stores'

const duplicates = await checkSubdomainDuplicates()
```

### Para administradores de base de datos

Si prefieres hacer la migración manualmente en Firestore:

```javascript
// Para cada documento en la colección 'stores'
// Si existe 'slug' pero no existe 'subdomain':
{
  subdomain: document.slug,
  updatedAt: new Date()
}
```

## 🔍 Compatibilidad

### Frontend público (public-store)
- ✅ Busca primero por `subdomain`
- ✅ Si no encuentra, busca por `slug` (legacy)
- ✅ Retrocompatibilidad total

### Dashboard
- ✅ Solo permite crear tiendas con `subdomain`
- ✅ Validación estricta del formato
- ✅ Verificación de disponibilidad

## ⚠️ Consideraciones importantes

1. **Backup**: Siempre hacer backup antes de ejecutar la migración
2. **Duplicados**: Verificar que no haya duplicados después de migrar
3. **DNS**: Asegurar que todos los subdominios estén configurados correctamente
4. **Testing**: Probar que tanto tiendas nuevas como migradas funcionan

## 📊 Estructura esperada después de la migración

### Documento de tienda nuevo:
```json
{
  "storeName": "Mi Tienda",
  "subdomain": "mitienda",
  "slogan": "Los mejores productos",
  "primaryColor": "#3B82F6",
  // ... otros campos
}
```

### Documento migrado:
```json
{
  "storeName": "Tienda Legacy",
  "subdomain": "tienda-legacy",  // Copiado de slug
  "slug": "tienda-legacy",       // Campo original preservado
  "slogan": "Productos vintage",
  // ... otros campos
}
```

## 🐛 Troubleshooting

### Error: "Subdomain already exists"
- Verificar duplicados con `checkSubdomainDuplicates()`
- Resolver manualmente renombrando uno de los subdominios

### Error: "Invalid subdomain format"
- Revisar que el slug original cumple con las nuevas reglas
- Limpiar caracteres especiales manualmente

### Tienda no carga en subdominio
- Verificar que el campo `subdomain` existe en Firestore
- Verificar que el DNS está configurado correctamente
- Revisar logs del public-store

## ✅ Checklist post-migración

- [ ] Todas las tiendas tienen campo `subdomain`
- [ ] No hay duplicados de `subdomain`
- [ ] Public-store puede cargar todas las tiendas
- [ ] Dashboard puede crear nuevas tiendas
- [ ] Validaciones funcionan correctamente
- [ ] DNS configurado para nuevos subdominios 