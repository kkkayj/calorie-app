import { NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase-server'

// Toyyibpay POSTs here after every payment attempt.
// status_id: 1 = success, 2 = pending, 3 = failed
export async function POST(request: Request) {
  const body   = await request.text()
  const params = new URLSearchParams(body)

  const statusId = params.get('status_id')
  const userId   = params.get('order_id')    // we set this to user.id in checkout
  const billCode = params.get('billcode')

  if (statusId !== '1' || !userId || !billCode) {
    return NextResponse.json({ ok: false })
  }

  const supabase  = createAdminSupabaseClient()
  const periodEnd = new Date()
  periodEnd.setDate(periodEnd.getDate() + 30)

  await supabase.from('subscriptions').upsert({
    user_id:                userId,
    stripe_customer_id:     billCode,
    stripe_subscription_id: billCode,
    status:                 'active',
    price_id:               'toyyibpay_pro_monthly',
    current_period_end:     periodEnd.toISOString(),
  })

  return NextResponse.json({ ok: true })
}
