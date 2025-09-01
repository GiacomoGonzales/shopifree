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
    console.log('🔍 [ProductVariantSelector] Producto recibido:', product);
    console.log('🔍 [ProductVariantSelector] Tags del producto:', product.tags);
    
    if (!product.tags) {
      console.log('⚠️ [ProductVariantSelector] No hay tags en el producto');
      return;
    }

    const options: VariantOptions = {};
    
    // Buscar campos de variantes específicos
    Object.entries(product.tags).forEach(([key, value]) => {
      console.log(`🔍 [ProductVariantSelector] Procesando campo: ${key} =`, value);
      
      // Mapear nombres de campos comunes a nombres de variantes
      const variantFieldMap: { [key: string]: string } = {
        'color': 'Color',
        'size': 'Talla',
        'size_clothing': 'Talla',
        'size_shoes': 'Talla de Calzado',
        'material': 'Material',
        'style': 'Estilo',
        'clothing_style': 'Estilo'
      };

      const displayName = variantFieldMap[key];
      if (displayName && value) {
        // Si es un array, usar directamente; si es string, convertir a array
        const values = Array.isArray(value) ? value : [value];
        console.log(`🔍 [ProductVariantSelector] Valores para ${key}:`, values);
        
        if (values.length > 1) { // Solo mostrar como variante si hay múltiples opciones
          options[key] = values; // Usar la clave original (size, color) no el displayName
          console.log(`✅ [ProductVariantSelector] Agregada variante ${key} con ${values.length} opciones`);
        } else {
          console.log(`⚠️ [ProductVariantSelector] Campo ${key} tiene solo ${values.length} opción, no se muestra como variante`);
        }
      } else {
        console.log(`⚠️ [ProductVariantSelector] Campo ${key} no es una variante válida o no tiene displayName`);
      }
    });

    console.log('🔍 [ProductVariantSelector] Opciones de variantes encontradas:', options);
    setVariantOptions(options);

    // No preseleccionar ninguna opción - el usuario debe elegir
    setSelectedVariant({});
  }, [product.tags]);

  // Notificar cambios al componente padre
  useEffect(() => {
    onVariantChange(selectedVariant);
  }, [selectedVariant, onVariantChange]);

  const handleVariantSelect = (variantName: string, value: string) => {
    setSelectedVariant(prev => ({
      ...prev,
      [variantName]: value // Ahora variantName ya es la clave original (size, color)
    }));
  };

  // Si no hay variantes, no mostrar el selector
  if (Object.keys(variantOptions).length === 0) {
    console.log('⚠️ [ProductVariantSelector] No hay opciones de variantes, no se muestra el selector');
    return null;
  }

  console.log('✅ [ProductVariantSelector] Renderizando selector con opciones:', variantOptions);

  // Mapear claves a nombres mostrados
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
            {values.map((value) => (
              <button
                key={value}
                type="button"
                className={`nbd-variant-option ${
                  selectedVariant[variantKey] === value ? 'nbd-variant-option--selected' : ''
                }`}
                onClick={() => handleVariantSelect(variantKey, value)}
              >
                {value}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
