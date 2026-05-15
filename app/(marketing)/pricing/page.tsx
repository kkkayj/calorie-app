import Link from 'next/link'

const free = [
  'TDEE & BMR calculator',
  'Daily food log',
  'Calorie progress bar',
  'Breakfast, lunch, dinner & snacks',
]

const pro = [
  'Everything in Free',
  'AI-generated 7-day meal plan',
  'Personalised to your calorie goal',
  'Daily macro breakdown (protein, carbs, fat)',
  'Unlimited plan history',
]

export default function PricingPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-3">Simple pricing</h1>
        <p className="text-xl text-gray-500">Start free. Upgrade when you want the AI features.</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">

        {/* Free */}
        <div className="bg-white rounded-2xl border border-gray-200 p-8">
          <h2 className="text-xl font-bold text-gray-900 mb-1">Free</h2>
          <div className="text-4xl font-bold text-gray-900 mb-1">$0</div>
          <p className="text-sm text-gray-400 mb-7">Forever free · no card needed</p>
          <ul className="space-y-3 mb-8">
            {free.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-gray-600">
                <span className="text-green-500 font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="block w-full text-center border border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:border-gray-400 transition-colors"
          >
            Get started free
          </Link>
        </div>

        {/* Pro */}
        <div className="bg-green-600 rounded-2xl p-8 text-white">
          <h2 className="text-xl font-bold mb-1">Pro</h2>
          <div className="text-4xl font-bold mb-1">$9</div>
          <p className="text-sm text-green-200 mb-7">per month · cancel anytime</p>
          <ul className="space-y-3 mb-8">
            {pro.map(f => (
              <li key={f} className="flex items-center gap-3 text-sm text-green-50">
                <span className="font-bold">✓</span> {f}
              </li>
            ))}
          </ul>
          <Link
            href="/register"
            className="block w-full text-center bg-white text-green-700 py-3 rounded-xl font-semibold hover:bg-green-50 transition-colors"
          >
            Start free → upgrade inside
          </Link>
        </div>

      </div>

      <p className="text-center text-sm text-gray-400 mt-8">
        Questions? All plans include a free account. Upgrade or cancel any time from inside the app.
      </p>
    </div>
  )
}
