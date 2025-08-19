#!/usr/bin/env node

/**
 * Script para validar la generación del Apple Touch Icon
 * Verifica que se genera con las dimensiones correctas (180x180)
 */

const { generateAppleTouchIcon, generateAllImageVariants } = require('../lib/image-optimization.ts');

// Test cases
const testImages = [
    'https://res.cloudinary.com/dnrj1guvs/image/upload/v1754009787/logos/J0YnmGq3CvniogUb6BPp/ppveht70tfxg8i799y4w.png',
    'https://res.cloudinary.com/dnrj1guvs/image/upload/v1755322998/seo/favicons/J0YnmGq3CvniogUb6BPp/hzviegslxt0vwo6b2tu2.png',
    '/default-og.png',
    'https://example.com/external-image.jpg'
];

console.log('🍎 TESTING APPLE TOUCH ICON GENERATION\n');

testImages.forEach((originalImage, index) => {
    console.log(`🖼️  Test ${index + 1}: ${originalImage}`);
    
    // Test generación individual
    const appleIcon = generateAppleTouchIcon(originalImage);
    console.log('   🍎 Apple Touch Icon:', appleIcon);
    
    // Test generación completa
    const allVariants = generateAllImageVariants(originalImage);
    console.log('   📱 All variants apple:', allVariants.appleTouchIcon);
    
    // Validaciones
    if (originalImage.includes('cloudinary.com')) {
        const hasCorrectDimensions = appleIcon.includes('w_180,h_180');
        const hasCorrectFormat = appleIcon.includes('f_png');
        console.log(`   ✅ Dimensiones 180x180: ${hasCorrectDimensions}`);
        console.log(`   ✅ Formato PNG: ${hasCorrectFormat}`);
    }
    
    console.log('');
});

console.log('📋 APPLE TOUCH ICON REQUIREMENTS:');
console.log('✅ Dimensiones: 180x180 píxeles (recomendación oficial de Apple)');
console.log('✅ Formato: PNG preferido para mejor compatibilidad');
console.log('✅ Optimización: c_fill para mantener aspecto y recortar si es necesario');
console.log('✅ Calidad: q_auto para balance óptimo tamaño/calidad');
console.log('');
console.log('🔗 Referencias:');
console.log('   • Apple Human Interface Guidelines');
console.log('   • https://developer.apple.com/design/human-interface-guidelines/app-icons');
