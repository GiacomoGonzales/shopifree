# 🎨 @shopifree/ui

Sistema de diseño centralizado y tipado para Shopifree.

## 📦 **Instalación**

```bash
# Desde el workspace raíz
npm install

# O específicamente este paquete
npm install @shopifree/ui
```

## 🚀 **Uso Rápido**

```typescript
import { brandColors, createTheme, dashboardTheme } from '@shopifree/ui';

// Usar colores de marca
const primary = brandColors.primary; // "#4F46E5"

// Crear tema personalizado
const myTheme = createTheme({
  colors: {
    primary: "#FF6B6B"
  }
});
```

## 🎨 **Sistema de Colores**

### **Colores Principales**
```typescript
brandColors.primary      // "#4F46E5" - Azul índigo
brandColors.secondary    // "#06B6D4" - Cian
brandColors.accent       // "#F59E0B" - Amarillo
```

### **Estados**
```typescript
brandColors.success      // "#10B981" - Verde
brandColors.warning      // "#F59E0B" - Amarillo
brandColors.error        // "#EF4444" - Rojo
```

### **Paletas Extendidas**
```typescript
brandColors.neutral[50]  // "#F9FAFB" - Gris muy claro
brandColors.neutral[500] // "#6B7280" - Gris medio
brandColors.neutral[900] // "#111827" - Gris muy oscuro

brandColors.blue[500]    // "#3B82F6" - Azul
brandColors.indigo[600]  // "#4F46E5" - Índigo
```

## 🔧 **Sistema de Temas**

### **Crear Tema Personalizado**
```typescript
import { createTheme } from '@shopifree/ui';

const customTheme = createTheme({
  mode: 'light', // 'light' | 'dark'
  colors: {
    primary: "#FF6B6B",
    secondary: "#4ECDC4"
  },
  customColors: {
    sidebar: {
      background: "#F8F9FA",
      active: "#E3F2FD"
    }
  }
});
```

### **Temas Predefinidos**
```typescript
import { 
  defaultDashboardTheme, 
  defaultStoreTheme 
} from '@shopifree/ui';

// Tema optimizado para dashboard administrativo
const dashboardTheme = defaultDashboardTheme;

// Tema optimizado para tienda pública
const storeTheme = defaultStoreTheme;
```

### **Generar CSS Variables**
```typescript
import { themeToCSS } from '@shopifree/ui';

const cssVariables = themeToCSS(customTheme);
// Resultado: ":root { --primary: 255 107 107; ... }"

// Inyectar en el DOM
const style = document.createElement('style');
style.textContent = cssVariables;
document.head.appendChild(style);
```

## 🛠️ **Helpers**

### **Obtener Colores**
```typescript
import { getBrandColor, getThemeColor } from '@shopifree/ui';

// De la paleta de marca
const primary = getBrandColor('primary');
const gray = getBrandColor('neutral', '500');

// De un tema específico
const themeColor = getThemeColor(myTheme, 'primary');
const nestedColor = getThemeColor(myTheme, 'sidebar.background');
```

### **Validación de Tipos**
```typescript
import type { BrandColor, NeutralShade } from '@shopifree/ui';

// TypeScript validará automáticamente
function setColor(color: BrandColor) {
  // Solo acepta: 'primary', 'secondary', 'accent', etc.
}

function setShade(shade: NeutralShade) {
  // Solo acepta: '50', '100', '200', ..., '900'
}
```

## 🌈 **Integración con CSS**

### **Variables CSS Directas**
```css
/* Usar en CSS tradicional */
.my-component {
  background-color: rgb(var(--primary));
  color: rgb(var(--foreground));
  border: 1px solid rgb(var(--border));
}
```

### **Con Tailwind CSS**
```javascript
// tailwind.config.js
const { brandColors } = require('@shopifree/ui');

module.exports = {
  theme: {
    extend: {
      colors: {
        primary: brandColors.primary,
        secondary: brandColors.secondary,
        neutral: brandColors.neutral,
        // ... más colores
      }
    }
  }
}
```

## 📱 **Componentes React**

### **Usando Colores en Componentes**
```typescript
import { brandColors } from '@shopifree/ui';

export function Button({ variant = 'primary' }) {
  const styles = {
    backgroundColor: variant === 'primary' 
      ? brandColors.primary 
      : brandColors.secondary,
    color: '#FFFFFF',
    padding: '8px 16px',
    borderRadius: '6px',
    border: 'none'
  };

  return <button style={styles}>Click me</button>;
}
```

### **Con Theme Provider** (Próximamente)
```typescript
import { ThemeProvider } from '@shopifree/ui';

function App() {
  return (
    <ThemeProvider theme={customTheme}>
      <MyComponent />
    </ThemeProvider>
  );
}
```

## 🎯 **Casos de Uso**

### **Dashboard Administrativo**
```typescript
import { defaultDashboardTheme, getThemeColor } from '@shopifree/ui';

const theme = defaultDashboardTheme;
const sidebarBg = getThemeColor(theme, 'sidebar.background');
const headerBg = getThemeColor(theme, 'header.background');
```

### **Tienda Personalizada**
```typescript
import { createCustomStoreTheme } from '@shopifree/ui';

// Para una tienda de mascotas
const petStoreTheme = createCustomStoreTheme({
  primaryColor: "#8B5A3C",    // Marrón
  secondaryColor: "#D4AF37",  // Dorado
  accentColor: "#228B22"      // Verde
});
```

### **Modo Oscuro**
```typescript
const darkTheme = createTheme({
  mode: 'dark',
  colors: {
    primary: brandColors.blue[400],
    secondary: brandColors.indigo[400]
  }
});
```

## 🔍 **API Reference**

### **Tipos**
```typescript
// Colores disponibles
type BrandColor = 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
type NeutralShade = '50' | '100' | '200' | '300' | '400' | '500' | '600' | '700' | '800' | '900';
type BlueShade = '50' | '500' | '600' | '700';
type IndigoShade = '50' | '500' | '600' | '700';

// Configuración de tema
interface ThemeOptions {
  colors?: Partial<{
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
  }>;
  mode?: 'light' | 'dark';
  customColors?: Record<string, string | Record<string, string>>;
}
```

### **Funciones**
```typescript
// Crear tema
function createTheme(options?: ThemeOptions): Theme;

// Obtener colores
function getBrandColor(color: BrandColor, shade?: string): string;
function getThemeColor(theme: Theme, colorPath: string): string;

// Generar CSS
function themeToCSS(theme: Theme): string;
```

## 🏗️ **Estructura Interna**

```
packages/ui/src/
├── components/          # Componentes UI básicos
│   ├── Button.tsx
│   ├── Card.tsx
│   └── Input.tsx
├── styles/             # Sistema de temas
│   ├── brand/
│   │   └── colors.ts   # Colores de marca
│   └── createTheme.ts  # Generador de temas
└── index.ts           # Exports principales
```

## 🚀 **Roadmap**

### **v1.1 (Próximamente)**
- [ ] Theme Provider para React
- [ ] Componente ColorPicker
- [ ] Generador de paletas automático
- [ ] Soporte para gradientes

### **v1.2 (Futuro)**
- [ ] Animaciones y transiciones
- [ ] Tokens de espaciado
- [ ] Sistema de tipografía
- [ ] Modo de alto contraste

## 📚 **Ejemplos Avanzados**

### **Tema Dinámico basado en Usuario**
```typescript
function createUserTheme(userPreferences: UserTheme) {
  return createTheme({
    colors: {
      primary: userPreferences.brandColor,
      secondary: adjustLightness(userPreferences.brandColor, 20)
    },
    mode: userPreferences.darkMode ? 'dark' : 'light'
  });
}
```

### **Tema Estacional**
```typescript
const seasons = {
  spring: createTheme({ colors: { primary: "#98D982", accent: "#F8BBD9" }}),
  summer: createTheme({ colors: { primary: "#FFD700", accent: "#FF6B6B" }}),
  autumn: createTheme({ colors: { primary: "#CD853F", accent: "#FF8C00" }}),
  winter: createTheme({ colors: { primary: "#4682B4", accent: "#B0C4DE" }})
};
```

---

## 🤝 **Contribuir**

1. Fork el repositorio
2. Crea una rama para tu feature: `git checkout -b feature/nueva-funcionalidad`
3. Commit tus cambios: `git commit -m 'Agregar nueva funcionalidad'`
4. Push a la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un Pull Request

## 📄 **Licencia**

MIT © Shopifree

---

## 🆘 **Soporte**

- 📧 Email: support@shopifree.com
- 💬 Discord: [Shopifree Community](https://discord.gg/shopifree)
- 📖 Docs: [docs.shopifree.com](https://docs.shopifree.com)
- 🐛 Issues: [GitHub Issues](https://github.com/shopifree/shopifree/issues) 