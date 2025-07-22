'use client'

import React, { useState, useEffect } from 'react'
import { PublicProduct } from '../lib/products'

interface ProductVariant {
  size?: string
  color?: string
  [key: string]: string | undefined
}

interface ProductVariantSelectorProps {
  product: PublicProduct
  onVariantChange: (variant: ProductVariant) => void
  className?: string
  theme?: 'default' | 'elegant' | 'modern'
}

// Mapear nombres de campos comunes
const FIELD_NAMES: Record<string, string> = {
  'size': 'Talla',
  'color': 'Color',
  'material': 'Material',
  'style': 'Estilo',
  'fit': 'Ajuste',
  'pattern': 'Patrón'
}

// Campos que se consideran variantes principales
const VARIANT_FIELDS = ['size', 'color']

export default function ProductVariantSelector({ 
  product, 
  onVariantChange, 
  className = '',
  theme = 'default'
}: ProductVariantSelectorProps) {
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant>({})

  // Extraer opciones de variantes de los metadatos
  const variantOptions = React.useMemo(() => {
    if (!product.metaFieldValues) return {}
    
    const options: Record<string, string[]> = {}
    
    VARIANT_FIELDS.forEach(field => {
      const value = product.metaFieldValues?.[field]
      if (value) {
        if (Array.isArray(value)) {
          options[field] = value.filter(v => v && v.trim())
        } else if (typeof value === 'string' && value.trim()) {
          options[field] = [value.trim()]
        }
      }
    })
    
    return options
  }, [product.metaFieldValues])

  // Notificar cambios de variante al componente padre
  useEffect(() => {
    onVariantChange(selectedVariant)
  }, [selectedVariant, onVariantChange])

  // Manejar selección de variante
  const handleVariantSelect = (field: string, value: string) => {
    setSelectedVariant(prev => ({
      ...prev,
      [field]: value
    }))
  }

  // Si no hay variantes, no renderizar nada
  if (Object.keys(variantOptions).length === 0) {
    return null
  }

  // Estilos por tema
  const getThemeClasses = () => {
    switch (theme) {
      case 'elegant':
        return {
          container: 'space-y-6',
          fieldContainer: 'space-y-3',
          label: 'block text-sm font-medium text-serif',
          optionsContainer: 'flex flex-wrap gap-2',
          option: 'px-4 py-2 text-sm border rounded-sm transition-all duration-200 cursor-pointer text-sans',
          optionSelected: 'border-opacity-100 text-white',
          optionUnselected: 'border-opacity-20 hover:border-opacity-40'
        }
      case 'modern':
        return {
          container: 'space-y-4',
          fieldContainer: 'space-y-2',
          label: 'block text-sm font-medium text-gray-900',
          optionsContainer: 'flex flex-wrap gap-2',
          option: 'px-3 py-2 text-sm border border-gray-300 rounded-md transition-colors cursor-pointer',
          optionSelected: 'bg-black text-white border-black',
          optionUnselected: 'bg-white text-gray-700 hover:bg-gray-50'
        }
      default:
        return {
          container: 'space-y-4',
          fieldContainer: 'space-y-2',
          label: 'block text-sm font-medium text-gray-700',
          optionsContainer: 'flex flex-wrap gap-2',
          option: 'px-3 py-2 text-sm border border-gray-300 rounded-md transition-colors cursor-pointer',
          optionSelected: 'bg-black text-white border-black',
          optionUnselected: 'bg-white text-gray-700 hover:bg-gray-50'
        }
    }
  }

  const classes = getThemeClasses()

  return (
    <div className={`${classes.container} ${className}`}>
      {Object.entries(variantOptions).map(([field, options]) => (
        <div key={field} className={classes.fieldContainer}>
          <label className={classes.label}>
            {FIELD_NAMES[field] || field.charAt(0).toUpperCase() + field.slice(1)}
          </label>
          <div className={classes.optionsContainer}>
            {options.map((option) => {
              const isSelected = selectedVariant[field] === option
              
              if (theme === 'elegant') {
                return (
                  <button
                    key={option}
                    onClick={() => handleVariantSelect(field, option)}
                    className={`${classes.option} ${
                      isSelected 
                        ? classes.optionSelected 
                        : classes.optionUnselected
                    }`}
                    style={
                      theme === 'elegant' 
                        ? {
                            borderColor: isSelected 
                              ? 'rgb(var(--theme-primary))' 
                              : 'rgb(var(--theme-primary) / 0.2)',
                            backgroundColor: isSelected 
                              ? 'rgb(var(--theme-primary))' 
                              : 'transparent',
                            color: isSelected 
                              ? 'white' 
                              : 'rgb(var(--theme-neutral-dark))'
                          }
                        : undefined
                    }
                  >
                    {option}
                  </button>
                )
              }
              
              return (
                <button
                  key={option}
                  onClick={() => handleVariantSelect(field, option)}
                  className={`${classes.option} ${
                    isSelected 
                      ? classes.optionSelected 
                      : classes.optionUnselected
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
} 