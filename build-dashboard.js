#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Building dashboard...');

try {
  // Cambiar al directorio del dashboard
  process.chdir(path.join(__dirname, 'apps', 'dashboard'));
  
  // Ejecutar el build
  execSync('npm run build', { stdio: 'inherit' });
  
  console.log('✅ Dashboard build completed successfully!');
} catch (error) {
  console.error('❌ Dashboard build failed:', error.message);
  process.exit(1);
} 