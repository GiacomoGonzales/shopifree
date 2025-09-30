import { collection, query, where, getDocs } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Tipos de cupones (espejo del dashboard)
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
}

export interface CouponValidationResult {
  valid: boolean;
  coupon?: Coupon;
  error?: string;
  discount?: {
    amount: number;
    type: 'percentage' | 'fixed_amount' | 'free_shipping';
  };
}

/**
 * Validar un cupón de descuento
 */
export async function validateCoupon(
  storeId: string, 
  couponCode: string,
  subtotal: number = 0
): Promise<CouponValidationResult> {
  const db = getFirebaseDb();
  if (!db) {
    return { valid: false, error: 'Sistema no disponible' };
  }

  if (!couponCode.trim()) {
    return { valid: false, error: 'Ingresa un código de cupón' };
  }

  try {
    console.log('[Coupons] 🔍 Validating coupon:', couponCode, 'for store:', storeId);
    
    const couponsRef = collection(db, 'stores', storeId, 'coupons');
    const q = query(couponsRef, where('code', '==', couponCode.toUpperCase()));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return { valid: false, error: 'Cupón no válido' };
    }

    const couponDoc = querySnapshot.docs[0];
    const coupon = { id: couponDoc.id, ...couponDoc.data() } as Coupon;

    console.log('[Coupons] 📄 Found coupon:', coupon);

    // Verificar estado
    if (coupon.status !== 'active') {
      if (coupon.status === 'expired') {
        return { valid: false, error: 'Cupón expirado' };
      }
      if (coupon.status === 'scheduled') {
        return { valid: false, error: 'Cupón aún no disponible' };
      }
    }

    // Verificar fechas
    const now = new Date();
    const startDate = new Date(coupon.startDate);
    const endDate = new Date(coupon.endDate);

    if (now < startDate) {
      return { valid: false, error: 'Cupón aún no disponible' };
    }

    if (now > endDate) {
      return { valid: false, error: 'Cupón expirado' };
    }

    // Verificar límite de usos
    if (coupon.totalUses >= coupon.maxUses) {
      return { valid: false, error: 'Cupón agotado' };
    }

    // Calcular descuento
    let discount = { amount: 0, type: coupon.type as 'percentage' | 'fixed_amount' | 'free_shipping' };

    if (coupon.type === 'percentage') {
      discount.amount = Math.round((subtotal * coupon.value) / 100 * 100) / 100;
    } else if (coupon.type === 'fixed_amount') {
      discount.amount = Math.min(coupon.value, subtotal); // No puede ser mayor al subtotal
    } else if (coupon.type === 'free_shipping') {
      discount.amount = 0; // Se maneja en el checkout
    }

    console.log('[Coupons] ✅ Coupon valid, discount:', discount);

    return {
      valid: true,
      coupon,
      discount
    };

  } catch (error) {
    console.error('[Coupons] ❌ Error validating coupon:', error);
    return { valid: false, error: 'Error al validar cupón' };
  }
}

/**
 * Aplicar descuento de cupón al total del carrito
 */
export function applyCouponDiscount(
  subtotal: number,
  shippingCost: number,
  coupon: Coupon
): { newSubtotal: number; newShipping: number; discountAmount: number } {
  let discountAmount = 0;
  let newSubtotal = subtotal;
  let newShipping = shippingCost;

  if (coupon.type === 'percentage') {
    discountAmount = Math.round((subtotal * coupon.value) / 100 * 100) / 100;
    newSubtotal = subtotal - discountAmount;
  } else if (coupon.type === 'fixed_amount') {
    discountAmount = Math.min(coupon.value, subtotal);
    newSubtotal = subtotal - discountAmount;
  } else if (coupon.type === 'free_shipping') {
    discountAmount = shippingCost;
    newShipping = 0;
  }

  return {
    newSubtotal: Math.max(0, newSubtotal),
    newShipping: Math.max(0, newShipping),
    discountAmount
  };
}

