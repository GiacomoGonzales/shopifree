/** @type {import('tailwindcss').Config} */

// Importar sistema de colores centralizado
let brandColors;
try {
  // Intentar importar desde el paquete compilado
  const { brandColors: importedColors } = require('@shopifree/ui');
  brandColors = importedColors;
} catch (error) {
  // Fallback a colores hardcodeados si hay problemas de importación
  console.warn('⚠️  Usando colores hardcodeados como fallback en admin/tailwind.config.js');
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
        
        // Variables específicas para admin
        'admin-primary': {
          DEFAULT: "rgb(var(--admin-primary))",
          foreground: "rgb(var(--admin-primary-foreground, 255 255 255))",
        },
        'admin-secondary': {
          DEFAULT: "rgb(var(--admin-secondary))",
          foreground: "rgb(var(--admin-secondary-foreground, 255 255 255))",
        },
        'admin-accent': {
          DEFAULT: "rgb(var(--admin-accent))",
          foreground: "rgb(var(--admin-accent-foreground, 255 255 255))",
        },
        'admin-success': {
          DEFAULT: "rgb(var(--admin-success))",
          foreground: "rgb(var(--admin-success-foreground, 255 255 255))",
        },
        'admin-warning': {
          DEFAULT: "rgb(var(--admin-warning))",
          foreground: "rgb(var(--admin-warning-foreground, 255 255 255))",
        },
        'admin-error': {
          DEFAULT: "rgb(var(--admin-error))",
          foreground: "rgb(var(--admin-error-foreground, 255 255 255))",
        },
        'admin-muted': {
          DEFAULT: "rgb(var(--admin-muted))",
          foreground: "rgb(var(--admin-muted-foreground))",
        },
        'admin-border': "rgb(var(--admin-border))",
        'admin-input': "rgb(var(--admin-input))",
        'admin-ring': "rgb(var(--admin-ring))",
        'admin-background': "rgb(var(--admin-background))",
        'admin-foreground': "rgb(var(--admin-foreground))",
        'admin-card': {
          DEFAULT: "rgb(var(--admin-card-bg))",
          border: "rgb(var(--admin-card-border))",
          foreground: "rgb(var(--admin-foreground))",
        },
        'admin-sidebar': {
          DEFAULT: "rgb(var(--admin-sidebar-bg))",
          foreground: "rgb(var(--admin-sidebar-fg))",
          active: "rgb(var(--admin-sidebar-active))",
          'active-foreground': "rgb(var(--admin-sidebar-active-fg))",
        },
        'admin-header': {
          DEFAULT: "rgb(var(--admin-header-bg))",
          foreground: "rgb(var(--admin-header-fg))",
          border: "rgb(var(--admin-header-border))",
        },
      },
      
      borderRadius: {
        'admin': 'var(--admin-radius)',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      boxShadow: {
        'admin-sm': 'var(--admin-card-shadow)',
        'admin': '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
        'admin-lg': '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
      },
      
      animation: {
        'admin-fade-in': 'adminFadeIn 0.3s ease-out',
        'admin-slide-down': 'adminSlideDown 0.3s ease-out',
      },
      
      keyframes: {
        adminFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        adminSlideDown: {
          '0%': { opacity: '0', transform: 'translateY(-10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} 