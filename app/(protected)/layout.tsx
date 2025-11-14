'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const token = localStorage.getItem('accessToken')
    const userData = localStorage.getItem('user')

    if (!token) {
      router.push('/login')
    } else if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('accessToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
    router.push('/login')
  }

  const navItems = [
    { href: '/entry', label: 'Entry', icon: '➕', roles: ['user', 'admin'] },
    { href: '/dashboard', label: 'Dashboard', icon: '📊', roles: ['user', 'admin'] },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆', roles: ['user', 'admin'] },
    { href: '/foto-management', label: 'Foto Management', icon: '📸', roles: ['admin'] },
  ]

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter((item) => {
    if (!user) return true
    return item.roles.includes(user.role)
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Sidebar */}
      <aside className="hidden md:fixed md:left-0 md:top-0 md:h-screen md:w-64 md:bg-white md:shadow-lg md:flex md:flex-col">
        <div className="p-6 border-b">
          <h1 className="text-2xl font-bold text-primary-600">Weight Entry</h1>
          <p className="text-sm text-gray-600">J&T Express</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                pathname === item.href
                  ? 'bg-primary-600 text-white'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t">
          {user && (
            <div className="mb-3">
              <p className="font-semibold text-gray-900">{user.username}</p>
              <p className="text-sm text-gray-600">{user.role}</p>
            </div>
          )}

          <Button
            variant="danger"
            size="sm"
            className="w-full"
            onClick={handleLogout}
          >
            🚪 Logout
          </Button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="md:ml-64">
        {children}
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg">
        <div className={`grid gap-1 p-2`} style={{ gridTemplateColumns: `repeat(${visibleNavItems.length + 1}, minmax(0, 1fr))` }}>
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-2 px-1 rounded-lg ${
                pathname === item.href
                  ? 'bg-primary-600 text-white'
                  : 'text-gray-700'
              }`}
            >
              <span className="text-xl mb-1">{item.icon}</span>
              <span className="text-xs font-semibold">{item.label}</span>
            </Link>
          ))}

          <button
            onClick={handleLogout}
            className="flex flex-col items-center py-2 px-1 rounded-lg text-gray-700 hover:bg-gray-100"
          >
            <span className="text-xl mb-1">🚪</span>
            <span className="text-xs font-semibold">Logout</span>
          </button>
        </div>
      </nav>

      {/* Add bottom padding for mobile nav */}
      <div className="md:hidden h-20"></div>
    </div>
  )
}
