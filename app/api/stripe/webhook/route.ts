import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

// Stripe calls this endpoint automatically after any payment event.
// We verify the request is really from Stripe, then update our database.
export async function POST(request: Request) {
  const body = await request.text()
  const sig  = headers().get('stripe-signature')

  if (!sig) {
    return NextResponse.json({ error: 'Missing stripe-signature header' }, { status: 400 })
  }

  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!)
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminSupabaseClient()

  // Payment succeeded — user just subscribed
  if (event.type === 'checkout.session.completed') {
    const session        = event.data.object as Stripe.Checkout.Session
    const userId         = session.metadata?.user_id
    const subscriptionId = session.subscription as string

    if (userId && subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      await supabase.from('subscriptions').upsert({
        user_id:                 userId,
        stripe_customer_id:      session.customer as string,
        stripe_subscription_id:  subscriptionId,
        status:                  sub.status,
        price_id:                sub.items.data[0].price.id,
        current_period_end:      new Date(sub.current_period_end * 1000).toISOString(),
      })
    }
  }

  // Subscription renewed — update the period end date
  if (event.type === 'invoice.paid') {
    const invoice        = event.data.object as Stripe.Invoice
    const subscriptionId = invoice.subscription as string

    if (subscriptionId) {
      const sub = await stripe.subscriptions.retrieve(subscriptionId)
      await supabase.from('subscriptions')
        .update({
          status:             sub.status,
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        })
        .eq('stripe_subscription_id', subscriptionId)
    }
  }

  // Subscription cancelled
  if (event.type === 'customer.subscription.deleted') {
    const sub = event.data.object as Stripe.Subscription
    await supabase.from('subscriptions')
      .update({ status: 'canceled' })
      .eq('stripe_subscription_id', sub.id)
  }

  // Payment failed — mark as past due so we can show a warning
  if (event.type === 'invoice.payment_failed') {
    const invoice        = event.data.object as Stripe.Invoice
    const subscriptionId = invoice.subscription as string
    if (subscriptionId) {
      await supabase.from('subscriptions')
        .update({ status: 'past_due' })
        .eq('stripe_subscription_id', subscriptionId)
    }
  }

  return NextResponse.json({ received: true })
}
