'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Calculator, BookOpen, Dumbbell, Sparkles, User } from 'lucide-react'

const tabs = [
  { href: '/calculator', label: 'Calculator', Icon: Calculator },
  { href: '/tracker',    label: 'Food Log',   Icon: BookOpen   },
  { href: '/workout',    label: 'Workout',    Icon: Dumbbell   },
  { href: '/plan',       label: 'Plan',       Icon: Sparkles   },
  { href: '/profile',    label: 'Profile',    Icon: User       },
]

export default function MobileNav() {
  const pathname = usePathname()
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 flex md:hidden z-20 pb-safe">
      {tabs.map(({ href, label, Icon }) => {
        const active = pathname.startsWith(href)
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 transition-colors ${
              active ? 'text-green-600' : 'text-gray-400'
            }`}
          >
            <Icon className="w-5 h-5" strokeWidth={active ? 2.5 : 1.8} />
            <span className="text-[10px] font-medium">{label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
