'use client';

import { PublicProduct } from '../lib/products';

interface ProductMetadataProps {
  product: PublicProduct;
}

// Mapeo de metadatos a nombres legibles
const METADATA_DISPLAY_NAMES: Record<string, string> = {
  'color': 'Color',
  'size': 'Talla',
  'size_clothing': 'Talla',
  'size_shoes': 'Talla de Calzado',
  'material': 'Material',
  'style': 'Estilo',
  'season': 'Temporada',
  'brand': 'Marca',
  'weight': 'Peso',
  'capacity': 'Capacidad',
  'tech_brand': 'Marca',
  'screen_size': 'Tamaño de Pantalla',
  'storage': 'Almacenamiento',
  'ram': 'Memoria RAM',
  'processor': 'Procesador'
};

export default function ProductMetadata({ product }: ProductMetadataProps) {
  // Si no hay metadatos, no mostrar nada
  if (!product.metadata || Object.keys(product.metadata).length === 0) {
    return null;
  }

  // Filtrar y formatear metadatos válidos
  const validMetadata = Object.entries(product.metadata).filter(([key, value]) => {
    // Excluir campos vacíos o que no sean informativos
    if (!value || (Array.isArray(value) && value.length === 0)) return false;
    if (key === 'variants') return false; // Las variantes se muestran por separado
    return true;
  });

  if (validMetadata.length === 0) return null;

  const formatValue = (value: any): string => {
    if (Array.isArray(value)) {
      return value.join(', ');
    }
    return String(value);
  };

  const getDisplayName = (key: string): string => {
    return METADATA_DISPLAY_NAMES[key] || key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ');
  };

  return (
    <div className="nbd-product-metadata">
      <h3>Características</h3>
      <div className="nbd-metadata-table-container">
        <table className="nbd-metadata-table">
          <tbody>
            {validMetadata.map(([key, value]) => (
              <tr key={key} className="nbd-metadata-row">
                <td className="nbd-metadata-label">{getDisplayName(key)}</td>
                <td className="nbd-metadata-value">{formatValue(value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}