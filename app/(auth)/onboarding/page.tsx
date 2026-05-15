'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

const activityOptions = [
  { value: 'sedentary',   label: 'Sedentary',   desc: 'Little or no exercise' },
  { value: 'light',       label: 'Light',       desc: 'Exercise 1–3 days/week' },
  { value: 'moderate',    label: 'Moderate',    desc: 'Exercise 3–5 days/week' },
  { value: 'active',      label: 'Active',      desc: 'Exercise 6–7 days/week' },
  { value: 'very_active', label: 'Very active', desc: 'Hard exercise + physical job' },
]

const goalOptions = [
  { value: 'lose',     label: 'Lose weight' },
  { value: 'maintain', label: 'Maintain' },
  { value: 'gain',     label: 'Gain weight' },
]

export default function OnboardingPage() {
  const [form, setForm] = useState({
    full_name: '', age: '', gender: '',
    weight_kg: '', height_cm: '', activity_level: '', goal: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  function set(key: string, value: string) {
    setForm(prev => ({ ...prev, [key]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { router.push('/login'); return }

    const { error } = await supabase
      .from('profiles')
      .update({
        full_name:      form.full_name,
        age:            parseInt(form.age),
        gender:         form.gender,
        weight_kg:      parseFloat(form.weight_kg),
        height_cm:      parseFloat(form.height_cm),
        activity_level: form.activity_level,
        goal:           form.goal,
      })
      .eq('id', user.id)

    if (error) {
      setError(error.message)
      setLoading(false)
    } else {
      router.push('/calculator')
    }
  }

  const canSubmit = form.activity_level && form.goal && !loading

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow p-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Set up your profile</h1>
        <p className="text-gray-500 mb-6">
          We use this to calculate your personal daily calorie target.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text" required value={form.full_name}
              onChange={e => set('full_name', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>

          {/* Age + Gender */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age</label>
              <input
                type="number" required min={10} max={120} value={form.age}
                onChange={e => set('age', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                required value={form.gender} onChange={e => set('gender', e.target.value)}
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
                type="number" required min={20} max={400} step={0.1} value={form.weight_kg}
                onChange={e => set('weight_kg', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
              <input
                type="number" required min={50} max={300} step={0.1} value={form.height_cm}
                onChange={e => set('height_cm', e.target.value)}
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
                    type="radio" name="activity_level" value={opt.value}
                    checked={form.activity_level === opt.value}
                    onChange={e => set('activity_level', e.target.value)}
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
            <label className="block text-sm font-medium text-gray-700 mb-2">My goal</label>
            <div className="grid grid-cols-3 gap-3">
              {goalOptions.map(opt => (
                <button
                  key={opt.value} type="button"
                  onClick={() => set('goal', opt.value)}
                  className={`py-2 px-3 rounded-lg border text-sm font-medium transition-colors ${
                    form.goal === opt.value
                      ? 'bg-green-600 border-green-600 text-white'
                      : 'border-gray-300 text-gray-700 hover:border-green-400'
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit" disabled={!canSubmit}
            className="w-full bg-green-600 text-white py-2 rounded-lg font-medium hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Saving…' : 'Continue to app →'}
          </button>
        </form>
      </div>
    </div>
  )
}
