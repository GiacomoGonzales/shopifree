// Test para la API route de emails
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Cargar variables de entorno desde .env.local
dotenv.config({ path: resolve(__dirname, '../.env.local') });

import { sendOrderEmailsViaAPI } from './email-client';
import { OrderData } from './orders';

async function testEmailAPI() {
  console.log('🧪 Probando API de emails...');

  // Verificar variables de entorno
  const apiKey = process.env.SENDGRID_API_KEY;
  const fromEmail = process.env.SENDGRID_FROM_EMAIL;
  const adminEmail = process.env.STORE_ADMIN_EMAIL;

  console.log('📋 Configuración:');
  console.log(`- SENDGRID_API_KEY: ${apiKey ? '✅ Configurada' : '❌ Falta'}`);
  console.log(`- SENDGRID_FROM_EMAIL: ${fromEmail || '❌ Falta'}`);
  console.log(`- STORE_ADMIN_EMAIL: ${adminEmail || '❌ Falta'}`);

  if (!apiKey || !fromEmail || !adminEmail) {
    console.error('❌ Faltan variables de entorno necesarias');
    return;
  }

  // Crear datos de pedido de prueba
  const testOrderData: OrderData = {
    customer: {
      email: 'cliente.prueba@gmail.com', // Cambiar por un email real para pruebas
      fullName: 'Juan Pérez',
      phone: '+51 999 888 777'
    },
    shipping: {
      method: 'standard',
      address: 'Av. Test 123, Lima, Perú',
      city: 'Lima',
      cost: 15.00
    },
    payment: {
      method: 'cash',
      notes: 'Pago contra entrega'
    },
    items: [
      {
        id: 'test-item-1',
        productId: 'prod-123',
        name: 'Producto de Prueba',
        price: 99.99,
        currency: 'PEN',
        image: 'https://example.com/image.jpg',
        slug: 'producto-prueba',
        quantity: 2,
        variant: {
          id: 'var-456',
          name: 'Talla M',
          price: 99.99
        }
      },
      {
        id: 'test-item-2',
        productId: 'prod-789',
        name: 'Otro Producto',
        price: 49.99,
        currency: 'PEN',
        image: 'https://example.com/image2.jpg',
        slug: 'otro-producto',
        quantity: 1
      }
    ],
    totals: {
      subtotal: 249.97,
      shipping: 15.00,
      total: 264.97
    },
    currency: 'PEN',
    checkoutMethod: 'traditional'
  };

  try {
    console.log('📧 Enviando emails de prueba...');

    const result = await sendOrderEmailsViaAPI({
      orderId: 'test-order-' + Date.now(),
      orderData: testOrderData,
      storeName: 'Tienda de Prueba - Shopifree',
      storeUrl: 'https://tutienda.shopifree.app',
      dashboardUrl: 'https://dashboard.shopifree.app/es/orders'
    });

    if (result.success) {
      console.log('✅ ¡API de emails funcionando correctamente!');
      console.log('📧 Resultados:', result.message);

      if (result.results) {
        console.log(`- Email al cliente: ${result.results.customerSent ? '✅ Enviado' : '❌ Falló'}`);
        console.log(`- Email al admin: ${result.results.adminSent ? '✅ Enviado' : '❌ Falló'}`);
      }
    } else {
      console.error('❌ Error en API de emails:', result.error);
      console.error('📄 Código de error:', result.code);
    }

  } catch (error) {
    console.error('💥 Error ejecutando test:', error);
  }
}

// Ejecutar si se llama directamente
if (require.main === module) {
  testEmailAPI().catch(console.error);
}

export { testEmailAPI };