import { useState } from 'react'
import { subscribeToNewsletter, NewsletterResult, NewsletterSubscription } from '../newsletter'

export interface UseNewsletterReturn {
  email: string
  setEmail: (email: string) => void
  isSubmitting: boolean
  result: NewsletterResult | null
  subscribe: (source?: NewsletterSubscription['source']) => Promise<void>
  reset: () => void
}

export const useNewsletter = (storeId: string): UseNewsletterReturn => {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [result, setResult] = useState<NewsletterResult | null>(null)

  const subscribe = async (source: NewsletterSubscription['source'] = 'footer') => {
    if (!email.trim()) {
      setResult({
        success: false,
        message: 'Por favor, introduce tu email'
      })
      return
    }

    setIsSubmitting(true)
    setResult(null)

    try {
      const subscriptionResult = await subscribeToNewsletter(storeId, email, source)
      setResult(subscriptionResult)

      // Si fue exitoso, limpiar el email
      if (subscriptionResult.success) {
        setEmail('')
      }
    } catch (error) {
      console.error('Error in newsletter subscription:', error)
      setResult({
        success: false,
        message: 'Hubo un error inesperado. Por favor, inténtalo de nuevo.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setEmail('')
    setResult(null)
    setIsSubmitting(false)
  }

  return {
    email,
    setEmail,
    isSubmitting,
    result,
    subscribe,
    reset
  }
} 