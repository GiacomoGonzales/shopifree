import Stripe from 'stripe'

// Stripe server-side client
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
  typescript: true,
})

// Price IDs for each plan (set these in your environment variables)
export const STRIPE_PRICES = {
  starter: process.env.STRIPE_STARTER_PRICE_ID!,
  premium: process.env.STRIPE_PREMIUM_PRICE_ID!,
  pro: process.env.STRIPE_PRO_PRICE_ID!,
} as const

export type StripePlan = keyof typeof STRIPE_PRICES

// Helper to get price ID for a plan
export const getPriceIdForPlan = (plan: StripePlan): string => {
  return STRIPE_PRICES[plan]
}

// Validate that a plan is valid for Stripe checkout
export const isValidStripePlan = (plan: string): plan is StripePlan => {
  return plan in STRIPE_PRICES
}
