import { useState, useEffect, useMemo } from 'react';
import { getActivePromotionsForProduct, calculateDiscountedPrice, hasPromotionBadge, Promotion } from '../promotions';

interface PromotionData {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  hasDiscountBadge: boolean;
  appliedPromotion?: Promotion;
}

/**
 * Hook para manejar promociones de productos de manera eficiente
 */
export function usePromotions(storeId: string | null, productId: string, originalPrice: number): PromotionData {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log('🔍 usePromotions - Parameters:', { storeId, productId, originalPrice });

    if (!storeId || !productId) {
      console.log('❌ usePromotions - Missing storeId or productId');
      return;
    }

    let isMounted = true;
    setLoading(true);

    console.log('📡 usePromotions - Fetching promotions for:', { storeId, productId });

    getActivePromotionsForProduct(storeId, productId)
      .then((result) => {
        console.log('✅ usePromotions - Promotions received:', result);
        if (isMounted) {
          setPromotions(result);
        }
      })
      .catch((error) => {
        console.error('❌ usePromotions - Error loading promotions:', error);
        if (isMounted) {
          setPromotions([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [storeId, productId]);

  const promotionData = useMemo(() => {
    console.log('💰 usePromotions - Calculating prices:', { originalPrice, promotions });

    const { finalPrice, discount, appliedPromotion } = calculateDiscountedPrice(originalPrice, promotions);

    const result = {
      originalPrice,
      finalPrice,
      discount,
      hasDiscountBadge: hasPromotionBadge(promotions),
      appliedPromotion
    };

    console.log('💰 usePromotions - Price calculation result:', result);

    return result;
  }, [originalPrice, promotions]);

  return promotionData;
}