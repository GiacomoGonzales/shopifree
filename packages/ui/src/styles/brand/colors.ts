/**
 * Colores de marca centralizados para Shopifree
 * Este archivo contiene todos los colores de la marca que se usan en todas las aplicaciones
 */

export const brandColors = {
  // Colores principales de marca
  primary: "#4F46E5",
  secondary: "#06B6D4", 
  accent: "#F59E0B",
  
  // Estados
  success: "#10B981",
  warning: "#F59E0B",
  error: "#EF4444",
  
  // Paleta neutral
  neutral: {
    50: "#F9FAFB",
    100: "#F3F4F6",
    200: "#E5E7EB",
    300: "#D1D5DB",
    400: "#9CA3AF",
    500: "#6B7280",
    600: "#4B5563",
    700: "#374151",
    800: "#1F2937",
    900: "#111827"
  },
  
  // Paleta azul
  blue: {
    50: "#EFF6FF",
    500: "#3B82F6",
    600: "#2563EB",
    700: "#1D4ED8"
  },
  
  // Paleta índigo
  indigo: {
    50: "#EEF2FF",
    500: "#6366F1",
    600: "#4F46E5",
    700: "#4338CA"
  }
} as const;

// Tipos para autocompletado y validación
export type BrandColor = keyof typeof brandColors;
export type NeutralShade = keyof typeof brandColors.neutral;
export type BlueShade = keyof typeof brandColors.blue;
export type IndigoShade = keyof typeof brandColors.indigo;

// Helper para acceder a colores anidados
export const getBrandColor = (color: BrandColor, shade?: string): string => {
  const colorValue = brandColors[color];
  
  if (typeof colorValue === 'string') {
    return colorValue;
  }
  
  if (typeof colorValue === 'object' && shade && shade in colorValue) {
    return (colorValue as Record<string, string>)[shade];
  }
  
  return brandColors.primary; // Fallback
};

// Colores específicos para temas oscuros/claros
export const themeVariants = {
  light: {
    background: brandColors.neutral[50],
    foreground: brandColors.neutral[900],
    muted: brandColors.neutral[100],
    mutedForeground: brandColors.neutral[500],
    border: brandColors.neutral[200],
    input: brandColors.neutral[200],
    ring: brandColors.neutral[400]
  },
  dark: {
    background: brandColors.neutral[900],
    foreground: brandColors.neutral[50],
    muted: brandColors.neutral[800],
    mutedForeground: brandColors.neutral[400],
    border: brandColors.neutral[700],
    input: brandColors.neutral[700],
    ring: brandColors.neutral[300]
  }
} as const; 