import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Called when the user clicks "Upgrade to Pro"
// Creates a Stripe Checkout session and returns the URL to redirect to
export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      customer_email: user.email,
      metadata: { user_id: user.id },
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/plan?success=true`,
      cancel_url:  `${process.env.NEXT_PUBLIC_APP_URL}/plan`,
    })

    return NextResponse.json({ url: session.url })
  } catch {
    return NextResponse.json({ error: 'Could not create checkout session' }, { status: 500 })
  }
}
