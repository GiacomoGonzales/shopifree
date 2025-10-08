"use client";

import { useState, useEffect } from 'react';
import { ModifierGroup, ModifierOption } from '../../../lib/products';
import { formatPrice } from '../../../lib/currency';
import './product-modifiers.css';

interface ProductModifiersProps {
  modifierGroups: ModifierGroup[];
  onSelectionChange: (selections: Record<string, string[]>, totalModifier: number) => void;
  currency?: string;
}

export default function ProductModifiers({ modifierGroups, onSelectionChange, currency }: ProductModifiersProps) {
  // Estado: { groupId: [optionId, optionId, ...] }
  const [selections, setSelections] = useState<Record<string, string[]>>({});

  // Inicializar opciones por defecto
  useEffect(() => {
    const defaultSelections: Record<string, string[]> = {};

    modifierGroups.forEach(group => {
      const activeOptions = group.options.filter(opt => opt.isActive);
      const defaultOptions = activeOptions.filter(opt => opt.isDefault);

      if (defaultOptions.length > 0) {
        defaultSelections[group.id] = defaultOptions.map(opt => opt.id);
      } else if (group.required && activeOptions.length > 0) {
        // Si es requerido pero no hay default, seleccionar la primera opción activa
        defaultSelections[group.id] = [activeOptions[0].id];
      }
    });

    setSelections(defaultSelections);
  }, [modifierGroups]);

  // Calcular el modificador de precio total
  useEffect(() => {
    let totalModifier = 0;

    Object.entries(selections).forEach(([groupId, optionIds]) => {
      const group = modifierGroups.find(g => g.id === groupId);
      if (!group) return;

      optionIds.forEach(optionId => {
        const option = group.options.find(opt => opt.id === optionId);
        if (option) {
          totalModifier += option.priceModifier;
        }
      });
    });

    onSelectionChange(selections, totalModifier);
  }, [selections, modifierGroups, onSelectionChange]);

  const handleOptionChange = (groupId: string, optionId: string, checked: boolean) => {
    const group = modifierGroups.find(g => g.id === groupId);
    if (!group) return;

    setSelections(prev => {
      const current = prev[groupId] || [];

      if (group.allowMultiple) {
        // Modo checkbox: permitir múltiples selecciones
        let newSelection: string[];

        if (checked) {
          // Agregar opción
          newSelection = [...current, optionId];

          // Respetar maxSelections
          if (newSelection.length > group.maxSelections) {
            return prev; // No permitir más de maxSelections
          }
        } else {
          // Remover opción
          newSelection = current.filter(id => id !== optionId);

          // Si es requerido, no permitir deseleccionar todas
          if (group.required && newSelection.length < group.minSelections) {
            return prev; // Mantener al menos minSelections
          }
        }

        return { ...prev, [groupId]: newSelection };
      } else {
        // Modo radio: solo una selección
        return { ...prev, [groupId]: [optionId] };
      }
    });
  };

  // Validar si el grupo cumple los requisitos
  const isGroupValid = (group: ModifierGroup): boolean => {
    const selectedCount = (selections[group.id] || []).length;

    if (group.required && selectedCount < group.minSelections) {
      return false;
    }

    return true;
  };

  // Obtener el texto de ayuda para el grupo
  const getGroupHelpText = (group: ModifierGroup): string => {
    if (!group.allowMultiple) {
      return group.required ? 'Selecciona una opción' : 'Opcional';
    }

    const min = group.minSelections;
    const max = group.maxSelections;
    const selectedCount = (selections[group.id] || []).length;

    if (group.required) {
      if (min === max) {
        return `Selecciona ${min}`;
      }
      return `Selecciona entre ${min} y ${max}`;
    }

    return `Selecciona hasta ${max} opciones`;
  };

  if (!modifierGroups || modifierGroups.length === 0) return null;

  // Ordenar grupos por order
  const sortedGroups = [...modifierGroups].sort((a, b) => a.order - b.order);

  return (
    <div className="nbd-product-modifiers">
      {sortedGroups.map(group => {
        const activeOptions = group.options.filter(opt => opt.isActive);
        if (activeOptions.length === 0) return null;

        const sortedOptions = [...activeOptions].sort((a, b) => a.order - b.order);
        const isValid = isGroupValid(group);

        return (
          <div key={group.id} className="nbd-modifier-group">
            <div className="nbd-modifier-group-header">
              <h4 className="nbd-modifier-group-title">
                {group.name}
                {group.required && <span className="nbd-modifier-required">*</span>}
              </h4>
              <span className="nbd-modifier-group-help">
                {getGroupHelpText(group)}
              </span>
            </div>

            <div className="nbd-modifier-options">
              {sortedOptions.map(option => {
                const isSelected = (selections[group.id] || []).includes(option.id);
                const inputType = group.allowMultiple ? 'checkbox' : 'radio';
                const inputName = `modifier-group-${group.id}`;

                return (
                  <label
                    key={option.id}
                    className={`nbd-modifier-option ${isSelected ? 'nbd-modifier-option--selected' : ''}`}
                  >
                    <input
                      type={inputType}
                      name={inputName}
                      checked={isSelected}
                      onChange={(e) => handleOptionChange(group.id, option.id, e.target.checked)}
                      className="nbd-modifier-input"
                    />
                    <span className="nbd-modifier-radio"></span>
                    <span className="nbd-modifier-option-content">
                      <span className="nbd-modifier-option-name">{option.name}</span>
                      {option.priceModifier !== 0 && (
                        <span className="nbd-modifier-option-price">
                          {option.priceModifier > 0 ? '+' : ''}
                          {formatPrice(option.priceModifier, currency)}
                        </span>
                      )}
                    </span>
                  </label>
                );
              })}
            </div>

            {!isValid && (
              <div className="nbd-modifier-error">
                Selecciona al menos {group.minSelections} opción{group.minSelections > 1 ? 'es' : ''}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
