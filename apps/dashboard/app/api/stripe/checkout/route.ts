import { NextRequest, NextResponse } from 'next/server'
import { stripe, getPriceIdForPlan, isValidStripePlan } from '../../../../lib/stripe'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { plan, userId, userEmail } = body

    if (!plan || !userId) {
      return NextResponse.json(
        { error: 'Plan and userId are required' },
        { status: 400 }
      )
    }

    if (!isValidStripePlan(plan)) {
      return NextResponse.json(
        { error: 'Invalid plan' },
        { status: 400 }
      )
    }

    const priceId = getPriceIdForPlan(plan)

    if (!priceId) {
      return NextResponse.json(
        { error: 'Price not configured for this plan' },
        { status: 500 }
      )
    }

    // Get the origin for success/cancel URLs
    const origin = request.headers.get('origin') || 'https://dashboard.shopifree.app'

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/pricing?cancelled=true`,
      customer_email: userEmail || undefined,
      metadata: {
        userId,
        plan,
      },
      subscription_data: {
        metadata: {
          userId,
          plan,
        },
      },
      allow_promotion_codes: true,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    console.error('Stripe checkout error:', error)
    return NextResponse.json(
      { error: 'Error creating checkout session' },
      { status: 500 }
    )
  }
}
