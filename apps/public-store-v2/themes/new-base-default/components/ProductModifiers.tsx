"use client";

import { useState, useEffect } from 'react';
import { ModifierGroup, ModifierOption } from '../../../lib/products';
import { formatPrice } from '../../../lib/currency';
import './product-modifiers.css';

interface ProductModifiersProps {
  modifierGroups: ModifierGroup[];
  onSelectionChange: (selections: Record<string, string[]>, totalModifier: number, quantities: Record<string, Record<string, number>>) => void;
  currency?: string;
}

export default function ProductModifiers({ modifierGroups, onSelectionChange, currency }: ProductModifiersProps) {
  // Estado para modo allowMultiple: { groupId: { optionId: quantity } }
  // Estado para modo radio: { groupId: [optionId] }
  const [selections, setSelections] = useState<Record<string, string[]>>({});
  const [quantities, setQuantities] = useState<Record<string, Record<string, number>>>({});

  // Inicializar opciones por defecto
  useEffect(() => {
    const defaultSelections: Record<string, string[]> = {};
    const defaultQuantities: Record<string, Record<string, number>> = {};

    modifierGroups.forEach(group => {
      const activeOptions = group.options.filter(opt => opt.isActive);
      const defaultOptions = activeOptions.filter(opt => opt.isDefault);

      if (group.allowMultiple) {
        defaultQuantities[group.id] = {};

        if (defaultOptions.length > 0) {
          defaultOptions.forEach(opt => {
            defaultQuantities[group.id][opt.id] = 1;
          });
          defaultSelections[group.id] = defaultOptions.map(opt => opt.id);
        }
      } else {
        if (defaultOptions.length > 0) {
          defaultSelections[group.id] = [defaultOptions[0].id];
        } else if (group.required && activeOptions.length > 0) {
          // Si es requerido pero no hay default, seleccionar la primera opción activa
          defaultSelections[group.id] = [activeOptions[0].id];
        }
      }
    });

    setSelections(defaultSelections);
    setQuantities(defaultQuantities);
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
          if (group.allowMultiple) {
            // Multiplicar por la cantidad seleccionada
            const quantity = quantities[groupId]?.[optionId] || 1;
            totalModifier += option.priceModifier * quantity;
          } else {
            totalModifier += option.priceModifier;
          }
        }
      });
    });

    onSelectionChange(selections, totalModifier, quantities);
  }, [selections, quantities, modifierGroups, onSelectionChange]);

  const handleOptionChange = (groupId: string, optionId: string) => {
    const group = modifierGroups.find(g => g.id === groupId);
    if (!group) return;

    if (group.allowMultiple) {
      // No hacer nada aquí, el manejo se hace con + y -
      return;
    } else {
      // Modo radio: solo una selección
      setSelections(prev => ({ ...prev, [groupId]: [optionId] }));
    }
  };

  // Incrementar cantidad de una opción
  const handleIncrement = (groupId: string, optionId: string) => {
    const group = modifierGroups.find(g => g.id === groupId);
    if (!group || !group.allowMultiple) return;

    setQuantities(prev => {
      const groupQuantities = prev[groupId] || {};
      const currentQuantity = groupQuantities[optionId] || 0;
      const newQuantity = currentQuantity + 1;

      // Verificar que no exceda maxSelections (suma total de cantidades)
      const totalQuantity = Object.values({ ...groupQuantities, [optionId]: newQuantity })
        .reduce((sum, qty) => sum + qty, 0);

      if (totalQuantity > group.maxSelections) {
        return prev; // No permitir exceder maxSelections
      }

      return {
        ...prev,
        [groupId]: {
          ...groupQuantities,
          [optionId]: newQuantity
        }
      };
    });

    // Agregar a selections si no está
    setSelections(prev => {
      const current = prev[groupId] || [];
      if (!current.includes(optionId)) {
        return { ...prev, [groupId]: [...current, optionId] };
      }
      return prev;
    });
  };

  // Decrementar cantidad de una opción
  const handleDecrement = (groupId: string, optionId: string) => {
    const group = modifierGroups.find(g => g.id === groupId);
    if (!group || !group.allowMultiple) return;

    setQuantities(prev => {
      const groupQuantities = prev[groupId] || {};
      const currentQuantity = groupQuantities[optionId] || 0;

      if (currentQuantity <= 0) return prev;

      const newQuantity = currentQuantity - 1;

      // Si llega a 0, remover de quantities y selections
      if (newQuantity === 0) {
        const { [optionId]: removed, ...restQuantities } = groupQuantities;

        // Verificar minSelections
        const totalQuantity = Object.values(restQuantities).reduce((sum, qty) => sum + qty, 0);
        if (group.required && totalQuantity < group.minSelections) {
          return prev; // No permitir bajar de minSelections
        }

        // Remover de selections
        setSelections(prevSel => {
          const current = prevSel[groupId] || [];
          return { ...prevSel, [groupId]: current.filter(id => id !== optionId) };
        });

        return {
          ...prev,
          [groupId]: restQuantities
        };
      }

      return {
        ...prev,
        [groupId]: {
          ...groupQuantities,
          [optionId]: newQuantity
        }
      };
    });
  };

  // Obtener cantidad de una opción
  const getQuantity = (groupId: string, optionId: string): number => {
    return quantities[groupId]?.[optionId] || 0;
  };

  // Validar si el grupo cumple los requisitos
  const isGroupValid = (group: ModifierGroup): boolean => {
    if (group.allowMultiple) {
      const groupQuantities = quantities[group.id] || {};
      const totalQuantity = Object.values(groupQuantities).reduce((sum, qty) => sum + qty, 0);

      if (group.required && totalQuantity < group.minSelections) {
        return false;
      }

      return true;
    } else {
      const selectedCount = (selections[group.id] || []).length;

      if (group.required && selectedCount < group.minSelections) {
        return false;
      }

      return true;
    }
  };

  // Obtener el texto de ayuda para el grupo
  const getGroupHelpText = (group: ModifierGroup): string => {
    if (!group.allowMultiple) {
      return group.required ? 'Selecciona una opción' : 'Opcional';
    }

    const min = group.minSelections;
    const max = group.maxSelections;
    const groupQuantities = quantities[group.id] || {};
    const totalQuantity = Object.values(groupQuantities).reduce((sum, qty) => sum + qty, 0);

    if (group.required) {
      if (min === max) {
        return `Selecciona ${min} ${totalQuantity > 0 ? `(${totalQuantity}/${min})` : ''}`;
      }
      return `Selecciona entre ${min} y ${max} ${totalQuantity > 0 ? `(${totalQuantity})` : ''}`;
    }

    return `Hasta ${max} opciones ${totalQuantity > 0 ? `(${totalQuantity}/${max})` : ''}`;
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
                const quantity = getQuantity(group.id, option.id);
                const isSelected = quantity > 0 || (selections[group.id] || []).includes(option.id);
                const inputName = `modifier-group-${group.id}`;

                if (group.allowMultiple) {
                  // Modo con contadores + y -
                  return (
                    <div
                      key={option.id}
                      className={`nbd-modifier-option nbd-modifier-option--quantity ${quantity > 0 ? 'nbd-modifier-option--selected' : ''}`}
                    >
                      <div className="nbd-modifier-option-content">
                        <span className="nbd-modifier-option-name">{option.name}</span>
                        <span className="nbd-modifier-option-price-info">
                          {option.priceModifier !== 0 && (
                            <span className="nbd-modifier-option-price">
                              {option.priceModifier > 0 ? '+' : ''}
                              {formatPrice(option.priceModifier, currency)}
                              {quantity > 1 && <span className="nbd-modifier-multiplier"> x{quantity}</span>}
                            </span>
                          )}
                        </span>
                      </div>
                      <div className="nbd-modifier-quantity-controls">
                        <button
                          type="button"
                          className="nbd-modifier-btn nbd-modifier-btn--minus"
                          onClick={() => handleDecrement(group.id, option.id)}
                          disabled={quantity === 0}
                          aria-label="Disminuir cantidad"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                        <span className="nbd-modifier-quantity">{quantity}</span>
                        <button
                          type="button"
                          className="nbd-modifier-btn nbd-modifier-btn--plus"
                          onClick={() => handleIncrement(group.id, option.id)}
                          aria-label="Aumentar cantidad"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                          </svg>
                        </button>
                      </div>
                    </div>
                  );
                } else {
                  // Modo radio tradicional
                  return (
                    <label
                      key={option.id}
                      className={`nbd-modifier-option ${isSelected ? 'nbd-modifier-option--selected' : ''}`}
                    >
                      <input
                        type="radio"
                        name={inputName}
                        checked={isSelected}
                        onChange={() => handleOptionChange(group.id, option.id)}
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
                }
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
