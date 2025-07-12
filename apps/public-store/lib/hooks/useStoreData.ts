import { useEffect, useState, useCallback } from 'react'
import { Tienda } from '../types'
import { getStoreCategories, Category } from '../categories'
import { getFeaturedProducts, PublicProduct } from '../products'
import { robustLoad } from '../loading-config'

interface StoreDataState {
  categories: Category[]
  products: PublicProduct[]
  messages: Record<string, unknown> | null
  isLoading: boolean
  error: string | null
}

interface UseStoreDataOptions {
  tienda: Tienda
  locale: string
  productsLimit?: number
}

export const useStoreData = ({ tienda, locale, productsLimit = 50 }: UseStoreDataOptions) => {
  const [state, setState] = useState<StoreDataState>({
    categories: [],
    products: [],
    messages: null,
    isLoading: true,
    error: null
  })

  const loadStoreData = useCallback(async () => {
    if (!tienda.id) {
      setState(prev => ({ ...prev, isLoading: false, error: 'ID de tienda no válido' }))
      return
    }

    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }))

      // Cargar todos los datos en paralelo con carga robusta
      const [messagesModule, categoriesData, productsData] = await Promise.all([
        robustLoad(
          import(`../../messages/common/${locale}.json`).catch(() => ({ default: {} })),
          { minDelay: 0 } // Sin delay para mensajes
        ),
        robustLoad(
          getStoreCategories(tienda.id).catch(error => {
            console.warn('Error loading categories:', error)
            return []
          })
        ),
        robustLoad(
          getFeaturedProducts(tienda.id, productsLimit).catch(error => {
            console.warn('Error loading products:', error)
            return []
          })
        )
      ])

      setState({
        categories: categoriesData,
        products: productsData,
        messages: messagesModule.default,
        isLoading: false,
        error: null
      })

    } catch (error) {
      console.error('Error loading store data:', error)
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Error al cargar los datos de la tienda'
      }))
    }
  }, [tienda.id, locale, productsLimit])

  useEffect(() => {
    loadStoreData()
  }, [loadStoreData])

  const refetch = useCallback(() => {
    loadStoreData()
  }, [loadStoreData])

  return {
    ...state,
    refetch
  }
} 