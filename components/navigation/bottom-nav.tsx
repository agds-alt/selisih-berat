'use client'

import { useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { ScannerModal } from '@/components/navigation/scanner-modal'

interface NavItem {
  href: string
  label: string
  icon: string
  adminOnly?: boolean
}

export function BottomNav({ userRole }: { userRole: string }) {
  const router = useRouter()
  const pathname = usePathname()
  const [showScanner, setShowScanner] = useState(false)

  const navItems: NavItem[] = [
    { href: '/dashboard', label: 'Dashboard', icon: '📊' },
    { href: '/leaderboard', label: 'Leaderboard', icon: '🏆' },
    // Center button is separate (SCAN)
    { href: '/foto-management', label: 'Photos', icon: '📸', adminOnly: true },
    { href: '/settings', label: 'Settings', icon: '⚙️', adminOnly: true },
  ]

  // Filter by role
  const visibleItems = navItems.filter(
    (item) => !item.adminOnly || userRole === 'admin'
  )

  // Split items for left and right of center button
  const leftItems = visibleItems.slice(0, 2)
  const rightItems = visibleItems.slice(2)

  const handleScanSuccess = (code: string) => {
    setShowScanner(false)
    // Navigate to entry page with pre-filled no_resi
    router.push(`/entry?no_resi=${encodeURIComponent(code)}`)
  }

  return (
    <>
      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg md:hidden z-50 safe-area-bottom">
        <div className="flex items-end justify-around h-20 px-2">
          {/* Left Items */}
          {leftItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                pathname === item.href
                  ? 'text-primary-600 scale-105'
                  : 'text-gray-600 hover:text-primary-500 active:scale-95'
              }`}
              aria-label={item.label}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}

          {/* CENTER SCANNER BUTTON - ELEVATED */}
          <div className="flex-1 flex justify-center">
            <button
              onClick={() => setShowScanner(true)}
              className="relative -top-6 w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-full hover:shadow-xl active:scale-95 transition-all flex items-center justify-center group elevated-button"
              aria-label="Scan Barcode"
              style={{ minHeight: '64px', minWidth: '64px' }}
            >
              {/* Pulse animation ring */}
              <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-25"></span>

              {/* Scanner Icon */}
              <svg
                className="w-8 h-8 text-white relative z-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>

              {/* Label below button */}
              <span className="absolute -bottom-6 text-xs font-bold text-red-600 whitespace-nowrap">
                SCAN
              </span>
            </button>
          </div>

          {/* Right Items */}
          {rightItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition-all duration-200 ${
                pathname === item.href
                  ? 'text-primary-600 scale-105'
                  : 'text-gray-600 hover:text-primary-500 active:scale-95'
              }`}
              aria-label={item.label}
            >
              <span className="text-2xl mb-1">{item.icon}</span>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </nav>

      {/* Scanner Modal */}
      <ScannerModal
        isOpen={showScanner}
        onClose={() => setShowScanner(false)}
        onScanSuccess={handleScanSuccess}
      />
    </>
  )
}
