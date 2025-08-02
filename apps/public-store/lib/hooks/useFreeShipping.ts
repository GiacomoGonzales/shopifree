import { useMemo } from 'react'
import { useStore } from '../store-context'
import { getCurrencySymbol } from '../store'

interface FreeShippingCalculation {
  isEnabled: boolean
  threshold: number
  isEligible: boolean
  amountNeeded: number
  message: string
  currencySymbol: string
}

export function useFreeShipping(currentTotal: number): FreeShippingCalculation {
  const { store } = useStore()

  return useMemo(() => {
    const currencySymbol = getCurrencySymbol(store?.currency || 'USD')
    
    // Verificar si el envío gratuito está habilitado
    const isEnabled = store?.advanced?.shipping?.additionalRules?.enableFreeShipping || false
    const threshold = store?.advanced?.shipping?.additionalRules?.freeShippingThreshold || 0

    if (!isEnabled || threshold <= 0) {
      return {
        isEnabled: false,
        threshold: 0,
        isEligible: false,
        amountNeeded: 0,
        message: '',
        currencySymbol
      }
    }

    const isEligible = currentTotal >= threshold
    const amountNeeded = isEligible ? 0 : threshold - currentTotal

    let message = ''
    if (isEligible) {
      message = '¡Envío gratuito aplicado!'
    } else {
      message = `Envío gratis desde ${currencySymbol} ${threshold.toFixed(2)}`
    }

    return {
      isEnabled,
      threshold,
      isEligible,
      amountNeeded,
      message,
      currencySymbol
    }
  }, [store, currentTotal])
}

export function getFreeShippingMessage(
  isEligible: boolean,
  amountNeeded: number,
  currencySymbol: string
): string {
  if (isEligible) {
    return '¡Felicidades! Tu envío es gratis'
  } else {
    return `Te faltan ${currencySymbol} ${amountNeeded.toFixed(2)} para envío gratis`
  }
}