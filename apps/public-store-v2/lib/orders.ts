import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { CartItem } from './cart-context';
import { formatPrice } from './currency';
import { finalizeCustomerOrder, saveCustomerToLocalStorage } from './customers';
import { sendOrderConfirmationEmailsClient } from './email-client';

// Tipos compatibles con el dashboard existente
export interface OrderData {
  customer: {
    email: string;
    fullName: string;
    phone: string;
  };
  customerId?: string; // 🆕 ID del cliente para órdenes progresivas
  shipping: {
    method: 'standard' | 'express' | 'pickup';
    address?: string;
    city?: string;
    cost: number;
    pickupLocation?: any;
  };
  payment: {
    method: string;
    notes?: string;
  };
  items: CartItem[];
  totals: {
    subtotal: number;
    shipping: number;
    total: number;
  };
  currency: string;
  checkoutMethod: 'whatsapp' | 'traditional';
  whatsappPhone?: string;
  discount?: number;
  appliedCoupon?: any;
}

/**
 * Crear pedido en Firestore
 * Formato compatible con dashboard existente en apps/dashboard/lib/orders.ts
 */
export async function createOrder(
  storeId: string,
  orderData: OrderData,
  paymentInfo?: {
    isPaid: boolean;
    paidAmount?: number;
    paymentType?: 'cash_on_delivery' | 'card_on_delivery' | 'mobile_transfer' | 'online_payment';
    transactionId?: string;
  }
) {
  console.log('[Orders] Attempting to create order for store:', storeId);
  console.log('[Orders] Order data:', JSON.stringify(orderData, null, 2));

  const db = getFirebaseDb();
  if (!db) {
    console.error('[Orders] Firebase not initialized! Environment variables:');
    console.error('- API_KEY:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY ? 'SET' : 'MISSING');
    console.error('- AUTH_DOMAIN:', process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ? 'SET' : 'MISSING');
    console.error('- PROJECT_ID:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ? 'SET' : 'MISSING');
    return null;
  }

  console.log('[Orders] Firebase initialized successfully');

  try {
    // 🆕 FINALIZAR CLIENTE PROGRESIVO (si ya tiene customerId) o proceso legacy
    let customerId = orderData.customerId;

    if (customerId) {
      // Cliente ya fue creado progresivamente, solo finalizar orden
      console.log('[Orders] Finalizing progressive customer order:', customerId);
      await finalizeCustomerOrder(storeId, customerId, orderData.totals.total, orderData.currency);
    }

    // 🆕 GUARDAR DATOS EN LOCALSTORAGE PARA PRÓXIMAS VISITAS
    saveCustomerToLocalStorage(
      orderData.customer.email,
      orderData.customer.fullName,
      orderData.customer.phone
    );

    const ordersRef = collection(db, 'stores', storeId, 'orders');
    console.log('[Orders] Orders collection reference created:', ordersRef);

    // Formato EXACTO que espera el dashboard
    const newOrder = {
      // Información del cliente (nombres compatibles)
      clientName: orderData.customer.fullName,
      clientPhone: orderData.customer.phone,
      clientAddress: orderData.shipping?.address || '',
      clientNotes: orderData.payment?.notes || '',
      
      // Items del pedido (formato compatible)
      items: orderData.items.map(item => ({
        id: item.id,
        name: item.name,
        presentation: item.variant?.name || 'Default',
        quantity: item.quantity,
        price: item.variant?.price || item.price,
        subtotal: (item.variant?.price || item.price) * item.quantity,
        productId: item.productId || item.id
      })),
      
      // Totales (nombres exactos del dashboard)
      subtotal: orderData.totals.subtotal,
      shippingCost: orderData.totals.shipping,
      total: orderData.totals.total,
      
      // Método de pago (formato compatible - legacy)
      paymentMethod: orderData.payment.method as 'cash' | 'transfer' | 'card' | 'other',
      
      // Status basado en método de checkout
      status: orderData.checkoutMethod === 'whatsapp' ? 'whatsapp_sent' : 'pending',
      
      // 🆕 NUEVOS CAMPOS DE PAGO
      paymentType: paymentInfo?.paymentType || (() => {
        // Mapear método legacy a nuevo tipo si no se especifica
        switch (orderData.payment.method) {
          case 'cash': return 'cash_on_delivery'
          case 'card': return 'card_on_delivery'
          case 'transfer': return 'mobile_transfer'
          case 'culqi':
          case 'mercadopago':
          case 'paypal': return 'online_payment'
          default: return 'cash_on_delivery'
        }
      })(),
      paymentStatus: paymentInfo?.isPaid ? 'paid' : 'pending',
      paidAmount: paymentInfo?.paidAmount || 0,

      // Información adicional del pago online (si aplica)
      ...(paymentInfo?.transactionId && { transactionId: paymentInfo.transactionId }),
      
      // Metadata requerida por dashboard
      storeId: storeId,
      userId: '', // No hay usuario autenticado en tienda pública
      customerId: customerId || '', // 🆕 ID del cliente automático
      
      // Timestamps (formato Firestore)
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      
      // Campos adicionales (no rompen dashboard)
      email: orderData.customer.email,
      shippingMethod: orderData.shipping.method,
      currency: orderData.currency,
      checkoutMethod: orderData.checkoutMethod,
      
      // Solo para WhatsApp
      ...(orderData.checkoutMethod === 'whatsapp' && {
        whatsappSentAt: serverTimestamp(),
        ...(orderData.whatsappPhone && { whatsappPhone: orderData.whatsappPhone })
      }),
      
      // Descuentos (si aplica)
      ...(orderData.discount && orderData.discount > 0 && {
        discount: orderData.discount,
        appliedCoupon: orderData.appliedCoupon
      })
    };
    
    console.log('[Orders] Creating order with data:', {
      storeId,
      checkoutMethod: orderData.checkoutMethod,
      newOrderKeys: Object.keys(newOrder),
      newOrderSize: JSON.stringify(newOrder).length
    });

    const docRef = await addDoc(ordersRef, newOrder);
    console.log('[Orders] ✅ Order created successfully! Doc ID:', docRef.id);
    console.log('[Orders] ✅ Order path: stores/' + storeId + '/orders/' + docRef.id);

    // 🆕 ENVIAR EMAILS DE CONFIRMACIÓN
    try {
      console.log('[Orders] 📧 Enviando emails de confirmación...');
      const storeUrl = typeof window !== 'undefined' ? window.location.origin : '';
      const dashboardUrl = 'https://dashboard.shopifree.app/orders'; // TODO: URL real del dashboard

      const emailResults = await sendOrderConfirmationEmailsClient(
        docRef.id,
        orderData,
        storeId,
        storeUrl,
        dashboardUrl
      );

      console.log(`[Orders] 📧 Emails enviados - Cliente: ${emailResults.customerSent ? '✅' : '❌'}, Admin: ${emailResults.adminSent ? '✅' : '❌'}`);
    } catch (emailError) {
      // NO fallar el pedido si los emails fallan
      console.error('[Orders] ⚠️ Error enviando emails de confirmación:', emailError);
      console.error('[Orders] ⚠️ El pedido se creó correctamente, pero los emails fallaron');
    }

    return docRef;
  } catch (error) {
    console.error('[Orders] ❌ Error creating order:', error);
    console.error('[Orders] ❌ Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      code: (error as any)?.code || 'Unknown',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    });
    // NO lanzar error para no romper el flujo del checkout
    return null;
  }
}

/**
 * Función auxiliar para traducir métodos de envío
 */
export function translateShippingMethod(method: string, language: string = 'es'): string {
  const translations: Record<string, Record<string, string>> = {
    es: {
      'pickup': 'Recojo en tienda',
      'standard': 'Envío estándar',
      'express': 'Envío express'
    },
    en: {
      'pickup': 'Store pickup',
      'standard': 'Standard shipping',
      'express': 'Express shipping'
    },
    pt: {
      'pickup': 'Retirada na loja',
      'standard': 'Envio padrão',
      'express': 'Envio expresso'
    }
  };
  return translations[language]?.[method] || translations['es']?.[method] || method;
}

/**
 * Función auxiliar para traducir métodos de pago
 */
export function translatePaymentMethod(method: string, language: string = 'es'): string {
  const translations: Record<string, Record<string, string>> = {
    es: {
      'cash': 'Efectivo contra entrega',
      'card': 'Tarjeta con el repartidor',
      'transfer': 'Transferencia móvil',
      'mercadopago': 'Pago online (MercadoPago)',
      'culqi': 'Pago online (Culqi)',
      'paypal': 'Pago online (PayPal)',
      'online_payment': 'Pago online'
    },
    en: {
      'cash': 'Cash on delivery',
      'card': 'Card with delivery',
      'transfer': 'Mobile transfer',
      'mercadopago': 'Online payment (MercadoPago)',
      'culqi': 'Online payment (Culqi)',
      'paypal': 'Online payment (PayPal)',
      'online_payment': 'Online payment'
    },
    pt: {
      'cash': 'Dinheiro na entrega',
      'card': 'Cartão com entregador',
      'transfer': 'Transferência móvel',
      'mercadopago': 'Pagamento online (MercadoPago)',
      'culqi': 'Pagamento online (Culqi)',
      'paypal': 'Pagamento online (PayPal)',
      'online_payment': 'Pagamento online'
    }
  };
  return translations[language]?.[method] || translations['es']?.[method] || method;
}

/**
 * Translations for WhatsApp messages
 */
const whatsappTranslations = {
  es: {
    greeting: (storeName: string) => `Hola! Me interesa realizar un pedido desde ${storeName}:\n\n`,
    order: 'PEDIDO',
    products: 'PRODUCTOS',
    quantity: 'Cantidad',
    customerData: 'DATOS DEL CLIENTE',
    name: 'Nombre',
    email: 'Email',
    phone: 'Telefono',
    shipping: 'ENVIO',
    method: 'Metodo',
    address: 'Direccion',
    payment: 'PAGO',
    summary: 'RESUMEN',
    subtotal: 'Subtotal',
    shippingCost: 'Envío',
    discount: 'Descuento',
    total: 'Total',
    notes: 'NOTAS',
    deliveryData: 'DATOS DE ENTREGA',
    deliveryMethod: 'Método',
    deliveryAddress: 'Dirección',
    status: 'Estado',
    paid: 'PAGADO',
    pending: 'PENDIENTE DE PAGO',
    confirmation: '¿Podrías confirmarme los detalles y tiempos de entrega?'
  },
  en: {
    greeting: (storeName: string) => `Hello! I'm interested in placing an order from ${storeName}:\n\n`,
    order: 'ORDER',
    products: 'PRODUCTS',
    quantity: 'Quantity',
    customerData: 'CUSTOMER DATA',
    name: 'Name',
    email: 'Email',
    phone: 'Phone',
    shipping: 'SHIPPING',
    method: 'Method',
    address: 'Address',
    payment: 'PAYMENT',
    summary: 'SUMMARY',
    subtotal: 'Subtotal',
    shippingCost: 'Shipping',
    discount: 'Discount',
    total: 'Total',
    notes: 'NOTES',
    deliveryData: 'DELIVERY DATA',
    deliveryMethod: 'Method',
    deliveryAddress: 'Address',
    status: 'Status',
    paid: 'PAID',
    pending: 'PENDING PAYMENT',
    confirmation: 'Could you confirm the details and delivery times?'
  },
  pt: {
    greeting: (storeName: string) => `Olá! Estou interessado em fazer um pedido de ${storeName}:\n\n`,
    order: 'PEDIDO',
    products: 'PRODUTOS',
    quantity: 'Quantidade',
    customerData: 'DADOS DO CLIENTE',
    name: 'Nome',
    email: 'Email',
    phone: 'Telefone',
    shipping: 'ENVIO',
    method: 'Método',
    address: 'Endereço',
    payment: 'PAGAMENTO',
    summary: 'RESUMO',
    subtotal: 'Subtotal',
    shippingCost: 'Envio',
    discount: 'Desconto',
    total: 'Total',
    notes: 'NOTAS',
    deliveryData: 'DADOS DE ENTREGA',
    deliveryMethod: 'Método',
    deliveryAddress: 'Endereço',
    status: 'Status',
    paid: 'PAGO',
    pending: 'PAGAMENTO PENDENTE',
    confirmation: 'Você poderia confirmar os detalhes e os prazos de entrega?'
  }
};

/**
 * Generar mensaje de WhatsApp con ID del pedido
 */
export function generateWhatsAppMessageWithId(
  orderData: OrderData,
  orderId: string | null,
  storeInfo: any,
  language: string = 'es'
): { message: string; phone: string | null } {
  const storeName = storeInfo?.storeName || 'Tienda';
  const whatsappPhone = storeInfo?.socialMedia?.whatsapp || storeInfo?.phone;
  const t = whatsappTranslations[language as keyof typeof whatsappTranslations] || whatsappTranslations.es;

  let message = t.greeting(storeName);

  // Agregar ID del pedido si existe
  if (orderId) {
    message += `${t.order} #${orderId.slice(-6).toUpperCase()}\n\n`;
  }

  // Agregar productos (sin emojis problemáticos)
  message += `${t.products}:\n`;
  orderData.items.forEach((item, index) => {
    const itemTotal = (item.variant?.price || item.price) * item.quantity;
    message += `${index + 1}. ${item.name}`;
    if (item.variant) {
      message += ` (${item.variant.name})`;
    }
    message += `\n   ${t.quantity}: ${item.quantity} x ${formatPrice(item.variant?.price || item.price, orderData.currency)} = ${formatPrice(itemTotal, orderData.currency)}\n`;
  });

  // Agregar información del cliente
  message += `\n${t.customerData}:\n`;
  message += `${t.name}: ${orderData.customer.fullName}\n`;
  message += `${t.email}: ${orderData.customer.email}\n`;
  message += `${t.phone}: ${orderData.customer.phone}\n`;

  // Agregar información de envío
  message += `\n${t.shipping}:\n`;
  message += `${t.method}: ${translateShippingMethod(orderData.shipping.method, language)}\n`;
  if (orderData.shipping.address) {
    message += `${t.address}: ${orderData.shipping.address}\n`;
  }

  // Agregar información de pago
  message += `\n${t.payment}:\n`;
  message += `${t.method}: ${translatePaymentMethod(orderData.payment.method, language)}\n`;

  // Agregar totales
  message += `\n${t.summary}:\n`;
  message += `${t.subtotal}: ${formatPrice(orderData.totals.subtotal, orderData.currency)}\n`;
  message += `${t.shippingCost}: ${formatPrice(orderData.totals.shipping, orderData.currency)}\n`;

  if (orderData.discount && orderData.discount > 0) {
    message += `${t.discount}: -${formatPrice(orderData.discount, orderData.currency)}\n`;
  }

  message += `*${t.total}: ${formatPrice(orderData.totals.total, orderData.currency)}*\n`;

  // Agregar notas si las hay
  if (orderData.payment.notes?.trim()) {
    message += `\n📝 *${t.notes}:*\n${orderData.payment.notes}\n`;
  }

  return { message, phone: whatsappPhone };
}

/**
 * Generar mensaje completo de WhatsApp para página de confirmación
 * Incluye toda la información del pedido para pagos ya confirmados
 */
export function generateConfirmationWhatsAppMessage(
  orderData: OrderData,
  orderId: string,
  isPaid: boolean = false,
  paymentId?: string,
  language: string = 'es'
): string {
  const t = whatsappTranslations[language as keyof typeof whatsappTranslations] || whatsappTranslations.es;

  const greetings = {
    es: '¡Hola! Acabo de realizar un pedido:\n\n',
    en: 'Hello! I just placed an order:\n\n',
    pt: 'Olá! Acabei de fazer um pedido:\n\n'
  };

  let message = greetings[language as keyof typeof greetings] || greetings.es;

  // Agregar ID del pedido
  message += `${t.order} #${orderId.slice(-6).toUpperCase()}\n`;
  if (paymentId) {
    const paymentLabels = {
      es: 'ID de Pago',
      en: 'Payment ID',
      pt: 'ID de Pagamento'
    };
    message += `${paymentLabels[language as keyof typeof paymentLabels] || paymentLabels.es}: ${paymentId}\n`;
  }
  message += `${t.status}: ${isPaid ? `✅ ${t.paid}` : `⏳ ${t.pending}`}\n\n`;

  // Agregar productos
  message += `${t.products}:\n`;
  orderData.items.forEach((item, index) => {
    const itemTotal = (item.variant?.price || item.price) * item.quantity;
    message += `${index + 1}. ${item.name}`;
    if (item.variant) {
      message += ` (${item.variant.name})`;
    }
    message += `\n   ${t.quantity}: ${item.quantity} x ${formatPrice(item.variant?.price || item.price, orderData.currency)} = ${formatPrice(itemTotal, orderData.currency)}\n`;
  });

  // Agregar información del cliente
  message += `\n${t.deliveryData}:\n`;
  message += `${t.name}: ${orderData.customer.fullName}\n`;
  message += `${t.email}: ${orderData.customer.email}\n`;
  const phoneLabels = {
    es: 'Teléfono',
    en: 'Phone',
    pt: 'Telefone'
  };
  message += `${phoneLabels[language as keyof typeof phoneLabels] || phoneLabels.es}: ${orderData.customer.phone}\n`;

  // Agregar información de envío
  const shippingLabels = {
    es: 'ENVÍO',
    en: 'SHIPPING',
    pt: 'ENVIO'
  };
  message += `\n${shippingLabels[language as keyof typeof shippingLabels] || shippingLabels.es}:\n`;
  message += `${t.deliveryMethod}: ${translateShippingMethod(orderData.shipping.method, language)}\n`;
  if (orderData.shipping.address) {
    message += `${t.deliveryAddress}: ${orderData.shipping.address}\n`;
  }

  // Agregar información de pago
  message += `\n${t.payment}:\n`;
  message += `${t.method}: ${translatePaymentMethod(orderData.payment.method, language)}\n`;
  message += `${t.status}: ${isPaid ? `✅ ${t.paid}` : `⏳ ${t.pending}`}\n`;

  // Agregar totales
  message += `\n${t.summary}:\n`;
  message += `${t.subtotal}: ${formatPrice(orderData.totals.subtotal, orderData.currency)}\n`;
  message += `${t.shippingCost}: ${formatPrice(orderData.totals.shipping, orderData.currency)}\n`;

  if (orderData.discount && orderData.discount > 0) {
    message += `${t.discount}: -${formatPrice(orderData.discount, orderData.currency)}\n`;
  }

  message += `*${t.total}: ${formatPrice(orderData.totals.total, orderData.currency)}*\n`;

  // Agregar notas si las hay
  if (orderData.payment.notes?.trim()) {
    message += `\n📝 *${t.notes}:*\n${orderData.payment.notes}\n`;
  }

  message += `\n${t.confirmation}`;

  return message;
}

/**
 * Generar mensaje de WhatsApp para productos individuales (desde página de producto)
 */
export function generateProductWhatsAppMessage(
  product: any,
  storeInfo: any,
  selectedVariant: any,
  quantity: number,
  language: string = 'es'
): string {
  const productMessages = {
    es: {
      greeting: '¡Hola! 👋',
      interested: (storeName: string) => `Estoy interesado/a en este producto de ${storeName}:`,
      price: 'Precio',
      variant: 'Variante',
      quantity: 'Cantidad',
      question: '¿Podrías darme más información sobre disponibilidad y proceso de compra?',
      thanks: '¡Gracias!'
    },
    en: {
      greeting: 'Hello! 👋',
      interested: (storeName: string) => `I'm interested in this product from ${storeName}:`,
      price: 'Price',
      variant: 'Variant',
      quantity: 'Quantity',
      question: 'Could you give me more information about availability and purchasing process?',
      thanks: 'Thank you!'
    },
    pt: {
      greeting: 'Olá! 👋',
      interested: (storeName: string) => `Estou interessado neste produto de ${storeName}:`,
      price: 'Preço',
      variant: 'Variante',
      quantity: 'Quantidade',
      question: 'Você poderia me dar mais informações sobre disponibilidade e processo de compra?',
      thanks: 'Obrigado!'
    }
  };

  const t = productMessages[language as keyof typeof productMessages] || productMessages.es;
  const productUrl = typeof window !== 'undefined' ? window.location.href : '';
  const price = selectedVariant ? selectedVariant.price : product.price;
  const currency = storeInfo.currency || 'USD';
  const formattedPrice = formatPrice(price, currency);

  // Obtener información de variantes seleccionadas
  let variantText = '';
  if (selectedVariant) {
    variantText = `\n📋 ${t.variant}: ${selectedVariant.value || selectedVariant.name}`;
  }

  const message = `${t.greeting}
${t.interested(storeInfo.storeName)}
🛍️ *${product.name}*
💰 ${t.price}: ${formattedPrice}${variantText}
📦 ${t.quantity}: ${quantity}
${productUrl}
${t.question}
${t.thanks}`;

  return encodeURIComponent(message);
}