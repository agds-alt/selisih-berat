'use client'

import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useEffect } from 'react'

interface NavItem {
  href: string
  label: string
  icon: string
  roles: string[]
}

interface MobileSidebarProps {
  isOpen: boolean
  onClose: () => void
  user: any
  navItems: NavItem[]
  onLogout: () => void
}

export function MobileSidebar({
  isOpen,
  onClose,
  user,
  navItems,
  onLogout,
}: MobileSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  // Close sidebar when route changes
  useEffect(() => {
    onClose()
  }, [pathname])

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Filter nav items based on user role
  const visibleNavItems = navItems.filter((item) => {
    if (!user) return true
    return item.roles.includes(user.role)
  })

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black transition-opacity duration-300 z-40 md:hidden ${
          isOpen ? 'opacity-50 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 h-full w-80 max-w-[85vw] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-in-out md:hidden flex flex-col ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="p-6 border-b bg-gradient-to-r from-primary-600 to-primary-700">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-xl font-bold text-white">Audit Selisih Berat</h1>
              <p className="text-sm text-primary-100">J&T Express</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* User Info */}
          {user && (
            <div className="mt-4 pt-4 border-t border-primary-500/30">
              <p className="font-semibold text-white">{user.full_name || user.username}</p>
              <p className="text-sm text-primary-100 capitalize">{user.role}</p>

              {/* Logout button in header for easy access */}
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-3 bg-white/10 hover:bg-white/20 text-white border-white/30 hover:border-white/50"
                onClick={() => {
                  onLogout()
                  onClose()
                }}
              >
                🚪 Logout
              </Button>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                pathname === item.href
                  ? 'bg-primary-600 text-white shadow-md'
                  : 'text-gray-700 hover:bg-gray-100 active:bg-gray-200'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="font-semibold">{item.label}</span>
            </Link>
          ))}
        </nav>
      </aside>
    </>
  )
}
