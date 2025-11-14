'use client'

import { useState, useEffect } from 'react'

export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    // Check initial status
    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Only show when offline
  if (isOnline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-600 text-white text-center py-2 text-xs font-medium z-[200] animate-pulse shadow-lg">
      <div className="flex items-center justify-center gap-2">
        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span>Tidak ada koneksi internet. Upload foto memerlukan internet.</span>
      </div>
    </div>
  )
}
