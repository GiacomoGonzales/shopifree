'use client';

import { useState, useEffect } from 'react';
import { PublicProduct } from '../lib/products';

interface VariantOptions {
  [key: string]: string[];
}

interface SelectedVariant {
  [key: string]: string;
}

export interface FoundVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  attributes: Record<string, string>;
}

interface ProductVariantSelectorProps {
  product: PublicProduct;
  onVariantChange: (selectedVariant: SelectedVariant, foundVariant?: FoundVariant) => void;
}

export default function ProductVariantSelector({ product, onVariantChange }: ProductVariantSelectorProps) {
  console.log('🚀 [ProductVariantSelector] COMPONENTE INICIADO con producto:', product?.name, product?.id);
  
  const [selectedVariant, setSelectedVariant] = useState<SelectedVariant>({});
  const [variantOptions, setVariantOptions] = useState<VariantOptions>({});
  const [allVariants, setAllVariants] = useState<any[]>([]);

  // Función para encontrar la variante específica basada en la selección
  const findMatchingVariant = (selectedAttributes: SelectedVariant): FoundVariant | undefined => {
    if (!allVariants.length || !Object.keys(selectedAttributes).length) return undefined;

    // Buscar variante que coincida exactamente con todos los atributos seleccionados
    const matchingVariant = allVariants.find(variant => {
      if (!variant.attributes) return false;
      
      // Verificar que todos los atributos seleccionados coincidan
      return Object.entries(selectedAttributes).every(([key, value]) => {
        return variant.attributes[key] === value;
      });
    });

    if (matchingVariant) {
      const trackStock = (product as any).trackStock;
      let isAvailable = true;
      
      // Solo verificar disponibilidad si el producto rastrea stock
      if (trackStock === true) {
        isAvailable = matchingVariant.isAvailable !== false && matchingVariant.stock > 0;
      }

      return {
        id: matchingVariant.id,
        name: matchingVariant.name,
        price: matchingVariant.price,
        stock: matchingVariant.stock || 0,
        isAvailable,
        attributes: matchingVariant.attributes
      };
    }

    return undefined;
  };

  // Extraer opciones de variantes SOLO de variantes reales (no metadatos)
  useEffect(() => {
    const options: VariantOptions = {};
    
    // Buscar variantes en ubicaciones específicas del producto
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
    
    // Si no hay variantes reales, no mostrar nada (eliminamos fallback de metadatos)
    if (!variantsData) {
      setVariantOptions({});
      setSelectedVariant({});
      return;
    }

    // Procesar variantes reales del producto para extraer opciones independientes
    try {
      let parsedVariants: any[] = [];

      if (typeof variantsData === 'string') {
        try {
          parsedVariants = JSON.parse(variantsData);
        } catch (error) {
          parsedVariants = [];
        }
      } else if (Array.isArray(variantsData)) {
        parsedVariants = variantsData;
      }

      // Guardar todas las variantes para buscar combinaciones específicas
      setAllVariants(parsedVariants);
      console.log('🔍 Variantes encontradas:', parsedVariants);

      // Extraer todos los atributos únicos de las variantes
      parsedVariants.forEach(variant => {
        console.log('🔍 Procesando variante:', variant);
        if (variant.attributes) {
          Object.entries(variant.attributes).forEach(([attributeKey, attributeValue]) => {
            if (!options[attributeKey]) {
              options[attributeKey] = [];
            }
            
            // Solo agregar el valor si no existe ya
            if (!options[attributeKey].includes(attributeValue as string)) {
              options[attributeKey].push(attributeValue as string);
            }
          });
        }
      });

    } catch (error) {
      console.error('Error procesando variantes:', error);
    console.log('Datos de variantes que causaron error:', variantsData);
    }

    console.log('🎯 Opciones extraídas:', options);
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
    const foundVariant = findMatchingVariant(selectedVariant);
    onVariantChange(selectedVariant, foundVariant);
  }, [selectedVariant, onVariantChange, allVariants]);

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

  // Mapear claves a nombres mostrados
  const getDisplayName = (key: string) => {
    const map: { [key: string]: string } = {
      'color': 'Color',
      'size': 'Talla',
      'size_clothing': 'Talla',
      'size_shoes': 'Talla de Calzado',
      'talla': 'Talla',
      'material': 'Material',
      'estilo': 'Estilo',
      'peso': 'Peso',
      'capacidad': 'Capacidad'
    };
    
    // Capitalizar primera letra si no está en el mapa
    return map[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
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
