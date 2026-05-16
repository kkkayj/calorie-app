'use client'

import { useState } from 'react'

const features = [
  { icon: '🤖', text: 'AI-generated 7-day meal plan' },
  { icon: '🎯', text: 'Personalised to your calorie goal' },
  { icon: '💪', text: 'Daily macros breakdown' },
  { icon: '♾️', text: 'Unlimited plan history' },
]

export default function UpgradeCTA({ showSuccess }: { showSuccess: boolean }) {
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  async function handleUpgrade() {
    setLoading(true)
    setError('')
    const res = await fetch('/api/stripe/checkout', { method: 'POST' })
    const { url, error } = await res.json()
    if (url) {
      window.location.href = url
    } else {
      setError(error ?? 'Something went wrong. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      {showSuccess && (
        <div className="mb-6 bg-green-50 border border-green-200 rounded-xl p-4 text-green-700 font-medium">
          🎉 Payment successful — you&apos;re now on Pro!
        </div>
      )}

      <h1 className="text-2xl font-bold text-gray-900 mb-1">AI Meal Plan</h1>
      <p className="text-gray-500 mb-6">
        Let AI build your perfect 7-day meal plan in seconds.
      </p>

      <div className="rounded-2xl overflow-hidden shadow-lg border border-purple-100">

        {/* Gradient header */}
        <div className="bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 p-8 text-center text-white">
          <div className="text-5xl mb-3">✨</div>
          <div className="inline-block bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 uppercase tracking-wide">
            Pro Plan
          </div>
          <div className="text-5xl font-extrabold">$9</div>
          <div className="text-purple-100 text-sm mt-1">per month · cancel anytime</div>
        </div>

        {/* Features */}
        <div className="bg-white p-6">
          <ul className="space-y-3 mb-6">
            {features.map(f => (
              <li key={f.text} className="flex items-center gap-3 text-sm text-gray-700">
                <span className="text-xl w-7 shrink-0">{f.icon}</span>
                {f.text}
              </li>
            ))}
          </ul>

          {error && <p className="text-sm text-red-600 mb-4">{error}</p>}

          <button
            onClick={handleUpgrade}
            disabled={loading}
            className="w-full py-3 rounded-xl font-bold text-lg text-white transition-opacity disabled:opacity-50"
            style={{ background: 'linear-gradient(135deg, #a855f7, #ec4899, #f97316)' }}
          >
            {loading ? 'Redirecting to checkout…' : '✨ Unlock Pro →'}
          </button>
          <p className="text-xs text-center text-gray-400 mt-3">
            Powered by Stripe · Secure checkout
          </p>
        </div>
      </div>
    </div>
  )
}
