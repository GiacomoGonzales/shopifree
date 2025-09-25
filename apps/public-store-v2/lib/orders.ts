import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { CartItem } from './cart-context';
import { formatPrice } from './currency';
import { finalizeCustomerOrder, saveCustomerToLocalStorage } from './customers';

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
 * Generar mensaje de WhatsApp con ID del pedido
 */
export function generateWhatsAppMessageWithId(
  orderData: OrderData,
  orderId: string | null,
  storeInfo: any
): { message: string; phone: string | null } {
  const storeName = storeInfo?.storeName || 'Tienda';
  const whatsappPhone = storeInfo?.socialMedia?.whatsapp || storeInfo?.phone;

  let message = `Hola! Me interesa realizar un pedido desde ${storeName}:\n\n`;

  // Agregar ID del pedido si existe
  if (orderId) {
    message += `PEDIDO #${orderId.slice(-6).toUpperCase()}\n\n`;
  }

  // Agregar productos (sin emojis problemáticos)
  message += `PRODUCTOS:\n`;
  orderData.items.forEach((item, index) => {
    const itemTotal = (item.variant?.price || item.price) * item.quantity;
    message += `${index + 1}. ${item.name}`;
    if (item.variant) {
      message += ` (${item.variant.name})`;
    }
    message += `\n   Cantidad: ${item.quantity} x ${formatPrice(item.variant?.price || item.price, orderData.currency)} = ${formatPrice(itemTotal, orderData.currency)}\n`;
  });

  // Agregar información del cliente
  message += `\nDATOS DEL CLIENTE:\n`;
  message += `Nombre: ${orderData.customer.fullName}\n`;
  message += `Email: ${orderData.customer.email}\n`;
  message += `Telefono: ${orderData.customer.phone}\n`;

  // Agregar información de envío
  message += `\nENVIO:\n`;
  message += `Metodo: ${translateShippingMethod(orderData.shipping.method)}\n`;
  if (orderData.shipping.address) {
    message += `Direccion: ${orderData.shipping.address}\n`;
  }

  // Agregar información de pago
  message += `\nPAGO:\n`;
  message += `Metodo: ${translatePaymentMethod(orderData.payment.method)}\n`;

  // Agregar totales
  message += `\nRESUMEN:\n`;
  message += `Subtotal: ${formatPrice(orderData.totals.subtotal, orderData.currency)}\n`;
  message += `Envío: ${formatPrice(orderData.totals.shipping, orderData.currency)}\n`;

  if (orderData.discount && orderData.discount > 0) {
    message += `Descuento: -${formatPrice(orderData.discount, orderData.currency)}\n`;
  }

  message += `*Total: ${formatPrice(orderData.totals.total, orderData.currency)}*\n`;
  
  // Agregar notas si las hay
  if (orderData.payment.notes?.trim()) {
    message += `\n📝 *NOTAS:*\n${orderData.payment.notes}\n`;
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
  let message = `¡Hola! Acabo de realizar un pedido:\n\n`;

  // Agregar ID del pedido
  message += `PEDIDO #${orderId.slice(-6).toUpperCase()}\n`;
  if (paymentId) {
    message += `ID de Pago: ${paymentId}\n`;
  }
  message += `Estado: ${isPaid ? 'PAGADO' : 'PENDIENTE DE PAGO'}\n\n`;

  // Agregar productos
  message += `PRODUCTOS:\n`;
  orderData.items.forEach((item, index) => {
    const itemTotal = (item.variant?.price || item.price) * item.quantity;
    message += `${index + 1}. ${item.name}`;
    if (item.variant) {
      message += ` (${item.variant.name})`;
    }
    message += `\n   Cantidad: ${item.quantity} x ${formatPrice(item.variant?.price || item.price, orderData.currency)} = ${formatPrice(itemTotal, orderData.currency)}\n`;
  });

  // Agregar información del cliente
  message += `\nDATOS DE ENTREGA:\n`;
  message += `Nombre: ${orderData.customer.fullName}\n`;
  message += `Email: ${orderData.customer.email}\n`;
  message += `Teléfono: ${orderData.customer.phone}\n`;

  // Agregar información de envío
  message += `\nENVÍO:\n`;
  message += `Método: ${translateShippingMethod(orderData.shipping.method, language)}\n`;
  if (orderData.shipping.address) {
    message += `Dirección: ${orderData.shipping.address}\n`;
  }

  // Agregar información de pago
  message += `\nPAGO:\n`;
  message += `Método: ${translatePaymentMethod(orderData.payment.method, language)}\n`;
  message += `Estado: ${isPaid ? '✅ PAGADO' : '⏳ PENDIENTE'}\n`;

  // Agregar totales
  message += `\nRESUMEN:\n`;
  message += `Subtotal: ${formatPrice(orderData.totals.subtotal, orderData.currency)}\n`;
  message += `Envío: ${formatPrice(orderData.totals.shipping, orderData.currency)}\n`;

  if (orderData.discount && orderData.discount > 0) {
    message += `Descuento: -${formatPrice(orderData.discount, orderData.currency)}\n`;
  }

  message += `*Total: ${formatPrice(orderData.totals.total, orderData.currency)}*\n`;

  // Agregar notas si las hay
  if (orderData.payment.notes?.trim()) {
    message += `\n📝 *NOTAS:*\n${orderData.payment.notes}\n`;
  }

  message += `\n¿Podrías confirmarme los detalles y tiempos de entrega?`;

  return message;
}