import { createTheme, brandColors } from '@shopifree/ui';

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
  --store-product-bg: ${(storeTheme.colors as any).product.background};
  --store-product-border: ${(storeTheme.colors as any).product.border};
  --store-product-shadow: ${(storeTheme.colors as any).product.shadow};
  --store-product-hover-shadow: ${(storeTheme.colors as any).product.hoverShadow};
  
  /* Carrito */
  --store-cart-bg: ${(storeTheme.colors as any).cart.background};
  --store-cart-fg: ${(storeTheme.colors as any).cart.foreground};
  --store-cart-count: ${(storeTheme.colors as any).cart.count};
  
  /* Precios */
  --store-price-current: ${(storeTheme.colors as any).price.current};
  --store-price-original: ${(storeTheme.colors as any).price.original};
  --store-price-discount: ${(storeTheme.colors as any).price.discount};
  
  /* Ratings */
  --store-rating-filled: ${(storeTheme.colors as any).rating.filled};
  --store-rating-empty: ${(storeTheme.colors as any).rating.empty};
  
  /* Badges */
  --store-badge-new: ${(storeTheme.colors as any).badge.new};
  --store-badge-sale: ${(storeTheme.colors as any).badge.sale};
  --store-badge-featured: ${(storeTheme.colors as any).badge.featured};
  --store-badge-out-of-stock: ${(storeTheme.colors as any).badge.outOfStock};
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