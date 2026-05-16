import Link from 'next/link'
import MobileNav from '@/components/mobile-nav'

const navLinks = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/tracker',    label: 'Food Log' },
  { href: '/workout',    label: 'Workout' },
  { href: '/plan',       label: 'Meal Plan ✨' },
  { href: '/profile',    label: 'Profile' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <nav className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/calculator" className="text-lg font-bold text-green-600">
            CalorieApp
          </Link>
          {/* Desktop nav — hidden on mobile */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map(link => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm text-gray-600 hover:text-green-600 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </nav>

      {/* pb-24 on mobile so content clears the bottom tab bar */}
      <main className="max-w-4xl mx-auto px-4 py-6 pb-24 md:py-8 md:pb-8">
        {children}
      </main>

      <MobileNav />
    </div>
  )
}
