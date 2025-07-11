// Configuración centralizada para el manejo de estados de carga
export const LOADING_CONFIG = {
  // Tiempo mínimo de carga para evitar flickers
  MIN_LOADING_TIME: 300,
  
  // Timeout para operaciones de carga
  LOADING_TIMEOUT: 10000,
  
  // Configuración para importaciones dinámicas
  DYNAMIC_IMPORT_CONFIG: {
    ssr: false, // Evitar problemas de hidratación
    loading: () => null, // Sin spinner para evitar flickers
  },
  
  // Mensajes de carga
  LOADING_MESSAGES: {
    store: 'Cargando tienda...',
    products: 'Cargando productos...',
    categories: 'Cargando categorías...',
    general: 'Cargando...',
    error: 'Error al cargar'
  }
} as const

// Función helper para crear un delay mínimo
export const withMinDelay = async <T>(
  promise: Promise<T>, 
  minDelay: number = LOADING_CONFIG.MIN_LOADING_TIME
): Promise<T> => {
  const [result] = await Promise.all([
    promise,
    new Promise(resolve => setTimeout(resolve, minDelay))
  ])
  return result
}

// Función helper para timeout
export const withTimeout = <T>(
  promise: Promise<T>, 
  timeout: number = LOADING_CONFIG.LOADING_TIMEOUT
): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeout)
    )
  ])
}

// Función helper para carga robusta con timeout y delay mínimo
export const robustLoad = async <T>(
  promise: Promise<T>,
  options: {
    minDelay?: number
    timeout?: number
  } = {}
): Promise<T> => {
  const { minDelay = LOADING_CONFIG.MIN_LOADING_TIME, timeout = LOADING_CONFIG.LOADING_TIMEOUT } = options
  
  return withMinDelay(
    withTimeout(promise, timeout),
    minDelay
  )
} 