import { NextResponse } from 'next/server'
import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL!

  const params = new URLSearchParams({
    userSecretKey:           process.env.TOYYIBPAY_SECRET_KEY!,
    categoryCode:            process.env.TOYYIBPAY_CATEGORY_CODE!,
    billName:                'CalorieApp Pro',
    billDescription:         'Monthly Pro subscription',
    billPriceSetting:        '1',
    billPayorInfo:           '0',
    billAmount:              '900',       // RM 9.00 in sen
    billReturnUrl:           `${appUrl}/plan?success=true`,
    billCallbackUrl:         `${appUrl}/api/toyyibpay/callback`,
    billExternalReferenceNo: user.id,
    billTo:                  user.email ?? '',
    billEmail:               user.email ?? '',
    billPhone:               '',
    billSplitPayment:        '0',
    billSplitPaymentArgs:    '',
    billPaymentChannel:      '0',         // 0 = all channels (TNG, FPX, card)
    billContentEmail:        'Thank you for subscribing to CalorieApp Pro!',
    billChargeToCustomer:    '1',
  })

  try {
    const res = await fetch('https://toyyibpay.com/index.php/api/createBill', {
      method:  'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body:    params.toString(),
    })

    const data = await res.json()

    if (!data[0]?.BillCode) {
      console.error('Toyyibpay error:', JSON.stringify(data))
      return NextResponse.json({ error: `Toyyibpay: ${JSON.stringify(data)}` }, { status: 500 })
    }

    return NextResponse.json({ url: `https://toyyibpay.com/${data[0].BillCode}` })
  } catch {
    return NextResponse.json({ error: 'Payment service unavailable' }, { status: 500 })
  }
}
