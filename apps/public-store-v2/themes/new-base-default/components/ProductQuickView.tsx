"use client";

import { useState, useEffect } from 'react';
import { PublicProduct } from '../../../lib/products';
import { useCart } from '../../../lib/cart-context';
import { toCloudinarySquare } from '../../../lib/images';
import { formatPrice } from '../../../lib/currency';
import SimpleVariantSelector from '../../../components/SimpleVariantSelector';
import { usePromotions } from '../../../lib/hooks/usePromotions';
import ProductModifiers from './ProductModifiers';

interface ProductQuickViewProps {
  product: PublicProduct;
  isOpen: boolean;
  onClose: () => void;
  storeInfo?: {
    currency?: string;
  };
  storeId?: string | null;
}

export default function ProductQuickView({ product, isOpen, onClose, storeInfo, storeId }: ProductQuickViewProps) {
  const { addItem, openCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [modifierSelections, setModifierSelections] = useState<Record<string, string[]>>({});
  const [modifierPriceTotal, setModifierPriceTotal] = useState<number>(0);
  const [modifierQuantities, setModifierQuantities] = useState<Record<string, Record<string, number>>>({});

  // Hook de promociones - obtiene el precio original del producto o variante seleccionada
  const originalPrice = selectedVariant ? selectedVariant.price : product.price;
  const promotionsData = usePromotions(storeId || null, product.id || '', originalPrice);

  // Reset variants and modifiers when modal opens with new product
  useEffect(() => {
    if (isOpen) {
      setSelectedVariant(null);
      setModifierSelections({});
      setModifierPriceTotal(0);
      setModifierQuantities({});
    }
  }, [isOpen, product.id]);

  const handleModifierChange = (selections: Record<string, string[]>, totalModifier: number, quantities: Record<string, Record<string, number>>) => {
    setModifierSelections(selections);
    setModifierPriceTotal(totalModifier);
    setModifierQuantities(quantities);
  };

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  const handleVariantChange = (variant: any) => {
    console.log('🔄 [ProductQuickView] Variante seleccionada:', variant);
    setSelectedVariant(variant);
  };

  const hasVariants = () => {
    // Verificar si el producto tiene variantes reales (mismo sistema que SimpleVariantSelector)
    let variantsData = null;
    
    if (product.tags && product.tags.variants) {
      variantsData = product.tags.variants;
    } else if ((product as any).variants) {
      variantsData = (product as any).variants;
    } else if ((product as any).metaFieldValues?.variants) {
      variantsData = (product as any).metaFieldValues.variants;
    }

    if (!variantsData) return false;

    try {
      let parsedVariants = [];
      if (typeof variantsData === 'string') {
        parsedVariants = JSON.parse(variantsData);
      } else if (Array.isArray(variantsData)) {
        parsedVariants = variantsData;
      }
      return parsedVariants.length > 0;
    } catch (error) {
      return false;
    }
  };

  const isReadyToAdd = () => {
    // Verificar variantes
    if (hasVariants() && !selectedVariant) {
      return false;
    }

    // Verificar modificadores requeridos
    if (product.modifierGroups && product.modifierGroups.length > 0) {
      const requiredGroups = product.modifierGroups.filter(g => g.required);

      for (const group of requiredGroups) {
        const selectedCount = (modifierSelections[group.id] || []).length;

        if (selectedCount < group.minSelections) {
          return false;
        }
      }
    }

    return true;
  };

  // Calcular precio final (base + modificadores)
  const getFinalPrice = () => {
    const basePrice = promotionsData.finalPrice || (selectedVariant?.price || product.price);
    return basePrice + modifierPriceTotal;
  };

  // Función para sanitizar HTML básicamente (mantener formato pero remover elementos peligrosos)
  const sanitizeDescription = (description: string) => {
    if (!description) return '';

    // Permitir etiquetas de formato básico pero remover scripts y otros elementos peligrosos
    return description
      .replace(/<script[^>]*>.*?<\/script>/gi, '') // Remover scripts
      .replace(/<iframe[^>]*>.*?<\/iframe>/gi, '') // Remover iframes
      .replace(/javascript:/gi, '') // Remover javascript:
      .replace(/on\w+="[^"]*"/gi, ''); // Remover eventos onclick, onload, etc.
  };

  const handleAddToCart = async () => {
    if (!isReadyToAdd()) return;

    setIsLoading(true);

    try {
      // Add delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Preparar información de variante
      let variantInfo: { id: string; name: string; price: number } | undefined = undefined;
      let itemId = product.id;

      if (selectedVariant) {
        // Formato completo de variante con atributos
        const attributeNames = Object.values(selectedVariant.attributes || {}).join(', ');
        variantInfo = {
          id: selectedVariant.id,
          name: attributeNames,
          price: promotionsData.finalPrice || (selectedVariant.price || product.price)
        };
        itemId = `${product.id}-${selectedVariant.id}`;
      }

      // Preparar información de modificadores
      let modifiersInfo: Array<{ groupId: string; groupName: string; options: Array<{ id: string; name: string; price: number; quantity: number }> }> = [];

      if (product.modifierGroups && Object.keys(modifierSelections).length > 0) {
        modifiersInfo = Object.entries(modifierSelections)
          .filter(([_, optionIds]) => optionIds.length > 0)
          .map(([groupId, optionIds]) => {
            const group = product.modifierGroups?.find(g => g.id === groupId);
            if (!group) return null;

            const selectedOptions = optionIds
              .map(optionId => {
                const option = group.options.find(opt => opt.id === optionId);
                if (!option) return null;

                // Obtener cantidad (1 para radio, valor real para allowMultiple)
                const quantity = group.allowMultiple ? (modifierQuantities[groupId]?.[optionId] || 1) : 1;

                return {
                  id: option.id,
                  name: option.name,
                  price: option.priceModifier,
                  quantity
                };
              })
              .filter(Boolean) as Array<{ id: string; name: string; price: number; quantity: number }>;

            return {
              groupId: group.id,
              groupName: group.name,
              options: selectedOptions
            };
          })
          .filter(Boolean) as Array<{ groupId: string; groupName: string; options: Array<{ id: string; name: string; price: number; quantity: number }> }>;

        // Agregar modificadores al itemId para crear ítems únicos
        const modifierHash = JSON.stringify(modifiersInfo);
        // Usar hash simple en lugar de btoa para evitar errores con caracteres UTF-8
        const hash = modifierHash.split('').reduce((acc, char) => {
          return ((acc << 5) - acc) + char.charCodeAt(0);
        }, 0);
        itemId = `${itemId}-${Math.abs(hash).toString(36).substring(0, 10)}`;
      }

      const finalPrice = getFinalPrice();

      addItem({
        id: itemId,
        productId: product.id,
        name: product.name,
        price: finalPrice,
        currency: storeInfo?.currency || 'COP',
        image: product.image || '',
        slug: product.slug || product.id,
        variant: variantInfo,
        modifiers: modifiersInfo.length > 0 ? modifiersInfo : undefined,
        incomplete: false
      }, 1);

      onClose(); // Cerrar el modal de producto
      openCart(); // Abrir el carrito inmediatamente
      console.log(`✅ [ProductQuickView] Agregado al carrito: ${product.name}`, {
        selectedVariant,
        variantInfo,
        modifiers: modifiersInfo,
        finalPrice
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop - igual que CartModal */}
      <div className="nbd-cart-backdrop" onClick={onClose}></div>
      
      {/* Modal del producto - usando las mismas clases que CartModal */}
      <div className="nbd-cart-modal nbd-product-modal">
        {/* Header del modal - FIJO */}
        <div className="nbd-cart-header">
          <h2 className="nbd-cart-title">Selecciona opciones</h2>
          <button 
            onClick={onClose}
            className="nbd-cart-close"
            aria-label="Cerrar"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
              <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>

        {/* Contenido scrolleable - TODO en el scroll */}
        <div className="nbd-cart-content nbd-product-scroll-content">
          
          {/* Imagen del producto */}
          <div className="nbd-product-image-container">
            {product.image ? (
              <img
                src={toCloudinarySquare(product.image, 800) || product.image}
                alt={product.name}
                className="nbd-product-image"
              />
            ) : (
              <div className="nbd-product-image-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                  <circle cx="9" cy="9" r="2"/>
                  <path d="M21 15l-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
                </svg>
                <span>Sin imagen</span>
              </div>
            )}
          </div>

          {/* Información del producto */}
          <div className="nbd-product-info-section">
            <h3 className="nbd-product-title">{product.name}</h3>
            <div className="nbd-product-price-large">
              {promotionsData.discount > 0 ? (
                <>
                  <span style={{ textDecoration: 'line-through', opacity: 0.6, marginRight: '8px' }}>
                    {formatPrice(promotionsData.originalPrice, storeInfo?.currency)}
                  </span>
                  <span style={{ color: '#dc2626', fontWeight: 'bold' }}>
                    {formatPrice(promotionsData.finalPrice, storeInfo?.currency)}
                  </span>
                </>
              ) : (
                formatPrice(promotionsData.finalPrice || (selectedVariant?.price || product.price), storeInfo?.currency)
              )}
            </div>
            
            {/* Descripción con formato rico del producto */}
            {product.description && (
              <div className="nbd-product-description">
                <div dangerouslySetInnerHTML={{ __html: sanitizeDescription(product.description) }} />
              </div>
            )}
          </div>

          {/* Selector de variantes usando SimpleVariantSelector */}
          <div className="nbd-product-variants-section">
            <SimpleVariantSelector
              product={product}
              onVariantChange={handleVariantChange}
            />
          </div>

          {/* Modificadores y extras */}
          {product.modifierGroups && product.modifierGroups.length > 0 && (
            <div className="nbd-product-modifiers-section">
              <ProductModifiers
                modifierGroups={product.modifierGroups}
                onSelectionChange={handleModifierChange}
                currency={storeInfo?.currency}
              />
            </div>
          )}
        </div>

        {/* Footer del modal - FIJO */}
        <div className="nbd-cart-footer">
          <button
            className={`nbd-btn nbd-btn--primary nbd-product-add-button ${!isReadyToAdd() ? 'nbd-btn--disabled' : ''}`}
            onClick={handleAddToCart}
            disabled={!isReadyToAdd() || isLoading}
          >
            {isLoading ? (
              <span className="nbd-btn-loading">
                <svg className="nbd-btn-spinner" width="18" height="18" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="32" strokeDashoffset="32">
                    <animate attributeName="stroke-dasharray" dur="2s" values="0 32;16 16;0 32;0 32" repeatCount="indefinite"/>
                    <animate attributeName="stroke-dashoffset" dur="2s" values="0;-16;-32;-32" repeatCount="indefinite"/>
                  </circle>
                </svg>
                Agregando...
              </span>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                Agregar al carrito • {formatPrice(getFinalPrice(), storeInfo?.currency)}
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}