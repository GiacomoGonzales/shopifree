/** @type {import('tailwindcss').Config} */

// Importar sistema de colores centralizado
let brandColors;
try {
  // Intentar importar desde el paquete compilado
  const { brandColors: importedColors } = require('@shopifree/ui');
  brandColors = importedColors;
} catch (error) {
  // Fallback a colores hardcodeados si hay problemas de importación
  console.warn('⚠️  Usando colores hardcodeados como fallback en dashboard/tailwind.config.js');
  brandColors = {
    primary: "#4F46E5",
    secondary: "#06B6D4", 
    accent: "#F59E0B",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
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
    blue: {
      50: "#EFF6FF",
      500: "#3B82F6",
      600: "#2563EB",
      700: "#1D4ED8"
    },
    indigo: {
      50: "#EEF2FF",
      500: "#6366F1",
      600: "#4F46E5",
      700: "#4338CA"
    }
  };
}

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '475px',
      },
      colors: {
        // Colores de marca centralizados
        'brand-primary': brandColors.primary,
        'brand-secondary': brandColors.secondary,
        'brand-accent': brandColors.accent,
        'brand-success': brandColors.success,
        'brand-warning': brandColors.warning,
        'brand-error': brandColors.error,
        
        // Paleta neutral
        'brand-neutral': brandColors.neutral,
        
        // Colores adicionales
        'brand-blue': brandColors.blue,
        'brand-indigo': brandColors.indigo,
        
        // Alias para componentes existentes
        primary: {
          50: brandColors.indigo[50],
          500: brandColors.primary,
          600: brandColors.indigo[600],
          700: brandColors.indigo[700],
        },
        
        // Variables CSS para compatibilidad con el sistema existente
        border: "rgb(var(--dashboard-border))",
        input: "rgb(var(--dashboard-input))",
        ring: "rgb(var(--dashboard-ring))",
        background: "rgb(var(--dashboard-background))",
        foreground: "rgb(var(--dashboard-foreground))",
        
        // Variables dashboard específicas
        'dashboard-primary': {
          DEFAULT: "rgb(var(--dashboard-primary))",
          foreground: "rgb(var(--dashboard-primary-foreground, 255 255 255))",
        },
        'dashboard-secondary': {
          DEFAULT: "rgb(var(--dashboard-secondary))",
          foreground: "rgb(var(--dashboard-secondary-foreground, 255 255 255))",
        },
        'dashboard-muted': {
          DEFAULT: "rgb(var(--dashboard-muted))",
          foreground: "rgb(var(--dashboard-muted-foreground))",
        },
        'dashboard-accent': {
          DEFAULT: "rgb(var(--dashboard-accent))",
          foreground: "rgb(var(--dashboard-accent-foreground, 255 255 255))",
        },
        'dashboard-destructive': {
          DEFAULT: "rgb(var(--dashboard-error))",
          foreground: "rgb(var(--dashboard-error-foreground, 255 255 255))",
        },
        'dashboard-border': "rgb(var(--dashboard-border))",
        'dashboard-input': "rgb(var(--dashboard-input))",
        'dashboard-ring': "rgb(var(--dashboard-ring))",
        'dashboard-card': {
          DEFAULT: "rgb(var(--dashboard-card-bg))",
          foreground: "rgb(var(--dashboard-foreground))",
        },
        'dashboard-popover': {
          DEFAULT: "rgb(var(--dashboard-card-bg))",
          foreground: "rgb(var(--dashboard-foreground))",
        },
      },
      
      borderRadius: {
        'dashboard': 'var(--dashboard-radius)',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      boxShadow: {
        'dashboard-sm': 'var(--dashboard-card-shadow)',
        'dashboard': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'dashboard-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      
      animation: {
        'dashboard-fade-in': 'dashboardFadeIn 0.3s ease-in-out',
        'dashboard-slide-up': 'dashboardSlideUp 0.4s ease-out',
        'dashboard-slide-down': 'dashboardSlideDown 0.3s ease-out',
      },
      
      keyframes: {
        dashboardFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        dashboardSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        dashboardSlideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} 