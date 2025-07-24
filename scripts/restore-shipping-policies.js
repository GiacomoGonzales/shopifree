require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, doc, updateDoc, collection, query, where, getDocs } = require('firebase/firestore');

// Usar la configuración de Firebase existente
const firebaseConfig = {
  apiKey: "AIzaSyBH8xhzwRW0SMT0DzTqsf-nFQvTAkXVwSE",
  authDomain: "shopifree-7867e.firebaseapp.com",
  projectId: "shopifree-7867e",
  storageBucket: "shopifree-7867e.appspot.com",
  messagingSenderId: "1043777703144",
  appId: "1:1043777703144:web:c7d4c0c3a5f2c5a5d5d5d5"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Función para obtener el ID de la tienda por subdominio
async function getStoreIdBySubdomain(subdomain) {
  try {
    const storesRef = collection(db, 'stores');
    const q = query(storesRef, where('subdomain', '==', subdomain));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      return querySnapshot.docs[0].id;
    }
    return null;
  } catch (error) {
    console.error('Error al buscar la tienda:', error);
    return null;
  }
}

// Función para restaurar las políticas de envío
async function restoreShippingPolicies(subdomain) {
  try {
    // Obtener el ID de la tienda por subdominio
    const storeId = await getStoreIdBySubdomain(subdomain);
    
    if (!storeId) {
      console.error('❌ No se encontró la tienda con el subdominio:', subdomain);
      process.exit(1);
    }

    const storeRef = doc(db, 'stores', storeId);
    
    // Valores predeterminados para las políticas de envío
    const defaultShippingPolicies = {
      generalInfo: 'Realizamos envíos a nivel nacional e internacional. Todos nuestros productos son empacados con cuidado para garantizar que lleguen en perfectas condiciones.',
      processingTime: 'Los pedidos se procesan en 1-2 días hábiles',
      packagingInfo: 'Utilizamos materiales de empaque de alta calidad para asegurar que tus productos lleguen en perfecto estado.',
      trackingInfo: 'Recibirás un número de seguimiento por email una vez que tu pedido sea enviado. Podrás rastrear tu paquete en tiempo real.',
      returnPolicy: 'Aceptamos devoluciones dentro de los 30 días posteriores a la entrega. El producto debe estar en su estado original y sin usar. Los gastos de envío de devolución corren por cuenta del cliente.',
      contactInfo: 'Para preguntas sobre tu envío, contáctanos por WhatsApp o email. Estamos disponibles de lunes a viernes de 9am a 6pm.',
      specialInstructions: 'Para productos frágiles o de gran tamaño, nos pondremos en contacto contigo para coordinar el envío especial.',
      showEstimatedDelivery: true,
      showTrackingInfo: true,
      showReturnPolicy: true
    };

    // Actualizar el documento de la tienda
    await updateDoc(storeRef, {
      'advanced.shipping.customerInfo': defaultShippingPolicies
    });

    console.log('✅ Políticas de envío restauradas exitosamente para la tienda:', subdomain);
    process.exit(0);
  } catch (error) {
    console.error('❌ Error al restaurar las políticas de envío:', error);
    process.exit(1);
  }
}

// Obtener el subdominio de la tienda de los argumentos de la línea de comandos
const subdomain = process.argv[2];

if (!subdomain) {
  console.error('❌ Error: Debes proporcionar el subdominio de la tienda');
  console.log('Uso: node restore-shipping-policies.js SUBDOMINIO_DE_TIENDA');
  process.exit(1);
}

restoreShippingPolicies(subdomain); 