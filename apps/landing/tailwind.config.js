/** @type {import('tailwindcss').Config} */

// Importar sistema de colores centralizado
let brandColors;
try {
  // Intentar importar desde el paquete compilado
  const { brandColors: importedColors } = require('@shopifree/ui');
  brandColors = importedColors;
} catch (error) {
  // Fallback a colores hardcodeados si hay problemas de importación
  console.warn('⚠️  Usando colores hardcodeados como fallback en landing/tailwind.config.js');
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
        
        secondary: {
          DEFAULT: brandColors.secondary,
          50: brandColors.blue[50],
          500: brandColors.secondary,
          600: brandColors.blue[600],
          700: brandColors.blue[700],
        },
        
        // Variables específicas para landing page
        'landing-primary': {
          DEFAULT: "rgb(var(--landing-primary))",
          foreground: "rgb(var(--landing-primary-foreground, 255 255 255))",
        },
        'landing-secondary': {
          DEFAULT: "rgb(var(--landing-secondary))",
          foreground: "rgb(var(--landing-secondary-foreground, 255 255 255))",
        },
        'landing-accent': {
          DEFAULT: "rgb(var(--landing-accent))",
          foreground: "rgb(var(--landing-accent-foreground, 255 255 255))",
        },
        'landing-muted': {
          DEFAULT: "rgb(var(--landing-muted))",
          foreground: "rgb(var(--landing-muted-foreground))",
        },
        'landing-border': "rgb(var(--landing-border))",
        'landing-input': "rgb(var(--landing-input))",
        'landing-ring': "rgb(var(--landing-ring))",
        'landing-background': "rgb(var(--landing-background))",
        'landing-foreground': "rgb(var(--landing-foreground))",
      },
      
      backgroundImage: {
        'landing-gradient-primary': 'linear-gradient(135deg, rgb(var(--landing-primary)), rgb(var(--landing-secondary)))',
        'landing-gradient-subtle': 'linear-gradient(135deg, rgb(var(--landing-primary) / 0.05), rgb(var(--landing-secondary) / 0.05))',
      },
      
      borderRadius: {
        'landing': 'var(--landing-radius)',
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      boxShadow: {
        'landing-sm': '0 1px 3px 0 rgb(var(--landing-neutral-900) / 0.1)',
        'landing': '0 4px 6px -1px rgb(var(--landing-neutral-900) / 0.1)',
        'landing-lg': '0 10px 15px -3px rgb(var(--landing-neutral-900) / 0.1)',
      },
      
      animation: {
        'landing-fade-in': 'landingFadeIn 0.6s ease-out',
        'landing-slide-up': 'landingSlideUp 0.8s ease-out',
        'landing-bounce': 'landingBounce 2s infinite',
      },
      
      keyframes: {
        landingFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        landingSlideUp: {
          '0%': { opacity: '0', transform: 'translateY(40px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        landingBounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
      },
    },
  },
  plugins: [],
} 