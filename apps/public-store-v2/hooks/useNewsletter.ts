import { useState } from 'react'

export function useNewsletter() {
  const [isSubscribing, setIsSubscribing] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)

  const subscribe = async (email: string) => {
    if (!email) return

    setIsSubscribing(true)
    
    try {
      // Simulación de suscripción (mantener la misma lógica que existe)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      setIsSubscribed(true)
      
      // Reset después de 3 segundos
      setTimeout(() => {
        setIsSubscribed(false)
        setIsSubscribing(false)
      }, 3000)
      
    } catch (error) {
      setIsSubscribing(false)
      console.error('Error subscribing to newsletter:', error)
    }
  }

  return {
    isSubscribing,
    isSubscribed,
    subscribe
  }
}