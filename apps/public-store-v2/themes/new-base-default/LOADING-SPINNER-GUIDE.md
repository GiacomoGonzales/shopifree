# 🎯 Guía del Sistema de Loading Spinner Simple

## 📖 Descripción

Este sistema proporciona un spinner de carga simple y minimalista para toda la tienda pública del tema `new-base-default`. El spinner muestra únicamente el favicon con un anillo giratorio sobre fondo blanco, sin mensajes ni animaciones complejas.

## 🎨 Características

### ✨ Diseño Minimalista
- **Favicon** centralizado (32px)
- **Anillo giratorio** simple de color azul
- **Fondo blanco** limpio
- **Sin texto** ni elementos adicionales
- **Animación fluida** y suave

### 📱 Responsive
- **Tamaño único** optimizado para todas las pantallas
- **Adaptable** automáticamente a móviles y tablets

### ♿ Accesibilidad
- **Respeta** `prefers-reduced-motion`
- **Sin distracciones** visuales

## 🚀 Uso Básico

### Componente LoadingSpinner (Tema Principal)

```tsx
import LoadingSpinner from "./LoadingSpinner";

// Uso simple - solo mostrar el spinner
if (loading) {
    return <LoadingSpinner />;
}
```

### Componente SimpleLoadingSpinner (Contextos Externos)

Para contextos fuera del tema (como ThemeRenderer):

```tsx
import SimpleLoadingSpinner from "../../../components/SimpleLoadingSpinner";

// En Suspense fallbacks
<Suspense fallback={<SimpleLoadingSpinner />}>
    <Component />
</Suspense>

// En dynamic imports
const Component = dynamic(() => import('./Component'), {
    loading: () => <SimpleLoadingSpinner />
});
```

## 📐 Tamaños Disponibles

| Tamaño | Dimensiones | Uso Recomendado |
|--------|-------------|------------------|
| `small` | 60x60px | Botones, componentes inline |
| `medium` | 120x120px | Secciones, cards |
| `large` | 180x180px | Páginas principales |
| `fullscreen` | 100vw x 100vh | Carga inicial, overlay completo |

## 🎭 Propiedades

### LoadingSpinner Props

```tsx
type LoadingSpinnerProps = {
    storeInfo?: StoreBasicInfo | null;  // Info de la tienda (para logo)
    size?: 'small' | 'medium' | 'large' | 'fullscreen';
    message?: string;                   // Texto personalizado
    showLogo?: boolean;                 // Mostrar/ocultar logo
    className?: string;                 // Clases CSS adicionales
};
```

### useLoadingSpinner Options

```tsx
type UseLoadingSpinnerOptions = {
    storeInfo?: StoreBasicInfo | null;
    defaultSize?: 'small' | 'medium' | 'large' | 'fullscreen';
    defaultMessage?: string;
};
```

## 🎨 Personalización CSS

### Variables CSS Disponibles

```css
.nbd-loading-container {
    --spinner-primary: var(--nbd-neutral-900);    /* Color principal */
    --spinner-secondary: var(--nbd-neutral-300);  /* Color secundario */
    --spinner-accent: var(--nbd-primary-500);     /* Color de acento */
    --spinner-background: var(--nbd-white);       /* Fondo del logo */
    --spinner-overlay: rgba(255, 255, 255, 0.95); /* Overlay fullscreen */
}
```

### Clases de Utilidad

```css
.nbd-loading-container--centered     /* Centrado absoluto */
.nbd-loading-container--inline       /* Display inline-flex */
.nbd-loading-container--transparent  /* Fondo transparente */
.nbd-loading-container--no-backdrop  /* Sin backdrop blur */
```

## 📱 Ejemplos de Uso

### 1. Carga de Página Principal

```tsx
if (loading) {
    return (
        <LoadingSpinner 
            storeInfo={storeInfo}
            size="fullscreen"
            message="Cargando tu tienda..."
            showLogo={true}
        />
    );
}
```

### 2. Carga de Productos

```tsx
{loadingProducts && (
    <LoadingSpinner 
        storeInfo={storeInfo}
        size="large"
        message="Cargando productos..."
        className="nbd-loading-container--centered"
    />
)}
```

### 3. Botón con Carga

```tsx
<button disabled={loading}>
    {loading ? (
        <LoadingSpinner 
            size="small" 
            showLogo={false}
            className="nbd-loading-container--inline"
        />
    ) : (
        "Agregar al carrito"
    )}
</button>
```

### 4. Con Hook Personalizado

```tsx
function ProductList() {
    const { showLoading, hideLoading, LoadingComponent } = useLoadingSpinner({
        storeInfo,
        defaultMessage: "Cargando productos..."
    });

    const loadProducts = async () => {
        showLoading();
        try {
            const products = await fetchProducts();
            setProducts(products);
        } finally {
            hideLoading();
        }
    };

    return (
        <div>
            <button onClick={loadProducts}>Cargar Productos</button>
            <LoadingComponent size="large" />
        </div>
    );
}
```

## 🌙 Modo Oscuro

El spinner se adapta automáticamente al modo oscuro usando `prefers-color-scheme: dark`.

## ♿ Accesibilidad

- **Animaciones reducidas**: Respeta `prefers-reduced-motion`
- **Contraste alto**: Cumple estándares WCAG
- **Texto descriptivo**: Para lectores de pantalla

## 📁 Archivos Incluidos

```
themes/new-base-default/
├── LoadingSpinner.tsx          # Componente principal
├── loading-spinner.css         # Estilos y animaciones
├── useLoadingSpinner.tsx       # Hook personalizado
└── LOADING-SPINNER-GUIDE.md   # Esta guía

components/
└── SimpleLoadingSpinner.tsx    # Spinner para contextos externos
```

## 🔧 Migración

Para migrar spinners existentes:

1. **Reemplaza** los spinners actuales con `<LoadingSpinner />`
2. **Importa** los estilos CSS en tu tema
3. **Ajusta** el tamaño según el contexto
4. **Pasa** la información de la tienda para mostrar el logo

¡El sistema está listo para usar! 🎉
