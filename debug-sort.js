// Script de debug para el ordenamiento de productos
// Ejecutar en la consola del navegador en la página de productos del dashboard

console.log('🔍 Debug del ordenamiento de productos');

// Función para inspeccionar los tipos de createdAt en los productos actuales
function debugProductTimestamps() {
  // Intentar obtener productos del estado global o localStorage
  const products = window.products || []; // Esto dependerá de cómo esté expuesto en tu app

  console.log(`📊 Analizando ${products.length} productos:`);

  products.forEach((product, index) => {
    const createdAt = product.createdAt;

    console.log(`\n📦 Producto ${index + 1}: ${product.name}`);
    console.log('  🕒 createdAt type:', typeof createdAt);
    console.log('  🕒 createdAt value:', createdAt);

    if (createdAt) {
      if (createdAt.seconds !== undefined) {
        console.log('  ✅ Tipo: Firestore Timestamp');
        console.log('  📅 Fecha:', new Date(createdAt.seconds * 1000));
      } else if (createdAt instanceof Date) {
        console.log('  ✅ Tipo: Date object');
        console.log('  📅 Fecha:', createdAt);
      } else if (typeof createdAt === 'string') {
        console.log('  ✅ Tipo: String');
        console.log('  📅 Fecha parseada:', new Date(createdAt));
      } else {
        console.log('  ❌ Tipo desconocido');
      }
    } else {
      console.log('  ❌ createdAt no existe o es null/undefined');
    }
  });
}

// Función para probar el ordenamiento actual
function testCurrentSorting() {
  const products = window.products || [];

  console.log('\n🧪 Probando ordenamiento actual:');

  const sortedDesc = [...products].sort((a, b) => {
    const aTime = (a.createdAt)?.seconds || 0;
    const bTime = (b.createdAt)?.seconds || 0;
    return bTime - aTime;
  });

  console.log('📋 Orden descendente (más reciente primero):');
  sortedDesc.slice(0, 5).forEach((product, index) => {
    const createdAt = product.createdAt;
    const timestamp = createdAt?.seconds ? new Date(createdAt.seconds * 1000) : 'N/A';
    console.log(`  ${index + 1}. ${product.name} - ${timestamp}`);
  });
}

// Función para probar el ordenamiento mejorado
function testImprovedSorting() {
  const products = window.products || [];

  console.log('\n✨ Probando ordenamiento mejorado:');

  const getTimestamp = (dateValue) => {
    if (!dateValue) return 0;

    if (dateValue.seconds !== undefined) {
      return dateValue.seconds * 1000 + (dateValue.nanoseconds || 0) / 1000000;
    }

    if (dateValue instanceof Date) {
      return dateValue.getTime();
    }

    if (typeof dateValue === 'string') {
      const parsed = new Date(dateValue);
      return isNaN(parsed.getTime()) ? 0 : parsed.getTime();
    }

    if (typeof dateValue === 'number') {
      return dateValue;
    }

    return 0;
  };

  const sortedDesc = [...products].sort((a, b) => {
    const aTime = getTimestamp(a.createdAt);
    const bTime = getTimestamp(b.createdAt);
    return bTime - aTime;
  });

  console.log('📋 Orden descendente mejorado (más reciente primero):');
  sortedDesc.slice(0, 5).forEach((product, index) => {
    const timestamp = getTimestamp(product.createdAt);
    const date = timestamp ? new Date(timestamp) : 'N/A';
    console.log(`  ${index + 1}. ${product.name} - ${date}`);
  });
}

// Ejecutar todas las pruebas
console.log('🚀 Iniciando debug...');
debugProductTimestamps();
testCurrentSorting();
testImprovedSorting();

console.log('\n📝 Instrucciones:');
console.log('1. Copia y pega este script en la consola del navegador');
console.log('2. Ve a la página de productos del dashboard');
console.log('3. Asegúrate de que window.products contenga los productos');
console.log('4. Ejecuta: debugProductTimestamps() para ver los tipos de datos');
console.log('5. Ejecuta: testCurrentSorting() para ver el ordenamiento actual');
console.log('6. Ejecuta: testImprovedSorting() para ver el ordenamiento mejorado');