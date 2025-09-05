"use client";

import { useState, useEffect } from 'react';
import { PublicProduct } from '../../../lib/products';
import { useCart } from '../../../lib/cart-context';
import { toCloudinarySquare } from '../../../lib/images';
import { formatPrice } from '../../../lib/currency';

interface ProductQuickViewProps {
  product: PublicProduct;
  isOpen: boolean;
  onClose: () => void;
  storeInfo?: {
    currency?: string;
  };
}

export default function ProductQuickView({ product, isOpen, onClose, storeInfo }: ProductQuickViewProps) {
  const { addItem, openCart } = useCart();
  const [selectedVariants, setSelectedVariants] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  // Reset variants when modal opens with new product
  useEffect(() => {
    if (isOpen) {
      setSelectedVariants({});
    }
  }, [isOpen, product.id]);

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

  const handleVariantChange = (variantKey: string, value: string) => {
    setSelectedVariants(prev => ({
      ...prev,
      [variantKey]: value
    }));
  };

  const getRequiredVariants = () => {
    const variantFields = ['color', 'size', 'size_clothing', 'size_shoes', 'material', 'style', 'clothing_style'];
    return product.tags ? Object.entries(product.tags).filter(([key, value]) => {
      return variantFields.includes(key) && Array.isArray(value) && value.length > 1;
    }) : [];
  };

  const isReadyToAdd = () => {
    const requiredVariants = getRequiredVariants();
    return requiredVariants.every(([key]) => selectedVariants[key]);
  };

  // Función para limpiar HTML de la descripción
  const cleanDescription = (description: string) => {
    if (!description) return '';
    
    // Remover etiquetas HTML básicas y convertir entidades
    return description
      .replace(/<[^>]*>/g, '') // Remover todas las etiquetas HTML
      .replace(/&nbsp;/g, ' ') // Convertir espacios no rompibles
      .replace(/&amp;/g, '&') // Convertir ampersands
      .replace(/&lt;/g, '<') // Convertir menor que
      .replace(/&gt;/g, '>') // Convertir mayor que
      .replace(/&quot;/g, '"') // Convertir comillas
      .replace(/&#39;/g, "'") // Convertir apostrofes
      .trim(); // Remover espacios extra
  };

  const handleAddToCart = async () => {
    if (!isReadyToAdd()) return;

    setIsLoading(true);

    try {
      // Add delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500));

      // Crear descripción de variantes como en la página de producto
      let variantInfo: { id: string; name: string; price: number } | undefined = undefined;
      
      if (Object.keys(selectedVariants).length > 0) {
        const variantDesc = Object.entries(selectedVariants)
          .map(([key, value]) => `${value}`)
          .join(', ');
        if (variantDesc) {
          variantInfo = {
            id: 'traditional',
            name: variantDesc,
            price: product.price
          };
        }
      }

      addItem({
        id: variantInfo ? `${product.id}-traditional` : product.id,
        productId: product.id,
        name: product.name,
        price: product.price,
        currency: storeInfo?.currency || 'COP',
        image: product.image || '',
        slug: product.slug || product.id,
        variant: variantInfo // Usar el mismo formato que la página de producto
      }, 1);

      onClose(); // Cerrar el modal de producto
      openCart(); // Abrir el carrito inmediatamente
      console.log(`Agregado al carrito: ${product.name} con variantes:`, selectedVariants);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const requiredVariants = getRequiredVariants();

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
                src={toCloudinarySquare(product.image, 300) || product.image} 
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
              {formatPrice(product.price, storeInfo?.currency)}
            </div>
            
            {/* Descripción limpia del producto */}
            {product.description && (
              <div className="nbd-product-description">
                <p>{cleanDescription(product.description)}</p>
              </div>
            )}
          </div>

          {/* Selectores de variantes */}
          <div className="nbd-product-variants-section">
            {requiredVariants.map(([variantKey, options]) => {
              // Mapear nombres de campos a nombres mostrados
              const getDisplayName = (key: string) => {
                const map: { [key: string]: string } = {
                  'color': 'Color',
                  'size': 'Talla',
                  'size_clothing': 'Talla',
                  'size_shoes': 'Talla de Calzado',
                  'material': 'Material',
                  'style': 'Estilo',
                  'clothing_style': 'Estilo'
                };
                return map[key] || key;
              };

              return (
                <div key={variantKey} className="nbd-variant-group">
                  <label className="nbd-variant-label">
                    {getDisplayName(variantKey)}:
                  </label>
                  <div className="nbd-variant-options">
                    {Array.isArray(options) ? options.map((option) => {
                      const isSelected = selectedVariants[variantKey] === option;
                      return (
                        <button
                          key={option}
                          type="button"
                          className={`nbd-variant-option ${isSelected ? 'nbd-variant-option--selected' : ''}`}
                          onClick={() => handleVariantChange(variantKey, option)}
                          aria-pressed={isSelected}
                        >
                          {option}
                        </button>
                      );
                    }) : null}
                  </div>
                </div>
              );
            })}
          </div>
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
                Agregar al carrito
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
}