'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Plus, Trash2, ChevronLeft, ChevronRight } from 'lucide-react'
import { createClient } from '@/lib/supabase'
import { calculateBMR, calculateTDEE, getCalorieTarget } from '@/lib/tdee'
import type { ActivityLevel, Goal, Gender } from '@/lib/tdee'
import Link from 'next/link'

type MealType   = 'breakfast' | 'lunch' | 'dinner' | 'snack'
type FoodLog    = { id: string; meal_type: MealType; food_name: string; calories: number; protein_g?: number; carbs_g?: number; fat_g?: number }
type FoodResult = { name: string; calories: number; protein_g: number; carbs_g: number; fat_g: number; serving?: string }
type ChartBar   = { label: string; total: number; showLabel: boolean }

const meals: { type: MealType; label: string; emoji: string }[] = [
  { type: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { type: 'lunch',     label: 'Lunch',     emoji: '☀️' },
  { type: 'dinner',    label: 'Dinner',    emoji: '🌙' },
  { type: 'snack',     label: 'Snack',     emoji: '🍎' },
]

function toDateString(d: Date) { return d.toISOString().split('T')[0] }

function formatDate(d: Date) {
  const today     = new Date()
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
  const [streak,  setStreak]  = useState(0)

  const [glasses, setGlasses] = useState(0)

  // Pro + extended chart state
  const [isPro,      setIsPro]      = useState(false)
  const [chartDays,  setChartDays]  = useState<7 | 30 | 90>(7)
  const [chartData,  setChartData]  = useState<ChartBar[]>([])
  const [macroTargets, setMacroTargets] = useState<{ protein_g: number | null; carbs_g: number | null; fat_g: number | null }>({
    protein_g: null,
    carbs_g:   null,
    fat_g:     null,
  })

  const [addingTo,      setAddingTo]      = useState<MealType | null>(null)
  const [foodName,      setFoodName]      = useState('')
  const [calories,      setCalories]      = useState('')
  const [protein,       setProtein]       = useState('')
  const [carbs,         setCarbs]         = useState('')
  const [fat,           setFat]           = useState('')
  const [searchResults, setSearchResults] = useState<FoodResult[]>([])
  const [searching,     setSearching]     = useState(false)
  const searchTimer = useRef<ReturnType<typeof setTimeout>>()

  useEffect(() => {
    fetch('/api/streak').then(r => r.json()).then(d => setStreak(d.streak ?? 0))
  }, [logs])

  useEffect(() => {
    const stored = localStorage.getItem(`water_${toDateString(date)}`)
    setGlasses(stored ? parseInt(stored) : 0)
  }, [date])

  useEffect(() => {
    localStorage.setItem(`water_${toDateString(date)}`, glasses.toString())
  }, [glasses, date])

  // Load profile, subscription status, and macro targets
  useEffect(() => {
    async function loadProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single()

      if (data?.age && data?.gender && data?.weight_kg && data?.height_cm && data?.activity_level && data?.goal) {
        const bmr  = calculateBMR({ weight_kg: data.weight_kg, height_cm: data.height_cm, age: data.age, gender: data.gender as Gender })
        const tdee = calculateTDEE(bmr, data.activity_level as ActivityLevel)
        setTarget(getCalorieTarget(tdee, data.goal as Goal))
      }

      // Macro targets — columns may not exist yet, handle gracefully
      setMacroTargets({
        protein_g: data?.protein_g   ?? null,
        carbs_g:   data?.carbs_g     ?? null,
        fat_g:     data?.fat_g       ?? null,
      })

      // Subscription check
      const { data: sub } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', user.id)
        .single()

      const hasActiveSub = sub?.status === 'active' || sub?.status === 'trialing'
      const isOwner      = user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL
      setIsPro(hasActiveSub || isOwner)
    }
    loadProfile()
  }, [])

  // Build chart data whenever chartDays or logs change
  useEffect(() => {
    async function loadChartData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const today = new Date()

      if (chartDays === 7) {
        const days = Array.from({ length: 7 }, (_, i) => {
          const d = new Date(today)
          d.setDate(today.getDate() - (6 - i))
          return d
        })
        const { data } = await supabase
          .from('calorie_logs')
          .select('logged_date, calories')
          .eq('user_id', user.id)
          .gte('logged_date', toDateString(days[0]))
          .lte('logged_date', toDateString(days[6]))

        const bars: ChartBar[] = days.map(d => {
          const dateStr = toDateString(d)
          const dayLogs = data?.filter(l => l.logged_date === dateStr) ?? []
          return {
            label:     d.toLocaleDateString('en-US', { weekday: 'short' }),
            total:     dayLogs.reduce((s, l) => s + l.calories, 0),
            showLabel: true,
          }
        })
        setChartData(bars)

      } else if (chartDays === 30) {
        const days = Array.from({ length: 30 }, (_, i) => {
          const d = new Date(today)
          d.setDate(today.getDate() - (29 - i))
          return d
        })
        const { data } = await supabase
          .from('calorie_logs')
          .select('logged_date, calories')
          .eq('user_id', user.id)
          .gte('logged_date', toDateString(days[0]))
          .lte('logged_date', toDateString(days[29]))

        // Bar index is 1-based for day numbers
        const bars: ChartBar[] = days.map((d, i) => {
          const dateStr  = toDateString(d)
          const dayLogs  = data?.filter(l => l.logged_date === dateStr) ?? []
          const dayNum   = i + 1
          const showLabel = dayNum % 5 === 0
          return {
            label:     showLabel ? String(dayNum) : '',
            total:     dayLogs.reduce((s, l) => s + l.calories, 0),
            showLabel,
          }
        })
        setChartData(bars)

      } else {
        // 90 days: group into 13 weekly average bars
        const startDay = new Date(today)
        startDay.setDate(today.getDate() - 89)

        const { data } = await supabase
          .from('calorie_logs')
          .select('logged_date, calories')
          .eq('user_id', user.id)
          .gte('logged_date', toDateString(startDay))
          .lte('logged_date', toDateString(today))

        const bars: ChartBar[] = Array.from({ length: 13 }, (_, weekIdx) => {
          const weekDays: string[] = []
          for (let di = 0; di < 7; di++) {
            const d = new Date(startDay)
            d.setDate(startDay.getDate() + weekIdx * 7 + di)
            if (d <= today) weekDays.push(toDateString(d))
          }
          const weekLogs  = data?.filter(l => weekDays.includes(l.logged_date)) ?? []
          const daysWithData = weekDays.filter(ds => weekLogs.some(l => l.logged_date === ds))
          const avgCal    = daysWithData.length > 0
            ? Math.round(weekLogs.reduce((s, l) => s + l.calories, 0) / daysWithData.length)
            : 0
          // Show every 3rd label (W1, W4, W7, W10, W13) plus last
          const wNum       = weekIdx + 1
          const showLabel  = wNum % 3 === 1 || wNum === 13
          return {
            label:    `W${wNum}`,
            total:    avgCal,
            showLabel,
          }
        })
        setChartData(bars)
      }
    }
    loadChartData()
  }, [chartDays, logs])

  const loadLogs = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data } = await supabase
      .from('calorie_logs')
      .select('id, meal_type, food_name, calories, protein_g, carbs_g, fat_g')
      .eq('user_id', user.id)
      .eq('logged_date', toDateString(date))
      .order('created_at', { ascending: true })
    setLogs(data ?? [])
    setLoading(false)
  }, [date])

  useEffect(() => { loadLogs() }, [loadLogs])

  function handleFoodInput(value: string) {
    setFoodName(value)
    clearTimeout(searchTimer.current)
    if (value.length < 2) { setSearchResults([]); return }
    searchTimer.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(`/api/food/search?q=${encodeURIComponent(value)}`)
        const { foods } = await res.json()
        setSearchResults(foods ?? [])
      } finally {
        setSearching(false)
      }
    }, 400)
  }

  function selectFood(food: FoodResult) {
    setFoodName(food.name)
    setCalories(food.calories.toString())
    setProtein(food.protein_g.toString())
    setCarbs(food.carbs_g.toString())
    setFat(food.fat_g.toString())
    setSearchResults([])
  }

  function openAddForm(meal: MealType) {
    setAddingTo(prev => prev === meal ? null : meal)
    setFoodName('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setSearchResults([])
  }

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
        protein_g:   protein ? parseFloat(protein) : null,
        carbs_g:     carbs   ? parseFloat(carbs)   : null,
        fat_g:       fat     ? parseFloat(fat)     : null,
      })
      .select('id, meal_type, food_name, calories, protein_g, carbs_g, fat_g')
      .single()

    if (newEntry) setLogs(prev => [...prev, newEntry])
    setFoodName('')
    setCalories('')
    setProtein('')
    setCarbs('')
    setFat('')
    setAddingTo(null)
  }

  async function handleDelete(id: string) {
    const supabase = createClient()
    await supabase.from('calorie_logs').delete().eq('id', id)
    setLogs(prev => prev.filter(l => l.id !== id))
  }

  function changeDate(days: number) {
    setDate(prev => { const next = new Date(prev); next.setDate(prev.getDate() + days); return next })
  }

  const totalCalories = logs.reduce((sum, l) => sum + l.calories, 0)
  const totalProtein  = logs.reduce((sum, l) => sum + (l.protein_g ?? 0), 0)
  const totalCarbs    = logs.reduce((sum, l) => sum + (l.carbs_g   ?? 0), 0)
  const totalFat      = logs.reduce((sum, l) => sum + (l.fat_g     ?? 0), 0)
  const hasMacros     = totalProtein > 0 || totalCarbs > 0 || totalFat > 0

  const remaining       = target ? target - totalCalories : null
  const progressPercent = target ? Math.min((totalCalories / target) * 100, 100) : 0
  const isOver          = remaining !== null && remaining < 0
  const isToday         = toDateString(date) === toDateString(new Date())

  const allMacroTargetsSet =
    macroTargets.protein_g !== null &&
    macroTargets.carbs_g   !== null &&
    macroTargets.fat_g     !== null

  // Chart label based on selected range
  const chartHeading =
    chartDays === 7  ? 'Last 7 Days'  :
    chartDays === 30 ? 'Last 30 Days' : 'Last 90 Days'

  // Chart summary text
  const chartSummary = (() => {
    if (chartData.length === 0 || !target) return null
    if (chartDays === 90) {
      const barsWithData = chartData.filter(b => b.total > 0)
      if (barsWithData.length === 0) return null
      const avg = Math.round(barsWithData.reduce((s, b) => s + b.total, 0) / barsWithData.length)
      return (
        <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
          Last 90 days you averaged <strong className="text-gray-800">{avg.toLocaleString()} cal/day</strong>.
        </p>
      )
    }
    const daysWithData = chartData.filter(b => b.total > 0)
    if (daysWithData.length === 0) return null
    const avg     = Math.round(daysWithData.reduce((s, b) => s + b.total, 0) / daysWithData.length)
    const daysHit = chartData.filter(b => b.total > 0 && b.total <= target).length
    const n       = chartDays
    return (
      <p className="text-sm text-gray-500 mt-3 pt-3 border-t border-gray-100">
        Last {n} days you averaged{' '}
        <strong className="text-gray-800">{avg.toLocaleString()} cal/day</strong>{' '}
        and hit your target{' '}
        <strong className="text-green-600">{daysHit}/{n} days</strong>.
      </p>
    )
  })()

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Food Log</h1>
        {streak > 0 && (
          <div className="flex items-center gap-1.5 bg-orange-50 border border-orange-200 px-3 py-1.5 rounded-full">
            <span className="text-lg">🔥</span>
            <span className="text-sm font-bold text-orange-600">{streak} day{streak !== 1 ? 's' : ''}</span>
            <span className="text-xs text-orange-400">streak</span>
          </div>
        )}
      </div>

      {/* Date navigation */}
      <div className="flex items-center justify-between mb-5">
        <button onClick={() => changeDate(-1)} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
          <ChevronLeft className="w-5 h-5 text-gray-500" />
        </button>
        <span className="font-semibold text-gray-800 text-lg">{formatDate(date)}</span>
        <button onClick={() => changeDate(1)} disabled={isToday} className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors">
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
            {isOver ? `${Math.abs(remaining!).toLocaleString()} cal over target` : `${remaining!.toLocaleString()} cal remaining`}
          </p>

          {/* Macro totals */}
          {hasMacros && (
            <div className="flex gap-5 mt-3 pt-3 border-t border-gray-100 text-sm">
              <span className="text-gray-500">Protein <strong className="text-purple-600">{Math.round(totalProtein)}g</strong></span>
              <span className="text-gray-500">Carbs <strong className="text-orange-500">{Math.round(totalCarbs)}g</strong></span>
              <span className="text-gray-500">Fat <strong className="text-pink-500">{Math.round(totalFat)}g</strong></span>
            </div>
          )}

          {/* Macro target progress bars */}
          {hasMacros && allMacroTargetsSet && (
            <div className="mt-3 pt-3 border-t border-gray-100 space-y-2.5">
              {/* Protein */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12 shrink-0">Protein</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-500 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((totalProtein / macroTargets.protein_g!) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-20 text-right shrink-0">
                  {Math.round(totalProtein)}g / {macroTargets.protein_g}g
                </span>
              </div>
              {/* Carbs */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12 shrink-0">Carbs</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-orange-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((totalCarbs / macroTargets.carbs_g!) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-20 text-right shrink-0">
                  {Math.round(totalCarbs)}g / {macroTargets.carbs_g}g
                </span>
              </div>
              {/* Fat */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500 w-12 shrink-0">Fat</span>
                <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-pink-400 rounded-full transition-all duration-300"
                    style={{ width: `${Math.min((totalFat / macroTargets.fat_g!) * 100, 100)}%` }}
                  />
                </div>
                <span className="text-xs text-gray-400 w-20 text-right shrink-0">
                  {Math.round(totalFat)}g / {macroTargets.fat_g}g
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Chart card */}
      {target && chartData.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
          {/* Header row */}
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-gray-500">{chartHeading}</h2>
            {isPro ? (
              <div className="flex gap-1">
                {([7, 30, 90] as const).map(d => (
                  <button
                    key={d}
                    onClick={() => setChartDays(d)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
                      chartDays === d
                        ? 'bg-green-600 text-white'
                        : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {d}d
                  </button>
                ))}
              </div>
            ) : (
              <Link href="/plan" className="text-xs text-gray-400 hover:text-gray-600 transition-colors">
                🔒 30/90d
              </Link>
            )}
          </div>

          {/* Bars */}
          <div className="flex items-end gap-1 h-20 mb-1">
            {chartData.map((bar, i) => {
              const hasData = bar.total > 0
              const barOver = hasData && target && bar.total > target
              const pct     = hasData ? Math.min((bar.total / (target * 1.25)) * 100, 100) : 0
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <span className="text-[9px] text-gray-400 h-3 leading-none">
                    {hasData ? (bar.total >= 1000 ? `${(bar.total / 1000).toFixed(1)}k` : bar.total) : ''}
                  </span>
                  <div className="w-full flex items-end h-16">
                    <div
                      className={`w-full rounded-t transition-all ${!hasData ? 'bg-gray-100 h-1' : barOver ? 'bg-red-400' : 'bg-green-400'}`}
                      style={hasData ? { height: `${Math.max(pct, 8)}%` } : undefined}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {/* Labels row */}
          <div className="flex gap-1">
            {chartData.map((bar, i) => (
              <div key={i} className="flex-1 text-center text-[9px] text-gray-400">
                {bar.showLabel ? bar.label : ''}
              </div>
            ))}
          </div>

          {/* Summary */}
          {chartSummary}
        </div>
      )}

      {/* Water tracking */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 mb-5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500">Water</h2>
          <span className="text-sm text-gray-400">{glasses}/8 glasses</span>
        </div>
        <div className="flex gap-1.5">
          {Array.from({ length: 8 }, (_, i) => (
            <button
              key={i}
              onClick={() => setGlasses(i + 1 === glasses ? i : i + 1)}
              className={`flex-1 h-9 rounded-lg text-base transition-all ${i < glasses ? 'bg-blue-100 text-blue-500' : 'bg-gray-100 text-gray-300'}`}
            >
              💧
            </button>
          ))}
        </div>
        {glasses >= 8 && <p className="text-xs text-blue-500 mt-2">Great job staying hydrated today!</p>}
      </div>

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
              <div key={meal.type} className="bg-white rounded-2xl shadow-sm border border-gray-100">

                {/* Meal header */}
                <div className="flex items-center justify-between px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{meal.emoji}</span>
                    <span className="font-semibold text-gray-800">{meal.label}</span>
                    {mealTotal > 0 && <span className="text-sm text-gray-400 ml-1">{mealTotal.toLocaleString()} cal</span>}
                  </div>
                  <button onClick={() => openAddForm(meal.type)} className="flex items-center gap-1 text-sm text-green-600 hover:text-green-700 font-medium">
                    <Plus className="w-4 h-4" /> Add
                  </button>
                </div>

                {/* Food entries */}
                {mealLogs.length > 0 && (
                  <ul className="border-t border-gray-50 divide-y divide-gray-50">
                    {mealLogs.map(log => (
                      <li key={log.id} className="flex items-center justify-between px-5 py-2.5">
                        <div>
                          <p className="text-gray-700 text-sm">{log.food_name}</p>
                          {(log.protein_g || log.carbs_g || log.fat_g) && (
                            <div className="flex gap-3 mt-0.5 text-xs">
                              {!!log.protein_g && <span className="text-purple-400">P:{log.protein_g}g</span>}
                              {!!log.carbs_g   && <span className="text-orange-400">C:{log.carbs_g}g</span>}
                              {!!log.fat_g     && <span className="text-pink-400">F:{log.fat_g}g</span>}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-medium text-gray-600">{log.calories} cal</span>
                          <button onClick={() => handleDelete(log.id)} className="text-gray-300 hover:text-red-400 transition-colors">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}

                {/* Inline add form */}
                {isAdding && (
                  <div className="border-t border-gray-100 px-5 py-3 bg-gray-50 space-y-2">
                    <div className="flex gap-2">
                      {/* Food search input with dropdown */}
                      <div className="relative flex-1">
                        <input
                          type="text"
                          placeholder="Search food or type name…"
                          value={foodName}
                          onChange={e => handleFoodInput(e.target.value)}
                          onBlur={() => setTimeout(() => setSearchResults([]), 150)}
                          onKeyDown={e => e.key === 'Enter' && handleAdd(meal.type)}
                          autoFocus
                          className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                        {/* Search dropdown */}
                        {(searching || searchResults.length > 0) && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-lg z-50 max-h-52 overflow-y-auto">
                            {searching && <p className="px-3 py-2 text-sm text-gray-400">Searching…</p>}
                            {searchResults.map((food, i) => (
                              <button
                                key={i}
                                type="button"
                                onMouseDown={() => selectFood(food)}
                                className="w-full text-left px-3 py-2.5 hover:bg-green-50 border-b border-gray-50 last:border-0"
                              >
                                <p className="text-sm text-gray-800 font-medium truncate">
                                  {food.name.length > 50 ? food.name.slice(0, 50) + '…' : food.name}
                                </p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                  {food.calories} cal · P:{food.protein_g}g C:{food.carbs_g}g F:{food.fat_g}g
                                  <span className="ml-1 text-gray-300">· {food.serving ?? 'per 100g'}</span>
                                </p>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
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
                    {/* Show selected macros */}
                    {(protein || carbs || fat) && (
                      <p className="text-xs text-gray-400 pl-1">
                        Macros: P:{protein}g · C:{carbs}g · F:{fat}g · adjust calories for your portion
                      </p>
                    )}
                  </div>
                )}

                {/* Empty state */}
                {mealLogs.length === 0 && !isAdding && (
                  <p className="px-5 pb-3 text-sm text-gray-400 border-t border-gray-50 pt-2">Nothing logged yet</p>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
