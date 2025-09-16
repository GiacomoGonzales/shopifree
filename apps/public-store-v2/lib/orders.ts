import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';
import { CartItem } from './cart-context';
import { formatPrice } from './currency';

// Tipos compatibles con el dashboard existente
export interface OrderData {
  customer: {
    email: string;
    fullName: string;
    phone: string;
  };
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
export async function createOrder(storeId: string, orderData: OrderData) {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Orders] Firebase not initialized, skipping order creation');
    return null;
  }
  
  try {
    const ordersRef = collection(db, 'stores', storeId, 'orders');
    
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
      paymentType: (() => {
        // Mapear método legacy a nuevo tipo
        switch (orderData.payment.method) {
          case 'cash': return 'cash_on_delivery'
          case 'card': return 'card_on_delivery'
          case 'transfer': return 'mobile_transfer'
          default: return 'cash_on_delivery'
        }
      })(),
      paymentStatus: 'pending', // Todos los pedidos contra entrega empiezan pendientes
      paidAmount: 0, // Inicialmente no se ha pagado nada
      
      // Metadata requerida por dashboard
      storeId: storeId,
      userId: '', // No hay usuario autenticado en tienda pública
      
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
        whatsappPhone: orderData.whatsappPhone
      }),
      
      // Descuentos (si aplica)
      ...(orderData.discount && orderData.discount > 0 && {
        discount: orderData.discount,
        appliedCoupon: orderData.appliedCoupon
      })
    };
    
    console.log('[Orders] Creating order:', { storeId, checkoutMethod: orderData.checkoutMethod });
    const docRef = await addDoc(ordersRef, newOrder);
    console.log('[Orders] Order created successfully:', docRef.id);
    
    return docRef;
  } catch (error) {
    console.error('[Orders] Error creating order:', error);
    // NO lanzar error para no romper el flujo del checkout
    return null;
  }
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
  
  let message = `¡Hola! Me interesa realizar un pedido desde ${storeName}:\n\n`;
  
  // Agregar ID del pedido si existe
  if (orderId) {
    message += `🆔 *PEDIDO #${orderId.slice(-6).toUpperCase()}*\n\n`;
  }
  
  // Agregar productos
  message += `📦 *PRODUCTOS:*\n`;
  orderData.items.forEach((item, index) => {
    const itemTotal = (item.variant?.price || item.price) * item.quantity;
    message += `${index + 1}. ${item.name}`;
    if (item.variant) {
      message += ` (${item.variant.name})`;
    }
    message += `\n   Cantidad: ${item.quantity} x ${formatPrice(item.variant?.price || item.price, orderData.currency)} = ${formatPrice(itemTotal, orderData.currency)}\n`;
  });
  
  // Agregar información del cliente
  message += `\n👤 *DATOS DEL CLIENTE:*\n`;
  message += `Nombre: ${orderData.customer.fullName}\n`;
  message += `Email: ${orderData.customer.email}\n`;
  message += `Teléfono: ${orderData.customer.phone}\n`;
  
  // Agregar información de envío
  message += `\n🚚 *ENVÍO:*\n`;
  if (orderData.shipping.method === 'pickup') {
    message += `Método: Recojo en tienda\n`;
  } else {
    const methodName = orderData.shipping.method === 'express' ? 'Envío express' : 'Envío estándar';
    message += `Método: ${methodName}\n`;
    if (orderData.shipping.address) {
      message += `Dirección: ${orderData.shipping.address}\n`;
    }
  }
  
  // Agregar información de pago
  message += `\n💳 *PAGO:*\n`;
  message += `Método: ${orderData.payment.method}\n`;
  
  // Agregar totales
  message += `\n💰 *RESUMEN:*\n`;
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