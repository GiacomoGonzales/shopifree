/**
 * Z-Index System for Dashboard
 *
 * Consistent z-index values to avoid stacking context conflicts.
 * Each layer is spaced by 100 to allow sub-layers if needed.
 */

export const Z_INDEX = {
  // Base layers
  BASE: 1,
  CONTENT: 10,

  // Interactive elements
  DROPDOWN: 1000,
  TOOLTIP: 1100,
  POPOVER: 1200,

  // Overlays
  MODAL_BACKDROP: 2000,
  MODAL: 2010,
  DRAWER: 2020,

  // Notifications
  TOAST: 3000,
  ALERT: 3100,

  // Critical
  LOADING: 4000,
  DEBUG: 9999
} as const

export type ZIndexKey = keyof typeof Z_INDEX