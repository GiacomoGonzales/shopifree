'use client';

import { useState, useEffect } from 'react';
import { PublicProduct } from '../lib/products';
import { useStoreLanguage } from '../lib/store-language-context';
import { getMetadataDisplayName } from '../lib/filters';

// Translation function for metadata values
async function translateMetadataValue(fieldId: string, value: string, language: string = 'es'): Promise<string> {
  try {
    // Load metadata translations for the current language
    const metadataMessages = await import(`../messages/${language}/categories/metadata.json`);
    const translations = metadataMessages.default;

    // Look for translation using: metadata.values.{fieldId}_options.{value}
    const translatedValue = translations?.metadata?.values?.[`${fieldId}_options`]?.[value];
    return translatedValue || value; // Fallback to original if no translation found
  } catch (error) {
    console.log(`❌ Error translating value "${value}" for field "${fieldId}":`, error);
    return value; // Fallback: return original value
  }
}

interface ProductMetadataProps {
  product: PublicProduct;
  storeId: string;
}

// Mapeo de metadatos por idioma
const METADATA_DISPLAY_NAMES = {
  es: {
    'color': 'Color',
    'size': 'Talla',
    'size_clothing': 'Talla',
    'size_shoes': 'Talla de Calzado',
    'material': 'Material',
    'style': 'Estilo',
    'clothing_style': 'Estilo de ropa',
    'season': 'Temporada',
    'brand': 'Marca',
    'weight': 'Peso',
    'capacity': 'Capacidad',
    'tech_brand': 'Marca',
    'screen_size': 'Tamaño de Pantalla',
    'storage': 'Almacenamiento',
    'ram': 'Memoria RAM',
    'processor': 'Procesador'
  },
  en: {
    'color': 'Color',
    'size': 'Size',
    'size_clothing': 'Size',
    'size_shoes': 'Shoe Size',
    'material': 'Material',
    'style': 'Style',
    'clothing_style': 'Clothing Style',
    'season': 'Season',
    'brand': 'Brand',
    'weight': 'Weight',
    'capacity': 'Capacity',
    'tech_brand': 'Brand',
    'screen_size': 'Screen Size',
    'storage': 'Storage',
    'ram': 'RAM Memory',
    'processor': 'Processor'
  },
  pt: {
    'color': 'Cor',
    'size': 'Tamanho',
    'size_clothing': 'Tamanho',
    'size_shoes': 'Tamanho do Calçado',
    'material': 'Material',
    'style': 'Estilo',
    'clothing_style': 'Estilo de Roupa',
    'season': 'Temporada',
    'brand': 'Marca',
    'weight': 'Peso',
    'capacity': 'Capacidade',
    'tech_brand': 'Marca',
    'screen_size': 'Tamanho da Tela',
    'storage': 'Armazenamento',
    'ram': 'Memória RAM',
    'processor': 'Processador'
  }
} as const;

export default function ProductMetadata({ product, storeId }: ProductMetadataProps) {
  const { language } = useStoreLanguage();
  const [metadataLabels, setMetadataLabels] = useState<Record<string, string>>({});
  const [translatedValues, setTranslatedValues] = useState<Record<string, Record<string, string>>>({});

  // Helper para textos adicionales
  const additionalText = (key: string) => {
    const texts: Record<string, Record<string, string>> = {
      es: {
        'characteristics': 'Características'
      },
      en: {
        'characteristics': 'Characteristics'
      },
      pt: {
        'characteristics': 'Características'
      }
    };
    return texts[language]?.[key] || texts['es']?.[key] || key;
  };

  // Filtrar y formatear metadatos válidos - DEBE estar antes del useEffect
  const validMetadata = (product as any).metadata
    ? Object.entries((product as any).metadata).filter(([key, value]) => {
        // Excluir campos vacíos o que no sean informativos
        if (!value || (Array.isArray(value) && value.length === 0)) return false;
        if (key === 'variants') return false; // Las variantes se muestran por separado
        return true;
      })
    : [];

  // Cargar etiquetas de metadatos desde filtros y traducir valores
  useEffect(() => {
    const loadMetadataLabelsAndValues = async () => {
      const labels: Record<string, string> = {};
      const values: Record<string, Record<string, string>> = {};

      for (const [key, value] of validMetadata) {
        try {
          // Load field label translation
          labels[key] = await getMetadataDisplayName(storeId, key);

          // Load value translations for this field
          values[key] = {};

          const valuesToTranslate = Array.isArray(value) ? value : [value];
          for (const val of valuesToTranslate) {
            const strVal = String(val);
            try {
              const translatedVal = await translateMetadataValue(key, strVal, language);
              values[key][strVal] = translatedVal;
            } catch (e) {
              console.warn(`Error translating value "${strVal}" for field "${key}":`, e);
              values[key][strVal] = strVal; // Fallback to original
            }
          }
        } catch (e) {
          console.warn(`Error loading label for ${key}:`, e);
          // Fallback
          labels[key] = key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
        }
      }

      setMetadataLabels(labels);
      setTranslatedValues(values);
    };

    if (validMetadata.length > 0 && storeId) {
      loadMetadataLabelsAndValues();
    }
  }, [storeId, product, language]); // Add language to dependencies

  // Early returns DESPUÉS de todos los hooks
  if (!(product as any).metadata || Object.keys((product as any).metadata).length === 0) {
    return null;
  }

  if (validMetadata.length === 0) return null;

  const formatValue = (value: any, fieldKey: string): string => {
    if (Array.isArray(value)) {
      // For arrays, translate each value and join
      return value.map(v => getTranslatedValue(String(v), fieldKey)).join(', ');
    }
    return getTranslatedValue(String(value), fieldKey);
  };

  const getTranslatedValue = (value: string, fieldKey: string): string => {
    // Use translated values from state if available
    const translatedValue = translatedValues[fieldKey]?.[value];
    return translatedValue || value; // Fallback to original if no translation
  };

  const getDisplayName = (key: string): string => {
    // Usar etiquetas cargadas desde filtros, con fallback a formato básico
    return metadataLabels[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="nbd-product-metadata">
      <h3>{additionalText('characteristics')}</h3>
      <div className="nbd-metadata-table-container">
        <table className="nbd-metadata-table">
          <tbody>
            {validMetadata.map(([key, value]) => (
              <tr key={key} className="nbd-metadata-row">
                <td className="nbd-metadata-label">{getDisplayName(key)}</td>
                <td className="nbd-metadata-value">{formatValue(value, key)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}