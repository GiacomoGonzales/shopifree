#!/bin/bash

# Script para rollback de single locale URLs (volver a comportamiento legacy)
# Uso: ./scripts/rollback-single-locale.sh [storeId]

set -e

STORE_ID=$1

if [ -z "$STORE_ID" ]; then
    echo "❌ Error: storeId es requerido"
    echo "📖 Uso: ./scripts/rollback-single-locale.sh [storeId]"
    echo "📖 Ejemplo: ./scripts/rollback-single-locale.sh mi-tienda"
    exit 1
fi

echo "🔄 ROLLBACK: Desactivando Single Locale URLs para: $STORE_ID"
echo "⚠️  La tienda volverá a URLs con prefijo de idioma (/es, /en)"
echo "================================================================="

# Crear script temporal para desactivar
cat > /tmp/rollback-store.js << 'EOF'
const admin = require('firebase-admin');

// Configurar Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    }),
  });
}

const db = admin.firestore();

async function rollbackStore(storeId) {
  try {
    console.log(`🔄 Desactivando singleLocaleUrls para: ${storeId}`);
    
    const storeRef = db.collection('stores').doc(storeId);
    const storeDoc = await storeRef.get();
    
    if (!storeDoc.exists) {
      console.error(`❌ Tienda ${storeId} no existe`);
      return;
    }
    
    // Desactivar flag
    await storeRef.update({
      'advanced.singleLocaleUrls': false
    });
    
    console.log(`✅ Rollback completado para ${storeId}`);
    console.log(`📍 La tienda ahora usa URLs legacy (/es, /en)`);
    
  } catch (error) {
    console.error('❌ Error en rollback:', error);
    process.exit(1);
  }
}

const storeId = process.argv[2];
if (!storeId) {
  console.error('❌ storeId requerido');
  process.exit(1);
}

rollbackStore(storeId);
EOF

# Ejecutar el rollback
if node /tmp/rollback-store.js "$STORE_ID"; then
    echo ""
    echo "✅ ROLLBACK COMPLETADO"
    echo ""
    echo "🧪 Para verificar:"
    echo "   1. Esperar ~5 minutos (cache del middleware)"
    echo "   2. Verificar que https://[subdomain].shopifree.app/ redirige a /es"
    echo "   3. Verificar que sitemap vuelve a tener URLs con prefijo"
    echo ""
    echo "📊 Monitorear:"
    echo "   - Restoration de behavior legacy"
    echo "   - No hay errores 404/500 nuevos"
    echo "   - GSC sigue indexando URLs anteriores"
else
    echo ""
    echo "❌ Error en rollback"
    echo "Verificar manually en Firestore Console:"
    echo "   stores/$STORE_ID/advanced/singleLocaleUrls: false"
fi

# Limpiar archivo temporal
rm -f /tmp/rollback-store.js
