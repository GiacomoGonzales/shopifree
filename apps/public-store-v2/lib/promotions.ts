import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Tipos de promociones (mismo que dashboard)
export interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: 'price_discount' | 'percentage' | 'buy_x_get_y';
  discountValue: number;
  status: 'active' | 'paused' | 'expired' | 'scheduled';
  startDate: string;
  endDate: string;
  targetType: 'all_products' | 'specific_products' | 'categories' | 'brands';
  targetIds: string[];
  priority: number;
  showBadge: boolean;
  totalUses: number;
  totalRevenue: number;
}

/**
 * Obtener promociones activas para un producto específico
 */
export async function getActivePromotionsForProduct(storeId: string, productId: string): Promise<Promotion[]> {
  console.log('🚀 [Promotions] Starting fetch for:', { storeId, productId });

  const db = getFirebaseDb();
  if (!db) {
    console.warn('❌ [Promotions] Firebase not initialized');
    return [];
  }

  try {
    console.log('📡 [Promotions] Fetching active promotions for product:', productId);

    const promotionsRef = collection(db, 'stores', storeId, 'promotions');
    console.log('📂 [Promotions] Collection path:', `stores/${storeId}/promotions`);

    const q = query(
      promotionsRef,
      where('status', '==', 'active'),
      orderBy('priority', 'desc')
    );

    const querySnapshot = await getDocs(q);
    console.log('📄 [Promotions] Query executed, docs found:', querySnapshot.size);

    const now = new Date().toISOString();
    console.log('⏰ [Promotions] Current time:', now);

    const activePromotions: Promotion[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      console.log('📋 [Promotions] Processing promotion:', {
        id: doc.id,
        name: data.name,
        targetType: data.targetType,
        targetIds: data.targetIds,
        startDate: data.startDate,
        endDate: data.endDate
      });

      // Verificar que esté dentro del rango de fechas
      const withinDateRange = now >= data.startDate && now <= data.endDate;
      console.log('📅 [Promotions] Date check:', { withinDateRange, now, startDate: data.startDate, endDate: data.endDate });

      if (withinDateRange) {
        // Verificar si el producto está incluido
        const isTargeted =
          data.targetType === 'all_products' ||
          (data.targetType === 'specific_products' && data.targetIds.includes(productId));

        console.log('🎯 [Promotions] Target check:', {
          isTargeted,
          targetType: data.targetType,
          productId,
          targetIds: data.targetIds,
          includesProduct: data.targetIds?.includes(productId)
        });

        if (isTargeted) {
          activePromotions.push({
            id: doc.id,
            name: data.name,
            description: data.description || '',
            type: data.type,
            discountValue: data.discountValue,
            status: 'active',
            startDate: data.startDate,
            endDate: data.endDate,
            targetType: data.targetType,
            targetIds: data.targetIds || [],
            priority: data.priority || 0,
            showBadge: data.showBadge !== false,
            totalUses: data.totalUses || 0,
            totalRevenue: data.totalRevenue || 0
          });
        }
      }
    });

    console.log('✅ [Promotions] Found active promotions:', activePromotions.length, activePromotions);
    return activePromotions.sort((a, b) => b.priority - a.priority);

  } catch (error) {
    console.error('❌ [Promotions] Error fetching promotions:', error);
    return [];
  }
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