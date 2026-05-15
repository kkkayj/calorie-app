import { NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createServerSupabaseClient } from '@/lib/supabase-server'

// Redirects the user to Stripe's hosted billing portal
// where they can cancel or update their payment method
export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { data: sub } = await supabase
    .from('subscriptions')
    .select('stripe_customer_id')
    .eq('user_id', user.id)
    .single()

  if (!sub?.stripe_customer_id) {
    return NextResponse.json({ error: 'No subscription found' }, { status: 404 })
  }

  const session = await stripe.billingPortal.sessions.create({
    customer:   sub.stripe_customer_id,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/plan`,
  })

  return NextResponse.json({ url: session.url })
}
