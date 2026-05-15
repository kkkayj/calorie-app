'use client'

import { useState } from 'react'

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

const mealEmoji: Record<string, string> = {
  breakfast: '🌅',
  lunch:     '☀️',
  dinner:    '🌙',
  snack:     '🍎',
}

export default function PlanGenerator() {
  const [plan,    setPlan]    = useState<Plan | null>(null)
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleGenerate() {
    setLoading(true)
    setError('')

    const res  = await fetch('/api/ai/generate-plan', { method: 'POST' })
    const data = await res.json()

    if (data.error) {
      setError(data.error)
    } else {
      setPlan(data.plan)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">AI Meal Plan</h1>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="text-5xl mb-4 animate-pulse">✨</div>
          <p className="text-gray-700 font-medium text-lg">Generating your personalised plan…</p>
          <p className="text-sm text-gray-400 mt-2">This usually takes about 15 seconds</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return (
      <div className="max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Meal Plan</h1>
        <p className="text-gray-500 mb-8">
          Get a personalised 7-day meal plan built around your calorie target and goal.
        </p>

        {error && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-4">
            {error}
          </p>
        )}

        <button
          onClick={handleGenerate}
          className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold text-lg hover:bg-green-700 transition-colors"
        >
          ✨ Generate my 7-day plan
        </button>
      </div>
    )
  }

  return (
    <div className="max-w-2xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Your 7-Day Meal Plan</h1>
        <button
          onClick={handleGenerate}
          className="text-sm text-green-600 hover:text-green-700 font-medium"
        >
          ↺ Regenerate
        </button>
      </div>

      <div className="space-y-4">
        {plan.days.map((day) => (
          <div key={day.day} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

            {/* Day header */}
            <div className="flex items-center justify-between px-5 py-3 bg-green-50 border-b border-green-100">
              <span className="font-bold text-gray-900">{day.day}</span>
              <span className="text-sm font-semibold text-green-700">
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
                    <span className="text-sm font-medium text-gray-600 ml-4 shrink-0">
                      {meal.calories} cal
                    </span>
                  </div>
                  {/* Macros per meal */}
                  <div className="flex gap-4 mt-1.5 ml-7 text-xs text-gray-400">
                    <span>Protein {meal.protein_g}g</span>
                    <span>Carbs {meal.carbs_g}g</span>
                    <span>Fat {meal.fat_g}g</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Daily macro totals */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-100 flex gap-6 text-xs text-gray-500">
              <span>Protein <strong className="text-gray-700">{day.macros.protein_g}g</strong></span>
              <span>Carbs <strong className="text-gray-700">{day.macros.carbs_g}g</strong></span>
              <span>Fat <strong className="text-gray-700">{day.macros.fat_g}g</strong></span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
