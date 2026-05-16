import Link from 'next/link'
import { createServerSupabaseClient } from '@/lib/supabase-server'
import { calculateBMR, calculateTDEE, getCalorieTarget } from '@/lib/tdee'
import type { ActivityLevel, Goal, Gender } from '@/lib/tdee'

export default async function NextStepsPage() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  let target: number | null = null

  if (user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('age, gender, weight_kg, height_cm, activity_level, goal')
      .eq('id', user.id)
      .single()

    if (profile?.age && profile.gender && profile.weight_kg && profile.height_cm && profile.activity_level && profile.goal) {
      const bmr = calculateBMR({
        age:       profile.age,
        gender:    profile.gender as Gender,
        weight_kg: profile.weight_kg,
        height_cm: profile.height_cm,
      })
      const tdee = calculateTDEE(bmr, profile.activity_level as ActivityLevel)
      target = getCalorieTarget(tdee, profile.goal as Goal)
    }
  }

  return (
    <div className="max-w-lg mx-auto text-center pt-8">

      <div className="text-5xl mb-4">🎉</div>
      <h1 className="text-3xl font-extrabold text-gray-900 mb-2">You&apos;re all set!</h1>

      {target ? (
        <p className="text-gray-500 mb-2 text-lg">
          Your daily calorie target is
        </p>
      ) : (
        <p className="text-gray-500 mb-8 text-lg">What would you like to do first?</p>
      )}

      {target && (
        <div className="inline-block bg-green-600 text-white text-5xl font-extrabold px-8 py-4 rounded-2xl mb-8">
          {target.toLocaleString()} <span className="text-2xl font-normal text-green-200">cal / day</span>
        </div>
      )}

      <p className="text-gray-500 mb-8">What would you like to do first?</p>

      <div className="grid grid-cols-2 gap-4">
        <Link
          href="/tracker"
          className="flex flex-col items-center gap-3 bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-green-400 hover:bg-green-50 transition-all"
        >
          <span className="text-4xl">📋</span>
          <span className="font-bold text-gray-900">Log my food</span>
          <span className="text-xs text-gray-400 text-center">Track today&apos;s meals and calories</span>
        </Link>

        <Link
          href="/plan"
          className="flex flex-col items-center gap-3 bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-purple-400 hover:bg-purple-50 transition-all"
        >
          <span className="text-4xl">✨</span>
          <span className="font-bold text-gray-900">Get AI meal plan</span>
          <span className="text-xs text-gray-400 text-center">7-day plan tailored to your goal</span>
        </Link>
      </div>

    </div>
  )
}
