import { NextResponse } from 'next/server'
import { anthropic } from '@/lib/claude'
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase-server'
import { calculateBMR, calculateTDEE, getCalorieTarget } from '@/lib/tdee'
import type { ActivityLevel, Goal, Gender } from '@/lib/tdee'

async function getIsPro(userId: string): Promise<boolean> {
  const supabase = createAdminSupabaseClient()
  const { data } = await supabase
    .from('subscriptions')
    .select('status')
    .eq('user_id', userId)
    .single()
  return data?.status === 'active' || data?.status === 'trialing'
}

const goalLabel: Record<Goal, string> = {
  lose:     'lose weight (calorie deficit)',
  maintain: 'maintain their current weight',
  gain:     'gain weight (lean bulk)',
}

export async function POST() {
  const supabase = createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const isPro = await getIsPro(user.id)
  if (!isPro) {
    return NextResponse.json({ error: 'Pro subscription required' }, { status: 403 })
  }

  const admin = createAdminSupabaseClient()
  const { data: profile } = await admin
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!profile?.age || !profile?.gender || !profile?.weight_kg || !profile?.height_cm) {
    return NextResponse.json(
      { error: 'Please complete your profile in the Calculator page first.' },
      { status: 400 }
    )
  }

  const bmr    = calculateBMR({ weight_kg: profile.weight_kg, height_cm: profile.height_cm, age: profile.age, gender: profile.gender as Gender })
  const tdee   = calculateTDEE(bmr, profile.activity_level as ActivityLevel)
  const target = getCalorieTarget(tdee, profile.goal as Goal)

  const prompt = `You are a nutrition expert. Create a 7-day meal plan for someone who wants to ${goalLabel[profile.goal as Goal]}.

Their daily calorie target: ${target} calories.

Return ONLY valid JSON with no markdown formatting, no code blocks, no explanation. Use exactly this structure:

{
  "days": [
    {
      "day": "Monday",
      "total_calories": ${target},
      "meals": [
        {
          "type": "breakfast",
          "name": "Meal name here",
          "calories": 400,
          "protein_g": 25,
          "carbs_g": 45,
          "fat_g": 12
        }
      ],
      "macros": {
        "protein_g": 140,
        "carbs_g": 180,
        "fat_g": 55
      }
    }
  ]
}

Rules:
- Include breakfast, lunch, dinner, and one snack for every day.
- Each day's total_calories should be within 50 calories of ${target}.
- Use realistic, everyday foods. Vary the meals across the 7 days.
- The macros in each day's "macros" object must be the sum of all meals for that day.`

  try {
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      messages: [{ role: 'user', content: prompt }],
    })

    const content = message.content[0]
    if (content.type !== 'text') {
      throw new Error('Unexpected response from AI')
    }

    const planData = JSON.parse(content.text)

    const { data: saved } = await admin
      .from('calorie_plans')
      .insert({ user_id: user.id, plan_data: planData, tdee, goal: profile.goal })
      .select('id')
      .single()

    return NextResponse.json({ plan: planData, id: saved?.id })
  } catch (err) {
    console.error('Plan generation failed:', err)
    return NextResponse.json({ error: 'Failed to generate plan. Please try again.' }, { status: 500 })
  }
}
