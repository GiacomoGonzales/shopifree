import { collection, addDoc, query, where, getDocs, serverTimestamp, doc, updateDoc, increment } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

export interface CustomerData {
  id?: string;
  email: string;
  fullName: string;
  phone: string;
  totalOrders: number;
  totalSpent: number;
  currency: string;
  createdAt?: any;
  updatedAt?: any;
  lastOrderAt?: any;
  // 🆕 Campos para checkout progresivo y carrito abandonado
  checkoutStepReached?: number; // Último paso completado
  lastActiveAt?: any; // Última actividad en el checkout
  abandonedCart?: {
    items: any[];
    subtotal: number;
    currency: string;
    abandonedAt: any;
    emailSent?: boolean;
    reminderCount?: number;
  } | null;
  // 🆕 Información progresiva del checkout
  shippingAddress?: {
    address: string;
    city: string;
    zipCode?: string;
    lat?: number | null;
    lng?: number | null;
    method?: 'standard' | 'express' | 'pickup';
  } | null;
  preferences?: {
    paymentMethod?: string;
    preferredPickupLocation?: string;
  } | null;
}

/**
 * Buscar cliente existente por email o teléfono
 */
export async function findExistingCustomer(
  storeId: string,
  email: string,
  phone: string
): Promise<CustomerData | null> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Customers] Firebase not initialized');
    return null;
  }

  try {
    const customersRef = collection(db, 'stores', storeId, 'customers');

    // Buscar por email o teléfono
    const emailQuery = query(customersRef, where('email', '==', email));
    const phoneQuery = query(customersRef, where('phone', '==', phone));

    const [emailResults, phoneResults] = await Promise.all([
      getDocs(emailQuery),
      getDocs(phoneQuery)
    ]);

    // Priorizar coincidencia por email
    if (!emailResults.empty) {
      const doc = emailResults.docs[0];
      return { id: doc.id, ...doc.data() } as CustomerData;
    }

    // Si no hay por email, buscar por teléfono
    if (!phoneResults.empty) {
      const doc = phoneResults.docs[0];
      return { id: doc.id, ...doc.data() } as CustomerData;
    }

    return null;
  } catch (error) {
    console.error('[Customers] Error finding customer:', error);
    return null;
  }
}

/**
 * Crear nuevo cliente automáticamente
 */
export async function createCustomer(
  storeId: string,
  customerData: Omit<CustomerData, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string | null> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Customers] Firebase not initialized');
    return null;
  }

  try {
    const customersRef = collection(db, 'stores', storeId, 'customers');

    const newCustomer = {
      ...customerData,
      displayName: customerData.fullName, // Mapear fullName a displayName para el dashboard
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('🔍 [Customers] Final customer object to save in Firestore:', newCustomer);
    const docRef = await addDoc(customersRef, newCustomer);
    console.log('[Customers] Customer created successfully:', docRef.id);

    return docRef.id;
  } catch (error) {
    console.error('[Customers] Error creating customer:', error);
    return null;
  }
}

/**
 * Actualizar estadísticas del cliente (pedidos y gasto total)
 */
export async function updateCustomerStats(
  storeId: string,
  customerId: string,
  orderTotal: number,
  currency: string
): Promise<void> {
  const db = getFirebaseDb();
  if (!db || !customerId) return;

  try {
    const customerRef = doc(db, 'stores', storeId, 'customers', customerId);

    await updateDoc(customerRef, {
      totalOrders: increment(1),
      totalSpent: increment(orderTotal),
      currency: currency,
      lastOrderAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('[Customers] Customer stats updated:', { customerId, orderTotal });
  } catch (error) {
    console.error('[Customers] Error updating customer stats:', error);
  }
}

/**
 * 🆕 CREAR O ACTUALIZAR CLIENTE EN PASO 1 (Datos básicos)
 */
export async function createOrUpdateCustomerStep1(
  storeId: string,
  email: string,
  fullName: string,
  phone: string,
  currency: string,
  cartItems: any[] = [],
  cartSubtotal: number = 0
): Promise<string | null> {
  console.log('🔍 [Customers] createOrUpdateCustomerStep1 called with:', {
    email,
    fullName,
    phone,
    currency
  });
  try {
    // Buscar cliente existente
    let customer = await findExistingCustomer(storeId, email, phone);

    if (customer) {
      // Cliente existe, actualizar datos básicos y marcar actividad
      console.log('[Customers] Updating existing customer step 1:', customer.id);
      const customerRef = doc(getFirebaseDb()!, 'stores', storeId, 'customers', customer.id!);

      const updateData = {
        email,
        fullName,
        displayName: fullName, // Mapear fullName a displayName para el dashboard
        phone,
        checkoutStepReached: 1,
        lastActiveAt: serverTimestamp(),
        // Guardar carrito por si lo abandona
        abandonedCart: {
          items: cartItems,
          subtotal: cartSubtotal,
          currency,
          abandonedAt: serverTimestamp(),
          emailSent: false,
          reminderCount: 0
        },
        updatedAt: serverTimestamp()
      };

      console.log('🔍 [Customers] Updating existing customer with data:', updateData);
      await updateDoc(customerRef, updateData);

      return customer.id!;
    } else {
      // Cliente nuevo, crear con datos básicos
      console.log('[Customers] Creating new customer step 1');

      const newCustomerData = {
        email,
        fullName,
        phone,
        totalOrders: 0, // Aún no ha completado orden
        orderCount: 0,  // Campo para el dashboard
        totalSpent: 0,
        currency,
        checkoutStepReached: 1,
        lastActiveAt: serverTimestamp(),
        abandonedCart: {
          items: cartItems,
          subtotal: cartSubtotal,
          currency,
          abandonedAt: serverTimestamp(),
          emailSent: false,
          reminderCount: 0
        }
      };

      console.log('🔍 [Customers] Creating new customer with data:', newCustomerData);
      const customerId = await createCustomer(storeId, newCustomerData);
      return customerId;
    }
  } catch (error) {
    console.error('[Customers] Error in step 1:', error);
    return null;
  }
}

/**
 * 🆕 ACTUALIZAR CLIENTE EN PASO 2 (Dirección y envío)
 */
export async function updateCustomerStep2(
  storeId: string,
  customerId: string,
  shippingData: {
    address: string;
    city: string;
    zipCode?: string;
    lat?: number | null;
    lng?: number | null;
    method: 'standard' | 'express' | 'pickup';
  }
): Promise<void> {
  if (!customerId) return;

  try {
    const customerRef = doc(getFirebaseDb()!, 'stores', storeId, 'customers', customerId);

    await updateDoc(customerRef, {
      checkoutStepReached: 2,
      lastActiveAt: serverTimestamp(),
      shippingAddress: shippingData,
      updatedAt: serverTimestamp()
    });

    console.log('[Customers] Updated customer step 2:', customerId);
  } catch (error) {
    console.error('[Customers] Error updating step 2:', error);
  }
}

/**
 * 🆕 ACTUALIZAR CLIENTE EN PASO 3 (Pago y preferencias)
 */
export async function updateCustomerStep3(
  storeId: string,
  customerId: string,
  paymentData: {
    paymentMethod: string;
    preferredPickupLocation?: string;
    notes?: string;
  }
): Promise<void> {
  if (!customerId) return;

  try {
    const customerRef = doc(getFirebaseDb()!, 'stores', storeId, 'customers', customerId);

    await updateDoc(customerRef, {
      checkoutStepReached: 3,
      lastActiveAt: serverTimestamp(),
      preferences: {
        paymentMethod: paymentData.paymentMethod,
        preferredPickupLocation: paymentData.preferredPickupLocation
      },
      updatedAt: serverTimestamp()
    });

    console.log('[Customers] Updated customer step 3:', customerId);
  } catch (error) {
    console.error('[Customers] Error updating step 3:', error);
  }
}

/**
 * 🆕 FINALIZAR PEDIDO - Actualizar estadísticas y limpiar carrito abandonado
 */
export async function finalizeCustomerOrder(
  storeId: string,
  customerId: string,
  orderTotal: number,
  currency: string
): Promise<void> {
  if (!customerId) return;

  try {
    const customerRef = doc(getFirebaseDb()!, 'stores', storeId, 'customers', customerId);

    await updateDoc(customerRef, {
      totalOrders: increment(1),
      orderCount: increment(1), // Campo que espera el dashboard
      totalSpent: increment(orderTotal),
      currency: currency,
      lastOrderAt: serverTimestamp(),
      checkoutStepReached: 4, // Completado
      abandonedCart: null, // Limpiar carrito abandonado
      updatedAt: serverTimestamp()
    });

    console.log('[Customers] Order finalized for customer:', customerId);
  } catch (error) {
    console.error('[Customers] Error finalizing order:', error);
  }
}

/**
 * 🆕 OBTENER CLIENTES CON CARRITOS ABANDONADOS
 */
export async function getAbandonedCarts(
  storeId: string,
  hoursAgo: number = 24
): Promise<CustomerData[]> {
  const db = getFirebaseDb();
  if (!db) return [];

  try {
    const customersRef = collection(db, 'stores', storeId, 'customers');
    const cutoffTime = new Date(Date.now() - hoursAgo * 60 * 60 * 1000);

    // Query para clientes con carrito abandonado
    const q = query(
      customersRef,
      where('abandonedCart', '!=', null),
      where('checkoutStepReached', '<', 4)
    );

    const snapshot = await getDocs(q);
    const abandonedCarts: CustomerData[] = [];

    snapshot.forEach(doc => {
      const data = doc.data() as CustomerData;
      if (data.abandonedCart && data.lastActiveAt) {
        // Verificar que el carrito fue abandonado hace más del tiempo especificado
        const lastActive = data.lastActiveAt.toDate();
        if (lastActive < cutoffTime) {
          abandonedCarts.push({ id: doc.id, ...data });
        }
      }
    });

    return abandonedCarts;
  } catch (error) {
    console.error('[Customers] Error getting abandoned carts:', error);
    return [];
  }
}

/**
 * 🆕 MARCAR EMAIL DE CARRITO ABANDONADO COMO ENVIADO
 */
export async function markAbandonedCartEmailSent(
  storeId: string,
  customerId: string
): Promise<void> {
  try {
    const customerRef = doc(getFirebaseDb()!, 'stores', storeId, 'customers', customerId);

    await updateDoc(customerRef, {
      'abandonedCart.emailSent': true,
      'abandonedCart.reminderCount': increment(1),
      updatedAt: serverTimestamp()
    });

    console.log('[Customers] Marked abandoned cart email as sent:', customerId);
  } catch (error) {
    console.error('[Customers] Error marking email sent:', error);
  }
}

/**
 * Proceso completo: buscar o crear cliente y actualizar estadísticas (LEGACY - mantener compatibilidad)
 */
export async function processCustomerForOrder(
  storeId: string,
  email: string,
  fullName: string,
  phone: string,
  orderTotal: number,
  currency: string
): Promise<string | null> {
  // Usar el nuevo sistema progresivo como fallback
  return await createOrUpdateCustomerStep1(storeId, email, fullName, phone, currency);
}

/**
 * Guardar datos del cliente en localStorage para auto-completado
 */
export function saveCustomerToLocalStorage(email: string, fullName: string, phone: string): void {
  try {
    const customerData = { email, fullName, phone };
    localStorage.setItem('customer_data', JSON.stringify(customerData));
    console.log('[Customers] Customer data saved to localStorage');
  } catch (error) {
    console.error('[Customers] Error saving to localStorage:', error);
  }
}

/**
 * Cargar datos del cliente desde localStorage
 */
export function loadCustomerFromLocalStorage(): { email: string; fullName: string; phone: string } | null {
  try {
    const saved = localStorage.getItem('customer_data');
    if (saved) {
      return JSON.parse(saved);
    }
    return null;
  } catch (error) {
    console.error('[Customers] Error loading from localStorage:', error);
    return null;
  }
}

/**
 * Recuperar carrito abandonado de un cliente por email
 */
export async function recoverAbandonedCart(
  storeId: string,
  email: string
): Promise<any[] | null> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Customers] Firebase not initialized');
    return null;
  }

  try {
    const customersRef = collection(db, 'stores', storeId, 'customers');
    const emailQuery = query(customersRef, where('email', '==', email));
    const results = await getDocs(emailQuery);

    if (results.empty) {
      console.log('[Customers] No customer found with email:', email);
      return null;
    }

    const customerDoc = results.docs[0];
    const customerData = customerDoc.data();

    if (customerData.abandonedCart && customerData.abandonedCart.items && customerData.abandonedCart.items.length > 0) {
      console.log('[Customers] ✅ Carrito abandonado encontrado:', customerData.abandonedCart.items);
      return customerData.abandonedCart.items;
    }

    console.log('[Customers] No hay carrito abandonado para este cliente');
    return null;
  } catch (error) {
    console.error('[Customers] Error recovering abandoned cart:', error);
    return null;
  }
}