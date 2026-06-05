'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { calculateBMR, calculateTDEE, getCalorieTarget } from '@/lib/tdee'
import type { ActivityLevel, Goal, Gender } from '@/lib/tdee'

type Meal = {
  type: string
  name: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

type Day = {
  day: string
  total_calories: number
  meals: Meal[]
  macros: { protein_g: number; carbs_g: number; fat_g: number }
}

type Plan = { days: Day[] }

type SavedPlan = { id: string; created_at: string; goal: string; tdee: number }

const SAMPLE_PLAN: Plan = {
  days: [
    {
      day: 'Monday', total_calories: 1840,
      macros: { protein_g: 148, carbs_g: 198, fat_g: 52 },
      meals: [
        { type: 'breakfast', name: 'Oats with banana and peanut butter',       calories: 420, protein_g: 15, carbs_g: 62, fat_g: 13 },
        { type: 'lunch',     name: 'Grilled chicken rice with salad',           calories: 580, protein_g: 48, carbs_g: 62, fat_g: 14 },
        { type: 'snack',     name: 'Greek yogurt with mixed berries',           calories: 180, protein_g: 18, carbs_g: 22, fat_g:  2 },
        { type: 'dinner',    name: 'Steamed fish with stir-fried vegetables',   calories: 660, protein_g: 67, carbs_g: 52, fat_g: 23 },
      ],
    },
    {
      day: 'Tuesday', total_calories: 1780,
      macros: { protein_g: 140, carbs_g: 190, fat_g: 50 },
      meals: [
        { type: 'breakfast', name: 'Eggs on wholegrain toast with avocado',     calories: 390, protein_g: 22, carbs_g: 34, fat_g: 18 },
        { type: 'lunch',     name: 'Nasi lemak with boiled egg (small portion)', calories: 550, protein_g: 24, carbs_g: 72, fat_g: 18 },
        { type: 'snack',     name: 'Apple with almond butter',                  calories: 200, protein_g:  5, carbs_g: 28, fat_g:  8 },
        { type: 'dinner',    name: 'Beef and vegetable stir-fry with brown rice', calories: 640, protein_g: 89, carbs_g: 56, fat_g:  6 },
      ],
    },
    {
      day: 'Wednesday', total_calories: 1810,
      macros: { protein_g: 142, carbs_g: 200, fat_g: 48 },
      meals: [
        { type: 'breakfast', name: 'Smoothie bowl with granola and fruit',      calories: 380, protein_g: 14, carbs_g: 64, fat_g:  8 },
        { type: 'lunch',     name: 'Chicken soup with noodles and veggies',     calories: 520, protein_g: 42, carbs_g: 58, fat_g: 12 },
        { type: 'snack',     name: 'Handful of mixed nuts',                     calories: 190, protein_g:  5, carbs_g: 10, fat_g: 16 },
        { type: 'dinner',    name: 'Salmon fillet with roasted sweet potato',   calories: 720, protein_g: 81, carbs_g: 68, fat_g: 12 },
      ],
    },
    {
      day: 'Thursday', total_calories: 1760,
      macros: { protein_g: 138, carbs_g: 185, fat_g: 53 },
      meals: [
        { type: 'breakfast', name: 'Roti canai (1 piece) with dhal',            calories: 400, protein_g: 14, carbs_g: 58, fat_g: 14 },
        { type: 'lunch',     name: 'Tuna salad wrap with hummus',               calories: 480, protein_g: 40, carbs_g: 52, fat_g: 13 },
        { type: 'snack',     name: 'Low-fat cottage cheese with cucumber',      calories: 160, protein_g: 20, carbs_g:  8, fat_g:  4 },
        { type: 'dinner',    name: 'Tom yam soup with tofu and mushrooms',      calories: 720, protein_g: 64, carbs_g: 67, fat_g: 22 },
      ],
    },
    {
      day: 'Friday', total_calories: 1820,
      macros: { protein_g: 145, carbs_g: 195, fat_g: 50 },
      meals: [
        { type: 'breakfast', name: 'Congee with shredded chicken',              calories: 360, protein_g: 28, carbs_g: 52, fat_g:  6 },
        { type: 'lunch',     name: 'Grilled prawn and vegetable fried rice',    calories: 580, protein_g: 34, carbs_g: 78, fat_g: 14 },
        { type: 'snack',     name: 'Edamame (1 cup)',                           calories: 190, protein_g: 17, carbs_g: 14, fat_g:  8 },
        { type: 'dinner',    name: 'Chicken breast with quinoa and broccoli',   calories: 690, protein_g: 66, carbs_g: 51, fat_g: 22 },
      ],
    },
    {
      day: 'Saturday', total_calories: 1900,
      macros: { protein_g: 150, carbs_g: 210, fat_g: 54 },
      meals: [
        { type: 'breakfast', name: 'Pancakes with honey and banana',            calories: 460, protein_g: 14, carbs_g: 82, fat_g: 10 },
        { type: 'lunch',     name: 'Beef rendang with cauliflower rice',        calories: 560, protein_g: 48, carbs_g: 28, fat_g: 26 },
        { type: 'snack',     name: 'Protein bar',                              calories: 220, protein_g: 20, carbs_g: 26, fat_g:  6 },
        { type: 'dinner',    name: 'Baked cod with roasted asparagus',          calories: 660, protein_g: 68, carbs_g: 74, fat_g: 12 },
      ],
    },
    {
      day: 'Sunday', total_calories: 1750,
      macros: { protein_g: 136, carbs_g: 186, fat_g: 50 },
      meals: [
        { type: 'breakfast', name: 'Scrambled eggs with spinach and tomato',   calories: 340, protein_g: 24, carbs_g: 14, fat_g: 20 },
        { type: 'lunch',     name: 'Chicken laksa (reduced coconut milk)',      calories: 580, protein_g: 42, carbs_g: 68, fat_g: 16 },
        { type: 'snack',     name: 'Watermelon slices',                        calories: 120, protein_g:  2, carbs_g: 30, fat_g:  0 },
        { type: 'dinner',    name: 'Grilled sirloin with sweet potato mash',   calories: 710, protein_g: 68, carbs_g: 74, fat_g: 14 },
      ],
    },
  ],
}

const mealEmoji: Record<string, string> = {
  breakfast: '🌅',
  lunch:     '☀️',
  dinner:    '🌙',
  snack:     '🍎',
}

const dayColors = [
  'from-violet-500 to-purple-600',
  'from-pink-500 to-rose-600',
  'from-orange-400 to-amber-500',
  'from-green-500 to-emerald-600',
  'from-blue-500 to-cyan-600',
  'from-teal-500 to-green-600',
  'from-indigo-500 to-violet-600',
]

const goalLabels: Record<string, string> = {
  lose:     'Lose weight',
  maintain: 'Maintain weight',
  gain:     'Gain weight',
}

function formatPlanDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short', year: 'numeric',
  })
}

export default function PlanGenerator() {
  const [plan,       setPlan]       = useState<Plan | null>(null)
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')
  const [isSample,   setIsSample]   = useState(false)

  const [isPro,      setIsPro]      = useState(false)
  const [savedPlans, setSavedPlans] = useState<SavedPlan[]>([])
  const [userTdee,   setUserTdee]   = useState<number | null>(null)
  const [userGoal,   setUserGoal]   = useState<string | null>(null)

  useEffect(() => {
    async function loadInitialData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Check isPro: owner email or active subscription
      const ownerEmail = process.env.NEXT_PUBLIC_OWNER_EMAIL
      const isOwner = ownerEmail ? user.email === ownerEmail : false
      if (!isOwner) {
        const { data: sub } = await supabase
          .from('subscriptions')
          .select('status')
          .eq('user_id', user.id)
          .single()
        const status = sub?.status ?? null
        setIsPro(status === 'active' || status === 'trialing')
      } else {
        setIsPro(true)
      }

      // Fetch profile to calculate TDEE
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile?.age && profile?.gender && profile?.weight_kg && profile?.height_cm && profile?.activity_level && profile?.goal) {
        const bmr  = calculateBMR({ weight_kg: profile.weight_kg, height_cm: profile.height_cm, age: profile.age, gender: profile.gender as Gender })
        const tdee = calculateTDEE(bmr, profile.activity_level as ActivityLevel)
        setUserTdee(getCalorieTarget(tdee, profile.goal as Goal))
        setUserGoal(profile.goal)
      }

      // Fetch saved plan history
      const { data: history } = await supabase
        .from('calorie_plans')
        .select('id, created_at, goal, tdee')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      setSavedPlans(history ?? [])
    }

    loadInitialData()
  }, [])

  function handlePreview() {
    setPlan(SAMPLE_PLAN)
    setIsSample(true)
  }

  async function handleGenerate() {
    setIsSample(false)
    setLoading(true)
    setError('')

    const res  = await fetch('/api/ai/generate-plan', { method: 'POST' })
    const data = await res.json()

    if (!res.ok || data.error) {
      setError(data.error ?? 'Something went wrong. Please try again.')
      setLoading(false)
      return
    }

    setPlan(data.plan)
    setLoading(false)

    // Save plan to calorie_plans — errors are non-blocking
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data: saved } = await supabase
          .from('calorie_plans')
          .insert({
            user_id:   user.id,
            plan_data: data.plan,
            tdee:      userTdee,
            goal:      userGoal,
          })
          .select('id, created_at, goal, tdee')
          .single()

        if (saved) {
          setSavedPlans(prev => [saved, ...prev])
        }
      }
    } catch {
      // Save failure is silently ignored — plan is still shown
    }
  }

  async function loadSavedPlan(savedPlanId: string) {
    const supabase = createClient()
    const { data } = await supabase
      .from('calorie_plans')
      .select('plan_data')
      .eq('id', savedPlanId)
      .single()

    if (data?.plan_data) {
      setPlan(data.plan_data as Plan)
      setIsSample(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Meal Plan</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-6xl mb-5 animate-bounce">🍽️</div>
          <p className="text-gray-800 font-semibold text-xl mb-2">Building your meal plan…</p>
          <p className="text-sm text-gray-400">This usually takes about 15 seconds</p>
          <div className="flex justify-center gap-2 mt-6">
            {['🥑','🍗','🥦','🍚','🫐'].map((e, i) => (
              <span key={i} className="text-2xl animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}>{e}</span>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // Plan history section — rendered as a sub-component to reuse in both states
  const planHistorySection = savedPlans.length > 0 ? (
    <div className="mt-8">
      <h2 className="text-base font-bold text-gray-800 mb-3">Past Plans</h2>
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {savedPlans.map((saved, index) => {
          const isLocked = !isPro && index > 0
          const label    = goalLabels[saved.goal] ?? saved.goal
          const calLabel = saved.tdee ? `${saved.tdee.toLocaleString()} cal target` : null

          return (
            <div key={saved.id} className="relative">
              <button
                onClick={() => !isLocked && loadSavedPlan(saved.id)}
                disabled={isLocked}
                className={`w-full text-left px-5 py-3.5 border-b border-gray-50 last:border-0 flex items-center justify-between gap-4 transition-colors ${isLocked ? 'cursor-default' : 'hover:bg-purple-50'} ${isLocked ? 'select-none' : ''}`}
              >
                <div className={`flex flex-col gap-0.5 ${isLocked ? 'blur-sm' : ''}`}>
                  <span className="text-sm font-medium text-gray-800">{formatPlanDate(saved.created_at)}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                      {label}
                    </span>
                    {calLabel && (
                      <span className="text-xs text-gray-400">{calLabel}</span>
                    )}
                  </div>
                </div>
                {!isLocked && (
                  <span className="text-xs text-purple-500 font-medium shrink-0">Load →</span>
                )}
              </button>

              {isLocked && (
                <div className="absolute inset-0 flex items-center justify-center bg-white/70 backdrop-blur-[1px]">
                  <span className="text-xs font-semibold text-purple-600 bg-purple-50 border border-purple-200 px-3 py-1.5 rounded-full">
                    ✨ Upgrade to Pro for full history
                  </span>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  ) : null

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Meal Plan</h1>
        <p className="text-gray-500 mb-8">
          Get a personalised 7-day meal plan built around your calorie target and goal.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <div className="bg-gradient-to-br from-violet-50 to-pink-50 border border-violet-100 rounded-2xl p-8 text-center mb-4">
          <div className="text-5xl mb-4">🤖</div>
          <h2 className="text-lg font-bold text-gray-900 mb-2">Ready to generate your plan</h2>
          <p className="text-sm text-gray-500 mb-6">
            Claude AI will create a full 7-day plan with every meal and macro breakdown — tailored just for you.
          </p>
          <button
            onClick={handleGenerate}
            className="px-8 py-3 rounded-xl font-bold text-lg text-white transition-opacity hover:opacity-90"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)' }}
          >
            ✨ Generate my 7-day plan
          </button>
          <button
            onClick={handlePreview}
            className="mt-3 w-full py-3 rounded-xl border border-purple-200 bg-white/60 text-purple-600 font-semibold text-sm hover:bg-purple-50 transition-colors"
          >
            👀 Preview a sample plan first
          </button>
        </div>

        {planHistorySection}
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isSample ? 'Sample 7-Day Meal Plan' : 'Your 7-Day Meal Plan'}
          </h1>
          {isSample && <p className="text-xs text-purple-500 mt-0.5">Preview only — generate yours with Pro</p>}
        </div>
        <button
          onClick={isSample ? () => { setPlan(null); setIsSample(false) } : handleGenerate}
          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
        >
          {isSample ? '← Back' : '↺ Regenerate'}
        </button>
      </div>

      {isSample && (
        <div className="mb-4 flex items-center gap-3 bg-purple-50 border border-purple-200 rounded-xl px-4 py-3">
          <span className="text-xl">✨</span>
          <p className="text-sm text-purple-700">
            This is a sample plan. <strong>Upgrade to Pro</strong> to generate a plan personalised to your exact calorie target and goal.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {plan.days.map((day, dayIndex) => (
          <div key={day.day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Day header — each day gets a different gradient */}
            <div className={`bg-gradient-to-r ${dayColors[dayIndex % dayColors.length]} flex items-center justify-between px-5 py-3`}>
              <span className="font-bold text-white">{day.day}</span>
              <span className="text-sm font-semibold text-white/90">
                {day.total_calories.toLocaleString()} cal
              </span>
            </div>

            {/* Meals */}
            <div className="divide-y divide-gray-50">
              {day.meals.map((meal, i) => (
                <div key={i} className="px-5 py-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-2">
                      <span className="text-lg mt-0.5">{mealEmoji[meal.type] ?? '🍽️'}</span>
                      <div>
                        <p className="text-sm font-medium text-gray-800">{meal.name}</p>
                        <p className="text-xs text-gray-400 capitalize">{meal.type}</p>
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700 ml-4 shrink-0">
                      {meal.calories} cal
                    </span>
                  </div>
                  <div className="flex gap-4 mt-1.5 ml-7 text-xs text-gray-400">
                    <span>Protein <strong className="text-purple-600">{meal.protein_g}g</strong></span>
                    <span>Carbs <strong className="text-orange-500">{meal.carbs_g}g</strong></span>
                    <span>Fat <strong className="text-pink-500">{meal.fat_g}g</strong></span>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily macro totals */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-6 text-xs">
              <span className="text-gray-500">Protein <strong className="text-purple-600">{day.macros.protein_g}g</strong></span>
              <span className="text-gray-500">Carbs <strong className="text-orange-500">{day.macros.carbs_g}g</strong></span>
              <span className="text-gray-500">Fat <strong className="text-pink-500">{day.macros.fat_g}g</strong></span>
            </div>
          </div>
        ))}
      </div>

      {planHistorySection}
    </div>
  )
}
