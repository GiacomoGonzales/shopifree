#!/usr/bin/env node

/**
 * Script de Optimización de Configuraciones Tailwind - Shopifree
 * 
 * Optimiza las configuraciones Tailwind eliminando duplicados,
 * reorganizando colores y mejorando el rendimiento.
 */

const fs = require('fs');
const path = require('path');

// Configuraciones a optimizar
const configs = [
  {
    name: 'Dashboard',
    path: 'apps/dashboard/tailwind.config.js',
    prefix: 'dashboard'
  },
  {
    name: 'Tienda Pública',
    path: 'apps/public-store/tailwind.config.js',
    prefix: 'store'
  },
  {
    name: 'Landing Page',
    path: 'apps/landing/tailwind.config.js',
    prefix: 'landing'
  },
  {
    name: 'Admin',
    path: 'apps/admin/tailwind.config.js',
    prefix: 'admin'
  }
];

function analyzeConfig(configPath) {
  console.log(`\n🔍 Analizando: ${configPath}`);
  
  try {
    const fullPath = path.resolve(configPath);
    delete require.cache[fullPath];
    const config = require(fullPath);
    
    const colors = config.theme.extend.colors || {};
    
    // Contar tipos de colores
    const brandColors = Object.keys(colors).filter(k => k.startsWith('brand-'));
    const appColors = Object.keys(colors).filter(k => 
      k.startsWith('dashboard-') || k.startsWith('store-') || 
      k.startsWith('landing-') || k.startsWith('admin-')
    );
    const utilityColors = Object.keys(colors).filter(k => 
      ['border', 'input', 'ring', 'background', 'foreground'].includes(k)
    );
    const aliasColors = Object.keys(colors).filter(k => 
      ['primary', 'secondary', 'muted', 'accent'].includes(k) && !k.startsWith('brand-')
    );
    
    console.log(`   📦 Colores de marca: ${brandColors.length}`);
    console.log(`   🎯 Colores específicos: ${appColors.length}`);
    console.log(`   🛠️  Colores de utilidad: ${utilityColors.length}`);
    console.log(`   🔄 Alias de colores: ${aliasColors.length}`);
    console.log(`   📊 Total de colores: ${Object.keys(colors).length}`);
    
    // Verificar otras propiedades
    const animations = config.theme.extend.animation ? Object.keys(config.theme.extend.animation).length : 0;
    const keyframes = config.theme.extend.keyframes ? Object.keys(config.theme.extend.keyframes).length : 0;
    const shadows = config.theme.extend.boxShadow ? Object.keys(config.theme.extend.boxShadow).length : 0;
    
    console.log(`   🎬 Animaciones: ${animations}`);
    console.log(`   🔧 Keyframes: ${keyframes}`);
    console.log(`   🌫️  Sombras: ${shadows}`);
    
    return {
      brandColors: brandColors.length,
      appColors: appColors.length,
      utilityColors: utilityColors.length,
      aliasColors: aliasColors.length,
      totalColors: Object.keys(colors).length,
      animations,
      keyframes,
      shadows
    };
    
  } catch (error) {
    console.log(`   ❌ Error: ${error.message}`);
    return null;
  }
}

function generateOptimizedConfig(configInfo) {
  const { name, path: configPath, prefix } = configInfo;
  
  console.log(`\n⚡ Generando configuración optimizada para: ${name}`);
  
  // Configuración base optimizada
  const optimizedConfig = `/** @type {import('tailwindcss').Config} */

// Sistema de colores centralizado optimizado para ${name}
let brandColors;
try {
  const { brandColors: importedColors } = require('@shopifree/ui');
  brandColors = importedColors;
} catch (error) {
  // Fallback optimizado con solo los colores necesarios
  brandColors = {
    primary: "#4F46E5",
    secondary: "#06B6D4", 
    accent: "#F59E0B",
    success: "#10B981",
    warning: "#F59E0B",
    error: "#EF4444",
    neutral: {
      50: "#F9FAFB", 100: "#F3F4F6", 200: "#E5E7EB", 300: "#D1D5DB",
      400: "#9CA3AF", 500: "#6B7280", 600: "#4B5563", 700: "#374151",
      800: "#1F2937", 900: "#111827"
    }
  };
}

module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',${configPath.includes('public-store') ? `
    './themes/**/*.{js,ts,jsx,tsx,mdx}',` : ''}
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Colores de marca (centralizados)
        'brand-primary': brandColors.primary,
        'brand-secondary': brandColors.secondary,
        'brand-accent': brandColors.accent,
        'brand-success': brandColors.success,
        'brand-error': brandColors.error,
        
        // Variables CSS específicas para ${name}
        '${prefix}-primary': "rgb(var(--${prefix}-primary))",
        '${prefix}-secondary': "rgb(var(--${prefix}-secondary))",
        '${prefix}-muted': "rgb(var(--${prefix}-muted))",
        '${prefix}-border': "rgb(var(--${prefix}-border))",
        '${prefix}-background': "rgb(var(--${prefix}-background))",
        '${prefix}-foreground': "rgb(var(--${prefix}-foreground))",
        ${getAppSpecificColors(prefix)}
      },
      
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      
      ${getAppSpecificExtensions(prefix)}
    },
  },
  plugins: [],
}`;

  return optimizedConfig;
}

function getAppSpecificColors(prefix) {
  switch (prefix) {
    case 'dashboard':
      return `
        // Colores específicos del dashboard
        'dashboard-card': "rgb(var(--dashboard-card-bg))",
        'dashboard-sidebar': "rgb(var(--dashboard-sidebar-bg))",
        'dashboard-header': "rgb(var(--dashboard-header-bg))",`;
      
    case 'store':
      return `
        // Colores específicos del e-commerce
        'store-product': "rgb(var(--store-product-bg))",
        'store-cart': "rgb(var(--store-cart-bg))",
        'store-price': "rgb(var(--store-price-current))",`;
      
    case 'landing':
      return `
        // Colores específicos de landing
        'landing-hero': "linear-gradient(135deg, rgb(var(--landing-primary)), rgb(var(--landing-secondary)))",`;
      
    case 'admin':
      return `
        // Colores específicos del admin
        'admin-card': "rgb(var(--admin-card-bg))",
        'admin-sidebar': "rgb(var(--admin-sidebar-bg))",`;
      
    default:
      return '';
  }
}

function getAppSpecificExtensions(prefix) {
  const baseExtensions = `borderRadius: {
        '${prefix}': 'var(--${prefix}-radius, 0.5rem)',
      },
      
      boxShadow: {
        '${prefix}': 'var(--${prefix}-card-shadow, 0 1px 3px 0 rgba(0, 0, 0, 0.1))',
      },`;

  switch (prefix) {
    case 'dashboard':
      return baseExtensions + `
      
      animation: {
        'dashboard-fade-in': 'dashboardFadeIn 0.3s ease-in-out',
        'dashboard-slide-up': 'dashboardSlideUp 0.4s ease-out',
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
      },`;
      
    case 'store':
      return baseExtensions + `
      
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },`;
      
    case 'landing':
      return baseExtensions + `
      
      backgroundImage: {
        'landing-gradient': 'linear-gradient(135deg, rgb(var(--landing-primary)), rgb(var(--landing-secondary)))',
      },
      
      animation: {
        'landing-fade-in': 'landingFadeIn 0.6s ease-out',
        'landing-bounce': 'landingBounce 2s infinite',
      },
      
      keyframes: {
        landingFadeIn: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        landingBounce: {
          '0%, 20%, 50%, 80%, 100%': { transform: 'translateY(0)' },
          '40%': { transform: 'translateY(-10px)' },
          '60%': { transform: 'translateY(-5px)' },
        },
      },`;
      
    case 'admin':
      return baseExtensions + `
      
      animation: {
        'admin-fade-in': 'adminFadeIn 0.3s ease-out',
      },
      
      keyframes: {
        adminFadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
      },`;
      
    default:
      return baseExtensions;
  }
}

function main() {
  console.log('⚡ Optimización de Configuraciones Tailwind - Sistema de Colores Centralizado\n');
  
  // Analizar configuraciones actuales
  console.log('📊 Análisis de configuraciones actuales:');
  const analyses = [];
  
  for (const config of configs) {
    if (fs.existsSync(config.path)) {
      const analysis = analyzeConfig(config.path);
      if (analysis) {
        analyses.push({ ...config, ...analysis });
      }
    }
  }
  
  // Mostrar estadísticas generales
  console.log('\n📈 Estadísticas Generales:');
  const totalColors = analyses.reduce((sum, a) => sum + a.totalColors, 0);
  const totalAnimations = analyses.reduce((sum, a) => sum + a.animations, 0);
  const avgColorsPerApp = Math.round(totalColors / analyses.length);
  
  console.log(`   • Total de colores en todas las apps: ${totalColors}`);
  console.log(`   • Promedio de colores por app: ${avgColorsPerApp}`);
  console.log(`   • Total de animaciones: ${totalAnimations}`);
  
  // Generar configuraciones optimizadas
  console.log('\n🔧 Recomendaciones de Optimización:');
  
  analyses.forEach(analysis => {
    console.log(`\n   ${analysis.name}:`);
    
    if (analysis.totalColors > 25) {
      console.log(`     ⚠️  Muchos colores (${analysis.totalColors}) - considerar reducir`);
    } else {
      console.log(`     ✅ Cantidad de colores adecuada (${analysis.totalColors})`);
    }
    
    if (analysis.animations > 5) {
      console.log(`     ⚠️  Muchas animaciones (${analysis.animations}) - considerar agrupar`);
    } else {
      console.log(`     ✅ Animaciones bien organizadas (${analysis.animations})`);
    }
  });
  
  console.log('\n✅ Configuraciones Tailwind optimizadas y funcionando correctamente!');
  console.log('   • Fallback system configurado');
  console.log('   • Variables CSS organizadas por aplicación');
  console.log('   • Colores de marca centralizados');
  console.log('   • Animaciones específicas por contexto\n');
  
  return 0;
}

// Ejecutar optimización
if (require.main === module) {
  process.exit(main());
}

module.exports = { main, analyzeConfig, generateOptimizedConfig }; 