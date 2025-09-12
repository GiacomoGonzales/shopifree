'use client';

import { useState, useEffect } from 'react';
import { PublicProduct } from '../lib/products';

interface VariantAttribute {
  name: string;
  value: string;
}

interface SimpleVariant {
  id: string;
  name: string;
  price: number;
  stock: number;
  isAvailable: boolean;
  attributes: Record<string, string>;
}

interface SimpleVariantSelectorProps {
  product: PublicProduct;
  onVariantChange: (variant: SimpleVariant | null) => void;
}

export default function SimpleVariantSelector({ product, onVariantChange }: SimpleVariantSelectorProps) {
  console.log('✨ [SimpleVariantSelector] Iniciado con producto:', product.name);
  
  const [variants, setVariants] = useState<SimpleVariant[]>([]);
  const [selectedAttributes, setSelectedAttributes] = useState<Record<string, string>>({});
  const [availableAttributes, setAvailableAttributes] = useState<Record<string, string[]>>({});
  const [selectedVariant, setSelectedVariant] = useState<SimpleVariant | null>(null);
  const [primaryColor, setPrimaryColor] = useState<string>('#007bff');

  // Obtener color primario dinámico
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--nbd-primary');
      if (color) {
        setPrimaryColor(color.trim());
        console.log('🎨 [SimpleVariantSelector] Color primario obtenido:', color.trim());
      }
    }
  }, []);

  // Cargar variantes desde el producto
  useEffect(() => {
    console.log('🔍 [SimpleVariantSelector] Buscando variantes en producto...');
    
    let variantsData = null;
    
    // Buscar variantes en diferentes ubicaciones
    if (product.tags && product.tags.variants) {
      variantsData = product.tags.variants;
      console.log('✅ [SimpleVariantSelector] Variantes encontradas en product.tags.variants');
    } else if ((product as any).variants) {
      variantsData = (product as any).variants;
      console.log('✅ [SimpleVariantSelector] Variantes encontradas en product.variants');
    } else if ((product as any).metaFieldValues?.variants) {
      variantsData = (product as any).metaFieldValues.variants;
      console.log('✅ [SimpleVariantSelector] Variantes encontradas en metaFieldValues.variants');
    }

    if (!variantsData) {
      console.log('❌ [SimpleVariantSelector] No se encontraron variantes');
      setVariants([]);
      setAvailableAttributes({});
      return;
    }

    // Parsear variantes
    let parsedVariants: SimpleVariant[] = [];
    try {
      if (typeof variantsData === 'string') {
        parsedVariants = JSON.parse(variantsData);
      } else if (Array.isArray(variantsData)) {
        parsedVariants = variantsData;
      }
      
      console.log('✅ [SimpleVariantSelector] Variantes parseadas:', parsedVariants);
    } catch (error) {
      console.error('❌ [SimpleVariantSelector] Error parseando variantes:', error);
      return;
    }

    // Procesar variantes y extraer atributos únicos
    const attributes: Record<string, string[]> = {};
    
    parsedVariants.forEach(variant => {
      if (variant.attributes) {
        Object.entries(variant.attributes).forEach(([key, value]) => {
          if (!attributes[key]) {
            attributes[key] = [];
          }
          if (!attributes[key].includes(value as string)) {
            attributes[key].push(value as string);
          }
        });
      }
    });

    console.log('🎯 [SimpleVariantSelector] Atributos extraídos:', attributes);
    
    setVariants(parsedVariants);
    setAvailableAttributes(attributes);

    // Seleccionar automáticamente la primera opción de cada atributo
    const initialSelection: Record<string, string> = {};
    Object.entries(attributes).forEach(([key, values]) => {
      if (values.length > 0) {
        initialSelection[key] = values[0];
      }
    });
    
    setSelectedAttributes(initialSelection);
  }, [product]);

  // Buscar variante que coincida con los atributos seleccionados
  useEffect(() => {
    if (Object.keys(selectedAttributes).length === 0 || variants.length === 0) {
      setSelectedVariant(null);
      onVariantChange(null);
      return;
    }

    const matchingVariant = variants.find(variant => {
      if (!variant.attributes) return false;
      
      return Object.entries(selectedAttributes).every(([key, value]) => {
        return variant.attributes[key] === value;
      });
    });

    console.log('🔍 [SimpleVariantSelector] Buscando variante que coincida con:', selectedAttributes);
    console.log('✅ [SimpleVariantSelector] Variante encontrada:', matchingVariant);

    setSelectedVariant(matchingVariant || null);
    onVariantChange(matchingVariant || null);
  }, [selectedAttributes, variants, onVariantChange]);

  const handleAttributeSelect = (attributeName: string, value: string) => {
    console.log(`🔄 [SimpleVariantSelector] Seleccionando ${attributeName}: ${value}`);
    
    setSelectedAttributes(prev => ({
      ...prev,
      [attributeName]: value
    }));
  };

  // Traducir nombres de atributos para mostrar
  const getDisplayName = (key: string) => {
    const translations: Record<string, string> = {
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
    
    return translations[key.toLowerCase()] || key.charAt(0).toUpperCase() + key.slice(1);
  };

  // Si no hay atributos disponibles, no mostrar selector
  if (Object.keys(availableAttributes).length === 0) {
    console.log('❌ [SimpleVariantSelector] No hay atributos disponibles, no renderizando');
    return null;
  }

  return (
    <div className="simple-variant-selector">
        <h3 style={{ marginBottom: '16px', fontSize: '16px', fontWeight: '600' }}>
          Selecciona las opciones:
        </h3>
      
      {Object.entries(availableAttributes).map(([attributeName, values]) => (
        <div key={attributeName} style={{ marginBottom: '20px' }}>
          <label style={{ 
            display: 'block', 
            marginBottom: '8px', 
            fontWeight: '500',
            fontSize: '14px'
          }}>
            {getDisplayName(attributeName)}: 
            <span style={{ 
              marginLeft: '8px', 
              color: '#666',
              fontWeight: '600'
            }}>
              {selectedAttributes[attributeName] || ''}
            </span>
          </label>
          
          <div style={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: '8px' 
          }}>
            {values.map((value) => {
              const isSelected = selectedAttributes[attributeName] === value;
              
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => handleAttributeSelect(attributeName, value)}
                  style={{
                    padding: '6px 12px',
                    margin: '4px 4px 4px 0',
                    fontSize: '13px',
                    fontWeight: '500',
                    border: isSelected ? `2px solid ${primaryColor}` : '2px solid #ddd',
                    borderRadius: '20px',
                    backgroundColor: isSelected ? primaryColor : '#fff',
                    color: isSelected ? '#fff' : '#666',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    outline: 'none',
                    minWidth: 'auto',
                    height: 'auto'
                  }}
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