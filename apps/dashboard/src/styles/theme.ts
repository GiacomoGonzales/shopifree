import { createTheme, brandColors, Theme } from '@shopifree/ui';

/**
 * Interfaz extendida para el tema del dashboard con colores personalizados
 */
interface DashboardTheme extends Theme {
  colors: Theme['colors'] & {
    sidebar: {
      background: string;
      foreground: string;
      active: string;
      activeForeground: string;
    };
    header: {
      background: string;
      foreground: string;
    };
    card: {
      background: string;
      border: string;
      shadow: string;
    };
  };
}

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
  --dashboard-sidebar-bg: ${(dashboardTheme as DashboardTheme).colors.sidebar.background};
  --dashboard-sidebar-fg: ${(dashboardTheme as DashboardTheme).colors.sidebar.foreground};
  --dashboard-sidebar-active: ${(dashboardTheme as DashboardTheme).colors.sidebar.active};
  --dashboard-sidebar-active-fg: ${(dashboardTheme as DashboardTheme).colors.sidebar.activeForeground};
  
  /* Header */
  --dashboard-header-bg: ${(dashboardTheme as DashboardTheme).colors.header.background};
  --dashboard-header-fg: ${(dashboardTheme as DashboardTheme).colors.header.foreground};
  
  /* Cards */
  --dashboard-card-bg: ${(dashboardTheme as DashboardTheme).colors.card.background};
  --dashboard-card-border: ${(dashboardTheme as DashboardTheme).colors.card.border};
  --dashboard-card-shadow: ${(dashboardTheme as DashboardTheme).colors.card.shadow};
}
`;

// Exportar colores individuales para uso en componentes
export const dashboardColors = dashboardTheme.colors; 