import { Timestamp } from 'firebase/firestore'
import { UserDocument, getUserDocument, updateUserDocument } from './user'

// =============================================================================
// STORE MODE: Catálogo (gratis) vs Tienda (premium)
// =============================================================================

export type StoreMode = 'catalog' | 'store'

// Features disponibles en modo Catálogo (gratis)
export const CATALOG_MODE_FEATURES = {
  maxProducts: 20,
  maxPhotosPerProduct: 1,
  hasWhatsAppCheckout: true,
  hasCategories: false,
  hasVariants: false,
  hasBrands: false,
  hasCollections: false,
  hasCustomDomain: false,
  hasIntegratedPayments: false,
  hasTraditionalCheckout: false,
  hasCartRecovery: false,
  hasAutoEmails: false,
  hasCoupons: false,
  hasPromotions: false,
  hasLoyaltyProgram: false,
  hasGoogleAnalytics: false,
  hasMetaPixel: false,
  hasCompleteReports: false,
  hasAdvancedSEO: false,
  hasShippingZones: false,
  showShopifreebranding: true, // Muestra "Creado con Shopifree"
} as const

// Features disponibles en modo Emprendedor ($1/mes)
export const STARTER_MODE_FEATURES = {
  maxProducts: 50,
  maxPhotosPerProduct: 5,
  hasWhatsAppCheckout: true,
  hasCategories: true,
  hasVariants: false,
  hasBrands: false,
  hasCollections: false,
  hasCustomDomain: false,
  hasIntegratedPayments: false,
  hasTraditionalCheckout: false,
  hasCartRecovery: false,
  hasAutoEmails: false,
  hasCoupons: false,
  hasPromotions: false,
  hasLoyaltyProgram: false,
  hasGoogleAnalytics: false,
  hasMetaPixel: false,
  hasCompleteReports: false,
  hasAdvancedSEO: false,
  hasShippingZones: false,
  showShopifreebranding: false, // Sin branding
} as const

// Features disponibles en modo Tienda (premium $5/mes)
export const STORE_MODE_FEATURES = {
  maxProducts: -1, // ilimitados
  maxPhotosPerProduct: 10,
  hasWhatsAppCheckout: true,
  hasCategories: true,
  hasVariants: true,
  hasBrands: true,
  hasCollections: true,
  hasCustomDomain: true,
  hasIntegratedPayments: true,
  hasTraditionalCheckout: true,
  hasCartRecovery: true,
  hasAutoEmails: true,
  hasCoupons: true,
  hasPromotions: true,
  hasLoyaltyProgram: true,
  hasGoogleAnalytics: true,
  hasMetaPixel: true,
  hasCompleteReports: true,
  hasAdvancedSEO: true,
  hasShippingZones: true,
  showShopifreebranding: false, // Sin branding
} as const

// Helper para obtener features según el modo
export const getModeFeatures = (mode: StoreMode) => {
  return mode === 'catalog' ? CATALOG_MODE_FEATURES : STORE_MODE_FEATURES
}

// Helper para verificar si una feature está disponible en un modo
export const hasFeatureInMode = (mode: StoreMode, feature: keyof typeof STORE_MODE_FEATURES): boolean => {
  const features = getModeFeatures(mode)
  const value = features[feature]
  if (typeof value === 'boolean') return value
  if (typeof value === 'number') return value !== 0
  return false
}

// =============================================================================
// PLAN DEFINITIONS (Legacy - mantener compatibilidad)
// =============================================================================

// Plan definitions matching landing page pricing
export const PLAN_FEATURES = {
  free: {
    name: 'Catalogo',
    storeMode: 'catalog' as StoreMode,
    maxProducts: 20,
    maxPhotosPerProduct: 1,
    hasCategories: false,
    hasCustomDomain: false,
    hasIntegratedPayments: false,
    hasTraditionalCheckout: false,
    hasCartRecovery: false,
    hasAutoEmails: false,
    hasGoogleAnalytics: false,
    hasMetaPixel: false,
    hasCompleteReports: false,
    hasUnlimitedProducts: false,
    hasInternationalSales: false,
    hasMultipleLanguages: false,
    hasCustomerSegmentation: false,
    hasAdvancedMarketing: false,
    hasExclusiveThemes: false,
    hasPrioritySupport: false,
    hasAIImageEnhancement: false,
    aiEnhancementsPerMonth: 0,
    showShopifreebranding: true,
    stripePriceId: null
  },
  starter: {
    name: 'Emprendedor',
    storeMode: 'catalog' as StoreMode, // Sigue siendo catálogo pero con más features
    maxProducts: 50,
    maxPhotosPerProduct: 5,
    hasCategories: true,
    hasCustomDomain: false,
    hasIntegratedPayments: false,
    hasTraditionalCheckout: false,
    hasCartRecovery: false,
    hasAutoEmails: false,
    hasGoogleAnalytics: false,
    hasMetaPixel: false,
    hasCompleteReports: false,
    hasUnlimitedProducts: false,
    hasInternationalSales: false,
    hasMultipleLanguages: false,
    hasCustomerSegmentation: false,
    hasAdvancedMarketing: false,
    hasExclusiveThemes: false,
    hasPrioritySupport: false,
    hasAIImageEnhancement: false,
    aiEnhancementsPerMonth: 0,
    showShopifreebranding: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_STARTER_PRICE_ID || null
  },
  premium: {
    name: 'Tienda',
    storeMode: 'store' as StoreMode,
    maxProducts: -1, // ilimitados
    maxPhotosPerProduct: 10,
    hasCategories: true,
    hasCustomDomain: true,
    hasIntegratedPayments: true,
    hasTraditionalCheckout: true,
    hasCartRecovery: true,
    hasAutoEmails: true,
    hasGoogleAnalytics: true,
    hasMetaPixel: true,
    hasCompleteReports: true,
    hasUnlimitedProducts: true,
    hasInternationalSales: false,
    hasMultipleLanguages: false,
    hasCustomerSegmentation: false,
    hasAdvancedMarketing: false,
    hasExclusiveThemes: false,
    hasPrioritySupport: false,
    hasAIImageEnhancement: true,
    aiEnhancementsPerMonth: 5,
    showShopifreebranding: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PREMIUM_PRICE_ID || null
  },
  pro: {
    name: 'Pro',
    storeMode: 'store' as StoreMode,
    maxProducts: -1, // -1 = unlimited
    maxPhotosPerProduct: 10,
    hasCategories: true,
    hasCustomDomain: true,
    hasIntegratedPayments: true,
    hasTraditionalCheckout: true,
    hasCartRecovery: true,
    hasAutoEmails: true,
    hasGoogleAnalytics: true,
    hasMetaPixel: true,
    hasCompleteReports: true,
    hasUnlimitedProducts: true,
    hasInternationalSales: true,
    hasMultipleLanguages: true,
    hasCustomerSegmentation: true,
    hasAdvancedMarketing: true,
    hasExclusiveThemes: true,
    hasPrioritySupport: true,
    hasAIImageEnhancement: true,
    aiEnhancementsPerMonth: 15,
    showShopifreebranding: false,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID || null
  }
} as const

export type PlanType = keyof typeof PLAN_FEATURES
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired' | 'free'

// Helper para obtener el modo de tienda según el plan
export const getStoreModeFromPlan = (plan: PlanType): StoreMode => {
  return PLAN_FEATURES[plan].storeMode
}

// Helper para verificar si el usuario está en modo catálogo
export const isInCatalogMode = (plan: PlanType): boolean => {
  return getStoreModeFromPlan(plan) === 'catalog'
}

// Helper para verificar si el usuario está en modo tienda
export const isInStoreMode = (plan: PlanType): boolean => {
  return getStoreModeFromPlan(plan) === 'store'
}

/**
 * Start a 30-day trial of Premium plan for new user
 * Called during user registration
 */
export const startPremiumTrial = async (uid: string): Promise<void> => {
  try {
    const now = Timestamp.now()
    const trialEndDate = Timestamp.fromMillis(now.toMillis() + (30 * 24 * 60 * 60 * 1000)) // 30 days

    await updateUserDocument(uid, {
      subscriptionStatus: 'trial',
      subscriptionPlan: 'premium',
      trialStartDate: now,
      trialEndDate: trialEndDate,
      features: PLAN_FEATURES.premium
    })

    console.log('✅ Premium trial started for user:', uid, 'until:', trialEndDate.toDate())
  } catch (error) {
    console.error('Error starting trial:', error)
    throw error
  }
}

/**
 * Get subscription status and details for a user
 */
export const getSubscriptionStatus = async (uid: string): Promise<{
  status: SubscriptionStatus
  plan: PlanType
  trialDaysRemaining?: number
  trialEndDate?: Date
  isExpired: boolean
  features: typeof PLAN_FEATURES[PlanType]
}> => {
  try {
    const userData = await getUserDocument(uid)

    if (!userData) {
      throw new Error('User not found')
    }

    // Default to free if no subscription data
    if (!userData.subscriptionStatus || !userData.subscriptionPlan) {
      return {
        status: 'free',
        plan: 'free',
        isExpired: false,
        features: PLAN_FEATURES.free
      }
    }

    const status = userData.subscriptionStatus as SubscriptionStatus
    const plan = userData.subscriptionPlan as PlanType

    // Check if trial is expired
    if (status === 'trial' && userData.trialEndDate) {
      const now = Date.now()
      const trialEnd = (userData.trialEndDate as Timestamp).toMillis()
      const isExpired = now > trialEnd

      if (isExpired) {
        // Auto-downgrade to free if trial expired
        await downgradeToFree(uid)
        return {
          status: 'free',
          plan: 'free',
          isExpired: true,
          features: PLAN_FEATURES.free
        }
      }

      // Trial still active
      const diffTime = trialEnd - now
      const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

      return {
        status: 'trial',
        plan,
        trialDaysRemaining: daysRemaining,
        trialEndDate: new Date(trialEnd),
        isExpired: false,
        features: PLAN_FEATURES[plan]
      }
    }

    // Active subscription
    if (status === 'active') {
      return {
        status: 'active',
        plan,
        isExpired: false,
        features: PLAN_FEATURES[plan]
      }
    }

    // Default to free
    return {
      status: 'free',
      plan: 'free',
      isExpired: false,
      features: PLAN_FEATURES.free
    }
  } catch (error) {
    console.error('Error getting subscription status:', error)
    throw error
  }
}

/**
 * Downgrade user to free plan (after trial expires)
 */
export const downgradeToFree = async (uid: string): Promise<void> => {
  try {
    await updateUserDocument(uid, {
      subscriptionStatus: 'free',
      subscriptionPlan: 'free',
      features: PLAN_FEATURES.free
    })

    console.log('✅ User downgraded to free plan:', uid)
  } catch (error) {
    console.error('Error downgrading to free:', error)
    throw error
  }
}

/**
 * Upgrade user to paid plan (called manually by admin after payment)
 */
export const upgradeToPaidPlan = async (uid: string, plan: 'premium' | 'pro'): Promise<void> => {
  try {
    const now = Timestamp.now()

    await updateUserDocument(uid, {
      subscriptionStatus: 'active',
      subscriptionPlan: plan,
      subscriptionStartDate: now,
      features: PLAN_FEATURES[plan]
    })

    console.log('✅ User upgraded to', plan, 'plan:', uid)
  } catch (error) {
    console.error('Error upgrading to paid plan:', error)
    throw error
  }
}

/**
 * Check if user has access to a specific feature
 */
export const hasFeatureAccess = async (uid: string, feature: keyof typeof PLAN_FEATURES['premium']): Promise<boolean> => {
  try {
    const subscriptionStatus = await getSubscriptionStatus(uid)

    // Special handling for maxProducts
    if (feature === 'maxProducts') {
      return true // Always allow checking, actual limit is returned
    }

    return subscriptionStatus.features[feature] === true
  } catch (error) {
    console.error('Error checking feature access:', error)
    return false
  }
}

/**
 * Get the maximum products allowed for a user
 */
export const getMaxProductsLimit = async (uid: string): Promise<number> => {
  try {
    const subscriptionStatus = await getSubscriptionStatus(uid)
    const maxProducts = subscriptionStatus.features.maxProducts

    // -1 means unlimited
    if (maxProducts === -1) {
      return Infinity
    }

    return maxProducts || 0
  } catch (error) {
    console.error('Error getting max products limit:', error)
    return 0
  }
}

/**
 * Check if user can create more products
 */
export const canCreateMoreProducts = async (uid: string, currentProductCount: number): Promise<{
  canCreate: boolean
  limit: number
  current: number
}> => {
  try {
    const maxProducts = await getMaxProductsLimit(uid)

    return {
      canCreate: currentProductCount < maxProducts,
      limit: maxProducts === Infinity ? -1 : maxProducts,
      current: currentProductCount
    }
  } catch (error) {
    console.error('Error checking product creation:', error)
    return {
      canCreate: false,
      limit: 0,
      current: currentProductCount
    }
  }
}

/**
 * Cancel subscription (user keeps access until end of billing period)
 */
export const cancelSubscription = async (uid: string): Promise<void> => {
  try {
    await updateUserDocument(uid, {
      subscriptionStatus: 'cancelled'
    })

    console.log('✅ Subscription cancelled for user:', uid)
  } catch (error) {
    console.error('Error cancelling subscription:', error)
    throw error
  }
}

