import { collection, getDocs, query, where, orderBy } from 'firebase/firestore';
import { getFirebaseDb } from './firebase';

// Tipos de badge para promociones
export type BadgeStyle = 'none' | 'badge' | 'ribbon';

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
  badgeStyle: BadgeStyle;
  totalUses: number;
  totalRevenue: number;
}

/**
 * Obtener promociones activas para un producto específico
 */
export async function getActivePromotionsForProduct(storeId: string, productId: string): Promise<Promotion[]> {

  const db = getFirebaseDb();
  if (!db) {
    return [];
  }

  try {

    const promotionsRef = collection(db, 'stores', storeId, 'promotions');

    const q = query(
      promotionsRef,
      where('status', '==', 'active'),
      orderBy('priority', 'desc')
    );

    const querySnapshot = await getDocs(q);

    const now = new Date().toISOString();

    const activePromotions: Promotion[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();

      // Verificar que esté dentro del rango de fechas
      const withinDateRange = now >= data.startDate && now <= data.endDate;

      if (withinDateRange) {
        // Verificar si el producto está incluido
        const isTargeted =
          data.targetType === 'all_products' ||
          (data.targetType === 'specific_products' && data.targetIds.includes(productId));


        if (isTargeted) {
          // Migración de showBadge (boolean) a badgeStyle (string)
          let badgeStyle: BadgeStyle = 'badge'; // default
          if (data.badgeStyle) {
            badgeStyle = data.badgeStyle;
          } else if (data.showBadge === false) {
            badgeStyle = 'none';
          } else if (data.showBadge === true) {
            badgeStyle = 'badge';
          }

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
            badgeStyle,
            totalUses: data.totalUses || 0,
            totalRevenue: data.totalRevenue || 0
          });
        }
      }
    });

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
  return promotions.some(promotion => promotion.badgeStyle !== 'none');
}

/**
 * Obtener el estilo de badge de la promoción con mayor prioridad
 */
export function getPromotionBadgeStyle(promotions: Promotion[]): BadgeStyle {
  const promotionWithBadge = promotions.find(p => p.badgeStyle !== 'none');
  return promotionWithBadge?.badgeStyle || 'none';
}