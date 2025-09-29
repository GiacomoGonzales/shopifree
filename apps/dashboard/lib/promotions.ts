import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, serverTimestamp, Timestamp } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Tipos de promociones
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: 'price_discount' | 'percentage' | 'buy_x_get_y';
  discountValue: number; // Monto fijo (50) o porcentaje (25)
  status: 'active' | 'paused' | 'expired' | 'scheduled';
  startDate: string; // ISO date string
  endDate: string; // ISO date string
  noExpiration?: boolean; // Promoción sin fecha de expiración

  // Productos afectados
  targetType: 'all_products' | 'specific_products' | 'categories' | 'brands';
  targetIds: string[]; // IDs de productos, categorías o marcas

  // Configuración adicional
  priority: number; // Para resolver conflictos entre promociones
  showBadge: boolean; // Mostrar badge "Oferta" en tienda

  // Métricas
  totalUses: number;
  totalRevenue: number;

  // Metadata
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CreatePromotionData {
  name: string;
  description?: string;
  type: 'price_discount' | 'percentage' | 'buy_x_get_y';
  discountValue: number;
  startDate: string;
  endDate: string;
  noExpiration?: boolean;
  targetType: 'all_products' | 'specific_products' | 'categories' | 'brands';
  targetIds: string[];
  priority: number;
  showBadge: boolean;
}

/**
 * Obtener todas las promociones de una tienda
 */
export async function getPromotions(storeId: string): Promise<Promotion[]> {
  const db = getFirebaseDb();
  if (!db) {
    console.warn('[Promotions] Firebase not initialized');
    return [];
  }

  try {
    console.log('[Promotions] Fetching promotions for storeId:', storeId);

    const promotionsRef = collection(db, 'stores', storeId, 'promotions');
    const q = query(promotionsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    const promotions: Promotion[] = [];
    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Determinar status basado en fechas
      const now = new Date().toISOString();
      let status = data.status;
      if (status === 'active' || status === 'scheduled') {
        if (now < data.startDate) {
          status = 'scheduled';
        } else if (data.noExpiration) {
          // Si no expira, solo puede estar activa (después de la fecha de inicio)
          status = 'active';
        } else if (now > data.endDate) {
          status = 'expired';
        } else {
          status = 'active';
        }
      }

      promotions.push({
        id: doc.id,
        name: data.name,
        description: data.description || '',
        type: data.type,
        discountValue: data.discountValue,
        status,
        startDate: data.startDate,
        endDate: data.endDate,
        noExpiration: data.noExpiration || false,
        targetType: data.targetType,
        targetIds: data.targetIds || [],
        priority: data.priority || 0,
        showBadge: data.showBadge !== false, // default true
        totalUses: data.totalUses || 0,
        totalRevenue: data.totalRevenue || 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      });
    });

    console.log('[Promotions] Found promotions:', promotions.length);
    return promotions;

  } catch (error) {
    console.error('[Promotions] Error fetching promotions:', error);
    return [];
  }
}

/**
 * Crear nueva promoción
 */
export async function createPromotion(storeId: string, promotionData: CreatePromotionData): Promise<string> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');

  try {
    // Determinar status inicial basado en fechas
    const now = new Date().toISOString();
    let status = 'active';
    if (now < promotionData.startDate) {
      status = 'scheduled';
    } else if (promotionData.noExpiration) {
      // Si no expira, solo puede estar activa (después de la fecha de inicio)
      status = 'active';
    } else if (now > promotionData.endDate) {
      status = 'expired';
    }

    const promotionsRef = collection(db, 'stores', storeId, 'promotions');

    const docRef = await addDoc(promotionsRef, {
      ...promotionData,
      status,
      totalUses: 0,
      totalRevenue: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('[Promotions] Created promotion with ID:', docRef.id);
    return docRef.id;

  } catch (error) {
    console.error('[Promotions] Error creating promotion:', error);
    throw error;
  }
}

/**
 * Actualizar promoción
 */
export async function updatePromotion(storeId: string, promotionId: string, updates: Partial<CreatePromotionData>): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');

  try {
    const docRef = doc(db, 'stores', storeId, 'promotions', promotionId);
    await updateDoc(docRef, {
      ...updates,
      updatedAt: serverTimestamp()
    });

    console.log('[Promotions] Updated promotion:', promotionId);

  } catch (error) {
    console.error('[Promotions] Error updating promotion:', error);
    throw error;
  }
}

/**
 * Actualizar el estado de una promoción
 */
export async function updatePromotionStatus(storeId: string, promotionId: string, status: 'active' | 'paused' | 'expired' | 'scheduled'): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');

  try {
    const docRef = doc(db, 'stores', storeId, 'promotions', promotionId);
    await updateDoc(docRef, {
      status,
      updatedAt: serverTimestamp()
    });

    console.log('[Promotions] Updated promotion status:', promotionId, 'to', status);

  } catch (error) {
    console.error('[Promotions] Error updating promotion status:', error);
    throw error;
  }
}

/**
 * Eliminar promoción
 */
export async function deletePromotion(storeId: string, promotionId: string): Promise<void> {
  const db = getFirebaseDb();
  if (!db) throw new Error('Firebase not initialized');

  try {
    const docRef = doc(db, 'stores', storeId, 'promotions', promotionId);
    await deleteDoc(docRef);

    console.log('[Promotions] Deleted promotion:', promotionId);

  } catch (error) {
    console.error('[Promotions] Error deleting promotion:', error);
    throw error;
  }
}

/**
 * Obtener promociones activas para un producto específico
 */
export async function getActivePromotionsForProduct(storeId: string, productId: string): Promise<Promotion[]> {
  const allPromotions = await getPromotions(storeId);
  const now = new Date().toISOString();

  return allPromotions.filter(promotion => {
    // Solo promociones activas
    if (promotion.status !== 'active') return false;

    // Verificar que esté dentro del rango de fechas
    const withinDateRange = now >= promotion.startDate && (promotion.noExpiration || now <= promotion.endDate);
    if (!withinDateRange) return false;

    // Verificar si el producto está incluido
    if (promotion.targetType === 'all_products') return true;
    if (promotion.targetType === 'specific_products') {
      return promotion.targetIds.includes(productId);
    }

    // TODO: Implementar filtros por categorías y marcas
    return false;
  }).sort((a, b) => b.priority - a.priority); // Mayor prioridad primero
}

/**
 * Calcular precio con descuento aplicando la mejor promoción
 */
export function calculateDiscountedPrice(originalPrice: number, promotions: Promotion[]): {
  finalPrice: number;
  discount: number;
  appliedPromotion?: Promotion;
} {
  if (promotions.length === 0) {
    return { finalPrice: originalPrice, discount: 0 };
  }

  // Tomar la promoción de mayor prioridad
  const bestPromotion = promotions[0];
  let discount = 0;

  switch (bestPromotion.type) {
    case 'percentage':
      discount = (originalPrice * bestPromotion.discountValue) / 100;
      break;
    case 'price_discount':
      discount = Math.min(bestPromotion.discountValue, originalPrice);
      break;
    default:
      discount = 0;
  }

  const finalPrice = Math.max(0, originalPrice - discount);

  return {
    finalPrice,
    discount,
    appliedPromotion: bestPromotion
  };
}

/**
 * Verificar si un producto tiene promociones activas con badge
 */
export function hasPromotionBadge(promotions: Promotion[]): boolean {
  return promotions.some(promotion => promotion.showBadge);
}