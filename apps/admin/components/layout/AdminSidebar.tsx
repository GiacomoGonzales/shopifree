'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  icon: string
}

const navigation: NavItem[] = [
  { name: 'Dashboard', href: '/', icon: '📊' },
  { name: 'Users', href: '/users', icon: '👥' },
  { name: 'Stores', href: '/stores', icon: '🏪' },
  { name: 'Analytics', href: '/analytics', icon: '📈' },
  { name: 'Content', href: '/content', icon: '📝' },
  { name: 'Support', href: '/support', icon: '🎫' },
  { name: 'Logs', href: '/logs', icon: '📜' },
  { name: 'Settings', href: '/settings', icon: '⚙️' },
]

export default function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700">
      {/* Logo */}
      <div className="flex items-center justify-center h-16 border-b border-slate-700">
        <h1 className="text-2xl font-bold text-emerald-500">
          Shopifree
          <span className="text-sm text-slate-400 ml-2">Admin</span>
        </h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors
                ${
                  isActive
                    ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                    : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                }
              `}
            >
              <span className="text-xl mr-3">{item.icon}</span>
              {item.name}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-slate-700 p-4">
        <p className="text-xs text-slate-500 text-center">
          © 2025 Shopifree
          <br />
          Admin Panel v1.0
        </p>
      </div>
    </div>
  )
}
