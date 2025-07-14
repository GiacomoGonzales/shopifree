import { createTheme, brandColors } from '@shopifree/ui';

/**
 * Tema personalizado para el Dashboard de Shopifree
 * Utiliza el sistema de temas centralizado con personalizaciones específicas
 */
export const dashboardTheme = createTheme({
  mode: 'light',
  colors: {
    // Colores principales del dashboard
    primary: brandColors.indigo[600], // Azul índigo para botones principales
    secondary: brandColors.blue[500], // Azul para acciones secundarias
    accent: brandColors.accent, // Amarillo para destacar elementos importantes
    
    // Estados específicos del dashboard
    success: brandColors.success,
    warning: brandColors.warning,
    error: brandColors.error
  },
  customColors: {
    // Colores específicos para el dashboard
    sidebar: {
      background: brandColors.neutral[50],
      foreground: brandColors.neutral[900],
      active: brandColors.indigo[50],
      activeForeground: brandColors.indigo[600]
    },
    header: {
      background: brandColors.neutral[900],
      foreground: brandColors.neutral[50]
    },
    card: {
      background: "#FFFFFF",
      border: brandColors.neutral[200],
      shadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)"
    }
  }
});

/**
 * Variables CSS para el dashboard
 * Se pueden usar directamente en los archivos CSS/SCSS
 */
export const dashboardCSSVariables = `
:root {
  /* Colores principales */
  --dashboard-primary: ${dashboardTheme.colors.primary};
  --dashboard-secondary: ${dashboardTheme.colors.secondary};
  --dashboard-accent: ${dashboardTheme.colors.accent};
  
  /* Estados */
  --dashboard-success: ${dashboardTheme.colors.success};
  --dashboard-warning: ${dashboardTheme.colors.warning};
  --dashboard-error: ${dashboardTheme.colors.error};
  
  /* Layout */
  --dashboard-background: ${dashboardTheme.colors.background};
  --dashboard-foreground: ${dashboardTheme.colors.foreground};
  --dashboard-border: ${dashboardTheme.colors.border};
  --dashboard-muted: ${dashboardTheme.colors.muted};
  
  /* Sidebar */
  --dashboard-sidebar-bg: ${(dashboardTheme.colors as any).sidebar.background};
  --dashboard-sidebar-fg: ${(dashboardTheme.colors as any).sidebar.foreground};
  --dashboard-sidebar-active: ${(dashboardTheme.colors as any).sidebar.active};
  --dashboard-sidebar-active-fg: ${(dashboardTheme.colors as any).sidebar.activeForeground};
  
  /* Header */
  --dashboard-header-bg: ${(dashboardTheme.colors as any).header.background};
  --dashboard-header-fg: ${(dashboardTheme.colors as any).header.foreground};
  
  /* Cards */
  --dashboard-card-bg: ${(dashboardTheme.colors as any).card.background};
  --dashboard-card-border: ${(dashboardTheme.colors as any).card.border};
  --dashboard-card-shadow: ${(dashboardTheme.colors as any).card.shadow};
}
`;

// Exportar colores individuales para uso en componentes
export const dashboardColors = dashboardTheme.colors; 