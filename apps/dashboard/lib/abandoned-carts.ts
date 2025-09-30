import { getFirebaseDb } from './firebase';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  Timestamp,
  orderBy,
  limit
} from 'firebase/firestore';

export interface AbandonedCartItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  image: string;
  price: number;
  quantity: number;
  currency: string;
  incomplete?: boolean;
}

export interface AbandonedCart {
  items: AbandonedCartItem[];
  abandonedAt: Timestamp;
  currency: string;
  subtotal: number;
  checkoutStepReached?: number;
  emailSent?: boolean;
  reminderCount?: number;
}

export interface CustomerWithAbandonedCart {
  id: string;
  email: string;
  displayName: string;
  fullName?: string;
  phone?: string;
  abandonedCart: AbandonedCart;
  createdAt: Timestamp;
  lastActiveAt: Timestamp;
  orderCount: number;
  storeId: string;
}

/**
 * Obtiene todos los clientes con carritos abandonados de una tienda
 * @param storeId ID de la tienda
 * @param hoursAgo Filtrar carritos abandonados hace X horas (por defecto 1 hora)
 * @returns Lista de clientes con carritos abandonados
 */
export async function getAbandonedCarts(
  storeId: string,
  hoursAgo: number = 1
): Promise<CustomerWithAbandonedCart[]> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firebase database not available');
    }

    // Ruta correcta: stores/{storeId}/customers
    const customersRef = collection(db, 'stores', storeId, 'customers');

    // Calcular timestamp de hace X horas (límite inferior)
    const cutoffTime = new Date();
    cutoffTime.setHours(cutoffTime.getHours() - hoursAgo);
    const cutoffTimestamp = Timestamp.fromDate(cutoffTime);

    // Obtener todos los clientes de la tienda
    // No podemos usar query compuesto en abandonedCart.items debido a limitaciones de Firestore
    const querySnapshot = await getDocs(customersRef);
    const abandonedCarts: CustomerWithAbandonedCart[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Verificar que tenga items en el carrito
      if (data.abandonedCart?.items && data.abandonedCart.items.length > 0) {
        // Verificar que el carrito fue abandonado DESPUÉS del tiempo límite (hace menos de X horas)
        const abandonedAt = data.abandonedCart.abandonedAt;
        if (abandonedAt && abandonedAt.toMillis() >= cutoffTimestamp.toMillis()) {
          abandonedCarts.push({
            id: doc.id,
            email: data.email,
            displayName: data.displayName || data.fullName || 'Cliente',
            fullName: data.fullName,
            phone: data.phone,
            abandonedCart: data.abandonedCart,
            createdAt: data.createdAt,
            lastActiveAt: data.lastActiveAt,
            orderCount: data.orderCount || 0,
            storeId: storeId
          });
        }
      }
    });

    // Ordenar por fecha de abandono (más reciente primero)
    abandonedCarts.sort((a, b) =>
      b.abandonedCart.abandonedAt.toMillis() - a.abandonedCart.abandonedAt.toMillis()
    );

    console.log(`[AbandonedCarts] Encontrados ${abandonedCarts.length} carritos abandonados para tienda ${storeId}`);
    return abandonedCarts;

  } catch (error) {
    console.error('[AbandonedCarts] Error al obtener carritos abandonados:', error);
    throw error;
  }
}

/**
 * Obtiene carritos abandonados que aún no han recibido email
 * @param storeId ID de la tienda
 * @param hoursAgo Filtrar carritos abandonados hace X horas
 * @returns Lista de clientes con carritos abandonados sin email enviado
 */
export async function getAbandonedCartsNotEmailed(
  storeId: string,
  hoursAgo: number = 1
): Promise<CustomerWithAbandonedCart[]> {
  try {
    const allCarts = await getAbandonedCarts(storeId, hoursAgo);

    // Filtrar solo los que no han recibido email o tienen reminderCount < 3
    const notEmailed = allCarts.filter(cart => {
      const emailSent = cart.abandonedCart.emailSent || false;
      const reminderCount = cart.abandonedCart.reminderCount || 0;

      return !emailSent || reminderCount < 3;
    });

    console.log(`[AbandonedCarts] ${notEmailed.length} carritos sin email de ${allCarts.length} totales`);
    return notEmailed;

  } catch (error) {
    console.error('[AbandonedCarts] Error al filtrar carritos sin email:', error);
    throw error;
  }
}

/**
 * Marca un carrito como "email enviado" e incrementa el contador
 * @param storeId ID de la tienda
 * @param customerId ID del cliente
 * @returns true si se actualizó correctamente
 */
export async function markCartEmailSent(storeId: string, customerId: string): Promise<boolean> {
  try {
    const db = getFirebaseDb();
    if (!db) {
      throw new Error('Firebase database not available');
    }

    // Ruta correcta: stores/{storeId}/customers/{customerId}
    const customerRef = doc(db, 'stores', storeId, 'customers', customerId);

    // Obtener el documento actual para leer reminderCount
    const customerSnap = await getDocs(query(collection(db, 'stores', storeId, 'customers'), where('__name__', '==', customerId)));
    const currentData = customerSnap.docs[0]?.data();
    const currentReminderCount = currentData?.abandonedCart?.reminderCount || 0;

    await updateDoc(customerRef, {
      'abandonedCart.emailSent': true,
      'abandonedCart.reminderCount': currentReminderCount + 1,
      'abandonedCart.lastEmailSentAt': Timestamp.now()
    });

    console.log(`[AbandonedCarts] Email marcado como enviado para cliente ${customerId}`);
    return true;

  } catch (error) {
    console.error('[AbandonedCarts] Error al marcar email como enviado:', error);
    return false;
  }
}

/**
 * Obtiene estadísticas de carritos abandonados
 * @param storeId ID de la tienda
 * @returns Estadísticas de carritos abandonados
 */
export async function getAbandonedCartStats(storeId: string) {
  try {
    const allCarts = await getAbandonedCarts(storeId, 24 * 7); // Última semana

    const totalCarts = allCarts.length;
    const emailsSent = allCarts.filter(c => c.abandonedCart.emailSent).length;
    const pendingEmails = totalCarts - emailsSent;

    const totalValue = allCarts.reduce((sum, cart) => sum + cart.abandonedCart.subtotal, 0);
    const averageValue = totalCarts > 0 ? totalValue / totalCarts : 0;

    // Agrupar por tiempo
    const last24h = allCarts.filter(c => {
      const hoursSince = (Date.now() - c.abandonedCart.abandonedAt.toMillis()) / (1000 * 60 * 60);
      return hoursSince <= 24;
    }).length;

    const last7days = totalCarts;

    return {
      totalCarts,
      emailsSent,
      pendingEmails,
      totalValue,
      averageValue,
      last24h,
      last7days
    };

  } catch (error) {
    console.error('[AbandonedCarts] Error al obtener estadísticas:', error);
    throw error;
  }
}

/**
 * Genera un cupón de descuento para recuperación de carrito
 * @param customerEmail Email del cliente
 * @param discountPercentage Porcentaje de descuento (por defecto 10%)
 * @returns Código del cupón generado
 */
export function generateRecoveryCoupon(
  customerEmail: string,
  discountPercentage: number = 10
): string {
  // Generar código único basado en email y timestamp
  const emailPrefix = customerEmail.substring(0, 5).toUpperCase().replace(/[^A-Z0-9]/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6).toUpperCase();

  return `VUELVE${emailPrefix}${randomSuffix}`;
}

/**
 * Calcula el valor de descuento para un carrito
 * @param subtotal Subtotal del carrito
 * @param discountPercentage Porcentaje de descuento
 * @returns Valor del descuento
 */
export function calculateDiscountValue(
  subtotal: number,
  discountPercentage: number
): number {
  return Math.round((subtotal * discountPercentage) / 100);
}
