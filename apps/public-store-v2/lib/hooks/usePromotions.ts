import { useState, useEffect, useMemo, useRef } from 'react';
import { getActivePromotionsForProduct, calculateDiscountedPrice, hasPromotionBadge, Promotion } from '../promotions';

interface PromotionData {
  originalPrice: number;
  finalPrice: number;
  discount: number;
  hasDiscountBadge: boolean;
  appliedPromotion?: Promotion;
  isLoading: boolean;
}

// Cache para evitar llamadas duplicadas
const promotionsCache = new Map<string, { data: Promotion[]; timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

/**
 * Hook para manejar promociones de productos de manera eficiente
 */
export function usePromotions(storeId: string | null, productId: string, originalPrice: number): PromotionData {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [loading, setLoading] = useState(false);
  const loadingRef = useRef(false);

  useEffect(() => {
    if (!storeId || !productId) {
      return;
    }

    const cacheKey = `${storeId}-${productId}`;
    const cached = promotionsCache.get(cacheKey);
    const now = Date.now();

    // Verificar cache válido
    if (cached && (now - cached.timestamp) < CACHE_DURATION) {
      setPromotions(cached.data);
      return;
    }

    // Evitar llamadas duplicadas si ya está cargando
    if (loadingRef.current) {
      return;
    }

    let isMounted = true;
    loadingRef.current = true;
    setLoading(true);

    getActivePromotionsForProduct(storeId, productId)
      .then((result) => {
        if (isMounted) {
          setPromotions(result);
          // Actualizar cache
          promotionsCache.set(cacheKey, { data: result, timestamp: now });
        }
      })
      .catch((error) => {
        console.error('Error loading promotions:', error);
        if (isMounted) {
          setPromotions([]);
        }
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
          loadingRef.current = false;
        }
      });

    return () => {
      isMounted = false;
      loadingRef.current = false;
    };
  }, [storeId, productId]);

  const promotionData = useMemo(() => {
    const { finalPrice, discount, appliedPromotion } = calculateDiscountedPrice(originalPrice, promotions);

    return {
      originalPrice,
      finalPrice,
      discount,
      hasDiscountBadge: hasPromotionBadge(promotions),
      appliedPromotion,
      isLoading: loading
    };
  }, [originalPrice, promotions, loading]);

  return promotionData;
}