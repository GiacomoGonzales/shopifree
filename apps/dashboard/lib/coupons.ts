import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Tipos de cupones
export interface Coupon {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number; // Porcentaje (25), monto fijo (50) o 0 para envío gratis
  status: 'active' | 'paused' | 'expired' | 'scheduled';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalUses: number;
  maxUses: number;
  usesPerCustomer: number;
  noExpiration?: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreateCouponData {
  name: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number;
  startDate: string;
  endDate: string;
  maxUses: number;
  usesPerCustomer: number;
  noExpiration?: boolean;
}

/**
 * Obtener todos los cupones de una tienda
 */
export async function getCoupons(storeId: string): Promise<Coupon[]> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Coupons] Firebase not initialized');
    return [];
  }

  try {
    console.log('[Coupons] Fetching coupons for storeId:', storeId);
    
    const couponsRef = collection(db, 'stores', storeId, 'coupons');
    console.log('[Coupons] Collection path:', `stores/${storeId}/coupons`);
    
    const q = query(couponsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);
    
    console.log('[Coupons] Query successful, found', querySnapshot.docs.length, 'coupons');
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Coupon[];
  } catch (error) {
    console.error('[Coupons] Error fetching coupons:', error);
    console.error('[Coupons] Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message,
      code: (error as any)?.code,
      storeId
    });
    return [];
  }
}

/**
 * Crear un nuevo cupón
 */
export async function createCoupon(storeId: string, couponData: CreateCouponData): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Coupons] Firebase not initialized');
    return false;
  }

  try {
    console.log('[Coupons] Creating coupon for storeId:', storeId);
    console.log('[Coupons] Coupon data:', couponData);
    
    const couponsRef = collection(db, 'stores', storeId, 'coupons');
    console.log('[Coupons] Collection path:', `stores/${storeId}/coupons`);
    
    // Determinar el estado basado en las fechas
    const now = new Date();
    const startDate = new Date(couponData.startDate);
    const endDate = new Date(couponData.endDate);
    
    let status: 'active' | 'expired' | 'scheduled';
    if (now < startDate) {
      status = 'scheduled';
    } else if (now > endDate) {
      status = 'expired';
    } else {
      status = 'active';
    }

    const newCoupon = {
      ...couponData,
      status,
      totalUses: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };

    console.log('[Coupons] Final coupon object:', newCoupon);
    
    const docRef = await addDoc(couponsRef, newCoupon);
    console.log('[Coupons] Coupon created successfully with ID:', docRef.id);
    return true;
  } catch (error) {
    console.error('[Coupons] Error creating coupon:', error);
    console.error('[Coupons] Error details:', {
      name: (error as any)?.name,
      message: (error as any)?.message,
      code: (error as any)?.code,
      storeId
    });
    return false;
  }
}

/**
 * Verificar si un código de cupón ya existe
 */
export async function couponCodeExists(storeId: string, code: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) return false;

  try {
    const couponsRef = collection(db, 'stores', storeId, 'coupons');
    const q = query(couponsRef, where('code', '==', code.toUpperCase()));
    const querySnapshot = await getDocs(q);
    
    return !querySnapshot.empty;
  } catch (error) {
    console.error('[Coupons] Error checking coupon code:', error);
    return false;
  }
}

/**
 * Actualizar el estado de un cupón (pausar/activar)
 */
export async function updateCouponStatus(storeId: string, couponId: string, status: 'active' | 'paused' | 'expired' | 'scheduled'): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Coupons] Firebase not initialized');
    return false;
  }

  try {
    console.log('[Coupons] Updating coupon status:', { storeId, couponId, status });

    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      status,
      updatedAt: serverTimestamp()
    });

    console.log('[Coupons] Coupon status updated successfully');
    return true;
  } catch (error) {
    console.error('[Coupons] Error updating coupon status:', error);
    return false;
  }
}

/**
 * Actualizar un cupón
 */
export async function updateCoupon(storeId: string, couponId: string, couponData: Partial<CreateCouponData>): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Coupons] Firebase not initialized');
    return false;
  }

  try {
    console.log('[Coupons] Updating coupon:', { storeId, couponId, couponData });

    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await updateDoc(couponRef, {
      ...couponData,
      updatedAt: serverTimestamp()
    });

    console.log('[Coupons] Coupon updated successfully');
    return true;
  } catch (error) {
    console.error('[Coupons] Error updating coupon:', error);
    return false;
  }
}

/**
 * Eliminar un cupón
 */
export async function deleteCoupon(storeId: string, couponId: string): Promise<boolean> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Coupons] Firebase not initialized');
    return false;
  }

  try {
    console.log('[Coupons] Deleting coupon:', { storeId, couponId });

    const couponRef = doc(db, 'stores', storeId, 'coupons', couponId);
    await deleteDoc(couponRef);

    console.log('[Coupons] Coupon deleted successfully');
    return true;
  } catch (error) {
    console.error('[Coupons] Error deleting coupon:', error);
    return false;
  }
}

/**
 * Calcular el estado automático de un cupón basado en fechas
 */
export function calculateCouponStatus(startDate: string, endDate: string, currentStatus?: string, noExpiration?: boolean): 'active' | 'expired' | 'scheduled' {
  const now = new Date();
  const start = new Date(startDate);

  // Si está pausado manualmente, mantener ese estado no debería cambiar automáticamente
  if (currentStatus === 'paused') {
    return 'paused' as any; // Mantener pausado
  }

  if (now < start) {
    return 'scheduled';
  } else if (noExpiration) {
    // Si no expira, solo puede estar activo (después de la fecha de inicio)
    return 'active';
  } else {
    const end = new Date(endDate);
    if (now > end) {
      return 'expired';
    } else {
      return 'active';
    }
  }
}

/**
 * Generar un código de cupón único
 */
export function generateCouponCode(baseName: string = ''): string {
  const prefix = baseName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}${suffix}`.slice(0, 12);
}

/**
 * 🆕 Obtener el conteo de usos de un cupón basado en pedidos reales
 * Esta función consulta los pedidos que tienen el cupón aplicado
 * @param storeId - ID de la tienda
 * @param couponId - ID del cupón
 * @returns Número de veces que se ha usado el cupón
 */
export async function getCouponUsageCount(storeId: string, couponId: string): Promise<number> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Coupons] Firebase not initialized');
    return 0;
  }

  try {
    console.log('[Coupons] 📊 Counting usage for coupon:', couponId);

    const ordersRef = collection(db, 'stores', storeId, 'orders');
    const q = query(ordersRef, where('appliedCoupon.id', '==', couponId));

    const querySnapshot = await getDocs(q);
    const count = querySnapshot.size;

    console.log('[Coupons] ✅ Usage count:', count);
    return count;

  } catch (error) {
    console.error('[Coupons] ❌ Error counting coupon usage:', error);
    return 0;
  }
}