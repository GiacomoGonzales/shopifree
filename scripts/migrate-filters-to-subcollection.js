const admin = require('firebase-admin');

// Inicializar Firebase Admin SDK
// Asegúrate de tener configuradas las credenciales de Firebase
try {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    // O usa tu archivo de credenciales:
    // credential: admin.credential.cert('./path/to/serviceAccountKey.json'),
  });
} catch (error) {
  console.log('Firebase ya está inicializado');
}

const db = admin.firestore();

async function migrateFiltersToSubcollection() {
  try {
    console.log('🔄 Iniciando migración de filtros a subcolección...');
    
    // Obtener todas las tiendas
    const storesSnapshot = await db.collection('stores').get();
    
    for (const storeDoc of storesSnapshot.docs) {
      const storeId = storeDoc.id;
      const storeData = storeDoc.data();
      
      console.log(`\n📍 Procesando tienda: ${storeId}`);
      
      // Verificar si tiene filtros en settings
      const oldFilters = storeData?.settings?.filters;
      
      if (!oldFilters || typeof oldFilters !== 'object') {
        console.log(`   ⚠️  No hay filtros en settings para migrar`);
        continue;
      }
      
      // Extraer filtros de la estructura antigua
      const { availableFilters = [], displayOrder = [], enabled = true } = oldFilters;
      
      if (!availableFilters || availableFilters.length === 0) {
        console.log(`   ⚠️  No hay filtros disponibles para migrar`);
        continue;
      }
      
      console.log(`   📦 Encontrados ${availableFilters.length} filtros para migrar`);
      
      // Crear batch para operaciones atómicas
      const batch = db.batch();
      
      // Migrar cada filtro a la nueva subcolección
      availableFilters.forEach((filter, index) => {
        const filterId = filter.id || filter.name?.toLowerCase().replace(/\s+/g, '_') || `filter_${index}`;
        const filterRef = db.collection('stores').doc(storeId).collection('filters').doc(filterId);
        
        // Determinar si está visible (en displayOrder) y su orden
        const orderIndex = displayOrder.indexOf(filterId);
        const isVisible = orderIndex !== -1;
        const order = isVisible ? orderIndex : index;
        
        const filterData = {
          id: filterId,
          name: filter.name || filterId,
          type: filter.type || 'tags',
          visible: isVisible,
          order: order,
          options: filter.options || [],
          productCount: filter.productCount || 0,
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        };
        
        batch.set(filterRef, filterData);
        console.log(`   ✅ Preparando migración: ${filterData.name} (visible: ${isVisible}, orden: ${order})`);
      });
      
      // Eliminar filtros de settings
      const storeRef = db.collection('stores').doc(storeId);
      batch.update(storeRef, {
        'settings.filters': admin.firestore.FieldValue.delete()
      });
      
      // Ejecutar el batch
      await batch.commit();
      console.log(`   🎉 Migración completada para tienda ${storeId}`);
    }
    
    console.log('\n✨ Migración de filtros completada exitosamente');
    
  } catch (error) {
    console.error('❌ Error durante la migración:', error);
    throw error;
  }
}

// Script para eliminar manualmente todos los filtros antiguos
async function cleanupOldFilters() {
  try {
    console.log('🧹 Limpiando filtros antiguos de settings...');
    
    const storesSnapshot = await db.collection('stores').get();
    const batch = db.batch();
    
    storesSnapshot.docs.forEach(doc => {
      const storeData = doc.data();
      if (storeData?.settings?.filters) {
        console.log(`   🗑️  Eliminando filtros antiguos de tienda: ${doc.id}`);
        batch.update(doc.ref, {
          'settings.filters': admin.firestore.FieldValue.delete()
        });
      }
    });
    
    await batch.commit();
    console.log('✅ Limpieza completada');
    
  } catch (error) {
    console.error('❌ Error durante la limpieza:', error);
    throw error;
  }
}

// Script para regenerar filtros automáticamente
async function regenerateFiltersForAllStores() {
  try {
    console.log('🔧 Regenerando filtros automáticamente para todas las tiendas...');
    
    const storesSnapshot = await db.collection('stores').get();
    
    for (const storeDoc of storesSnapshot.docs) {
      const storeId = storeDoc.id;
      console.log(`\n🏪 Procesando tienda: ${storeId}`);
      
      // Obtener productos de la tienda
      const productsSnapshot = await db.collection('stores').doc(storeId).collection('products').get();
      
      if (productsSnapshot.empty) {
        console.log(`   ⚠️  No hay productos en esta tienda`);
        continue;
      }
      
      // Extraer filtros de productos
      const filtersMap = new Map();
      const filterCounts = new Map();
      
      productsSnapshot.docs.forEach(productDoc => {
        const product = productDoc.data();
        if (product.metaFieldValues) {
          Object.entries(product.metaFieldValues).forEach(([fieldId, value]) => {
            if (!filtersMap.has(fieldId)) {
              filtersMap.set(fieldId, new Set());
              filterCounts.set(fieldId, 0);
            }
            
            filterCounts.set(fieldId, (filterCounts.get(fieldId) || 0) + 1);
            
            if (Array.isArray(value)) {
              value.forEach(v => {
                if (v && v.trim()) {
                  filtersMap.get(fieldId).add(v.trim());
                }
              });
            } else if (value && typeof value === 'string' && value.trim()) {
              filtersMap.get(fieldId).add(value.trim());
            }
          });
        }
      });
      
      if (filtersMap.size === 0) {
        console.log(`   ⚠️  No se encontraron metadatos para generar filtros`);
        continue;
      }
      
      // Crear batch para los nuevos filtros
      const batch = db.batch();
      
      // Limpiar filtros existentes
      const existingFiltersSnapshot = await db.collection('stores').doc(storeId).collection('filters').get();
      existingFiltersSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Crear nuevos filtros
      let order = 0;
      filtersMap.forEach((valueSet, fieldId) => {
        if (valueSet.size > 0) {
          const filterRef = db.collection('stores').doc(storeId).collection('filters').doc(fieldId);
          
          const filterData = {
            id: fieldId,
            name: getFilterDisplayName(fieldId),
            type: getFilterType(fieldId),
            visible: true,
            order: order++,
            options: Array.from(valueSet).sort(),
            productCount: filterCounts.get(fieldId) || 0,
            updatedAt: admin.firestore.FieldValue.serverTimestamp()
          };
          
          batch.set(filterRef, filterData);
          console.log(`   ✅ Creando filtro: ${filterData.name} (${filterData.options.length} opciones)`);
        }
      });
      
      await batch.commit();
      console.log(`   🎉 Filtros regenerados para tienda ${storeId}`);
    }
    
    console.log('\n✨ Regeneración de filtros completada');
    
  } catch (error) {
    console.error('❌ Error durante la regeneración:', error);
    throw error;
  }
}

// Funciones auxiliares (copiadas del código principal)
function getFilterDisplayName(fieldId) {
  const nameMap = {
    'color': 'Color',
    'size': 'Talla',
    'gender': 'Género',
    'material': 'Material',
    'occasion': 'Ocasión',
    'season': 'Temporada',
    'style': 'Estilo',
    'category_type': 'Tipo',
    'care': 'Cuidado',
    'fit': 'Ajuste',
    'neckline': 'Cuello',
    'sleeve_type': 'Manga',
    'pattern': 'Patrón',
    'brand': 'Marca',
    'age_group': 'Grupo de edad',
    'processor': 'Procesador',
    'ram': 'Memoria RAM',
    'storage': 'Almacenamiento',
    'screen_size': 'Tamaño de Pantalla'
  };
  return nameMap[fieldId] || fieldId.charAt(0).toUpperCase() + fieldId.slice(1).replace(/_/g, ' ');
}

function getFilterType(fieldId) {
  const typeMap = {
    'color': 'tags',
    'size': 'tags',
    'gender': 'select',
    'material': 'select',
    'occasion': 'tags',
    'season': 'select',
    'style': 'tags',
    'category_type': 'select',
    'care': 'tags',
    'brand': 'select',
    'fit': 'select',
    'neckline': 'select',
    'sleeve_type': 'select',
    'pattern': 'tags',
    'age_group': 'select',
    'processor': 'select',
    'ram': 'tags',
    'storage': 'tags',
    'screen_size': 'select'
  };
  return typeMap[fieldId] || 'tags';
}

// Función principal
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  
  try {
    switch (command) {
      case 'migrate':
        await migrateFiltersToSubcollection();
        break;
      case 'cleanup':
        await cleanupOldFilters();
        break;
      case 'regenerate':
        await regenerateFiltersForAllStores();
        break;
      default:
        console.log(`
🚀 Script de migración de filtros

Comandos disponibles:
  node migrate-filters-to-subcollection.js migrate    - Migrar filtros existentes a subcolección
  node migrate-filters-to-subcollection.js cleanup    - Limpiar filtros antiguos de settings
  node migrate-filters-to-subcollection.js regenerate - Regenerar filtros automáticamente

Recomendado para tu caso:
  1. node migrate-filters-to-subcollection.js regenerate
        `);
    }
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  main();
} 