import Link from 'next/link'

const navLinks = [
  { href: '/calculator', label: 'Calculator' },
  { href: '/tracker',    label: 'Food Log' },
  { href: '/plan',       label: 'Meal Plan ✨' },
  { href: '/profile',    label: 'Profile' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 flex items-center justify-between h-14">
          <Link href="/calculator" className="text-lg font-bold text-green-600">
            CalorieApp
          </Link>
          <div className="flex items-center gap-6">
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
      <main className="max-w-4xl mx-auto px-4 py-8">{children}</main>
    </div>
  )
}
