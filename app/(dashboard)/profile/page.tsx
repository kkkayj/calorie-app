'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase'

type Profile = {
  age: number | null
  gender: string | null
  weight_kg: number | null
  height_cm: number | null
  activity_level: string | null
  goal: string | null
  target_protein_g: number | null
  target_carbs_g: number | null
  target_fat_g: number | null
}

const activityLabels: Record<string, string> = {
  sedentary:    'Sedentary (little or no exercise)',
  light:        'Light (1–3 days/week)',
  moderate:     'Moderate (3–5 days/week)',
  active:       'Active (6–7 days/week)',
  very_active:  'Very active (hard exercise daily)',
}

const goalLabels: Record<string, string> = {
  lose:     'Lose weight',
  maintain: 'Maintain weight',
  gain:     'Gain weight',
}

export default function ProfilePage() {
  const router = useRouter()
  const [email,   setEmail]   = useState<string | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subStatus, setSubStatus] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [loggingOut,   setLoggingOut]   = useState(false)
  const [macroInputs,  setMacroInputs]  = useState({ protein: '', carbs: '', fat: '' })
  const [macroSaving,  setMacroSaving]  = useState(false)
  const [macroSaved,   setMacroSaved]   = useState(false)
  const [macroError,   setMacroError]   = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setEmail(user.email ?? null)

      const [{ data: prof }, { data: sub }] = await Promise.all([
        supabase.from('profiles').select('*').eq('id', user.id).single(),
        supabase.from('subscriptions').select('status').eq('user_id', user.id).single(),
      ])
      setProfile(prof)
      setSubStatus(sub?.status ?? null)
      setMacroInputs({
        protein: prof?.target_protein_g?.toString() ?? '',
        carbs:   prof?.target_carbs_g?.toString()   ?? '',
        fat:     prof?.target_fat_g?.toString()     ?? '',
      })
      setLoading(false)
    }
    load()
  }, [router])

  async function handleSaveMacros() {
    setMacroSaving(true)
    setMacroError('')
    setMacroSaved(false)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { error } = await supabase.from('profiles').update({
      target_protein_g: macroInputs.protein ? Number(macroInputs.protein) : null,
      target_carbs_g:   macroInputs.carbs   ? Number(macroInputs.carbs)   : null,
      target_fat_g:     macroInputs.fat     ? Number(macroInputs.fat)     : null,
    }).eq('id', user.id)
    if (error) {
      setMacroError('Could not save — run the DB migration in Supabase first.')
    } else {
      setMacroSaved(true)
      setTimeout(() => setMacroSaved(false), 2500)
    }
    setMacroSaving(false)
  }

  async function handleLogout() {
    setLoggingOut(true)
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/')
  }

  if (loading) return <p className="text-gray-400 animate-pulse text-sm">Loading…</p>

  const isOwner = email === process.env.NEXT_PUBLIC_OWNER_EMAIL
  const isPro   = isOwner || subStatus === 'active' || subStatus === 'trialing'

  return (
    <div className="max-w-lg mx-auto">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Profile</h1>

      {/* Account card */}
      <div className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-2xl">
            {profile?.gender === 'female' ? '👩' : '👨'}
          </div>
          <div>
            <p className="font-semibold text-gray-900">{email}</p>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${isPro ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-500'}`}>
              {isPro ? '✨ Pro' : 'Free plan'}
            </span>
            {!isPro && (
              <Link
                href="/plan"
                className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-white px-3 py-1.5 rounded-lg w-fit"
                style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)' }}
              >
                ✨ Upgrade to Pro
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Stats card */}
      {profile && (profile.age || profile.weight_kg || profile.height_cm) ? (
        <div className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">Your stats</h2>
          <div className="grid grid-cols-2 gap-4">
            {profile.age && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Age</p>
                <p className="font-semibold text-gray-800">{profile.age} years</p>
              </div>
            )}
            {profile.gender && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Gender</p>
                <p className="font-semibold text-gray-800 capitalize">{profile.gender}</p>
              </div>
            )}
            {profile.weight_kg && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Weight</p>
                <p className="font-semibold text-gray-800">{profile.weight_kg} kg</p>
              </div>
            )}
            {profile.height_cm && (
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Height</p>
                <p className="font-semibold text-gray-800">{profile.height_cm} cm</p>
              </div>
            )}
            {profile.goal && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Goal</p>
                <p className="font-semibold text-gray-800">{goalLabels[profile.goal] ?? profile.goal}</p>
              </div>
            )}
            {profile.activity_level && (
              <div className="col-span-2">
                <p className="text-xs text-gray-400 mb-0.5">Activity level</p>
                <p className="font-semibold text-gray-800">{activityLabels[profile.activity_level] ?? profile.activity_level}</p>
              </div>
            )}
          </div>
          <Link
            href="/calculator"
            className="mt-5 block text-center text-sm text-green-600 hover:text-green-700 font-medium border border-green-200 rounded-xl py-2 hover:bg-green-50 transition-colors"
          >
            ✏️ Update in Calculator
          </Link>
        </div>
      ) : (
        <div className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 p-6 mb-4 text-center">
          <p className="text-gray-500 text-sm mb-3">You haven&apos;t set up your profile yet.</p>
          <Link href="/calculator" className="text-sm text-green-600 font-medium hover:underline">
            Go to Calculator →
          </Link>
        </div>
      )}

      {/* Custom macro targets — Pro only */}
      {isPro ? (
        <div className="bg-white/80 rounded-2xl shadow-sm border border-gray-100 p-6 mb-4">
          <div className="flex items-center gap-2 mb-1">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Custom Macro Targets</h2>
            <span className="text-xs bg-purple-100 text-purple-700 font-bold px-2 py-0.5 rounded-full">Pro</span>
          </div>
          <p className="text-xs text-gray-400 mb-4">Set your daily protein, carbs, and fat goals. These show as progress bars in your food log.</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            {[
              { key: 'protein', label: 'Protein (g)', color: 'focus:ring-purple-400' },
              { key: 'carbs',   label: 'Carbs (g)',   color: 'focus:ring-orange-400' },
              { key: 'fat',     label: 'Fat (g)',     color: 'focus:ring-pink-400'   },
            ].map(({ key, label, color }) => (
              <div key={key}>
                <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                <input
                  type="number"
                  min={0}
                  value={macroInputs[key as keyof typeof macroInputs]}
                  onChange={e => setMacroInputs(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder="—"
                  className={`w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 ${color}`}
                />
              </div>
            ))}
          </div>
          {macroError && <p className="text-xs text-red-500 mb-2">{macroError}</p>}
          <button
            onClick={handleSaveMacros}
            disabled={macroSaving}
            className="w-full py-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 transition-opacity"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)' }}
          >
            {macroSaved ? '✓ Saved!' : macroSaving ? 'Saving…' : 'Save targets'}
          </button>
        </div>
      ) : (
        <div className="bg-white/60 rounded-2xl border border-dashed border-gray-200 p-5 mb-4 text-center">
          <p className="text-sm text-gray-400 mb-2">🎯 Custom macro targets</p>
          <p className="text-xs text-gray-400 mb-3">Set your own protein, carbs & fat goals — a Pro feature.</p>
          <Link href="/plan" className="text-xs text-purple-600 font-semibold hover:underline">Upgrade to Pro →</Link>
        </div>
      )}

      {/* Actions */}
      <div className="space-y-3">
        <Link
          href="/"
          className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 bg-white/80 text-gray-700 font-medium text-sm hover:bg-white transition-colors"
        >
          🏠 Back to home page
        </Link>
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          className="w-full py-3 rounded-xl bg-red-50 border border-red-200 text-red-600 font-semibold text-sm hover:bg-red-100 transition-colors disabled:opacity-50"
        >
          {loggingOut ? 'Signing out…' : 'Sign out'}
        </button>
      </div>
    </div>
  )
}
