'use client';

import { useState, useEffect } from 'react';
import { PublicProduct } from '../lib/products';

interface VariantOptions {
  [key: string]: string[];
}

interface SelectedVariant {
  [key: string]: string;
}

interface ProductVariantSelectorProps {
  product: PublicProduct;
  onVariantChange: (selectedVariant: SelectedVariant) => void;
}

export default function ProductVariantSelector({ product, onVariantChange }: ProductVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant>({});
  const [variantOptions, setVariantOptions] = useState<VariantOptions>({});

  // Extraer opciones de variantes de los metadatos del producto
  useEffect(() => {
    if (!product.tags) {
      return;
    }

    const options: VariantOptions = {};
    
    // Buscar campos de variantes específicos
    Object.entries(product.tags).forEach(([key, value]) => {
      // Mapear nombres de campos comunes a nombres de variantes (solo color y talla por ahora)
      const variantFieldMap: { [key: string]: string } = {
        'color': 'Color',
        'size': 'Talla',
        'size_clothing': 'Talla',
        'size_shoes': 'Talla de Calzado'
      };

      const displayName = variantFieldMap[key];
      if (displayName && value) {
        // Si es un array, usar directamente; si es string, convertir a array
        const values = Array.isArray(value) ? value : [value];
        
        if (values.length > 1) { // Solo mostrar como variante si hay múltiples opciones
          options[key] = values; // Usar la clave original (size, color) no el displayName
        }
      }
    });

    setVariantOptions(options);

    // Seleccionar automáticamente la primera opción de cada variante
    const autoSelected: SelectedVariant = {};
    Object.entries(options).forEach(([key, values]) => {
      if (values && values.length > 0) {
        autoSelected[key] = values[0]; // Seleccionar la primera opción
      }
    });
    
    setSelectedVariant(autoSelected);
  }, [product.tags]);

  // Notificar cambios al componente padre
  useEffect(() => {
    onVariantChange(selectedVariant);
  }, [selectedVariant, onVariantChange]);

  const handleVariantSelect = (variantName: string, value: string) => {
    setSelectedVariant(prev => ({
      ...prev,
      [variantName]: value // Solo reemplaza el valor para esta variante específica
    }));
  };

  // Si no hay variantes, no mostrar el selector
  if (Object.keys(variantOptions).length === 0) {
    return null;
  }

  // Mapear claves a nombres mostrados (solo color y talla por ahora)
  const getDisplayName = (key: string) => {
    const map: { [key: string]: string } = {
      'color': 'Color',
      'size': 'Talla',
      'size_clothing': 'Talla',
      'size_shoes': 'Talla de Calzado'
    };
    return map[key] || key;
  };

  return (
    <div className="nbd-variant-selector">
      {Object.entries(variantOptions).map(([variantKey, values]) => (
        <div key={variantKey} className="nbd-variant-group">
          <label className="nbd-variant-label">
            {getDisplayName(variantKey)}{selectedVariant[variantKey] ? ': ' : ''}<span className={`nbd-variant-selected ${
              !selectedVariant[variantKey] ? 'nbd-variant-selected--placeholder' : ''
            }`}>
              {selectedVariant[variantKey] || ''}
            </span>
          </label>
          <div className="nbd-variant-options">
            {values.map((value) => {
              const isSelected = selectedVariant[variantKey] === value;
              return (
                <button
                  key={value}
                  type="button"
                  className={`nbd-variant-option ${isSelected ? 'nbd-variant-option--selected' : ''}`}
                  onClick={() => handleVariantSelect(variantKey, value)}
                  aria-pressed={isSelected}
                  data-selected={isSelected}
                >
                  {value}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
