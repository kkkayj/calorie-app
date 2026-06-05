import { createServerSupabaseClient } from '@/lib/supabase-server'

export async function GET() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  const { data } = await supabase
    .from('calorie_logs')
    .select('logged_date')
    .eq('user_id', user.id)
    .order('logged_date', { ascending: false })
    .limit(365)

  if (!data || data.length === 0) return Response.json({ streak: 0 })

  const today     = new Date().toISOString().split('T')[0]
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
  const dates     = Array.from(new Set(data.map(r => r.logged_date))).sort().reverse()
  const mostRecent = dates[0]

  // Streak is broken if last log was before yesterday
  if (mostRecent !== today && mostRecent !== yesterday) {
    return Response.json({ streak: 0 })
  }

  // Count consecutive days going back from most recent date
  let streak = 0
  const cursor = new Date(mostRecent)

  for (const date of dates) {
    if (date === cursor.toISOString().split('T')[0]) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }

  return Response.json({ streak })
}
