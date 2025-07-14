import { brandColors, themeVariants } from './brand/colors';

/**
 * Opciones para personalizar un tema
 */
export interface ThemeOptions {
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
    success?: string;
    warning?: string;
    error?: string;
  };
  mode?: 'light' | 'dark';
  customColors?: Record<string, string | Record<string, string>>;
}

/**
 * Estructura completa de un tema
 */
export interface Theme {
  colors: {
    // Colores principales
    primary: string;
    secondary: string;
    accent: string;
    
    // Estados
    success: string;
    warning: string;
    error: string;
    
    // Tema base
    background: string;
    foreground: string;
    muted: string;
    mutedForeground: string;
    border: string;
    input: string;
    ring: string;
    
    // Paletas completas
    neutral: typeof brandColors.neutral;
    blue: typeof brandColors.blue;
    indigo: typeof brandColors.indigo;
    
    // Colores personalizados
    [key: string]: string | Record<string, string>;
  };
  mode: 'light' | 'dark';
}

/**
 * Crea un tema personalizado basado en los colores de marca
 * @param options - Opciones de personalización del tema
 * @returns Tema completo configurado
 */
export function createTheme(options: ThemeOptions = {}): Theme {
  const {
    colors = {},
    mode = 'light',
    customColors = {}
  } = options;

  const baseVariant = themeVariants[mode];

  return {
    colors: {
      // Colores principales (con posibles overrides)
      primary: colors.primary ?? brandColors.primary,
      secondary: colors.secondary ?? brandColors.secondary,
      accent: colors.accent ?? brandColors.accent,
      
      // Estados
      success: colors.success ?? brandColors.success,
      warning: colors.warning ?? brandColors.warning,
      error: colors.error ?? brandColors.error,
      
      // Colores del tema base
      background: baseVariant.background,
      foreground: baseVariant.foreground,
      muted: baseVariant.muted,
      mutedForeground: baseVariant.mutedForeground,
      border: baseVariant.border,
      input: baseVariant.input,
      ring: baseVariant.ring,
      
      // Paletas completas
      neutral: brandColors.neutral,
      blue: brandColors.blue,
      indigo: brandColors.indigo,
      
      // Colores personalizados
      ...customColors
    },
    mode
  };
}

/**
 * Tema por defecto para el dashboard
 */
export const defaultDashboardTheme = createTheme({
  mode: 'light',
  colors: {
    primary: brandColors.indigo[600],
    secondary: brandColors.blue[500]
  }
});

/**
 * Tema por defecto para la tienda pública
 */
export const defaultStoreTheme = createTheme({
  mode: 'light',
  colors: {
    primary: brandColors.primary,
    secondary: brandColors.secondary
  }
});

/**
 * Convierte un tema a variables CSS
 * @param theme - Tema a convertir
 * @returns String con variables CSS
 */
export function themeToCSS(theme: Theme): string {
  const cssVars: string[] = [];
  
  function addVariable(name: string, value: string | Record<string, string>) {
    if (typeof value === 'string') {
      // Convertir hex a valores RGB para usar con hsl()
      const hex = value.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      cssVars.push(`  --${name}: ${r} ${g} ${b};`);
    } else if (typeof value === 'object') {
      Object.entries(value).forEach(([shade, color]) => {
        addVariable(`${name}-${shade}`, color);
      });
    }
  }
  
  Object.entries(theme.colors).forEach(([key, value]) => {
    addVariable(key, value);
  });
  
  return `:root {\n${cssVars.join('\n')}\n}`;
}

/**
 * Helper para usar colores del tema en componentes
 * @param theme - Tema actual
 * @param colorPath - Ruta del color (ej: 'primary', 'neutral.500')
 * @returns Color en formato hex
 */
export function getThemeColor(theme: Theme, colorPath: string): string {
  const parts = colorPath.split('.');
  let current: any = theme.colors;
  
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      return theme.colors.primary; // Fallback
    }
  }
  
  return typeof current === 'string' ? current : theme.colors.primary;
} 