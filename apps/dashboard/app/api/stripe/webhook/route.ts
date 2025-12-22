import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '../../../../lib/stripe'
import { getFirebaseServerDb } from '../../../../lib/firebase-server'
import { doc, updateDoc, Timestamp } from 'firebase/firestore'
import { PLAN_FEATURES, PlanType } from '../../../../lib/subscription-utils'
import Stripe from 'stripe'

// Disable body parsing, we need raw body for signature verification
export const dynamic = 'force-dynamic'

async function updateUserSubscription(
  userId: string,
  plan: PlanType,
  status: 'active' | 'cancelled' | 'expired',
  stripeCustomerId?: string,
  stripeSubscriptionId?: string
) {
  const db = getFirebaseServerDb()
  const userRef = doc(db, 'users', userId)

  const updateData: Record<string, unknown> = {
    subscriptionStatus: status,
    subscriptionPlan: plan,
    features: PLAN_FEATURES[plan],
    updatedAt: Timestamp.now(),
  }

  if (status === 'active') {
    updateData.subscriptionStartDate = Timestamp.now()
  }

  if (stripeCustomerId) {
    updateData.stripeCustomerId = stripeCustomerId
  }

  if (stripeSubscriptionId) {
    updateData.stripeSubscriptionId = stripeSubscriptionId
  }

  await updateDoc(userRef, updateData)
  console.log(`Updated subscription for user ${userId}: ${plan} (${status})`)
}

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')

  if (!signature) {
    return NextResponse.json({ error: 'No signature' }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error('Webhook signature verification failed:', err)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.userId
        const plan = session.metadata?.plan as PlanType

        if (userId && plan) {
          await updateUserSubscription(
            userId,
            plan,
            'active',
            session.customer as string,
            session.subscription as string
          )
        }
        break
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId
        const plan = subscription.metadata?.plan as PlanType

        if (userId && plan) {
          const status = subscription.status === 'active' ? 'active' : 'cancelled'
          await updateUserSubscription(userId, plan, status)
        }
        break
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription
        const userId = subscription.metadata?.userId

        if (userId) {
          await updateUserSubscription(userId, 'free', 'expired')
        }
        break
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        const subscriptionId = invoice.subscription as string

        if (subscriptionId) {
          const subscription = await stripe.subscriptions.retrieve(subscriptionId)
          const userId = subscription.metadata?.userId

          if (userId) {
            // Keep current plan but mark as having payment issues
            console.log(`Payment failed for user ${userId}`)
          }
        }
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('Webhook handler error:', error)
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 })
  }
}
