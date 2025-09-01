'use client';

import { useState, useEffect } from 'react';
import { PublicProduct } from '../lib/products';
import { formatPrice } from '../lib/currency';

// Tipo para variantes con precio específico
export interface ProductVariant {
  id: string;
  name: string;
  value: string; // ej: "1kg", "7kg"
  price: number;
  stock: number;
  isAvailable: boolean;
}

interface ProductVariantsWithPricingProps {
  product: PublicProduct;
  storeInfo?: { currency?: string };
  onVariantChange: (variant: ProductVariant | null) => void;
}

export default function ProductVariantsWithPricing({ 
  product, 
  storeInfo, 
  onVariantChange 
}: ProductVariantsWithPricingProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [variants, setVariants] = useState<ProductVariant[]>([]);

  // Extraer variantes del producto
  useEffect(() => {
    // Buscar variantes en diferentes ubicaciones posibles
    let variantsData = null;
    
    // 1. Buscar en product.tags.variants (ubicación esperada)
    if (product.tags && product.tags.variants) {
      variantsData = product.tags.variants;
    }
    // 2. Buscar directamente en el producto (por si está mal mapeado)
    else if ((product as any).variants) {
      variantsData = (product as any).variants;
    }
    // 3. Buscar en metaFieldValues directamente (por si no se procesó bien)
    else if ((product as any).metaFieldValues && (product as any).metaFieldValues.variants) {
      variantsData = (product as any).metaFieldValues.variants;
    }
    
    if (!variantsData) {
      return;
    }

    try {
      let parsedVariants: ProductVariant[] = [];

      if (typeof variantsData === 'string') {
        try {
          parsedVariants = JSON.parse(variantsData);
        } catch (error) {
          // Si no es JSON válido, intentar parsear como estructura simple
          parsedVariants = [];
        }
      } else if (Array.isArray(variantsData)) {
        parsedVariants = variantsData;
      }

      // Normalizar y filtrar variantes válidas y disponibles
      const trackStock = (product as any).trackStock;
      const normalizedVariants = parsedVariants.map(variant => {
        // Calcular disponibilidad considerando trackStock del producto
        let isAvailable = true; // Por defecto disponible
        
        // Solo verificar stock si trackStock está habilitado
        if (trackStock === true) {
          isAvailable = variant.isAvailable !== false && variant.stock !== 0;
        }
        
        // Si la variante tiene 'name' pero no 'value', usar 'name' como 'value'
        if (variant.name && !variant.value) {
          return {
            ...variant,
            value: variant.name,
            name: 'Variante', // Nombre genérico para el tipo de variante
            isAvailable: isAvailable
          };
        }
        
        // Si ya tiene la estructura correcta, solo asegurar isAvailable
        return {
          ...variant,
          isAvailable: isAvailable
        };
      });
      
      const validVariants = normalizedVariants.filter(variant => {
        const isValid = variant && 
          variant.id &&
          (variant.value || variant.name) && 
          typeof variant.price === 'number';
        
        return isValid;
      });

      setVariants(validVariants);

      // Si no hay variante seleccionada y hay variantes disponibles, no seleccionar ninguna por defecto
      if (validVariants.length > 0 && !selectedVariant) {
        setSelectedVariant(null);
      }
    } catch (error) {
      console.warn('Error parsing product variants:', error);
      setVariants([]);
    }
  }, [product.tags, selectedVariant]);

  // Notificar cambios al componente padre
  useEffect(() => {
    onVariantChange(selectedVariant);
  }, [selectedVariant, onVariantChange]);

  const handleVariantSelect = (variant: ProductVariant) => {
    // Si se hace clic en la variante ya seleccionada, deseleccionarla
    if (selectedVariant?.id === variant.id) {
      setSelectedVariant(null);
    } else {
      setSelectedVariant(variant);
    }
  };

  // Si no hay variantes, no mostrar el componente
  if (variants.length === 0) {
    return null;
  }

  return (
    <div className="nbd-variant-selector">
      <div className="nbd-variant-group">
        <label className="nbd-variant-label">
          Variantes disponibles:
        </label>
        
        <div className="nbd-variant-options nbd-variant-options--with-pricing">
          {variants.map((variant) => (
            <button
              key={variant.id}
              type="button"
              className={`nbd-variant-option nbd-variant-option--pricing ${
                selectedVariant?.id === variant.id ? 'nbd-variant-option--selected' : ''
              } ${
                !variant.isAvailable ? 'nbd-variant-option--disabled' : ''
              }`}
              onClick={() => variant.isAvailable && handleVariantSelect(variant)}
              disabled={!variant.isAvailable}
            >
              <div className="nbd-variant-option-content">
                <div className="nbd-variant-option-name">
                  {variant.value || variant.name}
                </div>
                <div className="nbd-variant-option-price">
                  {formatPrice(variant.price, storeInfo?.currency || 'COP')}
                </div>
                {!variant.isAvailable && (
                  <div className="nbd-variant-option-stock">
                    Sin stock
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>


      </div>
    </div>
  );
}
