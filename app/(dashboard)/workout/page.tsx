'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Exercise = {
  name: string
  sets: number
  reps: string
  rest: string
  tip?: string
}

type WorkoutDay = {
  day: string
  emoji: string
  focus: string
  exercises: Exercise[]
  isRest?: boolean
}

const programs: Record<string, WorkoutDay[]> = {
  lose: [
    {
      day: 'Monday', emoji: '💪', focus: 'Full Body Strength',
      exercises: [
        { name: 'Squats',            sets: 3, reps: '15',      rest: '60s', tip: 'Keep chest up, knees over toes' },
        { name: 'Push-ups',          sets: 3, reps: '12–15',   rest: '45s' },
        { name: 'Dumbbell Rows',     sets: 3, reps: '12 each', rest: '45s', tip: 'Pull elbow to hip, not shoulder' },
        { name: 'Reverse Lunges',    sets: 3, reps: '10 each', rest: '60s' },
        { name: 'Plank Hold',        sets: 3, reps: '30 sec',  rest: '30s' },
      ],
    },
    {
      day: 'Tuesday', emoji: '🔥', focus: 'Cardio HIIT',
      exercises: [
        { name: 'Jumping Jacks',     sets: 3, reps: '40',      rest: '30s' },
        { name: 'Burpees',           sets: 4, reps: '10',       rest: '60s', tip: 'Lower chest fully each rep' },
        { name: 'Mountain Climbers', sets: 3, reps: '30 sec',  rest: '45s' },
        { name: 'High Knees',        sets: 3, reps: '30 sec',  rest: '30s' },
        { name: 'Jump Rope',         sets: 3, reps: '2 min',   rest: '60s' },
      ],
    },
    {
      day: 'Wednesday', emoji: '🧘', focus: 'Rest / Light Walk',
      exercises: [], isRest: true,
    },
    {
      day: 'Thursday', emoji: '🏋️', focus: 'Upper Body',
      exercises: [
        { name: 'Bench Press',       sets: 3, reps: '12',      rest: '60s' },
        { name: 'Lat Pulldown',      sets: 3, reps: '12',      rest: '60s', tip: 'Drive elbows down and back' },
        { name: 'Shoulder Press',    sets: 3, reps: '12',      rest: '60s' },
        { name: 'Tricep Dips',       sets: 3, reps: '12',      rest: '45s' },
        { name: 'Bicep Curls',       sets: 3, reps: '12',      rest: '45s' },
      ],
    },
    {
      day: 'Friday', emoji: '🦵', focus: 'Lower Body + Cardio',
      exercises: [
        { name: 'Leg Press',         sets: 3, reps: '15',      rest: '60s' },
        { name: 'Walking Lunges',    sets: 3, reps: '12 each', rest: '60s' },
        { name: 'Leg Curl',          sets: 3, reps: '12',      rest: '60s' },
        { name: 'Calf Raises',       sets: 3, reps: '20',      rest: '30s' },
        { name: 'Treadmill Jog',     sets: 1, reps: '20 min',  rest: '—',   tip: 'Moderate pace, conversational effort' },
      ],
    },
    {
      day: 'Saturday', emoji: '🚶', focus: 'Active Recovery',
      exercises: [], isRest: true,
    },
    {
      day: 'Sunday', emoji: '😴', focus: 'Full Rest',
      exercises: [], isRest: true,
    },
  ],

  gain: [
    {
      day: 'Monday', emoji: '💪', focus: 'Push — Chest / Shoulders / Triceps',
      exercises: [
        { name: 'Bench Press',       sets: 4, reps: '6–8',    rest: '90s', tip: 'Add weight each week for progressive overload' },
        { name: 'Incline DB Press',  sets: 3, reps: '8–10',   rest: '90s' },
        { name: 'Shoulder Press',    sets: 4, reps: '8',      rest: '90s' },
        { name: 'Lateral Raises',    sets: 3, reps: '12–15',  rest: '60s' },
        { name: 'Tricep Pushdown',   sets: 3, reps: '12',     rest: '60s' },
      ],
    },
    {
      day: 'Tuesday', emoji: '🏋️', focus: 'Pull — Back / Biceps',
      exercises: [
        { name: 'Deadlift',          sets: 4, reps: '5–6',    rest: '2 min', tip: 'Most important lift for gaining mass — go heavy' },
        { name: 'Pull-ups',          sets: 4, reps: '6–8',    rest: '90s' },
        { name: 'Barbell Rows',      sets: 3, reps: '8–10',   rest: '90s' },
        { name: 'Face Pulls',        sets: 3, reps: '15',     rest: '60s' },
        { name: 'Bicep Curls',       sets: 3, reps: '10–12',  rest: '60s' },
      ],
    },
    {
      day: 'Wednesday', emoji: '🦵', focus: 'Legs',
      exercises: [
        { name: 'Barbell Squats',    sets: 4, reps: '6–8',    rest: '2 min', tip: 'Squat to parallel or below for full range' },
        { name: 'Leg Press',         sets: 3, reps: '10',     rest: '90s' },
        { name: 'Romanian Deadlift', sets: 3, reps: '10',     rest: '90s' },
        { name: 'Leg Curl',          sets: 3, reps: '12',     rest: '60s' },
        { name: 'Calf Raises',       sets: 4, reps: '15',     rest: '45s' },
      ],
    },
    {
      day: 'Thursday', emoji: '😴', focus: 'Rest — Eat & Recover',
      exercises: [], isRest: true,
    },
    {
      day: 'Friday', emoji: '💪', focus: 'Push — Repeat Monday',
      exercises: [
        { name: 'Bench Press',       sets: 4, reps: '6–8',    rest: '90s', tip: 'Try to beat last week\'s weight or reps' },
        { name: 'Incline DB Press',  sets: 3, reps: '8–10',   rest: '90s' },
        { name: 'Shoulder Press',    sets: 4, reps: '8',      rest: '90s' },
        { name: 'Lateral Raises',    sets: 3, reps: '12–15',  rest: '60s' },
        { name: 'Skull Crushers',    sets: 3, reps: '10–12',  rest: '60s' },
      ],
    },
    {
      day: 'Saturday', emoji: '🏋️', focus: 'Pull — Repeat Tuesday',
      exercises: [
        { name: 'Deadlift',          sets: 4, reps: '5–6',    rest: '2 min' },
        { name: 'Pull-ups',          sets: 4, reps: '6–8',    rest: '90s' },
        { name: 'Seated Cable Row',  sets: 3, reps: '10',     rest: '90s' },
        { name: 'Face Pulls',        sets: 3, reps: '15',     rest: '60s' },
        { name: 'Hammer Curls',      sets: 3, reps: '10–12',  rest: '60s' },
      ],
    },
    {
      day: 'Sunday', emoji: '😴', focus: 'Full Rest',
      exercises: [], isRest: true,
    },
  ],

  maintain: [
    {
      day: 'Monday', emoji: '💪', focus: 'Full Body Strength A',
      exercises: [
        { name: 'Barbell Squats',    sets: 3, reps: '10',     rest: '90s' },
        { name: 'Bench Press',       sets: 3, reps: '10',     rest: '90s' },
        { name: 'Bent-Over Rows',    sets: 3, reps: '10',     rest: '90s' },
        { name: 'Shoulder Press',    sets: 3, reps: '10',     rest: '60s' },
        { name: 'Plank Hold',        sets: 3, reps: '45 sec', rest: '30s' },
      ],
    },
    {
      day: 'Tuesday', emoji: '🏃', focus: 'Cardio — 35 min',
      exercises: [
        { name: 'Treadmill / Bike',  sets: 1, reps: '35 min', rest: '—', tip: 'Moderate pace — you should be able to hold a conversation' },
      ],
    },
    {
      day: 'Wednesday', emoji: '😴', focus: 'Rest',
      exercises: [], isRest: true,
    },
    {
      day: 'Thursday', emoji: '🏋️', focus: 'Full Body Strength B',
      exercises: [
        { name: 'Deadlift',          sets: 3, reps: '8',      rest: '2 min' },
        { name: 'Pull-ups',          sets: 3, reps: '8',      rest: '90s' },
        { name: 'Lunges',            sets: 3, reps: '10 each',rest: '60s' },
        { name: 'Lateral Raises',    sets: 3, reps: '12',     rest: '45s' },
        { name: 'Core Circuit',      sets: 3, reps: '30 sec', rest: '30s', tip: 'Bicycle crunches, leg raises, plank' },
      ],
    },
    {
      day: 'Friday', emoji: '🏃', focus: 'Cardio — 35 min',
      exercises: [
        { name: 'Outdoor Run / Swim', sets: 1, reps: '35 min', rest: '—' },
      ],
    },
    {
      day: 'Saturday', emoji: '🧘', focus: 'Active Recovery',
      exercises: [], isRest: true,
    },
    {
      day: 'Sunday', emoji: '😴', focus: 'Full Rest',
      exercises: [], isRest: true,
    },
  ],
}

const goalMeta: Record<string, { label: string; color: string; tip: string }> = {
  lose:     { label: 'Weight Loss',    color: 'from-orange-400 to-red-500',    tip: 'Higher reps, shorter rest, cardio included. Aim for a 300–500 cal deficit daily.' },
  gain:     { label: 'Muscle Gain',    color: 'from-violet-500 to-purple-600', tip: 'Heavy compound lifts, longer rest, progressive overload. Eat 200–300 cal above your target.' },
  maintain: { label: 'Maintain & Tone', color: 'from-green-500 to-teal-500',   tip: 'Balanced strength and cardio. Keep calories at your TDEE target.' },
}

const FREE_EXERCISES_SHOWN = 2

export default function WorkoutPage() {
  const [goal,      setGoal]      = useState<string | null>(null)
  const [isPro,     setIsPro]     = useState(false)
  const [activeDay, setActiveDay] = useState(0)
  const [loading,   setLoading]   = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const [{ data: prof }, { data: sub }] = await Promise.all([
        supabase.from('profiles').select('goal').eq('id', user.id).single(),
        supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
      ])

      setGoal(prof?.goal ?? 'maintain')
      const isOwner = user.email === process.env.NEXT_PUBLIC_OWNER_EMAIL
      setIsPro(isOwner || sub?.status === 'active' || sub?.status === 'trialing')
      setLoading(false)
    }
    load()
  }, [])

  if (loading) return <p className="text-gray-400 animate-pulse text-sm">Loading…</p>

  const currentGoal = goal && programs[goal] ? goal : 'maintain'
  const schedule    = programs[currentGoal]
  const meta        = goalMeta[currentGoal]
  const day         = schedule[activeDay]

  return (
    <div className="max-w-2xl mx-auto">

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Workout Plan</h1>
        <p className="text-gray-500 text-sm mt-1">Based on your goal: <strong>{meta.label}</strong></p>
      </div>

      {/* Goal tip banner */}
      <div className={`bg-gradient-to-r ${meta.color} rounded-2xl p-5 mb-5 text-white`}>
        <p className="font-bold text-lg mb-1">{meta.label} Program</p>
        <p className="text-sm text-white/80">{meta.tip}</p>
        {!isPro && (
          <div className="mt-3 bg-white/20 rounded-xl px-4 py-2 text-sm font-medium">
            🔒 Full sets & reps visible with Pro — <Link href="/plan" className="underline">Upgrade →</Link>
          </div>
        )}
      </div>

      {/* Day tabs */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {schedule.map((d, i) => (
          <button
            key={i}
            onClick={() => setActiveDay(i)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              i === activeDay
                ? 'bg-green-600 text-white shadow-sm'
                : d.isRest
                ? 'bg-gray-100 text-gray-400'
                : 'bg-white/80 text-gray-600 border border-gray-200 hover:border-green-300'
            }`}
          >
            {d.day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Day card */}
      <div className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

        {/* Day header */}
        <div className={`bg-gradient-to-r ${meta.color} px-5 py-4 flex items-center gap-3`}>
          <span className="text-3xl">{day.emoji}</span>
          <div>
            <p className="font-bold text-white">{day.day}</p>
            <p className="text-sm text-white/80">{day.focus}</p>
          </div>
        </div>

        {/* Rest day */}
        {day.isRest ? (
          <div className="px-5 py-8 text-center">
            <p className="text-2xl mb-2">🛌</p>
            <p className="font-semibold text-gray-700">Rest & Recover</p>
            <p className="text-sm text-gray-400 mt-1">Light walking or stretching is fine. Recovery is when muscles grow.</p>
          </div>
        ) : (
          <div>
            {/* Free: show first 2 exercises fully */}
            <div className="divide-y divide-gray-50">
              {day.exercises.slice(0, FREE_EXERCISES_SHOWN).map((ex, i) => (
                <div key={i} className="px-5 py-3.5">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-gray-800 text-sm">{ex.name}</p>
                    {isPro && (
                      <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                        {ex.sets} × {ex.reps}
                      </span>
                    )}
                  </div>
                  {isPro && (
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">Rest: {ex.rest}</span>
                      {ex.tip && <span className="text-xs text-green-600 italic">💡 {ex.tip}</span>}
                    </div>
                  )}
                  {!isPro && (
                    <p className="text-xs text-gray-400 mt-0.5">Upgrade to Pro to see sets & reps</p>
                  )}
                </div>
              ))}
            </div>

            {/* Remaining exercises */}
            {day.exercises.length > FREE_EXERCISES_SHOWN && (
              isPro ? (
                <div className="divide-y divide-gray-50 border-t border-gray-50">
                  {day.exercises.slice(FREE_EXERCISES_SHOWN).map((ex, i) => (
                    <div key={i} className="px-5 py-3.5">
                      <div className="flex items-center justify-between">
                        <p className="font-semibold text-gray-800 text-sm">{ex.name}</p>
                        <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                          {ex.sets} × {ex.reps}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 mt-1">
                        <span className="text-xs text-gray-400">Rest: {ex.rest}</span>
                        {ex.tip && <span className="text-xs text-green-600 italic">💡 {ex.tip}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="relative border-t border-gray-50">
                  {/* Blurred preview */}
                  <div className="divide-y divide-gray-50 blur-sm pointer-events-none select-none">
                    {day.exercises.slice(FREE_EXERCISES_SHOWN).map((ex, i) => (
                      <div key={i} className="px-5 py-3.5">
                        <div className="flex items-center justify-between">
                          <p className="font-semibold text-gray-800 text-sm">{ex.name}</p>
                          <span className="text-xs font-bold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            {ex.sets} × {ex.reps}
                          </span>
                        </div>
                        <span className="text-xs text-gray-400">Rest: {ex.rest}</span>
                      </div>
                    ))}
                  </div>
                  {/* Lock overlay */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/60">
                    <p className="text-sm font-bold text-gray-700 mb-1">
                      +{day.exercises.length - FREE_EXERCISES_SHOWN} more exercises
                    </p>
                    <Link
                      href="/plan"
                      className="text-xs font-bold text-white px-4 py-2 rounded-xl"
                      style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)' }}
                    >
                      ✨ Unlock with Pro
                    </Link>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Weekly overview (Pro) */}
      {isPro && (
        <div className="mt-4 bg-white/80 rounded-2xl shadow-sm border border-gray-100 p-5">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Week at a Glance</h2>
          <div className="space-y-2">
            {schedule.map((d, i) => (
              <button
                key={i}
                onClick={() => setActiveDay(i)}
                className={`w-full flex items-center gap-3 text-left px-3 py-2 rounded-xl transition-colors ${i === activeDay ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'}`}
              >
                <span className="text-lg w-7">{d.emoji}</span>
                <div>
                  <p className="text-sm font-semibold text-gray-700">{d.day}</p>
                  <p className="text-xs text-gray-400">{d.focus}</p>
                </div>
                {!d.isRest && (
                  <span className="ml-auto text-xs text-gray-400">{d.exercises.length} exercises</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
