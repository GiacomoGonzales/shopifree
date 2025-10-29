'use client';

import { useState, useEffect } from 'react';
import { PublicProduct } from '../lib/products';
import { useStoreLanguage } from '../lib/store-language-context';

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

  // Hook de idioma para traducciones
  const { language } = useStoreLanguage();

  // Helper para textos adicionales
  const additionalText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      es: {
        'select': 'Selecciona'
      },
      en: {
        'select': 'Select'
      },
      pt: {
        'select': 'Selecione'
      }
    };
    return texts[language]?.[key] || texts['es']?.[key] || key;
  };

  // Obtener color primario dinámico con retry para producción
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const getPrimaryColor = () => {
      const color = getComputedStyle(document.documentElement).getPropertyValue('--nbd-primary');
      if (color && color.trim() && color.trim() !== '') {
        setPrimaryColor(color.trim());
        console.log('🎨 [SimpleVariantSelector] Color primario obtenido:', color.trim());
        return true;
      }
      return false;
    };

    // Intentar inmediatamente
    if (!getPrimaryColor()) {
      // Si no funciona, reintentar cada 100ms hasta 3 segundos
      let attempts = 0;
      const maxAttempts = 30;
      
      const intervalId = setInterval(() => {
        attempts++;
        if (getPrimaryColor() || attempts >= maxAttempts) {
          clearInterval(intervalId);
          if (attempts >= maxAttempts) {
            console.warn('🎨 [SimpleVariantSelector] No se pudo obtener color primario, usando fallback');
          }
        }
      }, 100);

      return () => clearInterval(intervalId);
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

    console.log('🎯 [SimpleVariantSelector] Variantes parseadas:', parsedVariants);
    console.log('🎯 [SimpleVariantSelector] Atributos extraídos:', attributes);
    console.log('🎯 [SimpleVariantSelector] Cantidad de atributos únicos:', Object.keys(attributes).length);
    
    // Debug específico para productos con una sola variante
    if (parsedVariants.length === 1) {
      console.log('🔍 [SINGLE VARIANT DEBUG] Producto con una sola variante:', parsedVariants[0]);
      console.log('🔍 [SINGLE VARIANT DEBUG] Atributos de la variante:', parsedVariants[0].attributes);
    }
    
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
      {Object.entries(availableAttributes).map(([attributeName, values]) => (
        <div key={attributeName} style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            marginBottom: '12px',
            fontWeight: '600',
            fontSize: '15px',
            color: '#333'
          }}>
            {additionalText('select')} {getDisplayName(attributeName).toLowerCase()}:
          </label>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px'
          }}>
            {values.map((value) => {
              const isSelected = selectedAttributes[attributeName] === value;

              return (
                <label
                  key={value}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    cursor: 'pointer',
                    userSelect: 'none'
                  }}
                >
                  <input
                    type="radio"
                    name={attributeName}
                    value={value}
                    checked={isSelected}
                    onChange={() => handleAttributeSelect(attributeName, value)}
                    style={{
                      appearance: 'none',
                      width: '20px',
                      height: '20px',
                      border: '2px solid #999',
                      borderRadius: '50%',
                      marginRight: '10px',
                      cursor: 'pointer',
                      position: 'relative',
                      flexShrink: 0,
                      transition: 'all 0.2s ease'
                    }}
                  />
                  <style>
                    {`
                      input[type="radio"]:checked {
                        border-color: #333 !important;
                      }
                      input[type="radio"]:checked::before {
                        content: '';
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 10px;
                        height: 10px;
                        border-radius: 50%;
                        background-color: #333;
                      }
                      input[type="radio"]:hover {
                        border-color: #555;
                      }
                    `}
                  </style>
                  <span style={{
                    fontSize: '14px',
                    fontWeight: '400',
                    color: isSelected ? '#333' : '#666'
                  }}>
                    {value}
                  </span>
                </label>
              );
            })}
          </div>
        </div>
      ))}
      
    </div>
  );
}