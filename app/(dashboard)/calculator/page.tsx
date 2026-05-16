'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import {
  calculateBMR, calculateTDEE, getCalorieTarget,
  type ActivityLevel, type Goal, type Gender,
} from '@/lib/tdee'

const activityOptions: { value: ActivityLevel; label: string; desc: string }[] = [
  { value: 'sedentary',   label: 'Sedentary',   desc: 'Little or no exercise' },
  { value: 'light',       label: 'Light',       desc: '1–3 days/week' },
  { value: 'moderate',    label: 'Moderate',    desc: '3–5 days/week' },
  { value: 'active',      label: 'Active',      desc: '6–7 days/week' },
  { value: 'very_active', label: 'Very active', desc: 'Hard exercise + physical job' },
]

const goalOptions: { value: Goal; label: string; note: string }[] = [
  { value: 'lose',     label: 'Lose weight',     note: '−500 cal/day · ~0.5 kg/week' },
  { value: 'maintain', label: 'Maintain weight', note: 'Matches your TDEE' },
  { value: 'gain',     label: 'Gain weight',     note: '+300 cal/day · lean bulk' },
]

export default function CalculatorPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  const [age,      setAge]      = useState('')
  const [gender,   setGender]   = useState<Gender | ''>('')
  const [weight,   setWeight]   = useState('')
  const [height,   setHeight]   = useState('')
  const [activity, setActivity] = useState<ActivityLevel | ''>('')
  const [goal,     setGoal]     = useState<Goal | ''>('')

  // Load profile on page open and pre-fill the form
  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data } = await supabase
        .from('profiles').select('*').eq('id', user.id).single()

      if (data) {
        setAge(data.age?.toString() ?? '')
        setGender(data.gender ?? '')
        setWeight(data.weight_kg?.toString() ?? '')
        setHeight(data.height_cm?.toString() ?? '')
        setActivity(data.activity_level ?? '')
        setGoal(data.goal ?? '')
      }
      setLoading(false)
    }
    load()
  }, [])

  // Recalculate whenever any input changes
  const ready = age && gender && weight && height && activity && goal

  const bmr = ready ? calculateBMR({
    weight_kg: parseFloat(weight),
    height_cm: parseFloat(height),
    age:       parseInt(age),
    gender:    gender as Gender,
  }) : null

  const tdee   = bmr ? calculateTDEE(bmr, activity as ActivityLevel) : null
  const target = tdee ? getCalorieTarget(tdee, goal as Goal) : null

  async function handleSave() {
    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    await supabase.from('profiles').update({
      age:            parseInt(age),
      gender,
      weight_kg:      parseFloat(weight),
      height_cm:      parseFloat(height),
      activity_level: activity,
      goal,
    }).eq('id', user.id)

    setSaving(false)
    router.push('/next-steps')
  }

  if (loading) {
    return <p className="text-gray-400 animate-pulse">Loading your profile…</p>
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-1">Calorie Calculator</h1>
      <p className="text-gray-500 mb-8">
        Your stats are pre-filled from onboarding. Update them any time and hit Save.
      </p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">

        {/* Age + Gender */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
            <input
              type="number" min={10} max={120}
              value={age} onChange={e => setAge(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
            <select
              value={gender} onChange={e => setGender(e.target.value as Gender)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="">Select…</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        {/* Weight + Height */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
            <input
              type="number" min={20} max={400} step={0.1}
              value={weight} onChange={e => setWeight(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
            <input
              type="number" min={50} max={300} step={0.1}
              value={height} onChange={e => setHeight(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* Activity level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Activity level</label>
          <div className="space-y-2">
            {activityOptions.map(opt => (
              <label key={opt.value} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="radio" name="activity" value={opt.value}
                  checked={activity === opt.value}
                  onChange={() => setActivity(opt.value)}
                  className="accent-green-600 w-4 h-4"
                />
                <span className="text-sm">
                  <span className="font-medium text-gray-800">{opt.label}</span>
                  <span className="text-gray-400"> — {opt.desc}</span>
                </span>
              </label>
            ))}
          </div>
        </div>

        {/* Goal */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Goal</label>
          <div className="grid grid-cols-3 gap-3">
            {goalOptions.map(opt => (
              <button
                key={opt.value} type="button"
                onClick={() => setGoal(opt.value)}
                className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors text-left ${
                  goal === opt.value
                    ? 'bg-green-600 border-green-600 text-white'
                    : 'border-gray-300 text-gray-700 hover:border-green-400'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving || !ready}
          className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50 transition-colors"
        >
          {saving ? 'Saving…' : 'Save & continue →'}
        </button>
      </div>

      {/* Results — only shown once all fields are filled */}
      {bmr && tdee && target && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-2xl p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Your results</h2>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-gray-800">{bmr.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">BMR</p>
              <p className="text-xs text-gray-400 mt-0.5">calories at rest</p>
            </div>
            <div className="bg-white rounded-xl p-4 border border-gray-100">
              <p className="text-3xl font-bold text-gray-800">{tdee.toLocaleString()}</p>
              <p className="text-sm font-medium text-gray-600 mt-1">TDEE</p>
              <p className="text-xs text-gray-400 mt-0.5">maintenance</p>
            </div>
            <div className="bg-green-600 rounded-xl p-4">
              <p className="text-3xl font-bold text-white">{target.toLocaleString()}</p>
              <p className="text-sm font-medium text-green-100 mt-1">Your target</p>
              <p className="text-xs text-green-200 mt-0.5">calories/day</p>
            </div>
          </div>

          <p className="mt-4 text-sm text-gray-500 border-t border-green-200 pt-4">
            {goalOptions.find(o => o.value === goal)?.note}
          </p>
        </div>
      )}

    </div>
  )
}
