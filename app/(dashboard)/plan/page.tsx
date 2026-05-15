import { createServerSupabaseClient } from '@/lib/supabase-server'
import UpgradeCTA from './upgrade-cta'
import PlanGenerator from './plan-generator'

async function getSubscriptionStatus(userId: string) {
  const supabase = createServerSupabaseClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single()
  return data?.status ?? null
}

type Props = { searchParams: { success?: string } }

export default async function PlanPage({ searchParams }: Props) {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  const status = user ? await getSubscriptionStatus(user.id) : null
  const isPro  = status === 'active' || status === 'trialing'

  if (!isPro) {
    return <UpgradeCTA showSuccess={searchParams.success === 'true'} />
  }

  return <PlanGenerator />
}
