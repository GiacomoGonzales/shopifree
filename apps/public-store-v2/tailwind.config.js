/** @type {import('tailwindcss').Config} */

// Importar sistema de colores centralizado (opcional)
let brandColors;
try {
  const { brandColors: importedColors } = require('@shopifree/ui');
  brandColors = importedColors;
} catch (error) {
  console.warn('⚠️  Usando colores hardcodeados como fallback en public-store-v2/tailwind.config.js');
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
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './themes/**/*.{js,ts,jsx,tsx,mdx}',
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

        // Variables CSS para compatibilidad con el sistema existente
        border: "rgb(var(--border))",
        input: "rgb(var(--input))",
        ring: "rgb(var(--ring))",
        background: "rgb(var(--background))",
        foreground: "rgb(var(--foreground))",
        primary: {
          DEFAULT: "rgb(var(--primary))",
          foreground: "rgb(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "rgb(var(--secondary))",
          foreground: "rgb(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "rgb(var(--destructive))",
          foreground: "rgb(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "rgb(var(--muted))",
          foreground: "rgb(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "rgb(var(--accent))",
          foreground: "rgb(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "rgb(var(--popover))",
          foreground: "rgb(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "rgb(var(--card))",
          foreground: "rgb(var(--card-foreground))",
        },

        // Variables específicas para e-commerce
        'store-primary': {
          DEFAULT: "rgb(var(--store-primary))",
          foreground: "rgb(var(--store-primary-foreground, 255 255 255))",
        },
        'store-secondary': {
          DEFAULT: "rgb(var(--store-secondary))",
          foreground: "rgb(var(--store-secondary-foreground, 255 255 255))",
        },
        'store-product': {
          DEFAULT: "rgb(var(--store-product-bg))",
          border: "rgb(var(--store-product-border))",
        },
        'store-cart': {
          DEFAULT: "rgb(var(--store-cart-bg))",
          foreground: "rgb(var(--store-cart-fg))",
          count: "rgb(var(--store-cart-count))",
        },
        'store-price': {
          current: "rgb(var(--store-price-current))",
          original: "rgb(var(--store-price-original))",
          discount: "rgb(var(--store-price-discount))",
        },
        'store-rating': {
          filled: "rgb(var(--store-rating-filled))",
          empty: "rgb(var(--store-rating-empty))",
        },
        'store-badge': {
          new: "rgb(var(--store-badge-new))",
          sale: "rgb(var(--store-badge-sale))",
          featured: "rgb(var(--store-badge-featured))",
          'out-of-stock': "rgb(var(--store-badge-out-of-stock))",
        },
      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },

      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },

      boxShadow: {
        'store-product': 'var(--store-product-shadow)',
        'store-product-hover': 'var(--store-product-hover-shadow)',
      },

      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },

      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
}


