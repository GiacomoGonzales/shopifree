import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Tipos de cupones
export interface Coupon {
  id: string;
  name: string;
  code: string;
  type: 'percentage' | 'fixed_amount' | 'free_shipping';
  value: number; // Porcentaje (25), monto fijo (50) o 0 para envío gratis
  status: 'active' | 'expired' | 'scheduled';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  totalUses: number;
  maxUses: number;
  usesPerCustomer: number;
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
 * Generar un código de cupón único
 */
export function generateCouponCode(baseName: string = ''): string {
  const prefix = baseName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
  const suffix = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `${prefix}${suffix}`.slice(0, 12);
}