/**
 * Script de migración para normalizar tokens de Google Search Console en BD
 * 
 * Este script se puede ejecutar una vez para limpiar datos existentes
 * o aplicar en el admin cuando se guarde la configuración
 */

import { normalizeGoogleVerificationForDB } from './google-verification';

/**
 * Función para aplicar en el admin cuando se guarde googleSearchConsole
 */
export function sanitizeGoogleVerificationInput(userInput: string | null | undefined): string | null {
  const normalized = normalizeGoogleVerificationForDB(userInput);
  
  if (!normalized && userInput) {
    // Log para debugging si el input fue rechazado
    console.warn('🔧 [GSC] Valor de Google Search Console inválido rechazado:', {
      input: userInput,
      reason: 'Formato no reconocido o token inválido'
    });
  }
  
  return normalized;
}

/**
 * Función para migrar datos existentes en BD (ejecutar una vez)
 * 
 * Uso ejemplo:
 * ```typescript
 * const stores = await getAllStores();
 * for (const store of stores) {
 *   if (store.googleSearchConsole) {
 *     const normalized = sanitizeGoogleVerificationInput(store.googleSearchConsole);
 *     if (normalized !== store.googleSearchConsole) {
 *       await updateStore(store.id, { googleSearchConsole: normalized });
 *       console.log(`Migrado ${store.id}: ${store.googleSearchConsole} → ${normalized}`);
 *     }
 *   }
 * }
 * ```
 */
/**
 * Aplica la normalización a un valor existente
 */
function migrate(currentValue: string | null | undefined) {
  const original = currentValue;
  const normalized = normalizeGoogleVerificationForDB(currentValue);
  
  return {
    changed: original !== normalized,
    original,
    normalized,
    shouldUpdate: original !== normalized
  };
}

export function createGoogleVerificationMigration() {
  return {
    migrate,
    
    /**
     * Valida múltiples valores y retorna un reporte
     */
    validateBatch: (values: Array<{ id: string; googleSearchConsole: string | null | undefined }>) => {
      const results = values.map(item => ({
        id: item.id,
        ...migrate(item.googleSearchConsole)
      }));
      
      const needsUpdate = results.filter(r => r.shouldUpdate);
      
      return {
        total: results.length,
        needsUpdate: needsUpdate.length,
        items: results,
        summary: {
          valid: results.filter(r => r.normalized !== null).length,
          invalid: results.filter(r => r.original && r.normalized === null).length,
          empty: results.filter(r => !r.original).length
        }
      };
    }
  };
}
