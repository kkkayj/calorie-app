'use client'

import { useState, useEffect, useCallback } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { calculateBMR, calculateTDEE, getCalorieTarget } from '@/lib/tdee'
import type { ActivityLevel, Goal, Gender } from '@/lib/tdee'

type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack'
type FoodLog = { id: string; meal_type: MealType; food_name: string; calories: number }

const meals: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { type: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { type: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { type: 'snack',     label: 'Snack',     emoji: '🍎' },
]

function toDateString(d: Date) {
  return d.toISOString().split('T')[0]
}

function formatDate(d: Date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(today.getDate() - 1)
  if (toDateString(d) === toDateString(today))     return 'Today'
  if (toDateString(d) === toDateString(yesterday)) return 'Yesterday'
  return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
}

export default function TrackerPage() {
  const [date,    setDate]    = useState(new Date())
  const [logs,    setLogs]    = useState<FoodLog[]>([])
  const [target,  setTarget]  = useState<number | null>(null)
  const [loading, setLoading] = useState(true)

  // Which meal section currently has the inline add form open
  const [addingTo, setAddingTo] = useState<MealType | null>(null)
  const [foodName, setFoodName] = useState('')
  const [calories, setCalories] = useState('')

  // Load calorie target once from profile
  useEffect(() => {
    async function loadTarget() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      if (data?.age && data?.gender && data?.weight_kg && data?.height_cm && data?.activity_level && data?.goal) {
        const bmr  = calculateBMR({ weight_kg: data.weight_kg, height_cm: data.height_cm, age: data.age, gender: data.gender as Gender })
        const tdee = calculateTDEE(bmr, data.activity_level as ActivityLevel)
        setTarget(getCalorieTarget(tdee, data.goal as Goal))
      }
    }
    loadTarget()
  }, [])

  // Reload food logs whenever the date changes
  const loadLogs = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data } = await supabase
      .from('calorie_logs')
      .select('id, meal_type, food_name, calories')
      .eq('user_id', user.id)
      .eq('logged_date', toDateString(date))
      .order('created_at', { ascending: true })

    setLogs(data ?? [])
    setLoading(false)
  }, [date])

  useEffect(() => { loadLogs() }, [loadLogs])

  async function handleAdd(meal: MealType) {
    if (!foodName.trim() || !calories) return

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data: newEntry } = await supabase
      .from('calorie_logs')
      .insert({
        user_id:     user.id,
        logged_date: toDateString(date),
        meal_type:   meal,
        food_name:   foodName.trim(),
        calories:    parseInt(calories),
      })
      .select('id, meal_type, food_name, calories')
      .single()

    if (newEntry) setLogs(prev => [...prev, newEntry])
    setFoodName('')
    setCalories('')
    setAddingTo(null)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('calorie_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  function changeDate(days: number) {
    setDate(prev => {
      const next = new Date(prev)
      next.setDate(prev.getDate() + days)
      return next
    })
  }

  function openAddForm(meal: MealType) {
    setAddingTo(prev => prev === meal ? null : meal)
    setFoodName('')
    setCalories('')
  }

  const totalCalories   = logs.reduce((sum, l) => sum + l.calories, 0)
  const remaining       = target ? target - totalCalories : null
  const progressPercent = target ? Math.min((totalCalories / target) * 100, 100) : 0
  const isOver          = remaining !== null && remaining < 0
  const isToday         = toDateString(date) === toDateString(new Date())

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Food Log</h1>

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <span className="font-semibold text-gray-800 text-lg">{formatDate(date)}</span>
        <button
          onClick={() => changeDate(1)}
          disabled={isToday}
          className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-500" />
        </button>
      </div>

      {/* Daily progress */}
      {target && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          <div className="flex justify-between items-baseline mb-1">
            <span className="text-sm font-medium text-gray-500">Calories today</span>
            <span className="text-sm text-gray-400">Target: {target.toLocaleString()}</span>
          </div>
          <div className="flex items-baseline gap-2 mb-3">
            <span className="text-3xl font-bold text-gray-900">{totalCalories.toLocaleString()}</span>
            <span className="text-gray-400 text-sm">/ {target.toLocaleString()} cal</span>
          </div>
          <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-300 ${isOver ? 'bg-red-500' : 'bg-green-500'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className={`text-sm mt-2 ${isOver ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {isOver
              ? `${Math.abs(remaining!).toLocaleString()} cal over target`
              : `${remaining!.toLocaleString()} cal remaining`}
          </p>
        </div>
      )}

      {/* Meal sections */}
      {loading ? (
        <p className="text-gray-400 animate-pulse text-sm">Loading…</p>
      ) : (
        <div className="space-y-3">
          {meals.map(meal => {
            const mealLogs  = logs.filter(l => l.meal_type === meal.type)
            const mealTotal = mealLogs.reduce((sum, l) => sum + l.calories, 0)
            const isAdding  = addingTo === meal.type

            return (
              <div key={meal.type} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

                {/* Meal header */}
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meal.emoji}</span>
                    <span className="font-semibold text-gray-800">{meal.label}</span>
                    {mealTotal > 0 && (
                      <span className="text-sm text-gray-400 ml-1">{mealTotal.toLocaleString()} cal</span>
                    )}
                  </div>
                  <button
                    onClick={() => openAddForm(meal.type)}
                    className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium"
                  >
                    <Plus className="w-4 h-4" />
                    Add
                  </button>
                </div>

                {/* Food entries */}
                {mealLogs.length > 0 && (
                  <ul className="border-t border-gray-50 divide-y divide-gray-50">
                    {mealLogs.map(log => (
                      <li key={log.id} className="flex items-center justify-between px-5 py-2.5">
                        <span className="text-gray-700 text-sm">{log.food_name}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600">{log.calories} cal</span>
                          <button
                            onClick={() => handleDelete(log.id)}
                            className="text-gray-300 hover:text-red-400 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Inline add form */}
                {isAdding && (
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 flex gap-2">
                    <input
                      type="text"
                      placeholder="Food name (e.g. Chicken breast)"
                      value={foodName}
                      onChange={e => setFoodName(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdd(meal.type)}
                      autoFocus
                      className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <input
                      type="number"
                      placeholder="Cal"
                      min={1}
                      value={calories}
                      onChange={e => setCalories(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && handleAdd(meal.type)}
                      className="w-20 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                    />
                    <button
                      onClick={() => handleAdd(meal.type)}
                      disabled={!foodName.trim() || !calories}
                      className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                    >
                      Add
                    </button>
                  </div>
                )}

                {/* Empty state */}
                {mealLogs.length === 0 && !isAdding && (
                  <p className="px-5 pb-3 text-sm text-gray-400 border-t border-gray-50 pt-2">
                    Nothing logged yet
                  </p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
