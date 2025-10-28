import { Timestamp } from 'firebase/firestore'
import { UserDocument, getUserDocument, updateUserDocument } from './user'

// Plan definitions matching landing page pricing
export const PLAN_FEATURES = {
  free: {
    name: 'Free',
    maxProducts: 12,
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
    aiEnhancementsPerMonth: 0
  },
  premium: {
    name: 'Premium',
    maxProducts: 50,
    hasCustomDomain: true,
    hasIntegratedPayments: true,
    hasTraditionalCheckout: true,
    hasCartRecovery: true,
    hasAutoEmails: true,
    hasGoogleAnalytics: true,
    hasMetaPixel: true,
    hasCompleteReports: true,
    hasUnlimitedProducts: false,
    hasInternationalSales: false,
    hasMultipleLanguages: false,
    hasCustomerSegmentation: false,
    hasAdvancedMarketing: false,
    hasExclusiveThemes: false,
    hasPrioritySupport: false,
    hasAIImageEnhancement: true,
    aiEnhancementsPerMonth: 50
  },
  pro: {
    name: 'Pro',
    maxProducts: -1, // -1 = unlimited
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
    aiEnhancementsPerMonth: -1 // -1 = unlimited
  }
} as const

export type PlanType = keyof typeof PLAN_FEATURES
export type SubscriptionStatus = 'trial' | 'active' | 'cancelled' | 'expired' | 'free'

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

/**
 * Get AI enhancement usage status for a user
 */
export const getAIEnhancementUsage = async (uid: string): Promise<{
  hasAccess: boolean
  used: number
  limit: number
  remaining: number
  isUnlimited: boolean
}> => {
  try {
    const userData = await getUserDocument(uid)
    if (!userData) {
      throw new Error('User not found')
    }

    const subscriptionStatus = await getSubscriptionStatus(uid)
    const limit = subscriptionStatus.features.aiEnhancementsPerMonth
    const hasAccess = subscriptionStatus.features.hasAIImageEnhancement

    // Si no tiene acceso, retornar 0
    if (!hasAccess) {
      return {
        hasAccess: false,
        used: 0,
        limit: 0,
        remaining: 0,
        isUnlimited: false
      }
    }

    // Si es ilimitado
    if (limit === -1) {
      return {
        hasAccess: true,
        used: userData.aiEnhancementsUsed || 0,
        limit: -1,
        remaining: -1,
        isUnlimited: true
      }
    }

    // Resetear contador si es un nuevo mes
    const now = new Date()
    const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    const lastResetMonth = userData.aiEnhancementsLastReset

    if (lastResetMonth !== currentMonth) {
      // Reset counter for new month
      await updateUserDocument(uid, {
        aiEnhancementsUsed: 0,
        aiEnhancementsLastReset: currentMonth
      })

      return {
        hasAccess: true,
        used: 0,
        limit,
        remaining: limit,
        isUnlimited: false
      }
    }

    const used = userData.aiEnhancementsUsed || 0
    const remaining = Math.max(0, limit - used)

    return {
      hasAccess: true,
      used,
      limit,
      remaining,
      isUnlimited: false
    }
  } catch (error) {
    console.error('Error getting AI enhancement usage:', error)
    throw error
  }
}

/**
 * Increment AI enhancement usage counter
 */
export const incrementAIEnhancementUsage = async (uid: string): Promise<boolean> => {
  try {
    const usage = await getAIEnhancementUsage(uid)

    // Check if user has access
    if (!usage.hasAccess) {
      console.log('❌ User does not have access to AI enhancements:', uid)
      return false
    }

    // Check if unlimited
    if (usage.isUnlimited) {
      // Just increment counter for stats, no limit check
      const userData = await getUserDocument(uid)
      const currentUsed = userData?.aiEnhancementsUsed || 0

      await updateUserDocument(uid, {
        aiEnhancementsUsed: currentUsed + 1
      })

      console.log('✅ AI enhancement used (unlimited):', uid)
      return true
    }

    // Check if under limit
    if (usage.remaining <= 0) {
      console.log('❌ AI enhancement limit reached:', uid, `(${usage.used}/${usage.limit})`)
      return false
    }

    // Increment usage
    const userData = await getUserDocument(uid)
    const currentUsed = userData?.aiEnhancementsUsed || 0

    await updateUserDocument(uid, {
      aiEnhancementsUsed: currentUsed + 1
    })

    console.log('✅ AI enhancement used:', uid, `(${currentUsed + 1}/${usage.limit})`)
    return true
  } catch (error) {
    console.error('Error incrementing AI enhancement usage:', error)
    return false
  }
}
