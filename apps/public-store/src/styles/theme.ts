import { createTheme, brandColors, Theme } from '@shopifree/ui';

/**
 * Interfaz extendida para el tema de la tienda con colores personalizados
 */
interface StoreTheme extends Theme {
  colors: Theme['colors'] & {
    product: {
      background: string;
      border: string;
      shadow: string;
      hoverShadow: string;
    };
    cart: {
      background: string;
      foreground: string;
      count: string;
    };
    price: {
      current: string;
      original: string;
      discount: string;
    };
    rating: {
      filled: string;
      empty: string;
    };
    badge: {
      new: string;
      sale: string;
      featured: string;
      outOfStock: string;
    };
  };
}

/**
 * Tema personalizado para la Tienda Pública de Shopifree
 * Optimizado para la experiencia del cliente final
 */
export const storeTheme = createTheme({
  mode: 'light',
  colors: {
    // Colores principales para la tienda
    primary: brandColors.primary, // Azul índigo principal
    secondary: brandColors.secondary, // Cian para elementos secundarios
    accent: brandColors.accent, // Amarillo para ofertas y destacados
    
    // Estados para feedback al usuario
    success: brandColors.success, // Verde para confirmaciones
    warning: brandColors.warning, // Amarillo para advertencias
    error: brandColors.error // Rojo para errores
  },
  customColors: {
    // Colores específicos para e-commerce
    product: {
      background: "#FFFFFF",
      border: brandColors.neutral[200],
      shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      hoverShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
    },
    cart: {
      background: brandColors.success,
      foreground: "#FFFFFF",
      count: brandColors.error // Contador de items en rojo
    },
    price: {
      current: brandColors.neutral[900], // Precio actual en negro
      original: brandColors.neutral[500], // Precio original tachado
      discount: brandColors.error // Precio con descuento en rojo
    },
    rating: {
      filled: brandColors.accent, // Estrellas llenas en amarillo
      empty: brandColors.neutral[300] // Estrellas vacías en gris
    },
    badge: {
      new: brandColors.success,
      sale: brandColors.error,
      featured: brandColors.accent,
      outOfStock: brandColors.neutral[400]
    }
  }
});

/**
 * Variables CSS para la tienda pública
 * Estas variables se pueden usar en los temas de la tienda
 */
export const storeCSSVariables = `
:root {
  /* Colores principales */
  --store-primary: ${storeTheme.colors.primary};
  --store-secondary: ${storeTheme.colors.secondary};
  --store-accent: ${storeTheme.colors.accent};
  
  /* Estados */
  --store-success: ${storeTheme.colors.success};
  --store-warning: ${storeTheme.colors.warning};
  --store-error: ${storeTheme.colors.error};
  
  /* Layout base */
  --store-background: ${storeTheme.colors.background};
  --store-foreground: ${storeTheme.colors.foreground};
  --store-border: ${storeTheme.colors.border};
  --store-muted: ${storeTheme.colors.muted};
  
  /* Productos */
  --store-product-bg: ${(storeTheme as StoreTheme).colors.product.background};
  --store-product-border: ${(storeTheme as StoreTheme).colors.product.border};
  --store-product-shadow: ${(storeTheme as StoreTheme).colors.product.shadow};
  --store-product-hover-shadow: ${(storeTheme as StoreTheme).colors.product.hoverShadow};
  
  /* Carrito */
  --store-cart-bg: ${(storeTheme as StoreTheme).colors.cart.background};
  --store-cart-fg: ${(storeTheme as StoreTheme).colors.cart.foreground};
  --store-cart-count: ${(storeTheme as StoreTheme).colors.cart.count};
  
  /* Precios */
  --store-price-current: ${(storeTheme as StoreTheme).colors.price.current};
  --store-price-original: ${(storeTheme as StoreTheme).colors.price.original};
  --store-price-discount: ${(storeTheme as StoreTheme).colors.price.discount};
  
  /* Ratings */
  --store-rating-filled: ${(storeTheme as StoreTheme).colors.rating.filled};
  --store-rating-empty: ${(storeTheme as StoreTheme).colors.rating.empty};
  
  /* Badges */
  --store-badge-new: ${(storeTheme as StoreTheme).colors.badge.new};
  --store-badge-sale: ${(storeTheme as StoreTheme).colors.badge.sale};
  --store-badge-featured: ${(storeTheme as StoreTheme).colors.badge.featured};
  --store-badge-out-of-stock: ${(storeTheme as StoreTheme).colors.badge.outOfStock};
}
`;

/**
 * Función para crear temas personalizados de tienda
 * Permite a los usuarios personalizar los colores de su tienda
 */
export function createCustomStoreTheme(customizations: {
  primaryColor?: string;
  secondaryColor?: string;
  accentColor?: string;
}) {
  return createTheme({
    mode: 'light',
    colors: {
      primary: customizations.primaryColor || storeTheme.colors.primary,
      secondary: customizations.secondaryColor || storeTheme.colors.secondary,
      accent: customizations.accentColor || storeTheme.colors.accent,
      success: brandColors.success,
      warning: brandColors.warning,
      error: brandColors.error
    },
    customColors: storeTheme.colors // Heredar colores personalizados
  });
}

// Exportar colores para uso directo en componentes
export const storeColors = storeTheme.colors; 